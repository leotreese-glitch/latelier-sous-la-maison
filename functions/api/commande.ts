import { preparerBase, lireFichiers } from "../../server/base";
import {
  accesOuvert,
  enregistrerCommande,
  envoyerCourrielsCommande,
  finAcces,
  lienTelechargement,
  lireDonnees,
  nomLivre,
  type LigneCommande,
} from "../../server/commandes";
import { adresseSite, courrielActif } from "../../server/courriel";
import { erreur, json, type Env } from "../../server/env";
import { appelStripe, ErreurStripe, type SessionStripe } from "../../server/stripe";

/**
 * Deux usages :
 * - ?session=cs_… (page de remerciement) : retrouve la commande, ou la confirme auprès de Stripe si le webhook
 *   n'est pas encore arrivé, et renvoie le jeton de la page de commande ;
 * - ?t=<jeton> (page de commande) : renvoie la commande et des liens de téléchargement valables une heure.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  if (!env.DB || !env.SECRET_SESSION) return erreur(503, "Le paiement n'est pas encore ouvert.");
  await preparerBase(env.DB);
  const url = new URL(request.url);
  const session = url.searchParams.get("session");
  const jeton = url.searchParams.get("t");

  if (session) {
    if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(session)) return erreur(400, "Référence de paiement invalide.");
    let ligne = await env.DB.prepare("SELECT * FROM commandes WHERE session_id = ?1").bind(session).first<LigneCommande>();
    if (!ligne) {
      try {
        const s = await appelStripe<SessionStripe>(env, "GET", `/v1/checkout/sessions/${session}`);
        if (s.payment_status !== "paid") return json({ statut: "en-attente" });
        ligne = await enregistrerCommande(env.DB, env, s);
      } catch (e) {
        if (e instanceof ErreurStripe && e.statut === 404) return erreur(404, "Paiement introuvable.");
        return json({ statut: "en-attente" });
      }
    }
    if (!ligne) return json({ statut: "en-attente" });
    // Si le webhook n'est pas encore passé, c'est cette page qui déclenche l'e-mail (une seule fois au total).
    if (!ligne.courriel_envoye_le) waitUntil(envoyerCourrielsCommande(env.DB, env, ligne, adresseSite(env, request)));
    return json({ statut: "payee", jeton: ligne.id });
  }

  if (!jeton || !/^[A-Za-z0-9_-]{20,64}$/.test(jeton)) return erreur(400, "Lien de commande invalide.");
  const l = await env.DB.prepare("SELECT * FROM commandes WHERE id = ?1").bind(jeton).first<LigneCommande>();
  if (!l) return erreur(404, "Commande introuvable.");

  const d = lireDonnees(l);
  const ouvert = accesOuvert(l);
  const fichiers = ouvert
    ? await Promise.all(
        (await lireFichiers(env.DB, l.design_id))
          .filter((f) => f.role === "hd")
          .map(async (f) => ({
            nom: nomLivre(d.slug, f.cle),
            taille: f.taille,
            largeur: f.largeur,
            hauteur: f.hauteur,
            url: await lienTelechargement(env, l.id, f.cle),
          })),
      )
    : [];

  // Un e-mail qui n'est pas parti (Brevo indisponible) est retenté à l'ouverture de la page.
  if (!l.courriel_envoye_le && l.statut === "payee") waitUntil(envoyerCourrielsCommande(env.DB, env, l, adresseSite(env, request)));
  return json(
    {
      commande: {
        designId: l.design_id,
        titre: d.titre,
        titreEn: d.titreEn ?? null,
        slug: d.slug,
        famille: d.famille,
        statut: l.statut,
        montant: l.montant,
        devise: l.devise,
        email: l.email,
        payeeLe: l.payee_le,
        certificat: l.certificat,
        licence: d.licence.nom,
        modeTest: l.mode_test === 1,
        finAcces: finAcces(l),
        ouvert,
        courrielActif: courrielActif(env),
        courrielEnvoye: Boolean(l.courriel_envoye_le),
      },
      fichiers,
    },
    200,
    { "referrer-policy": "no-referrer" },
  );
};
