# 如何通过 Caret 免费使用 Google Gemini

Caret 允许您使用 Google Gemini API 密钥并获得高达 40 万韩元的免费积分，从而免费使用 Gemini。方法如下：

## 1. 创建一个新的 Google 帐户

- **URL**: [https://accounts.google.com/](https://accounts.google.com/)
- **所需信息**:
    - 帐户名称
    - 帐户电子邮件
    - 恢复电子邮件或电话号码

## 2. 颁发 Gemini API 密钥

- **API 密钥颁发页面**: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **生成并复制 API 密钥**:
    - 单击“创建 API 密钥”以生成密钥，然后复制它。
    - 此密钥稍后将用于 Caret 的 Gemini API 设置。

## 3. 在 Caret 中设置 Google API 密钥
- **选择 API 提供商**: 在 Caret 的 API 提供商中选择 Google Gemini。
- **粘贴 Google Gemini API 密钥**: 粘贴从 Google AI Studio 颁发的 API 密钥。
- **模型**: 我们建议将模型设置为 Gemini-1.5-flash 或 Gemini-1.5-pro。Gemini-1.5-flash 价格较低但性能较差，因此我们建议启用扩展思维。

## 4. 访问 Google Cloud 并申请免费积分

⚠️ **重要提示**: 您需要一张信用卡进行身份验证和帐户激活。

### i. 前往 Google Cloud 控制台

- **URL**: [https://console.cloud.google.com/](https://console.cloud.google.com/)
- 在页面顶部，您应该会看到一条关于免费积分的消息。
- 单击显示的按钮，您将被重定向到一个显示以下内容的页面：
    > “在 90 天的 Google Cloud 试用期内可获得 300 美元的免费积分。”

⚠️ **请仔细检查**: 如果直接转到“转到付款”，则可能无法提供积分。请确保您看到有关“90 天内 300 美元（约 40 万韩元）免费积分”的措辞。

### ii. 最终确认

在 Google AI Studio API 密钥页面中，请确保您已：
- 激活标准帐户
- 关联了结算帐户
- 升级到 Tier 1

只有这样，您才能使用免费积分。

### iii. 注意事项

- Google 积分不会实时扣除。使用情况会延迟约 1 天反映出来。
- 为避免意外收费，如果您不希望继续使用付费服务，请定期检查您的使用情况和剩余积分。