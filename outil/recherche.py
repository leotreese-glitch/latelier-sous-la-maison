"""Lot 4 : recherche élargie pour 50 motifs retrouvés de plus.
Directions : indiennes colorées, Asie, peintres du domaine public, soieries et papiers peints, vêtements, assiettes et céramiques.
Sources : Cleveland (nouveaux départements + fiches déjà copiées dans outil/recherche/cma.json), Art Institute of Chicago,
Rijksmuseum. Écrit outil/recherche/lot4.json et outil/planches.json, puis fabrique les planches outil/planches/lot4-XX.jpg."""
import json, os, re, runpy, time, urllib.parse, urllib.request

UA = {"User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/1.0; recherche de motifs du domaine public)",
      "AIC-User-Agent": "latelier-sous-la-maison (recherche de motifs du domaine public)"}
os.makedirs("outil/recherche", exist_ok=True)
journal = []
q = urllib.parse.quote
DEJA = json.load(open("outil/deja.json"))
EXCLU = set(DEJA["en_ligne"]) | set(DEJA["ecartees"])
MIN_GRAND, MIN_PETIT = 3800, 2400


def noter(t):
    journal.append(t)
    print(t, flush=True)


def lire(url, accept="application/json", essais=3):
    err = None
    for i in range(essais):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={**UA, "Accept": accept}), timeout=90) as r:
                return json.loads(r.read().decode("utf-8", "replace"))
        except urllib.error.HTTPError as e:
            err = e
            if e.code in (400, 403, 404, 410):
                break
            time.sleep(3 + 5 * i)
        except Exception as e:
            err = e
            time.sleep(3 + 5 * i)
    noter("ECHEC %s %r" % (url[:170], err))
    return None


def assez_grand(w, h):
    w, h = w or 0, h or 0
    return max(w, h) >= MIN_GRAND and min(w, h) >= MIN_PETIT


DECO = re.compile(r"flower|floral|bird|blossom|peon|iris|chrysanth|plum|cherr|maple|wisteria|crane|carp|fish|wave|tiger|"
                  r"dragon|hawk|pheasant|rooster|cock|sparrow|swallow|butterfl|insect|bamboo|pine|morning glor|lotus|"
                  r"camellia|hydrangea|popp|lil(y|ies)|rose|tulip|carnation|pomegranate|grape|vine|fan|pattern|textile|"
                  r"garden|bouquet|vase|still life|parrot|peacock|deer|rabbit|hare|monkey|owl|duck|egret|heron|quail|"
                  r"shell|tortoise|turtle|frog|leaves|leaf|autumn|spring|snow|rain|moon|fuji|cloud|phoenix|lion", re.I)
PEINTRE = re.compile(r"flower|bouquet|vase|garden|lil(y|ies)|iris|popp|still life|rose|chrysanth|sunflower|tulip|fruit|"
                     r"anemone|peon|lilac|orchard|bloom|blossom|nymph|pond|butterfl|bird|sea|boat|wave|jardin|fleur", re.I)
MAITRES = re.compile(r"Hokusai|Hiroshige|Kuniyoshi|Koryūsai|Koryusai|Utamaro|Shigemasa|Bairei|Hokkei|Gakutei|Hokuba|"
                     r"Kōrin|Korin|Jakuchū|Jakuchu|Hōitsu|Hoitsu|Sōtatsu|Sotatsu|Shibata Zeshin|Kiitsu|Settei", re.I)

FLEUR_OISEAU = re.compile(r"flower|bird|blossom|peon|iris|chrysanth|plum|cherr|maple|wisteria|crane|carp|fish|wave|tiger|"
                          r"dragon|hawk|pheasant|rooster|sparrow|swallow|butterfl|insect|bamboo|morning glor|lotus|camellia|"
                          r"hydrangea|popp|lil(y|ies)|rose|fuji|parrot|peacock|egret|heron|duck|mandarin|quail|kingfisher", re.I)
RELIGIEUX = re.compile(r"Saint|Madonna|Christ|Portrait|Holy|Virgin|Temptation|Apocalypse|Crucifix|Martyr|Self-Portrait", re.I)
candidats = []

# ---------------- Cleveland Museum of Art (CC0) ----------------
CMA = "https://openaccess-api.clevelandart.org/api/artworks/"
CMA_CHAMPS = "accession_number,title,creation_date,culture,technique,type,department,creators,images,share_license_status,url,collection,description"


def cma(params, maxi=6000):
    sortie, skip = [], 0
    while skip < maxi:
        p = dict(params, cc0=1, has_image=1, limit=1000, skip=skip, fields=CMA_CHAMPS)
        d = lire(CMA + "?" + urllib.parse.urlencode(p))
        if not d or not d.get("data"):
            break
        sortie += d["data"]
        skip += 1000
        if skip >= (d.get("info") or {}).get("total", 0):
            break
        time.sleep(0.5)
    return sortie


def compact_cma(o):
    im = o.get("images") or {}
    full, web = im.get("full") or {}, im.get("web") or {}
    return {"ref": o.get("accession_number"), "titre": o.get("title"), "date": o.get("creation_date"),
            "culture": o.get("culture"), "technique": o.get("technique"), "type": o.get("type"),
            "dep": o.get("department"), "coll": o.get("collection"),
            "auteurs": [{"nom": c.get("description"), "mort": c.get("death_year"), "role": c.get("role")}
                        for c in (o.get("creators") or [])],
            "w": int(full.get("width") or 0), "h": int(full.get("height") or 0), "web": web.get("url"),
            "lic": o.get("share_license_status"), "texte": re.sub(r"<[^>]+>", "", o.get("description") or "")[:700]}


pool_cma = {x["ref"]: x for x in json.load(open("outil/recherche/cma.json"))}
DEJA_CMA4 = os.path.exists("outil/recherche/cma4.json")
if DEJA_CMA4:
    for x in json.load(open("outil/recherche/cma4.json")):
        pool_cma.setdefault(x["ref"], x)
    noter("CMA : fiches reprises de outil/recherche/cma4.json (%d)" % len(pool_cma))
for params in [] if DEJA_CMA4 else [{"department": "Chinese Art"}, {"department": "Decorative Art and Design"},
               {"department": "Modern European Painting and Sculpture"}, {"department": "European Painting and Sculpture"},
               {"department": "Indian and Southeast Asian Art"}, {"department": "Korean Art"},
               {"department": "Drawings", "q": "flowers"}, {"department": "Drawings", "q": "Redon"},
               {"department": "Prints", "q": "Redon"}, {"q": "Odilon Redon"}, {"q": "Imari"}, {"q": "Iznik"},
               {"q": "maiolica"}, {"q": "Delft"}, {"q": "kosode"}, {"q": "kimono"}]:
    n = 0
    for o in cma(params):
        c = compact_cma(o)
        if c["lic"] == "CC0" and c["ref"]:
            pool_cma.setdefault(c["ref"], c)
            n += 1
    noter("CMA %s : %d" % (params, n))
if not DEJA_CMA4:
    json.dump(list(pool_cma.values()), open("outil/recherche/cma4.json", "w"), ensure_ascii=False, separators=(",", ":"))


def entier(x):
    try:
        return int(str(x)[:4])
    except Exception:
        return 0


def mort_trop_tard(auteurs):
    return any(entier(a.get("mort")) > 1955 for a in auteurs if isinstance(a, dict))


def categorie_cma(c):
    t, typ, dep, titre = c.get("titre") or "", c.get("type") or "", c.get("dep") or "", c.get("titre") or ""
    coll = c.get("coll") or ""
    if typ == "Ceramic" and re.search(r"\b(Dish|Plate|Charger|Tile|Platter|Panel)\b", t):
        return "ceramique"
    if typ == "Garment" and not re.search(r"Pre-Columbian|Native North American|Lace|Ecclesiastical", coll) \
            and not re.search(r"Shoe|Boot|Pendant|Hat|Loincloth|Turban|Band|Trousers|Glove|Purse|Bag|Apron|Mola|Cap|Slipper|Headdress|Scarf", t):
        return "vetement"
    if typ in ("Textile", "Embroidery") and re.search(r"Kimono|Kosode|Robe|Furisode|Uchikake|Katabira|Coat|Jacket|Dress|Shawl", t):
        return "vetement"
    if dep == "Japanese Art" and typ == "Print" and FLEUR_OISEAU.search(t) and any(MAITRES.search(a.get("nom") or "") for a in c["auteurs"]):
        return "asie"
    if dep in ("Japanese Art", "Chinese Art", "Korean Art") and typ == "Painting" and FLEUR_OISEAU.search(t):
        return "asie"
    morts = [entier(a.get("mort")) for a in c["auteurs"] if entier(a.get("mort"))]
    ancien = morts and max(morts) < 1800 and "Pillement" not in json.dumps(c["auteurs"])
    if dep in ("Modern European Painting and Sculpture", "European Painting and Sculpture", "Drawings", "Prints", "Japanese Art") \
            and (typ in ("Painting", "Drawing") or (typ == "Print" and re.search(r"Pillement|Sekka", json.dumps(c["auteurs"])))) \
            and not ancien and not RELIGIEUX.search(t) \
            and (PEINTRE.search(t) or "Redon" in json.dumps(c["auteurs"])):
        return "peintre"
    if dep == "Decorative Art and Design" and typ in ("Textile", "Embroidery", "Velvet"):
        return "soierie"
    return None


for c in pool_cma.values():
    if c["ref"] in EXCLU or c.get("lic") != "CC0" or not assez_grand(c["w"], c["h"]) or mort_trop_tard(c["auteurs"]):
        continue
    cat = categorie_cma(c)
    if not cat or not c.get("web"):
        continue
    candidats.append({"musee": "cma", "cat": cat, "ref": c["ref"], "titre_en": c["titre"], "date": c["date"],
                      "lieu": c.get("culture") or [], "auteur": [a.get("nom") for a in c["auteurs"]],
                      "technique": c.get("technique"), "type": [c.get("type")], "texte_en": c.get("texte", ""),
                      "w": c["w"], "h": c["h"], "vignette": c["web"],
                      "page": "https://clevelandart.org/art/%s" % c["ref"], "licences": ["CC0"]})
noter("CMA candidats : %d" % sum(1 for c in candidats if c["musee"] == "cma"))

# ---------------- Art Institute of Chicago (domaine public, CC0) ----------------
AIC = "https://api.artic.edu/api/v1/artworks/search"
AIC_CHAMPS = ("id,title,date_display,artist_display,place_of_origin,medium_display,classification_title,department_title,"
              "main_reference_number,image_id,thumbnail,is_public_domain,description")


def annee_mort(texte):
    ans = [int(b) for a, b in re.findall(r"(1[0-9]{3})\s*[–-]\s*(1[0-9]{3}|20[0-9]{2})", texte or "")]
    return max(ans) if ans else None


AIC_RECHERCHES = [("peintre", t) for t in ["Odilon Redon", "Claude Monet", "Vincent van Gogh", "Paul Gauguin", "Henri Fantin-Latour",
                                           "Paul Cézanne", "Pierre-Auguste Renoir", "Édouard Vuillard", "Pierre Bonnard",
                                           "Paul Signac", "Henri-Edmond Cross", "Mary Cassatt", "Gustave Caillebotte"]] + \
                 [("ceramique", t) for t in ["Imari plate", "Iznik", "maiolica", "Delft charger", "famille rose plate",
                                             "Kakiemon", "Meissen plate", "Sèvres plate", "tile panel"]] + \
                 [("vetement", t) for t in ["kimono", "kosode", "dragon robe", "waistcoat embroidered", "robe à la française",
                                            "ikat robe", "shawl", "uchikake", "court robe"]]
for cat, terme in AIC_RECHERCHES:
    n = 0
    for page in (1, 2):
        p = {"q": terme, "query[term][is_public_domain]": "true", "fields": AIC_CHAMPS, "limit": 60, "page": page}
        d = lire(AIC + "?" + urllib.parse.urlencode(p))
        for o in (d or {}).get("data", []):
            ref = o.get("main_reference_number")
            th = o.get("thumbnail") or {}
            w, h = th.get("width"), th.get("height")
            if not (o.get("is_public_domain") and o.get("image_id")) or ref in EXCLU or not assez_grand(w, h):
                continue
            cl, titre = (o.get("classification_title") or ""), (o.get("title") or "")
            mort = annee_mort(o.get("artist_display"))
            if mort and mort > 1955:
                continue
            if cat == "peintre" and not (re.search(r"paint|pastel|oil|watercolor|drawing", cl + " " + (o.get("medium_display") or ""), re.I)
                                         and (PEINTRE.search(titre) or "Redon" in terme)):
                continue
            if cat == "ceramique" and not re.search(r"plate|dish|charger|tile|platter|bowl", titre, re.I):
                continue
            if cat == "vetement" and re.search(r"print|photograph|drawing|book", cl, re.I):
                continue
            candidats.append({"musee": "aic", "cat": cat, "id_aic": o["id"], "ref": ref, "titre_en": titre,
                              "date": o.get("date_display"), "lieu": [o.get("place_of_origin")], "auteur": [o.get("artist_display")],
                              "technique": o.get("medium_display"), "type": [cl],
                              "texte_en": re.sub(r"<[^>]+>", "", o.get("description") or "")[:700],
                              "image": o["image_id"], "w": w, "h": h,
                              "vignette": "https://www.artic.edu/iiif/2/%s/full/600,/0/default.jpg" % o["image_id"],
                              "page": "https://www.artic.edu/artworks/%d" % o["id"], "licences": ["CC0"], "requete": terme})
            n += 1
        if not d or page * 60 >= (d.get("pagination") or {}).get("total", 0):
            break
        time.sleep(0.4)
    noter("AIC %s (%s) : %d" % (terme, cat, n))

# ---------------- Rijksmuseum (marque du domaine public, CC0) ----------------
NL, EN = "http://vocab.getty.edu/aat/300388256", "http://vocab.getty.edu/aat/300388277"


def liste(x):
    return x if isinstance(x, list) else [x] if x else []


def langue(o):
    if not isinstance(o, dict):
        return []
    return [l.get("id") if isinstance(l, dict) else l for l in liste(o.get("language"))]


def rijks_fiche(uri):
    d = lire(uri, "application/ld+json")
    if not d:
        return None
    f = {"musee": "rijks", "uri": uri}
    for i in liste(d.get("identified_by")):
        if not isinstance(i, dict):
            continue
        if i.get("type") == "Identifier" and any("300312355" in (c.get("id") or "") for c in liste(i.get("classified_as")) if isinstance(c, dict)):
            f["ref"] = i.get("content")
        if i.get("type") == "Name":
            f["titre_" + ("en" if EN in langue(i) else "nl")] = i.get("content")
    p = d.get("produced_by") or {}
    p = p if isinstance(p, dict) else {}
    ts = p.get("timespan") or {}
    ts = ts if isinstance(ts, dict) else {}
    for n in liste(ts.get("identified_by")):
        if EN in langue(n):
            f["date"] = n.get("content")
    lieux, auteurs = set(), set()
    for part in liste(p.get("part")) + [p]:
        if not isinstance(part, dict):
            continue
        for l in liste(part.get("took_place_at")):
            if isinstance(l, dict):
                lieux.update(x.get("@value") for x in liste(l.get("notation")) if isinstance(x, dict) and x.get("@value"))
        for r in liste(part.get("referred_to_by")):
            if isinstance(r, dict) and EN in langue(r) and any("300435416" in (c.get("id") or "") for c in liste(r.get("classified_as")) if isinstance(c, dict)):
                auteurs.add(r.get("content"))
    f["lieu"], f["auteur"] = sorted(lieux), sorted(auteurs)
    textes = [r.get("content") for r in liste(d.get("referred_to_by")) if isinstance(r, dict) and EN in langue(r) and r.get("content")]
    f["texte_en"] = max(textes, key=len) if textes else ""
    brut = json.dumps(d)
    m = re.search(r"https://iiif\.micr\.io/([A-Za-z0-9]+)/full/max/0/default\.jpg", brut)
    f["iiif"] = m.group(1) if m else None
    f["licences"] = sorted(set(re.findall(r"https://creativecommons\.org/publicdomain/(?:mark|zero)/1\.0/", brut)))
    f["page"] = (re.findall(r"https://www\.rijksmuseum\.nl/(?:nl|en)/collectie/object/[^\"]+", brut) or [None])[0]
    if f["iiif"]:
        info = lire("https://iiif.micr.io/%s/info.json" % f["iiif"])
        if info:
            f["w"], f["h"] = info.get("width"), info.get("height")
    return f


RIJKS = [("ceramique", "title", "bord met"), ("ceramique", "description", "Imari"), ("ceramique", "description", "Kakiemon"),
         ("ceramique", "description", "famille rose"), ("ceramique", "title", "schotel met"), ("ceramique", "title", "tegeltableau"),
         ("vetement", "title", "japon"), ("vetement", "title", "kimono"), ("vetement", "title", "herenvest"),
         ("vetement", "title", "jak van sits"), ("asie", "creator", "Hokusai"), ("asie", "creator", "Hiroshige"),
         ("asie", "description", "surimono"), ("asie", "title", "bloemen en vogels")]
vus = set()
for cat, champ, mot in RIJKS:
    url = "https://data.rijksmuseum.nl/search/collection?%s=%s&imageAvailable=true" % (champ, q(mot))
    ids, pages = [], 0
    while url and pages < 2:
        d = lire(url, "application/ld+json")
        if not d:
            break
        ids += [i["id"] for i in d.get("orderedItems", [])]
        url = (d.get("next") or {}).get("id")
        pages += 1
    n = 0
    for uri in ids[:30]:
        if uri in vus:
            continue
        vus.add(uri)
        try:
            f = rijks_fiche(uri)
        except Exception as e:
            noter("RIJKS fiche illisible %s %r" % (uri, e))
            f = None
        time.sleep(0.15)
        if f and f.get("iiif") and f.get("licences") and f.get("ref") not in EXCLU and assez_grand(f.get("w"), f.get("h")):
            f.update(cat=cat, requete="%s=%s" % (champ, mot),
                     vignette="https://iiif.micr.io/%s/full/600,/0/default.jpg" % f["iiif"])
            candidats.append(f)
            n += 1
    noter("RIJKS %s=%s : %d trouvés, %d gardés" % (champ, mot, len(ids), n))

# ---------------- Tri, plafonds par catégorie, numérotation ----------------
uniques, cles = [], set()
for c in candidats:
    k = (c["musee"], c.get("ref"))
    if k in cles or not c.get("ref"):
        continue
    cles.add(k)
    uniques.append(c)
PLAFOND = {"ceramique": 100, "vetement": 75, "asie": 100, "peintre": 70, "soierie": 30}
ORDRE = ["peintre", "vetement", "ceramique", "asie", "soierie"]


def groupe(c):
    """Sous-groupe pour varier les pièces (pays, musée, type) au lieu de garder seulement les plus grandes images."""
    lieu = " ".join(x or "" for x in (c.get("lieu") or []))
    pays = next((p for p in ("Japan", "China", "Korea", "Turkey", "Iran", "India", "France", "Italy", "Spain", "Netherlands",
                             "England", "Germany", "Uzbekistan") if p in lieu), "autre")
    return "%s-%s-%s" % (c["musee"], pays, (c.get("type") or [""])[0])


garde = []
for cat in ORDRE:
    l = [c for c in uniques if c["cat"] == cat]
    l.sort(key=lambda c: -(min(c.get("w") or 0, c.get("h") or 0)))
    groupes = {}
    for c in l:
        groupes.setdefault(groupe(c), []).append(c)
    choisis, rang = [], 0
    while len(choisis) < PLAFOND[cat] and any(len(g) > rang for g in groupes.values()):
        for g in groupes.values():
            if len(g) > rang and len(choisis) < PLAFOND[cat]:
                choisis.append(g[rang])
        rang += 1
    garde += choisis
    noter("CATEGORIE %s : %d candidats, %d gardés pour les planches" % (cat, len(l), min(len(l), PLAFOND[cat])))
lettre = {"cma": "L", "aic": "A", "rijks": "R"}
compte = {}
for c in garde:
    compte[c["musee"]] = compte.get(c["musee"], 0) + 1
    c["id"] = "4%s%03d" % (lettre[c["musee"]], compte[c["musee"]])
json.dump(garde, open("outil/recherche/lot4.json", "w"), ensure_ascii=False, indent=0)
abr = {"peintre": "PEI", "vetement": "VET", "ceramique": "CER", "asie": "ASI", "soierie": "SOI"}
json.dump([{"id": c["id"], "musee": c["musee"], "ref": "%s %s" % (abr[c["cat"]], c["ref"]), "vignette": c["vignette"]} for c in garde],
          open("outil/planches.json", "w"), ensure_ascii=False)
noter("TOTAL %d candidats pour les planches" % len(garde))
open("outil/recherche/journal4.txt", "w").write("\n".join(journal) + "\n")
os.environ["PLANCHES_PREFIXE"] = "lot4"
runpy.run_path("outil/planches.py")
