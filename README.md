# Google QR 自动降级短信助手（Fork）

将 Google 桌面端强制跨设备扫码验证（`/v3/signin/challenge/iap/qrcode`）降级回传统短信验证码流程的 Chrome MV3 插件。

当前版本：`v1.1.0.1`（上游 `v1.1.0` + fork 修订 1）

本仓库是 [havenicec/google-qr-sms-helper](https://github.com/havenicec/google-qr-sms-helper) 的维护分支，针对官方 `v1.1.0` 之后 Google 页面流程的变化做了兼容修复。上游仍使用其原始版本；本仓库使用四段版本号 `<上游版本>.<fork 修订号>`，例如 `v1.1.0.1`。

## 相对官方 v1.1.0 的改动

- **面板重挂载**：Google 登录页是 SPA，导航或重渲染会移除插件面板。现在每秒检查并重新挂载，支持从 `confirmidentifier` 直接跳到 `qrcode` 的流程。
- **新 TL 参数兼容**：官方只识别旧的 `ADG-` 前缀；现在依次兼容 `ds:0` 数据、`devicephoneverification/begin` URL 的 `plt` 参数和旧版 `ADG-` 回退。
- **普通登录入口兼容**：当 `continue` 不是 `uplevelingstep` URL 时，去掉 `/qrcode` 并追加 `idv_xdevice=1`，不再要求必须从 Cloud Shell Verify 进入。
- **面板可拖动**：拖动标题栏即可移动面板，和 Ant Browser 的账号/密码快捷输入工具条并存。
- **面板位置**：默认底部留出 84px，避免和快捷输入工具条重叠。

## 安装

### Ant Browser 固定直链安装

在「插件管理」中使用以下 Release 资源地址安装：

```text
https://github.com/davidzhang12138/google-qr-sms-helper-fork/releases/download/v1.1.0.1/google-qr-sms-helper-v1.1.0.1.zip
```

后续版本只需把版本号替换为新的 `v1.1.0.N`。

### Chrome / Edge 手动加载

1. 下载 Release 中的 `google-qr-sms-helper-v1.1.0.1.zip` 并解压。
2. 打开 `chrome://extensions/`，开启开发者模式。
3. 点击「加载已解压的扩展程序」，选择解压后的目录。

## 使用

1. 登录 Google 账号，打开 [Google Cloud Console](https://console.cloud.google.com/)。
2. 点击右上角 Cloud Shell 终端图标 `[>_]`，再点弹窗里的 `Verify`。
3. 在二维码验证页点击右下角的「⚡ 一键降级到短信选择框」。
4. 页面跳转到短信验证页后，选择短信并输入手机号完成验证。

## 版本规则

- Release tag 使用 `v<上游版本>.<fork 修订号>`，例如 `v1.1.0.1`、`v1.1.0.2`。
- `manifest.json` 的 `version` 同步使用四段版本号（Chrome 支持 `1.1.0.1`）。
- 上游发布新版本后，先合并上游改动，再把 fork 修订号重置为 `.1`。

## 已知限制

- consent 页面的 UUID 提取仍依赖 Google 当前页面结构；如果 Google 再次改版，降级可能停在「未能从 consent 页面提取到 UUID」。
- 本仓库与上游作者无隶属关系；问题请提交到本仓库 Issues。

## License

MIT，见 [LICENSE](LICENSE)。原始版权归 [Haven (@havenicec)](https://github.com/havenicec) 所有。
