"""Lot 3 : notices complètes des pièces choisies (Rijksmuseum et Chicago) et taille réelle des images de Chicago."""
import io, json, os, re, urllib.request
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
UA = {"User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/1.0)", "AIC-User-Agent": "latelier-sous-la-maison (notices)"}
RIJKS = {"R241": "https://id.rijksmuseum.nl/20064167", "R121": "https://id.rijksmuseum.nl/200743029",
         "R194": "https://id.rijksmuseum.nl/200106992", "R240": "https://id.rijksmuseum.nl/20063018"}
AIC = {"A136": (43057, "2c69c362-9661-4f2b-806e-55dd2040f024"), "A069": (9415, "de0be2c7-f7f3-8994-24bb-8ea946a4f7fa"),
       "A104": (55996, "11da56f4-01d3-d916-d135-cd7fc5cb78b4"), "A053": (60689, "5b1a4ae9-e81a-bf1b-76e9-2b8e613b86c0")}
EN = "http://vocab.getty.edu/aat/300388277"
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
        if isinstance(o.get("content"), str) and any((l.get("id") if isinstance(l, dict) else l) == EN for l in langs):
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
json.dump(sortie, open("outil/recherche/notices-lot3.json", "w"), ensure_ascii=False, indent=1)
