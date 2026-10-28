"""Vérifie les 41 designs agrandis : télécharge l'aperçu publié de chacun et, pour les pièces de musée,
la vignette du musée, pour contrôler que chaque fiche porte bien la bonne image."""
import io, json, os, urllib.request
from PIL import Image

UA = {"User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/verification)"}
SITE = "https://latelier-sous-la-maison.com"
MET = {"2010.337": "https://images.metmuseum.org/CRDImages/as/web-large/DP-23279-001.jpg"}
CIBLES = ["dp-%04d" % i for i in range(11, 50)] + ["orig-0006", "orig-0011"]


def lire(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
        return r.read()


def vignette(donnees, chemin):
    im = Image.open(io.BytesIO(donnees)).convert("RGB")
    taille = list(im.size)
    im.thumbnail((420, 420))
    im.save(chemin, "JPEG", quality=85)
    return taille


cat = {d["id"]: d for d in json.loads(lire("https://latelier-sous-la-maison.pages.dev/api/catalogue"))["designs"]}
os.makedirs("outil/verif", exist_ok=True)
liste = []
for i in CIBLES:
    d = cat.get(i)
    info = {"id": i, "publie": bool(d)}
    if d:
        info.update({k: d.get(k) for k in ("slug", "titre", "image", "livrables", "ratio")})
        info["reference"] = (d.get("droits") or {}).get("reference")
        try:
            info["apercu"] = vignette(lire(SITE + d["image"]), "outil/verif/%s-site.jpg" % i)
        except Exception as e:
            info["erreur_apercu"] = repr(e)
        ref = info["reference"]
        if ref:
            try:
                if ref in MET:
                    url = MET[ref]
                else:
                    data = json.loads(lire("https://openaccess-api.clevelandart.org/api/artworks/%s?fields=images" % ref))["data"]
                    url = data["images"]["web"]["url"]
                info["musee"] = vignette(lire(url), "outil/verif/%s-musee.jpg" % i)
            except Exception as e:
                info["erreur_musee"] = repr(e)
    liste.append(info)
json.dump(liste, open("outil/verif/liste-agrandis.json", "w"), ensure_ascii=False, indent=1)
print(sum(1 for x in liste if x["publie"]), "publiés sur", len(liste))
print("erreurs :", [x["id"] for x in liste if "erreur_apercu" in x or "erreur_musee" in x])
