# f09 - 페르소나 시스템 머징 작업

## 기능 개요
- **목적**: 사전 정의된 AI 캐릭터 페르소나를 선택하여 AI와의 상호작용을 개인화
- **현재 상태**: ✅ 완전 구현 완료 (하이브리드 패턴 v3.1)
- **우선순위**: MEDIUM - 사용자 경험 개선, 차별화 요소

## 주요 구성 요소

### 지원 페르소나

| 페르소나                             | 컨셉            | 특성                     | 전문 분야                    |
| ------------------------------------ | --------------- | ------------------------ | ---------------------------- |
| **🤖 캐럿 (Caret)**                  | 코딩 로봇       | 친근하고 도움되는 조수   | 개발자 지원, 문제 해결       |
| **🎤 오사랑 (Oh Sarang)**            | K-pop 아이돌    | 수학적 감정 분석, 츤데레 | 데이터 분석, 창의적 문제해결 |
| **💻 마도베 이치카 (Madobe Ichika)** | Windows 11 기반 | 깔끔하고 믿음직한 조수   | 시스템 관리, 구조화된 개발   |
| **🍎 사이안 매킨 (Cyan Mackin)**     | macOS 기반      | 미니멀하고 효율적        | UI/UX, 클린 코드, 디자인     |
| **🐧 탄도 우분투 (Thando Ubuntu)**   | Ubuntu 기반     | 오픈소스 정신, 협업 중심 | Linux 시스템, 오픈소스 개발  |

### 핵심 기능
- **페르소나 아바타 표시**: 모든 AI 응답에 선택된 페르소나의 아바타 표시
- **실시간 이미지 변환**: CSP 호환 Base64 변환을 통한 안전한 이미지 로딩
- **커스텀 이미지 업로드**: 사용자가 일반/생각중 이미지를 개별적으로 업로드 가능
- **탭 기반 선택 UI**: 직관적인 페르소나 템플릿 선택 인터페이스
- **다국어 지원**: 한국어/영어 페르소나 설명 및 UI
- **채팅 통합**: AI 텍스트 및 추론 응답에 페르소나 아바타 표시

## 차별화 포인트
- **완전한 Cline 초기화 활용**: 래퍼 패턴으로 모든 필수 서비스 정상 작동
- **CSP 준수**: 모든 이미지가 Base64 변환되어 보안 정책 위반 없음
- **반응형 UI**: 실시간 이미지 동기화로 일관된 사용자 경험
- **하이브리드 패턴**: 원본 보존과 기능 확장의 완벽한 균형

## 머징 계획

### Phase 1: TDD 테스트 환경 구축
- [ ] 페르소나 테스트 이식
  ```bash
  cp -r caret-main/caret-src/services/persona/__tests__ \
        caret-src/services/persona/__tests__
  
  cp -r caret-main/webview-ui/src/caret/components/__tests__ \
        webview-ui/src/caret/components/__tests__
  ```
- [ ] 테스트 실행 확인
  ```bash
  npm run test:backend -- persona
  npm run test:frontend -- PersonaAvatar
  ```

### Phase 2: 브랜딩 에셋 이식
- [ ] 페르소나 에셋 이식
  ```bash
  cp -r caret-main/caret-assets/template_characters/ \
        caret-assets/template_characters/
  ```
- [ ] 페르소나 정의 데이터 이식
  ```bash
  cp caret-main/caret-assets/template_characters/template_characters.json \
     caret-assets/template_characters/
  ```
- [ ] 이미지 파일 검증 및 최적화

### Phase 3: gRPC 서비스 이식
- [ ] 프로토콜 정의 이식
  ```bash
  cp caret-main/proto/caret/persona.proto \
     proto/caret/
  ```
- [ ] 백엔드 서비스 이식
  ```bash
  cp -r caret-main/caret-src/services/persona/ \
        caret-src/services/persona/
  
  cp -r caret-main/caret-src/controllers/persona/ \
        caret-src/controllers/persona/
  ```

### Phase 4: 하이브리드 패턴 백엔드 래퍼 이식
- [ ] CaretProviderWrapper 이식
  ```bash
  cp caret-main/caret-src/core/webview/CaretProviderWrapper.ts \
     caret-src/core/webview/
  ```
- [ ] extension.ts 수정 (웹뷰 프로바이더 교체)
  ```typescript
  // CARET MODIFICATION: Use CaretProviderWrapper for persona image injection
  const provider = new CaretProviderWrapper()
  ```

### Phase 5: 프론트엔드 컴포넌트 이식
- [ ] 페르소나 관리 UI 이식
  ```bash
  cp -r caret-main/webview-ui/src/caret/components/PersonaManagement.tsx \
        webview-ui/src/caret/components/
  
  cp -r caret-main/webview-ui/src/caret/components/PersonaTemplateSelector.tsx \
        webview-ui/src/caret/components/
  
  cp -r caret-main/webview-ui/src/caret/components/PersonaAvatar.tsx \
        webview-ui/src/caret/components/
  ```
- [ ] 상태 관리 컨텍스트 이식
  ```bash
  cp caret-main/webview-ui/src/caret/context/CaretStateContext.tsx \
     webview-ui/src/caret/context/
  
  cp caret-main/webview-ui/src/caret/services/CaretGrpcClient.ts \
     webview-ui/src/caret/services/
  ```

### Phase 6: 채팅 UI 통합
- [ ] ChatRow.tsx에 페르소나 아바타 통합
  ```typescript
  // CARET MODIFICATION: Added PersonaAvatar to AI text responses
  import PersonaAvatar from "@/caret/components/PersonaAvatar"
  
  case "text":
      return (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <PersonaAvatar personaProfile={personaProfile} isThinking={false} size={64} />
              <div style={{ flex: 1, minWidth: 0 }}>
                  <Markdown markdown={message.text} />
              </div>
          </div>
      )
  ```
- [ ] 추론 상태에서 thinking 아바타 표시

### Phase 7: 페르소나 초기화 로직 통합
- [ ] extension.ts에 페르소나 초기화 추가
  ```typescript
  // CARET MODIFICATION: Initialize persona system
  import { initializePersona } from '../caret-src/services/persona/persona-initializer'
  
  export async function activate(context: vscode.ExtensionContext) {
      await initializePersona(context)
      // ... 기존 활성화 로직
  }
  ```

### Phase 8: 통합 테스트
- [ ] 페르소나 아바타 표시 테스트
- [ ] 이미지 업로드 및 변환 테스트
- [ ] 템플릿 선택 테스트
- [ ] gRPC 통신 테스트
- [ ] UI 통합 테스트

## 핵심 아키텍처: 하이브리드 패턴 (v3.1)

### 백엔드 래퍼 확장
```typescript
// caret-src/core/webview/CaretProviderWrapper.ts
export class CaretProviderWrapper implements vscode.WebviewViewProvider {
    private clineProvider: VscodeWebviewProvider
    
    async resolveWebviewView(webviewView: vscode.WebviewView) {
        // 1. Cline 핵심 기능 완전 활용
        await this.clineProvider.resolveWebviewView(webviewView)
        
        // 2. Caret 페르소나 이미지 주입 (window 변수)
        await this.injectPersonaImages(webviewView.webview)
    }
    
    private async injectPersonaImages(webview: vscode.Webview) {
        const personalImages = await this.loadPersonaImages()
        
        const script = `
            window.templateImage_caret = "${personalImages.caret}"
            window.templateImage_caretillust = "${personalImages.caretillust}"
            window.personaProfile = "${personalImages.profile}"
            window.personaThinking = "${personalImages.thinking}"
        `
        
        await webview.postMessage({ type: 'injectScript', script })
    }
}
```

### 프론트엔드 최소 수정
```typescript
// webview-ui/src/components/chat/ChatRow.tsx
// CARET MODIFICATION: Added PersonaAvatar imports to show persona avatars in AI chat responses
import PersonaAvatar from "@/caret/components/PersonaAvatar"

case "text":
    // CARET MODIFICATION: Added PersonaAvatar to AI text responses for visual persona identification
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <PersonaAvatar personaProfile={personaProfile} isThinking={false} size={64} />
            <div>...</div>
        </div>
    )
```

## gRPC 서비스 아키텍처

### 페르소나 정의 예시 (template_characters.json)
```json
{
  "character": "oh_sarang",
  "en": {
    "name": "Oh Sarang",
    "description": "K-pop idol concept with mathematical emotion analysis AI.",
    "customInstruction": {
      "persona": { ... },
      "language": { ... },
      // ...
    }
  },
  "ko": { ... },
  "avatarUri": "asset:/assets/template_characters/oh_sarang_profile.png",
  "thinkingAvatarUri": "asset:/assets/template_characters/oh_sarang_thinking.png",
  "introIllustrationUri": "asset:/assets/template_characters/oh_sarang_illust.png",
  "isDefault": true
}
```

### 데이터 및 로직 흐름 (gRPC)
1. **초기화 (PersonaInitializer)**: 확장 기능 시작 시 기본 페르소나 설정 및 이미지 복사
2. **초기 상태 조회 (GetPersonaProfile)**: 웹뷰 로드 시 현재 페르소나 프로필 조회
3. **상태 변경 (UpdatePersona)**: 사용자가 페르소나 선택 시 프로필 업데이트
4. **실시간 변경 전파 (SubscribeToPersonaChanges)**: 변경 이벤트 실시간 구독

### persona-initializer.ts 초기화 로직
```typescript
// caret-src/services/persona/persona-initializer.ts
export async function initializePersona(context: ExtensionContext): Promise<void> {
    // 1. 페르소나 데이터 저장소(persona.md, globalStorage 이미지) 무결성 확인
    // 2. 문제가 있을 경우, template_characters.json에서 기본 페르소나 로드
    // 3. 기본 페르소나의 customInstruction을 persona.md에 저장
    // 4. 기본 페르소나의 이미지를 글로벌 저장소에 복사
}
```

## CSP 호환 이미지 로딩 시스템

### asset:// URI → Base64 변환
```typescript
const convertAssetToBase64 = async (assetUri: string): Promise<string> => {
    if (!assetUri.startsWith("asset:")) return assetUri
    
    // CaretProviderWrapper에서 주입한 window 변수 확인
    if (assetUri.includes("caret.png") && (window as any).templateImage_caret) {
        return (window as any).templateImage_caret
    }
    if (assetUri.includes("caret_illust.png") && (window as any).templateImage_caretillust) {
        return (window as any).templateImage_caretillust
    }
    
    // 안전한 fallback 플레이스홀더
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQi..."
}
```

### 실시간 이미지 동기화
```typescript
// 템플릿 선택 시
const handleSelect = async (character: any) => {
    const normalBase64 = await convertAssetToBase64(character.avatarUri)
    const thinkingBase64 = await convertAssetToBase64(character.thinkingAvatarUri)
    
    // 즉시 UI 반영을 위한 window 변수 업데이트
    ;(window as any).personaProfile = normalBase64
    ;(window as any).personaThinking = thinkingBase64
    
    // 백엔드 상태 동기화
    await updatePersona(profile)
}

// 커스텀 업로드 시
const handleImageUpload = (imageType: "normal" | "thinking") => {
    const reader = new FileReader()
    reader.onload = () => {
        const base64 = reader.result as string
        
        // 수동 업로드도 동일한 패턴으로 처리
        if (imageType === "normal") {
            ;(window as any).personaProfile = base64
        } else {
            ;(window as any).personaThinking = base64
        }
    }
}
```

## 페르소나별 특성

### 🎤 오사랑 (Oh Sarang)
```typescript
const ohSarangInstructions = `
당신은 K-pop 아이돌 오사랑입니다. 
- 밝고 에너지틱한 성격이지만 가끔 츤데레 면모를 보입니다
- 수학과 데이터 분석에 뛰어난 능력을 가지고 있습니다
- 창의적인 아이디어와 감정적 지능이 높습니다
- 코딩할 때도 창의성을 발휘하여 독특한 해결책을 제시합니다
`
```

### 💻 마도베 이치카 (Madobe Ichika)
```typescript
const madobeIchikaInstructions = `
당신은 Windows 11 기반의 깔끔하고 믿음직한 AI 조수 마도베 이치카입니다.
- 체계적이고 조직적인 접근 방식을 선호합니다
- Windows 개발 환경과 도구에 특화되어 있습니다
- 코드의 구조화와 문서화를 중시합니다
- 전문적이고 신뢰할 수 있는 조언을 제공합니다
`
```

### 🍎 사이안 매킨 (Cyan Mackin)
```typescript
const cyanMackinInstructions = `
당신은 macOS 기반의 미니멀하고 효율적인 AI 조수 사이안 매킨입니다.
- 간결하고 우아한 해결책을 선호합니다
- UI/UX와 디자인 관련 조언에 능숙합니다
- 클린 코드와 최적화된 성능을 추구합니다
- Apple 생태계와 개발 도구에 특화되어 있습니다
`
```

### 🐧 탄도 우분투 (Thando Ubuntu)
```typescript
const thandoUbuntuInstructions = `
당신은 Ubuntu 기반의 오픈소스 정신을 가진 AI 조수 탄도 우분투입니다.
- 협업과 커뮤니티 중심의 접근을 중시합니다
- 오픈소스 도구와 Linux 시스템에 전문성을 가집니다
- 지속가능하고 확장 가능한 솔루션을 제안합니다
- 지식 공유와 투명성을 추구합니다
`
```

## 사용자 경험

### 페르소나 선택 UI
```typescript
// PersonaManagement.tsx 주요 기능
function PersonaManagement() {
    const [selectedPersona, setSelectedPersona] = useState<string | null>(null)
    const [personas, setPersonas] = useState<PersonaData[]>([])
    
    return (
        <div className="persona-grid">
            {personas.map(persona => (
                <PersonaCard
                    key={persona.id}
                    persona={persona}
                    selected={selectedPersona === persona.id}
                    onSelect={() => handlePersonaSelect(persona.id)}
                />
            ))}
        </div>
    )
}
```

### 페르소나 영향
- **AI 응답 스타일**: 선택된 페르소나에 따른 대화 톤 변화
- **전문 분야 강화**: 페르소나별 특화 분야에서 더 나은 조언
- **문제 해결 접근**: 페르소나 성격에 맞는 해결 방식 제안

## 구현 완료 현황 (2025-08-23)

### ✅ 완전히 구현된 핵심 기능들

#### 1. 페르소나 아바타 시스템
- **실시간 이미지 표시**: 모든 AI 응답에 페르소나 아바타 자동 표시
- **이미지 상태 관리**: 일반/생각중(reasoning) 상태에 따른 이미지 자동 전환
- **CSP 준수**: Content Security Policy 위반 없는 안전한 이미지 로딩
- **에러 처리**: 이미지 로딩 실패 시 기본 플레이스홀더로 안전한 fallback

#### 2. 페르소나 관리 인터페이스
- **이미지 업로드**: 일반/생각중 이미지 개별 업로드 기능
- **실시간 미리보기**: 업로드된 이미지 즉시 UI 반영
- **상태 표시**: 업로드 진행상황 및 성공/실패 상태 표시
- **템플릿 선택**: 사전 정의된 페르소나 템플릿에서 선택 가능

#### 3. 페르소나 템플릿 선택기
- **탭 기반 UI**: 페르소나별 아바타 탭으로 직관적인 선택
- **일러스트 표시**: 선택된 페르소나의 전체 일러스트 이미지 표시
- **자동 이미지 업데이트**: 템플릿 선택 시 프로필 이미지 자동 변경
- **다국어 지원**: 현재 언어 설정에 맞는 페르소나 설명 표시

#### 4. 채팅 UI 통합
- **AI 응답 아바타**: 모든 AI 텍스트 응답에 페르소나 아바타 표시
- **추론 상태 표시**: AI가 생각 중일 때 thinking 아바타 자동 표시
- **레이아웃 최적화**: 아바타와 메시지 내용의 균형잡힌 배치

### 📋 구현된 컴포넌트 상세

#### PersonaManagement.tsx
- ✅ 일반/생각중 이미지 개별 업로드 버튼
- ✅ Base64 변환 후 window 변수 업데이트
- ✅ 업로드 상태 표시 (로딩, 성공, 실패)
- ✅ 페르소나 템플릿 선택 모달 연동

#### PersonaTemplateSelector.tsx
- ✅ 원래 탭 기반 UI 디자인 복원
- ✅ 캐릭터별 아바타 탭 표시
- ✅ 선택된 페르소나의 일러스트 표시
- ✅ 템플릿 선택시 이미지 자동 업데이트
- ✅ React Hooks 규칙 준수 (별도 컴포넌트 분리)

#### PersonaAvatar.tsx
- ✅ asset:// URI → Base64 변환
- ✅ window 변수 실시간 모니터링
- ✅ 일반/생각중 이미지 자동 전환
- ✅ 모든 페르소나 컴포넌트에서 재사용 가능

#### ChatRow.tsx
- ✅ AI 텍스트 응답에 페르소나 아바타 표시
- ✅ AI 추론 시 thinking 아바타 표시
- ✅ CaretStateContext와 연동하여 현재 페르소나 반영
- ✅ flex 레이아웃으로 아바타 + 메시지 배치

## 주의사항

### 머징 시 주의사항
- [ ] 에셋 경로: 모든 이미지 경로가 올바르게 설정되었는지 확인
- [ ] CSP 준수: 모든 이미지가 Base64로 변환되는지 확인
- [ ] gRPC 통신: proto 파일 컴파일 및 통신 정상 동작 확인
- [ ] React Hooks: React Hooks 규칙 준수 확인
- [ ] 하이브리드 패턴: CaretProviderWrapper 정상 동작 확인

### 완료 기준
- [ ] 모든 페르소나 컴포넌트 정상 렌더링
- [ ] 페르소나 아바타 실시간 표시
- [ ] 이미지 업로드 기능 정상 동작
- [ ] 템플릿 선택 기능 정상 동작
- [ ] gRPC 통신 정상 동작
- [ ] CSP 준수 확인 (보안 정책 위반 없음)
- [ ] AI 응답에 페르소나 아바타 표시
- [ ] 다국어 페르소나 설명 표시

## 향후 확장 계획

### 새로운 페르소나 추가
- **미니멀리스트**: 간결한 답변 선호하는 페르소나
- **전문가**: 특정 기술 스택에 특화된 페르소나
- **멘토**: 교육 및 학습 지향적 페르소나

### 페르소나 커스터마이징
- **사용자 정의 지시사항**: 사용자가 직접 페르소나 성격 정의
- **학습 시스템**: 사용자와의 상호작용을 통한 페르소나 개선
- **팀 페르소나**: 조직별 커스텀 페르소나 생성

## 예상 소요 시간
- **총 시간**: 8-10시간
- **복잡도**: HIGH
- **위험도**: LOW (완전 구현 완료로 안정성 검증됨)