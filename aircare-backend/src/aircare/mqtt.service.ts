import { randomBytes } from 'node:crypto';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, MqttClient } from 'mqtt';
import { BehaviorSubject, distinctUntilChanged, Observable, Subject } from 'rxjs';
import {
  COMANDOS,
  TipoComando,
  TOPICO_COMANDOS_WILDCARD,
  TOPICOS_TELEMETRIA,
  tipoComandoDeTopico,
} from './topicos';

export interface MensajeSaliente {
  evento: string;
  payload: unknown;
}

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client?: MqttClient;

  private readonly mensajes = new Subject<MensajeSaliente>();
  private readonly conectado = new BehaviorSubject<boolean>(false);
  /** Último mensaje por tópico, para entregarlo a clientes recién conectados. */
  private readonly ultimos = new Map<string, MensajeSaliente>();

  readonly mensajes$: Observable<MensajeSaliente> = this.mensajes.asObservable();
  readonly conectado$: Observable<boolean> = this.conectado.pipe(
    distinctUntilChanged(),
  );

  constructor(private readonly config: ConfigService) {}

  get estaConectado(): boolean {
    return this.conectado.value;
  }

  ultimosMensajes(): MensajeSaliente[] {
    return [...this.ultimos.values()];
  }

  onModuleInit(): void {
    const url = this.config.getOrThrow<string>('MQTT_URL');
    const clientId = `aircare-backend-${randomBytes(4).toString('hex')}`;

    this.logger.log(`Conectando a ${url} como ${clientId}...`);
    this.client = connect(url, {
      clientId,
      username: this.config.get<string>('MQTT_USER') || undefined,
      password: this.config.get<string>('MQTT_PASS') || undefined,
      reconnectPeriod: 5000,
      connectTimeout: 10_000,
      clean: true,
    });

    this.client.on('connect', () => {
      this.logger.log('Conectado a Mosquitto');
      this.conectado.next(true);
      const topicos = [...Object.keys(TOPICOS_TELEMETRIA), TOPICO_COMANDOS_WILDCARD];
      this.client!.subscribe(topicos, { qos: 1 }, (err) => {
        if (err) this.logger.error(`Error al suscribirse: ${err.message}`);
        else this.logger.log(`Suscrito a: ${topicos.join(', ')}`);
      });
    });
    this.client.on('close', () => this.conectado.next(false));
    this.client.on('offline', () => this.logger.warn('Sin conexión con Mosquitto'));
    this.client.on('error', (err) => this.logger.error(`MQTT: ${err.message}`));
    this.client.on('message', (topico, payload) => this.procesar(topico, payload));
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.endAsync();
  }

  async publicarComando(tipo: TipoComando, valor: string): Promise<void> {
    if (!this.client?.connected) {
      throw new Error('El backend no está conectado al broker MQTT');
    }
    await this.client.publishAsync(COMANDOS[tipo].topico, valor, {
      qos: 1,
      retain: true,
    });
    this.logger.log(`Publicado ${COMANDOS[tipo].topico} = ${valor}`);
  }

  private procesar(topico: string, buffer: Buffer): void {
    const texto = buffer.toString('utf8').trim();
    let mensaje: MensajeSaliente | undefined;

    const evento = TOPICOS_TELEMETRIA[topico];
    if (evento === 'estado') {
      mensaje = { evento, payload: texto };
    } else if (evento) {
      try {
        mensaje = { evento, payload: JSON.parse(texto) };
      } catch {
        this.logger.warn(`JSON inválido en ${topico}: ${texto.slice(0, 200)}`);
        return;
      }
    } else {
      const tipo = tipoComandoDeTopico(topico);
      // Un mensaje retenido vacío significa que se borró el retain; se ignora.
      if (tipo && texto) mensaje = { evento: 'comando', payload: { tipo, valor: texto } };
    }

    if (!mensaje) return;
    this.ultimos.set(topico, mensaje);
    this.mensajes.next(mensaje);
  }
}
