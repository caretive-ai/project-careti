# t04 - 브랜딩 시스템 머징 작업

## 기능 개요
- **목적**: Cline 브랜딩을 Caret으로 완전 대체 

## 주요 구성 요소

### 브랜딩 에셋
```
caret-assets/
├── icons/
│   ├── icon.png                  # 기본 앱 아이콘
│   ├── icon.svg                  # 벡터 아이콘
│   ├── caret_shell_icon.svg      # 셸 아이콘
│   └── icon_w.svg                # 화이트 아이콘
├── caret-main-banner.webp         # 메인 배너
├── agent_profile.png              # 에이전트 프로필
└── template_characters/           # 페르소나 캐릭터 이미지
```

### UI 컴포넌트
- **CaretWelcome.tsx**: 웰컴 페이지 메인
- **CaretAnnouncement.tsx**: 공지사항 페이지
- **CaretFooter.tsx**: 푸터 컴포넌트
- **CaretApiSetup.tsx**: API 설정 (브랜딩 포함)

### 브랜드 컬러 시스템
```css
:root {
  --caret-primary: #6366f1;      /* 인디고 - 메인 브랜드 */
  --caret-secondary: #8b5cf6;    /* 바이올렛 - 보조 */
  --caret-accent: #10b981;       /* 에메랄드 - 액센트 */
  --caret-success: #059669;      /* 그린 - 성공 */
  --caret-warning: #d97706;      /* 앰버 - 경고 */
  --caret-error: #dc2626;        /* 레드 - 오류 */
}
```

## 차별화 포인트
- **Cline과 완전 분리**: 독립적인 브랜딩으로 혼동 방지
- **조건부 표시**: 필요에 따라 Cline 브랜딩으로 전환 가능
- **확장성**: 새로운 브랜딩 요소 쉽게 추가
- **일관성**: 모든 UI 요소에서 통일된 디자인 언어

## 머징 계획

### Phase 1: UI 테스트 환경 구축
- [ ] UI 컴포넌트 테스트 이식
  ```bash
  cp -r caret-main/webview-ui/src/caret/components/__tests__/ \
        webview-ui/src/caret/components/__tests__/
  ```
- [ ] 테스트 실행 확인
  ```bash
  npm run test:frontend -- branding
  ```
- [ ] 시각적 회귀 테스트 설정 (선택사항)

### Phase 2: 브랜딩 에셋 이식
- [ ] 이미지 및 아이콘 에셋 이식
  ```bash
  cp -r caret-main/caret-assets/ caret-assets/
  cp -r caret-main/webview-ui/src/assets/ webview-ui/src/assets/
  ```
- [ ] 에셋 파일 검증
- [ ] 이미지 최적화 (WebP, PNG 압축 등)

### Phase 3: 스타일 시스템 이식
- [ ] Caret 전용 CSS 이식
  ```bash
  cp -r caret-main/webview-ui/src/caret/styles/ \
        webview-ui/src/caret/styles/
  ```
- [ ] 브랜드 컬러 변수 확인
- [ ] 다크 모드 스타일 검증

### Phase 4: UI 컴포넌트 이식
- [ ] 브랜딩 컴포넌트 이식
  ```bash
  cp caret-main/webview-ui/src/caret/components/CaretWelcome.tsx \
     webview-ui/src/caret/components/
  
  cp caret-main/webview-ui/src/caret/components/CaretAnnouncement.tsx \
     webview-ui/src/caret/components/
  
  cp caret-main/webview-ui/src/caret/components/CaretFooter.tsx \
     webview-ui/src/caret/components/
  ```
- [ ] 로고 컴포넌트 이식
  ```bash
  cp caret-main/webview-ui/src/assets/CaretLogoWhite.tsx \
     webview-ui/src/assets/
  ```

### Phase 5: 라우팅 및 통합
- [ ] 페이지 라우팅 추가 (webview-ui 메인 앱에 Caret 페이지들 통합)
- [ ] 네비게이션 메뉴 업데이트 (웰컴, 공지사항 페이지 링크)
- [ ] 조건부 브랜딩 설정 (사용자 설정에 따른 Caret/Cline 브랜딩 전환)

### Phase 6: 통합 UI 테스트
- [ ] 모든 UI 컴포넌트 테스트
- [ ] 시각적 회귀 테스트 (`npm run test:visual`)
- [ ] 접근성 테스트 (`npm run test:a11y`)
- [ ] E2E UI 테스트 (F5로 확장 실행 후 모든 브랜딩 요소 확인)

## 조건부 브랜딩 시스템
```typescript
interface BrandingConfig {
    mode: "caret" | "cline" | "auto"
    showCaretWelcome: boolean
    showCaretAnnouncements: boolean
    useCaretColors: boolean
}

const BrandingProvider: React.FC = ({ children }) => {
    const [config, setConfig] = useState<BrandingConfig>({
        mode: "caret",
        showCaretWelcome: true,
        showCaretAnnouncements: true,
        useCaretColors: true
    })

    return (
        <BrandingContext.Provider value={{ config, setConfig }}>
            <div className={`app ${config.useCaretColors ? 'caret-theme' : 'cline-theme'}`}>
                {children}
            </div>
        </BrandingContext.Provider>
    )
}
```

## 주의사항
- **에셋 경로**: 모든 이미지 경로가 올바르게 설정되었는지 확인
- **번들 크기**: 이미지 최적화로 번들 크기 증가 최소화
- **로딩 성능**: 이미지 lazy loading 및 압축 적용
- **접근성**: alt 텍스트, 키보드 네비게이션 확인
- **다크 모드**: 모든 브랜딩 요소에서 다크 모드 지원

## 완료 기준
- [ ] 모든 브랜딩 컴포넌트 정상 렌더링
- [ ] Caret 로고 및 색상 시스템 적용
- [ ] 웰컴 페이지 완전 기능 동작
- [ ] 공지사항 시스템 정상 동작
- [ ] 다국어 브랜딩 텍스트 표시
- [ ] 다크/라이트 모드 지원
- [ ] 100% UI 테스트 커버리지 달성
