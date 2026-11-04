"""Réunit les six ZIP du lot 4 (un par famille) en un seul ZIP, avec une seule liste et un seul mode d'emploi."""
import glob, os, zipfile

os.makedirs("zip_unique", exist_ok=True)
sortie = "zip_unique/Motifs-retrouves-lot-4-tout.zip"
vus = set()
with zipfile.ZipFile(sortie, "w", zipfile.ZIP_STORED, allowZip64=True) as z:
    for part in sorted(glob.glob("parts/Motifs-retrouves-lot-4-[0-9]-*.zip")):
        with zipfile.ZipFile(part) as p:
            for info in p.infolist():
                if info.filename in vus:
                    continue
                vus.add(info.filename)
                data = p.read(info.filename)
                if info.filename.endswith("LISEZ-MOI.txt"):
                    t = data.decode("utf-8")
                    t = t.replace("- Un ZIP par famille, chacun avec son dossier : ", "- Un dossier par famille : ")
                    t = t.replace("liste-des-pieces.csv (la même dans chaque ZIP, avec les 60 pièces)", "liste-des-pieces.csv (les 60 pièces)")
                    data = t.encode("utf-8")
                z.writestr(info, data)
with zipfile.ZipFile(sortie) as z:
    assert z.testzip() is None
    images = [n for n in z.namelist() if n.endswith(".jpg")]
print(len(images), "images,", os.path.getsize(sortie) // 1_000_000, "Mo")
assert len(images) == 60
