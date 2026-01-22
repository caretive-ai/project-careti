# 워크로그 작성 가이드

## 📋 워크로그 작성 표준

### 🎯 기본 원칙

1. **작업 상태 구분**
   - `doing`: 현재 진행 중인 작업
   - `done`: 완료된 작업 (완료 날짜 포함)

2. **완료 날짜 표기**
   - done 섹션 항목: `YYYY-MM-DD 완료: [작업명]`

3. **파일 네이밍 규칙**
   - 작업 완료 후 보고서: `YYYY-MM-DD-작업명-complete.md`
   - 작업 중 todo: `YYYY-MM-DD-작업명-todo.md`

---

## 📝 파일 구조 예시

### 작업 완료 보고서

```markdown
# [작업명] - [완료 날짜]

## 📋 개요

**작업 기간**: [시작일] ~ [종료일]
**작업 시간**: X시간
**작업자**: Luke

---

## 📊 작업 내용

### [부문 1] - 완료 날짜: YYYY-MM-DD
- [ ] 작업 내용 1
- [ ] 작업 내용 2
- [ ] 작업 내용 3

### [부문 2] - 완료 날짜: YYYY-MM-DD
- [ ] 작업 내용 1
- [ ] 작업 내용 2

---

## ✅ 완료 항목

### 2025-01-14 완료:
- [x] GLM-4.7 모델 반영
- [x] Claude 3.5 Haiku 이미지 지원
- [x] Gemini thinking 지원

### 2025-01-15 완료:
- [x] /init 컨텍스트 분리
- [x] 이미지 툴 개선

---

## 🚧 진행 중 (Doing)

### [작업명 A]
- [ ] 서브 작업 1
- [ ] 서브 작업 2
- [ ] 서브 작업 3

### [작업명 B]
- [ ] 서브 작업 1
- [ ] 서브 작업 2

---

## 📚 참고 문서

- [관련 문서 링크 1]
- [관련 문서 링크 2]
```

---

## 🔧 실제 적용 예시

### 기존 방식 (분석 문서)
```
careti-docs/work-logs/luke/complete/
├── m03-image-tool-detailed-analysis.md      # 분석 보고서 (doing 상태)
├── cherry-pick-vs-squash-merge-analysis.md  # 분석 보고서 (done 상태)
└── urgent-improvements-todo-20260114.md  # TODO 목록 (doing 상태)
```

### 권장 방식 (세션별)

#### Session 시작 시
```
careti-docs/work-logs/luke/session/
└── 2025-01-14-session-todo.md          # 세션 TODO
```

#### 작업 완료 시
```
careti-docs/work-logs/luke/complete/
└── 2025-01-14-urgent-improvements.md   # 완료 보고서
```

#### 완료 보고서 구조
```markdown
# 급한 개선 사항 - 2025-01-14 완료

## 📋 개요

**작업 기간**: 2025-01-14
**작업 시간**: 1일
**작업자**: Luke

---

## 📊 분석 내용

### M01: GLM-4.7 모델 반영
**상태**: ✅ 완료
**완료 시간**: 2025-01-14

### M02: /init 컨텍스트 분리
**상태**: ✅ 완료
**완료 시간**: 2025-01-14

---

## 🚧 다음 작업 (Doing)

- [ ] 이미지 툴 개선 (M03)
- [ ] 서버측 GLM-4.7 반영 요청

---

## 📚 참고

- `m03-image-tool-detailed-analysis.md`
- `cherry-pick-vs-squash-merge-analysis.md`
```

---

## ✅ 체크리스트

### 파일 네이밍
- [ ] 분석 보고서: `YYYY-MM-DD-작업명-analysis.md`
- [ ] TODO 목록: `YYYY-MM-DD-작업명-todo.md`
- [ ] 완료 보고서: `YYYY-MM-DD-작업명-complete.md`

### 워크로그 구조
- [ ] doing 섹션: 현재 진행 중인 작업
- [ ] done 섹션: 완료된 작업 (YYYY-MM-DD 완료: [작업명])
- [ ] 참고 문서: 관련 링크 포함

---

**작성자**: Luke
**작성일**: 2025-01-14
**문서 유형**: 워크로그 작성 가이드
