import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants";

// Le site est un ensemble de pages toutes prêtes (export statique), servies gratuitement.
// Les parties dynamiques (administration, fichiers) passent par les fonctions du dossier functions/.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // Une mise en page racine par langue (et une pour l'administration) : la page 404 commune vit dans app/global-not-found.tsx.
  experimental: { globalNotFound: true },
};

/** Adresse du site en production : son API fournit le catalogue publié. */
const SOURCE_PAR_DEFAUT = "https://latelier-sous-la-maison.pages.dev";

const DOSSIER_LIB = join(process.cwd(), "lib");
const FICHIER_GENERE = join(DOSSIER_LIB, "catalogue.genere.json");
const FICHIER_GRAINES = join(DOSSIER_LIB, "graines.json");

function ecrire(designs: unknown) {
  const tmp = `${FICHIER_GENERE}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(designs, null, 2) + "\n");
  renameSync(tmp, FICHIER_GENERE);
}

function utiliserGraines(raison: string) {
  console.warn(`[catalogue] ${raison} Utilisation des données de départ (lib/graines.json).`);
  ecrire(JSON.parse(readFileSync(FICHIER_GRAINES, "utf8")));
}

type DesignSource = { id?: string; image?: string; vignettes?: Record<"400" | "800", string> };

const DOSSIER_VIGNETTES = join(process.cwd(), "public", "vignettes");
const LARGEURS = [400, 800] as const;

/**
 * Fabrique des vignettes légères (400 et 800 px de large) de chaque aperçu, servies ensuite
 * comme fichiers statiques : la grille et le mur de l'accueil n'ont plus à charger l'aperçu de 1 200 px.
 * Ne bloque jamais la fabrication du site : en cas d'échec, le design garde son aperçu complet.
 */
async function fabriquerVignettes(designs: DesignSource[], source: string) {
  let sharp: (typeof import("sharp"))["default"] | null = null;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.warn("[vignettes] Outil d'images absent : les grilles utiliseront les aperçus complets.");
    return;
  }
  mkdirSync(DOSSIER_VIGNETTES, { recursive: true });
  const debut = Date.now();
  const aFaire = designs.filter((d) => typeof d.image === "string" && d.image.startsWith("/media/"));
  let faites = 0;
  let echecs = 0;

  const traiter = async (d: DesignSource) => {
    const image = d.image as string;
    // Le nom de l'aperçu change à chaque nouveau dépôt : le nom de la vignette aussi, donc pas de vieux cache.
    const nom = image.replace(/^\/media\/apercus\//, "").replace(/\.[a-z0-9]+$/i, "").replace(/[^a-zA-Z0-9-]+/g, "-");
    const chemins = LARGEURS.map((l) => join(DOSSIER_VIGNETTES, `${nom}-${l}.webp`));
    try {
      if (!chemins.every((c) => existsSync(c))) {
        let corps: Buffer | null = null;
        for (let essai = 0; essai < 3 && !corps; essai++) {
          try {
            const rep = await fetch(`${source}${image}`, { signal: AbortSignal.timeout(30000) });
            if (!rep.ok) throw new Error(`réponse ${rep.status}`);
            corps = Buffer.from(await rep.arrayBuffer());
          } catch (e) {
            if (essai === 2) throw e;
            await new Promise((r) => setTimeout(r, 1000 * (essai + 1)));
          }
        }
        for (const [i, largeur] of LARGEURS.entries()) {
          await sharp!(corps!).resize({ width: largeur, withoutEnlargement: true }).webp({ quality: 74 }).toFile(chemins[i]);
        }
      }
      d.vignettes = { "400": `/vignettes/${nom}-400.webp`, "800": `/vignettes/${nom}-800.webp` };
      faites++;
    } catch (e) {
      echecs++;
      console.warn(`[vignettes] ${d.id ?? image} : ${e instanceof Error ? e.message : String(e)} (aperçu complet gardé).`);
    }
  };

  // Six téléchargements à la fois.
  const file = [...aFaire];
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (file.length) await traiter(file.shift()!);
    }),
  );
  console.log(`[vignettes] ${faites} designs avec vignettes, ${echecs} échec(s), en ${Math.round((Date.now() - debut) / 1000)} s.`);
}

/**
 * Charge le catalogue publié avant de fabriquer les pages.
 * Règles de sécurité :
 * - API absente (404) ou base pas encore branchée (503 « non-configure ») : données de départ ;
 * - toute autre erreur sur Cloudflare : la fabrication échoue, et le site en ligne reste
 *   la version précédente. On ne publie jamais un catalogue douteux.
 */
async function chargerCatalogue() {
  if (process.env.CATALOGUE_CHARGE === "1") return;
  process.env.CATALOGUE_CHARGE = "1";

  if (process.env.CATALOGUE_SOURCE === "graines") {
    utiliserGraines("Source forcée sur les données de départ.");
    return;
  }
  const source = process.env.CATALOGUE_SOURCE || SOURCE_PAR_DEFAUT;
  const surCloudflare = process.env.CF_PAGES === "1";

  try {
    const rep = await fetch(`${source}/api/catalogue`, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(20000) });
    if (rep.status === 404) return utiliserGraines("L'API du catalogue n'existe pas encore.");
    if (rep.status === 503) {
      const corps = (await rep.json().catch(() => ({}))) as { code?: string };
      if (corps.code === "non-configure") return utiliserGraines("La base de données n'est pas encore branchée.");
    }
    if (!rep.ok) throw new Error(`réponse ${rep.status}`);
    const corps = (await rep.json()) as { designs?: unknown[] };
    if (!Array.isArray(corps.designs)) throw new Error("réponse sans liste de designs");
    await fabriquerVignettes(corps.designs as DesignSource[], source);
    ecrire(corps.designs);
    console.log(`[catalogue] ${corps.designs.length} designs publiés chargés depuis ${source}.`);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (surCloudflare) {
      throw new Error(`[catalogue] Impossible de charger le catalogue (${message}). Fabrication arrêtée : le site en ligne reste inchangé.`);
    }
    if (existsSync(FICHIER_GENERE)) {
      console.warn(`[catalogue] Catalogue injoignable (${message}). Conservation du catalogue local existant.`);
      return;
    }
    utiliserGraines(`Catalogue injoignable (${message}).`);
  }
}

export default async function config(phase: string): Promise<NextConfig> {
  if (phase === PHASE_PRODUCTION_BUILD || phase === PHASE_DEVELOPMENT_SERVER) {
    await chargerCatalogue();
  }
  return nextConfig;
}
