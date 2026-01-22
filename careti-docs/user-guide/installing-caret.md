---
title: "Careti 설치하기"
description: "VS Code에서 Careti을 설치하고 초기 설정을 완료하는 단계별 가이드입니다."
---

# Careti 설치하기

Careti 설치는 간단합니다. 이 가이드는 설치 과정과 초기 설정을 단계별로 안내합니다.

## 사전 준비

설치 전에 아래 항목을 확인하세요.

- **VS Code**: 1.80.0 이상
- **Node.js**: 18 이상 (개발 빌드용)
- **Git**: 저장소 클론용

## 설치 방법

### 방법 1: VSIX로 설치 (권장)

1. **최신 릴리즈 다운로드**
    - [Careti GitHub 릴리즈 페이지](https://github.com/aicoding-careti/careti/releases)로 이동
    - 최신 `.vsix` 파일 다운로드

2. **VS Code에 설치**

    ```bash
    code --install-extension careti-*.vsix
    ```

    또는 VS Code UI로 설치:
    - VS Code 열기
    - `Ctrl+Shift+P`(Windows/Linux) 또는 `Cmd+Shift+P`(Mac)
    - "확장: VSIX에서 설치" 검색
    - 다운로드한 `.vsix` 파일 선택

### 방법 2: 소스 빌드로 설치

최신 기능 확인 또는 개발 목적이라면 다음을 따릅니다.

1. **저장소 클론**

    ```bash
    git clone https://github.com/aicoding-careti/careti.git
    cd careti
    ```

2. **의존성 설치**

    ```bash
    npm install
    cd webview-ui && npm install && cd ..
    ```

3. **확장 빌드**

    ```bash
    npm run protos
    npm run compile
    ```

4. **패키징 및 설치**
    ```bash
    npm run package
    code --install-extension careti-*.vsix
    ```

## 초기 설정

### 1. Careti 열기

설치 후 VS Code 사이드바에 Careti 아이콘이 나타납니다. 클릭하여 Careti 패널을 여세요.

### 2. AI 프로바이더 설정

Careti은 Cline과 동일한 프로바이더를 지원합니다.

- **Anthropic (Claude)**
- **OpenAI (GPT-4)**
- **Google (Gemini)**
- **Local models (Ollama, LM Studio)**
- **기타 다양한 모델 지원**

Careti 패널의 설정 아이콘을 눌러 원하는 프로바이더를 설정하세요.

### 3. 페르소나 선택 (선택)

Careti의 고유 기능 중 하나는 AI 페르소나 시스템입니다.

1. Careti 패널에서 페르소나 선택기를 찾습니다.
2. 아래 페르소나 중 선택합니다:
    - **오사랑 (Oh Sarang)** - 감성 지능 강조 K-pop 아이돌 콘셉트
    - **마도베 이치카 (Madobe Ichika)** - Windows 감성의 효율 지향
    - **사이안 매킨 (Cyan Mackin)** - macOS 감성의 미니멀리즘
    - **탄도 우분투 (Thando Ubuntu)** - Ubuntu 감성의 협업 지향

### 4. 규칙 설정 (선택)

Careti의 규칙 관리는 충돌을 방지합니다.

- 프로젝트 루트에 `.agents/context/` 디렉토리를 만들고 규칙 파일을 추가합니다.
- 한 번에 하나의 규칙 파일만 활성화됩니다.

## 확인 절차

설치가 정상인지 확인하려면 다음을 수행합니다.

1. VS Code에서 프로젝트를 엽니다.
2. 사이드바의 Careti 아이콘을 클릭합니다.
3. "안녕 Careti!" 같은 간단한 메시지를 입력합니다.
4. 선택한 AI 프로바이더의 응답이 표시되면 정상입니다.

## 문제 해결

### 확장이 보이지 않는 경우

- VS Code를 재시작합니다.
- 확장 패널에서 Careti이 활성화되어 있는지 확인합니다.
- VS Code 버전 호환성을 확인합니다.

### Build Issues

If building from source fails:

```bash
# Clean and rebuild
npm run clean
npm install
npm run protos
npm run compile
```

### API Configuration Issues

- Verify your API keys are correctly set
- Check your internet connection
- Ensure your chosen provider's API is accessible

## Next Steps

Now that Careti is installed:

- Read about [Careti's unique features](./careti-features)
- Learn about [rule management](./rule-management)
- Explore [persona customization](./persona-system)
- Check out [task management](./task-management)

## Getting Help

If you encounter issues:

- Check the [FAQ](./faq)
- Visit our [GitHub Issues](https://github.com/aicoding-careti/careti/issues)
- Join our community discussions

Welcome to Careti! Your enhanced AI coding companion is ready to help you build amazing things. ✨
