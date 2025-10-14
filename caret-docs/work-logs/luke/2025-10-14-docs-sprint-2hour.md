# docs.caret.team 2시간 스프린트 계획

**작성일**: 2025-10-14
**목표**: 한글 마스터 문서 작성 → 로컬 서버 확인 → 끝!


**피드백**
1. http://localhost:3000/ko/getting-started/what-is-caret
 - 페르소나 설명과 이미지 추가 caret의 README.md 수준으로 
 - 커스터마이징 방법 상세 설명 링크 추가 : http://localhost:3000/{lang}/caret-exclusive/persona-system 

 2. http://localhost:3000/ko/getting-started/installing-caret
 - 이미지 파일 변경
 - http://localhost:3000/assets/images/caret-install.png


3. http://localhost:3000/ko/getting-started/task-management
 * Cline -> Caret 브랜딩 남아있음

4. http://localhost:3000/ko/caret-exclusive/overview
   -> 아래의 내용을 기반으로 다시 정리해 

5.  http://localhost:3000/ko/caret-exclusive/persona-system
 - 페르소나 설명은 일반 이미지, 생각중 이미지 업로드, persona.md파일 편집이야. 실제 구조 파악하고 적어. 맘대로 쓰지 말고
   이미지 크기도 틀리네.
 - qna도 이상해   
 Q: 페르소나는 모델 품질에 영향을 주나요? A: 아니요. 페르소나는 응답 스타일만 변경하며, 모델의 기술적 능력은 동일합니다.
   => 예일거야. 페르소나에 실수투성이라던가, 소극적이라던가, 이상적인 개발자나 작업자의 성격과 다른 성격을 부여할때 문제가 될 수 있다고 생각해
 Q: 여러 프로젝트에서 다른 페르소나를 사용할 수 있나요? A: 네, 작업공간별로 기본 페르소나를 설정할 수 있습니다.
   => 그런 기능 없어. 단일이야. 필요하면 작업 규칙 공간에 작성할수는 있겠지. 현재 전역규칙 persona.md파일로 관리하고 있어. 물론 그거 삭제하고, 작업공간 규칙에 추가해서 그렇게 관리할 수도 있어. 
     그런데 이미지는 현재 전역이니 어떻게 안되

Q: 페르소나는 어디에 저장되나요? A: VS Code 전역 설정에 저장되며, 모든 프로젝트에서 사용 가능합니다.
   => 이건 맞네

6. http://localhost:3000/ko/caret-exclusive/dual-prompt-modes
 - 듀얼 프롬프트 설명 변경
   * 기본적으로 Cline은 계획 -> 실행 : 이러한 두가지 형태로 개발자의 행동을 요구하도록되어있어. 때문에 실행은 무조건 중지하라고 할때까지 계속 실행만 하고 대답도 잘 안해. 대신 계획 단계는 신중하게 하지
    이에 반해 Caret의 지향점은 Agent모드는 자율성있는 AI의 파트너 모드, Chatbot은 상담자/분석가로서의 역할이야.
     때문에 Agent모드에서는 대화하자고 하면 즉시 대화로 전환하는 유연성을 가지고 있어.
     Chatbot모드는 어쨌든 내가 직접 개발하고 조언만 원하는 개발자의 제한적 모드야. AI를 못 믿겠다 싶거나, 개발자가 멍청해지는 기분이 들 때 사용해. 스터디라던가 같은데 사용하면 좋지. AI를 통제하기보다는 개발자가 더 깊이 생각학도 싶을때사용되
   * Cline/Caret 모드는 완전히 별개로 동작하도록해. Caret은 Cline의 하위호환성을 보장하고 +알파를 목표하니까. Cline유저도 Caret을 사용해도 기존과 동일한 경험을 제공하려고 하는 목표야

   듀얼 프롬프트라기보다는 듀얼 모드에 가깝지. 이름 변경 필요할것 같아.


7. 기능 커스터마이징 및 브랜드 전환 -> 자세히 적지 말고, OEM브랜드 전환은 care.team의 비공개 프로젝트가 있으며, 이에 따른 커스텀 개발 지원을 하고 있고, support@caret.team으로 문의라고 적어
    * f03과 f08번 문서가 해당 사업을 위한거야.

8. 캐럿 제공자 : http://localhost:3000/ko/caret-exclusive/caret-provider (제공 예정만 적고, 구글 제미나이 우선 지원, 무료사용 가능할거라고만 적어줘. 자세히 적지마) 
  - 나중에 배포하면 자세히 적자.
  
9. 완전한 다국어 
  http://localhost:3000/ko/caret-exclusive/multilingual-ui
   페르소나는 빼자. 그냥 그건 템플릿 제공하는거라
  
7. 고급 규칙 시스템은 이상한데.. 이건 우선순위로 적용되는 기능이지, 딱히 고급은 아니야. 룰 우선순위관련인데.. @f05번 문서 참고해

8. 추가 프로바이더 및 기능 제공 : f09번 문서 참고, 해서 프로바이더별 추가 개선사항을 반영하고 있다고 써줘
 http://localhost:3000/ko/provider-config/litellm-and-caret-using-codestral 에 f09번 문서내용을 추가하고 링크 걸어
 특히 한국 기업들과 협력 하고 있고, 조만간 더 추가할거야. 협력 원하는 기업은 support@caretive.ai로 메일달라고 링크걸어줘

9. 상하 방향키 프롬프트 히스토리 기능 제공 : f10번 문서 참고, Caret의 **채팅 입력 히스토리 시스템**은 터미널과 일관된 사용자 경험을 제공하는 영구 저장 기반의 메시지 히스토리 관리 시스템 






---- 아래는 개발 완료된 내용 ---

## 🎯 핵심 전략

1. **한글만 작성** (docs-ko/)
2. **번역은 나중에** AI에게 분산
3. **2시간 안에 로컬 서버 띄우기**

## ⏱️ 2시간 타임라인

### 0:00-0:30 (30분) - Caret Exclusive 핵심 2개
- `docs-ko/caret-exclusive/overview.mdx` (10분)
  - 비교 테이블
  - 왜 Caret인가?
- `docs-ko/caret-exclusive/persona-system.mdx` (20분)
  - 가장 중요한 차별점
  - 프리셋 페르소나 5개
  - 사용법

### 0:30-1:00 (30분) - Caret Exclusive 나머지 5개
- `dual-prompt-modes.mdx` (8분) - Agent vs Act 비교
- `brand-switching.mdx` (5분) - Caret ↔ CodeCenter
- `caret-provider.mdx` (10분) - 무료 크레딧 강조
- `multilingual-ui.mdx` (3분) - 4개 언어 지원
- `advanced-rules.mdx` (4분) - 규칙 시스템 통합

### 1:00-1:30 (30분) - Cline 신규 기능 3개
- `features/yolo-mode.mdx` (10분)
  - 기존 영문 복사 → 한글 번역
- `features/dictation.mdx` (10분)
  - Cline 계정 전용 강조
- `features/multiroot-workspace.mdx` (10분)
  - 다중 루트 설명

### 1:30-2:00 (30분) - 네비게이션 & 서버
- `sidebars-ko.ts` 업데이트 (10분)
- `npm install && npm start` (5분)
- 각 페이지 확인 (15분)
  - http://localhost:3000/ko/caret-exclusive/overview
  - http://localhost:3000/ko/features/yolo-mode

## 📝 작성 패턴 (빠르게)

### 템플릿 구조
```markdown
---
title: [제목]
---

# [제목]

[1-2문장 요약]

## 주요 기능

- ✅ 기능 1
- ✅ 기능 2
- ✅ 기능 3

## 사용 방법

1. 단계 1
2. 단계 2

## 비교 (필요시)

| 항목 | Cline | Caret |
|------|-------|-------|
| A | ❌ | ✅ |

## 다음 단계

[관련 문서 링크]
```

## 📂 파일 생성 목록

```bash
cd docs.caret.team

# Caret Exclusive Features (신규 폴더)
mkdir -p docs-ko/caret-exclusive

touch docs-ko/caret-exclusive/overview.mdx
touch docs-ko/caret-exclusive/persona-system.mdx
touch docs-ko/caret-exclusive/dual-prompt-modes.mdx
touch docs-ko/caret-exclusive/brand-switching.mdx
touch docs-ko/caret-exclusive/caret-provider.mdx
touch docs-ko/caret-exclusive/multilingual-ui.mdx
touch docs-ko/caret-exclusive/advanced-rules.mdx

# Cline 신규 기능 (기존 폴더)
touch docs-ko/features/yolo-mode.mdx
touch docs-ko/features/dictation.mdx
touch docs-ko/features/multiroot-workspace.mdx
```

## 🚀 sidebars-ko.ts 추가 내용

```typescript
{
  type: 'category',
  label: '🌟 Caret 독점 기능',
  collapsed: false,
  items: [
    'caret-exclusive/overview',
    'caret-exclusive/persona-system',
    'caret-exclusive/dual-prompt-modes',
    'caret-exclusive/brand-switching',
    'caret-exclusive/caret-provider',
    'caret-exclusive/multilingual-ui',
    'caret-exclusive/advanced-rules',
  ],
},
```

## ✅ 완료 체크리스트

### Phase 1: Caret Exclusive (30분)
- [ ] overview.mdx - 개요 및 비교
- [ ] persona-system.mdx - 페르소나 시스템

### Phase 2: Caret Exclusive 나머지 (30분)
- [ ] dual-prompt-modes.mdx
- [ ] brand-switching.mdx
- [ ] caret-provider.mdx
- [ ] multilingual-ui.mdx
- [ ] advanced-rules.mdx

### Phase 3: Cline 신규 기능 (30분)
- [ ] yolo-mode.mdx
- [ ] dictation.mdx
- [ ] multiroot-workspace.mdx

### Phase 4: 통합 & 테스트 (30분)
- [ ] sidebars-ko.ts 업데이트
- [ ] npm install (필요시)
- [ ] npm start
- [ ] 브라우저 확인
- [ ] 링크 작동 확인

## 🎨 콘텐츠 가이드라인

**짧고 명확하게**:
- 각 문서 200-400 단어
- 스크린샷 없이 텍스트만 (나중에 추가)
- 코드 예제 최소화
- 핵심 메시지에 집중

**강조할 포인트**:
- Caret이 Cline보다 나은 이유
- 무료로 시작 가능 (Caret Provider)
- 한국어 완벽 지원
- 페르소나로 AI 커스터마이징

## 🔥 빠른 실행

```bash
cd /Users/luke/dev/caret/docs.caret.team

# 1. 브랜치 생성
git checkout -b feature/caret-exclusive-ko

# 2. 폴더 생성
mkdir -p docs-ko/caret-exclusive

# 3. 파일 작성 시작 (Claude에게 요청)
# "overview.mdx 작성 시작"

# 4. 작성 완료 후 서버 실행
npm start

# 5. 브라우저 열기
open http://localhost:3000/ko/caret-exclusive/overview
```

## 🚫 하지 않을 것

- ❌ 영문 번역 (나중에)
- ❌ 일본어/중국어 (나중에)
- ❌ 스크린샷 캡처 (나중에)
- ❌ 완벽한 문장 (초안만)
- ❌ 모든 세부사항 (핵심만)

## ⚡ 속도 팁

1. **복사 + 수정**: 기존 docs-ko 파일 구조 참고
2. **비교 테이블 재사용**: 한 번 만들면 여러 곳 복붙
3. **링크는 나중에**: 일단 `[링크]` 형태로만
4. **빌드 에러 무시**: 로컬 서버 뜨면 OK

---

**시작 시간**: [기록]
**목표 완료**: [시작 + 2시간]
**실제 완료**: [기록]

**상태**: 실행 준비 완료 🚀
