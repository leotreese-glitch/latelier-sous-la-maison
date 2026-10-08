import { erreur, json, type Env } from "../../../../server/env";
import { lireFichiers } from "../../../../server/base";

/** Supprime un fichier HD (pour le remplacer par une meilleure version, par exemple). */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.MEDIAS) return erreur(503, "Le stockage des fichiers n'est pas branché.", { code: "non-configure" });
  const { cle = "" } = (await request.json().catch(() => ({}))) as { cle?: string };
  const ligne = await env.DB!.prepare("SELECT design_id, role FROM fichiers WHERE cle = ?1").bind(cle).first<{ design_id: string; role: string }>();
  if (!ligne) return erreur(404, "Fichier introuvable.");
  if (ligne.role !== "hd") return erreur(400, "L'aperçu se remplace en déposant un nouveau fichier.");
  await env.MEDIAS.delete(cle);
  await env.DB!.prepare("DELETE FROM fichiers WHERE cle = ?1").bind(cle).run();
  return json({ fichiers: await lireFichiers(env.DB!, ligne.design_id) });
};
