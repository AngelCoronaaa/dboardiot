import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AirCareGateway } from './aircare/aircare.gateway';
import { HealthController } from './aircare/health.controller';
import { MqttService } from './aircare/mqtt.service';

const REQUERIDAS = ['MQTT_URL', 'DASHBOARD_TOKEN'];

function validar(env: Record<string, unknown>) {
  const faltantes = REQUERIDAS.filter((k) => !env[k]);
  if (faltantes.length) {
    throw new Error(`Faltan variables de entorno: ${faltantes.join(', ')}`);
  }
  return env;
}

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate: validar })],
  controllers: [HealthController],
  providers: [MqttService, AirCareGateway],
})
export class AppModule {}
