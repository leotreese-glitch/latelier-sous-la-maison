import { erreur, etatConfiguration, json, type Env } from "../../../server/env";
import {
  adresseIp,
  cookieDeconnexion,
  creerCookieSession,
  effacerEchecs,
  motDePasseCorrect,
  noterEchec,
  sessionValide,
  tropDeTentatives,
} from "../../../server/securite";

/** État de la session et de la configuration (aucune information sensible). */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  return json({ connecte: await sessionValide(request, env), config: etatConfiguration(env) });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const db = env.DB!;
  const ip = adresseIp(request);
  if (await tropDeTentatives(db, ip)) {
    return erreur(429, "Trop de tentatives. Réessayez dans 15 minutes.");
  }
  const corps = (await request.json().catch(() => ({}))) as { motDePasse?: unknown };
  const saisi = typeof corps.motDePasse === "string" ? corps.motDePasse : "";
  if (!saisi || !(await motDePasseCorrect(saisi, env.ADMIN_MOT_DE_PASSE!))) {
    await noterEchec(db, ip);
    return erreur(401, "Mot de passe incorrect.");
  }
  await effacerEchecs(db, ip);
  return json({ connecte: true }, 200, { "set-cookie": await creerCookieSession(env) });
};

export const onRequestDelete: PagesFunction<Env> = async () => {
  return json({ connecte: false }, 200, { "set-cookie": cookieDeconnexion() });
};
