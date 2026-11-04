"""Lot 4 : notices complètes des pièces présélectionnées et taille réellement servie par chaque musée.
Entrée : outil/lot4-liste.json (identifiants des planches). Sortie : outil/recherche/notices-lot4.json."""
import io, json, os, re, time, urllib.request
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
UA = {"User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/1.0)", "AIC-User-Agent": "latelier-sous-la-maison (notices)"}
EN, NL = "http://vocab.getty.edu/aat/300388277", "http://vocab.getty.edu/aat/300388256"
pool = {x["id"]: x for x in json.load(open("outil/recherche/lot3.json"))}
pool.update({x["id"]: x for x in json.load(open("outil/recherche/lot4.json"))})
ids = json.load(open("outil/lot4-liste.json"))
sortie = {}


def lire(url, accept="application/json", maxi=None):
    req = urllib.request.Request(url, headers={**UA, "Accept": accept})
    with urllib.request.urlopen(req, timeout=180) as r:
        return r.status, (r.read(maxi) if maxi else r.read())


def taille_entete(url):
    """Taille d'une image servie, lue dans les premiers octets du JPEG (sans tout télécharger)."""
    for n in (400_000, 3_000_000):
        try:
            code, corps = lire(url, "image/*", n)
            return code, list(Image.open(io.BytesIO(corps)).size)
        except urllib.error.HTTPError as e:
            return e.code, None
        except Exception:
            continue
    return 0, None


def liste(x):
    return x if isinstance(x, list) else [x] if x else []


def langue(o):
    return [l.get("id") if isinstance(l, dict) else l for l in liste(o.get("language"))] if isinstance(o, dict) else []


for i in ids:
    p = pool.get(i)
    if not p:
        sortie[i] = {"erreur": "absent des listes"}
        continue
    d = {"id": i, "musee": p["musee"], "ref": p["ref"]}
    try:
        if p["musee"] == "cma":
            _, corps = lire("https://openaccess-api.clevelandart.org/api/artworks/%s" % p["ref"])
            o = json.loads(corps)["data"]
            full = (o.get("images") or {}).get("full") or {}
            d.update(titre=o.get("title"), date=o.get("creation_date"), culture=o.get("culture"), technique=o.get("technique"),
                     type=o.get("type"), mesures=o.get("measurements"), licence=o.get("share_license_status"),
                     description=re.sub(r"<[^>]+>", "", o.get("description") or ""), savoir=o.get("did_you_know"),
                     auteurs=[{"nom": c.get("description"), "mort": c.get("death_year"), "role": c.get("role")} for c in (o.get("creators") or [])],
                     w=full.get("width"), h=full.get("height"), hd=full.get("url"), page=o.get("url"), credit=o.get("creditline"))
        elif p["musee"] == "aic":
            champs = "id,title,date_display,artist_display,place_of_origin,medium_display,dimensions,credit_line,description,short_description,is_public_domain,image_id,main_reference_number,classification_titles,subject_titles"
            _, corps = lire("https://api.artic.edu/api/v1/artworks/%d?fields=%s" % (p["id_aic"], champs))
            o = json.loads(corps)["data"]
            o["description"] = re.sub(r"<[^>]+>", "", o.get("description") or "")
            d.update(o)
            _, info = lire("https://www.artic.edu/iiif/2/%s/info.json" % p["image"])
            info = json.loads(info)
            d["w"], d["h"] = info.get("width"), info.get("height")
            d["iiif"] = {}
            for t in ("pct:100", "4000,", "3000,"):
                d["iiif"][t] = taille_entete("https://www.artic.edu/iiif/2/%s/full/%s/0/default.jpg" % (p["image"], t))
                time.sleep(0.3)
        elif p["musee"] == "rijks":
            _, corps = lire(p["uri"], "application/ld+json")
            o = json.loads(corps)
            textes = []
            for r in liste(o.get("referred_to_by")):
                if isinstance(r, dict) and r.get("content") and (EN in langue(r) or NL in langue(r)):
                    textes.append(("en" if EN in langue(r) else "nl", r.get("content")))
            noms = [(("en" if EN in langue(n) else "nl"), n.get("content")) for n in liste(o.get("identified_by")) if isinstance(n, dict) and n.get("type") == "Name"]
            brut = json.dumps(o)
            d.update(noms=noms, textes=textes, date=p.get("date"), auteurs=p.get("auteur"), lieu=p.get("lieu"),
                     licences=sorted(set(re.findall(r"https://creativecommons\.org/publicdomain/(?:mark|zero)/1\.0/", brut))),
                     page=p.get("page"), w=p.get("w"), h=p.get("h"),
                     dims=sorted(set(re.findall(r'"value": ([0-9.]+), "unit": \{"id": "http://vocab.getty.edu/aat/300379098"', brut)))[:6])
            d["servi"] = taille_entete("https://iiif.micr.io/%s/full/max/0/default.jpg" % p["iiif"])
        else:  # Cooper Hewitt : métadonnées déjà copiées au lot 3 (limite de l'API publique)
            d.update(titre=p.get("titre_en"), date=p.get("date"), lieu=p.get("lieu"), auteurs=p.get("auteur"),
                     technique=p.get("technique"), description=p.get("texte_en"), w=p.get("w"), h=p.get("h"), page=p.get("page"))
    except Exception as e:
        d["erreur"] = repr(e)
    sortie[i] = d
    print(i, json.dumps({k: d.get(k) for k in ("ref", "w", "h", "licence", "is_public_domain", "iiif", "servi", "erreur")}, ensure_ascii=False), flush=True)
    time.sleep(0.2)

os.makedirs("outil/recherche", exist_ok=True)
json.dump(sortie, open("outil/recherche/notices-lot4.json", "w"), ensure_ascii=False, indent=1)
print("fini", len(sortie))
