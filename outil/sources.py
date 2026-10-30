"""Teste l'accès aux collections de plusieurs musées en libre accès et mesure leur fonds textile de domaine public.
Chaque requête est indépendante : une panne n'arrête pas les autres. Résultats bruts dans outil/recherche/sources/."""
import json, os, re, time, urllib.parse, urllib.request

UA = {"User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/recherche)", "Accept": "application/json, text/html;q=0.9"}
DOSSIER = "outil/recherche/sources"
os.makedirs(DOSSIER, exist_ok=True)
bilan = {}


def lire(url, entetes=None, limite=4_000_000):
    req = urllib.request.Request(url, headers={**UA, **(entetes or {})})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, r.read(limite).decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read(20000).decode("utf-8", "replace")
    except Exception as e:
        return 0, repr(e)


def essai(nom, url, entetes=None, extraire=None):
    code, corps = lire(url, entetes)
    open(os.path.join(DOSSIER, nom + ".txt"), "w").write(corps[:300000])
    info = {"url": url, "code": code, "taille": len(corps)}
    if extraire and code == 200:
        try:
            info.update(extraire(corps))
        except Exception as e:
            info["erreur_extraction"] = repr(e)
    bilan[nom] = info
    print(nom, code, json.dumps({k: v for k, v in info.items() if k not in ("url",)}, ensure_ascii=False)[:600])
    time.sleep(1)


q = urllib.parse.quote

# Art Institute of Chicago : textiles du domaine public
for mot in ("textile", "chintz", "embroidery"):
    essai("aic-" + mot,
          "https://api.artic.edu/api/v1/artworks/search?q=%s&query[term][is_public_domain]=true&fields=id,title,date_display,artwork_type_title,image_id&limit=10" % q(mot),
          extraire=lambda c: {"total": json.loads(c)["pagination"]["total"], "exemples": [(a["title"], a.get("date_display"), a.get("artwork_type_title")) for a in json.loads(c)["data"][:6]]})

# Metropolitan Museum : recherche et fiche objet
essai("met-recherche", "https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=chintz",
      extraire=lambda c: {"total": json.loads(c).get("total")})
essai("met-objet", "https://collectionapi.metmuseum.org/public/collection/v1/objects/75909",
      extraire=lambda c: {k: json.loads(c).get(k) for k in ("title", "isPublicDomain", "primaryImage", "department")})
essai("met-departement", "https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=12",
      extraire=lambda c: {"total": json.loads(c).get("total")})

# Smithsonian Open Access (Cooper Hewitt = CHNDM)
for mot in ("textile", "sidewall", "chintz"):
    essai("si-" + mot,
          "https://api.si.edu/openaccess/api/v1.0/search?q=%s&rows=10&api_key=DEMO_KEY" % q('%s AND unit_code:"CHNDM" AND online_media_type:"Images"' % mot),
          extraire=lambda c: {"total": json.loads(c)["response"]["rowCount"],
                              "exemples": [r.get("title") for r in json.loads(c)["response"]["rows"][:6]]})

# Rijksmuseum : nouvelle API de recherche (sans clé)
for url in ("https://data.rijksmuseum.nl/search/collection?description=sits",
            "https://data.rijksmuseum.nl/search/collection?type=textile",
            "https://data.rijksmuseum.nl/search/collection?title=sits&imageAvailable=true"):
    essai("rijks-" + str(abs(hash(url)) % 1000), url, {"Accept": "application/ld+json, application/json"},
          extraire=lambda c: {"debut": c[:400]})

# Paris Musées : site de recherche et API
essai("paris-site", "https://www.parismuseescollections.paris.fr/fr/recherche/type/oeuvre?keys=" + q("toile de Jouy"),
      extraire=lambda c: {"resultats": re.findall(r"(\d[\d\s ]*)\s*r[ée]sultats?", c)[:3], "open_content": c.count("open"), "cc0": c.lower().count("cc0")})
essai("paris-site-indienne", "https://www.parismuseescollections.paris.fr/fr/recherche/type/oeuvre?keys=indienne",
      extraire=lambda c: {"resultats": re.findall(r"(\d[\d\s ]*)\s*r[ée]sultats?", c)[:3], "cc0": c.lower().count("cc0")})
essai("paris-api", "https://apicollections.parismusees.paris.fr/graphql", extraire=lambda c: {"debut": c[:300]})

# MKG Hambourg : collection en ligne
essai("mkg-site", "https://sammlungonline.mkg-hamburg.de/de/search?s=" + q("Kattun"),
      extraire=lambda c: {"debut_titre": re.findall(r"<title>(.*?)</title>", c, re.S)[:1], "cc0": c.lower().count("cc0"), "public domain": c.lower().count("public domain")})
essai("mkg-site-textil", "https://sammlungonline.mkg-hamburg.de/de/search?s=" + q("Textil"),
      extraire=lambda c: {"treffer": re.findall(r"(\d[\d\.\s]*)\s*(?:Treffer|Ergebnisse|Objekte)", c)[:3], "cc0": c.lower().count("cc0")})

# Minneapolis Institute of Art : API de recherche publique
essai("mia-textile", "https://search.artsmia.org/" + q('textile public_access:1 rights_type:"Public Domain"') + "?size=6",
      extraire=lambda c: {"total": json.loads(c)["hits"]["total"], "exemples": [h["_source"].get("title") for h in json.loads(c)["hits"]["hits"][:6]]})

# Europeana : agrégateur européen, filtre réutilisation libre
for mot in ("chintz", "indienne", "Kattun", "sits"):
    essai("europeana-" + mot,
          "https://api.europeana.eu/record/v2/search.json?wskey=api2demo&rows=10&reusability=open&media=true&qf=TYPE:IMAGE&query=" + q(mot) +
          "&rights=" + q("http://creativecommons.org/publicdomain/zero/1.0/*") + "&rights=" + q("http://creativecommons.org/publicdomain/mark/1.0/*"),
          extraire=lambda c: {"total": json.loads(c).get("totalResults"),
                              "fournisseurs": sorted({(i.get("dataProvider") or ["?"])[0] for i in json.loads(c).get("items", [])})[:10]})

# National Gallery of Art : données ouvertes sur GitHub (Index of American Design)
essai("nga-opendata", "https://api.github.com/repos/NationalGalleryOfArt/opendata/contents/data",
      extraire=lambda c: {"fichiers": [f["name"] for f in json.loads(c)][:20]})

# LACMA : collection en ligne
essai("lacma-site", "https://collections.lacma.org/search/site/" + q("textile"),
      extraire=lambda c: {"titre": re.findall(r"<title>(.*?)</title>", c, re.S)[:1], "public_domain": c.lower().count("public domain")})

# Yale University Art Gallery (LUX)
essai("yale-lux", "https://lux.collections.yale.edu/api/search/item?q=" + q(json.dumps({"text": "chintz"})),
      extraire=lambda c: {"debut": c[:300]})

json.dump(bilan, open(os.path.join(DOSSIER, "bilan.json"), "w"), ensure_ascii=False, indent=1)
print("fini :", len(bilan), "essais")
