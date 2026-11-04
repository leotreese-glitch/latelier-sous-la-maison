"""Construit la page « Motifs retrouvés, lot 4 » à partir de la page du lot 3 (même design), avec les données de lot4.py."""
import base64, io, json, os, re, sys
from PIL import Image

ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
import lot4  # noqa: E402

OUTIL = "/home/claude/outil-musees/outil"
APERCUS = OUTIL + "/apercus"
page = open(os.path.join(ICI, "..", "lot3", "motifs-retrouves-lot-3.html")).read()
notices = json.load(open(OUTIL + "/recherche/notices-lot4.json"))
pool = {x["id"]: x for x in json.load(open(OUTIL + "/recherche/lot3.json"))}
pool.update({x["id"]: x for x in json.load(open(OUTIL + "/recherche/lot4.json"))})


def remplacer(texte, ancien, nouveau, n=1):
    assert texte.count(ancien) == n, (ancien[:80], texte.count(ancien))
    return texte.replace(ancien, nouveau)


page = remplacer(page, "<title>Motifs retrouvés, lot 3</title>", "<title>Motifs retrouvés, lot 4</title>")
page = remplacer(page, "/* Registre d'inventaire, lot 3 :", "/* Registre d'inventaire, lot 4 :")

coeur = [p for p in lot4.P if p["id"].startswith("b")]
reserve = [p for p in lot4.P if p["id"].startswith("r")]
nb, nr = len(coeur), len(reserve)

debut = page.index('  <header class="entete">')
fin = page.index('  <section class="outils" aria-label="Filtres">')
ENTETE = '''  <header class="entete">
    <span class="etiquette">L'atelier sous la maison · gamme Motifs retrouvés · lot 4</span>
    <h1>Motifs retrouvés, lot 4</h1>
    <p><strong>%d pièces de musée libres pour la vente</strong>, dont 3 proches d'un design déjà en ligne (signalées « Doublon possible »), vérifiées le %s au Cleveland Museum of Art, au Rijksmuseum d'Amsterdam, au Cooper Hewitt (Smithsonian, New York) et à l'Art Institute of Chicago. Six familles : indiennes colorées, soieries et papiers peints, Asie, peintres du domaine public, vêtements, assiettes et céramiques.</p>
    <p>%d pièces de réserve permettent de remplacer celles qui ne vous plaisent pas. Utilisez le filtre « Famille » pour parcourir une direction à la fois, et cliquez sur une image pour l'agrandir et faire défiler les pièces une à une.</p>
  </header>

  <section class="cadre" aria-label="Mode d'emploi et règles">
    <div class="bloc">
      <h2>Comment choisir</h2>
      <ol>
        <li><strong>Retenez ou écartez</strong> chaque pièce ici. L'objectif est de 50. Cherchez « doublon » pour retrouver les 3 pièces proches d'un design déjà en ligne.</li>
        <li><strong>Une pièce ne vous plaît pas ?</strong> Écartez-la et retenez une pièce de réserve à la place.</li>
        <li><strong>Dès que vous avez choisi</strong>, j'écris les fiches complètes en français et en anglais, je les ajoute au bouton « Créer les brouillons » de l'administration et je prépare les photos haute définition des musées.</li>
      </ol>
    </div>
    <div class="bloc">
      <h2>À savoir avant de choisir</h2>
      <ul>
        <li>Les œuvres sont anonymes ou d'auteurs morts avant 1956. Cleveland et le Cooper Hewitt publient leurs photos en CC0, le Rijksmuseum en CC0 et sous la marque du domaine public, Chicago en CC0 : usage commercial compris.</li>
        <li><strong>Chicago ne fournit plus que 3 000 px</strong> par image (refus constaté le %s sur toutes ses pièces, alors que la taille complète passait encore fin octobre). Ses pièces demandent un agrandissement : elles sont signalées.</li>
        <li>Les tableaux, vêtements et assiettes ne sont pas des motifs raccordables : on les vend en image entière, par détails, ou une fois le décor remis à plat.</li>
        <li>Le nom de l'artiste reste dans le cartel (« d'après… ») ; aucune marque dans le nom du produit. Fichier final : au moins 4 000 px sur le grand côté.</li>
      </ul>
    </div>
  </section>

''' % (nb, lot4.CONSULTE_TEXTE, nr, lot4.CONSULTE_TEXTE)
page = page[:debut] + ENTETE + page[fin:]

# Filtres : famille, et deux types de plus (figuratif, paysage)
page = remplacer(page, '''      <div class="groupe" role="group" aria-label="Type de motif">''', '''      <div class="groupe" role="group" aria-label="Famille">
        <span class="etiquette">Famille</span>
        <button class="bascule" data-filtre="famille" data-valeur="toutes" aria-pressed="true">Toutes</button>
        <button class="bascule" data-filtre="famille" data-valeur="indiennes" aria-pressed="false">Indiennes</button>
        <button class="bascule" data-filtre="famille" data-valeur="soieries" aria-pressed="false">Soieries et papiers</button>
        <button class="bascule" data-filtre="famille" data-valeur="asie" aria-pressed="false">Asie</button>
        <button class="bascule" data-filtre="famille" data-valeur="peintres" aria-pressed="false">Peintres</button>
        <button class="bascule" data-filtre="famille" data-valeur="vetements" aria-pressed="false">Vêtements</button>
        <button class="bascule" data-filtre="famille" data-valeur="ceramiques" aria-pressed="false">Céramiques</button>
      </div>
      <div class="groupe" role="group" aria-label="Type de motif">''')
page = remplacer(page, '''        <button class="bascule" data-filtre="type" data-valeur="animalier" aria-pressed="false">Animalier</button>''',
                 '''        <button class="bascule" data-filtre="type" data-valeur="animalier" aria-pressed="false">Animalier</button>
        <button class="bascule" data-filtre="type" data-valeur="figuratif" aria-pressed="false">Figuratif</button>
        <button class="bascule" data-filtre="type" data-valeur="paysage" aria-pressed="false">Paysage</button>''')
page = remplacer(page, 'placeholder="Chercher : indienne, soie, Japon…"', 'placeholder="Chercher : Monet, pivoine, Iznik, kimono…"')
page = remplacer(page, '<p class="total chiffres" id="total">Retenues : <b>0</b> sur 15 visées</p>', '<p class="total chiffres" id="total">Retenues : <b>0</b> sur 50 visées</p>')
page = remplacer(page, '<button class="bouton" id="tout-retenir">Retenir les 15 propositions</button>', '<button class="bouton" id="tout-retenir">Retenir les %d propositions</button>' % nb)

debut = page.index('  <footer class="sources">')
fin = page.index("</footer>", debut) + len("</footer>")
PIED = '''  <footer class="sources">
    <span class="etiquette">Sources</span>
    <ul>
      <li><a href="https://openaccess-api.clevelandart.org/" target="_blank" rel="noopener">Open Access du Cleveland Museum of Art</a> : champ « share_license_status » (CC0), dates des auteurs et taille de l'image complète, lus le %s.</li>
      <li><a href="https://data.rijksmuseum.nl/" target="_blank" rel="noopener">Données ouvertes du Rijksmuseum</a> : licence de chaque image (CC0 ou marque du domaine public) et taille réellement servie, lues le %s.</li>
      <li><a href="https://www.si.edu/openaccess" target="_blank" rel="noopener">Smithsonian Open Access</a> (Cooper Hewitt) : mention « CC0 » de chaque image et taille du fichier haute définition, lues le 30 octobre 2026.</li>
      <li><a href="https://api.artic.edu/docs/" target="_blank" rel="noopener">API de l'Art Institute of Chicago</a> : champ « is_public_domain » ; taille réellement servie testée le %s (3 000 px au plus).</li>
      <li>Directive européenne 2019/790, article 14 : la reproduction fidèle d'une œuvre d'art visuel tombée dans le domaine public n'est pas protégée.</li>
    </ul>
  </footer>''' % ((lot4.CONSULTE_TEXTE,) * 3)
page = page[:debut] + PIED + page[fin:]

page = remplacer(page, ".frise { display: grid; grid-template-columns: repeat(5, minmax(84px, 1fr)); min-width: 440px; position: relative; }",
                 ".frise { display: grid; grid-template-columns: repeat(7, minmax(84px, 1fr)); min-width: 620px; position: relative; }")
page = remplacer(page, '''    "a-composer": "Pièce isolée : semis, planche ou bordure"''', '''    "a-composer": "Pièce isolée : semis, planche ou bordure",
    "oeuvre": "Œuvre entière : en image, en détails ou en planche"''')
page = remplacer(page, 'var CONSULTE = "2026-10-30";', 'var CONSULTE = "%s";' % lot4.CONSULTE)
page = remplacer(page, "var OBJECTIF = 15;", "var OBJECTIF = 50;")
page = remplacer(page, '''    ["toutes", "Toutes"], ["xvie", "XVIe"], ["xviie", "XVIIe"], ["xviiie", "XVIIIe"], ["xixe", "XIXe"]''',
                 '''    ["toutes", "Toutes"], ["moyen-age", "Moyen Âge"], ["xvie", "XVIe"], ["xviie", "XVIIe"], ["xviiie", "XVIIIe"], ["xixe", "XIXe"], ["xxe", "XXe"]''')
page = remplacer(page, 'var TYPES = { floral: "Floral", geometrique: "Géométrique", animalier: "Animalier", figuratif: "Figuratif" };',
                 'var TYPES = { floral: "Floral", geometrique: "Géométrique", animalier: "Animalier", figuratif: "Figuratif", paysage: "Paysage" };\n'
                 '  var FAMILLES = { indiennes: "Indiennes colorées", soieries: "Soieries et papiers peints", asie: "Asie", peintres: "Peintres", vetements: "Vêtements", ceramiques: "Assiettes et céramiques" };')
page = remplacer(page, '''    aic: { nom: "Art Institute of Chicago",''', '''    cma: { nom: "Cleveland Museum of Art", conditions: "Open Access du Cleveland Museum of Art : image CC0 1.0, usage commercial autorisé" },
    aic: { nom: "Art Institute of Chicago",''')
page = remplacer(page, 'var filtre = { periode: "toutes", statut: "toutes", decision: "tous", type: "tous", or: false, q: "" };',
                 'var filtre = { periode: "toutes", statut: "toutes", decision: "tous", famille: "toutes", type: "tous", or: false, q: "" };')
page = remplacer(page, 'var CLE_LOCALE = "registre-motifs-lot3-choix";', 'var CLE_LOCALE = "registre-motifs-lot4-choix";')
page = remplacer(page, '"Licence vérifiée le 30 oct. 2026"', '"Licence vérifiée le %s"' % lot4.CONSULTE_COURT)
page = remplacer(page, '"Fiche prête en français et en anglais"', '"Fiche complète écrite après votre choix"')
page = remplacer(page, '''      el("span", { classe: "signe" + (d.typeSur ? "" : " doute"), texte: TYPES[d.type] + (d.typeSur ? "" : " · à confirmer") }),''',
                 '''      el("span", { classe: "signe", texte: FAMILLES[d.famille] }),
      el("span", { classe: "signe" + (d.typeSur ? "" : " doute"), texte: TYPES[d.type] + (d.typeSur ? "" : " · à confirmer") }),''')
page = remplacer(page, '''    if (filtre.type !== "tous" && d.type !== filtre.type) return false;''',
                 '''    if (filtre.famille !== "toutes" && d.famille !== filtre.famille) return false;
    if (filtre.type !== "tous" && d.type !== filtre.type) return false;''')
page = remplacer(page, '''carte._texte = [d.titre, d.titreMusee, d.origine, d.technique, d.auteur, d.ref, d.piece, d.pourquoi].join(" ").toLowerCase();''',
                 '''carte._texte = [d.titre, d.titreMusee, d.origine, d.technique, d.auteur, d.ref, d.piece, d.pourquoi, d.vigilance, FAMILLES[d.famille]].join(" ").toLowerCase();''')
page = remplacer(page, '''NOMS_PERIODES[d.periode] + " · " + d.date + " · " + d.origine + " · " + MUSEES[d.musee].nom''',
                 '''FAMILLES[d.famille] + " · " + d.date + " · " + d.origine + " · " + MUSEES[d.musee].nom''')
page = remplacer(page, '''var cols = ["Décision", "Note", "Proposition", "Référence",''', '''var cols = ["Décision", "Note", "Proposition", "Famille", "Référence",''')
page = remplacer(page, '''d.choix === "coeur" ? "Proposée" : "Réserve", d.ref,''', '''d.choix === "coeur" ? "Proposée" : "Réserve", FAMILLES[d.famille], d.ref,''')
page = remplacer(page, 'filename: "motifs-retrouves-lot-3.csv"', 'filename: "motifs-retrouves-lot-4.csv"')


def taille(p):
    n = notices[p["planche"]]
    if n["musee"] == "aic":
        return tuple(n["iiif"]["3000,"][1])
    if n["musee"] == "rijks":
        return tuple(n["servi"][1])
    return (n["w"], n["h"])


def lien(p):
    n, src = notices[p["planche"]], pool[p["planche"]]
    if n["musee"] == "cma":
        return n.get("page") or "https://clevelandart.org/art/%s" % n["ref"]
    if n["musee"] == "aic":
        return "https://www.artic.edu/artworks/%d" % src["id_aic"]
    return n.get("page") or src.get("page")


def titre_musee(p):
    n, src = notices[p["planche"]], pool[p["planche"]]
    if n["musee"] == "cma":
        return n.get("titre")
    if n["musee"] == "aic":
        return n.get("title")
    if n["musee"] == "rijks":
        noms = n.get("noms") or []
        en = [t for l, t in noms if l == "en"]
        return en[0] if en else (noms[0][1] if noms else src.get("titre_nl"))
    return src.get("titre_en")


donnees, vignettes = [], {}
for p, choix in [(x, "coeur") for x in coeur] + [(x, "reserve") for x in reserve]:
    fr, n = p["fr"], notices[p["planche"]]
    w, h = [int(v) for v in taille(p)]
    assert w and h, p["id"]
    d = {"id": p["id"], "choix": choix, "famille": p["famille"], "musee": n["musee"], "ref": n["ref"], "url": lien(p),
         "titre": fr["titre"], "titreMusee": titre_musee(p), "periode": p["periode"], "date": fr["date"], "origine": fr["origine"],
         "technique": fr["technique"], "auteur": fr["auteur"], "type": p["type"], "typeSur": True, "piece": p["piece"], "or": p["or_"],
         "px": "%d × %d" % (w, h), "raccord": p["raccord"], "pourquoi": p["pourquoi"], "vigilance": p["vigilance"]}
    donnees.append(d)
    im = Image.open(os.path.join(APERCUS, p["planche"] + ".webp")).convert("RGB")
    im.thumbnail((640, 640), Image.LANCZOS)
    b = io.BytesIO()
    im.save(b, "WEBP", quality=68, method=6)
    vignettes[p["id"]] = "data:image/webp;base64," + base64.b64encode(b.getvalue()).decode()


def js(x):
    return json.dumps(x, ensure_ascii=False).replace("</", "<\\/")


a = page.index('<script type="application/json" id="donnees">')
b = page.index("</script>", a) + len("</script>")
page = page[:a] + '<script type="application/json" id="donnees">' + js(donnees) + "</script>" + page[b:]
a = page.index('<script type="application/json" id="vignettes">')
b = page.index("</script>", a) + len("</script>")
page = page[:a] + '<script type="application/json" id="vignettes">' + js(vignettes) + "</script>" + page[b:]

a = page.index('<script type="application/json" id="vignettes">')
b = page.index("</script>", a)
texte = page[:a] + page[b:]
for reste in ("lot 3", "lot3", "2026-10-30", "30 oct. 2026", "sur 15 visées", "les 15 propositions"):
    assert reste not in texte, (reste, [texte[m.start() - 60:m.start() + 60] for m in re.finditer(reste, texte)][:2])
open(os.path.join(ICI, "motifs-retrouves-lot-4.html"), "w").write(page)
json.dump(donnees, open(os.path.join(ICI, "lot4-donnees.json"), "w"), ensure_ascii=False, indent=1)
print(len(page) // 1024, "Ko,", len(donnees), "pièces")
