# 결정 기록

결정되면 날짜 · 결과 · 이유를 아래 표에 남긴다.

## 아직 정하지 않은 것

| 항목 | 결정 시점 |
| --- | --- |
| 지원 언어 (C++ · Python · JS 3개 vs C++ · Python 2개) | 다음 팀 회의 |
| 채점 격리 (isolate vs Judge0) | M1 기술 검증 후 |
| 공격 구성 A안 / B안 | 다음 팀 회의 |
| ORM (Prisma 추천) · DB 마이그레이션 | ERD 확정 후 |
| 배포 환경 | M6 전 |
| 저장소 이름 · 주제명 (`code-battle` 임시) | 제안서 확정 시 |
| 화면(FE)이 `@battle/shared` 타입을 쓰는 방법 (복사 · git 의존성 · 저장소 합치기) | 이벤트 타입을 화면에서 쓰기 시작할 때 |

## 결정한 것

| 날짜 | 항목 | 결과 | 이유 |
| --- | --- | --- | --- |
| 2026-10-27 | 저장소 구조 | 조직에 이미 있던 `BE`(pnpm 모노레포: game-server · judge-worker · shared · infra · problems · docs)와 `FE`(화면) 2개로 나눔 | 조직 저장소에 맞춤. 세팅 문서의 기본값은 모노레포 1개(`code-battle`) |
| 2026-10-27 | 로컬 MinIO 이미지 | `cgr.dev/chainguard/minio:latest` | `minio/minio`가 Docker Hub에서 내려가 받을 수 없음. 같은 MinIO 서버를 Chainguard가 빌드한 이미지 |
| 2026-10-27 | pnpm | 9.15.9 | 세팅 문서 예시(9.15.0)와 같은 9.x의 마지막 패치. 최신 12.x는 Windows에서 실행 파일이 뜨지 않음 |
| 2026-10-27 | TypeScript (shared · judge-worker) | 5.9.3 | 최신 7.x는 `tsconfig.base.json`의 `moduleResolution: Node`를 지원하지 않음. game-server와 화면은 각 템플릿 기본(6.x) |
