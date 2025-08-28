# 007-posthog-self-hosting-setup.md

## 태스크: PostHog 자체 호스팅 및 Caret 통합

**목표**
1. `posthog.caret.team` 도메인 아래에 프로덕션 급 PostHog 스택을 구축한다.
2. 커뮤니티/디버그 빌드에서는 텔레메트리를 비활성화하고, 릴리즈(Enterprise) 빌드에서만 연결 값을 주입한다.
3. 모든 엔지니어가 로컬이나 스테이징 환경에서 동일한 과정을 재현할 수 있도록 절차를 문서화한다.

---

### 1. 아키텍처 결정
| 항목 | 선택 |
|------|------|
| 호스팅 | 전용 VM 한 대에서 Docker Compose 실행 (RAM 4 GB+, SSD 20 GB+) |
| 도메인 | `posthog.caret.team` (A 혹은 CNAME → VM) |
| TLS | Traefik + Let's Encrypt 자동 인증서 |
| 인증 | PostHog 기본(이메일+비밀번호) |
| 데이터 | 내부 Postgres + Redis (Compose 기본 값) |
| 백업 | 매일 `pg_dump` 결과를 S3로 업로드 |

> **참고**: 본 문서는 **단일 노드** 구성을 전제로 한다. 고가용성(HA)이 필요하다면 PostHog 공식 K8s 가이드를 참고할 것.

---

### 2. VM 프로비저닝
```bash
# 예시: Azure CLI / Terraform 등
az vm create \
  --resource-group caret-prod \
  --name posthog-prod \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --public-ip-sku Standard \
  --admin-username devops
# 80, 443 포트만 허용
```

SSH 접속 후 초기 세팅:
```bash
ssh devops@<VM_IP>
sudo apt update && sudo apt install -y docker.io docker-compose certbot
```

---

### 3. 스택 배포
`/opt/posthog/docker-compose.yml`
```yaml
version: "3"
services:
  posthog:
    image: posthog/posthog:latest
    environment:
      - DATABASE_URL=postgres://posthog:pass@postgres/posthog
      - PGHOST=postgres
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY=$(openssl rand -hex 32)
      - SITE_URL=https://posthog.caret.team
    depends_on:
      - postgres
      - redis
    restart: always
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=posthog
      - POSTGRES_PASSWORD=pass
    volumes:
      - ./pgdata:/var/lib/postgresql/data
    restart: always
  redis:
    image: redis:7-alpine
    restart: always
  traefik:
    image: traefik:v3.0
    command:
      - --providers.docker=true
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.le.acme.tlschallenge=true
      - --certificatesresolvers.le.acme.email=ops@caret.team
      - --certificatesresolvers.le.acme.storage=/letsencrypt/acme.json
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
```

Traefik 라벨( `posthog` 서비스에 부착 ):
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.posthog.rule=Host(`posthog.caret.team`)"
  - "traefik.http.routers.posthog.entrypoints=websecure"
  - "traefik.http.routers.posthog.tls.certresolver=le"
```

실행:
```bash
sudo docker compose pull
sudo docker compose up -d
```
브라우저에서 https://posthog.caret.team 열기 → 첫 사용자 생성 후 **Project API Key** 확보.

---

### 4. Caret 릴리즈 빌드에 변수 주입
CI(예: Azure Pipelines) 릴리즈 잡에서만 환경 변수를 설정한다:
```yaml
variables:
  BUILD_FLAVOR: "enterprise"
  POSTHOG_API_KEY: $(posthogApiKey)   # 시크릿 변수
  POSTHOG_HOST: "https://posthog.caret.team"
  POSTHOG_UIHOST: "https://posthog.caret.team"
```

`PostHogClientProvider` 는 `POSTHOG_API_KEY` 와 `POSTHOG_HOST` 가 둘 다 존재할 때만 실제 클라이언트를 활성화한다. Community/Dev 빌드는 빈 값 → 더미 클라이언트.

---

### 5. 로컬 개발 테스트
```bash
# 기본(텔레메트리 OFF)
npm run watch

# 스테이징 PostHog 연결 테스트
POSTHOG_API_KEY=phc_test POSTHOG_HOST=http://localhost:8000 npm run watch
```

---

### 6. QA 체크리스트
- [ ] `posthog.caret.team` DNS & TLS 정상
- [ ] PostHog UI 접근/로그인 가능
- [ ] 릴리즈 빌드에서 이벤트가 *Live Events*에 표시됨
- [ ] Settings 토글 Off → `client.optOut()` 호출 후 이벤트 중지 확인
- [ ] Community 빌드에서 이벤트 없음

---

### 7. 향후 개선 사항
1. 메인 도메인 `/ingest` 경로 뒤로 프록시해 서브도메인 제거
2. 내부 사용자용 SAML SSO 연동
3. `pg_dump` 야간 백업을 S3로 자동 전송 