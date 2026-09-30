import 'reflect-metadata';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { AppModule } from './app.module';

type Origen = true | string[];

/** El CORS de Socket.IO se configura aquí porque depende de variables de entorno. */
class CorsIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly origen: Origen,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    return super.createIOServer(port, {
      ...options,
      cors: { origin: this.origen },
    });
  }
}

function parsearOrigenes(valor?: string): Origen {
  if (!valor || valor.trim() === '*') return true;
  return valor.split(',').map((o) => o.trim()).filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const origen = parsearOrigenes(config.get<string>('CORS_ORIGIN'));
  app.enableCors({ origin: origen });
  app.useWebSocketAdapter(new CorsIoAdapter(app, origen));
  app.enableShutdownHooks();

  const port = Number(config.get('PORT') ?? 3001);
  await app.listen(port, '0.0.0.0');
  new Logger('Bootstrap').log(`AirCare backend escuchando en :${port}`);
}

bootstrap();
