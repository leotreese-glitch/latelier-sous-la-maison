// Catalogue utilisé pour fabriquer les pages du site.
// `catalogue.genere.json` est écrit au moment de la fabrication (voir next.config.ts) :
// depuis la base de données quand elle est en place, sinon depuis lib/graines.json.

import donnees from "./catalogue.genere.json";
import type { Design } from "./modele";

export * from "./modele";

export const DESIGNS: Design[] = (donnees as Design[])
  .filter((d) => d.statut === undefined || d.statut === "publie")
  .sort((a, b) => (b.publieLe ?? "").localeCompare(a.publieLe ?? ""));

export function trouver(slug: string) {
  return DESIGNS.find((d) => d.slug === slug);
}

export function memeTiroir(d: Design, n = 4) {
  return DESIGNS.filter((x) => x.famille === d.famille && x.slug !== d.slug).slice(0, n);
}
