/// <reference types="@cloudflare/workers-types" />
import type { Env } from "./env";

const NOM_COOKIE = "atelier_admin";
const DUREE_SESSION_S = 7 * 24 * 3600;
const FENETRE_TENTATIVES_MS = 15 * 60 * 1000;
const TENTATIVES_MAX = 8;

const encodeur = new TextEncoder();

function base64url(octets: ArrayBuffer | Uint8Array) {
  const tab = octets instanceof Uint8Array ? octets : new Uint8Array(octets);
  let s = "";
  for (const o of tab) s += String.fromCharCode(o);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signer(secret: string, texte: string) {
  const cle = await crypto.subtle.importKey("raw", encodeur.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64url(await crypto.subtle.sign("HMAC", cle, encodeur.encode(texte)));
}

async function empreinte(texte: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encodeur.encode(texte)));
}

/** Comparaison en temps constant, pour ne rien révéler du mot de passe par la durée de réponse. */
function egaux(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function motDePasseCorrect(saisi: string, attendu: string) {
  return egaux(await empreinte(saisi), await empreinte(attendu));
}

export async function creerCookieSession(env: Env) {
  const expire = Math.floor(Date.now() / 1000) + DUREE_SESSION_S;
  const charge = `admin.${expire}`;
  const jeton = `${charge}.${await signer(env.SECRET_SESSION!, charge)}`;
  return `${NOM_COOKIE}=${jeton}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${DUREE_SESSION_S}`;
}

export function cookieDeconnexion() {
  return `${NOM_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function sessionValide(request: Request, env: Env) {
  if (!env.SECRET_SESSION) return false;
  const cookies = request.headers.get("cookie") ?? "";
  const brut = cookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${NOM_COOKIE}=`))
    ?.slice(NOM_COOKIE.length + 1);
  if (!brut) return false;
  const morceaux = brut.split(".");
  if (morceaux.length !== 3 || morceaux[0] !== "admin") return false;
  const expire = Number(morceaux[1]);
  if (!Number.isFinite(expire) || expire < Date.now() / 1000) return false;
  const attendu = await signer(env.SECRET_SESSION, `${morceaux[0]}.${morceaux[1]}`);
  return egaux(encodeur.encode(attendu), encodeur.encode(morceaux[2]));
}

/** Les requêtes qui modifient quelque chose doivent venir du site lui-même. */
export function origineAutorisee(request: Request) {
  if (request.method === "GET" || request.method === "HEAD") return true;
  const origine = request.headers.get("origin");
  if (!origine) return false;
  return new URL(origine).host === new URL(request.url).host;
}

export function adresseIp(request: Request) {
  return request.headers.get("cf-connecting-ip") ?? "inconnue";
}

export async function tropDeTentatives(db: D1Database, ip: string) {
  const depuis = Date.now() - FENETRE_TENTATIVES_MS;
  const r = await db
    .prepare("SELECT COUNT(*) AS n FROM tentatives_connexion WHERE ip = ?1 AND quand > ?2")
    .bind(ip, depuis)
    .first<{ n: number }>();
  return (r?.n ?? 0) >= TENTATIVES_MAX;
}

export async function noterEchec(db: D1Database, ip: string) {
  await db.batch([
    db.prepare("INSERT INTO tentatives_connexion (ip, quand) VALUES (?1, ?2)").bind(ip, Date.now()),
    db.prepare("DELETE FROM tentatives_connexion WHERE quand < ?1").bind(Date.now() - 24 * 3600 * 1000),
  ]);
}

export function effacerEchecs(db: D1Database, ip: string) {
  return db.prepare("DELETE FROM tentatives_connexion WHERE ip = ?1").bind(ip).run();
}
