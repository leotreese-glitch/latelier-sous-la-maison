"""Vérifie en ligne, après la reconstruction du site : les 40 designs agrandis répondent avec le nouveau prix
(29,99 € en français, $34.99 en anglais), et les 16 fiches « Exemple » supprimées répondent 404."""
import html, json, os, re, urllib.request

SITE = "https://latelier-sous-la-maison.com"
UA = {"User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/verification)"}


def lire(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception as e:
        return 0, repr(e)


cat = json.loads(lire("https://latelier-sous-la-maison.pages.dev/api/catalogue")[1])["designs"]
bilan = {"publies": len(cat), "prix": {}, "exemples_restants": [d["id"] for d in cat if d.get("exemple")]}
for d in cat:
    k = json.dumps(d.get("prix"), sort_keys=True)
    bilan["prix"][k] = bilan["prix"].get(k, 0) + 1

defauts = []
for d in cat:
    for langue, chemin, attendu in (("fr", "/motif/%s/" % d["slug"], "29,99"), ("en", "/en/pattern/%s/" % d["slug"], "34.99")):
        code, page = lire(SITE + chemin)
        texte = html.unescape(page)
        if code != 200 or attendu not in texte or re.search(r"\b1[25] ?€|\$1[47]\b", texte):
            defauts.append({"page": chemin, "code": code, "prix_ok": attendu in texte})

exemples = ["meandre-a-la-grecque", "ecailles-dorees", "quadrilobes-gothiques", "semis-de-fleurettes", "rayure-fleurie",
            "etoiles-a-huit-branches", "eventails", "treillage-de-feuilles", "ikat-losange", "feuilles-de-chanvre",
            "nuit-au-jardin", "racines-dorees", "la-grande-rosace", "l-oiseau-des-indiennes", "la-maison-et-son-atelier",
            "le-poisson-a-ecailles"]
for slug in exemples:
    for chemin in ("/motif/%s/" % slug, "/en/pattern/%s/" % slug):
        code, _ = lire(SITE + chemin)
        if code != 404:
            defauts.append({"page": chemin, "code": code, "attendu": 404})

code, plan = lire(SITE + "/sitemap.xml")
bilan.update({"pages_en_defaut": defauts, "sitemap_urls": len(re.findall(r"<loc>", plan))})
os.makedirs("outil/recherche", exist_ok=True)
json.dump(bilan, open("outil/recherche/pages-bilan.json", "w"), ensure_ascii=False, indent=1)
print("designs publiés :", bilan["publies"], "| prix :", bilan["prix"], "| exemples restants :", bilan["exemples_restants"])
print("pages vérifiées :", 2 * len(cat) + 2 * len(exemples), "| en défaut :", len(defauts), "| plan du site :", bilan["sitemap_urls"], "adresses")
for x in defauts[:40]:
    print("DÉFAUT", x)
