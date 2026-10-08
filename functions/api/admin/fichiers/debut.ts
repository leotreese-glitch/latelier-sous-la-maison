import { lireDesign } from "../../../../server/base";
import { erreur, json, type Env } from "../../../../server/env";
import { cleFichier, IDENTIFIANT, TYPES_APERCU, TYPES_HD, type Role } from "../../../../server/fichiers";

/**
 * Début d'un envoi en plusieurs morceaux (jusqu'à plusieurs centaines de Mo).
 * Le navigateur envoie ensuite chaque morceau à /partie, puis termine avec /fin.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.MEDIAS) return erreur(503, "Le stockage des fichiers n'est pas branché.", { code: "non-configure" });
  const corps = (await request.json().catch(() => ({}))) as { design?: string; role?: Role; nom?: string; type?: string };
  const { design = "", role, nom = "", type = "" } = corps;

  if (!IDENTIFIANT.test(design) || !(await lireDesign(env.DB!, design))) return erreur(404, "Design introuvable.");
  if (role !== "hd" && role !== "apercu") return erreur(400, "Rôle de fichier inconnu.");
  const permis = role === "hd" ? TYPES_HD : TYPES_APERCU;
  if (!permis.includes(type)) return erreur(415, `Type de fichier refusé (${type || "inconnu"}).`);

  const cle = cleFichier(role, design, nom, type);
  const envoi = await env.MEDIAS.createMultipartUpload(cle, { httpMetadata: { contentType: type } });
  return json({ cle, uploadId: envoi.uploadId });
};
