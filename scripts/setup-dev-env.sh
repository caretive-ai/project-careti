#!/bin/bash

# Caret 개발 환경 설정 스크립트 (Linux/macOS)
# 이 스크립트는 Node.js 20 설치, 의존성 설치, 빌드 테스트를 자동으로 수행합니다.

set -e  # 오류 발생 시 스크립트 중단

echo "🚀 Caret 개발 환경 설정을 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수: 로그 출력
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 운영체제 확인
OS=$(uname -s)
if [[ "$OS" == "MINGW"* ]] || [[ "$OS" == "MSYS"* ]] || [[ "$OS" == "CYGWIN"* ]]; then
    log_error "이 스크립트는 Linux/macOS용입니다. 윈도우에서는 scripts/setup-dev-env.bat를 사용하세요."
    exit 1
fi

# 1. Node.js 버전 확인
log_info "Node.js 버전을 확인합니다..."
CURRENT_NODE_VERSION=$(node --version 2>/dev/null || echo "not_installed")

if [[ "$CURRENT_NODE_VERSION" == "not_installed" ]]; then
    log_warning "Node.js가 설치되어 있지 않습니다."
    NEED_NODE_UPDATE=true
elif [[ "$CURRENT_NODE_VERSION" =~ ^v1[0-9]\. ]] || [[ "$CURRENT_NODE_VERSION" =~ ^v1[0-2]\. ]]; then
    log_warning "Node.js 버전이 너무 낮습니다: $CURRENT_NODE_VERSION (20.x 필요)"
    NEED_NODE_UPDATE=true
else
    log_success "Node.js 버전 확인됨: $CURRENT_NODE_VERSION"
    NEED_NODE_UPDATE=false
fi

# 2. Node.js 업데이트 (필요시)
if [[ "$NEED_NODE_UPDATE" == "true" ]]; then
    log_info "Node.js 20을 설치합니다..."
    
    # npm_config_prefix 환경 변수 해제 (nvm 호환성 문제 해결)
    unset npm_config_prefix
    
    # nvm 설치 확인
    if ! command -v nvm &> /dev/null; then
        log_info "nvm을 설치합니다..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    else
        # nvm이 이미 설치되어 있으면 로드
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    fi
    
    # Node.js 20 설치
    log_info "Node.js 20을 설치합니다..."
    nvm install 20
    nvm use 20
    
    # .nvmrc 파일이 있으면 자동으로 해당 버전 사용
    if [[ -f ".nvmrc" ]]; then
        log_info ".nvmrc 파일을 사용하여 Node.js 버전을 설정합니다..."
        nvm use
    fi
    
    log_success "Node.js 업데이트 완료: $(node --version)"
fi

# 3. npm 버전 확인
log_info "npm 버전을 확인합니다..."
npm --version

# 4. 의존성 설치
log_info "프로젝트 의존성을 설치합니다..."
npm run install:all

# 5. Protocol Buffer 컴파일
log_info "Protocol Buffer를 컴파일합니다..."
npm run protos

# 6. TypeScript 컴파일 테스트
log_info "TypeScript 컴파일을 테스트합니다..."
npm run compile

# 7. WebView UI 빌드 테스트
log_info "WebView UI 빌드를 테스트합니다..."
npm run build:webview

log_success "🎉 Caret 개발 환경 설정이 완료되었습니다!"
echo ""
echo "다음 명령어로 개발을 시작할 수 있습니다:"
echo "  npm run watch          # 개발 모드 (자동 컴파일)"
echo "  npm run compile        # 수동 컴파일"
echo "  npm run package:release # VSIX 패키지 생성"
echo ""
echo "VS Code에서 F5를 눌러 확장 프로그램을 테스트하세요!" 