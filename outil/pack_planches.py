"""Packs exclusifs : vignettes et planches des candidats d'un pack, pour choisir sur pièces.
Entrée : outil/pack/<pack>-candidats.json ({pieces: [...], met: {requetes: [...]}}), pack actif dans outil/pack/actuel.txt.
Le Met (Open Access, images du domaine public en CC0) est interrogé si des requêtes sont données.
Sortie : outil/apercus/<id>.webp, outil/planches/<pack>-NN.jpg, outil/pack/<pack>-met.json, outil/planches/bilan-<pack>.json."""
import io, json, os, time, urllib.parse, urllib.request
from PIL import Image, ImageDraw, ImageFont

Image.MAX_IMAGE_PIXELS = None
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept": "application/json,image/*,*/*"}
CASE, COLS, LIGNES = 340, 5, 4
PACK = open("outil/pack/actuel.txt").read().strip()
CONF = json.load(open("outil/pack/%s-candidats.json" % PACK))
MET = "https://collectionapi.metmuseum.org/public/collection/v1"


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
    for plage in (262143, 2097151):
        try:
            return list(Image.open(io.BytesIO(lire(url, plage=plage))).size)
        except Exception:
            continue
    return None


# 1. Recherche au Met
met = []
vus = set()
for rq in CONF.get("met", {}).get("requetes", []):
    params = {"q": rq["q"], "hasImages": "true"}
    if rq.get("departmentId"):
        params["departmentId"] = rq["departmentId"]
    try:
        ids = json.loads(lire(MET + "/search?" + urllib.parse.urlencode(params))).get("objectIDs") or []
    except Exception as e:
        print("MET recherche", rq["q"], "impossible :", repr(e), flush=True)
        continue
    gardes, lus = 0, 0
    for oid in ids[:400]:
        if gardes >= rq["max"] or oid in vus:
            continue
        try:
            o = json.loads(lire("%s/objects/%d" % (MET, oid)))
            lus += 1
        except Exception as e:
            print("MET objet", oid, repr(e), flush=True)
            continue
        time.sleep(0.1)
        texte = " ".join(str(o.get(k) or "") for k in ("title", "culture", "period", "dynasty", "medium", "geographyType", "country", "city"))
        classe = o.get("classification") or ""
        if not o.get("isPublicDomain") or not o.get("primaryImage"):
            continue
        if rq.get("doit") and rq["doit"].lower() not in texte.lower():
            continue
        if rq.get("classifications") and not any(c.lower() in classe.lower() for c in rq["classifications"]):
            continue
        taille = taille_distante(o["primaryImage"])
        if not taille or max(taille) < 3000:
            continue
        vus.add(oid)
        gardes += 1
        met.append({"id": None, "musee": "met", "objectID": oid, "ref": o.get("accessionNumber"),
                    "titre_en": o.get("title"), "date": o.get("objectDate"), "culture": ", ".join(x for x in (o.get("culture"), o.get("period")) if x),
                    "technique": o.get("medium"), "classification": classe, "w": taille[0], "h": taille[1], "requete": rq["q"],
                    "vignette": o.get("primaryImageSmall") or o["primaryImage"], "original": o["primaryImage"],
                    "page": o.get("objectURL"), "licence": "CC0"})
    print("MET", rq["q"], ":", len(ids), "trouvés,", lus, "lus,", gardes, "gardés", flush=True)
for n, p in enumerate(met, 1):
    p["id"] = "2M%03d" % n
json.dump(met, open("outil/pack/%s-met.json" % PACK, "w"), ensure_ascii=False, indent=1)

# 2. Vignettes et planches
try:
    POLICE = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
except Exception:
    POLICE = ImageFont.load_default()
pieces = CONF["pieces"] + met
os.makedirs("outil/planches", exist_ok=True)
os.makedirs("outil/apercus", exist_ok=True)
bilan, vignettes = {}, []
for p in pieces:
    try:
        chemin = "outil/apercus/%s.webp" % p["id"]
        img = Image.open(io.BytesIO(lire(p["vignette"]))).convert("RGB")
        img.thumbnail((640, 640), Image.LANCZOS)
        img.save(chemin, "WEBP", quality=74, method=6)
        bilan[p["id"]] = {"ok": True}
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
        d.text((x + 6, y + CASE + 3), "%s %s" % (p["id"], (p.get("titre_en") or "")[:30]), fill=(23, 30, 51), font=POLICE)
    planche.save("outil/planches/%s-%02d.jpg" % (PACK, n // par_planche + 1), "JPEG", quality=80)

json.dump(bilan, open("outil/planches/bilan-%s.json" % PACK, "w"), indent=1)
print(sum(v["ok"] for v in bilan.values()), "vignettes sur", len(bilan), flush=True)
