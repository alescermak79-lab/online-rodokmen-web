// Měření návštěvnosti: Google Analytics 4 s Consent Mode v2 + Sklik SEM + cookie lišta + lepicí tlačítko na mobilu.
// Bez souhlasu GA ani Sklik neukládají žádné cookies.
// Po kliknutí na „Přijmout“ se zapne plné měření. Volba se ukládá do localStorage („souhlas-mereni“).
(function () {
  var GA_ID = "G-5XRJP9NW8H";
  var SEM_ID = "ho4gar7nu84tkywcpoib57c8";
  var KLIC = "souhlas-mereni";
  // Odhad hodnoty objednávky rodokmenu (Kč): typicky 20–60 předků × 150 Kč → střed 40 × 150
  var ODHAD_OBJEDNAVKY = 6000;

  // --- Google Analytics + výchozí souhlas (zamítnuto) ---
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  var ulozeno = null;
  try { ulozeno = localStorage.getItem(KLIC); } catch (e) {}
  gtag("consent", "default", {
    ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
    analytics_storage: ulozeno === "ano" ? "granted" : "denied",
    wait_for_update: 500
  });
  gtag("set", "ads_data_redaction", true);
  gtag("set", "url_passthrough", false);
  gtag("js", new Date());
  gtag("config", GA_ID);
  var s = document.createElement("script");
  s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);

  // --- Sklik SEM (retargeting + konverze) ---
  var semFronta = [];
  function sem() {
    var a = arguments;
    if (typeof window.SEM === "function") window.SEM.apply(window, a);
    else semFronta.push(a);
  }
  function semSouhlas(ano) {
    var v = ano ? "granted" : "denied";
    sem("updateConsent", { consent_mode: {
      ad_storage: v, ad_user_data: v, ad_personalization: v,
      functionality_storage: "denied", analytics_storage: "denied"
    } });
  }
  semSouhlas(ulozeno === "ano");
  sem("track", "PageView");
  var ss = document.createElement("script");
  ss.async = true; ss.src = "https://l.seznam.cz/sul.js?id=" + SEM_ID;
  ss.onload = function () {
    if (typeof window.SEM !== "function") return;
    semFronta.forEach(function (a) { window.SEM.apply(window, a); });
    semFronta = [];
  };
  document.head.appendChild(ss);

  function udalost(nazev, param) {
    try { gtag("event", nazev, param || {}); } catch (e) {}
  }

  // --- Cookie lišta ---
  function nastav(volba) {
    try { localStorage.setItem(KLIC, volba); localStorage.removeItem("cookies-ok"); } catch (e) {}
    gtag("consent", "update", { analytics_storage: volba === "ano" ? "granted" : "denied" });
    semSouhlas(volba === "ano");
    if (volba !== "ano") {
      // smazat případné GA cookies
      document.cookie.split(";").forEach(function (c) {
        var n = c.split("=")[0].trim();
        if (/^_ga/.test(n)) {
          var d = location.hostname.replace(/^www\./, "");
          document.cookie = n + "=; Max-Age=0; path=/; domain=." + d;
          document.cookie = n + "=; Max-Age=0; path=/";
        }
      });
    }
    var b = document.getElementById("cookies");
    if (b) b.hidden = true;
  }
  function lista() {
    var b = document.getElementById("cookies");
    if (!b) {
      b = document.createElement("div");
      b.id = "cookies"; b.className = "cookies"; b.hidden = true;
      document.body.appendChild(b);
    }
    b.setAttribute("role", "dialog");
    b.setAttribute("aria-label", "Souhlas s měřením návštěvnosti");
    b.innerHTML = '<div>Pro zlepšování webu bychom rádi měřili návštěvnost pomocí Google Analytics (analytické cookies) a měřili účinnost reklamy v Skliku od Seznamu (marketingové cookies). ' +
      'V prohlížeči ukládáme i rozepsaný formulář, abyste o něj nepřišli. <a href="ochrana-udaju.html#cookies-info">Více o ochraně údajů</a></div>' +
      '<div class="cookies-tl"><button class="btn btn-sek" type="button" data-volba="ne">Jen nezbytné</button>' +
      '<button class="btn" type="button" data-volba="ano">Přijmout</button></div>';
    b.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("[data-volba]");
      if (t) nastav(t.getAttribute("data-volba"));
    });
    return b;
  }
  function init() {
    var b = lista();
    if (ulozeno !== "ano" && ulozeno !== "ne") b.hidden = false;
    document.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("[data-cookies-nastaveni]");
      if (t) { e.preventDefault(); b.hidden = false; }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();

  // --- Události ---
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-ev]");
    if (a) udalost("klik_cta", { umisteni: a.getAttribute("data-ev") });
  });
  var f = document.getElementById("f");
  if (f) {
    var zacal = false;
    f.addEventListener("focusin", function () { if (!zacal) { zacal = true; udalost("formular_zacatek"); } });
    f.addEventListener("submit", function () {
      udalost("generate_lead", { formular: "objednavka", transport_type: "beacon" });
      // Hodnota pro Sklik: u poukazu zvolená částka, u objednávky odhad typického rodokmenu
      var c = f.querySelector('input[name="castka"]:checked');
      var hodnota = c ? parseInt(c.value, 10) : ODHAD_OBJEDNAVKY;
      try { sessionStorage.setItem("sem-hodnota", String(hodnota)); } catch (e) {}
    });
  }
  if (/dekujeme\.html/.test(location.pathname)) {
    var poukaz = /poukaz=1/.test(location.search);
    udalost(poukaz ? "poukaz_odeslan" : "objednavka_odeslana");
    // Sklik konverze s proměnnou hodnotou (uloženou při odeslání formuláře)
    var h = null;
    try { h = parseInt(sessionStorage.getItem("sem-hodnota"), 10); sessionStorage.removeItem("sem-hodnota"); } catch (e) {}
    if (!h || isNaN(h)) h = poukaz ? 3000 : ODHAD_OBJEDNAVKY;
    sem("track", "Lead", { currency: "CZK", value: h });
  }

  // --- Lepicí CTA: ukáže se po odrolování hero, schová se u formuláře ---
  var st = document.getElementById("sticky"), hero = document.querySelector(".hero"), form = document.getElementById("objednat");
  if (st && hero && form && "IntersectionObserver" in window) {
    var vHero = true, uFormu = false;
    var obnov = function () { st.hidden = vHero || uFormu; };
    new IntersectionObserver(function (z) { vHero = z[0].isIntersecting; obnov(); }).observe(hero);
    new IntersectionObserver(function (z) { uFormu = z[0].isIntersecting; obnov(); }, { rootMargin: "0px 0px -20% 0px" }).observe(form);
  }
})();
