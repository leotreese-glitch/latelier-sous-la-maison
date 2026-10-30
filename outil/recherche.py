"""Lot 3 : recherche de pièces libres au Rijksmuseum, au Cooper Hewitt (Smithsonian) et à l'Art Institute of Chicago.
Écrit outil/recherche/lot3.json (fiches compactes) et outil/planches.json, puis fabrique les planches de vignettes."""
import json, os, re, runpy, time, urllib.parse, urllib.request

UA = {"User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/1.0; recherche de motifs du domaine public)",
      "AIC-User-Agent": "latelier-sous-la-maison (recherche de motifs du domaine public)"}
os.makedirs("outil/recherche", exist_ok=True)
journal = []
DEJA = {"2006.160", "1925.135"}  # pièces de Chicago déjà en ligne
q = urllib.parse.quote


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
    noter("ECHEC %s %r" % (url[:160], err))
    return None


candidats = []

# ---------------- Rijksmuseum (Linked Art, sans clé) ----------------
NL, EN = "http://vocab.getty.edu/aat/300388256", "http://vocab.getty.edu/aat/300388277"


def langue(o):
    return [l.get("id") for l in (o.get("language") or [])]


def rijks_fiche(uri):
    d = lire(uri, "application/ld+json")
    if not d:
        return None
    f = {"musee": "rijks", "uri": uri}
    for i in d.get("identified_by", []):
        if i.get("type") == "Identifier" and any("300312355" in (c.get("id") or "") for c in i.get("classified_as", [])):
            f["ref"] = i.get("content")
        if i.get("type") == "Name":
            f["titre_" + ("en" if EN in langue(i) else "nl")] = i.get("content")
    p = d.get("produced_by") or {}
    ts = p.get("timespan") or {}
    for n in ts.get("identified_by", []):
        if EN in langue(n):
            f["date"] = n.get("content")
    f["debut"], f["fin"] = (ts.get("begin_of_the_begin") or "")[:4], (ts.get("end_of_the_end") or "")[:4]
    lieux, auteurs = set(), set()
    for part in p.get("part", []) + [p]:
        for l in part.get("took_place_at", []):
            n = l.get("notation")
            n = n if isinstance(n, list) else [n] if n else []
            lieux.update(x.get("@value") for x in n if x)
        for r in part.get("referred_to_by", []):
            if EN in langue(r) and any("300435416" in (c.get("id") or "") for c in r.get("classified_as", [])):
                auteurs.add(r.get("content"))
    f["lieu"], f["auteur"] = sorted(lieux), sorted(auteurs)
    textes = [r.get("content") for r in d.get("referred_to_by", []) if EN in langue(r) and r.get("content")]
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


RIJKS = [("material", "sits"), ("description", "sits"), ("title", "stalenboek"), ("description", "katoendruk"),
         ("title", "behangsel"), ("description", "behangselpapier"), ("description", "katagami"), ("title", "verfsjabloon"),
         ("description", "brokaat"), ("description", "damast"), ("description", "batik"), ("title", "palampore")]
vus = set()
for champ, mot in RIJKS:
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
    for uri in ids[:35]:
        if uri in vus:
            continue
        vus.add(uri)
        f = rijks_fiche(uri)
        time.sleep(0.15)
        if f and f.get("iiif") and f.get("licences"):
            f["requete"] = "%s=%s" % (champ, mot)
            candidats.append(f)
            n += 1
    noter("RIJKS %s=%s : %d trouvés, %d retenus avec image libre" % (champ, mot, len(ids), n))

# ---------------- Cooper Hewitt (Smithsonian Open Access, CC0) ----------------
SI = [('chintz AND unit_code:"CHNDM"', 2),
      ('sidewall AND unit_code:"CHNDM" AND date:"1800s"', 2),
      ('toile AND unit_code:"CHNDM"', 1),
      ('textile AND unit_code:"CHNDM" AND date:"1700s" AND place:"France"', 1),
      ('textile AND unit_code:"CHNDM" AND date:"1800s" AND place:"Japan"', 1),
      ('stencil AND unit_code:"CHNDM" AND place:"Japan"', 1),
      ('velvet AND unit_code:"CHNDM" AND date:"1600s"', 1),
      ('textile AND unit_code:"CHNDM" AND date:"1700s" AND place:"India"', 1),
      ('textile AND unit_code:"CHNDM" AND date:"1800s" AND place:"England"', 1),
      ('textile AND unit_code:"CHNDM" AND date:"1600s" AND place:"Turkey"', 1)]
for requete, nb_pages in SI:
    n = total = 0
    for page in range(nb_pages):
        d = lire("https://api.si.edu/openaccess/api/v1.0/search?rows=100&start=%d&api_key=DEMO_KEY&q=%s" % (page * 100, q(requete + ' AND online_media_type:"Images"')))
        if not d:
            break
        rows = d["response"]["rows"]
        total = d["response"]["rowCount"]
        for r in rows:
            c = r["content"]
            dn, ft = c.get("descriptiveNonRepeating", {}), c.get("freetext", {})
            media = [m for m in (dn.get("online_media") or {}).get("media", []) if (m.get("usage") or {}).get("access") == "CC0"]
            if not media:
                continue
            m = max(media, key=lambda m: (m.get("width") or 0) * (m.get("height") or 0))
            ref = next((x["content"] for x in ft.get("identifier", []) if x.get("label") == "Accession Number"), None)
            candidats.append({
                "musee": "ch", "ref": ref, "titre_en": (dn.get("title") or {}).get("content"),
                "date": "; ".join(x["content"] for x in ft.get("date", [])), "lieu": [x["content"] for x in ft.get("place", [])],
                "auteur": [x["content"] for x in ft.get("name", [])],
                "texte_en": " | ".join(x["content"] for x in ft.get("notes", []) if x.get("label") == "Description"),
                "technique": " | ".join(x["content"] for x in ft.get("physicalDescription", []) if x.get("label") == "Medium"),
                "type": [x["content"] for x in ft.get("objectType", [])], "ids": m.get("idsId"),
                "w": m.get("width"), "h": m.get("height"), "page": dn.get("record_link"), "licences": ["CC0"],
                "requete": requete,
            })
            n += 1
        if (page + 1) * 100 >= total:
            break
        time.sleep(2)
    noter("CH %s : %d au total, %d retenus" % (requete, total, n))
    time.sleep(2)

# ---------------- Art Institute of Chicago (CC0) ----------------
AIC = "https://api.artic.edu/api/v1/artworks/search"
CHAMPS = "id,title,date_display,artist_display,place_of_origin,medium_display,classification_title,department_title,main_reference_number,image_id,is_public_domain,description"
for terme in ["chintz", "palampore", "toile de Jouy", "block printed cotton", "wallpaper", "katagami", "kashmir shawl",
              "ikat", "batik", "velvet", "lampas", "kalamkari", "furnishing fabric", "sample book"]:
    p = {"q": terme, "query[term][is_public_domain]": "true", "fields": CHAMPS, "limit": 30}
    d = lire(AIC + "?" + urllib.parse.urlencode(p))
    n = 0
    for o in (d or {}).get("data", []):
        if not (o.get("is_public_domain") and o.get("image_id")) or o.get("main_reference_number") in DEJA:
            continue
        if o.get("classification_title") in ("painting", "print", "photograph", "drawing and watercolor", "book"):
            continue
        info = lire("https://www.artic.edu/iiif/2/%s/info.json" % o["image_id"])
        candidats.append({
            "musee": "aic", "id_aic": o["id"], "ref": o.get("main_reference_number"), "titre_en": o.get("title"),
            "date": o.get("date_display"), "lieu": [o.get("place_of_origin")], "auteur": [o.get("artist_display")],
            "technique": o.get("medium_display"), "type": [o.get("classification_title")],
            "texte_en": re.sub(r"<[^>]+>", "", o.get("description") or "")[:600],
            "image": o["image_id"], "w": (info or {}).get("width"), "h": (info or {}).get("height"),
            "page": "https://www.artic.edu/artworks/%d" % o["id"], "licences": ["CC0"], "requete": terme,
        })
        n += 1
        time.sleep(0.3)
    noter("AIC %s : %d retenus" % (terme, n))

# Dédoublonnage et numérotation courte pour les planches
uniques, cles = [], set()
for c in candidats:
    k = (c["musee"], c.get("ref"))
    if k in cles or not c.get("ref"):
        continue
    cles.add(k)
    uniques.append(c)
lettre = {"rijks": "R", "ch": "C", "aic": "A"}
compte = {}
for c in uniques:
    compte[c["musee"]] = compte.get(c["musee"], 0) + 1
    c["id"] = "%s%03d" % (lettre[c["musee"]], compte[c["musee"]])
    if c["musee"] == "rijks":
        c["vignette"] = "https://iiif.micr.io/%s/full/600,/0/default.jpg" % c["iiif"]
    elif c["musee"] == "ch":
        c["vignette"] = "https://ids.si.edu/ids/deliveryService?id=%s&max=600" % c["ids"]
    else:
        c["vignette"] = "https://www.artic.edu/iiif/2/%s/full/600,/0/default.jpg" % c["image"]
json.dump(uniques, open("outil/recherche/lot3.json", "w"), ensure_ascii=False, indent=0)
grands = [c for c in uniques if max(c.get("w") or 0, c.get("h") or 0) >= 3000]
noter("TOTAL %d candidats uniques, %d avec une image d'au moins 3 000 px" % (len(uniques), len(grands)))
json.dump([{"id": c["id"], "musee": c["musee"], "ref": c["ref"], "vignette": c["vignette"]} for c in grands],
          open("outil/planches.json", "w"), ensure_ascii=False)
open("outil/recherche/journal.txt", "w").write("\n".join(journal) + "\n")
runpy.run_path("outil/planches.py")
