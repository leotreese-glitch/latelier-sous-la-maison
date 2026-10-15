// Réglages publics du site, communs aux pages et aux fonctions.

/** Adresse publique du site une fois le nom de domaine branché. */
export const DOMAINE = "latelier-sous-la-maison.com";

/**
 * Adresse de contact (redirigée vers la boîte de Léo par Cloudflare Email Routing).
 * `actif` passe à true seulement quand Léo a vérifié qu'un message envoyé à cette adresse lui arrive bien :
 * avant, elle n'est affichée nulle part, pour ne jamais donner une adresse qui rebondit.
 */
export const CONTACT = { email: `contact@${DOMAINE}`, actif: true }; // vérifiée par Léo le 16 octobre 2026

/** Expéditeur par défaut des e-mails du site (doit être déclaré dans Brevo). */
export const EXPEDITEUR = { email: `commandes@${DOMAINE}`, nom: "L'atelier sous la maison" };
