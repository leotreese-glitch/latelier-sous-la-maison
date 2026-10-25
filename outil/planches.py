"""Planches de vignettes pour choisir sur pièces, et vignettes WebP pour le registre.
Entrée : outil/planches.json, liste de {id, musee, ref, vignette, original?}. Sortie : outil/planches/ et outil/apercus/."""
import io, json, os, struct, time, urllib.request
from PIL import Image, ImageDraw, ImageFont

Image.MAX_IMAGE_PIXELS = None
UA = {"User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/1.0)", "AIC-User-Agent": "latelier-sous-la-maison (registre des motifs retrouves)", "Accept": "image/*,*/*"}
CASE, COLS, LIGNES = 340, 5, 4


def lire(url, essais=3, plage=None):
    err = None
    for i in range(essais):
        try:
            h = dict(UA)
            if plage:
                h["Range"] = "bytes=0-%d" % plage
            with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=120) as r:
                return r.read()
        except Exception as e:
            err = e
            time.sleep(2 + 4 * i)
    raise err


def taille_distante(url):
    """Dimensions d'une grande image sans la télécharger entière (en-tête JPEG)."""
    for plage in (262143, 2097151, None):
        try:
            corps = lire(url, plage=plage)
            return Image.open(io.BytesIO(corps)).size
        except Exception:
            continue
    return None


try:
    POLICE = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 15)
except Exception:
    POLICE = ImageFont.load_default()

pieces = json.load(open("outil/planches.json"))
os.makedirs("outil/planches", exist_ok=True)
os.makedirs("outil/apercus", exist_ok=True)
bilan = {}
vignettes = []
for p in pieces:
    try:
        chemin = "outil/apercus/%s.webp" % p["id"]
        if os.path.exists(chemin):
            img = Image.open(chemin).convert("RGB")
        else:
            img = Image.open(io.BytesIO(lire(p["vignette"]))).convert("RGB")
            img.thumbnail((640, 640), Image.LANCZOS)
            img.save(chemin, "WEBP", quality=74, method=6)
        info = {"ok": True}
        if p.get("original"):
            t = taille_distante(p["original"])
            info["taille"] = list(t) if t else None
        bilan[p["id"]] = info
        vignettes.append((p, img))
    except Exception as e:
        bilan[p["id"]] = {"ok": False, "erreur": repr(e)}
        vignettes.append((p, None))

par_planche = COLS * LIGNES
for n in range(0, len(vignettes), par_planche):
    lot = vignettes[n:n + par_planche]
    planche = Image.new("RGB", (COLS * CASE, LIGNES * (CASE + 26)), (238, 230, 211))
    d = ImageDraw.Draw(planche)
    for k, (p, img) in enumerate(lot):
        x, y = (k % COLS) * CASE, (k // COLS) * (CASE + 26)
        if img is not None:
            v = img.copy()
            v.thumbnail((CASE - 10, CASE - 10), Image.LANCZOS)
            planche.paste(v, (x + (CASE - v.size[0]) // 2, y + 5 + (CASE - 10 - v.size[1]) // 2))
        else:
            d.text((x + 20, y + CASE // 2), "image indisponible", fill=(158, 43, 37), font=POLICE)
        d.text((x + 6, y + CASE + 2), "%s  %s" % (p["id"], p["ref"]), fill=(23, 30, 51), font=POLICE)
    planche.save("outil/planches/planche-%02d.jpg" % (n // par_planche + 1), "JPEG", quality=80)

json.dump(bilan, open("outil/planches/bilan.json", "w"), indent=1)
print(sum(v["ok"] for v in bilan.values()), "sur", len(bilan))

# Taille maximale servie par Chicago (IIIF) : essai sur la première pièce de Chicago.
aic = [p for p in pieces if p["musee"] == "aic"]
if aic:
    base = aic[0]["vignette"].split("/full/")[0]
    essais = {}
    for t in ["6000,", "4000,", "3000,", "pct:100"]:
        try:
            corps = lire("%s/full/%s/0/default.jpg" % (base, t), essais=1)
            essais[t] = list(Image.open(io.BytesIO(corps)).size)
        except Exception as e:
            essais[t] = repr(e)
    json.dump(essais, open("outil/planches/aic-tailles.json", "w"), indent=1)
    print(essais)
