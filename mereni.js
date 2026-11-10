// Měření návštěvnosti: Google Analytics 4 s Consent Mode v2 + cookie lišta + lepicí tlačítko na mobilu.
// Bez souhlasu GA neukládá žádné cookies (posílá jen anonymní pingy bez identifikátorů).
// Po kliknutí na „Přijmout“ se zapne plné měření. Volba se ukládá do localStorage („souhlas-mereni“).
(function () {
var GA_ID = "G-5XRJP9NW8H";
var KLIC = "souhlas-mereni";

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

function udalost(nazev, param) {
  try { gtag("event", nazev, param || {}); } catch (e) {}
}

// --- Cookie lišta ---
function nastav(volba) {
  try { localStorage.setItem(KLIC, volba); localStorage.removeItem("cookies-ok"); } catch (e) {}
  gtag("consent", "update", { analytics_storage: volba === "ano" ? "granted" : "denied" });
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
  b.innerHTML = '<div>Pro zlepšování webu bychom rádi měřili návštěvnost pomocí Google Analytics (analytické cookies). Reklamní cookies nepoužíváme. ' +
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
  f.addEventListener("submit", function () { udalost("generate_lead", { formular: "objednavka", transport_type: "beacon" }); });
}
if (/dekujeme\.html/.test(location.pathname)) {
  udalost(/poukaz=1/.test(location.search) ? "poukaz_odeslan" : "objednavka_odeslana");
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
