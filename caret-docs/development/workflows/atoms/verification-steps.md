모든 변경사항 후 필수 검증 시퀀스를 따르고 있습니다.

<detailed_sequence_of_steps>
# 검증 단계 - Test → Compile → Execute 시퀀스

## 핵심 원칙
**모든 변경사항은 완료 전에 세 가지 검증 단계를 모두 통과해야 함**

## 1단계: 테스트 검증
**변경 범위에 따라 적절한 테스트 실행**

### Backend 변경사항:
```bash
# 빠른 backend 관련 테스트
npm run test:webview  # webview 변경사항의 경우
# 참고: test:backend는 계획되어 있지만 아직 구현되지 않음
```

### 전체 테스트 커버리지:
```bash
# 포괄적인 테스트가 필요한 경우
npm run test:all
npm run test:coverage  # 커버리지 분석용
```

### 테스트 요구사항:
- [ ] 기존 테스트가 모두 통과함
- [ ] 새 기능에 테스트가 있음 (`/tdd-cycle` 준수)
- [ ] 테스트 실패나 경고가 없음

## 2단계: 컴파일 검증  
**TypeScript 컴파일이 성공하는지 확인**

```bash
# 기본 컴파일 확인
npm run compile

# 타입 검사
npm run check-types

# Protocol buffer 생성 (proto 파일 변경 시)
npm run protos
```

### 컴파일 요구사항:
- [ ] TypeScript 오류 없음
- [ ] 모든 타입 정의가 유효함
- [ ] import/export 구문이 올바름
- [ ] Protocol buffer가 성공적으로 생성됨 (해당되는 경우)

## 3단계: 실행 검증
**실행 환경에서 실제 기능 테스트**

### 개발 테스트:
```bash
# 개발 환경 시작
npm run watch
# VSCode에서 F5를 눌러 확장 실행
```

### 수동 검증 체크리스트:
- [ ] 확장이 오류 없이 로드됨
- [ ] 새 기능이 예상대로 작동함  
- [ ] 기존 기능이 영향받지 않음
- [ ] 콘솔 오류나 경고가 없음
- [ ] UI가 올바르게 렌더링됨 (해당되는 경우)

## 실패 대응 프로토콜

### 테스트 실패 시:
1. **진행하지 마세요** - 테스트 문제를 먼저 수정
2. 특정 실패에 대한 테스트 출력 검토
3. 수정을 위해 `/tdd-cycle` 원칙 적용

### 컴파일 실패 시:
1. **진행하지 마세요** - TypeScript 오류 해결
2. import 경로와 타입 정의 확인
3. 필요시 proto 파일 재생성

### 실행 실패 시:
1. **진행하지 마세요** - 런타임 문제 디버그
2. 브라우저 콘솔에서 오류 확인
3. 확장 활성화 및 기능 검증

## 수정 시스템과의 통합
**`/modification-protocol` (L2 수정) 사용 시:**
- 검증 실패 시: 원본 코드로 되돌리기
- 문제 수정 후 검증 시퀀스 재시도
- 검증 실패한 변경사항은 절대 커밋하지 않음

## 관련 워크플로우
- `/tdd-cycle` 완료의 필수 부분
- 모든 `/modification-levels`에 필수
- 안전한 실험을 위해 `/modification-protocol` 사용
</detailed_sequence_of_steps>

<general_guidelines>
이 검증 시퀀스는 손상된 코드가 커밋되거나 배포되는 것을 방지합니다.

3단계 접근법은 적절한 단계에서 서로 다른 유형의 문제를 포착합니다.

검증을 건너뛰지 마세요 - 문제를 조기에 발견해서 시간을 절약해줍니다.
</general_guidelines>