# 실시간 코딩 배틀 플랫폼 — 초기 세팅 인수인계

> 종합설계(졸업작품) 4인 팀 · 작성 2026-10-27 · 기준 문서: 기획안 v3.4, 피드백 조사결과 보고서, 제안서 초안
> GitHub 조직: `Senior-Project-2026-09` · 저장소: [BE](https://github.com/Senior-Project-2026-09/BE) · [FE](https://github.com/Senior-Project-2026-09/FE)

처음 세팅 문서는 모노레포 1개(`code-battle`)를 새로 만드는 계획이었지만, **조직에 이미 있던 `BE` · `FE` 저장소 2개**에 맞춰 세팅했다. 뼈대는 두 저장소에 이미 들어 있다. 새로 합류하거나 새 PC에서 받는 사람은 **3장 → 4장 → 10장** 순서로 따라 하면 된다.

---

## 0. 작업 규칙

- 지금은 **초기 세팅만** 되어 있다. 방 · 경기 진행, 공격 계산, 채점 로직, 코드 실행기, 시간 제한 계산, DB 스키마, 로그인, 화면 디자인, 실시간 이벤트 처리는 없다. 폴더 · 빈 파일 · `TODO` 주석까지만 있다.
- **비밀값은 커밋하지 않는다.** `.env`에만 두고(`.gitignore`에 있음) 저장소에는 `.env.example`만 올린다.
- 15장 "아직 정하지 않은 것"은 임의로 정하지 않는다. 정하면 `docs/decisions.md`에 기록한다.
- 주석과 문서는 한국어, 코드 식별자는 영어로 쓴다.

---

## 1. 프로젝트 한눈에

| 항목 | 내용 |
| --- | --- |
| 서비스 | 1:1 실시간 대결형 알고리즘 학습 플랫폼 |
| 핵심 흐름 | 방 입장 → 15분 · 5문제 동시 풀이 → 정답 시 상대에게 공격(TC 폭탄 등) → 45초 안에 상쇄 · 반격 → 결과 · 학습 리포트 |
| 화면 (`FE`) | React + TypeScript (Vite), Monaco Editor |
| 게임 서버 (`BE/apps/game-server`) | NestJS + Socket.IO |
| 채점 (`BE/apps/judge-worker`) | 별도 채점 워커 (BullMQ 소비자), 격리는 isolate 또는 Judge0 (미정) |
| 상태 · 대기열 | Redis, BullMQ |
| DB · 파일 | PostgreSQL, S3 호환 저장소 (로컬은 MinIO) |
| 문제 형식 | Kattis 문제 패키지 형식 (`BE/problems/`) |

### 담당

| 역할 | 이름 | 세팅에서 맡은 것 |
| --- | --- | --- |
| A. PM · 풀스택 (팀장) | [이름] | 저장소, Git 규칙 · CI, 문서 자리 |
| B. 대결 서버 | [이름] | game-server, 공유 패키지 |
| C. 채점 · 인프라 | [이름] | Docker 인프라, judge-worker |
| D. 프론트엔드 · 문제 | [이름] | FE 화면, `problems/` 정리 |

---

## 2. 확정 사항과 기본값

| 항목 | 값 | 상태 |
| --- | --- | --- |
| 언어 | TypeScript (화면 · 게임 서버 · 채점 워커 통일) | 확정 |
| 화면 / 게임 서버 | React (Vite) / NestJS 12 + Socket.IO | 확정 |
| 대기열 / 상태 | BullMQ 6 (+ ioredis) / Redis 7 | 확정 |
| DB | PostgreSQL 17 (로컬 Docker) | 기본값 |
| 파일 저장 | MinIO (로컬 Docker, 이미지 `cgr.dev/chainguard/minio`) | 기본값 |
| Node.js | 22 LTS 이상 (CI는 22) | 기본값 |
| 패키지 매니저 | pnpm 9.15.9 (corepack) | 기본값 — 팀 확인 |
| 저장소 구조 | **`BE`(pnpm 모노레포) + `FE`(화면) 2개** | 조직 저장소에 맞춤 — 팀 확인 |
| TypeScript | shared · judge-worker 5.9, game-server · FE 6.x (각 템플릿 기본) | 기본값 |
| ORM | 설치하지 않음 (ERD 확정 후) | 미정 |

기본값을 바꾸면 이 표와 `docs/decisions.md`를 먼저 고치고 커밋한다.

| 서비스 | 포트 |
| --- | --- |
| web (Vite) | 5173 |
| game-server (NestJS) | 3000 |
| PostgreSQL / Redis | 5432 / 6379 |
| MinIO API / 콘솔 | 9000 / 9001 |

---

## 3. 사전 준비 (각자 PC)

```bash
node -v                    # v22 이상
corepack enable            # pnpm 활성화 (아래 Windows 참고)
pnpm -v                    # 9.15.9 (저장소의 packageManager가 자동 적용)
git --version
docker --version
docker compose version
```

**Windows에서 `corepack enable`이 `EPERM`으로 실패하면** (Node가 `C:\Program Files`에 설치된 경우) 관리자 권한 없이 사용자 폴더에 설치한다:

```bash
corepack enable --install-directory "$APPDATA/npm"     # Git Bash 기준. 이 폴더는 보통 PATH에 있음
corepack install -g pnpm@9.15.9
```

**완료 기준**: 위 명령이 모두 버전을 출력하고, Docker Desktop이 실행 중이다(`docker ps`가 에러 없이 나옴).
(Windows는 WSL2 안에서 작업하는 것을 권장한다. 나중에 쓸 채점 격리 도구 isolate가 리눅스 전용이다.)

---

## 4. 저장소 받기

```bash
mkdir Senior-Project-2026-09 && cd Senior-Project-2026-09
git clone https://github.com/Senior-Project-2026-09/BE.git
git clone https://github.com/Senior-Project-2026-09/FE.git
```

### BE 구조

```
BE/
├── apps/
│   ├── game-server/     NestJS (health, 빈 모듈 room · match · attack · judge, ping 게이트웨이)
│   └── judge-worker/    Redis에 붙어 'judge' 대기열을 기다리는 빈 워커
├── packages/
│   └── shared/          @battle/shared — rules.ts · events.ts · judge.ts 자리
├── problems/            문제 패키지 (Kattis 형식)
├── infra/               docker-compose.yml
├── docs/                SETUP.md, rules.md, events.md, decisions.md
├── .github/             CI, PR · 이슈 템플릿
├── package.json         루트 스크립트 (dev · build · lint · test · infra:up · infra:down)
├── pnpm-workspace.yaml  apps/* · packages/*
└── tsconfig.base.json   shared · judge-worker가 상속
```

### FE 구조

```
FE/src
├── api/socket.ts        socket.io-client 인스턴스
├── pages/               LobbyPage (연결 확인 두 줄) · BattlePage (Monaco) · ResultPage
├── components/          비워 둠
├── App.tsx              / → Lobby, /battle/:roomCode → Battle, /result/:matchId → Result
└── main.tsx
```

---

## 5. 로컬 인프라 (BE)

```bash
cd BE
cp .env.example .env              # DB_PASSWORD, MINIO_PASSWORD 수정 (MinIO 비밀번호는 8자 이상)
pnpm install
pnpm infra:up
docker compose -f infra/docker-compose.yml ps
docker exec code-battle-redis-1 redis-cli ping     # PONG
```

> `minio/minio` 이미지는 MinIO 측이 Docker Hub 배포를 중단해 받을 수 없다(`pull access denied`). 같은 MinIO 서버를 Chainguard가 빌드한 `cgr.dev/chainguard/minio:latest`를 쓴다.

**완료 기준**: 세 컨테이너가 `running`이고, Redis가 `PONG`을 돌려주고, http://localhost:9001 에서 MinIO 콘솔이 열린다(`.env`의 MINIO_USER / MINIO_PASSWORD로 로그인).

---

## 6. 공유 패키지 (BE `packages/shared`)

앱끼리 공유할 타입 · 설정값을 넣을 **빈 패키지**. 지금은 `export {}`와 TODO 주석만 있다.

| 파일 | 나중에 들어갈 것 |
| --- | --- |
| `src/rules.ts` | 대결 규칙 수치(15분, 포인트, 최대 3점, 45초 등). 코드에 직접 쓰지 않고 여기 모은다 |
| `src/events.ts` | Socket.IO 이벤트 타입 (`docs/events.md`와 일치) |
| `src/judge.ts` | 채점 작업 · 결과 타입 |

```bash
pnpm --filter @battle/shared build      # packages/shared/dist/index.js 생성
```

---

## 7. 게임 서버 (BE `apps/game-server`)

Nest CLI 12로 만들었다. 템플릿 기본값인 ESM(`"type": "module"`, import 경로에 `.js`), vitest, oxlint를 그대로 쓴다.

| 모듈 | 나중에 들어갈 것 (지금은 주석만) |
| --- | --- |
| room | 방 만들기 · 입장 · 준비 |
| match | 경기 진행 · 타이머 · 사건 순서(seq) |
| attack | 포인트 · 상쇄 · 반격 · 적용 |
| judge | 채점 대기열에 작업 넣기 · 결과 받기 |

- `GET /health` → `{"status":"UP","time":...}`
- `PingGateway`: 소켓 `ping`을 받으면 `pong` **이벤트**로 답한다. (`{ event, data }`를 돌려주면 Nest는 ack가 아니라 그 이름의 이벤트로 보낸다.)
- 포트 `GAME_SERVER_PORT`(기본 3000)와 CORS `WEB_ORIGIN`은 루트 `.env`에서 읽는다(`ConfigModule.forRoot({ envFilePath: '../../.env' })`).

---

## 8. 채점 워커 (BE `apps/judge-worker`)

코드 실행 · 채점은 없다. Redis에 붙어 `judge` 대기열을 기다리는 빈 워커.

- BullMQ 6부터 `ioredis`가 선택 의존성이라 따로 설치되어 있다.
- `pnpm dev` = `cross-env DOTENV_CONFIG_PATH=../../.env tsx watch src/index.ts` (루트 `.env`를 읽음)
- `src/runners/`, `src/languages.ts`: TODO 주석만 (격리 방식 · 지원 언어 결정 후)

---

## 9. 화면 (FE)

```bash
cd FE
pnpm install
pnpm dev          # http://localhost:5173
```

`vite.config.ts`가 `/health`, `/socket.io`를 game-server(3000)로 프록시한다. Monaco 편집기는 기본 설정상 실행할 때 CDN(jsdelivr)에서 내려받는다.

### 문제 폴더 (BE `problems/`)

팀장이 공유한 `two-sum-count_문제패키지.zip`을 `BE/problems/`에 푼다. 내용은 고치지 않는다.

```bash
unzip two-sum-count_문제패키지.zip -d problems/
```

---

## 10. 전체 실행 확인 (전원)

```bash
# 터미널 1 — BE
pnpm infra:up
pnpm --filter @battle/shared build
pnpm dev          # game-server · judge-worker 동시 실행

# 터미널 2 — FE
pnpm dev
```

**완료 기준**
- http://localhost:3000/health → `UP`
- 워커 로그에 `[judge-worker] Redis 연결됨, 대기 중`
- http://localhost:5173 에 `UP`, `pong` 표시, http://localhost:5173/battle/test 에서 Monaco 편집기가 뜬다

---

## 11. Git 협업 규칙과 CI (두 저장소 공통)

### 브랜치

```
main      발표 · 제출용. develop에서만 합친다.
develop   통합 브랜치. 모든 기능 PR의 대상.
feat/#<이슈번호>-<짧은설명>   예) feat/#12-room-join
fix/#<이슈번호>-<짧은설명>
```

이슈 번호는 저장소마다 따로 매겨진다. 서버 · 채점 · 문제 · 인프라는 `BE`, 화면은 `FE`에 이슈를 연다.

### 커밋 메시지

```
<type>(<범위>): <한 줄 요약>    type = feat | fix | docs | refactor | test | chore | style
범위 = web | server | judge | shared | problems | infra | docs
예) chore(infra): docker-compose 추가
```

### PR 규칙

- 대상 브랜치 `develop`, 리뷰어 1명 승인 후 머지.
- PR 제목은 커밋 규칙과 같게, 본문에 이슈 번호(`Closes #12`).
- 템플릿: `.github/pull_request_template.md`, `.github/ISSUE_TEMPLATE/feature.md`

### CI (`.github/workflows/ci.yml`)

- BE: `pnpm install --frozen-lockfile` → `pnpm --filter @battle/shared build` → `pnpm lint` → `pnpm build`
- FE: `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm build`

GitHub 라벨: `feature`, `bug`, `docs`, `web`, `server`, `judge`, `problem`, `priority-1`, `priority-2`.
GitHub 설정에서 `main`, `develop` 브랜치 보호(직접 push 금지, PR 리뷰 1명 필수, CI 통과 필수)를 켠다.

**완료 기준**: 테스트 이슈 1개 → 브랜치 → PR → CI 통과 → 리뷰 → `develop` 머지가 한 번 성공한다.

---

## 12. 문서 자리 (BE `docs/`)

| 파일 | 나중에 채울 내용 |
| --- | --- |
| `docs/rules.md` | 대결 규칙 (보고서 4장) |
| `docs/events.md` | 실시간 이벤트 표 (이름 · 보내는 쪽 · 내용) |
| `docs/decisions.md` | "아직 정하지 않은 것"의 결정 기록 (세팅 중 정한 것도 여기 있음) |

---

## 13. 초기 세팅 완료 체크리스트

- [x] `BE` · `FE` 저장소 로컬 구성, `main` 브랜치에 세팅 커밋
- [ ] `develop` 브랜치 push, 브랜치 보호
- [x] 루트 설정: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.gitignore`, `.editorconfig`, `.prettierrc`, `README.md`, `docs/SETUP.md`
- [x] `pnpm infra:up` → PostgreSQL · Redis · MinIO 실행
- [x] `packages/shared` 빈 패키지 빌드
- [x] `apps/game-server`: `/health`, 빈 모듈 4개, ping 게이트웨이
- [x] `apps/judge-worker`: Redis 연결되는 빈 워커
- [x] `FE`: 빈 페이지 3개, Monaco 설치 확인, `/health` · `pong` 표시
- [ ] `problems/two-sum-count` 압축 풀기 (zip 공유 필요)
- [x] PR · 이슈 템플릿, CI 파일
- [ ] 라벨, 테스트 PR 1회
- [x] `docs/rules.md`, `docs/events.md`, `docs/decisions.md` 자리

---

## 14. 다음 할 일 (세팅 이후)

| 시기 | 할 일 |
| --- | --- |
| M1 | 기술 검증 4가지: isolate 격리 실행 · 악성 코드 차단, 규칙 모의 경기, 동시 제출 결과 일치, 폭탄 공정성 검사 |
| M1~M2 | 규칙 수치(`rules.ts`) · 이벤트 명세(`events.md`) 확정, 공격 엔진, 방 · 경기 진행 |
| M2~M3 | 채점 워커 실행기 · 대기열, 시간 제한 자동 계산, 문제 10개 |
| M4 | 중간 데모 |
| M6 | 1차 완성본 |

---

## 15. 아직 정하지 않은 것

`docs/decisions.md`에서 관리한다. 지원 언어, 채점 격리(isolate vs Judge0), 공격 구성 A안 / B안, ORM · 마이그레이션, 배포 환경, 저장소 이름 · 주제명, FE가 공유 타입을 쓰는 방법.
