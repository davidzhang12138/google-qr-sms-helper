# Changelog

## v1.1.0.1 - 2026-11-25

首个 fork 版本，基于上游 `v1.1.0`。

- 面板每秒检查并重新挂载，兼容 Google 登录页 SPA 导航和重渲染。
- TL 参数兼容 `ds:0` 数据、`devicephoneverification/begin` URL 的 `plt` 参数和旧版 `ADG-` 回退。
- 普通登录入口兼容：`continue` 不是 `uplevelingstep` URL 时，去掉 `/qrcode` 并追加 `idv_xdevice=1`。
- 面板标题栏支持拖动；默认底部偏移 84px，避免和 Ant Browser 快捷输入工具条重叠。
- 已知限制：consent 页面改为客户端渲染后，页面 HTML 不再包含 UUID；降级可能停在「未能从 consent 页面提取到 UUID」。该步骤仍需继续适配。
