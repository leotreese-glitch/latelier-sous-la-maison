import { preparerBase } from "../../server/base";
import { accesOuvert, lienValide, lireDonnees, nomLivre, type LigneCommande } from "../../server/commandes";
import { type Env } from "../../server/env";

function refus(statut: number, message: string) {
  return new Response(message, { status: statut, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}

/** Livre un fichier haute définition acheté, à partir d'un lien signé valable une heure. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB || !env.MEDIAS) return refus(503, "Téléchargement indisponible pour le moment.");
  const p = new URL(request.url).searchParams;
  const jeton = p.get("t") ?? "";
  const cle = p.get("f") ?? "";
  if (!(await lienValide(env, jeton, cle, p.get("e") ?? "", p.get("s") ?? ""))) {
    return refus(403, "Ce lien de téléchargement a expiré. Rouvrez votre page de commande pour en obtenir un nouveau.");
  }
  await preparerBase(env.DB);
  const l = await env.DB.prepare("SELECT * FROM commandes WHERE id = ?1").bind(jeton).first<LigneCommande>();
  if (!l || !accesOuvert(l)) return refus(403, "Cette commande ne donne plus accès aux fichiers.");
  if (!cle.startsWith(`hd/${l.design_id}/`) || cle.includes("..")) return refus(403, "Fichier non compris dans cette commande.");
  const connu = await env.DB.prepare("SELECT 1 FROM fichiers WHERE cle = ?1 AND design_id = ?2 AND role = 'hd'").bind(cle, l.design_id).first();
  if (!connu) return refus(404, "Fichier introuvable.");

  const objet = await env.MEDIAS.get(cle);
  if (!objet) return refus(404, "Fichier introuvable.");
  await env.DB.prepare("UPDATE commandes SET telechargements = telechargements + 1 WHERE id = ?1").bind(l.id).run();

  const nom = nomLivre(lireDonnees(l).slug, cle);
  const entetes = new Headers();
  objet.writeHttpMetadata(entetes);
  entetes.set("content-disposition", `attachment; filename="${nom.replace(/"/g, "")}"`);
  entetes.set("content-length", String(objet.size));
  entetes.set("cache-control", "private, no-store");
  entetes.set("x-content-type-options", "nosniff");
  return new Response(objet.body, { headers: entetes });
};
