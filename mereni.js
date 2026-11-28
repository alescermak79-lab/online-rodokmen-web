// Měření návštěvnosti: Google Analytics 4 s Consent Mode v2 + Sklik SEM + cookie lišta + lepicí tlačítko na mobilu.
// Bez souhlasu GA ani Sklik neukládají žádné cookies.
// Po kliknutí na „Přijmout“ se zapne plné měření. Volba se ukládá do localStorage („souhlas-mereni“).
(function () {
  var GA_ID = "G-5XRJP9NW8H";
  var SEM_ID = "ho4gar7nu84tkywcpoib57c8";
  var KLIC = "souhlas-mereni";
  // Odhad hodnoty objednávky rodokmenu (Kč): typicky 20–60 předků × 300 Kč → střed 40 × 300
  var ODHAD_OBJEDNAVKY = 12000;

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
  if (ulozeno === "ano") gtag("consent", "update", {
    ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted"
  });
  gtag("set", "ads_data_redaction", true);
  gtag("set", "url_passthrough", false);
  gtag("js", new Date());
  gtag("config", GA_ID);
  var s = document.createElement("script");
  s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);

  // --- Google Tag Manager (načítá se až po výchozím consentu výše, takže respektuje cookie lištu) ---
  window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  var g = document.createElement("script");
  g.async = true; g.src = "https://www.googletagmanager.com/gtm.js?id=GTM-W43N8CCL";
  document.head.appendChild(g);

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
    var gv = volba === "ano" ? "granted" : "denied";
    gtag("consent", "update", { analytics_storage: gv, ad_storage: gv, ad_user_data: gv, ad_personalization: gv });
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
    // Žádné osobní údaje: posíláme jen názvy typů polí, počty a pásma roků.
    var zacal = false, odeslano = false, posledni = "", videno = {}, krokCas = Date.now(), zacatekCas = 0;
    function typPole(el) {
      var n = (el && el.name) || "";
      if (!n) return el && el.id === "fotky" ? "doklad" : (el && el.classList && el.classList.contains("chip") ? "volba" : "");
      return n.replace(/^osoba\d+_/, "osoba_");
    }
    function aktKrok() { var k2 = document.getElementById("krok2"); return k2 && !k2.hidden ? 2 : 1; }
    function odhad() { var o = document.getElementById("sanceOdhad"); return o && o.value !== "" ? +o.value : -1; }
    function sek(od) { return Math.round((Date.now() - od) / 1000); }
    // Trychtýř: formular_zacatek -> formular_krok_1 -> formular_krok_1_hotovo -> formular_krok_2 -> generate_lead
    f.addEventListener("focusin", function (e) {
      if (!zacal) { zacal = true; zacatekCas = Date.now(); krokCas = Date.now(); udalost("formular_zacatek"); udalost("formular_krok_1", { krok: 1 }); }
      var p = typPole(e.target); if (!p) return;
      posledni = p;
      var id = aktKrok() + ":" + p;
      if (!videno[id]) { videno[id] = 1; udalost("formular_pole", { krok: aktKrok(), pole: p }); }
    });
    f.addEventListener("invalid", function (e) {
      udalost("formular_chyba", { krok: aktKrok(), pole: typPole(e.target) });
    }, true);
    document.addEventListener("formular:chyba", function (e) {
      udalost("formular_chyba", { krok: e.detail.krok, pole: e.detail.pole });
    });
    document.addEventListener("formular:dotaz", function () { udalost("formular_dotaz_zvolen", { posledni_pole: posledni || "?" }); });
    document.addEventListener("formular:hotovo", function (e) {
      udalost("formular_krok_" + e.detail.n + "_hotovo", { krok: e.detail.n, sekund: sek(krokCas), odhad: odhad() });
    });
    document.addEventListener("formular:sance", function (e) {
      udalost("formular_sance", { zona: e.detail.zona, odhad: e.detail.odhad });
    });
    document.addEventListener("formular:sance_navrh", function (e) {
      udalost("formular_sance_navrh", { navrh: e.detail.navrh, odhad: e.detail.odhad });
    });
    document.addEventListener("formular:krok", function (e) {
      udalost("formular_krok_" + e.detail.n, { krok: e.detail.n });
      krokCas = Date.now();
    });
    var fotky = document.getElementById("fotky");
    if (fotky) fotky.addEventListener("change", function () {
      if (fotky.files && fotky.files.length) udalost("doklad_pridan", { pocet: fotky.files.length });
    });
    var pridat = document.getElementById("pridat");
    if (pridat) pridat.addEventListener("click", function () { udalost("osoba_pridana"); });
    // Opuštění stránky s rozepsaným a neodeslaným formulářem: u kterého pole lidé skončili
    function opusteni() {
      if (zacal && !odeslano) { udalost("formular_opusten", { krok: aktKrok(), posledni_pole: posledni || "?", sekund: sek(zacatekCas), odhad: odhad(), transport_type: "beacon" }); zacal = false; }
    }
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") opusteni(); });
    window.addEventListener("pagehide", opusteni);

    function pasmo(rok) {
      if (!rok) return "bez_roku";
      if (rok <= 1910) return "do_1910";
      if (rok <= 1930) return "1911_1930";
      return "po_1930";
    }
    function kvalita() {
      var osoby = {}, k;
      for (k = 0; k < f.elements.length; k++) {
        var el = f.elements[k], m = /^osoba(\d+)_(\w+)$/.exec(el.name || "");
        if (m) { (osoby[m[1]] = osoby[m[1]] || {})[m[2]] = (el.value || "").trim(); }
      }
      var ids = Object.keys(osoby), nejstarsi = 0, rodice = 0, vyplnenych = 0;
      ids.forEach(function (i) {
        var o = osoby[i], r = /(1[5-9]\d\d|20\d\d)/.exec(o.rok || "");
        if (o.prijmeni || o.jmeno) vyplnenych++;
        if (r) { var y = +r[1]; if (!nejstarsi || y < nejstarsi) nejstarsi = y; }
        if (o.otec || o.matka || o.snatek_rodicu) rodice++;
      });
      return {
        osob: vyplnenych,
        doklad: fotky && fotky.files && fotky.files.length ? 1 : 0,
        nejstarsi_rok: pasmo(nejstarsi),
        s_rodici: rodice ? 1 : 0,
        s_poukazem: (f.elements["kod_poukazu"] && f.elements["kod_poukazu"].value) ? 1 : 0
      };
    }
    f.addEventListener("submit", function (e) {
      // Inline skript webu při neprojité kontrole volá preventDefault dřív než tento posluchač.
      if (e.defaultPrevented) { if (aktKrok() === 2) udalost("formular_zablokovan", { posledni_pole: posledni || "?" }); return; }
      odeslano = true;
      var rz = f.elements["rezim"] ? f.elements["rezim"].value : "objednavka";
      if (rz === "dotaz") { udalost("dotaz_odeslan", { transport_type: "beacon" }); try { sessionStorage.removeItem("sem-hodnota"); } catch (e3) {} return; }
      udalost("generate_lead", { formular: "objednavka", transport_type: "beacon" });
      var q = kvalita(); q.sekund = sek(zacatekCas); q.transport_type = "beacon";
      udalost("formular_kvalita", q);
      // Hodnota pro Sklik: u poukazu zvolená částka, u objednávky odhad typického rodokmenu
      var c = f.querySelector('input[name="castka"]:checked');
      var hodnota = c ? parseInt(c.value, 10) : ODHAD_OBJEDNAVKY;
      try { sessionStorage.setItem("sem-hodnota", String(hodnota)); } catch (e2) {}
    });
  }

  // --- Jak daleko lidé na stránce došli a co otevírají ---
  if ("IntersectionObserver" in window) {
    var videno = {};
    var io = new IntersectionObserver(function (z) {
      z.forEach(function (x) {
        var id = x.target.id;
        if (x.isIntersecting && !videno[id]) { videno[id] = 1; udalost("sekce_videna", { sekce: id }); }
      });
    }, { threshold: 0.35 });
    ["jak", "hotovy", "cena", "pripravit", "objednat", "faq"].forEach(function (id) {
      var el = document.getElementById(id); if (el) io.observe(el);
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll("#faq details"), function (d, i) {
    d.addEventListener("toggle", function () { if (d.open) udalost("faq_otevreno", { otazka: i + 1 }); });
  });
  if (/dekujeme\.html/.test(location.pathname) && /dotaz=1/.test(location.search)) {
    // Dotaz bez podkladů: není to objednávka, do konverzí reklam nepočítáme.
  } else if (/dekujeme\.html/.test(location.pathname)) {
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
