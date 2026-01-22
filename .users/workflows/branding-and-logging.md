# 브랜딩 및 로깅 워크플로우

Caret 브랜딩 적용 및 로깅 시스템 구현 가이드입니다.

## 브랜딩 시스템

### 브랜드 유틸리티
`careti-src/utils/brand-utils.ts` 사용:
```typescript
import { getBrandName, getBrandPath } from '@/utils/brand-utils';

// 브랜드 이름 가져오기
const name = getBrandName(); // "Careti" 또는 설정된 브랜드

// 브랜드 경로 가져오기
const path = getBrandPath(); // ".caret" 또는 설정된 경로
```

### 브랜딩 규칙
- 하드코딩 금지
- 항상 유틸리티 함수 사용
- B2B 커스터마이징 지원

### UI 브랜딩
- 로고 이미지 경로
- 색상 테마
- 표시 이름

## 로깅 시스템

### Logger 사용
```typescript
import { Logger } from '@/services/logging/Logger';

Logger.info('작업 시작');
Logger.debug('디버그 정보', { data });
Logger.warn('경고 메시지');
Logger.error('에러 발생', error);
```

### 로깅 레벨
1. **error**: 에러 및 예외
2. **warn**: 경고 상황
3. **info**: 중요 정보
4. **debug**: 디버깅용 상세 정보

### 로깅 규칙
- 민감 정보 로깅 금지
- 토큰/비밀번호 마스킹
- 적절한 레벨 사용

## B2B 브랜딩

### 설정 파일
```json
{
  "brand": {
    "name": "CustomBrand",
    "path": ".custombrand",
    "logo": "path/to/logo.png"
  }
}
```

### 변환 워크플로우
1. 브랜드 설정 파일 생성
2. 유틸리티 함수로 참조
3. 빌드 시 적용

## 체크리스트

### 브랜딩
- [ ] 하드코딩된 브랜드명 없음
- [ ] 유틸리티 함수 사용
- [ ] B2B 커스터마이징 지원

### 로깅
- [ ] 적절한 로그 레벨 사용
- [ ] 민감 정보 마스킹
- [ ] 디버깅에 유용한 정보 포함

## 미러링 정책
`.agents/`와 `.users/`는 1:1 미러링 구조입니다.
- 이 파일 수정 시 `.agents/workflows/branding-and-logging.md`도 동일하게 업데이트
