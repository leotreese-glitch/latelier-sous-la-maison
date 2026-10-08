import { preparerBase, versDesign, type LigneDesign } from "../../server/base";
import { erreur, json, type Env } from "../../server/env";
import { versionPublique } from "../../lib/modele";

/** Catalogue publié, lu au moment de la fabrication du site. */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) return json({ code: "non-configure", erreur: "La base de données n'est pas branchée." }, 503);
  try {
    await preparerBase(env.DB);
    const { results } = await env.DB.prepare(
      "SELECT * FROM designs WHERE statut = 'publie' ORDER BY publie_le DESC",
    ).all<LigneDesign>();
    const designs = results.map((l) => {
      const { creeLe: _c, modifieLe: _m, ...d } = versDesign(l);
      return versionPublique(d);
    });
    return json({ designs, genereLe: new Date().toISOString() });
  } catch (e) {
    return erreur(500, "Lecture du catalogue impossible.", { detail: String(e) });
  }
};
