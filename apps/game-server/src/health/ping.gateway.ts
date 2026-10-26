import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

// 연결 확인용. 실제 이벤트는 room · match 모듈에서 만든다.
@WebSocketGateway({ cors: { origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173' } })
export class PingGateway {
  @SubscribeMessage('ping')
  ping() {
    return { event: 'pong', data: Date.now() };
  }
}
