---
title: "캐러티 문서 대규모 업데이트 마스터 플랜"
description: "Cline v3.38.1 머지 이후 캐러티 매뉴얼(MDX) 전반을 최신화하기 위한 목적, 기준, 절차, 진행 상태를 한 곳에 정리한 문서"
---

## 1) 작업 취지
- Cline 최신 변경을 캐러티 매뉴얼에 반영하면서, 캐러티 전용 정책/제한/브랜딩을 명확히 구분해 누락 없이 기록합니다.
- 이후 업데이트 시 이 문서만 봐도 동일한 절차로 이어서 진행할 수 있도록 합니다.

## 2) 기준 브랜치 및 출처
- 기준: `careti-main`(현행) ↔ `cline-latest`(업스트림) diff, 대상은 `docs/` 이하 MDX 전부.
- 참조 문서: `docs/merging/update-strategy.mdx`, `docs/merging/careti-docs-playbook.mdx`, `docs/merging/careti-diff-summary-2025-11-23.md`.

## 3) 브랜딩/정책 원칙
- 명칭: 기본 “캐러티(Careti)” 병기, 기능 출처 강조 필요 시 “Cline” 그대로 두고 `<Note>`로 캐러티 차이 설명.
- 캐러티 전용 `<Note>`에 포함할 항목: 지원/차단 모델(지역·계정·요금제), 인증·라우팅(캐러티 라우터/로컬 경로), UI/스토어 차이(지원 에디터/버전), 텔레메트리/로그 정책.
- 문구는 짧게, 원문 유지 + 캐러티 차이만 추가.

## 4) 대상 범위 및 우선순위
1. 온보딩/소개: `docs/introduction/*`, `docs/getting-started/*`
2. 모델·프로바이더: `docs/model-config/*`, `docs/provider-config/*`, `docs/running-models-locally/*`
3. 기능: `docs/features/*` (Cline Rules, 멀티루트, 커스터마이징, Task/Slash Commands 등)
4. 엔터프라이즈/정책: `docs/enterprise-solutions/*`, `docs/more-info/telemetry`
5. 네비/메타: `docs/docs.json`, `docs/styles.css`, 에셋 경로

## 5) 진행 상태(요약)
- 완료: 전역 가이드/플레이북/차이요약 작성, 캐러티 `<Note>` 추가(Introduction Overview, Installing, Selecting Model, Your First Project, Anthropic, OpenAI, OpenRouter, Baseten, Mistral, Claude Code, Cerebras, Multiroot, Tasks Overview, Sidebar, Model Comparison, Context Windows, Local Models Overview, LM Studio, Ollama, Enterprise Overview/Security, Telemetry, Cline Rules, Hooks, Dictation).
- 미완: 남은 모델·프로바이더(기타 세부), 기능/엔터프라이즈 세부 최신 내용 반영, 텍스트 본문 업스트림 최신화.
  - 문서화 보조: `docs/merging/careti-policy-reference.mdx`와 `docs/merging/careti-policy-reference.md`로 캐러티 정책/차이 근거 정리 (F01~F12, 브랜딩/계정/Agent Standardization/프롬프트/페르소나/피쳐 토글/프로바이더 세팅/입력 히스토리/지식 패리티 등).

## 6) 작업 절차 체크리스트
- [x] `git diff careti-main..cline-latest -- docs/<path>`로 대상 확인 후 파일 단위로 진행.
- [x] 캐러티 전용 `<Note>` 삽입(지원/차단, 인증/라우팅, 브랜딩 차이).
- [ ] 내용 최신화: 업스트림 변경(새 섹션/카드/경고 등) 복사 후 캐러티 주석 추가.
- [ ] 네비 반영: 새 문서 추가 시 `docs/docs.json` 갱신, 필요 시 리디렉션 추가.
- [ ] 검증: 로컬 프리뷰(`npm run docs` 등)로 링크/앵커/에셋 확인.
- [ ] 기록: `docs/work-log/2025-11-23.md`에 처리/미처리/TODO 갱신.

## 7) 캐러티 전용 정책 placeholder (확인 필요)
- 모델: 어떤 모델이 캐러티에서 차단/제한인지(예: 지역/계정/요금제) → 각 프로바이더 문서에 `<Note>`.
- 인증/라우팅: 캐러티 전용 라우터/로컬 엔드포인트/조직 정책 → 온보딩/프로바이더/엔터프라이즈에 반영.
- 텔레메트리: 로깅/비밀 관리/옵트아웃 정책 → `more-info/telemetry`에 보강.
- 브랜딩/스토어: 지원 IDE/스토어(혹은 미지원)와 UI 레이블 차이 → 온보딩/커스터마이징/CLI에 병기.

## 8) 다음 액션(실무)
- 온보딩/기타: 남은 새/누락 문서에 캐러티 `<Note>` 추가.
- 모델/프로바이더: `model-config/*`, `provider-config/*`(기타 세부), `running-models-locally/*` 본문 최신화 + 캐러티 제한 주석.
- 기능/정책: `features/*`(Cline Rules 외 세부, Dictation, Hooks, Tasks/Slash Commands 등)와 `enterprise-solutions/*`, `more-info/telemetry` 본문 최신화 및 캐러티 정책 기입.
- 프리뷰 검증: 문서 대량 수정 후 `npm run docs` 실행해 링크/앵커 체크.
