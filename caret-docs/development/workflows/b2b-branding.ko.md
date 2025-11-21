# B2B 브랜딩 워크플로우

Caret의 기업용 브랜딩 작업 절차와 핵심 원칙을 정의합니다. AI 개발자는 이 워크플로우를 반드시 숙지하고 따라야 합니다.

## 📜 핵심 원칙

### 1. 원본 불변 (Immutable Core)
`src/`, `caret-src/`, `proto/` 등 핵심 소스 파일은 **절대 직접 수정하지 않습니다.** 모든 브랜딩은 `slexn-codecenter` 서브모듈 내의 스크립트와 설정을 통해 관리됩니다.

### 2. 표면 수준 변경 한정 (Surface-Level Changes Only)
브랜딩은 내부 로직(함수명, 변수명 등)을 변경하는 작업이 **아닙니다.** 오직 사용자에게 직접 보이는 영역만을 대상으로 합니다:

- **UI 텍스트**: `webview-ui/src/caret/locale` 내의 언어 파일
- **에셋**: 로고, 아이콘, 이미지
- **메타데이터**: `package.json`의 `name`, `description`, `author` 등
- **VSCode 연동**: `package.json`의 `contributes` 섹션에 있는 명령어 및 메뉴 이름

## ⚙️ 시스템 설계

### 분리된 설정 모델
- **백엔드 (`brand-config.json`)**: `package.json` 메타데이터 및 `feature-config.json`과 같은 백엔드 관련 설정 변경을 관리합니다.
- **프론트엔드 (`brand-config-front.json`)**: `locale` 파일 내용 수정 및 `assets` 폴더 교체를 포함한 모든 프론트엔드 에셋 변경을 관리합니다.

### 블랙리스트 보호
핵심 파일(`*.proto`, `caret-scripts/` 등)은 변환에서 자동으로 제외되어 시스템 안정성을 보장합니다.

## 🛠️ 설정 파일 규칙

### `brand-config.json` (백엔드)
- **메타데이터 집중**: `package.json`의 사용자 가시 텍스트(`displayName`, `description`, `contributes`의 `title` 등)를 대상으로 합니다.
- **내부 로직 금지**: 함수명, 변수명 등 내부 코드 식별자를 절대 추가하지 마십시오.

### `brand-config-front.json` (프론트엔드)
- **언어 파일 매핑**: `webview-ui/src/caret/locale/` 파일 내의 텍스트 내용 수정을 위한 규칙을 정의합니다.
- **에셋 교체**: 스크립트가 루트 `/assets` 폴더를 브랜드별 폴더로 자동 교체하므로 별도 설정이 필요 없습니다.
- **파일 교체**: 필요한 경우 특정 UI 컴포넌트(`announcement.json` 등)에 대한 직접적인 파일 교체를 정의합니다.

## 🔄 절차

### 1단계: 분석
백엔드와 프론트엔드 모두에서 브랜드 변경이 필요한 모든 사용자 가시 영역을 식별합니다.

### 2단계: 설정
`brand-config.json` 및 `brand-config-front.json`을 설정 규칙에 따라 수정합니다.

### 3단계: 실행 (OS 무관)

**프로젝트 루트에서 실행** (권장):

```bash
# 현재 브랜드 확인
npm run brand:status

# CodeCenter로 변환
npm run brand:codecenter

# 테스트 변환 (실제 변경 안함, dry-run)
npm run brand:codecenter:dry

# Caret으로 복원
npm run brand:caret

# Cline으로 복원
npm run brand:cline
```

**대안: slexn-codecenter 디렉토리에서 실행**:

```bash
cd slexn-codecenter
npm run brand:status
npm run brand:codecenter
```

**이 npm 스크립트들은 모든 운영체제에서 동작합니다** (Windows, Mac, Linux).

### 4단계: 검증
`npm run compile` 단계가 오류 없이 완료되는지 확인합니다.

### 5단계: 커밋
`slexn-codecenter` 서브모듈 내에서만 변경 사항을 커밋합니다.

---

**버전 4**: 이 문서는 분리된 백엔드/프론트엔드 설정 모델과 OS 무관 실행 방법을 반영하도록 업데이트되었습니다. 이는 AI 개발자에게 더 큰 명확성을 제공하고 단일 설정 파일이나 플랫폼별 명령어에 대한 잘못된 가정으로 인한 오류를 방지합니다.
