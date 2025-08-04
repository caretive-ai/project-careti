@echo off
setlocal enabledelayedexpansion
REM Caret 개발 환경 설정 스크립트 (Windows)
REM 이 스크립트는 Node.js 20 설치, 의존성 설치, 빌드 테스트를 자동으로 수행합니다.

echo 🚀 Caret 개발 환경 설정을 시작합니다...

REM 1. Node.js 버전 확인
echo ℹ️  Node.js 버전을 확인합니다...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Node.js가 설치되어 있지 않습니다.
    goto :install_node
)

for /f "tokens=*" %%i in ('node --version') do set CURRENT_NODE_VERSION=%%i
echo ✅ Node.js 버전 확인됨: %CURRENT_NODE_VERSION%

REM Node.js 버전 체크 (20.x 미만이면 업데이트)
for /f "tokens=2 delims=v." %%a in ("%CURRENT_NODE_VERSION%") do set MAJOR_VERSION=%%a
if %MAJOR_VERSION% lss 20 (
    echo ⚠️  Node.js 버전이 너무 낮습니다: %CURRENT_NODE_VERSION% (20.x 필요)
    goto :install_node
)

goto :continue_setup

:install_node
echo ℹ️  Node.js 20을 설치합니다...

REM nvm-windows 설치 확인
nvm version >nul 2>&1
if %errorlevel% neq 0 (
    echo ℹ️  nvm-windows를 설치합니다...
    echo.
    echo 📥 nvm-windows를 다운로드하고 설치하세요:
    echo https://github.com/coreybutler/nvm-windows/releases
    echo.
    echo 설치 후 이 스크립트를 다시 실행하세요.
    pause
    exit /b 1
)

echo ℹ️  Node.js 20을 설치합니다...
nvm install 20.19.4
nvm use 20.19.4

REM .nvmrc 파일이 있으면 해당 버전 사용
if exist ".nvmrc" (
    echo ℹ️  .nvmrc 파일을 사용하여 Node.js 버전을 설정합니다...
    for /f "tokens=*" %%i in (.nvmrc) do (
        nvm use %%i
        if !errorlevel! neq 0 (
            echo ⚠️  .nvmrc 버전 사용 실패, 기본 버전 사용
            nvm use 20.19.4
        )
    )
)

echo ✅ Node.js 업데이트 완료
node --version

:continue_setup

REM 2. npm 버전 확인
echo ℹ️  npm 버전을 확인합니다...
npm --version

REM 3. 의존성 설치
echo ℹ️  프로젝트 의존성을 설치합니다...
call npm run install:all

REM 4. Protocol Buffer 컴파일
echo ℹ️  Protocol Buffer를 컴파일합니다...
call npm run protos

REM 5. TypeScript 컴파일 테스트
echo ℹ️  TypeScript 컴파일을 테스트합니다...
call npm run compile

REM 6. WebView UI 빌드 테스트
echo ℹ️  WebView UI 빌드를 테스트합니다...
call npm run build:webview

echo.
echo ✅ 🎉 Caret 개발 환경 설정이 완료되었습니다!
echo.
echo 다음 명령어로 개발을 시작할 수 있습니다:
echo   npm run watch          # 개발 모드 (자동 컴파일)
echo   npm run compile        # 수동 컴파일
echo   npm run package:release # VSIX 패키지 생성
echo.
echo VS Code에서 F5를 눌러 확장 프로그램을 테스트하세요!
pause 