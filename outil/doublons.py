"""Lot 4 : copie le catalogue publié et télécharge l'aperçu de chaque design en ligne (vignette 400 px),
pour comparer les 70 pièces du lot 4 aux designs déjà sur le site. Sortie : outil/verif/en-ligne/."""
import io, json, os, urllib.request
from PIL import Image

UA = {"User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/verification)"}
SITE = "https://latelier-sous-la-maison.com"
os.makedirs("outil/verif/en-ligne", exist_ok=True)


def lire(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
        return r.read()


cat = json.loads(lire("https://latelier-sous-la-maison.pages.dev/api/catalogue"))["designs"]
json.dump(cat, open("outil/verif/en-ligne/catalogue.json", "w"), ensure_ascii=False, indent=0)
ok = 0
for d in cat:
    try:
        im = Image.open(io.BytesIO(lire(SITE + d["image"]))).convert("RGB")
        im.thumbnail((400, 400), Image.LANCZOS)
        im.save("outil/verif/en-ligne/%s.jpg" % d["id"], "JPEG", quality=82)
        ok += 1
    except Exception as e:
        print("ECHEC", d.get("id"), d.get("image"), repr(e))
print("designs publiés :", len(cat), "| aperçus copiés :", ok)
