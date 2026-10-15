import { lireDonnees, type LigneCommande } from "../../../server/commandes";
import { etatConfiguration, json, type Env } from "../../../server/env";

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
  }));
  const totaux: Record<string, { reel: number; test: number }> = {};
  for (const v of ventes) {
    if (v.statut !== "payee") continue;
    totaux[v.devise] ??= { reel: 0, test: 0 };
    totaux[v.devise][v.modeTest ? "test" : "reel"] += v.montant;
  }
  const c = etatConfiguration(env);
  return json({ ventes, totaux, config: { paiement: c.paiement, webhook: c.webhook, modeTest: c.modeTest } });
};
