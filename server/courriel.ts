/// <reference types="@cloudflare/workers-types" />
import { CONTACT, EXPEDITEUR } from "../lib/site";
import type { Env } from "./env";

export class ErreurCourriel extends Error {
  constructor(
    message: string,
    public statut: number,
  ) {
    super(message);
  }
}

export interface Courriel {
  a: string;
  nom?: string | null;
  sujet: string;
  html: string;
  /** Étiquette pour retrouver l'envoi dans les journaux Brevo. */
  etiquette: string;
}

export function courrielActif(env: Env) {
  return Boolean(env.BREVO_CLE_API && env.BREVO_CLE_API.trim().length >= 20);
}

/** Adresse du site à mettre dans les liens des e-mails : le domaine public s'il est réglé, sinon celle de la requête. */
export function adresseSite(env: Env, request: Request) {
  const reglee = (env.ADRESSE_SITE ?? "").trim().replace(/\/+$/, "");
  return /^https:\/\/[a-z0-9.-]+$/i.test(reglee) ? reglee : new URL(request.url).origin;
}

/** Envoie un e-mail transactionnel par l'API Brevo. Renvoie l'identifiant du message. */
export async function envoyerCourriel(env: Env, c: Courriel): Promise<string> {
  if (!courrielActif(env)) throw new ErreurCourriel("L'envoi d'e-mails n'est pas configuré.", 503);
  const base = (env.BREVO_API || "https://api.brevo.com").replace(/\/+$/, "");
  const corps: Record<string, unknown> = {
    sender: { name: EXPEDITEUR.nom, email: (env.EMAIL_EXPEDITEUR || EXPEDITEUR.email).trim() },
    to: [c.nom ? { email: c.a, name: c.nom.slice(0, 70) } : { email: c.a }],
    subject: c.sujet,
    htmlContent: c.html,
    tags: [c.etiquette],
  };
  if (CONTACT.actif) corps.replyTo = { email: CONTACT.email };

  const rep = await fetch(`${base}/v3/smtp/email`, {
    method: "POST",
    headers: { "api-key": env.BREVO_CLE_API!.trim(), "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(corps),
  });
  const reponse = (await rep.json().catch(() => ({}))) as { messageId?: string; message?: string; code?: string };
  if (!rep.ok) throw new ErreurCourriel(`Brevo a refusé l'envoi (${rep.status}${reponse.code ? `, ${reponse.code}` : ""}) : ${reponse.message ?? "sans détail"}`, rep.status);
  return reponse.messageId ?? "";
}

export function adresseValide(email: string) {
  return email.length <= 254 && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(email);
}
