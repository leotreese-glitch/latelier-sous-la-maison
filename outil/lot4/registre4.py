"""Lot 4 : construit les 60 entrées du registre (lib/registre-retrouves.json) à partir de lot4.py, fiches.py et des données de la page."""
import json, os, sys

ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
import lot4, fiches

REGISTRE = "/home/claude/latelier-sous-la-maison/lib/registre-retrouves.json"
NOTICES = "/home/claude/outil-musees/outil/recherche/notices-lot4.json"
CONSULTE = "2026-11-04"
CONSULTE_CH = "2026-10-30"  # date de lecture de la licence CC0 dans Smithsonian Open Access (recherche du lot 3)

MUSEES = {
    "cma": ("Cleveland Museum of Art", "Open Access du Cleveland Museum of Art : image CC0 1.0, usage commercial autorisé",
            fiches.CMA, fiches.CMA_EN, "Statut CC0 lu dans la base du musée le %s."),
    "rijks": ("Rijksmuseum", "Rijksmuseum : image du domaine public (marque du domaine public 1.0, données CC0), usage commercial autorisé",
              fiches.RIJ, fiches.RIJ_EN, "Licence de l'image (marque du domaine public) lue dans la fiche de données ouvertes du musée le %s."),
    "ch": ("Cooper Hewitt, Smithsonian Design Museum", "Smithsonian Open Access (Cooper Hewitt) : image CC0 1.0, usage commercial autorisé",
           fiches.CH, fiches.CH_EN, "Mention « CC0 » de l'image lue dans Smithsonian Open Access le %s."),
    "aic": ("Art Institute of Chicago", "Art Institute of Chicago : œuvre du domaine public, image CC0 1.0, usage commercial autorisé",
            fiches.AIC, fiches.AIC_EN, "Domaine public et image CC0 lus dans la base du musée le %s."),
}
# Titres revus après contrôle des images (le surimono n'a pas de pivoines ; nom de Mondrian gardé hors du nom du produit).
TITRE_FR = {"r07": "Paons sur le rocher, surimono", "r12": "Chrysanthème jaune sur fond ocre"}
# Pièce en dépôt : mention du prêteur, comme pour BK-BR-988-A.
SUFFIXE = {"b27": ("Aujourd'hui au Rijksmuseum d'Amsterdam (prêt de la Société royale des amis de l'art asiatique), inv. %s.",
                   "Now in the Rijksmuseum, Amsterdam (on loan from the Royal Asian Art Society in The Netherlands), inv. %s.")}
TYPES = {"paysage": "figuratif"}
PERIODES = ("antiquite", "moyen-age", "xvie", "xviie", "xviiie", "xixe", "xxe", "aujourdhui")


def licence_ok(musee, n, ch):
    if musee == "cma":
        return n.get("licence") == "CC0"
    if musee == "aic":
        return n.get("is_public_domain") is True
    if musee == "rijks":
        return "https://creativecommons.org/publicdomain/mark/1.0/" in (n.get("licences") or [])
    return ch.get(n["ref"]) == ["CC0"]


def entree(p, d, f):
    resume, cartel, titre_en, date_en, origine_en, technique_en, auteur_en, resume_en, cartel_en = f
    nom, conditions, suf, suf_en, lu = MUSEES[d["musee"]]
    suf, suf_en = SUFFIXE.get(p["id"], (suf, suf_en))
    ref = d["ref"]
    fr = p["fr"]
    licence_fr = "marque du domaine public" if d["musee"] == "rijks" else "CC0"
    licence_en = "Public Domain Mark" if d["musee"] == "rijks" else "CC0"
    src_fr = "%s, inv. %s%s. Photographie du musée en domaine public (%s), restaurée par L'atelier sous la maison." % (nom, ref, " ; " + fr["auteur"] if fr["auteur"] else "", licence_fr)
    src_en = "%s, inv. %s%s. Museum photograph in the public domain (%s), restored by L'atelier sous la maison." % (nom, ref, "; " + auteur_en if auteur_en else "", licence_en)
    consulte = CONSULTE_CH if d["musee"] == "ch" else CONSULTE
    vig = p["vigilance"] if not p["vigilance"].startswith("Doublon possible") else ""
    w, h = (int(x) for x in d["px"].replace(" ", "").split("×"))
    return {
        "cle": ref, "titre": TITRE_FR.get(p["id"], fr["titre"]), "famille": "retrouves", "periode": p["periode"], "date": fr["date"],
        "origine": fr["origine"], "technique": fr["technique"], "type": TYPES.get(p["type"], p["type"]), "couleurs": [], "image": "",
        "ratio": round(h / w, 4), "resume": resume, "cartel": cartel + " " + suf % ref, "source": src_fr,
        "prix": {"eur": 29.99, "usd": 34.99},
        "droits": {"musee": nom, "reference": ref, "url": d["url"], "statut": "domaine-public", "conditions": conditions,
                   "consulteLe": consulte, "note": ((vig + " ") if vig else "") + lu % consulte},
        "en": {"titre": titre_en, "resume": resume_en, "cartel": cartel_en + " " + suf_en % ref, "origine": origine_en,
               "technique": technique_en, "date": date_en, "source": src_en},
    }


if __name__ == "__main__":
    P = {p["id"]: p for p in lot4.P}
    D = {d["id"]: d for d in json.load(open(os.path.join(ICI, "lot4-donnees.json")))}
    N = json.load(open(NOTICES))
    CH = {e["ref"]: e.get("licences") for e in json.load(open("/home/claude/outil-musees/outil/recherche/lot3.json")) if e["musee"] == "ch"}
    ordre = sorted(fiches.F, key=lambda i: (i[0] != "b", i))
    registre = json.load(open(REGISTRE))
    deja = {e["droits"]["reference"] for e in registre} | {e["cle"] for e in registre}
    titres = {e["titre"] for e in registre}
    nouvelles = []
    for i in ordre:
        p, d = P[i], D[i]
        assert d["ref"] == N[p["planche"]]["ref"], i
        assert licence_ok(d["musee"], N[p["planche"]], CH), (i, "licence")
        e = entree(p, d, fiches.F[i])
        assert e["cle"] not in deja, (i, "déjà au registre")
        assert e["titre"] not in titres, (i, "titre déjà pris")
        assert e["periode"] in PERIODES and e["type"] in ("floral", "geometrique", "animalier", "figuratif"), i
        for k in ("titre", "date", "origine", "technique", "resume", "cartel", "source"):
            assert e[k] and e["en"][k], (i, k)
            assert "  " not in e[k] and "  " not in e["en"][k], (i, k, "double espace")
        assert e["cartel"].count(e["cle"]) == 1 and e["en"]["cartel"].count(e["cle"]) == 1, i
        assert 0.2 < e["ratio"] < 5, i
        assert "d'après Mondrian" not in e["titre"]
        nouvelles.append(e)
        titres.add(e["titre"])
        deja.add(e["cle"])
    assert len(nouvelles) == 60 and len({e["en"]["titre"] for e in nouvelles}) == 60
    json.dump(nouvelles, open(os.path.join(ICI, "lot4-registre.json"), "w"), ensure_ascii=False, indent=1)
    if "--ecrire" in sys.argv:
        texte = json.dumps(registre + nouvelles, ensure_ascii=False, indent=1)
        open(REGISTRE, "w").write(texte)
        print("registre :", len(registre), "+", len(nouvelles), "=", len(registre) + len(nouvelles))
    else:
        print(len(nouvelles), "entrées prêtes (essai, registre non modifié)")
