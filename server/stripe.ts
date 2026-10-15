/// <reference types="@cloudflare/workers-types" />
// Appels à l'API Stripe sans bibliothèque : de simples requêtes HTTP, encodées comme des formulaires.
import type { Env } from "./env";

/** Version de l'API exigée par Managed Payments (2025-03-31.basil ou plus récente). */
export const VERSION_API_STRIPE = "2025-03-31.basil";

/** « Œuvre graphique numérique, téléchargée, droits permanents » : catégorie éligible à Managed Payments. */
export const CODE_TAXE = "txcd_10505001";

type Valeur = string | number | boolean | null | undefined | Valeur[] | { [cle: string]: Valeur };

/** Encode des paramètres imbriqués à la façon de Stripe : a[b][0][c]=… */
export function encoderFormulaire(params: Record<string, Valeur>) {
  const sortie = new URLSearchParams();
  const ajouter = (cle: string, v: Valeur) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) v.forEach((x, i) => ajouter(`${cle}[${i}]`, x));
    else if (typeof v === "object") for (const [k, x] of Object.entries(v)) ajouter(`${cle}[${k}]`, x);
    else sortie.append(cle, String(v));
  };
  for (const [k, v] of Object.entries(params)) ajouter(k, v);
  return sortie.toString();
}

export class ErreurStripe extends Error {
  constructor(
    message: string,
    public statut: number,
  ) {
    super(message);
  }
}

export async function appelStripe<T>(env: Env, methode: "GET" | "POST", chemin: string, params?: Record<string, Valeur>): Promise<T> {
  if (!env.STRIPE_CLE_SECRETE) throw new ErreurStripe("Paiement non configuré.", 503);
  const base = env.STRIPE_API || "https://api.stripe.com";
  const corps = params ? encoderFormulaire(params) : undefined;
  const url = methode === "GET" && corps ? `${base}${chemin}?${corps}` : `${base}${chemin}`;
  const rep = await fetch(url, {
    method: methode,
    headers: {
      authorization: `Bearer ${env.STRIPE_CLE_SECRETE}`,
      "stripe-version": VERSION_API_STRIPE,
      ...(methode === "POST" ? { "content-type": "application/x-www-form-urlencoded" } : {}),
    },
    body: methode === "POST" ? corps : undefined,
  });
  const donnees = (await rep.json().catch(() => ({}))) as { error?: { message?: string } } & T;
  if (!rep.ok) throw new ErreurStripe(donnees.error?.message ?? `Stripe a répondu ${rep.status}.`, rep.status);
  return donnees;
}

const encodeur = new TextEncoder();

function hex(octets: ArrayBuffer) {
  return [...new Uint8Array(octets)].map((o) => o.toString(16).padStart(2, "0")).join("");
}

function egauxTexte(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Vérifie l'en-tête Stripe-Signature (t=…,v1=…) : HMAC-SHA256 de « t.corps » avec le secret du webhook.
 * Refuse les messages de plus de 5 minutes pour empêcher qu'on rejoue un ancien message.
 */
export async function signatureValide(corps: string, entete: string | null, secret: string, maintenantS = Date.now() / 1000) {
  if (!entete) return false;
  const morceaux = entete.split(",").map((m) => m.trim().split("="));
  const t = morceaux.find(([k]) => k === "t")?.[1];
  const signatures = morceaux.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!t || !signatures.length || !Number.isFinite(Number(t))) return false;
  if (Math.abs(maintenantS - Number(t)) > 300) return false;
  const cle = await crypto.subtle.importKey("raw", encodeur.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const attendu = hex(await crypto.subtle.sign("HMAC", cle, encodeur.encode(`${t}.${corps}`)));
  return signatures.some((s) => egauxTexte(s, attendu));
}

/** Ce que le site lit d'une Checkout Session. */
export interface SessionStripe {
  id: string;
  url?: string;
  status?: string;
  payment_status?: string;
  amount_total?: number;
  currency?: string;
  payment_intent?: string | { id: string } | null;
  livemode?: boolean;
  created?: number;
  metadata?: Record<string, string>;
  customer_details?: { email?: string | null; name?: string | null; address?: { country?: string | null } | null } | null;
}
