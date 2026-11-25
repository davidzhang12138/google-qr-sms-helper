# Project Agent Instructions

## 版本号与发布

本仓库是 `havenicec/google-qr-sms-helper` 的维护分支，**不要修改上游仓库的版本号**；本仓库使用独立的四段版本号。

- 版本号格式：`<上游版本>.<fork 修订号>`，例如上游 `1.1.0` 对应本仓库 `1.1.0.1`、`1.1.0.2`。
- `manifest.json` 的 `version` 必须是四段数字（Chrome 支持 `1.1.0.1`），并与 Release tag 去掉 `v` 后完全一致。
- 发布前同步更新：
  - `manifest.json` 的 `version`
  - `README.md` 的「当前版本」和安装地址
  - `CHANGELOG.md` 新增对应版本小节
  - `content.js` 面板标题里的版本号（`⚡ Google 验证降级助手 v<版本>`）
- Release tag 使用 annotated tag `v<版本号>`，例如 `v1.1.0.1`。
- Release 资源 zip 命名：`google-qr-sms-helper-v<版本号>.zip`，zip 根目录直接放 `manifest.json`、`background.js`、`content.js`、`ua_spoof.js`、`LICENSE`、`README.md`，不要多包一层目录。
- 发布命令示例：

```bash
git tag -a v1.1.0.1 -m "v1.1.0.1"
git push origin master --tags
zip -r google-qr-sms-helper-v1.1.0.1.zip manifest.json background.js content.js ua_spoof.js LICENSE README.md
gh release create v1.1.0.1 google-qr-sms-helper-v1.1.0.1.zip \
  --title "v1.1.0.1" \
  --notes-file CHANGELOG.md
```

- 上游发布新版本后：先合并上游改动，再把 fork 修订号重置为 `.1`，重新执行上面的发布流程。
- 本仓库不自动更新；Ant Browser 的固定直链安装/更新使用 Release 资源地址。
