/// <reference types="@cloudflare/workers-types" />
import { langueValide, type Langue } from "../lib/i18n";
import { JOURS_ACCES, licenceSelonLangue, typeLicence, type Licence } from "../lib/licence";
import { FAMILLES, prixEdition, type Design } from "../lib/modele";
import { lireDesign } from "./base";
import { courrielActif, envoyerCourriel } from "./courriel";
import type { Env } from "./env";
import { modeleAlerteVente, modeleConfirmation, type InfosCommande } from "./modeles-courriel";
import type { SessionStripe } from "./stripe";

export { JOURS_ACCES };
/** Durée de validité d'un lien de téléchargement, une fois la page de commande ouverte. */
const LIEN_VALIDE_S = 3600;

const encodeur = new TextEncoder();

function base64url(octets: Uint8Array) {
  let s = "";
  for (const o of octets) s += String.fromCharCode(o);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function jetonAleatoire(octets = 24) {
  return base64url(crypto.getRandomValues(new Uint8Array(octets)));
}

/** Numéro de certificat lisible et impossible à deviner : LSM-XXXX-XXXX-XXXX (sans 0, O, 1, I, L). */
export function numeroCertificat() {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const hasard = crypto.getRandomValues(new Uint8Array(12));
  const car = [...hasard].map((o) => alphabet[o % alphabet.length]).join("");
  return `LSM-${car.slice(0, 4)}-${car.slice(4, 8)}-${car.slice(8, 12)}`;
}

/** Prix réellement facturé, en centimes, toujours calculé côté serveur depuis la base. */
export function prixFacture(d: Design, devise: "eur" | "usd") {
  const edition = prixEdition(d);
  if (d.edition && !edition) return null; // édition limitée épuisée
  const prix = edition ? edition.palier : d.prix;
  const montant = devise === "eur" ? prix.eur : prix.usd;
  if (!(montant > 0)) return null;
  return Math.round(montant * 100);
}

export interface DonneesCommande {
  titre: string;
  slug: string;
  famille: Design["famille"];
  licence: Licence;
  /** Date et heure de l'accord donné avant le paiement (accès immédiat et perte du droit de rétractation). */
  consentement: string | null;
  /** Version des conditions de vente acceptées (absente sur les commandes antérieures aux conditions de vente). */
  versionCgv?: string | null;
  /** Langue du site au moment de l'achat : celle des e-mails et du texte de licence recopié (français par défaut). */
  langue?: Langue;
  /** Titre anglais du design au moment de l'achat, quand il existe. */
  titreEn?: string | null;
}

export interface LigneCommande {
  id: string;
  session_id: string;
  paiement_id: string | null;
  design_id: string;
  certificat: string;
  statut: "payee" | "remboursee";
  montant: number;
  devise: string;
  email: string | null;
  nom: string | null;
  pays: string | null;
  mode_test: number;
  donnees: string;
  telechargements: number;
  payee_le: string;
  cree_le: string;
  courriel_envoye_le?: string | null;
  courriel_tente_le?: string | null;
}

export function lireDonnees(l: LigneCommande): DonneesCommande {
  return JSON.parse(l.donnees) as DonneesCommande;
}

/**
 * Enregistre un achat payé, une seule fois même si Stripe envoie l'événement plusieurs fois
 * ou si la page de remerciement arrive avant le webhook.
 */
export async function enregistrerCommande(db: D1Database, env: Env, session: SessionStripe) {
  const existante = await db.prepare("SELECT * FROM commandes WHERE session_id = ?1").bind(session.id).first<LigneCommande>();
  if (existante) return existante;
  if (session.payment_status !== "paid") return null;

  const designId = session.metadata?.design ?? "";
  const design = await lireDesign(db, designId);
  if (!design) throw new Error(`Design ${designId} introuvable pour la session ${session.id}.`);

  const maintenant = new Date().toISOString();
  const langue = langueValide(session.metadata?.langue);
  const donnees: DonneesCommande = {
    titre: design.titre,
    titreEn: design.en?.titre?.trim() || null,
    slug: design.slug,
    famille: design.famille,
    langue,
    licence: licenceSelonLangue(typeLicence(design.famille), langue),
    consentement: session.metadata?.consentement ?? null,
    versionCgv: session.metadata?.version_cgv ?? null,
  };
  const paiement = typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);
  const id = jetonAleatoire();
  const resultat = await db
    .prepare(
      `INSERT OR IGNORE INTO commandes
        (id, session_id, paiement_id, design_id, certificat, statut, montant, devise, email, nom, pays, mode_test, donnees, payee_le, cree_le)
        VALUES (?1, ?2, ?3, ?4, ?5, 'payee', ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?13)`,
    )
    .bind(
      id,
      session.id,
      paiement,
      design.id,
      numeroCertificat(),
      session.amount_total ?? 0,
      (session.currency ?? "eur").toLowerCase(),
      session.customer_details?.email ?? null,
      session.customer_details?.name ?? null,
      session.customer_details?.address?.country ?? null,
      session.livemode ? 0 : 1,
      JSON.stringify(donnees),
      maintenant,
    )
    .run();

  // Une édition limitée compte ses licences vendues et se retire d'elle-même une fois épuisée.
  // Le compteur est incrémenté dans la base elle-même, pour ne perdre aucune vente si deux achats arrivent ensemble.
  if (resultat.meta.changes > 0 && design.edition) {
    const total = design.edition.paliers.reduce((n, p) => n + p.licences, 0);
    await db
      .prepare(
        "UPDATE designs SET donnees = json_set(donnees, '$.edition.vendues', COALESCE(json_extract(donnees, '$.edition.vendues'), 0) + 1), modifie_le = ?2 WHERE id = ?1",
      )
      .bind(design.id, maintenant)
      .run();
    const apres = await db
      .prepare("SELECT json_extract(donnees, '$.edition.vendues') AS vendues, statut FROM designs WHERE id = ?1")
      .bind(design.id)
      .first<{ vendues: number; statut: string }>();
    if (apres && apres.vendues >= total && apres.statut === "publie") {
      await db.prepare("UPDATE designs SET statut = 'retire', modifie_le = ?2 WHERE id = ?1").bind(design.id, maintenant).run();
      if (env.CROCHET_DEPLOIEMENT) await fetch(env.CROCHET_DEPLOIEMENT, { method: "POST" }).catch(() => {});
    }
  }

  return db.prepare("SELECT * FROM commandes WHERE session_id = ?1").bind(session.id).first<LigneCommande>();
}

async function hmac(secret: string, texte: string) {
  const cle = await crypto.subtle.importKey("raw", encodeur.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64url(new Uint8Array(await crypto.subtle.sign("HMAC", cle, encodeur.encode(texte))));
}

export async function lienTelechargement(env: Env, commande: string, cle: string) {
  const expire = Math.floor(Date.now() / 1000) + LIEN_VALIDE_S;
  const signature = await hmac(env.SECRET_SESSION!, `${commande}|${cle}|${expire}`);
  const p = new URLSearchParams({ t: commande, f: cle, e: String(expire), s: signature });
  return `/api/telecharger?${p.toString()}`;
}

export async function lienValide(env: Env, commande: string, cle: string, expire: string, signature: string) {
  if (!env.SECRET_SESSION || !/^\d+$/.test(expire) || Number(expire) < Date.now() / 1000) return false;
  const attendue = await hmac(env.SECRET_SESSION, `${commande}|${cle}|${expire}`);
  if (attendue.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < attendue.length; i++) diff |= attendue.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

export function accesOuvert(l: LigneCommande) {
  return l.statut === "payee" && Date.now() - Date.parse(l.payee_le) < JOURS_ACCES * 24 * 3600 * 1000;
}

/** Nom du fichier tel que l'acheteur le reçoit : l-atelier-sous-la-maison_<adresse>_<nom d'origine>. */
export function nomLivre(slug: string, cle: string) {
  const nom = cle.split("/").pop() ?? "fichier";
  return `l-atelier-sous-la-maison_${slug}_${nom}`.slice(0, 180);
}

/** E-mail partiellement masqué pour le certificat public : l***@gmail.com */
export function emailMasque(email: string | null) {
  if (!email || !email.includes("@")) return null;
  const [nom, domaine] = email.split("@");
  return `${nom.slice(0, 1)}***@${domaine}`;
}

export function nomTiroir(famille: Design["famille"]) {
  return FAMILLES[famille]?.nom ?? famille;
}

export function finAcces(l: LigneCommande) {
  return new Date(Date.parse(l.payee_le) + JOURS_ACCES * 24 * 3600 * 1000).toISOString();
}

function infosCommande(l: LigneCommande): InfosCommande {
  const d = lireDonnees(l);
  const langue = langueValide(d.langue);
  return {
    langue,
    titre: langue === "en" && d.titreEn ? d.titreEn : d.titre,
    designId: l.design_id,
    coloriage: d.famille === "petit-atelier",
    licence: d.licence.nom,
    certificat: l.certificat,
    montant: l.montant,
    devise: l.devise,
    payeeLe: l.payee_le,
    finAcces: finAcces(l),
    jeton: l.id,
    modeTest: l.mode_test === 1,
    consentement: d.consentement ?? null,
    versionCgv: d.versionCgv ?? null,
  };
}

/** Délai avant de retenter un envoi qui n'a pas abouti (Brevo indisponible, par exemple). */
const NOUVEL_ESSAI_MS = 10 * 60 * 1000;

/**
 * Envoie l'e-mail de confirmation à l'acheteur (et l'alerte de vente à Léo), une seule fois par commande,
 * même si le webhook et la page de remerciement arrivent en même temps. Ne lève jamais d'erreur :
 * un e-mail raté ne doit pas faire échouer l'enregistrement de la commande.
 * `force` renvoie la confirmation à la demande de l'administration (sans nouvelle alerte de vente).
 */
export async function envoyerCourrielsCommande(db: D1Database, env: Env, l: LigneCommande, site: string, force = false) {
  if (!courrielActif(env)) return { envoye: false, raison: "non-configure" as const };
  if (!l.email) return { envoye: false, raison: "sans-adresse" as const };
  const maintenant = new Date().toISOString();

  let premiereFois = false;
  if (!force) {
    // Le premier qui pose sa date d'essai gagne le droit d'envoyer.
    const premier = await db
      .prepare("UPDATE commandes SET courriel_tente_le = ?2 WHERE id = ?1 AND courriel_envoye_le IS NULL AND courriel_tente_le IS NULL")
      .bind(l.id, maintenant)
      .run();
    premiereFois = premier.meta.changes > 0;
    if (!premiereFois) {
      const relance = await db
        .prepare("UPDATE commandes SET courriel_tente_le = ?2 WHERE id = ?1 AND courriel_envoye_le IS NULL AND courriel_tente_le < ?3")
        .bind(l.id, maintenant, new Date(Date.now() - NOUVEL_ESSAI_MS).toISOString())
        .run();
      if (relance.meta.changes === 0) return { envoye: false, raison: "deja-traite" as const };
    }
  }

  const infos = infosCommande(l);
  let envoye = false;
  try {
    const m = modeleConfirmation({ ...infos, nom: l.nom }, site);
    await envoyerCourriel(env, { a: l.email, nom: l.nom, sujet: m.sujet, html: m.html, etiquette: "confirmation-commande" });
    await db.prepare("UPDATE commandes SET courriel_envoye_le = ?2 WHERE id = ?1").bind(l.id, new Date().toISOString()).run();
    envoye = true;
  } catch (e) {
    console.error(`E-mail de confirmation non envoyé pour la commande ${l.certificat} :`, String(e));
  }

  if (premiereFois && env.EMAIL_ALERTE_VENTES?.includes("@")) {
    try {
      const m = modeleAlerteVente({ ...infos, email: l.email, pays: l.pays }, site);
      await envoyerCourriel(env, { a: env.EMAIL_ALERTE_VENTES.trim(), sujet: m.sujet, html: m.html, etiquette: "alerte-vente" });
    } catch (e) {
      console.error(`Alerte de vente non envoyée pour la commande ${l.certificat} :`, String(e));
    }
  }
  return { envoye, raison: envoye ? ("envoye" as const) : ("erreur" as const) };
}
