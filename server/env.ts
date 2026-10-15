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
  /** Clé d'API Brevo (xkeysib-…), pour envoyer les e-mails du site. */
  BREVO_CLE_API?: string;
  /** Adresse de base de l'API Brevo, remplacée uniquement pour les tests locaux. */
  BREVO_API?: string;
  /** Adresse qui reçoit un e-mail à chaque vente (variable, pas un secret). */
  EMAIL_ALERTE_VENTES?: string;
  /** Adresse publique du site, utilisée dans les liens des e-mails (ex. https://latelier-sous-la-maison.com). */
  ADRESSE_SITE?: string;
  /** Expéditeur des e-mails, si différent de commandes@latelier-sous-la-maison.com. */
  EMAIL_EXPEDITEUR?: string;
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
    courriel: Boolean(env.BREVO_CLE_API && env.BREVO_CLE_API.trim().length >= 20),
    alerteVentes: Boolean(env.EMAIL_ALERTE_VENTES && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.EMAIL_ALERTE_VENTES.trim())),
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
