# Changelog

## v1.1.0.2 - 2026-11-25

合并上游 PR [#13](https://github.com/havenicec/google-qr-sms-helper/pull/13)「fix: only spoof mobile UA during downgrade flow」（尚未合入上游主线），并保留 fork 全部改动。

- UA 伪装改为默认关闭，仅在点击「一键降级」时临时开启；降级失败自动回滚。
- `declarativeNetRequest` 规则收窄到 `uplevelingstep/*`、`/_/IdvUplevelingUi/*`、`devicephoneverification/*`，不再污染原生验证会话。
- `navigator` 伪装只在带 `idv_xdevice=1` 的 `uplevelingstep/*` 页面生效。
- 面板新增「恢复桌面环境」按钮，可查看并关闭当前伪装；状态持久化到 `chrome.storage.local`。
- README 新增「输入手机号后又弹回二维码」的原因与处理说明。
- 保留 fork 改动：面板重挂载、TL `plt` 兼容、普通登录入口、面板拖动与默认位置。

## v1.1.0.1 - 2026-11-25

首个 fork 版本，基于上游 `v1.1.0`。

- 面板每秒检查并重新挂载，兼容 Google 登录页 SPA 导航和重渲染。
- TL 参数兼容 `ds:0` 数据、`devicephoneverification/begin` URL 的 `plt` 参数和旧版 `ADG-` 回退。
- 普通登录入口兼容：`continue` 不是 `uplevelingstep` URL 时，去掉 `/qrcode` 并追加 `idv_xdevice=1`。
- 面板标题栏支持拖动；默认底部偏移 84px，避免和 Ant Browser 快捷输入工具条重叠。
- 已在全新流程上验证可跳转到短信验证页；如果 consent 页面再次改版，仍需继续适配。
- Google 可能因频繁尝试返回「Too many failed attempts」，属于服务端风控，不是插件错误。
