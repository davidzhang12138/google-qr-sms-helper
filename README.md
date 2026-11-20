# Google QR 自动降级短信助手（Fork）

将 Google 桌面端强制跨设备扫码验证（`/v3/signin/challenge/iap/qrcode`）降级回传统短信验证码流程的 Chrome MV3 插件。

当前版本：`v1.2.0.1`（上游 `v1.2.0` + fork 修订 1）

本仓库是 [havenicec/google-qr-sms-helper](https://github.com/havenicec/google-qr-sms-helper) 的维护分支，已合并上游 PR [#13](https://github.com/havenicec/google-qr-sms-helper/pull/13)（仅在降级链路内临时伪装移动端 UA）。上游仍使用其原始版本；本仓库使用四段版本号 `<上游版本>.<fork 修订号>`，例如 `v1.2.0.1`。

## 相对官方 v1.2.0 的改动

- **面板重挂载**：Google 登录页是 SPA，导航或重渲染会移除插件面板。现在每秒检查并重新挂载，支持从 `confirmidentifier` 直接跳到 `qrcode` 的流程。
- **新 TL 参数兼容**：官方只识别旧的 `ADG-` 前缀；现在依次兼容 `ds:0` 数据、`devicephoneverification/begin` URL 的 `plt` 参数和旧版 `ADG-` 回退。
- **普通登录入口兼容**：当 `continue` 不是 `uplevelingstep` URL 时，去掉 `/qrcode` 并追加 `idv_xdevice=1`，不再要求必须从 Cloud Shell Verify 进入。
- **面板可拖动**：拖动标题栏即可移动面板，和 Ant Browser 的账号/密码快捷输入工具条并存。
- **面板位置**：默认底部留出 84px，避免和快捷输入工具条重叠。

## 上游 v1.2.0 的变化（PR #13）

- **按需启用伪装**：`declarativeNetRequest` 的 UA 规则默认关闭，只在点击「一键降级」时临时开启；降级失败自动回滚。
- **收窄生效范围**：只覆盖 `uplevelingstep/*`、`/_/IdvUplevelingUi/*`（提交验证码接口）和 `devicephoneverification/*`。
- **navigator 伪装**：只注入 `uplevelingstep/*`，且仅当 URL 带 `idv_xdevice=1`（插件自己跳转出来的页面）。
- **恢复桌面环境**：面板新增按钮，可随时归还浏览器原生请求头，并显示当前伪装状态。
- **状态持久化**：伪装状态存 `chrome.storage.local`，浏览器重启后按上次状态恢复。

## 安装

### Ant Browser 固定直链安装

在「插件管理」中使用以下 Release 资源地址安装：

```text
https://github.com/davidzhang12138/google-qr-sms-helper/releases/download/v1.2.0.1/google-qr-sms-helper-v1.2.0.1.zip
```

后续版本只需把版本号替换为新的 `v1.2.0.N`。

### Chrome / Edge 手动加载

1. 下载 Release 中的 `google-qr-sms-helper-v1.2.0.1.zip` 并解压。
2. 打开 `chrome://extensions/`，开启开发者模式。
3. 点击「加载已解压的扩展程序」，选择解压后的目录。

## 使用

1. 登录 Google 账号，打开 [Google Cloud Console](https://console.cloud.google.com/)。
2. 点击右上角 Cloud Shell 终端图标 `[>_]`，再点弹窗里的 `Verify`。
3. 在二维码验证页点击右下角的「⚡ 一键降级到短信选择框」。
4. 页面跳转到短信验证页后，选择短信并输入手机号完成验证。
5. 如果面板显示「恢复桌面环境」，说明 UA 伪装仍处于开启状态；点它即可恢复原生请求头。

## 常见问题

### 点「Verify your phone number」输入号码后又弹回二维码？

- **原因**：这不是插件生效的链路。Google 新版 `Verify your info to continue` 页面自带手机号验证选项，但如果号码是接码平台 / 虚拟号，或虚拟号已被大量使用，Google 会静默拒绝并回退到二维码，页面上不会给出明确错误。
- **怎么办**：先点面板上的「恢复桌面环境」并刷新页面，再试一次原生流程；如果仍然循环，说明是号码被风控或账号级设备验证要求，换真实运营商号码或在手机端完成验证后再回桌面继续。

## 版本规则

- Release tag 使用 `v<上游版本>.<fork 修订号>`，例如 `v1.2.0.1`、`v1.2.0.2`。
- `manifest.json` 的 `version` 同步使用四段版本号（Chrome 支持 `1.2.0.1`）。
- 上游发布新版本后，先合并上游改动，再把 fork 修订号重置为 `.1`。

## 已知限制

- 降级链路已在全新流程上验证可跳转到短信验证页；Google 仍可能因短时间内多次尝试返回「Too many failed attempts」，这属于服务端风控，不是插件错误。
- consent 页面结构再次变化时仍可能需要适配。
- 本仓库与上游作者无隶属关系；问题请提交到本仓库 Issues。

## License

MIT，见 [LICENSE](LICENSE)。原始版权归 [Haven (@havenicec)](https://github.com/havenicec) 所有。
