import { preparerBase } from "../../server/base";
import { emailMasque, lireDonnees, nomTiroir, type LigneCommande } from "../../server/commandes";
import { erreur, json, type Env } from "../../server/env";

/** Vérification publique d'un certificat de licence à partir de son numéro. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return erreur(503, "Vérification indisponible pour le moment.");
  const numero = (new URL(request.url).searchParams.get("n") ?? "").trim().toUpperCase();
  if (!/^LSM-[2-9A-Z]{4}-[2-9A-Z]{4}-[2-9A-Z]{4}$/.test(numero)) return erreur(400, "Numéro de certificat invalide.");
  await preparerBase(env.DB);
  const l = await env.DB.prepare("SELECT * FROM commandes WHERE certificat = ?1").bind(numero).first<LigneCommande>();
  if (!l) return erreur(404, "Aucun certificat ne porte ce numéro.");
  const d = lireDonnees(l);
  return json({
    certificat: {
      numero: l.certificat,
      valide: l.statut === "payee",
      statut: l.statut,
      delivreLe: l.payee_le,
      titulaire: l.nom || emailMasque(l.email) || "Acheteur",
      design: { id: l.design_id, titre: d.titre, slug: d.slug, tiroir: nomTiroir(d.famille) },
      licence: d.licence,
      modeTest: l.mode_test === 1,
    },
  });
};
