"""Mesure la vitesse du site en ligne (accueil, explorer, une fiche), sur ordinateur et sur téléphone moyen.
Sortie : outil/perf/resultats.json. Rien n'est modifié sur le site."""
import json, os, statistics, time
from playwright.sync_api import sync_playwright

SITE = "https://latelier-sous-la-maison.com"
os.makedirs("outil/perf", exist_ok=True)

catalogue = json.load(open("outil/catalogue.json"))["designs"]
fiche = "/motif/%s/" % catalogue[0]["slug"]
PAGES = ["/", "/explorer/", fiche, "/en/explore/"]
APPAREILS = {
    "ordinateur": dict(viewport={"width": 1440, "height": 900}, device_scale_factor=1, cpu=1),
    "telephone": dict(viewport={"width": 412, "height": 915}, device_scale_factor=2.6, cpu=4, is_mobile=True, has_touch=True),
}

MESURE_JS = """
window.__lcp = 0; window.__longues = [];
new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({type: 'largest-contentful-paint', buffered: true});
new PerformanceObserver(l => { for (const e of l.getEntries()) window.__longues.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({type: 'longtask', buffered: true});
"""

DEFILER_JS = """
async () => {
  const images = [];
  let fin = false, prec = performance.now();
  const boucle = (t) => { images.push(t - prec); prec = t; if (!fin) requestAnimationFrame(boucle); };
  requestAnimationFrame(boucle);
  const hauteur = document.documentElement.scrollHeight;
  const debut = performance.now();
  for (let y = 0; y < hauteur; y += 120) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 16)); }
  await new Promise(r => setTimeout(r, 300));
  fin = true;
  return { duree: Math.round(performance.now() - debut), hauteur, images };
}
"""

resultats = {"site": SITE, "date": time.strftime("%Y-%m-%d %H:%M UTC", time.gmtime()), "mesures": []}
with sync_playwright() as p:
    nav = p.chromium.launch()
    for nom_app, reglage in APPAREILS.items():
        for page_url in PAGES:
            for passage in ("premiere-visite", "deuxieme-visite"):
                if passage == "premiere-visite":
                    ctx = nav.new_context(**{k: v for k, v in reglage.items() if k != "cpu"})
                pg = ctx.new_page()
                cdp = ctx.new_cdp_session(pg)
                cdp.send("Network.enable")
                if reglage["cpu"] > 1:
                    cdp.send("Emulation.setCPUThrottlingRate", {"rate": reglage["cpu"]})
                if nom_app == "telephone":
                    # 4G correcte : 9 Mbit/s descendant, 40 ms de latence.
                    cdp.send("Network.emulateNetworkConditions", {"offline": False, "latency": 40, "downloadThroughput": 9e6 / 8, "uploadThroughput": 3e6 / 8})
                reqs = {}
                cdp.on("Network.responseReceived", lambda e: reqs.setdefault(e["requestId"], {}).update(
                    url=e["response"]["url"], type=e["type"], statut=e["response"]["status"],
                    cache=e["response"]["headers"].get("cf-cache-status") or e["response"]["headers"].get("CF-Cache-Status"),
                    attente=round((e["response"].get("timing") or {}).get("receiveHeadersEnd", 0) - (e["response"].get("timing") or {}).get("sendEnd", 0)),
                    memoire=e["response"].get("fromDiskCache", False) or e["response"].get("fromServiceWorker", False)))
                cdp.on("Network.loadingFinished", lambda e: reqs.setdefault(e["requestId"], {}).update(octets=e["encodedDataLength"]))
                pg.add_init_script(MESURE_JS)
                t0 = time.time()
                try:
                    pg.goto(SITE + page_url, wait_until="load", timeout=120000)
                    charge = round((time.time() - t0) * 1000)
                    pg.wait_for_timeout(1500)
                    lcp = pg.evaluate("window.__lcp")
                    noeuds = pg.evaluate("document.getElementsByTagName('*').length")
                    imgs = pg.evaluate("[...document.images].map(i => [i.currentSrc.split('/').slice(-2).join('/'), i.naturalWidth, i.naturalHeight, Math.round(i.getBoundingClientRect().width), i.loading])")
                    defil = pg.evaluate(DEFILER_JS)
                    longues = pg.evaluate("window.__longues")
                    fr = [x for x in defil["images"] if x > 0]
                    res = list(reqs.values())
                    par_type = {}
                    for r in res:
                        t = r.get("type", "?")
                        par_type.setdefault(t, [0, 0])
                        par_type[t][0] += 1
                        par_type[t][1] += r.get("octets", 0)
                    medias = [r for r in res if "/media/" in r.get("url", "")]
                    resultats["mesures"].append({
                        "appareil": nom_app, "page": page_url, "passage": passage, "chargement_ms": charge, "lcp_ms": round(lcp),
                        "noeuds": noeuds, "requetes": len(res), "octets_total": sum(r.get("octets", 0) for r in res), "par_type": par_type,
                        "medias": {"nombre": len(medias), "octets": sum(r.get("octets", 0) for r in medias),
                                   "attente_mediane_ms": statistics.median([r["attente"] for r in medias if "attente" in r]) if medias else None,
                                   "attente_max_ms": max([r["attente"] for r in medias if "attente" in r], default=None),
                                   "cache_cloudflare": sorted({str(r.get("cache")) for r in medias})},
                        "images": imgs[:40], "nb_images": len(imgs),
                        "defilement": {"duree_ms": defil["duree"], "hauteur_px": defil["hauteur"], "images": len(fr),
                                       "image_mediane_ms": round(statistics.median(fr), 1) if fr else None,
                                       "images_sup_50ms": sum(1 for x in fr if x > 50), "pire_image_ms": round(max(fr), 1) if fr else None},
                        "taches_longues": {"nombre": len(longues), "total_ms": sum(d for _, d in longues), "pire_ms": max([d for _, d in longues], default=0)},
                        "js": sorted([[r["url"].split("/")[-1], r.get("octets", 0)] for r in res if r.get("type") == "Script"], key=lambda x: -x[1])[:6],
                    })
                    print(nom_app, page_url, passage, "ok", charge, "ms", flush=True)
                except Exception as e:
                    resultats["mesures"].append({"appareil": nom_app, "page": page_url, "passage": passage, "erreur": repr(e)})
                    print(nom_app, page_url, passage, "ERREUR", repr(e), flush=True)
                pg.close()
                if passage == "deuxieme-visite":
                    ctx.close()
    nav.close()

json.dump(resultats, open("outil/perf/resultats.json", "w"), ensure_ascii=False, indent=1)
print("terminé")
