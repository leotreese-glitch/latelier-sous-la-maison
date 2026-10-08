import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants";

// Le site est un ensemble de pages toutes prêtes (export statique), servies gratuitement.
// Les parties dynamiques (administration, fichiers) passent par les fonctions du dossier functions/.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
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
