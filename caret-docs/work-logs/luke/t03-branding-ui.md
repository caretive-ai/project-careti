# t03 - 브랜딩 시스템 머징 작업

## 기능 개요
- **목적**: Cline 브랜딩을 Caret으로 완전 대체 
     * 브랜딩 교체된 소스 : /caret-main
  * 이미지 교체  텍스트 교체, 백앤드 교체 (Cline was) 
  * 스크립트를 통해 Cline 에서 특정 브랜드로 변경 했다가 다시 복구 가능한 스크립트 개발
    /caret-scripts/ 밑에 작성
   - 머징앞두고는 다시 뒤로 돌릴 수 있게 하고 다시 머징후 다시 변경하는 방식으로 진행하여 conflict를 최소화 하기
   - caret-asset/*.
   - caret-asset/brand.json 에 교체 할 파일들과 내용 기록
      * cline -> caret
        Cline -> Caret
        CLINE -> CARET
        클라인 -> 캐럿

## 작업 방법
  - 먼저 요구사항을 유저와 논의, 모든 작업은 이 파일에 기록하며 진행
  - caret-docs/features/f03-branding-ui.mdx 에 브랜딩 변경에 대한 프로젝트의 특징을 설명, 관계된 파일들 설명, 머징 방법에 대해 설명 
    caret-docs/features/f02-multilingual-i18n.mdx 참고
  - cline -> caret으로 변경 테스트
  - caret -> cline으로 변경 테스트
    * cline -> caret, caret -> cline 변경 여부는 git으로 확인
    * cline -> caret 으로 변경하고 유저에게 
  - 최종적으로 확인되면, f03 문서 업데이트 하고, 본 파일에 작업 완료 표기, 커밋 푸시 하여 완료

