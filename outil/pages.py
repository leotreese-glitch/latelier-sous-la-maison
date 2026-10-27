"""Vérifie en ligne les pages des designs du lot 2 (français et anglais) et le plan du site, puis supprime le lien temporaire des photos."""
import html, json, os, re, subprocess, urllib.request

SITE = "https://latelier-sous-la-maison.com"
UA = {"User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/verification)"}
attendus = json.load(open("outil/pages.json"))


def lire(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception as e:
        return 0, repr(e)


def texte(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()


bilan = []
for a in attendus:
    for langue, chemin in (("fr", "/motif/%s/" % a["slug"]), ("en", "/en/pattern/%s/" % a["slug"])):
        code, page = lire(SITE + chemin)
        h1 = re.search(r"<h1[^>]*>(.*?)</h1>", page, re.S)
        h1 = texte(h1.group(1)) if h1 else ""
        attendu = a["titre_" + langue]
        cartel = a["cartel_" + langue][:60]
        bilan.append({
            "page": chemin, "code": code, "h1": h1, "titre_ok": h1 == attendu,
            "cartel_ok": cartel in html.unescape(page),
            "sans_phrase_ia": not any(x in html.unescape(page) for x in ("Créé avec l'assistance de l'IA.", "Created with the assistance of AI.", "Dessin numérique créé", "Digital drawing created", "réalisée avec l'assistance de l'IA", "Original design, created with the assistance of AI")),
            "prix": re.findall(r"(\d+(?:,\d+)?\s?€|\$\d+)", texte(page))[:1],
        })
code, plan = lire(SITE + "/sitemap.xml")
nb = len(re.findall(r"<loc>", plan))
lot = sum(1 for a in attendus if "/motif/%s/" % a["slug"] in plan)
resume = {"sitemap_code": code, "sitemap_urls": nb, "slugs_du_lot_dans_le_plan": lot, "pages": bilan}
os.makedirs("outil/recherche", exist_ok=True)
json.dump(resume, open("outil/recherche/pages-bilan.json", "w"), ensure_ascii=False, indent=1)
for slug in json.load(open("outil/pages-absentes.json")):
    for chemin in ("/motif/%s/" % slug, "/en/pattern/%s/" % slug):
        code, _ = lire(SITE + chemin)
        bilan.append({"page": chemin, "code": code, "titre_ok": code == 404, "cartel_ok": code == 404, "sans_phrase_ia": True, "absente_attendue": True})
ko = [b for b in bilan if not ((b["code"] == 200 or b.get("absente_attendue")) and b["titre_ok"] and b["cartel_ok"] and b["sans_phrase_ia"])]
print("pages vérifiées :", len(bilan), "| en défaut :", len(ko), "| plan du site :", nb, "adresses dont", lot, "fiches du lot")
for b in ko:
    print("DÉFAUT", b)

# Le lien public des photos n'a plus d'usage : Léo a déposé les 22 designs.
r = subprocess.run(["gh", "release", "delete", "photos-motifs-retrouves", "--yes", "--cleanup-tag", "-R", os.environ["GITHUB_REPOSITORY"]], capture_output=True, text=True)
print("suppression des photos :", r.returncode, r.stdout.strip(), r.stderr.strip())
