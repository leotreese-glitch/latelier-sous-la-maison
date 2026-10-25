import { preparerBase } from "../../../server/base";
import { adresseSite, adresseValide, courrielActif, envoyerCourriel } from "../../../server/courriel";
import { erreur, json, type Env } from "../../../server/env";
import { modeleRetrouver } from "../../../server/modeles-courriel";
import { adresseIp, empreinteHex, limiteAtteinte, noterEchec, origineAutorisee } from "../../../server/securite";
import { lireDonnees, type LigneCommande } from "../../../server/commandes";
import { langueValide } from "../../../lib/i18n";

const HEURE = 3600 * 1000;
const REPONSE =
  "Si des commandes sont liées à cette adresse, nous venons de vous envoyer un e-mail avec leurs liens. Pensez à regarder dans les courriers indésirables.";

/**
 * « Retrouver mes commandes » : envoie à l'adresse saisie la liste de ses liens de commande.
 * La réponse est toujours la même, qu'il existe des commandes ou non, pour ne rien révéler sur les acheteurs.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  if (!origineAutorisee(request)) return erreur(403, "Requête refusée : origine inconnue.");
  if (!env.DB || !courrielActif(env)) return erreur(503, "Ce service ouvre bientôt.", { code: "ferme" });
  await preparerBase(env.DB);

  const corps = (await request.json().catch(() => null)) as { email?: unknown; langue?: unknown } | null;
  const langue = langueValide(corps?.langue);
  const email = String(corps?.email ?? "").trim().toLowerCase();
  if (!adresseValide(email)) return erreur(400, "Cette adresse e-mail ne semble pas valide.");

  const cleIp = `retrouver:ip:${adresseIp(request)}`;
  const cleEmail = `retrouver:email:${await empreinteHex(email)}`;
  if ((await limiteAtteinte(env.DB, cleIp, 10, HEURE)) || (await limiteAtteinte(env.DB, cleEmail, 3, HEURE))) {
    return erreur(429, "Trop de demandes. Réessayez dans une heure.");
  }
  await noterEchec(env.DB, cleIp);
  await noterEchec(env.DB, cleEmail);

  const { results } = await env.DB.prepare("SELECT * FROM commandes WHERE lower(email) = ?1 ORDER BY payee_le DESC LIMIT 25")
    .bind(email)
    .all<LigneCommande>();
  if (results.length > 0) {
    const m = modeleRetrouver(
      results.map((l) => ({
        titre: (langue === "en" && lireDonnees(l).titreEn) || lireDonnees(l).titre,
        designId: l.design_id,
        payeeLe: l.payee_le,
        jeton: l.id,
        remboursee: l.statut === "remboursee",
        modeTest: l.mode_test === 1,
      })),
      adresseSite(env, request),
      langue,
    );
    waitUntil(
      envoyerCourriel(env, { a: email, sujet: m.sujet, html: m.html, etiquette: "retrouver-commandes" }).catch((e) =>
        console.error("E-mail « retrouver mes commandes » non envoyé :", String(e)),
      ),
    );
  }
  return json({ message: REPONSE });
};
