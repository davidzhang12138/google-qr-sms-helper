(() => {
  // 官方 v1.1.0 只在 document_idle 挂载一次面板；Google 页面是 SPA，导航或重渲染会移除面板。
  // 这里改为每秒检查并重新挂载，同时兼容 SPA 从 confirmidentifier 跳到 qrcode 的情况。
  const PANEL_ID = "google-qr-downgrade-helper";
  const PANEL_BOTTOM = "84px";
  let currentMode = "";
  let panel = null;
  let statusEl = null;
  let btn = null;

  function pageMode() {
    if (location.hostname === "console.cloud.google.com") return "cloud";
    if (location.pathname.includes("/challenge/iap/qrcode")) return "qr";
    return "";
  }

  function makeDraggable(el, handle) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    handle.style.cursor = "move";
    handle.style.userSelect = "none";
    handle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      const rect = el.getBoundingClientRect();
      el.style.left = rect.left + "px";
      el.style.top = rect.top + "px";
      el.style.right = "auto";
      el.style.bottom = "auto";
      startX = event.clientX;
      startY = event.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      dragging = true;
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    handle.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const maxLeft = Math.max(0, window.innerWidth - el.offsetWidth);
      const maxTop = Math.max(0, window.innerHeight - el.offsetHeight);
      el.style.left = Math.min(maxLeft, Math.max(0, startLeft + event.clientX - startX)) + "px";
      el.style.top = Math.min(maxTop, Math.max(0, startTop + event.clientY - startY)) + "px";
    });
    const stop = () => { dragging = false; };
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  }

  function createPanel(mode) {
    panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.style.cssText = "position:fixed;bottom:" + PANEL_BOTTOM + ";right:20px;z-index:999999;background:#1a73e8;color:#fff;padding:12px 16px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.25);font-family:system-ui,sans-serif;font-size:13px;display:flex;flex-direction:column;gap:8px;min-width:240px;max-width:320px;";

    const title = document.createElement("div");
    title.style.cssText = "font-weight:600;font-size:14px;display:flex;justify-content:space-between;align-items:center;";
    title.textContent = "⚡ Google 验证降级助手 v1.1.0.2";
    panel.appendChild(title);
    makeDraggable(panel, title);

    statusEl = document.createElement("div");
    statusEl.style.cssText = "font-size:12px;color:#e8f0fe;word-break:break-word;line-height:1.4;";
    panel.appendChild(statusEl);

    btn = document.createElement("button");
    btn.style.cssText = "background:#fff;color:#1a73e8;border:none;padding:8px 12px;border-radius:6px;font-weight:600;cursor:pointer;font-size:13px;";
    panel.appendChild(btn);

    const restoreBtn = document.createElement("button");
    restoreBtn.style.cssText = "background:transparent;color:#e8f0fe;border:1px solid rgba(255,255,255,0.5);padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px;display:none;";
    restoreBtn.textContent = "恢复桌面环境";
    restoreBtn.onclick = async () => {
      await chrome.runtime.sendMessage({ action: "setSpoof", enabled: false });
      restoreBtn.style.display = "none";
      statusEl.textContent = "✅ 已恢复原生环境，请刷新页面后重试验证";
    };
    panel.appendChild(restoreBtn);

    if (mode === "cloud") {
      statusEl.textContent = "第一步：点击右上角终端图标 [>_] 唤出 Verify 弹窗，或点下方按钮自动唤起";
      btn.textContent = "1. 自动点击 Cloud Shell 终端图标";
      btn.onclick = () => {
        const shellBtn = document.querySelector('button[aria-label*="Cloud Shell"], button[mattooltip*="Cloud Shell"], [id*="cloudshell"]');
        if (shellBtn) {
          shellBtn.click();
          statusEl.textContent = "✅ 已点击终端图标，等待底部弹出 Verify 按钮...";
          setTimeout(() => {
            const allBtns = Array.from(document.querySelectorAll("button, a"));
            const verifyBtn = allBtns.find(b => b.textContent.trim() === "Verify");
            if (verifyBtn) {
              verifyBtn.click();
              statusEl.textContent = "✅ 已自动点击 Verify 按钮！";
            }
          }, 2500);
        } else {
          statusEl.textContent = "⚠️ 未找到终端按钮，请手动点击右上角 [>_] 图标";
        }
      };
    } else {
      statusEl.textContent = "已检测到二维码验证页，点击下方按钮一键注入 [3,null,4] 并跳入选择页";
      btn.textContent = "⚡ 一键降级到短信选择框";
      btn.onclick = runDowngrade;
    }

    (document.body || document.documentElement).appendChild(panel);

    chrome.runtime.sendMessage({ action: "getState" }).then(state => {
      if (state && state.spoofEnabled) {
        restoreBtn.style.display = "block";
      }
    }).catch(() => {});
  }

  function ensurePanel() {
    const mode = pageMode();
    if (!mode) {
      if (panel) {
        panel.remove();
        panel = null;
        statusEl = null;
        btn = null;
        currentMode = "";
      }
      return;
    }
    if (!panel || !panel.isConnected || currentMode !== mode) {
      if (panel) panel.remove();
      currentMode = mode;
      createPanel(mode);
    }
  }

  async function extractQrUrlFromPage() {
    if ("BarcodeDetector" in window) {
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      const mediaEls = Array.from(document.querySelectorAll("img, canvas"));
      for (const el of mediaEls) {
        try {
          if (el.clientWidth > 80 && el.clientHeight > 80) {
            const c = document.createElement("canvas");
            c.width = el.naturalWidth || el.clientWidth || 300;
            c.height = el.naturalHeight || el.clientHeight || 300;
            const ctx = c.getContext("2d");
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, c.width, c.height);
            ctx.drawImage(el, 0, 0, c.width, c.height);
            const codes = await detector.detect(c);
            if (codes && codes.length > 0 && codes[0].rawValue) {
              return codes[0].rawValue;
            }
          }
        } catch (e) {}
      }
    }
    const bodyText = document.body.innerText || "";
    const shortMatch = bodyText.match(/g\.co\/verify\/[A-Za-z0-9_-]+/);
    if (shortMatch) {
      return "https://" + shortMatch[0];
    }
    const html = document.documentElement.innerHTML;
    const m = html.match(/https:\/\/accounts\.google\.com\/devicephoneverification\/begin\?[^"'\s<>]+/);
    if (m) return m[0].replace(/\\u003d/g, "=").replace(/\\u0026/g, "&");
    throw new Error("未能在当前页面识别到二维码，请确认二维码图片已加载");
  }

  async function runDowngrade() {
    try {
      btn.disabled = true;
      btn.textContent = "正在识别二维码...";
      const qrUrl = await extractQrUrlFromPage();
      statusEl.textContent = "已提取二维码，正在后台注入 [3,null,4]...";

      const res = await chrome.runtime.sendMessage({ action: "downgradeQr", qrUrl });
      if (!res || !res.ok) {
        throw new Error(res ? res.error : "后台请求失败");
      }
      if (!res.ydResp.includes("[3,null,4]")) {
        statusEl.textContent = "⚠️ 服务端返回: " + res.ydResp.slice(0, 80);
        btn.disabled = false;
        btn.textContent = "重试一键降级";
        return;
      }

      statusEl.textContent = "✅ [3,null,4] 注入成功！正在跳转短信验证页...";
      const params = new URLSearchParams(location.search);
      let cont = params.get("continue") || "";
      let targetUrl = "";

      if (cont && cont.startsWith("https://accounts.google.com/uplevelingstep/")) {
        cont = cont.replace(/&idv_xdevice=[^&]*/g, "");
        cont = cont.replace(/([?&])authuser(&|$)/, "$1authuser=0$2");
        targetUrl = cont + "&idv_xdevice=1";
      } else {
        // 普通登录入口：去掉 /qrcode，保留并清洗当前参数后追加 &idv_xdevice=1
        targetUrl = location.href.replace("/challenge/iap/qrcode", "/challenge/iap");
        targetUrl = targetUrl.replace(/&idv_xdevice=[^&]*/g, "") + "&idv_xdevice=1";
      }
      location.replace(targetUrl);
    } catch (e) {
      statusEl.textContent = "❌ " + e.message;
      btn.disabled = false;
      btn.textContent = "重试一键降级";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensurePanel, { once: true });
  } else {
    ensurePanel();
  }
  setInterval(ensurePanel, 1000);
})();
