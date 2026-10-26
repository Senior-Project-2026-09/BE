import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { PingGateway } from './ping.gateway.js';

@Module({
  controllers: [HealthController],
  providers: [PingGateway],
})
export class HealthModule {}
