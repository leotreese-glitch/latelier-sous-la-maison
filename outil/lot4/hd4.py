"""Lot 4 : liste des 60 pièces pour photos_hd.py (outil/hd.json), dans l'ordre du registre."""
import json, os, re, sys, unicodedata

ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
import lot4, fiches

OUTIL = "/home/claude/outil-musees/outil"
REG = {e["cle"]: e for e in json.load(open(os.path.join(ICI, "lot4-registre.json")))}
P = {p["id"]: p for p in lot4.P}
D = {d["id"]: d for d in json.load(open(os.path.join(ICI, "lot4-donnees.json")))}
N = json.load(open(OUTIL + "/recherche/notices-lot4.json"))
CMA4 = {e["ref"]: e for e in json.load(open(OUTIL + "/recherche/cma4.json"))}
POOL = {}
for f in ("lot3.json", "lot4.json"):
    for e in json.load(open(OUTIL + "/recherche/" + f)):
        POOL[e["id"]] = e

DOSSIERS = {"indiennes": "1-Indiennes", "soieries": "2-Soieries et papiers peints", "asie": "3-Asie",
            "peintres": "4-Peintres", "vetements": "5-Vetements", "ceramiques": "6-Ceramiques"}
EPOQUES = {"moyen-age": "Moyen Âge", "xvie": "XVIe siècle", "xviie": "XVIIe siècle", "xviiie": "XVIIIe siècle",
           "xixe": "XIXe siècle", "xxe": "XXe siècle"}
RACCORD = {"facile": "Raccord facile : la répétition se voit déjà.",
           "moyen": "Raccord à retrouver : la répétition est là, mais incomplète.",
           "a-composer": "Pièce isolée : panneau, semis ou bordure.",
           "oeuvre": "Œuvre entière, pas un motif raccordable : image entière ou détails."}


def slugifier(t):
    t = t.lower().replace("œ", "oe").replace("æ", "ae")
    t = "".join(c for c in unicodedata.normalize("NFD", t) if not ("̀" <= c <= "ͯ"))
    t = re.sub(r"['’]", "-", t)
    t = re.sub(r"[^a-z0-9]+", "-", t).strip("-")
    return t[:80]


sortie = []
for i in sorted(fiches.F, key=lambda i: (i[0] != "b", i)):
    p, d = P[i], D[i]
    e = REG[d["ref"]]
    n = N[p["planche"]]
    vig = "" if p["vigilance"].startswith("Doublon possible") else p["vigilance"]
    afaire = ("" if vig.startswith("Tableau, pas un motif") else RACCORD[p["raccord"]] + " ") + vig
    x = {"id": i, "liste": "Proposée" if i[0] == "b" else "Réserve", "musee": d["musee"], "ref": d["ref"],
         "dossier": DOSSIERS[p["famille"]], "fichier": slugifier(e["titre"]) + ".jpg", "titre": e["titre"],
         "epoque": EPOQUES[p["periode"]], "date": e["date"], "museeNom": e["droits"]["musee"], "notice": e["droits"]["url"],
         "pxOrigine": "%s × %s" % (n["w"], n["h"]), "or": "oui" if p["or_"] else "", "afaire": afaire.strip()}
    if d["musee"] == "cma":
        # Notice complète ou, à défaut (pièce ajoutée à la main), même règle que les 26 autres : _web.jpg -> _full.tif.
        x["hd"] = n.get("hd") or CMA4[d["ref"]]["web"].replace("_web.jpg", "_full.tif")
    elif d["musee"] == "aic":
        x["image_id"] = n["image_id"]
    elif d["musee"] == "rijks":
        x["iiif"] = POOL[p["planche"]]["iiif"]
        x["pxOrigine"] = "%d × %d" % tuple(json.loads(n["servi"])[1]) if isinstance(n["servi"], str) else "%d × %d" % tuple(n["servi"][1])
    else:
        x["ids"] = POOL[p["planche"]]["ids"]
    assert all(x.get(k) for k in ("fichier", "titre", "date", "notice", "afaire")), i
    sortie.append(x)

assert len(sortie) == 60 and len({x["fichier"] for x in sortie}) == 60
json.dump(sortie, open(OUTIL + "/hd.json", "w"), ensure_ascii=False, indent=1)
print(len(sortie), "pièces ;", {k: sum(x["dossier"] == v for x in sortie) for k, v in DOSSIERS.items()})
