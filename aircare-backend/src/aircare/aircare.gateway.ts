import { createHash, timingSafeEqual } from 'node:crypto';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Subscription } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { MqttService } from './mqtt.service';
import { COMANDOS, TipoComando } from './topicos';

export interface RespuestaComando {
  ok: boolean;
  error?: string;
}

function tokensIguales(a: string, b: string): boolean {
  // Se comparan hashes para que la comparación sea de longitud fija.
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

@WebSocketGateway({ path: '/api/socket.io' })
export class AirCareGateway
  implements OnGatewayInit, OnGatewayConnection, OnModuleDestroy
{
  private readonly logger = new Logger(AirCareGateway.name);
  private readonly suscripciones: Subscription[] = [];

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly mqtt: MqttService,
    private readonly config: ConfigService,
  ) {}

  afterInit(server: Server): void {
    const esperado = this.config.getOrThrow<string>('DASHBOARD_TOKEN');

    server.use((socket, next) => {
      const { auth, query } = socket.handshake;
      const recibido = auth?.token ?? query?.token;
      if (typeof recibido === 'string' && tokensIguales(recibido, esperado)) {
        return next();
      }
      this.logger.warn(`Conexión rechazada (token inválido) desde ${socket.handshake.address}`);
      next(new Error('unauthorized'));
    });

    this.suscripciones.push(
      this.mqtt.mensajes$.subscribe(({ evento, payload }) =>
        this.server.emit(evento, payload),
      ),
      this.mqtt.conectado$.subscribe((conectado) =>
        this.server.emit('broker', conectado),
      ),
    );
  }

  handleConnection(client: Socket): void {
    // Estado actual inmediato para el cliente nuevo, sin esperar al siguiente mensaje.
    client.emit('broker', this.mqtt.estaConectado);
    for (const { evento, payload } of this.mqtt.ultimosMensajes()) {
      client.emit(evento, payload);
    }
  }

  onModuleDestroy(): void {
    this.suscripciones.forEach((s) => s.unsubscribe());
  }

  @SubscribeMessage('cmd:modo')
  modo(@MessageBody() valor: unknown): Promise<RespuestaComando> {
    return this.comando('modo', valor);
  }

  @SubscribeMessage('cmd:alarma')
  alarma(@MessageBody() valor: unknown): Promise<RespuestaComando> {
    return this.comando('alarma', valor);
  }

  @SubscribeMessage('cmd:ventilador')
  ventilador(@MessageBody() valor: unknown): Promise<RespuestaComando> {
    return this.comando('ventilador', valor);
  }

  private async comando(tipo: TipoComando, valor: unknown): Promise<RespuestaComando> {
    const permitidos: readonly string[] = COMANDOS[tipo].valores;
    if (typeof valor !== 'string' || !permitidos.includes(valor)) {
      return { ok: false, error: `Valor inválido para ${tipo}: ${JSON.stringify(valor)}` };
    }
    try {
      await this.mqtt.publicarComando(tipo, valor);
      return { ok: true };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      this.logger.error(`No se pudo publicar ${tipo}=${valor}: ${error}`);
      return { ok: false, error };
    }
  }
}
