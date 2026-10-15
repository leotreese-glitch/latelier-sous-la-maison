/// <reference types="@cloudflare/workers-types" />

/** Liaisons et secrets réglés dans Cloudflare (Settings > Bindings, Settings > Variables and Secrets). */
export interface Env {
  DB?: D1Database;
  MEDIAS?: R2Bucket;
  ADMIN_MOT_DE_PASSE?: string;
  SECRET_SESSION?: string;
  CROCHET_DEPLOIEMENT?: string;
  /** Clé secrète Stripe (sk_test_… en mode test, sk_live_… en réel). */
  STRIPE_CLE_SECRETE?: string;
  /** Secret de signature du point de terminaison webhook (whsec_…). */
  STRIPE_SECRET_WEBHOOK?: string;
  /** « non » pour désactiver Managed Payments (Stripe vendeur officiel). Activé par défaut. */
  STRIPE_MANAGED_PAYMENTS?: string;
  /** Adresse de base de l'API Stripe, remplacée uniquement pour les tests locaux. */
  STRIPE_API?: string;
}

export function etatConfiguration(env: Env) {
  const cle = env.STRIPE_CLE_SECRETE ?? "";
  return {
    base: Boolean(env.DB),
    stockage: Boolean(env.MEDIAS),
    motDePasse: Boolean(env.ADMIN_MOT_DE_PASSE && env.ADMIN_MOT_DE_PASSE.length >= 12),
    secretSession: Boolean(env.SECRET_SESSION && env.SECRET_SESSION.length >= 32),
    crochet: Boolean(env.CROCHET_DEPLOIEMENT),
    paiement: /^(sk|rk)_(test|live)_/.test(cle),
    webhook: Boolean(env.STRIPE_SECRET_WEBHOOK?.startsWith("whsec_")),
    modeTest: /^(sk|rk)_test_/.test(cle),
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
