"""Lot 4 : vérifie en ligne les designs du lot 4 publiés par Léo (fichier HD, aperçu, vignettes, prix, pages française et anglaise)
et télécharge leurs aperçus pour contrôler l'image contre la photo du musée."""
import html, io, json, os, re, subprocess, urllib.request
from PIL import Image

UA = {"User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/verification)"}
SITE = "https://latelier-sous-la-maison.com"
REGISTRE = json.load(open("outil/lot4/lot4-registre.json"))
REFS = [e["cle"] for e in REGISTRE]


def lire(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, b""
    except Exception as e:
        return 0, repr(e).encode()


def texte(b):
    return html.unescape(b.decode("utf-8", "replace"))


code, corps = lire("https://latelier-sous-la-maison.pages.dev/api/catalogue")
cat = json.loads(corps)["designs"]
par_ref = {(d.get("droits") or {}).get("reference"): d for d in cat}
os.makedirs("outil/verif/lot4", exist_ok=True)
c_exp, b_exp = lire(SITE + "/explorer/")
explorer = texte(b_exp)
bilan, defauts = [], []
for ref in REFS:
    d = par_ref.get(ref)
    if not d:
        defauts.append({"ref": ref, "probleme": "pas publié"})
        bilan.append({"ref": ref, "publie": False})
        continue
    L = d.get("livrables") or []
    info = {"ref": ref, "publie": True, "id": d["id"], "slug": d["slug"], "titre": d["titre"], "prix": d.get("prix"),
            "livrables": [[l.get("largeur"), l.get("hauteur"), l.get("format")] for l in L], "image": d.get("image")}
    nom = re.sub(r"[^A-Za-z0-9.-]+", "_", ref)
    c, b = lire(SITE + d["image"]) if d.get("image") else (0, b"")
    if c == 200:
        im = Image.open(io.BytesIO(b)).convert("RGB")
        info["apercu"] = list(im.size)
        im.thumbnail((420, 420))
        im.save("outil/verif/lot4/%s.jpg" % nom, "JPEG", quality=85)
    else:
        defauts.append({"ref": ref, "probleme": "aperçu illisible", "code": c})
    for langue, chemin, titre, prix in (("fr", "/motif/%s/" % d["slug"], d["titre"], "29,99"),
                                       ("en", "/en/pattern/%s/" % d["slug"], (d.get("en") or {}).get("titre"), "34.99")):
        c, b = lire(SITE + chemin)
        t = texte(b)
        h1 = re.search(r"<h1[^>]*>(.*?)</h1>", t, re.S)
        h1 = html.unescape(re.sub(r"<[^>]+>", "", h1.group(1))).strip() if h1 else ""
        visible = re.sub(r"<script.*?</script>", " ", t, flags=re.S)
        ok = c == 200 and h1 == titre and prix in visible
        info[langue] = {"code": c, "h1": h1, "titre_ok": h1 == titre, "prix_ok": prix in visible}
        if not ok:
            defauts.append({"ref": ref, "page": chemin, **info[langue]})
    vign = "/vignettes/" + re.sub(r"[^a-zA-Z0-9-]+", "-", re.sub(r"\.[a-z0-9]+$", "", d["image"].replace("/media/apercus/", ""))) + "-400.webp"
    cv, bv = lire(SITE + vign)
    info["vignette"] = {"code": cv, "octets": len(bv), "dans_explorer": vign in explorer}
    if cv != 200 or vign not in explorer:
        defauts.append({"ref": ref, "probleme": "vignette", **info["vignette"]})
    grand = max([max(l.get("largeur") or 0, l.get("hauteur") or 0) for l in L] or [0])
    if len(L) != 1 or grand < 4000:
        defauts.append({"ref": ref, "probleme": "fichier HD", "livrables": info["livrables"]})
    if (d.get("prix") or {}).get("eur") != 29.99:
        defauts.append({"ref": ref, "probleme": "prix", "prix": d.get("prix")})
    bilan.append(info)

c, b = lire(SITE + "/sitemap.xml")
nb = len(re.findall(r"<loc>", texte(b)))
json.dump({"bilan": bilan, "defauts": defauts, "sitemap": nb, "publies": len(cat)}, open("outil/verif/lot4.json", "w"), ensure_ascii=False, indent=1)
print("publiés au total :", len(cat), "| lot 4 publiés :", sum(1 for x in bilan if x["publie"]), "sur", len(REFS), "| plan du site :", nb, "adresses")
print("défauts :", len(defauts))
for x in defauts:
    print("DÉFAUT", json.dumps(x, ensure_ascii=False))
for x in bilan:
    print(x.get("ref"), x.get("id"), x.get("livrables"), x.get("apercu"))
non_publies = [x["ref"] for x in bilan if not x["publie"]]
print("non publiés :", len(non_publies), non_publies)
orig11 = next((d for d in cat if d["id"] == "orig-0011"), None)
print("orig-0011 publié :", bool(orig11))
