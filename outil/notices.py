"""Lot 3 : notices complètes des pièces choisies (Rijksmuseum et Chicago) et taille réelle des images de Chicago."""
import io, json, os, re, urllib.request
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
UA = {"User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/1.0)", "AIC-User-Agent": "latelier-sous-la-maison (notices)"}
RIJKS = {"R121": "https://id.rijksmuseum.nl/200743029", "R194": "https://id.rijksmuseum.nl/200106992"}
AIC = {"A176": (50477, "7ac6da84-eb9e-dd5e-0bdb-cc917970d1b3"), "A205": (1995, "9a8bcdb1-99a7-2256-0613-5dac0c1a26e9"),
       "A181": (50468, "79a04f74-05ba-f44d-c5ba-4ddb8353b82d"), "A234": (71269, "ab9d239a-2e45-8c6e-b073-d690eb1aa73b")}
EN = "http://vocab.getty.edu/aat/300388277"
NL = "http://vocab.getty.edu/aat/300388256"
sortie = {}


def lire(url, accept="application/json"):
    with urllib.request.urlopen(urllib.request.Request(url, headers={**UA, "Accept": accept}), timeout=180) as r:
        return r.read()


def textes(o, chemin=""):
    """Tous les textes anglais d'une fiche Linked Art, avec le chemin du champ."""
    res = []
    if isinstance(o, dict):
        langs = o.get("language") or []
        langs = langs if isinstance(langs, list) else [langs]
        if isinstance(o.get("content"), str) and any((l.get("id") if isinstance(l, dict) else l) in (EN, NL) for l in langs):
            res.append((chemin, o["content"]))
        for k, v in o.items():
            res += textes(v, chemin + "/" + k)
    elif isinstance(o, list):
        for v in o:
            res += textes(v, chemin)
    return res


for cle, uri in RIJKS.items():
    try:
        d = json.loads(lire(uri, "application/ld+json"))
        t = textes(d)
        vus, propres = set(), []
        for chemin, texte in t:
            if texte not in vus:
                vus.add(texte)
                propres.append([chemin, texte])
        sortie[cle] = {"uri": uri, "textes_en": propres,
                       "licences": sorted(set(re.findall(r"https://creativecommons\.org/publicdomain/(?:mark|zero)/1\.0/", json.dumps(d))))}
    except Exception as e:
        sortie[cle] = {"erreur": repr(e)}
    print(cle, json.dumps(sortie[cle], ensure_ascii=False)[:3000])

CHAMPS = "id,title,date_display,artist_display,place_of_origin,medium_display,dimensions,credit_line,description,short_description,is_public_domain,copyright_notice,thumbnail,image_id,main_reference_number,classification_titles,subject_titles,style_titles"
for cle, (ident, image) in AIC.items():
    try:
        d = json.loads(lire("https://api.artic.edu/api/v1/artworks/%d?fields=%s" % (ident, CHAMPS)))["data"]
        d["description"] = re.sub(r"<[^>]+>", "", d.get("description") or "")
        corps = lire("https://www.artic.edu/iiif/2/%s/full/pct:100/0/default.jpg" % image, "image/*")
        d["taille_complete"] = list(Image.open(io.BytesIO(corps)).size)
        sortie[cle] = d
    except Exception as e:
        sortie[cle] = {"erreur": repr(e)}
    print(cle, json.dumps(sortie[cle], ensure_ascii=False)[:3000])

os.makedirs("outil/recherche", exist_ok=True)
json.dump(sortie, open("outil/recherche/notices-lot3b.json", "w"), ensure_ascii=False, indent=1)
