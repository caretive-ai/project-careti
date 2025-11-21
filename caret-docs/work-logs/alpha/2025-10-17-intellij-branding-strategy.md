# IntelliJ Plugin 브랜딩 전략

**작성일**: 2025-10-17  
**작성자**: Alpha Yang  
**상태**: 아키텍처 설계

## 🎯 핵심 이슈

**마스터 지시사항**:
- ✅ "작업원칙은 vs-code버전 영향최소화 하기야. 이해했어?"
- ⚠️ "caret-b2b의 브랜딩 전환 레포하고 어떻게 할지 생각해줘"
- 💼 "다른 브랜드에서도 원하시거든? 사실 b2b니즈라서"

## 🔍 문제 분석

### 현재 caret-b2b 브랜딩 시스템

**VSCode Extension 브랜딩 (현재)**:
```bash
# 브랜드 전환 스크립트
npm run brand:codecenter  # Caret → CodeCenter
npm run brand:caret       # CodeCenter → Caret
npm run brand:status      # 현재 브랜드 확인
```

**변환 대상 파일들**:
```
VSCode Extension:
├── package.json           # displayName, description, contributes
├── webview-ui/src/caret/locale/  # 다국어 텍스트
├── assets/                # 로고, 아이콘, 배너
└── feature-config.json    # 기능 설정
```

### IntelliJ Plugin 브랜딩 요구사항

**B2B 니즈**:
- CodeCenter: IntelliJ 버전 필요 (기업 고객)
- 향후 다른 브랜드들도 IntelliJ 지원 요청 예상
- VSCode와 동일한 브랜딩 일관성 유지

**브랜딩 변환 필요 파일들**:
```
IntelliJ Plugin:
├── src/main/resources/META-INF/
│   └── plugin.xml         # name, description, vendor (= package.json)
├── src/main/resources/
│   ├── messages/          # 다국어 리소스 번들 (= locale/)
│   └── icons/             # 아이콘 파일들 (= assets/icons/)
└── gradle.properties      # version, pluginName
```

## 💡 해결 방안: 통합 브랜딩 시스템 (VSCode + IntelliJ)

### ✅ 기존 caret-b2b 시스템 확장 (권장)

**핵심 원칙**:
- ✅ **하나의 caret-b2b가 VSCode + IntelliJ 모두 관리**
- ✅ **하나의 명령으로 두 플랫폼 동시 브랜딩 전환**
- ✅ **브랜드 에셋(로고, 아이콘) 공유**

**장점**:
- 브랜드 일관성 보장
- 휴먼 에러 최소화
- 중복 작업 제거

**구조**:
```
caret-b2b/ (기존 시스템 확장)
├── brands/
│   └── codecenter/
│       ├── brand-config.json           # VSCode 백엔드 설정 (기존)
│       ├── brand-config-front.json     # VSCode 프론트엔드 설정 (기존)
│       ├── brand-config-intellij.json  # IntelliJ 설정 (NEW)
│       └── assets/                      # 공통 에셋 (VSCode + IntelliJ 공유)
└── scripts/
    ├── brand-converter.js              # VSCode 브랜딩 (기존)
    └── brand-converter-intellij.js     # IntelliJ 브랜딩 (NEW)
```

**brand-config-intellij.json 예시**:
```json
{
  "brandName": "codecenter",
  "metadata": {
    "pluginName": "CodeCenter",
    "pluginId": "com.slexn.codecenter",
    "vendor": "Slexn Inc.",
    "description": "AI-powered coding assistant for IntelliJ",
    "version": "1.0.0"
  },
  "locale": {
    "patterns": [
      {
        "file": "messages/CaretBundle.properties",
        "replacements": {
          "app.name=Caret": "app.name=CodeCenter",
          "app.description=AI Coding Assistant": "app.description=Enterprise AI Coding Platform"
        }
      }
    ]
  },
  "assets": {
    "source": "../assets",
    "target": "src/main/resources/icons",
    "mappings": {
      "icon.svg": "codecenter-icon.svg",
      "pluginIcon.svg": "pluginIcon.svg"
    }
  }
}
```

**실행 방법 (기존 시스템과 동일)**:
```bash
# caret-b2b에서 실행 (VSCode + IntelliJ 동시 브랜딩)
cd caret-b2b
npm run brand:codecenter          # 둘 다 동시 변환 ⭐
npm run brand:codecenter:vscode   # VSCode만 (선택적)
npm run brand:codecenter:intellij # IntelliJ만 (선택적)
npm run brand:caret               # 둘 다 Caret로 복귀
npm run brand:status              # 현재 브랜드 상태 (VSCode + IntelliJ)
```

**예상 출력**:
```bash
$ npm run brand:codecenter
✅ VSCode branding: Caret → CodeCenter
   - package.json updated
   - locale files updated
   - assets copied
✅ IntelliJ branding: Caret → CodeCenter
   - plugin.xml updated
   - messages/*.properties updated
   - icons copied
✨ Branding complete: Both platforms are now CodeCenter!
```

## ✅ 최종 아키텍처: 통합 브랜딩 시스템

### VSCode 영향 최소화 원칙 준수

**✅ 완전 독립 구조**:
```
caret/                          # VSCode 메인 레포 (영향 없음)
├── src/
├── webview-ui/
└── caret-b2b/                  # VSCode 브랜딩 (기존)
    └── scripts/brand-converter.js

caret-intellij-plugin/          # IntelliJ 분리 레포 (영향 없음)
├── src/
└── caret-b2b-intellij/         # IntelliJ 브랜딩 (NEW)
    └── scripts/brand-converter-intellij.js
```

**디렉토리 구조 (실제 구현)**:
```
/Users/luke/dev/
├── caret/                          # VSCode extension
│   └── caret-b2b/                  # Git submodule (브랜딩 시스템)
│       ├── brands/codecenter/
│       │   ├── brand-config.json
│       │   ├── brand-config-front.json
│       │   ├── brand-config-intellij.json  # IntelliJ 설정
│       │   └── assets/              # 공통 에셋
│       └── scripts/
│           ├── brand-converter.js          # VSCode 브랜딩
│           └── brand-converter-intellij.js # IntelliJ 브랜딩
└── caret-intellij-plugin/          # IntelliJ plugin
    └── caret-b2b/                  # Git submodule (동일한 레포)
```

**Git Submodule 연결 (동일한 caret-b2b)**:
```bash
# caret 레포에서 (이미 설정됨)
cd /Users/luke/dev/caret
git submodule add https://github.com/aicoding-caret/caret-b2b

# caret-intellij-plugin 레포에서 (동일한 레포 연결)
cd /Users/luke/dev/caret-intellij-plugin
git submodule add https://github.com/aicoding-caret/caret-b2b
```

**핵심**: 두 레포 모두 **동일한 caret-b2b를 submodule로 사용** ✨

### 브랜딩 워크플로우 (개발자 관점)

**시나리오 1: CodeCenter 브랜드로 전환**
```bash
# caret-b2b에서 한 번만 실행
cd caret-b2b
npm run brand:codecenter

# 결과:
# ✅ /Users/luke/dev/caret (VSCode) → CodeCenter로 변환
# ✅ /Users/luke/dev/caret-intellij-plugin (IntelliJ) → CodeCenter로 변환
```

**시나리오 2: Caret 브랜드로 복귀**
```bash
cd caret-b2b
npm run brand:caret

# 결과:
# ✅ VSCode + IntelliJ 둘 다 Caret로 복귀
```

**시나리오 3: 새 브랜드 추가**
```bash
# caret-b2b 레포에서 작업
cd caret-b2b/brands/
mkdir slexn
cp -r codecenter/* slexn/

# 3개 설정 파일 수정
vim slexn/brand-config.json           # VSCode 백엔드
vim slexn/brand-config-front.json     # VSCode 프론트엔드
vim slexn/brand-config-intellij.json  # IntelliJ

# 에셋 교체
cp -r ~/Downloads/slexn-assets/* slexn/assets/

# VSCode + IntelliJ 동시 적용
npm run brand:slexn
```

**시나리오 4: 브랜드 상태 확인**
```bash
cd caret-b2b
npm run brand:status

# 출력:
# 📊 Current Branding Status:
#    VSCode Extension: codecenter
#    IntelliJ Plugin:  codecenter
#    ✅ Both platforms in sync!
```

## 📋 구현 체크리스트

### Phase 1: caret-b2b 확장 (VSCode 영향 없음)
- [ ] `brand-config-intellij.json` 스키마 정의
- [ ] IntelliJ 브랜딩 스크립트 작성
- [ ] plugin.xml 템플릿 변환 로직
- [ ] IntelliJ locale 파일 변환 로직
- [ ] IntelliJ assets 복사 로직

### Phase 2: caret-intellij-plugin 연동
- [ ] caret-b2b submodule 추가
- [ ] npm scripts 통합 (`brand:*` 명령어)
- [ ] 브랜드 상태 동기화 검증

### Phase 3: 테스트
- [ ] CodeCenter 브랜딩 테스트
- [ ] VSCode ↔ IntelliJ 일관성 검증
- [ ] 브랜드 전환 왕복 테스트

## 🎯 핵심 원칙

### ✅ VSCode 영향 최소화
1. **완전 분리된 레포**: `caret-intellij-plugin`은 별도 레포
2. **공유 브랜딩 시스템**: `caret-b2b` submodule로 공유
3. **VSCode 코드 수정 없음**: 기존 VSCode 브랜딩 로직 그대로 유지

### ✅ 최소침습 원칙 (L1)
- **Level 1 (독립 모듈)**: IntelliJ 플러그인은 완전 독립
- **Level 1 (공유 에셋)**: caret-b2b submodule만 공유
- **No VSCode Modification**: VSCode 메인 레포는 전혀 수정 없음

### ✅ B2B 확장성
- **멀티 브랜드**: CodeCenter, 향후 추가 브랜드 지원
- **멀티 플랫폼**: VSCode + IntelliJ 동시 지원
- **일관성 보장**: 하나의 brand-config로 두 플랫폼 관리

## ⏱️ 예상 작업 시간

**Phase 1: caret-b2b 확장**
- brand-config-intellij.json 스키마: 15분
- IntelliJ 브랜딩 스크립트: 30분
- 테스트: 15분
- **Total: 1시간**

**Phase 2: caret-intellij-plugin 연동**
- Submodule 설정: 5분
- npm scripts 통합: 10분
- 검증: 10분
- **Total: 25분**

**Phase 3: 통합 테스트**
- CodeCenter 브랜딩 테스트: 10분
- 왕복 전환 테스트: 10분
- **Total: 20분**

**전체 예상 시간: 1시간 45분**

## 📊 VSCode 영향도 분석

### ✅ 영향 없음 (완전 독립)

**변경 사항**:
- ❌ caret 메인 레포 수정 없음
- ❌ VSCode extension 코드 수정 없음
- ❌ 기존 브랜딩 시스템 수정 없음

**추가 사항**:
- ✅ caret-b2b에 IntelliJ 브랜딩 설정 추가
- ✅ caret-intellij-plugin에서 submodule로 caret-b2b 사용

**결론**: **VSCode 버전에 0% 영향** ✨

## 🚀 다음 단계

1. **즉시 시작 가능**: caret-b2b 확장 작업
2. **병렬 진행**: IntelliJ 플러그인 기본 구조 + 브랜딩 시스템
3. **통합 검증**: VSCode와 IntelliJ CodeCenter 버전 동시 빌드

---

**결론**: 
- ✅ VSCode 영향 최소화 원칙 완벽 준수
- ✅ B2B 멀티 브랜드 전략 지원
- ✅ caret-b2b submodule로 브랜딩 일관성 보장
- ⏱️ 예상 작업 시간: 1시간 45분
