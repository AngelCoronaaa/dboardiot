import { Controller, Get } from '@nestjs/common';
import { MqttService } from './mqtt.service';

@Controller('health')
export class HealthController {
  constructor(private readonly mqtt: MqttService) {}

  @Get()
  health() {
    return { ok: true, broker: this.mqtt.estaConectado };
  }
}
