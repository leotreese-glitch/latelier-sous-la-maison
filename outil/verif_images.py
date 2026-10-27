"""Télécharge l'aperçu publié de chaque création de l'atelier, pour vérifier que chaque titre est sur la bonne image."""
import io, json, os, urllib.request
from PIL import Image

UA = {"User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/verification)"}
SITE = "https://latelier-sous-la-maison.com"


def lire(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
        return r.read()


cat = json.loads(lire("https://latelier-sous-la-maison.pages.dev/api/catalogue"))["designs"]
os.makedirs("outil/verif", exist_ok=True)
liste = []
for d in cat:
    if d.get("famille") != "atelier":
        continue
    info = {k: d.get(k) for k in ("id", "slug", "titre", "statut", "image", "hd", "couleurs", "technique", "cartel", "ia")}
    info["en"] = d.get("en")
    try:
        im = Image.open(io.BytesIO(lire(SITE + d["image"]))).convert("RGB")
        info["apercu"] = list(im.size)
        im.thumbnail((512, 512))
        im.save("outil/verif/%s.jpg" % d["id"], "JPEG", quality=85)
    except Exception as e:
        info["erreur"] = repr(e)
    liste.append(info)
json.dump(liste, open("outil/verif/liste.json", "w"), ensure_ascii=False, indent=1)
print(len(liste), "créations de l'atelier publiées")
