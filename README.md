# 실시간 코딩 배틀 플랫폼 — BE
TC 폭탄으로 시간복잡도를 체감하는 1:1 대결형 알고리즘 학습 플랫폼 — 종합설계

- 화면: https://github.com/Senior-Project-2026-09/FE
- 로컬 실행: [docs/SETUP.md](docs/SETUP.md)

```
apps/game-server     NestJS + Socket.IO (3000)
apps/judge-worker    BullMQ 채점 워커 (빈 워커)
packages/shared      앱끼리 공유할 타입 · 설정값 (@battle/shared)
problems/            문제 패키지 (Kattis 형식)
infra/               docker-compose.yml (PostgreSQL · Redis · MinIO)
docs/                SETUP · rules · events · decisions
```
