"""Vérifie /media en production après l'ajout du cache : statut, type, temps de réponse, 304, refus du dossier hd/."""
import json, time, urllib.request, urllib.error
SITE = "https://latelier-sous-la-maison.com"
cat = json.load(open("outil/catalogue.json"))["designs"]
res = {}

def appel(url, entetes=None):
    req = urllib.request.Request(url, headers=dict({"User-Agent": "Mozilla/5.0 (verification latelier)"}, **(entetes or {})))
    t = time.time()
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            corps = r.read()
            return {"statut": r.status, "ms": round((time.time() - t) * 1000), "type": r.headers.get("content-type"), "octets": len(corps),
                    "etag": r.headers.get("etag"), "cache_control": r.headers.get("cache-control"), "cf": r.headers.get("cf-cache-status")}
    except urllib.error.HTTPError as e:
        return {"statut": e.code, "ms": round((time.time() - t) * 1000)}

for d in cat[5:8]:
    url = SITE + d["image"]
    essais = [appel(url) for _ in range(4)]
    etag = essais[0].get("etag")
    essais.append(dict(appel(url, {"If-None-Match": etag} if etag else {}), conditionnel=True))
    res[d["image"]] = essais
res["hd_refuse"] = appel(SITE + "/media/hd/essai.png")
res["absent"] = appel(SITE + "/media/apercus/inexistant/rien.webp")
res["vignette"] = appel(SITE + "/vignettes/" + cat[0]["image"].replace("/media/apercus/", "").rsplit(".", 1)[0].replace("/", "-") + "-400.webp")
json.dump(res, open("outil/verif/media.json", "w"), indent=1)
print(json.dumps(res, indent=1))
