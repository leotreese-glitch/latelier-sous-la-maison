/// <reference types="@cloudflare/workers-types" />
import { JOURS_ACCES, LICENCES, typeLicence, type Licence } from "../lib/licence";
import { FAMILLES, prixEdition, type Design } from "../lib/modele";
import { lireDesign } from "./base";
import type { Env } from "./env";
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
  consentement: string | null;
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
  const donnees: DonneesCommande = {
    titre: design.titre,
    slug: design.slug,
    famille: design.famille,
    licence: LICENCES[typeLicence(design.famille)],
    consentement: session.metadata?.consentement ?? null,
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
