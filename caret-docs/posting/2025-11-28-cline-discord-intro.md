# Cline 커뮤니티(Discord) 소개글 초안

## 작성 배경
- 한국의 초기 스타트업(3명 규모) 소개
- Cline 오픈소스에 대한 감사 표시
- 과거 경험(Mozilla Hubs)과 현재 상황(B2B 비즈니스) 공유
- 향후 협력 및 소통 의지 피력

---

## [초안] 안녕하세요, 한국에서 인사드립니다. (Hello from Korea)

안녕하세요, Cline 커뮤니티 여러분. Caret의 Luke Yang입니다.

먼저 이렇게 훌륭한 프로젝트를 오픈소스로 공개해 주셔서 진심으로 감사드립니다. 덕분에 많은 영감을 받고 있습니다.

저희는 한국에 있는 3명 규모의 초기 스타트업입니다. 이제 막 시작하는 단계로, 최근 시드 투자를 유치하여 본격적으로 비즈니스를 전개하고 있습니다.

저희 팀은 과거에 Mozilla 재단의 Hubs 오픈소스를 기반으로 스타트업을 운영했던 경험이 있습니다. 당시 메타버스 시장의 침체로 어려움을 겪기도 했고, 특히 오픈소스 기반 사업을 하면서 시차와 언어 장벽으로 인한 소통의 어려움을 크게 느꼈습니다.

이번에는 한국 시장의 B2B 수요를 중심으로 비즈니스 모델을 설계하고 있으며, 이를 위한 핵심 기능 개발에 집중하고 있습니다. 마음은 Cline 프로젝트에 기여하고 싶지만, 적은 인원으로 기술 개발과 사업을 병행하다 보니 커뮤니티의 현황을 깊이 파악하지 못한 채 단독으로 기능을 개발하며 달려왔습니다.

현재 저희는 Cline의 원본 코드를 최대한 유지하면서 필요한 기능을 확장하는 **'최소 침습(Minimal Invasion)'** 전략을 통해 개발을 진행하고 있습니다. 이는 오픈소스의 업데이트를 지속적으로 반영하면서도, 저희만의 비즈니스 로직을 안정적으로 유지하기 위한 방법론입니다.

한편으로는 저희의 B2B 비즈니스 활동이 커뮤니티에 혹시라도 불편함을 드리지 않을까 하는 조심스러운 마음도 가지고 있습니다. 저희는 Cline과 경쟁하거나 대립하는 관계가 아닌, 서로의 성장을 돕는 협력적인 파트너가 되기를 진심으로 희망합니다.

저희의 모든 작업은 아래 GitHub 저장소에서 확인하실 수 있습니다.
`https://github.com/aicoding-caret/caret`

저희는 Cline의 강력한 기반 위에 B2B 환경과 글로벌 사용자를 위한 몇 가지 기능들을 추가하고 있습니다. 주요 내용은 다음과 같습니다.
*   **글로벌 지원:** 4개 국어(한/영/일/중)를 지원하는 다국어(i18n) 시스템과 B2B 고객사를 위한 동적 브랜딩 및 UI 커스터마이징 기능을 구현했습니다.
*   **독립적인 시스템:** gRPC 기반의 자체 계정 인증 시스템과, `.agents/context`의 우선순위를 관리하는 규칙 시스템을 구축하여 독립적인 운영이 가능하도록 했습니다.
*   **AI 경험 강화:** 사용자가 AI의 페르소나를 직접 선택하고 관리할 수 있는 시스템과, Chatbot/Agent 모드 전환을 포함한 JSON 기반의 고급 프롬프트 시스템을 개발하여 AI와의 상호작용을 풍부하게 만들고 있습니다.

전체 기능 목록과 상세 내용은 아래 링크에서 확인하실 수 있습니다.
`https://github.com/aicoding-caret/caret/blob/main/caret-docs/features.en/index.md`

또한, Cline의 터미널 안정성 문제를 해결하기 위한 작은 패치(F00)를 진행했습니다. 혹시 도움이 된다면 나중에 upstream에 반영해 주시면 감사하겠습니다.

이제 투자를 유치하고 조금 더 안정적인 환경이 마련된 만큼, 앞으로는 Cline 메인 프로젝트와 더 자주 소통하고 싶습니다. 저희가 한국 시장에서 시도하는 B2B 비즈니스 경험이 커뮤니티에도 도움이 되길 바라며, 사업적으로 협력할 수 있는 부분이 있다면 적극적으로 논의하고 싶습니다.

잘 부탁드립니다!

---

## [English Translation for Reference]


Hello Cline Community, this is Luke Yang from Caret.

First of all, thank you so much for sharing such amazing code as open source. We are truly grateful.

We are a small startup based in Korea with a team of three. We have just started and recently received some investment to officially launch our business plan.

Previously, we had experience running a startup based on the Mozilla Foundation's Hubs open source. However, with the decline of the metaverse market, our previous company faced difficulties. One of the biggest challenges we faced during that open-source based business was the difference in time zones and language barriers.

This time, we are planning a B2B-focused business in Korea and are developing core features based on B2B demands. Although we would love to contribute to Cline, as an early-stage startup with limited personnel, we have been so focused on technical development that we haven't been able to keep up with the community atmosphere or situation, leading us to develop standalone features on our own.

Currently, we are developing with a **'Minimal Invasion'** strategy, extending necessary features while maintaining Cline's original code as much as possible. This methodology allows us to stably maintain our business logic while continuously reflecting updates from the open source.

On the other hand, we are also cautious and hope that our B2B business activities do not cause any discomfort to the community. We sincerely hope to be a collaborative partner that helps each other grow, rather than competing or conflicting with Cline.

You can check out all our work in our GitHub repository:
`https://github.com/aicoding-caret/caret`

We are adding several features for B2B environments and global users on top of Cline's powerful foundation. Here are some of the key highlights:
*   **Global Support:** We've implemented a multilingual (i18n) system supporting four languages (KO/EN/JA/CN) and a dynamic branding/UI customization feature for our B2B clients.
*   **Independent Systems:** We've built our own gRPC-based account authentication system and a rule system to manage `.agents/context` priorities, allowing for independent operation.
*   **Enhanced AI Experience:** We are enriching the interaction with AI by developing a system where users can select and manage AI personas, and an advanced JSON-based prompt system that includes switching between Chatbot and Agent modes.

You can find a full list of features and more details at the link below:
`https://github.com/aicoding-caret/caret/blob/main/caret-docs/features.en/index.md`

We have also created a small patch (F00) to address terminal stability issues in Cline. We would be grateful if you consider incorporating it upstream if you find it helpful.

Now that we have secured some investment, we hope to communicate more with the Cline main repository. We are also open to cooperation if there are any business opportunities to collaborate.

Thank you!
