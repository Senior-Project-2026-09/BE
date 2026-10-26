import 'dotenv/config';
import { Worker } from 'bullmq';

const connection = { host: process.env.REDIS_HOST ?? 'localhost', port: Number(process.env.REDIS_PORT ?? 6379) };

// TODO: 채점 로직(금지 문법 검사 → 컴파일 → 격리 실행 → 출력 비교)은 이후 단계에서 구현
const worker = new Worker('judge', async () => ({ todo: true }), { connection, concurrency: 1 });

worker.on('ready', () => console.log('[judge-worker] Redis 연결됨, 대기 중'));
worker.on('error', (err) => console.error('[judge-worker] error', err));
