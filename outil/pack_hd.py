"""Packs exclusifs pour les marques : télécharge en taille complète les photos des musées des pièces d'un pack
(liste dans outil/pack/<pack>.json, nom du pack dans outil/pack/actuel.txt) et prépare un seul ZIP.
Rien ne passe par le site ni par son registre. Le dépôt est public : aucun nom de marque dans les fichiers."""
import csv, json, math, os, shutil, time, urllib.request, zipfile
from PIL import Image
import numpy as np

Image.MAX_IMAGE_PIXELS = None
UA = {"User-Agent": "Mozilla/5.0 (compatible; latelier-sous-la-maison/1.0)"}
MAX_PX = 100_000_000  # au-delà seulement, l'image est réduite

PACK = open("outil/pack/actuel.txt").read().strip()
CONF = json.load(open("outil/pack/%s.json" % PACK))
RACINE = CONF["racine"]


def get(url, dest, essais=4):
    for i in range(essais):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=300) as r, open(dest, "wb") as f:
                shutil.copyfileobj(r, f, 8 << 20)
            return
        except Exception as e:
            err = e
            time.sleep(5 + 10 * i)
    raise err


def source(p):
    if p["musee"] == "ch":
        # Smithsonian : fichier « High-resolution JPEG » de l'image marquée CC0.
        return "https://ids.si.edu/ids/download?id=%s.jpg" % p["ids"]
    if p["musee"] == "rijks":
        return "https://iiif.micr.io/%s/full/max/0/default.jpg" % p["iiif"]
    raise ValueError("musée non prévu : " + p["musee"])


pieces = CONF["pieces"]
os.makedirs("sortie/" + RACINE, exist_ok=True)
for p in pieces:
    try:
        url = source(p)
        p["original"] = url
        get(url, "/tmp/src")
        im = Image.open("/tmp/src")
        im.load()
        icc = im.info.get("icc_profile")
        if im.mode != "RGB":
            im = im.convert("RGB")
        w, h = im.size
        p["pxRecu"] = "%d × %d" % (w, h)
        if w * h > MAX_PX:
            s = math.sqrt(MAX_PX / (w * h))
            im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
        dest = "sortie/%s/%s" % (RACINE, p["fichier"])
        kw = {"quality": 92, "subsampling": 0, "dpi": (300, 300)}
        if icc:
            kw["icc_profile"] = icc
        im.save(dest, "JPEG", **kw)
        p["pxFourni"] = "%d × %d" % im.size
        p["ok"] = True
        del im
        os.remove("/tmp/src")
        print("ok", p["fichier"], p["pxRecu"], "->", p["pxFourni"], os.path.getsize(dest) // 1_000_000, "Mo", flush=True)
    except Exception as e:
        p["ok"] = False
        p["erreur"] = repr(e)
        print("ERREUR", p["fichier"], repr(e), flush=True)

with open("sortie/%s/cartels.csv" % RACINE, "w", newline="", encoding="utf-8-sig") as f:
    wr = csv.writer(f, delimiter=";")
    wr.writerow(["Fichier", "Titre", "Famille", "Date", "Lieu", "Musée", "N° d'inventaire", "Licence", "Notice du musée",
                 "Taille du fichier (px)", "Description", "À faire"])
    for p in pieces:
        wr.writerow([p["fichier"], p["titre"], p["famille"], p["date"], p["lieu"], p["museeNom"], p["ref"], p["licence"], p["notice"],
                     p.get("pxFourni", "échec : " + p.get("erreur", "")), p["description"], p["afaire"]])
shutil.copy("outil/pack/%s-LISEZ-MOI.txt" % PACK, "sortie/%s/LISEZ-MOI.txt" % RACINE)

os.makedirs("zips", exist_ok=True)
with zipfile.ZipFile("zips/" + CONF["zip"], "w", zipfile.ZIP_STORED) as z:
    for nom in ["LISEZ-MOI.txt", "cartels.csv"] + [p["fichier"] for p in pieces if p["ok"]]:
        z.write("sortie/%s/%s" % (RACINE, nom), "%s/%s" % (RACINE, nom))
print("ZIP", CONF["zip"], os.path.getsize("zips/" + CONF["zip"]) // 1_000_000, "Mo")
print("BILAN", json.dumps([{k: p.get(k) for k in ("id", "fichier", "ok", "pxRecu", "pxFourni", "erreur")} for p in pieces], ensure_ascii=False))
print(sum(p["ok"] for p in pieces), "sur", len(pieces))
