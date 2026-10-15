import { envoyerCourrielsCommande, lireDonnees, type LigneCommande } from "../../../server/commandes";
import { adresseSite } from "../../../server/courriel";
import { erreur, etatConfiguration, json, type Env } from "../../../server/env";

/** Suivi des ventes : les 300 dernières commandes et les totaux par devise. */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const db = env.DB!;
  const { results } = await db.prepare("SELECT * FROM commandes ORDER BY payee_le DESC LIMIT 300").all<LigneCommande>();
  const ventes = results.map((l) => ({
    date: l.payee_le,
    designId: l.design_id,
    titre: lireDonnees(l).titre,
    montant: l.montant,
    devise: l.devise,
    email: l.email,
    pays: l.pays,
    statut: l.statut,
    certificat: l.certificat,
    telechargements: l.telechargements,
    modeTest: l.mode_test === 1,
    courrielEnvoye: Boolean(l.courriel_envoye_le),
  }));
  const totaux: Record<string, { reel: number; test: number }> = {};
  for (const v of ventes) {
    if (v.statut !== "payee") continue;
    totaux[v.devise] ??= { reel: 0, test: 0 };
    totaux[v.devise][v.modeTest ? "test" : "reel"] += v.montant;
  }
  const c = etatConfiguration(env);
  return json({
    ventes,
    totaux,
    config: { paiement: c.paiement, webhook: c.webhook, modeTest: c.modeTest, courriel: c.courriel, alerteVentes: c.alerteVentes },
  });
};

/** Renvoie l'e-mail de confirmation d'une commande (acheteur qui ne l'a pas reçu). */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const db = env.DB!;
  const corps = (await request.json().catch(() => null)) as { certificat?: unknown } | null;
  const certificat = String(corps?.certificat ?? "");
  if (!/^LSM-[2-9A-Z]{4}-[2-9A-Z]{4}-[2-9A-Z]{4}$/.test(certificat)) return erreur(400, "Numéro de certificat invalide.");
  const l = await db.prepare("SELECT * FROM commandes WHERE certificat = ?1").bind(certificat).first<LigneCommande>();
  if (!l) return erreur(404, "Commande introuvable.");
  const r = await envoyerCourrielsCommande(db, env, l, adresseSite(env, request), true);
  if (r.raison === "non-configure") return erreur(503, "L'envoi d'e-mails n'est pas encore configuré (secret BREVO_CLE_API).");
  if (r.raison === "sans-adresse") return erreur(409, "Stripe n'a pas transmis d'adresse e-mail pour cette commande.");
  if (!r.envoye) return erreur(502, "Brevo n'a pas accepté l'envoi. Vérifiez le domaine et l'expéditeur dans Brevo, puis réessayez.");
  return json({ envoye: true });
};
