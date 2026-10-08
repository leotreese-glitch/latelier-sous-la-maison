import { ecrireMeta, lireMeta } from "../../../server/base";
import { erreur, json, type Env } from "../../../server/env";

/** Combien de designs ont changé depuis la dernière reconstruction du site. */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const db = env.DB!;
  const derniere = (await lireMeta(db, "derniere_mise_a_jour")) ?? "1970-01-01T00:00:00.000Z";
  const r = await db.prepare("SELECT COUNT(*) AS n FROM designs WHERE modifie_le > ?1 AND publie_le IS NOT NULL").bind(derniere).first<{ n: number }>();
  return json({ derniereMiseAJour: derniere, changements: r?.n ?? 0, crochet: Boolean(env.CROCHET_DEPLOIEMENT) });
};

/** Demande à Cloudflare de reconstruire le site avec le catalogue publié. */
export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
  if (!env.CROCHET_DEPLOIEMENT) {
    return erreur(503, "Le crochet de déploiement n'est pas réglé (secret CROCHET_DEPLOIEMENT).", { code: "non-configure" });
  }
  const rep = await fetch(env.CROCHET_DEPLOIEMENT, { method: "POST" });
  if (!rep.ok) return erreur(502, `Cloudflare a refusé la demande de reconstruction (${rep.status}).`);
  const maintenant = new Date().toISOString();
  await ecrireMeta(env.DB!, "derniere_mise_a_jour", maintenant);
  return json({ demandeLe: maintenant });
};
