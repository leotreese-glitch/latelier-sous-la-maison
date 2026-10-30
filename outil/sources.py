"""Deuxième passe : profondeur des fonds textiles de domaine public, par musée, et droits d'un exemple par source."""
import json, os, re, time, urllib.parse, urllib.request

UA = {"User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/recherche)", "Accept": "application/json, text/html;q=0.9"}
DOSSIER = "outil/recherche/sources2"
os.makedirs(DOSSIER, exist_ok=True)
bilan = {}
q = urllib.parse.quote


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
    info = {"code": code}
    if extraire and code == 200:
        try:
            info.update(extraire(corps))
        except Exception as e:
            info["erreur_extraction"] = repr(e)
    bilan[nom] = info
    print(nom, json.dumps(info, ensure_ascii=False)[:900])
    time.sleep(1)
    return corps if code == 200 else None


# Europeana : quels musées fournissent le plus d'images textiles en réutilisation libre (CC0 ou marque du domaine public)
DROITS = "&rights=" + q("http://creativecommons.org/publicdomain/zero/1.0/*") + "&rights=" + q("http://creativecommons.org/publicdomain/mark/1.0/*")
REQUETE = '(chintz OR indienne OR "toile de Jouy" OR kattun OR sits OR "printed cotton" OR "toile imprimée" OR "papier peint" OR wallpaper OR tapete OR brocade OR brocart OR damask OR damas)'


def facettes(c):
    d = json.loads(c)
    f = {x["name"]: [(v["label"], v["count"]) for v in x["fields"][:25]] for x in d.get("facets", [])}
    return {"total": d.get("totalResults"), "fournisseurs": f.get("DATA_PROVIDER"), "pays": f.get("COUNTRY")}


essai("europeana-fournisseurs",
      "https://api.europeana.eu/record/v2/search.json?wskey=api2demo&rows=0&profile=facets&facet=DATA_PROVIDER&facet=COUNTRY&f.DATA_PROVIDER.facet.limit=25&media=true&qf=TYPE:IMAGE&query=" + q(REQUETE) + DROITS,
      extraire=facettes)
for fournisseur in ("Palais Galliera - Musée de la Mode de la Ville de Paris", "Mobilier National Collections", "Rijksmuseum", "Nationalmuseum Sweden", "Museum für Kunst und Gewerbe Hamburg"):
    essai("europeana-" + re.sub(r"\W+", "-", fournisseur)[:30],
          "https://api.europeana.eu/record/v2/search.json?wskey=api2demo&rows=8&media=true&qf=TYPE:IMAGE&qf=" + q('DATA_PROVIDER:"%s"' % fournisseur) + "&query=" + q(REQUETE) + DROITS,
          extraire=lambda c: {"total": json.loads(c).get("totalResults"),
                              "exemples": [((i.get("title") or ["?"])[0][:70], (i.get("rights") or ["?"])[0], (i.get("year") or ["?"])[0]) for i in json.loads(c).get("items", [])[:8]]})

# Cooper Hewitt (Smithsonian, CC0) : profondeur par siècle
for mot, siecle in (("textile", "1700s"), ("textile", "1800s"), ("sidewall", "1800s"), ("textile", "1600s")):
    essai("si-%s-%s" % (mot, siecle),
          "https://api.si.edu/openaccess/api/v1.0/search?rows=5&api_key=DEMO_KEY&q=" + q('%s AND unit_code:"CHNDM" AND online_media_type:"Images" AND date:"%s"' % (mot, siecle)),
          extraire=lambda c: {"total": json.loads(c)["response"]["rowCount"]})

# Rijksmuseum : droits et image d'un objet trouvé par la recherche « sits »
c = lire("https://data.rijksmuseum.nl/search/collection?description=sits&imageAvailable=true", {"Accept": "application/ld+json"})[1]
try:
    premier = json.loads(c)["orderedItems"][0]["id"]
    essai("rijks-objet", premier, {"Accept": "application/ld+json"},
          extraire=lambda c: {"licences": sorted(set(re.findall(r"https?://(?:creativecommons\.org|rightsstatements\.org)/[^\"]+", c)))[:5],
                              "titre": re.findall(r'"content"\s*:\s*"([^"]{5,120})"', c)[:2]})
except Exception as e:
    bilan["rijks-objet"] = {"erreur": repr(e), "debut": c[:300]}
    print("rijks-objet", bilan["rijks-objet"])

# Met : la recherche publique de l'API est fermée (410) ; essai de la recherche du site
essai("met-site", "https://www.metmuseum.org/api/collection/collectionlisting?q=chintz&showOnly=openAccess&perPage=5",
      extraire=lambda c: {"debut": c[:300]})

# Paris Musées : nombre d'œuvres trouvées et mention de téléchargement libre sur une fiche
corps = essai("paris-recherche", "https://www.parismuseescollections.paris.fr/fr/recherche/type/oeuvre?keys=" + q("papier peint"),
              extraire=lambda c: {"liens_oeuvres": len(set(re.findall(r'href="(/fr/[a-z\-]+/oeuvres/[^"?#]+)"', c)))})
if corps:
    liens = sorted(set(re.findall(r'href="(/fr/[a-z\-]+/oeuvres/[^"?#]+)"', corps)))[:3]
    for i, lien in enumerate(liens):
        essai("paris-oeuvre-%d" % i, "https://www.parismuseescollections.paris.fr" + lien,
              extraire=lambda c: {"cc0": c.count("CC0"), "domaine_public": c.lower().count("domaine public"),
                                  "telecharger": c.lower().count("télécharger"), "titre": re.findall(r"<title>(.*?)</title>", c, re.S)[:1]})

json.dump(bilan, open(os.path.join(DOSSIER, "bilan.json"), "w"), ensure_ascii=False, indent=1)
print("fini :", len(bilan), "essais")
