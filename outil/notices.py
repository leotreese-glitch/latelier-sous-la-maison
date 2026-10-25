"""Notices complètes des pièces choisies (textes du musée, statut des droits, taille d'image), pour rédiger les fiches."""
import json, os, time, urllib.request

UA = {"User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/1.0)", "AIC-User-Agent": "latelier-sous-la-maison (registre des motifs retrouves)", "Accept": "application/json"}
os.makedirs("outil/recherche/notices", exist_ok=True)


def lire(url, essais=4):
    err = None
    for i in range(essais):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
                return json.load(r)
        except Exception as e:
            err = e
            time.sleep(3 + 5 * i)
    return {"erreur": repr(err)}


for p in json.load(open("outil/notices.json")):
    if p["musee"] == "cma":
        d = lire("https://openaccess-api.clevelandart.org/api/artworks/%s" % p["ref"])
    else:
        d = lire("https://api.artic.edu/api/v1/artworks/%s" % p["aic"])
    json.dump(d, open("outil/recherche/notices/%s.json" % p["ref"], "w"), ensure_ascii=False, indent=1)
    print(p["ref"], "ok" if "erreur" not in d else d["erreur"], flush=True)
    time.sleep(0.3)
