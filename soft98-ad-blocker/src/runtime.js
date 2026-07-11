(function soft98AdBlocker() {
  "use strict";

  const VERSION = "1.1.1";
  const DATA_HREF = "data-soft98-adblocker-href";
  const DATA_STATE = "data-soft98-adblocker-state";
  const DATA_PATCHED = "data-soft98-adblocker-patched-script";
  const enqueueMicrotask = window.queueMicrotask ? window.queueMicrotask.bind(window) : (callback) => Promise.resolve().then(callback);
  const nativeEval = typeof window.eval === "function" ? window.eval : null;
  const nativeFetch = window.fetch ? window.fetch.bind(window) : null;
  const STORAGE_KEY = "soft98-ad-blocker.settings";
  const PIRATE_LOGO = "https://user-images.githubusercontent.com/4673812/50543067-1f2b7680-0be1-11e9-9daa-92828b24448e.png";
  const EXTENSION_REPO = "https://github.com/DRSDavidSoft/soft98-ad-blocker-extension";
  const DEFAULT_SETTINGS = {
    blockAds: true,
    patchScripts: true,
    pro: false,
    darkDesign: false,
    compactLayout: true,
    linkBadges: true,
    pirateLogo: true,
    taunt: true,
    diagnostics: true,
    recommendExtension: true,
  };
  const savedHref = new WeakMap();
  const trackedLinks = new Set();
  const pendingRoots = new Set();
  const stats = { adsRemoved: 0, warningsRemoved: 0, blockerNoticesRemoved: 0, linksPreserved: 0, linksRestored: 0, patches: [] };
  let scheduled = false;
  let recoveryStarted = false;
  let originalTitle = document.title || "";
  let successAnnounced = false;
  let settings = readSettings();

  const SELECTORS = {
    links: [
      "a.download-list-link",
      ".download-list a[href]",
      ".download-list-link",
      ".card-title-link",
      ".card-footer .btn-success",
      ".top-list-link",
      "a[href*='/download/']",
      "a[href*='soft98.ir/download']",
      "a[href*='soft98.ir/dl/']",
      "a[href*='soft98.ir/file/']",
    ].join(","),
    removableAds: [
      "#kaprila_soft98_ir_related",
      "[id^='kaprila']",
      "[id*='kaprila']",
      "[class*='kaprila']",
      ".download-list-item-buysellads",
      "[class*='buysellads']",
      "#footer-bitcoin",
      "iframe[src*='kaprila.com']",
      "script[src*='kaprila.com']",
      "script[src*='buysellads']",
    ].join(","),
    warningCandidates: [
      ".tbd_ibd",
      ".tbdc",
      ".trk_irk",
      ".tooltip",
      "[class*='d-darkreader-inline-block']",
      "[class*='dlgbdinline-block']",
      "[class*='dlgrkinline-block']",
      "[id*='PersianBlocker']",
      "[class*='PersianBlocker']",
      "[href*='PersianBlocker']",
    ].join(","),
  };

  const SOFT98_SCRIPT = /(?:^|\/\/)(?:www\.)?soft98\.ir\/templates\/.*(?:application\.min\.packed|jquery\.min\.packed|jquery)\.js(?:[?#].*)?$/i;
  const BLOCKED_URL = /(?:kaprila\.com|buysellads|\/ads?(?:\/|\.|$)|adservice|advertisement)/i;
  const BAD_HREF = /^(?:\s*|#|javascript:|void\(0\)|about:blank)$/i;
  const WARNING_TEXT =
    /(?:افزونه\s+حذف\s+(?:تبلیغات|ﺗﺒﻠﻴﻐﺎت)|فیلترشک|Dark Reader|SMostafaMoosavi|VPN|ریفرش\s+کنید|غیرفعال\s+کنید|disable\s+ad-?block|adblocker?)/i;
  const PERSIAN_BLOCKER_NOTICE =
    /(?:PersianBlocker|Persian\s*Blocker|MasterKia|آزادی\s+کاربران|چه\s+چیزی\s+وارد\s+مرورگر|هشدار\s+از\s+طرف\s+لیست\s+PersianBlocker|برگرداندن\s+آزادی\s+کاربران)/i;
  const WARNING_TITLE = /(?:افزونه\s+حذف|ﺗﺒﻠﻴﻐﺎت|VPN|فیلترشک|Dark Reader|ad-?block)/i;
  const SOFT98_CODE_MARKERS =
    /(?:افزونه\s+حذف|ﺗﺒﻠﻴﻐﺎت|Dark Reader|disableDownloadLink|setNullLinkAttributes|checkadBlocker|advertisementrk|text_add_firewall|kaprila|adguard|location\.reload)/i;
  const AD_SIZE = /^(?:728x90|970x90|468x60|300x250|336x280|240x90|160x600)$/;

  function onReady(callback) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", callback, { once: true });
    else callback();
  }

  function readSettings() {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch (_error) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function writeSettings(next) {
    settings = { ...DEFAULT_SETTINGS, ...next };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      safeConsole("warn", "Soft98 Ad Blocker could not persist settings", error);
    }
    installProStyle();
    renderControlPanel();
    schedule(document);
  }

  function safeConsole(level, ...args) {
    try {
      const target = typeof console === "object" && console ? console : null;
      const method = target && typeof target[level] === "function" ? target[level] : target && typeof target.log === "function" ? target.log : null;
      if (method) Function.prototype.apply.call(method, target, args);
    } catch (_error) {}
  }

  function log(level, message, detail) {
    if (!settings.diagnostics) return;
    safeConsole(
      level,
      "%cSoft98 Ad Blocker%c " + message,
      "background:#101820;color:#92e6a7;padding:2px 6px;border-radius:5px;font-weight:700",
      "color:#9fb3c8",
      detail || ""
    );
  }

  function safeEval(source, thisArg) {
    if (typeof source !== "string") return source;
    try {
      if (nativeEval) return Function.prototype.call.call(nativeEval, thisArg || window, source);
    } catch (error) {
      safeConsole("warn", "Soft98 Ad Blocker native eval failed; retrying indirectly", error);
    }
    return (0, eval)(source);
  }

  function asElement(node) {
    return node && node.nodeType === Node.ELEMENT_NODE ? node : null;
  }

  function safeDecode(value) {
    try {
      return decodeURIComponent(value);
    } catch (_error) {
      return value;
    }
  }

  function isBadHref(value) {
    if (!value) return true;
    const trimmed = String(value).trim();
    if (BAD_HREF.test(trimmed)) return true;
    return trimmed === location.href;
  }

  function normalizeHref(link, href) {
    const value = href || link.getAttribute("href") || "";
    if (isBadHref(value)) return "";
    try {
      return new URL(value, location.href).href;
    } catch (_error) {
      return value;
    }
  }

  function linkLabel(link) {
    return (link.textContent || link.getAttribute("title") || link.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
  }

  function visibleBox(node) {
    if (!node || !node.getBoundingClientRect) return { width: 0, height: 0 };
    const rect = node.getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height) };
  }

  function isExternalAdHref(value) {
    if (!value) return false;
    try {
      const url = new URL(value, location.href);
      const sameSoft98 = /(^|\.)soft98\.ir$/i.test(url.hostname) || /(^|\.)forum\.soft98\.ir$/i.test(url.hostname);
      return !sameSoft98 || /(?:utm_(?:source|medium|campaign)|banner|kaprila|ad)/i.test(url.search + " " + url.pathname);
    } catch (_error) {
      return /(?:utm_|banner|kaprila|ad)/i.test(value);
    }
  }

  function isLikelyAdSurface(node) {
    const element = asElement(node);
    if (!element) return false;
    const image = element.tagName === "IMG" ? element : element.querySelector && element.querySelector("img");
    const link = element.closest && element.closest("a[href]");
    const href = link ? link.href || link.getAttribute("href") : element.getAttribute("href");
    if (BLOCKED_URL.test(href || element.getAttribute("src") || "")) return true;
    if (!image) return false;
    const src = image.currentSrc || image.src || image.getAttribute("src") || "";
    const box = visibleBox(image);
    const size = `${box.width}x${box.height}`;
    const firstPartyAdAsset = /img\.soft98\.ir\/(?:ads?|[0-9]+)\//i.test(src);
    const adSized = AD_SIZE.test(size);
    return (firstPartyAdAsset && adSized) || (adSized && isExternalAdHref(href));
  }

  function adRemovalRoot(node) {
    const element = asElement(node);
    if (!element) return null;
    const link = element.closest && element.closest("a[href]");
    if (link && isLikelyAdSurface(link)) return link;
    return element;
  }

  function rememberLink(link) {
    const href = normalizeHref(link);
    if (!href) return false;
    const previous = savedHref.get(link);
    if (previous && previous !== href && !isBadHref(previous)) return false;
    savedHref.set(link, href);
    trackedLinks.add(link);
    link.setAttribute(DATA_HREF, href);
    link.setAttribute(DATA_STATE, "preserved");
    stats.linksPreserved += 1;
    return true;
  }

  function restoreLink(link) {
    const href = savedHref.get(link) || link.getAttribute(DATA_HREF) || "";
    if (!href || isBadHref(href)) return false;
    const current = link.getAttribute("href") || "";
    if (isBadHref(current) || normalizeHref(link, current) !== href) {
      link.setAttribute("href", href);
      link.setAttribute(DATA_STATE, "restored");
      stats.linksRestored += 1;
    }
    link.removeAttribute("onclick");
    link.removeAttribute("data-toggle");
    link.removeAttribute("data-target");
    link.removeAttribute("target");
    return true;
  }

  function collectLinks(root) {
    const element = asElement(root) || document;
    const links = [];
    if (element.matches && element.matches(SELECTORS.links)) links.push(element);
    if (element.querySelectorAll) links.push(...element.querySelectorAll(SELECTORS.links));
    let lost = 0;
    for (const link of links) {
      if (rememberLink(link)) continue;
      if (trackedLinks.has(link) || link.hasAttribute(DATA_HREF)) restoreLink(link);
      else if (isBadHref(link.getAttribute("href"))) lost += 1;
    }
    if (lost) recoverLinksFromFreshPage();
  }

  function matchRecoveredLink(target, candidates) {
    const label = linkLabel(target);
    if (!label) return null;
    const matches = candidates.filter((candidate) => linkLabel(candidate) === label);
    return matches.length === 1 ? normalizeHref(matches[0]) : null;
  }

  function recoverLinksFromFreshPage() {
    if (recoveryStarted || !nativeFetch || !window.DOMParser) return;
    recoveryStarted = true;
    nativeFetch(location.href, { credentials: "same-origin", cache: "reload" })
      .then((response) => (response.ok ? response.text() : ""))
      .then((html) => {
        if (!html) return;
        const doc = new DOMParser().parseFromString(html, "text/html");
        const candidates = [...doc.querySelectorAll(SELECTORS.links)].filter((link) => !isBadHref(link.getAttribute("href")));
        for (const link of document.querySelectorAll(SELECTORS.links)) {
          if (!isBadHref(link.getAttribute("href"))) continue;
          const recovered = matchRecoveredLink(link, candidates);
          if (!recovered) continue;
          savedHref.set(link, recovered);
          trackedLinks.add(link);
          link.setAttribute(DATA_HREF, recovered);
          restoreLink(link);
        }
      })
      .catch(() => {})
      .finally(() => {
        window.setTimeout(() => {
          recoveryStarted = false;
        }, 5000);
      });
  }

  function removeExternalAds(root) {
    if (!settings.blockAds) return;
    const element = asElement(root) || document;
    const nodes = [];
    if (element.matches && element.matches(SELECTORS.removableAds)) nodes.push(element);
    if (element.querySelectorAll) nodes.push(...element.querySelectorAll(SELECTORS.removableAds));
    if (element.matches && isLikelyAdSurface(element)) nodes.push(element);
    if (element.querySelectorAll) {
      for (const node of element.querySelectorAll("a[href], img, iframe")) {
        if (isLikelyAdSurface(node)) nodes.push(node);
      }
    }
    for (const node of nodes) {
      const removable = adRemovalRoot(node);
      if (removable) {
        removable.remove();
        stats.adsRemoved += 1;
      }
    }
  }

  function isWarningNode(node) {
    const element = asElement(node);
    if (!element || element === document.documentElement || element === document.body) return false;
    const text = (element.textContent || "").replace(/\s+/g, " ").trim();
    if (!WARNING_TEXT.test(text)) return false;
    if (element.matches(SELECTORS.warningCandidates)) return true;
    if (element.classList.contains("dbdnone")) return true;
    return Boolean(element.querySelector("a[href*='support'], a[href*='SMostafa'], a[href*='telegram']"));
  }

  function isExternalBlockerNotice(node) {
    const element = asElement(node);
    if (!element || element === document.documentElement || element === document.body) return false;
    const text = (element.textContent || "").replace(/\s+/g, " ").trim();
    const inline = [element.id, element.className, element.getAttribute("style"), element.getAttribute("href")].join(" ");
    if (!PERSIAN_BLOCKER_NOTICE.test(`${text} ${inline}`)) return false;
    const box = visibleBox(element);
    const fixed = /(?:^|;)\s*position\s*:\s*(?:fixed|sticky)/i.test(element.getAttribute("style") || "") || getComputedStyle(element).position === "fixed";
    const intrusive = fixed || box.height >= 40 || box.width >= Math.min(320, Math.round(window.innerWidth * 0.45));
    return intrusive || Boolean(element.querySelector("a[href*='PersianBlocker'], a[href*='MasterKia']"));
  }

  function removeWarnings(root) {
    const element = asElement(root) || document;
    const candidates = [];
    if (isWarningNode(element)) candidates.push(element);
    if (element.querySelectorAll) candidates.push(...element.querySelectorAll(SELECTORS.warningCandidates));
    if (element.querySelectorAll) {
      candidates.push(...element.querySelectorAll("div,section,aside,header,footer,a,p,span"));
    }
    for (const candidate of candidates) {
      if (isWarningNode(candidate)) {
        candidate.remove();
        stats.warningsRemoved += 1;
      } else if (isExternalBlockerNotice(candidate)) {
        candidate.remove();
        stats.blockerNoticesRemoved += 1;
      }
    }
    const hash = safeDecode(location.hash || "");
    if (hash && WARNING_TITLE.test(hash)) history.replaceState(null, document.title, `${location.pathname}${location.search}`);
    if (!originalTitle && document.title && !WARNING_TITLE.test(document.title)) originalTitle = document.title;
    if (originalTitle && WARNING_TITLE.test(document.title)) document.title = originalTitle;
  }

  function processRoot(root) {
    collectLinks(root);
    removeExternalAds(root);
    removeWarnings(root);
  }

  function schedule(root) {
    if (root) pendingRoots.add(root);
    if (scheduled) return;
    scheduled = true;
    enqueueMicrotask(() => {
      scheduled = false;
      const roots = pendingRoots.size ? [...pendingRoots] : [document];
      pendingRoots.clear();
      for (const item of roots) processRoot(item);
      for (const link of trackedLinks) {
        if (document.contains(link)) restoreLink(link);
        else trackedLinks.delete(link);
      }
      applyLinkBadges();
      announceSuccess();
    });
  }

  function installStyle() {
    const style = document.createElement("style");
    style.id = "soft98-ad-blocker-style";
    style.textContent = `
      #kaprila_soft98_ir_related,[id^="kaprila"],[id*="kaprila"],[class*="kaprila"],
      .download-list-item-buysellads,[class*="buysellads"],#footer-bitcoin,iframe[src*="kaprila.com"],
      .tbd_ibd,.tbdc,.trk_irk{display:none}
      [id*="PersianBlocker"],[class*="PersianBlocker"]{display:none!important}
      a[${DATA_HREF}]{pointer-events:auto}
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function installProStyle() {
    const previous = document.getElementById("soft98-pro-style");
    if (previous) previous.remove();
    if (!settings.pro || !settings.darkDesign) {
      document.documentElement.classList.remove("soft98-pro-theme");
      return;
    }
    document.documentElement.classList.add("soft98-pro-theme");
    const style = document.createElement("style");
    style.id = "soft98-pro-style";
    style.textContent = `
      :root.soft98-pro-theme{color-scheme:dark;--s98p-bg:#08111a;--s98p-surface:#101b27;--s98p-border:#27405a;--s98p-text:#e6f0fa;--s98p-muted:#9db1c6;--s98p-accent:#70e1b2;--s98p-link:#8cc8ff}
      .soft98-pro-theme body{background:radial-gradient(circle at 18% 0%,rgba(112,225,178,.16),transparent 28rem),var(--s98p-bg);color:var(--s98p-text)}
      .soft98-pro-theme a{color:var(--s98p-link)}
      .soft98-pro-theme [class*="card"],.soft98-pro-theme [class*="box"],.soft98-pro-theme article,.soft98-pro-theme aside{border-color:var(--s98p-border);background-color:color-mix(in srgb,var(--s98p-surface) 92%,transparent);box-shadow:0 16px 40px rgba(0,0,0,.24)}
      .soft98-pro-theme input,.soft98-pro-theme textarea,.soft98-pro-theme select{border-color:var(--s98p-border);background:var(--s98p-surface);color:var(--s98p-text)}
      .soft98-pro-theme ::selection{background:rgba(112,225,178,.28)}
      .soft98-pro-link-badge{margin-inline-start:.45em;padding:.12em .45em;border:1px solid rgba(112,225,178,.42);border-radius:999px;color:#baffd8;background:rgba(112,225,178,.12);font-size:.78em;vertical-align:middle}
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function applyLinkBadges() {
    if (!settings.pro || !settings.linkBadges) return;
    for (const link of trackedLinks) {
      if (!document.contains(link) || link.querySelector(".soft98-pro-link-badge")) continue;
      const badge = document.createElement("span");
      badge.className = "soft98-pro-link-badge";
      badge.textContent = "ready";
      link.appendChild(badge);
    }
  }

  function enhanceLogo() {
    if (!settings.pirateLogo) return;
    const logo = document.querySelector("#logo-link img, a[href='/'] img, a[href='https://soft98.ir/'] img");
    if (!logo || logo.getAttribute("data-soft98-original-logo")) return;
    logo.setAttribute("data-soft98-original-logo", logo.src || "");
    logo.src = PIRATE_LOGO;
    logo.alt = "Soft98 Ad Blocker";
  }

  function addTaunt() {
    if (!settings.taunt || document.getElementById("soft98-ad-blocker-taunt")) return;
    const footer = document.querySelector("footer, [class*='footer']") || document.body;
    const note = document.createElement("div");
    note.id = "soft98-ad-blocker-taunt";
    note.dir = "rtl";
    note.style.cssText = "margin:14px auto;padding:10px 14px;max-width:780px;border:1px solid rgba(112,225,178,.35);border-radius:8px;background:rgba(8,17,26,.88);color:#dfffee;text-align:center;font:13px/1.8 system-ui,sans-serif";
    note.innerHTML =
      'تبلیغات حذف شد، لینک‌ها سالم ماندند، و آزمون ضد‌مسدودسازی با احترام فنی پاسخ داده شد. <a rel="nofollow" target="_blank" href="https://github.com/DRSDavidSoft/user-scripts/blob/master/soft98_ad-blocker.user.js">Soft98 Ad Blocker</a>';
    footer.appendChild(note);
  }

  function renderControlPanel() {
    const old = document.getElementById("soft98-pro-control");
    if (old) old.remove();
    if (!document.body) return;
    const wrap = document.createElement("div");
    wrap.id = "soft98-pro-control";
    wrap.dir = "ltr";
    wrap.innerHTML = `
      <button type="button" data-role="toggle" aria-label="Soft98 Pro">☠</button>
      <form hidden>
        <header><strong>Soft98 Pro</strong><small>${VERSION}</small></header>
        ${[
          ["blockAds", "Block ads"],
          ["patchScripts", "Patch Soft98 code"],
          ["pro", "Enable Pro"],
          ["darkDesign", "Modern dark design"],
          ["linkBadges", "Download badges"],
          ["pirateLogo", "Pirate logo"],
          ["taunt", "Professional taunt"],
          ["diagnostics", "Console diagnostics"],
          ["recommendExtension", "Recommend extension"],
        ]
          .map(([key, label]) => `<label><input type="checkbox" name="${key}" ${settings[key] ? "checked" : ""}>${label}</label>`)
          .join("")}
        <footer><button type="button" data-role="scan">Scan now</button><button type="button" data-role="close">Close</button></footer>
      </form>
    `;
    const style = document.createElement("style");
    style.textContent = `
      #soft98-pro-control{position:fixed;z-index:2147483647;left:16px;bottom:16px;font:13px/1.4 system-ui,sans-serif;color:#e6f0fa}
      #soft98-pro-control>[data-role=toggle]{width:42px;height:42px;border:1px solid #2d4a66;border-radius:50%;background:#101b27;color:#70e1b2;font-size:20px;box-shadow:0 10px 30px rgba(0,0,0,.35);cursor:pointer}
      #soft98-pro-control form{display:grid;gap:10px;width:260px;margin-top:10px;padding:14px;border:1px solid #27405a;border-radius:12px;background:rgba(8,17,26,.96);box-shadow:0 18px 55px rgba(0,0,0,.45);backdrop-filter:blur(14px)}
      #soft98-pro-control form[hidden]{display:none}
      #soft98-pro-control header{display:flex;justify-content:space-between;align-items:center;color:#f0f7ff}
      #soft98-pro-control small{color:#9db1c6}
      #soft98-pro-control label{display:flex;align-items:center;gap:8px;justify-content:space-between;padding:7px 8px;border:1px solid #1d3145;border-radius:8px;background:#101b27}
      #soft98-pro-control input{accent-color:#70e1b2}
      #soft98-pro-control footer{display:flex;gap:8px}
      #soft98-pro-control footer button{flex:1;border:1px solid #31506c;border-radius:8px;background:#15283a;color:#e6f0fa;padding:7px;cursor:pointer}
    `;
    wrap.appendChild(style);
    wrap.querySelector("[data-role='toggle']").addEventListener("click", () => {
      const form = wrap.querySelector("form");
      form.hidden = !form.hidden;
    });
    wrap.querySelector("[data-role='close']").addEventListener("click", () => {
      wrap.querySelector("form").hidden = true;
    });
    wrap.querySelector("[data-role='scan']").addEventListener("click", () => schedule(document));
    wrap.addEventListener("change", (event) => {
      const input = event.target;
      if (!input || input.tagName !== "INPUT") return;
      writeSettings({ ...settings, [input.name]: input.checked });
    });
    document.body.appendChild(wrap);
  }

  function announceSuccess() {
    if (successAnnounced) return;
    if (!stats.adsRemoved && !stats.linksPreserved && !stats.patches.length) return;
    successAnnounced = true;
    log("info", "boarded successfully", { ...stats });
    if (settings.taunt) {
      safeConsole(
        "info",
        "%cSoft98 Ad Blocker%c The page kept its content. The ads did not. Challenge accepted with clean instruments.",
        "background:#70e1b2;color:#06120c;padding:4px 8px;border-radius:6px;font-weight:800",
        "color:#9db1c6"
      );
    }
    onReady(() => {
      enhanceLogo();
      addTaunt();
      renderExtensionRecommendation();
    });
  }

  function renderExtensionRecommendation() {
    if (!settings.recommendExtension || document.getElementById("soft98-extension-recommendation")) return;
    const panel = document.createElement("aside");
    panel.id = "soft98-extension-recommendation";
    panel.dir = "rtl";
    panel.innerHTML = `
      <strong>نسخه افزونه مرورگر آماده است</strong>
      <span>برای کنترل دقیق‌تر، تنظیمات بیشتر، و اجرای مطمئن‌تر در Chrome، Edge و Firefox می‌توانید نسخه افزونه را نصب کنید.</span>
      <a rel="noopener noreferrer" target="_blank" href="${EXTENSION_REPO}">دریافت افزونه Soft98 Ad Blocker</a>
      <button type="button" aria-label="Dismiss">×</button>
    `;
    const style = document.createElement("style");
    style.textContent = `
      #soft98-extension-recommendation{position:fixed;z-index:2147483646;right:16px;bottom:16px;display:grid;gap:7px;max-width:330px;padding:14px 16px;border:1px solid rgba(112,225,178,.36);border-radius:14px;background:linear-gradient(145deg,rgba(8,17,26,.96),rgba(18,34,48,.96));color:#e6f0fa;box-shadow:0 18px 55px rgba(0,0,0,.42);font:13px/1.7 system-ui,sans-serif}
      #soft98-extension-recommendation span{color:#b8c7d8}
      #soft98-extension-recommendation a{color:#70e1b2;font-weight:800;text-decoration:none}
      #soft98-extension-recommendation button{position:absolute;top:8px;left:8px;border:0;background:transparent;color:#9db1c6;font-size:18px;cursor:pointer}
    `;
    panel.appendChild(style);
    panel.querySelector("button").addEventListener("click", () => {
      writeSettings({ ...settings, recommendExtension: false });
      panel.remove();
    });
    document.body.appendChild(panel);
  }

  function unpackDeanEdwards(source) {
    const trimmed = String(source || "").trim();
    if (!/^eval\s*\(\s*function\s*\(\s*p\s*,\s*a\s*,\s*c\s*,\s*k\s*,\s*e\s*,\s*r\s*\)/.test(trimmed)) return trimmed;
    const inner = trimmed.replace(/^eval\s*\(/, "").replace(/\)\s*;?\s*$/, "");
    try {
      const unpacked = safeEval(`(${inner})`, window);
      return typeof unpacked === "string" ? unpacked : trimmed;
    } catch (_error) {
      return trimmed;
    }
  }

  function patchSoft98Code(source, origin) {
    if (!settings.patchScripts) return source;
    let code = unpackDeanEdwards(source);
    if (!SOFT98_CODE_MARKERS.test(code)) return source;
    const before = code;
    const patches = [];
    const apply = (name, pattern, replacement) => {
      const next = code.replace(pattern, replacement);
      if (next !== code) patches.push(name);
      code = next;
    };
    apply("anti-adblock-warning-throws", /\bthrow\s+[A-Za-z_$][\w$]*\(\s*\)\s*;?/g, "return null;");
    apply("anti-adblock-reload-hook", /\blocation\.reload\s*=\s*[A-Za-z_$][\w$]*\s*;?/g, "void 0;");
    apply("anti-adblock-title-hash", /\b(?:location|[A-Za-z_$][\w$]*(?:\.get\(["']location["']\))?)\.hash\s*=\s*[^;]*replace\(\s*\/\\s\+\/g\s*,\s*["_']_["_']\s*\)\s*;?/g, "void 0;");
    apply("legacy-download-null-href", /\.setAttribute\(\s*["']href["']\s*,\s*[^;]*(?:location\.href|["']location\.href["'])[^;]*\)/g, "void 0");
    code += `\n;try{window.dispatchEvent(new CustomEvent("soft98-ad-blocker:patched",{detail:{origin:${JSON.stringify(
      origin || "eval"
    )},patches:${JSON.stringify(patches)}}}));}catch(_){}`;
    if (patches.length) {
      stats.patches.push({ origin: origin || "eval", patches });
      log("info", "patched Soft98 application code", { origin, patches });
    }
    if (code !== before) schedule(document);
    return code;
  }

  function installEvalHijack() {
    if (window.__soft98AdBlockerEvalHijacked) return;
    window.__soft98AdBlockerEvalHijacked = true;
    window.eval = function patchedEval(source) {
      if (typeof source === "string") return safeEval(patchSoft98Code(source, "eval"), this);
      if (nativeEval) return Function.prototype.apply.call(nativeEval, this, arguments);
      return source;
    };
  }

  function isSoft98Script(script) {
    if (!script || script.tagName !== "SCRIPT" || script.hasAttribute(DATA_PATCHED)) return false;
    const src = script.src || script.getAttribute("src") || "";
    return SOFT98_SCRIPT.test(src) || BLOCKED_URL.test(src);
  }

  function runPatchedScript(src) {
    if (!nativeFetch) return;
    nativeFetch(src, { credentials: "include", cache: "reload" })
      .then((response) => (response.ok ? response.text() : ""))
      .then((text) => {
        if (!text) return;
        safeEval(patchSoft98Code(text, src), window);
      })
      .catch(() => {});
  }

  function neutralizeScript(script) {
    if (!isSoft98Script(script)) return;
    const src = script.src || script.getAttribute("src") || "";
    script.setAttribute(DATA_PATCHED, "1");
    script.type = "javascript/blocked-by-soft98-ad-blocker";
    script.removeAttribute("src");
    if (SOFT98_SCRIPT.test(src)) runPatchedScript(src);
    else script.remove();
  }

  function installScriptHijack() {
    const originalAppend = Node.prototype.appendChild;
    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.appendChild = function patchedAppendChild(node) {
      neutralizeScript(node);
      return originalAppend.call(this, node);
    };
    Node.prototype.insertBefore = function patchedInsertBefore(node, child) {
      neutralizeScript(node);
      return originalInsertBefore.call(this, node, child);
    };
    const descriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");
    if (descriptor && descriptor.set && descriptor.get) {
      Object.defineProperty(HTMLScriptElement.prototype, "src", {
        configurable: true,
        enumerable: descriptor.enumerable,
        get: descriptor.get,
        set(value) {
          descriptor.set.call(this, value);
          neutralizeScript(this);
        },
      });
    }
  }

  function installClickRepair() {
    for (const eventName of ["click", "mouseover"]) {
      document.addEventListener(
        eventName,
        (event) => {
          const link = event.target && event.target.closest ? event.target.closest(`a[${DATA_HREF}]`) : null;
          if (link) restoreLink(link);
        },
        true
      );
    }
  }

  function installObserver() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes") {
          schedule(mutation.target);
          continue;
        }
        for (const node of mutation.addedNodes) {
          neutralizeScript(node);
          schedule(node);
        }
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["href", "src", "class", "style", "onclick", "target"],
    });
  }

  function init() {
    installEvalHijack();
    installScriptHijack();
    installStyle();
    installProStyle();
    installClickRepair();
    schedule(document);
    installObserver();
    onReady(() => {
      renderControlPanel();
      originalTitle = WARNING_TITLE.test(document.title) ? originalTitle : document.title;
      schedule(document);
      window.setTimeout(() => schedule(document), 750);
      window.setTimeout(() => schedule(document), 2500);
    });
  }

  window.Soft98AdBlocker = {
    version: VERSION,
    get settings() {
      return { ...settings };
    },
    get stats() {
      return { ...stats, patches: [...stats.patches] };
    },
    configure: (next) => writeSettings({ ...settings, ...next }),
    openPanel: () => {
      renderControlPanel();
      const form = document.querySelector("#soft98-pro-control form");
      if (form) form.hidden = false;
    },
    patchSoft98Code,
    unpackDeanEdwards,
    scan: () => schedule(document),
    restoreLinks: () => {
      for (const link of trackedLinks) restoreLink(link);
    },
  };

  init();
})();
