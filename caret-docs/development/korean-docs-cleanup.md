# 한글 문서 정리 계획

## 현재 상태
- 영문 문서: `.caretrules/workflows/*.md` (AI용) + `caret-docs/development-en/*.md` (개발자용)
- 한글 문서: 중복 및 구버전 혼재

## 유지할 문서 (필수)
1. **caret-docs/development/caret-rules.ko.md** - 핵심 규칙 한글판
2. **README.ko.md** - 프로젝트 소개 한글판

## 삭제 가능한 문서 (중복/구버전)
1. **caret-compare/caret-docs/caretrules.ko.md** - 구버전
2. **caret-compare/caret-docs/strategy-archive/roadmap.ko.md** - 구버전
3. **caret-docs/strategy-archive/roadmap.ko.md** - 아카이브
4. **caret-docs.original/development/caret-rules.ko.md** - 백업본
5. **caret-docs.original/strategy-archive/roadmap.ko.md** - 백업본
6. **caret-main/caret-docs/caretrules.ko.md** - 서브모듈 내부
7. **caret-main/caret-docs/reports/experiment/sllm_test/experiment_results/*.ko.md** - 실험 결과
8. **caret-main/caret-docs/strategy-archive/roadmap.ko.md** - 서브모듈 내부
9. **caret-main/CHANGELOG.ko.md** - 서브모듈 내부
10. **caret-main/README.ko.md** - 서브모듈 내부

## 정리 방침
- **caret-main/** 내부 파일은 서브모듈이므로 건드리지 않음
- **caret-compare/, caret-docs.original/** 는 백업/비교용이므로 나중에 전체 삭제 가능
- 현재는 **caret-docs/** 내의 한글 문서만 정리

## 액션 아이템
1. ✅ t10 프로젝트 문서는 MD로 유지 결정
2. ✅ 영문 워크플로우는 이미 정리 완료
3. ⏳ 한글 문서는 caret-rules.ko.md 하나만 유지
4. ⏳ 나머지 한글 문서는 영문으로 통일