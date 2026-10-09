"""Télécharge l'image complète de chaque pièce retenue, la ramène à 36 Mpx au plus, et prépare les ZIP par époque."""
import csv, io, json, math, os, shutil, time, urllib.request, zipfile
from PIL import Image, ImageFile
import numpy as np

Image.MAX_IMAGE_PIXELS = None
UA = {"User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/1.0)"}
MAX_PX = 36_000_000
MET = {"2010.337": "https://images.metmuseum.org/CRDImages/as/original/DP-23279-001.jpg"}
RACINE = "Motifs retrouves - photos des musees"

def get(url, dest, essais=4):
    for i in range(essais):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=300) as r, open(dest, "wb") as f:
                shutil.copyfileobj(r, f, 8 << 20)
            return
        except Exception as e:
            err = e; time.sleep(5 + 10 * i)
    raise err

def source(p):
    if p["musee"] == "cma":
        req = urllib.request.Request("https://openaccess-api.clevelandart.org/api/artworks/%s?fields=images,share_license_status" % p["ref"], headers=UA)
        data = json.load(urllib.request.urlopen(req, timeout=60))["data"]
        assert data["share_license_status"] == "CC0", p["ref"]
        full = data["images"]["full"]
        p["attendu"] = int(full.get("filesize") or 0)
        return full["url"]
    return MET[p["ref"]]

pieces = json.load(open("outil/hd.json"))
FILTRE = [x for x in open("outil/filtre.txt").read().split() if x] if os.path.exists("outil/filtre.txt") else []
if FILTRE:
    pieces = [p for p in pieces if p["fichier"] in FILTRE]
os.makedirs("sortie/" + RACINE, exist_ok=True)
for p in pieces:
    try:
        url = source(p); p["original"] = url
        for essai in range(3):
            get(url, "/tmp/src")
            taille = os.path.getsize("/tmp/src")
            print("  téléchargé", taille, "octets, attendu", p.get("attendu"), flush=True)
            if not p.get("attendu") or taille >= p["attendu"]:
                break
        p["note"] = ""
        try:
            im = Image.open("/tmp/src"); im.load()
        except OSError as e:
            if "truncated" not in str(e):
                raise
            ImageFile.LOAD_TRUNCATED_IMAGES = True
            im = Image.open("/tmp/src"); im.load()
            ImageFile.LOAD_TRUNCATED_IMAGES = False
            a = np.asarray(im.convert("L"))
            lignes = np.where(a.max(axis=1) > 8)[0]
            bas = int(lignes[-1]) + 1 if len(lignes) else a.shape[0]
            manque = a.shape[0] - bas
            if manque > 0:
                im = im.crop((0, 0, im.size[0], bas))
            p["note"] = "Fichier du musée incomplet : %d lignes vides retirées en bas." % manque
            print("  tronqué, lignes vides retirées:", manque, flush=True)
        icc = im.info.get("icc_profile")
        if im.mode not in ("RGB",):
            im = im.convert("RGB")
        w, h = im.size; p["pxOrigine"] = "%d × %d" % (w, h)
        if w * h > MAX_PX:
            s = math.sqrt(MAX_PX / (w * h)); im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
        os.makedirs("sortie/%s/%s" % (RACINE, p["dossier"]), exist_ok=True)
        dest = "sortie/%s/%s/%s" % (RACINE, p["dossier"], p["fichier"])
        kw = {"quality": 92, "subsampling": 0, "dpi": (300, 300)}
        if icc: kw["icc_profile"] = icc
        im.save(dest, "JPEG", **kw)
        p["pxFourni"] = "%d × %d" % im.size; p["ok"] = True
        del im; os.remove("/tmp/src")
        print("ok", p.get("note", ""), p["fichier"], p["pxOrigine"], "->", p["pxFourni"], os.path.getsize(dest) // 1_000_000, "Mo", flush=True)
    except Exception as e:
        p["ok"] = False; p["erreur"] = repr(e); print("ERREUR", p["fichier"], repr(e), flush=True)

with open("sortie/%s/liste-des-pieces.csv" % RACINE, "w", newline="", encoding="utf-8-sig") as f:
    wr = csv.writer(f, delimiter=";")
    wr.writerow(["Dossier", "Fichier", "Titre", "Époque", "Date", "Musée", "N° d'inventaire", "Notice du musée", "Taille d'origine (px)", "Taille du fichier (px)", "Or", "À faire", "Original complet"])
    for p in pieces:
        wr.writerow([p["dossier"], p["fichier"], p["titre"], p["epoque"], p["date"], p["museeNom"], p["ref"], p["notice"], p["pxOrigine"], p.get("pxFourni", "échec : " + p.get("erreur", "")), p["or"], p["afaire"], p.get("original", "")])
shutil.copy("outil/LISEZ-MOI.txt", "sortie/%s/LISEZ-MOI.txt" % RACINE)

# Un ZIP par époque, chacun avec la liste et le mode d'emploi.
os.makedirs("zips", exist_ok=True)
if not FILTRE:
    with zipfile.ZipFile("zips/Motifs-retrouves-photos.zip", "w", zipfile.ZIP_STORED) as z:
        for nom in ("LISEZ-MOI.txt", "liste-des-pieces.csv"):
            z.write("sortie/%s/%s" % (RACINE, nom), "%s/%s" % (RACINE, nom))
        for p in pieces:
            if p["ok"]:
                z.write("sortie/%s/%s/%s" % (RACINE, p["dossier"], p["fichier"]), "%s/%s/%s" % (RACINE, p["dossier"], p["fichier"]))
for dossier in []:
    with zipfile.ZipFile("zips/%s.zip" % dossier, "w", zipfile.ZIP_STORED) as z:
        for nom in ("liste-des-pieces.csv", "LISEZ-MOI.txt"):
            z.write("sortie/%s/%s" % (RACINE, nom), "%s/%s" % (RACINE, nom))
        for p in pieces:
            if p["dossier"] == dossier and p["ok"]:
                z.write("sortie/%s/%s/%s" % (RACINE, dossier, p["fichier"]), "%s/%s/%s" % (RACINE, dossier, p["fichier"]))
if FILTRE:
    with zipfile.ZipFile("zips/complement.zip", "w", zipfile.ZIP_STORED) as z:
        for p in pieces:
            if p["ok"]:
                z.write("sortie/%s/%s/%s" % (RACINE, p["dossier"], p["fichier"]), "%s/%s" % (p["dossier"], p["fichier"]))
json.dump(pieces, open("zips/bilan.json", "w"), ensure_ascii=False, indent=1)
print(sum(p["ok"] for p in pieces), "sur", len(pieces))
