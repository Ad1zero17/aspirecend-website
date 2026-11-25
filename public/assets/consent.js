/* ===========================================================
   Aspirecend – eigenes Cookie-Banner + Meta Pixel (ersetzt Cookiebot und den Google Tag Manager)

   Was es tut:
   - Fragt einmal nach Einwilligung (Akzeptieren / Ablehnen gleichwertig, Auswahl unter „Einstellungen“).
   - Das Meta Pixel wird ERST nach Einwilligung in „Marketing“ geladen – direkt von hier, ohne Tag Manager.
     Ohne Einwilligung wird nichts von Meta geladen und nichts an Meta gesendet.
   - Die Entscheidung liegt 12 Monate im Browser des Besuchers (localStorage), danach wird neu gefragt.
   - Jeder Link/Knopf mit dem Attribut data-consent-open öffnet die Einstellungen erneut (Widerruf).

   Pixel-ID: dieselbe wie bisher im Tag-Manager-Container GTM-K8H9MRTP der Webflow-Seite,
   damit Daten und Zielgruppen bei Meta nahtlos weiterlaufen. NICHT ändern.

   Ereignisse:
   - „PageView“ wird hier bei jedem Seitenaufruf gesendet (nach Einwilligung).
   - Weitere Ereignisse über aspConsent.onPixel(...), siehe unten (z. B. die Buchung auf /call-confirmed/).
   =========================================================== */
(function () {
  'use strict';

  var PIXEL_ID = '216917691507569';
  var KEY = 'asp-consent';
  var VERSION = 1;
  var MAX_AGE = 365 * 24 * 60 * 60 * 1000;

  var TEXT = {
    de: {
      title: 'Cookies & Tracking',
      body: 'Wir nutzen das Meta Pixel, um zu messen, wie unsere Werbung wirkt. Das passiert nur mit deiner Einwilligung. Du kannst sie jederzeit über „Cookie-Einstellungen“ am Seitenende widerrufen.',
      accept: 'Alle akzeptieren', decline: 'Ablehnen', settings: 'Einstellungen', save: 'Auswahl speichern',
      necessary: 'Notwendig', necessaryText: 'Speichert nur deine Cookie-Entscheidung. Immer aktiv.',
      marketing: 'Marketing', marketingText: 'Meta Pixel: Messung und Auswertung unserer Werbeanzeigen.',
      privacy: 'Datenschutz', imprint: 'Impressum', label: 'Cookie-Einstellungen'
    },
    en: {
      title: 'Cookies & tracking',
      body: 'We use the Meta Pixel to measure how our advertising performs. This only happens with your consent. You can withdraw it at any time via “Cookie settings” at the bottom of the page.',
      accept: 'Accept all', decline: 'Decline', settings: 'Settings', save: 'Save selection',
      necessary: 'Necessary', necessaryText: 'Only stores your cookie decision. Always active.',
      marketing: 'Marketing', marketingText: 'Meta Pixel: measuring and evaluating our ads.',
      privacy: 'Privacy Policy', imprint: 'Impressum', label: 'Cookie settings'
    }
  };
  var lang = (document.documentElement.lang || 'de').slice(0, 2) === 'en' ? 'en' : 'de';
  var t = TEXT[lang];

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

  // --- Meta Pixel ---
  var pixelLoaded = false, pixelGranted = false, pixelQueue = [];

  // Für einzelne Seiten (z. B. /call-confirmed/): Die Funktion läuft, sobald das Pixel mit Einwilligung bereit ist.
  // Ohne Einwilligung läuft sie nie. Beispiel: aspConsent.onPixel(function () { fbq('track', 'CompleteRegistration'); });
  window.aspConsent = {
    onPixel: function (cb) { if (pixelGranted) cb(); else pixelQueue.push(cb); }
  };

  function loadPixel() {
    if (pixelLoaded) return;
    pixelLoaded = true;
    // Metas Standard-Code: legt fbq an und lädt das Pixel-Skript von Meta nach.
    (function (f, b, e, v, n, s, x) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      s = b.createElement(e); s.async = true; s.src = v;
      x = b.getElementsByTagName(e)[0]; x.parentNode.insertBefore(s, x);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function apply(marketing) {
    if (marketing) {
      var again = pixelLoaded;
      loadPixel();
      if (again) window.fbq('consent', 'grant'); // nach einem Widerruf auf derselben Seite wieder freigeben
      pixelGranted = true;
      pixelQueue.splice(0).forEach(function (cb) { try { cb(); } catch (e) {} });
    } else {
      pixelGranted = false;
      if (pixelLoaded) window.fbq('consent', 'revoke'); // Widerruf: Pixel sendet ab sofort nichts mehr
    }
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
    var a1 = el('a', '', t.privacy); a1.href = lang === 'en' ? '/privacy-policy/' : '/datenschutz/';
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
