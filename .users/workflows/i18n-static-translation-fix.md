# i18n 정적 번역 수정 워크플로우

언어 전환 시 정적으로 고정되는 번역 문제를 해결하는 워크플로우입니다.

## 문제 상황

정적 상수로 정의된 번역이 언어 전환 시 업데이트되지 않는 문제:
```typescript
// ❌ 잘못된 패턴 - 정적 상수
const MENU_ITEMS = [
  { label: t('menu.home'), value: 'home' },  // 초기화 시점에 고정
];
```

## 해결 방법

### 동적 패턴 사용
```typescript
// ✅ 올바른 패턴 - 동적 함수
const getMenuItems = () => [
  { label: t('menu.home'), value: 'home' },
];

// 컴포넌트에서 사용
const menuItems = useMemo(() => getMenuItems(), [language]);
```

## 구현 단계

### 1. 문제 식별
- 언어 전환 후 업데이트 안 되는 텍스트 찾기
- 정적 상수로 정의된 번역 확인

### 2. 코드 수정
1. 상수를 함수로 변환
2. `useMemo` 또는 `useEffect`로 래핑
3. `language` 의존성 추가

### 3. 테스트
```typescript
describe('i18n 동적 업데이트', () => {
  it('언어 변경 시 UI가 업데이트되어야 함', () => {
    // 초기 언어
    render(<Component />);
    expect(screen.getByText('Home')).toBeInTheDocument();

    // 언어 변경
    act(() => changeLanguage('ko'));
    expect(screen.getByText('홈')).toBeInTheDocument();
  });
});
```

## Sovereign Cloud 언어

지원 언어 (7개):
- 🇺🇸 English (en)
- 🇰🇷 한국어 (ko)
- 🇯🇵 日本語 (ja)
- 🇨🇳 中文 (zh)
- 🇫🇷 Français (fr)
- 🇩🇪 Deutsch (de)
- 🇷🇺 Русский (ru)

## 네임스페이스 규칙

```typescript
// 기능별 네임스페이스
t('key', 'settings')    // settings.json
t('key', 'common')      // common.json
t('key', 'providers')   // providers.json
```

## 체크리스트

- [ ] 정적 상수 식별
- [ ] 동적 함수로 변환
- [ ] useMemo/useEffect 적용
- [ ] 언어 전환 테스트 통과
- [ ] 모든 지원 언어 확인

## 참조
- `.agents/workflows/atoms/i18n-dynamic-pattern.md`
- `careti-docs/features/f02-multilingual-i18n.md`

## 미러링 정책
`.agents/`와 `.users/`는 1:1 미러링 구조입니다.
- 이 파일 수정 시 `.agents/workflows/i18n-static-translation-fix.md`도 동일하게 업데이트
