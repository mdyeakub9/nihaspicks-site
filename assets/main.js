/* NihasPicks site script
 * 1. Meta Pixel (loads only after the visitor accepts cookies)
 * 2. Affiliate link sub-IDs (s1 = traffic source, s2 = ad / utm_content)
 * 3. Coupon copy button + sticky mobile CTA
 */
(function () {
  // ===== CONFIG =====
  // Paste your Meta Pixel ID here (Events Manager → Data sources → your pixel).
  var META_PIXEL_ID = "1631902542004895";
  // ==================

  var CONSENT_KEY = "np_consent";

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function setConsent(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
  }

  function loadPixel() {
    if (!META_PIXEL_ID || window.fbq) return;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
    if (document.body.dataset.page === "lander") {
      window.fbq('track', 'ViewContent', { content_name: document.title });
    }
  }

  // --- consent banner ---
  // Opt-in banner only where opt-in consent is required (Europe: EEA, UK, CH).
  // Elsewhere (US, CA, AU) the pixel loads by default; the Privacy Policy explains it.
  function needsOptIn() {
    var tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) { return true; }
    if (!tz) return true;
    return /^(Europe|Atlantic\/(Reykjavik|Canary|Madeira|Azores|Faroe))\b/.test(tz);
  }

  function initConsent() {
    var c = getConsent();
    if (c === "yes") { loadPixel(); return; }
    if (c === "no" || !META_PIXEL_ID) return;
    if (!needsOptIn()) { loadPixel(); return; }
    var box = document.createElement("div");
    box.className = "consent show";
    box.setAttribute("role", "dialog");
    box.innerHTML =
      '<div>We use cookies to measure how our pages perform and to improve our ads. ' +
      'See our <a href="/privacy/">Privacy Policy</a>.</div>' +
      '<div class="row"><button type="button" data-v="no">Decline</button>' +
      '<button type="button" class="primary" data-v="yes">Accept</button></div>';
    box.addEventListener("click", function (e) {
      var v = e.target && e.target.getAttribute("data-v");
      if (!v) return;
      setConsent(v);
      box.remove();
      if (v === "yes") loadPixel();
    });
    document.body.appendChild(box);
  }

  // --- geo guard ---
  // The offer only accepts US, CA, UK and AU. MaxBounty sends visitors from other
  // countries to an unrelated fallback offer (e.g. a casino). To avoid that, visitors
  // whose time zone is outside those countries go straight to the brand's own site.
  var OFFER_FALLBACK_URL = "https://www.curiositybox.com/";
  function inAllowedRegion() {
    var tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) { return true; }
    if (!tz) return true;
    if (/^(US|Canada)\//.test(tz) || /^Australia\//.test(tz)) return true;
    if (/^Europe\/(London|Belfast)$/.test(tz) || /^Pacific\/Honolulu$/.test(tz)) return true;
    if (/^America\/(New_York|Detroit|Chicago|Denver|Phoenix|Boise|Los_Angeles|Anchorage|Juneau|Sitka|Metlakatla|Yakutat|Nome|Adak|Menominee|Indiana\/.+|Kentucky\/.+|North_Dakota\/.+|Toronto|Montreal|Nipigon|Thunder_Bay|Iqaluit|Winnipeg|Rainy_River|Rankin_Inlet|Resolute|Regina|Swift_Current|Edmonton|Calgary|Cambridge_Bay|Yellowknife|Inuvik|Dawson_Creek|Fort_Nelson|Creston|Vancouver|Whitehorse|Dawson|Halifax|Glace_Bay|Moncton|Goose_Bay|St_Johns|Atikokan|Blanc-Sablon)$/.test(tz)) return true;
    return false;
  }

  // --- affiliate links: add sub-IDs for tracking in MaxBounty reports ---
  function initAffLinks() {
    // HTML links point to the brand's own site by default; the affiliate link
    // (data-href) is switched in only for visitors in the offer's countries.
    if (!inAllowedRegion()) {
      document.querySelectorAll("a[data-aff]").forEach(function (a) {
        a.setAttribute("href", OFFER_FALLBACK_URL);
        a.setAttribute("rel", "noopener");
      });
      return;
    }
    var params = new URLSearchParams(location.search);
    var src = params.get("utm_source") || (params.get("fbclid") ? "fb" : "direct");
    var ad = params.get("utm_content") || params.get("utm_campaign") || "none";
    var links = document.querySelectorAll("a[data-aff]");
    links.forEach(function (a) {
      try {
        var u = new URL(a.getAttribute("data-href") || a.getAttribute("href"));
        u.searchParams.set("s1", src.slice(0, 50));
        u.searchParams.set("s2", ad.slice(0, 50));
        u.searchParams.set("s3", (a.getAttribute("data-aff") || "cta").slice(0, 50));
        a.setAttribute("href", u.toString());
      } catch (e) {}
      a.setAttribute("rel", "sponsored nofollow noopener");
      a.addEventListener("click", function () {
        if (window.fbq) window.fbq('trackCustom', 'OutboundClick', { position: a.getAttribute("data-aff") });
      });
    });
  }

  // --- coupon copy ---
  function initCopy() {
    document.querySelectorAll("[data-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var code = btn.getAttribute("data-copy");
        var done = function () { btn.textContent = "Copied ✓"; setTimeout(function(){ btn.textContent = "Copy code"; }, 2000); };
        if (navigator.clipboard) navigator.clipboard.writeText(code).then(done, done); else done();
      });
    });
  }

  // --- sticky CTA on mobile after scrolling past the first CTA ---
  function initSticky() {
    var sticky = document.querySelector(".sticky-cta");
    var first = document.querySelector(".cta");
    if (!sticky || !first || !("IntersectionObserver" in window)) return;
    document.body.classList.add("has-sticky");
    var seen = false;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting && en.boundingClientRect.top < 0) seen = true;
        sticky.classList.toggle("show", seen && !en.isIntersecting);
      });
    }).observe(first);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initAffLinks();
    initCopy();
    initSticky();
    initConsent();
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
