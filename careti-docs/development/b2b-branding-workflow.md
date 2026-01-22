# B2B 브랜딩 워크플로우 - 외부 에셋 가이드

## 핵심 원칙
메인 Careti 저장소는 브랜드에 구애받지 않아야 합니다. 모든 B2B 브랜딩 관련 로직, 자산, 설정은 **별도의 비공개 저장소**(예: `careti-b2b-assets`)에서 관리합니다. 이 자산들은 메인 공개 저장소에 커밋되어서는 안 됩니다.

## 1. 사전 작업: 에셋 확보
브랜딩 작업을 시작하기 전에, 비공개 B2B 에셋 저장소가 로컬에 준비되어 있는지 확인해야 합니다.

- **1단계**: 에셋 디렉토리(예: `slexn-codecenter`)가 현재 작업 공간에 있는지 확인합니다. 이 디렉토리는 `.gitignore`에 포함되어 있어야 합니다.
- **2단계**: 디렉토리가 없다면, 마스터께서 직접 비공개 B2B 에셋 저장소를 현재 작업 공간으로 클론해야 합니다. AI 에이전트는 비공개 저장소에 접근할 자격 증명이 없습니다.

**확인 예시**:
```bash
# 에셋 디렉토리 존재 여부 확인
ls slexn-codecenter
```

## 2. 브랜드 전환 시스템

### 실행 방법
프로젝트 루트에서 로컬 B2B 에셋 디렉토리 내의 스크립트를 **직접 Node.js로 실행**합니다:
```bash
# 전체 전환
node slexn-codecenter/tools/brand-converter.js codecenter --all

# 드라이런 (시뮬레이션)
node slexn-codecenter/tools/brand-converter.js codecenter --all --dry-run
```

### 전환 프로세스 개요
전환 스크립트(`brand-converter.js`)는 다음과 같은 모든 필요한 변경사항을 처리합니다:
- 메타데이터 교체 (`package.json` 등)
- i18n 로케일 파일 업데이트
- 에셋 및 아이콘 교체
- 설정 조정

스크립트 기능에 대한 자세한 내용은 비공개 B2B 에셋 저장소 내의 문서를 참조하세요.

## 3. 사후 작업: 정리 (권장)
보안을 위해, 브랜딩 작업이 완료된 후에는 로컬 B2B 에셋 디렉토리를 삭제하는 것을 권장합니다.

## 4. 주요 파일 위치 (B2B 에셋 디렉토리 내)

- **메인 엔진**: `slexn-codecenter/tools/brand-converter.js`
- **설정**: `slexn-codecenter/brands/brand-config.json`
- **에셋**: `slexn-codecenter/brands/assets/`
