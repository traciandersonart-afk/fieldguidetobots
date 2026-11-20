/**
 * Field Guide to Bots share bar.
 * Looks for .share-bar on the page. If the bar is empty, it fills in
 * Pinterest, Facebook, X, Copy link (for Instagram/TikTok), and a
 * native Share button when the Web Share API is available.
 *
 * Optional data attributes: data-share-url, data-share-title,
 * data-share-description, data-share-image. Otherwise uses the
 * canonical URL and Open Graph tags.
 */
(function () {
  "use strict";

  function meta(prop) {
    var el = document.querySelector('meta[property="' + prop + '"], meta[name="' + prop + '"]');
    return el ? el.getAttribute("content") : "";
  }

  function canonical() {
    var el = document.querySelector('link[rel="canonical"]');
    return (el && el.href) || window.location.href;
  }

  function context(bar) {
    return {
      url: bar.getAttribute("data-share-url") || canonical(),
      title: bar.getAttribute("data-share-title") || meta("og:title") || document.title,
      description: bar.getAttribute("data-share-description") || meta("og:description") || "",
      image: bar.getAttribute("data-share-image") || meta("og:image") || "",
    };
  }

  function enc(s) {
    return encodeURIComponent(s || "");
  }

  function pinterestHref(ctx) {
    var href = "https://www.pinterest.com/pin/create/button/?url=" + enc(ctx.url) + "&description=" + enc(ctx.title);
    if (ctx.image) href += "&media=" + enc(ctx.image);
    return href;
  }

  function facebookHref(ctx) {
    return "https://www.facebook.com/sharer/sharer.php?u=" + enc(ctx.url);
  }

  function xHref(ctx) {
    var text = ctx.title || "";
    return "https://twitter.com/intent/tweet?url=" + enc(ctx.url) + "&text=" + enc(text);
  }

  function svg(path) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16"><path fill="currentColor" d="' + path + '"/></svg>';
  }

  var ICONS = {
    pinterest: "M12.02 2C6.63 2 3 5.8 3 10.52c0 3 1.78 5.33 4.55 6.07.4.07.61-.18.61-.4 0-.2-.01-.86-.01-1.56-1.85.4-2.24-.79-2.24-.79-.3-.77-.74-1-.74-1-.6-.41.05-.4.05-.4.67.05 1.02.69 1.02.69.6 1.02 1.56.73 1.94.55.06-.43.23-.73.42-.9-1.48-.17-3.03-.74-3.03-3.28 0-.73.26-1.32.68-1.78-.07-.17-.3-.86.06-1.78 0 0 .56-.18 1.83.68a6.3 6.3 0 0 1 3.33 0c1.27-.86 1.83-.68 1.83-.68.36.92.13 1.61.07 1.78.42.46.68 1.05.68 1.78 0 2.55-1.56 3.11-3.04 3.27.24.21.45.62.45 1.25 0 .9-.01 1.63-.01 1.85 0 .22.2.48.61.4A7.02 7.02 0 0 0 21 10.52C21 5.8 16.42 2 12.02 2z",
    facebook: "M22 12a10 10 0 1 0-11.56 9.88v-7H8.1V12h2.34V9.8c0-2.3 1.37-3.58 3.47-3.58.7 0 1.44.12 2.16.24v2.38h-1.22c-1.2 0-1.57.75-1.57 1.52V12h2.67l-.43 2.88h-2.24v7A10 10 0 0 0 22 12z",
    x: "M18.24 3H21l-6.56 7.49L22.2 21h-6.08l-4.76-6.22L6.1 21H3.32l7.02-8.02L1.88 3h6.24l4.3 5.7L18.24 3zm-1.06 16.18h1.69L6.9 4.72H5.1l12.08 14.46z",
    copy: "M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z",
    native: "M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 .54 1.7L8.7 9.24a3 3 0 1 0 0 5.52l6.84 3.54A3 3 0 1 0 16.9 16.7L10.06 13.16a3.06 3.06 0 0 0 0-2.32L16.9 7.3A3 3 0 0 0 18 8z",
  };

  function makeLink(className, label, href, icon) {
    var a = document.createElement("a");
    a.className = "share-btn " + className;
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.innerHTML = svg(icon) + "<span>" + label + "</span>";
    return a;
  }

  function makeButton(className, label, icon, attr) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "share-btn " + className;
    b.setAttribute(attr, "true");
    b.innerHTML = svg(icon) + "<span>" + label + "</span>";
    return b;
  }

  function fill(bar) {
    if (bar.querySelector(".share-btn, a, button")) return;
    var ctx = context(bar);
    if (!bar.querySelector(".share-label")) {
      var lab = document.createElement("p");
      lab.className = "share-label";
      lab.textContent = "Share this page";
      bar.appendChild(lab);
    }
    var actions = document.createElement("div");
    actions.className = "share-actions";
    actions.appendChild(makeLink("share-pinterest", "Pinterest", pinterestHref(ctx), ICONS.pinterest));
    actions.appendChild(makeLink("share-facebook", "Facebook", facebookHref(ctx), ICONS.facebook));
    actions.appendChild(makeLink("share-x", "X", xHref(ctx), ICONS.x));
    var copy = makeButton("share-copy", "Copy link", ICONS.copy, "data-share-copy");
    copy.setAttribute("aria-label", "Copy link to share on Instagram or TikTok");
    actions.appendChild(copy);
    var native = makeButton("share-native", "Share", ICONS.native, "data-share-native");
    native.hidden = true;
    actions.appendChild(native);
    bar.appendChild(actions);
  }

  function setCopied(btn, ok) {
    var span = btn.querySelector("span") || btn;
    var prev = span.textContent;
    span.textContent = ok ? "Copied!" : "Copy failed";
    window.setTimeout(function () {
      span.textContent = prev || "Copy link";
    }, 2000);
  }

  function onCopy(bar, btn) {
    var url = context(bar).url;
    function ok() { setCopied(btn, true); }
    function fail() { setCopied(btn, false); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(ok).catch(function () {
        window.prompt("Copy this link:", url);
        ok();
      });
    } else {
      window.prompt("Copy this link:", url);
      ok();
    }
  }

  function onNative(bar) {
    var ctx = context(bar);
    if (!navigator.share) return;
    var payload = { title: ctx.title, text: ctx.description || ctx.title, url: ctx.url };
    navigator.share(payload).catch(function () {});
  }

  function enhance(bar) {
    fill(bar);
    var native = bar.querySelector("[data-share-native], .share-native");
    if (native && typeof navigator.share === "function") {
      native.hidden = false;
    }
    bar.addEventListener("click", function (e) {
      var copy = e.target.closest("[data-share-copy], .share-copy");
      if (copy) {
        e.preventDefault();
        onCopy(bar, copy);
        return;
      }
      var share = e.target.closest("[data-share-native], .share-native");
      if (share) {
        e.preventDefault();
        onNative(bar);
      }
    });
  }

  function init() {
    document.querySelectorAll(".share-bar, [data-share]").forEach(enhance);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
