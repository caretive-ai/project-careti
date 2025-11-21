VSCode 확장 상태 관리를 위한 일관된 저장 패턴을 따르고 있습니다.

<detailed_sequence_of_steps>
# 저장 패턴 - 일관된 상태 관리

## 핵심 원칙
**데이터 생명주기와 공유 요구사항에 적합한 저장 범위를 사용한다**

## 저장 타입

### WorkspaceState (프로젝트별)
**사용처**: 프로젝트/워크스페이스별로 달라지는 설정
```typescript
// chatSettings - 대화 기록, 프로젝트별 AI 컨텍스트
context.workspaceState.update('chatSettings', settings);
const chatSettings = context.workspaceState.get('chatSettings');
```

**특성**:
- VSCode 워크스페이스별로 격리됨
- VSCode 세션 간에 지속됨
- 워크스페이스가 삭제되면 손실됨
- 워크스페이스 구성원 간에 공유됨 (팀 설정에서)

### GlobalState (사용자 전체)  
**사용처**: 모든 프로젝트에 적용되는 사용자 선호도
```typescript
// globalSettings - 사용자 선호도, API 키, 일반 설정
context.globalState.update('globalSettings', preferences);
const globalSettings = context.globalState.get('globalSettings');
```

**특성**:
- 모든 워크스페이스에서 사용 가능
- 사용자별 설정
- VSCode 재설치에도 지속됨
- 개별 사용자에게 비공개

## 일관성 규칙

### 설정 분류:
- **채팅/대화 데이터** → `workspaceState`
- **사용자 선호도** → `globalState` 
- **API 자격증명** → `globalState`
- **프로젝트 설정** → `workspaceState`
- **UI 상태** (패널, 뷰) → 공유 요구사항에 따라 결정

### 명명 규칙:
```typescript
// 좋은 예: 명확한 범위 표시
'chatSettings'     // 워크스페이스별
'globalSettings'   // 사용자별
'projectConfig'    // 워크스페이스별

// 나쁜 예: 모호한 범위
'settings'         // 어떤 범위인가?
'config'           // Global인가 workspace인가?
```

## 구현 패턴
```typescript
export class StorageService {
  constructor(private context: vscode.ExtensionContext) {}
  
  // 워크스페이스 범위
  getChatSettings(): ChatSettings {
    return this.context.workspaceState.get('chatSettings', defaultChatSettings);
  }
  
  setChatSettings(settings: ChatSettings): void {
    this.context.workspaceState.update('chatSettings', settings);
  }
  
  // 전역 범위  
  getGlobalPreferences(): GlobalPreferences {
    return this.context.globalState.get('globalSettings', defaultGlobalSettings);
  }
  
  setGlobalPreferences(prefs: GlobalPreferences): void {
    this.context.globalState.update('globalSettings', prefs);
  }
}
```

## 관련 워크플로우
- `/modification-levels`로 새 기능 구현 시 적용
- `/tdd-cycle` 통합 테스트로 저장 동작 테스트
- `/verification-steps`로 데이터 지속성 검증
</detailed_sequence_of_steps>

<general_guidelines>
일관된 저장 패턴은 데이터 손실을 방지하고 예측 가능한 사용자 경험을 제공합니다.

workspace vs global 구분은 데이터의 의도된 사용에서 명확해야 합니다.

누락된 저장 값에 대해서는 항상 적절한 기본값을 제공하세요.
</general_guidelines>