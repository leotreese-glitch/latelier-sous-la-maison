/// <reference types="@cloudflare/workers-types" />

/** Liaisons et secrets réglés dans Cloudflare (Settings > Bindings, Settings > Variables and Secrets). */
export interface Env {
  DB?: D1Database;
  MEDIAS?: R2Bucket;
  ADMIN_MOT_DE_PASSE?: string;
  SECRET_SESSION?: string;
  CROCHET_DEPLOIEMENT?: string;
}

export function etatConfiguration(env: Env) {
  return {
    base: Boolean(env.DB),
    stockage: Boolean(env.MEDIAS),
    motDePasse: Boolean(env.ADMIN_MOT_DE_PASSE && env.ADMIN_MOT_DE_PASSE.length >= 12),
    secretSession: Boolean(env.SECRET_SESSION && env.SECRET_SESSION.length >= 32),
    crochet: Boolean(env.CROCHET_DEPLOIEMENT),
  };
}

export function json(donnees: unknown, statut = 200, entetes: Record<string, string> = {}) {
  return new Response(JSON.stringify(donnees), {
    status: statut,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex",
      ...entetes,
    },
  });
}

export function erreur(statut: number, message: string, extra: Record<string, unknown> = {}) {
  return json({ erreur: message, ...extra }, statut);
}
