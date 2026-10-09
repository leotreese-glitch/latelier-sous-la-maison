"""Télécharge une vignette de chaque pièce (images CC0 des musées) et l'enregistre en WebP."""
import io, json, os, time, urllib.request
from PIL import Image

UA = {"User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/1.0)", "AIC-User-Agent": "latelier-sous-la-maison (registre des motifs retrouves)", "Accept": "image/avif,image/webp,image/*,*/*"}
AIC = {"1953.306": "068dbf9d-76ec-d053-2b32-6e4e89934387"}
MET = {"2010.337": "https://images.metmuseum.org/CRDImages/as/web-large/DP-23279-001.jpg"}

def lire(url, essais=3):
    for i in range(essais):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return r.read()
        except Exception as e:
            err = e; time.sleep(2 + 3 * i)
    raise err

def source(p):
    if p["musee"] == "cma":
        try:
            data = json.loads(lire("https://openaccess-api.clevelandart.org/api/artworks/%s?fields=images,share_license_status" % p["ref"]))["data"]
            assert data["share_license_status"] == "CC0"
            return data["images"]["web"]["url"]
        except Exception:
            return "https://openaccess-cdn.clevelandart.org/%s/%s_web.jpg" % (p["ref"], p["ref"])
    if p["musee"] == "aic":
        return "https://www.artic.edu/iiif/2/%s/full/843,/0/default.jpg" % AIC[p["ref"]]
    return MET[p["ref"]]

os.makedirs("outil/apercus", exist_ok=True)
bilan = json.load(open("outil/apercus/bilan.json")) if os.path.exists("outil/apercus/bilan.json") else {}
for p in json.load(open("outil/pieces.json")):
    if os.path.exists("outil/apercus/%s.webp" % p["id"]):
        continue
    try:
        url = source(p)
        img = Image.open(io.BytesIO(lire(url))).convert("RGB")
        img.thumbnail((640, 640), Image.LANCZOS)
        img.save("outil/apercus/%s.webp" % p["id"], "WEBP", quality=74, method=6)
        bilan[p["id"]] = {"ok": True, "url": url, "taille": img.size}
    except Exception as e:
        bilan[p["id"]] = {"ok": False, "erreur": repr(e)}
json.dump(bilan, open("outil/apercus/bilan.json", "w"), indent=1)
print(sum(v["ok"] for v in bilan.values()), "sur", len(bilan))
