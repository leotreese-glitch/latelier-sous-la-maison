import type { Env } from "../../server/env";

/**
 * Sert les aperçus publics depuis le stockage R2.
 * Seul le dossier apercus/ est accessible : les fichiers haute définition (hd/) ne sortent jamais par ici.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const morceaux = Array.isArray(params.chemin) ? params.chemin : [String(params.chemin ?? "")];
  const cle = morceaux.join("/");
  if (!env.MEDIAS || !cle.startsWith("apercus/") || cle.includes("..")) {
    return new Response("Introuvable", { status: 404 });
  }

  const objet = await env.MEDIAS.get(cle, { onlyIf: request.headers });
  if (!objet) return new Response("Introuvable", { status: 404 });

  const entetes = new Headers();
  objet.writeHttpMetadata(entetes);
  entetes.set("etag", objet.httpEtag);
  entetes.set("cache-control", "public, max-age=31536000, immutable");
  entetes.set("x-content-type-options", "nosniff");

  if (!("body" in objet) || !objet.body) return new Response(null, { status: 304, headers: entetes });
  return new Response(objet.body, { headers: entetes });
};
