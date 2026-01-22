# 새 컴포넌트 생성 워크플로우

React 컴포넌트, 서비스, UI 기능 등 새로운 컴포넌트 생성 시 따르는 워크플로우입니다.

## 컴포넌트 유형

### Frontend (React)
- UI 컴포넌트
- 훅(Hooks)
- 컨텍스트(Context)

### Backend (TypeScript)
- 서비스 클래스
- 유틸리티 함수
- 타입 정의

## 생성 단계

### 1. 설계
- 컴포넌트 목적 정의
- Props/인터페이스 설계
- 의존성 파악

### 2. 파일 생성
```bash
# Frontend 컴포넌트
# careti-src/webview/ 또는 webview-ui/src/caret/
touch MyComponent.tsx
touch MyComponent.test.tsx

# Backend 서비스
# careti-src/services/
touch my-service.ts
touch my-service.test.ts
```

### 3. TDD 구현

#### 테스트 먼저
```typescript
// MyComponent.test.tsx
describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

#### 최소 구현
```typescript
// MyComponent.tsx
export const MyComponent: React.FC = () => {
  return <div>Expected Text</div>;
};
```

#### 리팩터링
- 타입 안전성 강화
- 스타일 분리
- 재사용성 개선

### 4. 통합
- 부모 컴포넌트에서 임포트
- 라우팅 설정 (필요 시)
- 상태 관리 연결

### 5. 문서화
- JSDoc 주석 추가
- 사용 예제 작성
- 스토리북 추가 (해당 시)

## 네이밍 규칙

### 파일명
- 컴포넌트: `PascalCase.tsx`
- 훅: `use-kebab-case.ts`
- 서비스: `kebab-case.ts`

### 내보내기
```typescript
// Named export 선호
export const MyComponent = () => { ... };

// Default export는 페이지/라우트용
export default MyPage;
```

## 디렉토리 구조

```
careti-src/
├── webview/
│   └── components/
│       └── MyComponent/
│           ├── MyComponent.tsx
│           ├── MyComponent.test.tsx
│           └── index.ts
└── services/
    └── my-service/
        ├── my-service.ts
        └── my-service.test.ts
```

## 체크리스트

- [ ] 테스트 파일 생성
- [ ] 컴포넌트 구현
- [ ] 테스트 통과
- [ ] 타입 정의 완료
- [ ] 문서화 완료
- [ ] 통합 테스트 통과

## 미러링 정책
`.agents/`와 `.users/`는 1:1 미러링 구조입니다.
- 이 파일 수정 시 `.agents/workflows/new-component.md`도 동일하게 업데이트
