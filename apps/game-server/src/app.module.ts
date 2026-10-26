import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { HealthModule } from './health/health.module.js';
import { RoomModule } from './room/room.module.js';
import { MatchModule } from './match/match.module.js';
import { AttackModule } from './attack/attack.module.js';
import { JudgeModule } from './judge/judge.module.js';

@Module({
  imports: [
    // .env는 저장소 루트에 하나만 둔다
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    HealthModule,
    RoomModule,
    MatchModule,
    AttackModule,
    JudgeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
