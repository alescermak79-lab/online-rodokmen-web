# -*- coding: utf-8 -*-
"""Generuje ukázkový rodokmen (smyšlená rodina) jako inline SVG pro úvodní stránku.
Spuštění: python3 img/strom.py > img/strom.svg  (výsledek se vkládá do index.html)."""

W, H = 200, 58          # karta
DX = 236                # rozestup generací
DY = 74                 # rozestup listů
X0, Y0 = 16, 22

# (jméno, roky/místo, zdroj, jistota, otec, matka) – jistota: dolozeno | doklad | pravdepodobne
P = {}
def o(k, jmeno, data, zdroj, jist="dolozeno", otec=None, matka=None):
    P[k] = dict(jmeno=jmeno, data=data, zdroj=zdroj, jist=jist, otec=otec, matka=matka)

o("jiri",   "Jiří Dvořák",              "∗ okolo 1728 · † 1791 Trhová Kamenice", "Z Trhová Kamenice 1791, fol. 203")
o("matej1", "Matěj Dvořák",             "∗ 1762 Trhová Kamenice",   "N Trhová Kamenice 1762, fol. 41", otec="jiri")
o("alzb",   "Alžběta roz. Zemanová",    "∗ 1768 Možděnice",          "O Trhová Kamenice 1789, fol. 17")
o("jakub",  "Jakub Dvořák",             "∗ 1797 Trhová Kamenice",   "N Trhová Kamenice 1797, fol. 112", otec="matej1", matka="alzb")
o("dorota", "Dorota roz. Vlčková",      "∗ 1803 Petrkov",            "O Trhová Kamenice 1826, fol. 9")
o("matej2", "Matěj Dvořák",             "∗ 1831 Trhová Kamenice",   "N Trhová Kamenice 1831, fol. 12", otec="jakub", matka="dorota")
o("vaclavv","Václav Vávra",             "∗ 1801 Horní Bradlo",       "O Horní Bradlo 1834, fol. 22")
o("rosalie","Rosalie roz. Pešková",     "∗ 1809 Lipka",              "O Horní Bradlo 1834, fol. 22")
o("barb",   "Barbora roz. Vávrová",     "∗ 1837 Horní Bradlo",       "N Horní Bradlo 1837, fol. 58", otec="vaclavv", matka="rosalie")
o("jan",    "Jan Dvořák",               "∗ 1870 Trhová Kamenice · † 1944", "N Trhová Kamenice 1870, fol. 77", otec="matej2", matka="barb")
o("pilar",  "Josef Pilař",              "∗ okolo 1839 Horní Bradlo", "jmenován v zápisu dcery 1873", "pravdepodobne")
o("kudrna", "Anna roz. Kudrnová",       "∗ okolo 1846 Vápenný Podol","jmenována v zápisu dcery 1873", "pravdepodobne")
o("kat",    "Kateřina roz. Pilařová",   "∗ 1873 Horní Bradlo",       "N Horní Bradlo 1873, fol. 131", otec="pilar", matka="kudrna")
o("josef",  "Josef Dvořák",             "∗ 1903 Trhová Kamenice · † 1967", "N Trhová Kamenice 1903, fol. 15", otec="jan", matka="kat")
o("tomas",  "Tomáš Hrubý",              "∗ 1805 Seč",                "O Seč 1836, fol. 44")
o("veron",  "Veronika roz. Horáková",   "∗ okolo 1811 Proseč",       "O Seč 1836, fol. 44", "pravdepodobne")
o("janh",   "Jan Hrubý",                "∗ 1838 Seč",                "N Seč 1838, fol. 92", otec="tomas", matka="veron")
o("sedl",   "Marie roz. Sedláková",     "∗ 1843 Seč",                "N Seč 1843, fol. 140")
o("vaclavh","Václav Hrubý",             "∗ 1871 Seč · † 1951",       "N Seč 1871, fol. 8", otec="janh", matka="sedl")
o("anton",  "Antonín Novotný",          "∗ 1849 Běstvina",           "N Běstvina 1849, fol. 61")
o("terez",  "Terezie roz. Kopecká",     "∗ 1852 Běstvina",           "N Běstvina 1852, fol. 70")
o("frant",  "Františka roz. Novotná",   "∗ 1881 Běstvina",           "N Běstvina 1881, fol. 23", otec="anton", matka="terez")
o("anna",   "Anna roz. Hrubá",          "∗ 1908 Seč · † 1989",       "N Seč 1908, fol. 33", otec="vaclavh", matka="frant")
o("marie",  "Marie Dvořáková",          "∗ 1930 Nasavrky",           "rodný list (vaše podklady)", "doklad", otec="josef", matka="anna")

pos = {}
slot = [0]
def umisti(k, gen):
    p = P[k]
    ys = []
    for r in ("otec", "matka"):
        if p[r]:
            ys.append(umisti(p[r], gen + 1))
    if ys:
        y = sum(ys) / len(ys)
    else:
        y = Y0 + slot[0] * DY
        slot[0] += 1
    pos[k] = (X0 + gen * DX, y)
    return y

umisti("marie", 0)
TOTAL_W = X0 + 7 * DX - (DX - W) + 16
TOTAL_H = Y0 + slot[0] * DY - (DY - H) + 22

BADGE = {
    "dolozeno": ("✓ doloženo", "#e3f0e9", "#2f6b55"),
    "doklad": ("✓ z dokladu", "#ebe6dd", "#5a4a3c"),
    "pravdepodobne": ("? pravděpodobně", "#f7ead3", "#8a5a12"),
}

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;")

out = []
out.append(f'<svg id="strom" class="strom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {TOTAL_W:.0f} {TOTAL_H:.0f}" role="img" aria-label="Ukázka hotového rodokmenu smyšlené rodiny: šest generací od roku 1930 zpět k roku 1728, u každé osoby odkaz na matriční zápis a míra jistoty" data-w="{TOTAL_W:.0f}" data-h="{TOTAL_H:.0f}">')
out.append('<rect width="100%" height="100%" fill="#f7f3ec"/>')
# linky
lines = []
for k, p in P.items():
    x, y = pos[k]
    for r, barva in (("otec", "#6b8bc2"), ("matka", "#c66f63")):
        if p[r]:
            px, py = pos[p[r]]
            xm = x + W + (DX - W) / 2
            lines.append(f'<path d="M{x+W:.0f} {y+H/2:.0f} H{xm:.0f} V{py+H/2:.0f} H{px:.0f}" stroke="{barva}" stroke-width="1.6" fill="none"/>')
out.append('<g class="linky">' + "".join(lines) + "</g>")
# karty
for k, p in P.items():
    x, y = pos[k]
    txt, bg, fg = BADGE[p["jist"]]
    bw = 9 + len(txt) * 5.6
    out.append(
        f'<g class="karta" id="k-{k}" transform="translate({x:.0f} {y:.0f})">'
        f'<rect width="{W}" height="{H}" rx="9" fill="#fffdf8" stroke="#e3dbcf"/>'
        f'<text x="12" y="22" class="jm">{esc(p["jmeno"])}</text>'
        f'<text x="12" y="37" class="dt">{esc(p["data"])}</text>'
        f'<text x="12" y="50" class="zd">{esc(p["zdroj"])}</text>'
        f'<rect x="{W-bw-6:.0f}" y="-8" width="{bw:.0f}" height="16" rx="8" fill="{bg}" stroke="#fffdf8"/>'
        f'<text x="{W-6-bw/2:.0f}" y="3.5" class="bd" text-anchor="middle" fill="{fg}">{esc(txt)}</text>'
        "</g>"
    )
out.append("</svg>")
print("".join(out))
