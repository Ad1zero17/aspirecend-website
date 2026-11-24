/* ===========================================================
   Aspirecend – eigenes Cookie-Banner (ersetzt Cookiebot)

   Was es tut:
   - Fragt einmal nach Einwilligung (Akzeptieren / Ablehnen gleichwertig, Auswahl unter „Einstellungen“).
   - Der Google Tag Manager (und damit das Meta Pixel) wird ERST nach Einwilligung in „Marketing“ geladen.
     Ohne Einwilligung wird nichts von Google oder Meta geladen.
   - Die Entscheidung liegt 12 Monate im Browser des Besuchers (localStorage), danach wird neu gefragt.
   - Jeder Link/Knopf mit dem Attribut data-consent-open öffnet die Einstellungen erneut (Widerruf).

   Zusammenspiel mit dem GTM-Container GTM-K8H9MRTP:
   Das Pixel-Tag dort startet mit fbq('consent','revoke') und wartete bisher auf Cookiebot.
   Dieses Skript ruft nach der Einwilligung selbst fbq('consent','grant') auf – am Tag muss nichts geändert werden.
   Das Cookiebot-Tag im GTM muss pausiert werden, sobald diese Seite auf der echten Domain läuft
   (sonst erscheinen dort zwei Banner).
   =========================================================== */
(function () {
  'use strict';

  var GTM_ID = 'GTM-K8H9MRTP';
  var KEY = 'asp-consent';
  var VERSION = 1;
  var MAX_AGE = 365 * 24 * 60 * 60 * 1000;

  var TEXT = {
    de: {
      title: 'Cookies & Tracking',
      body: 'Wir nutzen den Google Tag Manager und das Meta Pixel, um zu messen, wie unsere Werbung wirkt. Das passiert nur mit deiner Einwilligung. Du kannst sie jederzeit über „Cookie-Einstellungen“ am Seitenende widerrufen.',
      accept: 'Alle akzeptieren', decline: 'Ablehnen', settings: 'Einstellungen', save: 'Auswahl speichern',
      necessary: 'Notwendig', necessaryText: 'Speichert nur deine Cookie-Entscheidung. Immer aktiv.',
      marketing: 'Marketing', marketingText: 'Google Tag Manager und Meta Pixel: Messung und Auswertung unserer Werbeanzeigen.',
      privacy: 'Datenschutz', imprint: 'Impressum', label: 'Cookie-Einstellungen'
    },
    en: {
      title: 'Cookies & tracking',
      body: 'We use Google Tag Manager and the Meta Pixel to measure how our advertising performs. This only happens with your consent. You can withdraw it at any time via “Cookie settings” at the bottom of the page.',
      accept: 'Accept all', decline: 'Decline', settings: 'Settings', save: 'Save selection',
      necessary: 'Necessary', necessaryText: 'Only stores your cookie decision. Always active.',
      marketing: 'Marketing', marketingText: 'Google Tag Manager and Meta Pixel: measuring and evaluating our ads.',
      privacy: 'Privacy Policy', imprint: 'Impressum', label: 'Cookie settings'
    }
  };
  var lang = (document.documentElement.lang || 'de').slice(0, 2) === 'en' ? 'en' : 'de';
  var t = TEXT[lang];

  // --- Google Consent Mode: Standard = alles abgelehnt (greift, falls später Google-Tags dazukommen) ---
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied'
  });

  function read() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY));
      if (c && c.v === VERSION && typeof c.marketing === 'boolean' && Date.now() - c.t < MAX_AGE) return c;
    } catch (e) {}
    return null;
  }
  function write(marketing) {
    try { localStorage.setItem(KEY, JSON.stringify({ v: VERSION, marketing: marketing, t: Date.now() })); } catch (e) {}
  }

  var gtmLoaded = false;
  function loadGTM() {
    if (gtmLoaded) return;
    gtmLoaded = true;
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = document.getElementsByTagName('script')[0], j = document.createElement('script');
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    f.parentNode.insertBefore(j, f);
  }

  // Das Pixel-Tag im GTM setzt beim Start fbq('consent','revoke'). Sobald es gelaufen ist, geben wir frei.
  var pixelTimer = null;
  function grantPixel() {
    var tries = 0;
    clearInterval(pixelTimer);
    pixelTimer = setInterval(function () {
      tries++;
      if (typeof window.fbq === 'function') { window.fbq('consent', 'grant'); clearInterval(pixelTimer); }
      else if (tries > 150) clearInterval(pixelTimer); // nach 30 s aufgeben
    }, 200);
  }

  function apply(marketing) {
    if (marketing) {
      gtag('consent', 'update', {
        ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted'
      });
      loadGTM();
      grantPixel();
    } else {
      clearInterval(pixelTimer);
      gtag('consent', 'update', {
        ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied'
      });
      if (typeof window.fbq === 'function') window.fbq('consent', 'revoke');
    }
    window.dataLayer.push({ event: 'asp_consent', consent_marketing: marketing });
  }

  function decide(marketing) {
    write(marketing);
    apply(marketing);
    hide();
  }

  // --- Banner ---
  var box = null, toggle = null, details = null;
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  function build() {
    box = el('div', 'consent');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', t.label);

    var main = el('div', 'consent-main');
    main.appendChild(el('p', 'consent-title', t.title));
    main.appendChild(el('p', 'consent-text', t.body));

    details = el('div', 'consent-details');
    details.hidden = true;
    var rowN = el('div', 'consent-row');
    var nText = el('div');
    nText.appendChild(el('strong', '', t.necessary));
    nText.appendChild(el('span', '', t.necessaryText));
    rowN.appendChild(nText);
    var nSw = el('span', 'consent-switch is-on is-locked');
    nSw.setAttribute('aria-hidden', 'true');
    rowN.appendChild(nSw);
    details.appendChild(rowN);

    var rowM = el('label', 'consent-row');
    var mText = el('div');
    mText.appendChild(el('strong', '', t.marketing));
    mText.appendChild(el('span', '', t.marketingText));
    rowM.appendChild(mText);
    toggle = el('input', 'consent-check');
    toggle.type = 'checkbox';
    rowM.appendChild(toggle);
    rowM.appendChild(el('span', 'consent-switch'));
    details.appendChild(rowM);
    main.appendChild(details);

    var links = el('p', 'consent-links');
    var a1 = el('a', '', t.privacy); a1.href = '/datenschutz/';
    var a2 = el('a', '', t.imprint); a2.href = '/impressum/';
    links.appendChild(a1); links.appendChild(a2);
    main.appendChild(links);
    box.appendChild(main);

    var actions = el('div', 'consent-actions');
    var bAccept = el('button', 'consent-btn consent-btn--primary', t.accept);
    var bDecline = el('button', 'consent-btn', t.decline);
    var bSettings = el('button', 'consent-btn consent-btn--ghost', t.settings);
    [bAccept, bDecline, bSettings].forEach(function (b) { b.type = 'button'; actions.appendChild(b); });
    box.appendChild(actions);

    bAccept.addEventListener('click', function () { decide(true); });
    bDecline.addEventListener('click', function () { decide(false); });
    bSettings.addEventListener('click', function () {
      if (details.hidden) { details.hidden = false; bSettings.textContent = t.save; bSettings.classList.remove('consent-btn--ghost'); }
      else decide(toggle.checked);
    });
    box._settingsBtn = bSettings;
    document.body.appendChild(box);
  }
  function show(withDetails) {
    if (!box) build();
    var c = read();
    toggle.checked = !!(c && c.marketing);
    if (withDetails) {
      details.hidden = false;
      box._settingsBtn.textContent = t.save;
      box._settingsBtn.classList.remove('consent-btn--ghost');
    }
    box.hidden = false;
    requestAnimationFrame(function () { box.classList.add('is-open'); });
  }
  function hide() {
    if (!box) return;
    box.classList.remove('is-open');
    box.hidden = true;
  }

  // --- Start ---
  var stored = read();
  if (stored) apply(stored.marketing);

  function ready() {
    if (!stored) show(false);
    document.addEventListener('click', function (e) {
      var opener = e.target.closest && e.target.closest('[data-consent-open]');
      if (!opener) return;
      e.preventDefault();
      show(true);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
