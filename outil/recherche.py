"""Recherche de pièces libres (CC0 / domaine public) dans les bases ouvertes de trois musées.
Écrit des listes compactes dans outil/recherche/ : on choisit ensuite sur pièces, puis on fait des planches de vignettes."""
import json, os, time, urllib.parse, urllib.request

UA = {
    "User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/1.0; recherche de motifs du domaine public)",
    "AIC-User-Agent": "latelier-sous-la-maison (recherche de motifs du domaine public)",
    "Accept": "application/json",
}
os.makedirs("outil/recherche", exist_ok=True)
journal = []


def noter(t):
    journal.append(t)
    print(t, flush=True)


def lire(url, essais=4):
    err = None
    for i in range(essais):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
                return json.load(r)
        except Exception as e:
            err = e
            time.sleep(3 + 5 * i)
    noter("ECHEC %s %r" % (url, err))
    return None


# ---------- Cleveland Museum of Art ----------
CMA = "https://openaccess-api.clevelandart.org/api/artworks/"
CHAMPS = "accession_number,title,creation_date,culture,technique,type,department,creators,images,share_license_status,url,collection"


def cma(params):
    sortie, skip = [], 0
    while True:
        p = dict(params, cc0=1, has_image=1, limit=1000, skip=skip, fields=CHAMPS)
        d = lire(CMA + "?" + urllib.parse.urlencode(p))
        if not d or not d.get("data"):
            break
        sortie += d["data"]
        skip += 1000
        if skip >= d["info"]["total"]:
            break
    return sortie


def compact_cma(o):
    full = (o.get("images") or {}).get("full") or {}
    web = (o.get("images") or {}).get("web") or {}
    return {
        "ref": o.get("accession_number"),
        "titre": o.get("title"),
        "date": o.get("creation_date"),
        "culture": o.get("culture"),
        "technique": o.get("technique"),
        "type": o.get("type"),
        "dep": o.get("department"),
        "coll": o.get("collection"),
        "auteurs": [
            {"nom": c.get("description"), "mort": c.get("death_year"), "role": c.get("role")}
            for c in (o.get("creators") or [])
        ],
        "w": int(full.get("width") or 0),
        "h": int(full.get("height") or 0),
        "web": web.get("url"),
        "lic": o.get("share_license_status"),
    }


tout = {}
requetes = [
    {"department": "Textiles"},
    {"department": "Islamic Art"},
    {"department": "Japanese Art"},
    {"department": "Chinese Art", "type": "Textile"},
    {"department": "Indian and South East Asian Art"},
    {"q": "pochoir"},
    {"q": "Verneuil"},
    {"q": "Grasset"},
    {"q": "Mucha"},
    {"q": "wallpaper"},
    {"q": "design for textile"},
    {"q": "Owen Jones"},
    {"q": "ornament"},
]
for r in requetes:
    n = 0
    for o in cma(r):
        c = compact_cma(o)
        if c["lic"] == "CC0" and c["ref"]:
            tout[c["ref"]] = c
            n += 1
    noter("CMA %s : %d" % (r, n))
json.dump(list(tout.values()), open("outil/recherche/cma.json", "w"), ensure_ascii=False, separators=(",", ":"))

# ---------- Art Institute of Chicago ----------
AIC = "https://api.artic.edu/api/v1/artworks/search"
AIC_CHAMPS = "id,title,date_display,artist_display,place_of_origin,medium_display,classification_title,department_title,main_reference_number,image_id,thumbnail,is_public_domain,dimensions"
aic = {}
for terme in ["jouy", "oberkampf", "printed cotton", "chintz", "palampore", "indienne", "block printed",
              "copperplate", "furnishing fabric", "kalamkari", "batik", "ikat", "suzani", "katagami",
              "stencil", "kashmir shawl", "paisley", "wallpaper", "Iznik", "velvet", "lampas", "brocade",
              "textile design", "Dagobert Peche", "Koloman Moser", "Wiener Werkstätte", "Voysey", "Dresser"]:
    n = 0
    for page in range(1, 11):
        p = {"q": terme, "query[term][is_public_domain]": "true", "fields": AIC_CHAMPS, "limit": 100, "page": page}
        d = lire(AIC + "?" + urllib.parse.urlencode(p))
        if not d or not d.get("data"):
            break
        for o in d["data"]:
            if o.get("is_public_domain") and o.get("image_id"):
                t = o.get("thumbnail") or {}
                aic[o["id"]] = {
                    "id": o["id"], "ref": o.get("main_reference_number"), "titre": o.get("title"),
                    "date": o.get("date_display"), "auteur": o.get("artist_display"), "lieu": o.get("place_of_origin"),
                    "technique": o.get("medium_display"), "classe": o.get("classification_title"),
                    "dep": o.get("department_title"), "image": o.get("image_id"),
                    "w": t.get("width") or 0, "h": t.get("height") or 0, "dims": o.get("dimensions"),
                }
                n += 1
        if page * 100 >= d.get("pagination", {}).get("total", 0):
            break
        time.sleep(0.4)
    noter("AIC %s : %d" % (terme, n))
json.dump(list(aic.values()), open("outil/recherche/aic.json", "w"), ensure_ascii=False, separators=(",", ":"))

# Taille réellement servie par le serveur d'images de Chicago (test sur une pièce connue).
essais_iiif = {}
for taille in ["full", "max", "3000,", "4000,", "1686,"]:
    url = "https://www.artic.edu/iiif/2/068dbf9d-76ec-d053-2b32-6e4e89934387/full/%s/0/default.jpg" % taille
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=dict(UA, Accept="image/*")), timeout=120) as r:
            corps = r.read()
        from PIL import Image
        import io
        essais_iiif[taille] = {"ok": True, "octets": len(corps), "taille": Image.open(io.BytesIO(corps)).size}
    except Exception as e:
        essais_iiif[taille] = {"ok": False, "erreur": repr(e)}
noter("AIC IIIF %s" % json.dumps(essais_iiif))

# ---------- Metropolitan Museum of Art ----------
MET = "https://collectionapi.metmuseum.org/public/collection/v1/"
met, vus = {}, set()
echecs_met, debut_met = 0, time.time()
for terme in ["palampore", "chintz", "indienne", "Jouy", "Oberkampf", "printed cotton", "block printed cotton",
              "katagami", "stencil", "kalamkari", "batik", "suzani", "ikat", "Dagobert Peche", "Koloman Moser",
              "Iznik tile", "velvet", "furnishing fabric", "kosode", "textile design"]:
    d = lire(MET + "search?" + urllib.parse.urlencode({"hasImages": "true", "q": terme}))
    ids = (d or {}).get("objectIDs") or []
    n = 0
    for i in ids[:150]:
        if i in vus or echecs_met >= 12 or time.time() - debut_met > 900:
            continue
        vus.add(i)
        o = lire(MET + "objects/%d" % i, essais=1)
        time.sleep(0.08)
        echecs_met = 0 if o else echecs_met + 1
        if not o or not o.get("isPublicDomain") or not o.get("primaryImage"):
            continue
        met[i] = {
            "id": i, "ref": o.get("accessionNumber"), "titre": o.get("title"), "date": o.get("objectDate"),
            "auteur": o.get("artistDisplayName"), "mort": o.get("artistEndDate"), "culture": o.get("culture"),
            "pays": o.get("country"), "technique": o.get("medium"), "classe": o.get("classification"),
            "dep": o.get("department"), "image": o.get("primaryImage"), "petite": o.get("primaryImageSmall"),
            "url": o.get("objectURL"), "dims": o.get("dimensions"),
        }
        n += 1
    noter("MET %s : %d ids, %d libres" % (terme, len(ids), n))
    json.dump(list(met.values()), open("outil/recherche/met.json", "w"), ensure_ascii=False, separators=(",", ":"))
    if echecs_met >= 12:
        noter("MET : trop d'échecs d'affilée, arrêt")
        break
json.dump(list(met.values()), open("outil/recherche/met.json", "w"), ensure_ascii=False, separators=(",", ":"))

open("outil/recherche/journal.txt", "w").write("\n".join(journal) + "\n")
print("\n".join(journal))
