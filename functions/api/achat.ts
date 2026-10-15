import { preparerBase, lireDesign } from "../../server/base";
import { prixFacture } from "../../server/commandes";
import { erreur, json, type Env } from "../../server/env";
import { origineAutorisee } from "../../server/securite";
import { appelStripe, CODE_TAXE, ErreurStripe, type SessionStripe } from "../../server/stripe";
import { typeLicence, VERSION_LICENCE } from "../../lib/licence";
import { IDENTIFIANT } from "../../server/fichiers";

/**
 * Ouvre une page de paiement Stripe pour un design publié.
 * Le prix vient toujours de la base, jamais du navigateur.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!origineAutorisee(request)) return erreur(403, "Requête refusée : origine inconnue.");
  if (!env.DB || !env.STRIPE_CLE_SECRETE) return erreur(503, "Le paiement n'est pas encore ouvert.", { code: "paiement-ferme" });
  await preparerBase(env.DB);

  const corps = (await request.json().catch(() => null)) as { design?: string; devise?: string; consentement?: boolean } | null;
  const id = String(corps?.design ?? "");
  const devise = corps?.devise === "usd" ? "usd" : "eur";
  if (!IDENTIFIANT.test(id)) return erreur(400, "Design inconnu.");
  if (corps?.consentement !== true) {
    return erreur(400, "Cochez la case pour accepter le téléchargement immédiat avant de payer.", { code: "consentement" });
  }

  const d = await lireDesign(env.DB, id);
  if (!d || d.statut !== "publie" || d.exemple) return erreur(404, "Ce design n'est pas en vente.");
  const nbHd = await env.DB.prepare("SELECT COUNT(*) AS n FROM fichiers WHERE design_id = ?1 AND role = 'hd'").bind(id).first<{ n: number }>();
  if (!nbHd?.n) return erreur(409, "Ce design n'a pas encore de fichier à livrer.");
  const montant = prixFacture(d, devise);
  if (montant === null) return erreur(409, "Cette édition limitée est épuisée.");

  const origine = new URL(request.url).origin;
  const coloriage = d.famille === "petit-atelier";
  const managed = (env.STRIPE_MANAGED_PAYMENTS ?? "").toLowerCase() !== "non";
  try {
    const session = await appelStripe<SessionStripe>(env, "POST", "/v1/checkout/sessions", {
      mode: "payment",
      client_reference_id: d.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: devise,
            unit_amount: montant,
            tax_behavior: "inclusive",
            product_data: {
              name: coloriage ? `${d.titre} : pochette de coloriages` : `${d.titre} : licence standard`,
              description: `L'atelier sous la maison, design n° ${d.id}. Fichiers haute définition à télécharger.`,
              tax_code: CODE_TAXE,
              images: d.image?.startsWith("/media/") ? [`${origine}${d.image}`] : undefined,
              metadata: { design: d.id },
            },
          },
        },
      ],
      managed_payments: managed ? { enabled: true } : undefined,
      metadata: {
        design: d.id,
        licence: typeLicence(d.famille),
        version_licence: VERSION_LICENCE,
        consentement: new Date().toISOString(),
      },
      success_url: `${origine}/merci/?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origine}/motif/${d.slug}/`,
    });
    if (!session.url) return erreur(502, "Stripe n'a pas renvoyé de page de paiement.");
    return json({ url: session.url });
  } catch (e) {
    const message = e instanceof ErreurStripe ? e.message : String(e);
    console.error("Création de la session Stripe impossible :", message);
    const test = env.STRIPE_CLE_SECRETE.startsWith("sk_test_") || env.STRIPE_CLE_SECRETE.startsWith("rk_test_");
    return erreur(502, "Le paiement n'a pas pu démarrer. Réessayez dans un instant.", test ? { detail: message } : {});
  }
};
