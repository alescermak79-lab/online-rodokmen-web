// Měření návštěvnosti bez cookies (GoatCounter) + lepicí tlačítko na mobilu.
// Měření se zapne, až se sem vepíše kód účtu z goatcounter.com (viz GC_KOD). Do té doby se nic nikam neposílá.
(function () {
  var GC_KOD = ""; // např. "online-rodokmen" → https://online-rodokmen.goatcounter.com
  function udalost(nazev) {
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "udalost/" + nazev, title: nazev, event: true }); } catch (e) {}
  }
  if (GC_KOD) {
    var s = document.createElement("script");
    s.async = true; s.src = "https://gc.zgo.at/count.js";
    s.setAttribute("data-goatcounter", "https://" + GC_KOD + ".goatcounter.com/count");
    document.head.appendChild(s);
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-ev]");
    if (a) udalost(a.getAttribute("data-ev"));
  });
  var f = document.getElementById("f");
  if (f) {
    var zacal = false;
    f.addEventListener("focusin", function () { if (!zacal) { zacal = true; udalost("formular-zacatek"); } });
    f.addEventListener("submit", function () { udalost("formular-odeslan"); });
  }
  // lepicí CTA: ukáže se po odrolování hero, schová se u formuláře
  var st = document.getElementById("sticky"), hero = document.querySelector(".hero"), form = document.getElementById("objednat");
  if (st && hero && form && "IntersectionObserver" in window) {
    var vHero = true, uFormu = false;
    var obnov = function () { st.hidden = vHero || uFormu; };
    new IntersectionObserver(function (z) { vHero = z[0].isIntersecting; obnov(); }).observe(hero);
    new IntersectionObserver(function (z) { uFormu = z[0].isIntersecting; obnov(); }, { rootMargin: "0px 0px -20% 0px" }).observe(form);
  }
})();
