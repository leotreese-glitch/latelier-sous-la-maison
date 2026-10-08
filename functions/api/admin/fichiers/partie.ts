import { erreur, json, type Env } from "../../../../server/env";

/** Reçoit un morceau de fichier et le transmet directement au stockage, sans le garder en mémoire. */
export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.MEDIAS) return erreur(503, "Le stockage des fichiers n'est pas branché.", { code: "non-configure" });
  const url = new URL(request.url);
  const cle = url.searchParams.get("cle") ?? "";
  const uploadId = url.searchParams.get("uploadId") ?? "";
  const numero = Number(url.searchParams.get("numero"));
  if (!/^(hd|apercus)\//.test(cle) || cle.includes("..") || !uploadId) return erreur(400, "Envoi inconnu.");
  if (!Number.isInteger(numero) || numero < 1 || numero > 10000) return erreur(400, "Numéro de morceau invalide.");
  if (!request.body) return erreur(400, "Morceau vide.");

  const envoi = env.MEDIAS.resumeMultipartUpload(cle, uploadId);
  try {
    const partie = await envoi.uploadPart(numero, request.body);
    return json({ numero: partie.partNumber, etag: partie.etag });
  } catch (e) {
    return erreur(500, "Le morceau n'a pas pu être enregistré. Réessayez l'envoi.", { detail: String(e) });
  }
};
