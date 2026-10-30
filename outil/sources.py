"""Exploration : structure d'une fiche Rijksmuseum (Linked Art) et d'une fiche Smithsonian, pour écrire la recherche du lot 3."""
import json, os, re, urllib.parse, urllib.request

UA = {"User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/recherche)"}
D = "outil/recherche/explore"
os.makedirs(D, exist_ok=True)


def lire(url, accept="application/json"):
    req = urllib.request.Request(url, headers={**UA, "Accept": accept})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, r.geturl(), r.read(3_000_000).decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, url, e.read(5000).decode("utf-8", "replace")
    except Exception as e:
        return 0, url, repr(e)


LD = "application/ld+json"
code, u, c = lire("https://data.rijksmuseum.nl/search/collection?description=sits&imageAvailable=true", LD)
open(D + "/rijks-recherche.json", "w").write(c)
print("recherche", code, c[:1500])
ids = [i["id"] for i in json.loads(c).get("orderedItems", [])][:3]
vus = set()
for n, i in enumerate(ids[:2]):
    a_suivre = [(i, 0)]
    while a_suivre:
        url, prof = a_suivre.pop(0)
        if url in vus or prof > 3 or len(vus) > 14:
            continue
        vus.add(url)
        code, finale, corps = lire(url, LD)
        nom = "%s/rijks-%d-%s.json" % (D, n, re.sub(r"\W+", "_", url)[-40:])
        open(nom, "w").write(corps)
        print("---", code, url, "->", finale, len(corps))
        print(corps[:2500])
        for lien in re.findall(r'"id"\s*:\s*"(https://id\.rijksmuseum\.nl/[^"]+)"', corps):
            if lien not in vus:
                a_suivre.append((lien, prof + 1))

q = urllib.parse.quote
code, u, c = lire("https://api.si.edu/openaccess/api/v1.0/search?rows=2&api_key=DEMO_KEY&q=" + q('chintz AND unit_code:"CHNDM" AND online_media_type:"Images"'))
open(D + "/si.json", "w").write(c)
try:
    r = json.loads(c)["response"]["rows"][0]
    print("SI ligne :", json.dumps(r, ensure_ascii=False)[:5000])
except Exception as e:
    print("SI erreur", e, c[:500])
