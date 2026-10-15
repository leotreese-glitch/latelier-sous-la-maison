import { preparerBase } from "../../../server/base";
import { enregistrerCommande } from "../../../server/commandes";
import { erreur, json, type Env } from "../../../server/env";
import { signatureValide, type SessionStripe } from "../../../server/stripe";

interface Evenement {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}

/**
 * Point d'arrivée des événements Stripe (à déclarer dans Stripe : Développeurs > Webhooks).
 * - checkout.session.completed / async_payment_succeeded : l'achat est enregistré et les fichiers deviennent téléchargeables.
 * - charge.refunded : la commande passe en « remboursée » et l'accès aux fichiers se ferme.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB || !env.STRIPE_SECRET_WEBHOOK) return erreur(503, "Webhook non configuré.");
  const corps = await request.text();
  if (!(await signatureValide(corps, request.headers.get("stripe-signature"), env.STRIPE_SECRET_WEBHOOK))) {
    return erreur(400, "Signature invalide.");
  }
  await preparerBase(env.DB);
  const evt = JSON.parse(corps) as Evenement;

  switch (evt.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = evt.data.object as unknown as SessionStripe;
      if (session.payment_status === "paid") await enregistrerCommande(env.DB, env, session);
      break;
    }
    case "charge.refunded": {
      const charge = evt.data.object as { payment_intent?: string; refunded?: boolean };
      if (charge.payment_intent && charge.refunded) {
        await env.DB.prepare("UPDATE commandes SET statut = 'remboursee' WHERE paiement_id = ?1").bind(charge.payment_intent).run();
      }
      break;
    }
    default:
      break;
  }
  return json({ recu: true });
};
