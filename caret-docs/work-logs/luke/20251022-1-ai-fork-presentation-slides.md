# 발표: AI 기반 Fork 오픈소스 프로젝트 개발 전략


## 0. 타이틀
  제목: AI기반의 fork 오픈소스 프로젝트 개발 
  발표자 : ㈜캐럿티브 CTO 양병석 (fstory97@github, https://blog.naver.com/fstory97, http://linked.in/in/fstory97)
  - 2025년 캐럿 2차 밋업
  
당신의 코딩 파트너!
오픈소스 기반의 국산 AI에이전트 코딩 툴 캐럿을 찾아주세요.
https://marketplace.visualstudio.com/items?itemName=caretive.caret
https://github.com/aicoding-caret/caret

## 1. 캐럿 소개
- **캐럿 프로젝트 소개**:
  - Cline의 모든 기능을 포함하며 100% 호환성을 유지하는 AI 코딩 파트너
  
  - '개인화된 AI 동반자'와 '강화된 시스템 프롬프트'를 통해 개발 경험을 향상시키는 것을 목표로 함
- **캐럿이 클라인에 비해 추가 개발된 기능 소개**:
  - **F07: 페르소나 시스템**: 사용자가 자신만의 AI 이름과 프로필 이미지를 등록하여 시각적으로 교감하는 개발 경험 제공
  - **F06: 강화된 프롬프트 시스템**: JSON 기반 동적 프롬프트와 Chatbot/Agent 모드 전환으로 더 효율적인 AI 응답 유도
  - **F02: 4개 국어 지원**: UI, AI 채팅, 문서까지 완벽한 다국어(한/영/일/중) 환경 제공
  - **F05: 규칙 우선순위 시스템**: 다중 레이어(`.clinerules`, `.caretrules`) 설정을 통해 프로젝트별/사용자별 규칙 커스터마이징
  - **F11: 지식 패리티 시스템**: AI와 개발자가 동일한 지식(`.caretrules`의 워크플로우)을 공유하여 원활한 협업 지원
  - **F03: 브랜딩 및 UI 시스템**: B2B 솔루션을 위한 동적 브랜드 전환 기능 (Caret/CodeCenter)
  - **F10: 입력 이력 시스템**: 터미널과 같은 입력 이력 관리로 반복 작업 효율화

---

## 2. 문제 정의
- **핵심 과제**: 강력한 오픈소스인 Cline 위에 구축된 프로젝트로서, **원본(Upstream)의 빠른 업데이트에 어떻게 지속적으로 대응하며 Caret만의 고유 가치를 유지하고 확장할 것인가?**
 * 참고소스
  - **Caret GitHub Repository**: [https://github.com/aicoding-caret/caret](https://github.com/aicoding-caret/caret)
  - **Cline (Upstream) GitHub Repository**: [https://github.com/cline/cline](https://github.com/cline/cline)

- **Caret 기능의 기술 영역 정의**:
  - **Backend (`caret-src/`)**:
    - 규칙 우선순위 시스템 (F05)
    - Caret 프롬프트 시스템 (F06)
    - 기능 설정 시스템 (F08)
    - 강화된 Provider 설정 (F09)
    - 지식 패리티 시스템 (F11)
    - Caret 계정 시스템 (F04)
  - **Frontend (`webview-ui/src/caret/`)**:
    - 다국어 i18n 시스템 (F02)
    - 브랜딩 및 UI 시스템 (F03)
    - 페르소나 시스템 (F07)
    - 입력 이력 시스템 (F10)
  - **Shared**:
    - 공통 유틸리티 (F01)
 

## 3. 캐럿/클라인 구조 설명
- **핵심 아키텍처 사상**: **최소 침습 (Minimal Invasion)**
  - 원본 Cline 코드를 최대한 보존하고, 외과수술처럼 정밀하게 필요한 부분만 연결하여 기능을 확장하는 전략
  - **성과**: Cline 수정 파일 **85% 감소** (58개 → 9개), 수정 라인 **98% 감소** (수백 라인 → 291라인)
- **디렉토리 기반 역할 분리**:
  - **Backend**: `caret-src/`
    - Caret의 독립적인 백엔드 로직, 서비스, 관리 기능이 위치
    - 원본(`src/`)의 핵심 로직을 확장하거나 래핑(wrapping)하여 동작
  - **Frontend**: `webview-ui/src/caret/`
    - Caret 고유의 UI를 위한 React 컴포넌트들이 위치
    - 원본 UI(`webview-ui/src/`)에 최소한으로 삽입되어 렌더링
  - **Interface**: `proto/caret/`
    - 백엔드와 프론트엔드 간의 통신을 위한 gRPC(Protobuf) 메시지 및 서비스 정의
    - 명확한 API 계약을 통해 백엔드와 프론트엔드의 독립적인 개발 및 테스트 보장

---
## 4. 경험에 대한 공유: 3번의 Fork & Merge 여정

## 4.1. 1차 포크: 직접 수정의 시대와 실패한 백업 전략
  - **접근법**: Cline 초기 버전 위에서 필요한 기능을 원본 코드 58개 파일에 직접 추가.
   - **3-Way 비교 방식 도입**: `cline-latest`(원본), `caret-main`(과거), `작업 폴더`(현재)를 비교하며 체계적으로 머징 진행.
  - **실패한 아이디어**: AI가 참고할 수 있도록 수정 전 파일을 `.cline`으로 백업.
  - **부작용**: AI가 작업 중 기존 수정 파일을 다시 `.cline`으로 백업하면서, Caret의 변경 소스가 백업 파일로 덮어씌워지는 등 혼란 가중. **결국 이 방식은 폐기됨.**

## 4.2. 1차 머징: 고통 속에서 얻은 교훈과 새로운 전략**
  - **문제점**: '표준화 지옥' 경험. 특히 i18n 키 작성 방식이 통일되지 않아 중복 구현과 순환 참조 문제 발생.
  - **근본 원인 분석**: AI는 현재 코드만 지엽적으로 보기 때문에, 전체적인 컨벤션이나 중복 여부를 파악하기 어려움.
  - **터닝 포인트**:    
    2. **명확한 구현 원칙의 필요성**: AI가 길을 잃지 않도록, `f02-multilingual-i18n.md`와 같은 명확한 코딩 컨벤션 문서화의 중요성을 깨달음.
    3. **지식 동기화의 발상**: 이 경험은 AI와 개발자가 동일한 지식(규칙)을 공유해야 한다는 **F11: AI-개발자 지식 동기화 시스템**의 필요성으로 직접 이어짐.
  - **실행 전략**:
    - **Backend (Injection Model)**: 원본 Cline의 로직 위에 Caret의 서비스를 **주입(Injection)**하는 방식으로 확장. `caret-src`에 독립된 기능을 구현하고 원본에서는 최소한으로 호출.
    - **Frontend (Base & Patch Model)**:
      1. **기준 설정**: Caret의 프론트엔드는 **i18n(다국어)** 작업으로 인해 코드 대부분이 이미 수정된 상태이므로, **Caret의 코드를 기준(Base)**으로 삼음.
      2. **변경점 분석**: 원본 Cline의 변경 내역(`git diff`)을 추적/분석하여, 단순 텍스트 변경이 아닌 실제 **기능적 변경사항**만 선별.
      3. **선별적 통합**: 분석된 Cline의 기능 변경점들을 Caret의 코드 베이스 위에 **덮어쓰는(Patch)** 방식으로 통합하여, Caret의 i18n 구조를 유지하면서 Cline의 신규 기능을 수용.

## 4.3. 2차 머징: 아키텍처의 증명**
  - **도전**: Cline의 구조가 근본적으로 변경되는 대규모 업데이트 발생. 단순 머징(Natural Merging)이 불가능한 상황.
  - **과정**: 새로운 Cline 버전 위에, 2차 머징 때 정립한 Caret 아키텍처를 그대로 다시 이식.
  - **결과**: **'최소 침습'** 원칙 덕분에 Caret의 코드 대부분은 수정 없이 그대로 이식 가능했으며, 연결점(hook)만 다시 설정하여 성공적으로 업데이트 완료. 아키텍처의 유효성을 증명.

---

## 5. 상세 해결 방법: 최소 침습 방법론의 구체적 실행
## 5.1. 사상 및 설계 원칙
  - **사상**: "원본은 그대로, 기능은 외부에서." 원본 코드를 '수정'의 대상이 아닌 '활용'의 대상으로 본다.
  - **원칙 1 (독립성)**: Caret의 모든 기능은 `caret-src`, `webview-ui/src/caret` 등 약속된 독립 공간에서 구현된다.
  - **원칙 2 (최소 연결)**: 원본 코드 수정은 기능 활성화를 위한 연결점(hook) 역할의 1~3줄로 제한한다.
  - **원칙 3 (명시성)**: 모든 연결점에는 `// CARET MODIFICATION` 주석을 달아 수정 의도와 내용을 명확히 추적할 수 있게 한다.
## 5.2. 실행 방법
  - **3-Way 비교 머징**: `cline-latest`(원본), `caret-main`(과거 Caret), `작업 폴더`(현재) 3개의 소스를 비교하여, 원본의 변경사항과 Caret의 고유 기능을 체계적으로 통합합니다.
  - **주석**: `// CARET MODIFICATION: [수정 이유와 내용 요약]` 형식으로 모든 수정 지점에 기록. 이는 3-Way 비교 시 Caret의 변경 의도를 파악하는 핵심 단서가 됨.
  - **백엔드 (Wrapper 패턴 예시)**: `caret-src`에 Wrapper를 만들고, 원본에서는 이 Wrapper를 호출하도록 한 줄만 수정.
    ```typescript
    // In: caret-src/services/activation-wrapper.ts (Caret's new file)
    export class ActivationWrapper {
      static activate(context) {
        console.log("✨ Caret features activated!");
        // Call original activation logic after adding Caret's features
        originalActivate(context);
      }
    }

    // In: src/extension.ts (Cline's original file)
    export async function activate(context) {
      // CARET MODIFICATION: Use Caret's wrapper for activation
      ActivationWrapper.activate(context);
    }
    ```
  - **Protos (gRPC)**: `proto/cline` 원본 파일을 절대 수정하지 않음. `proto/caret`에 Caret 전용 메시지와 서비스를 정의하고, 별도의 gRPC 클라이언트/서버를 생성하여 통신.
    - **충돌 회피 전략**: Caret 고유의 필드 번호는 **1000번 이상으로 지정**하여, Cline의 필드 번호(1~999)와 충돌을 원천적으로 방지합니다.
    - **`enum` 회피**: `enum` 대신 `string` 또는 `int32`를 사용하여 상태를 정의. 이는 클라이언트-서버 간 버전 차이로 인해 알 수 없는 `enum` 값이 `0`으로 강제 변환되는 문제를 방지하여 호환성을 높입니다.
  - **프론트엔드 (i18n 동적 번역 패턴)**: 언어 변경 시 UI가 업데이트되지 않는 문제를 해결하기 위해, 정적 상수를 동적 함수로 변경합니다.
    ```typescript
    // ❌ Before: 언어 변경에 반응하지 않음
    export const MENU_ITEMS = [ { name: t("menu.file", "common") } ];

    // ✅ After: 언어 변경 시 다시 호출되어 번역이 업데이트됨
    export const getMenuItems = () => [ { name: t("menu.file", "common") } ];
    
    // In Component
    const menuItems = useMemo(() => getMenuItems(), [language]);
    ```

---


## 6. 결론
- **6.1. 전통적인 머징 방법론 대비**:
  - **강점**: Upstream 업데이트 시 **머징 비용이 획기적으로 감소**하며, 프로젝트의 유지보수성이 극대화됨. Caret만의 정체성과 로드맵을 명확하게 가져갈 수 있음.
  - **약점**: 초기 아키텍처 설계에 더 많은 고민이 필요하며, Wrapper/DI 패턴으로 인해 코드 흐름을 추적할 때 한 단계를 더 거쳐야 하는 약간의 복잡성이 존재함. (예: `A -> Wrapper -> B` 구조)
- **6.2. 오픈소스 생태계에 미치는 영향**:
  - 단순 Fork & Diverge(포크 후 독자 노선)가 아닌, 원본과 함께 성장하는 **Fork & Extend(포크 후 확장)** 라는 새로운 협력 모델을 제시.
  - 원본 프로젝트의 발전을 지속적으로 흡수하면서도, 독립적인 가치를 창출하고 언젠가 원본에 역기여(Contribute Back)할 수 있는 건강한 선순환 구조.
  - 작고 강한 커뮤니티가 유리, 사람들간의 협의 과정이 어려울 수 있음    
  - AI에 의한 나쁜 코드의 증가, 하지만 git의 ai에 의한 코드리뷰 등으로 적정 수준 통제 가능
  - 손쉬운 fork와 개선으로 수많은 가지들이 빠르게 생성/소멸 하여, 코드의 종 처럼 분화의 가능성 
     * 적자생존의 원리를 답습한 AI에 의한 개발로 인한 SW의 코드의 종 분화  
  
- **6.3. AI 기반 SW 개발 방법론 측면**:
  - **'표준화 지옥'의 교훈**: AI는 지엽적인 관점으로 인해 전체적인 코드 컨벤션을 유지하기 어렵다는 문제점을 발견.
  - **해결책 (F11: 지식 동기화)**: AI와 개발자가 동일한 코딩 컨벤션(`f02-multilingual-i18n.md` 등)과 작업 절차(`.caretrules`)를 공유하는 **'지식 동기화 시스템'**을 구축.
  - **결과**: AI에게 명확한 가이드라인을 제공하여 개발의 예측 가능성과 안정성을 확보하고, **11일 만에 3~6개월 분량의 아키텍처 전환을 달성 (개발 속도 18배 향상)**.
  - **AI 협업 모델 정립**: 전략/표준화(Human-Led) → 구현 가속(AI-Assisted) → 최종 검증(Human-Verified)의 효과적인 역할 분담 모델 증명.
  - **디버깅 보다는 설계, 모니터링, 검증의 중요성 강화**: AI가 잘 못하는 고쳐 쓰는 것보다는 좋은 설계, 모니터링, 검증이 더 중요
      => 코드 문법 자체보다 SDLC에 대한 이해도에 대한 중요도 상승  
---

## 7. QnA
자유롭게 질문해주세요.
당신의 코딩 파트너!
오픈소스 기반의 국산 AI에이전트 코딩 툴 캐럿을 찾아주세요.
https://marketplace.visualstudio.com/items?itemName=caretive.caret
https://github.com/aicoding-caret/caret

---
