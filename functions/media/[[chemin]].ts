import type { Env } from "../../server/env";

/**
 * Sert les aperçus publics depuis le stockage R2.
 * Seul le dossier apercus/ est accessible : les fichiers haute définition (hd/) ne sortent jamais par ici.
 *
 * Chaque aperçu est gardé dans le cache de Cloudflare (le nom du fichier change à chaque nouveau dépôt,
 * donc une image en cache n'est jamais périmée) : seul le premier visiteur d'un centre Cloudflare
 * attend la lecture dans R2, les suivants reçoivent l'image tout de suite.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env, params, waitUntil }) => {
  const morceaux = Array.isArray(params.chemin) ? params.chemin : [String(params.chemin ?? "")];
  const cle = morceaux.join("/");
  if (!env.MEDIAS || !cle.startsWith("apercus/") || cle.includes("..")) {
    return new Response("Introuvable", { status: 404 });
  }

  const url = new URL(request.url);
  const cleCache = new Request(`${url.origin}${url.pathname}`, { method: "GET" });
  const cache = caches.default;
  const enCache = await cache.match(cleCache);
  if (enCache) return reponseConditionnelle(request, enCache);

  const objet = await env.MEDIAS.get(cle);
  if (!objet) return new Response("Introuvable", { status: 404 });

  const entetes = new Headers();
  objet.writeHttpMetadata(entetes);
  entetes.set("etag", objet.httpEtag);
  entetes.set("cache-control", "public, max-age=31536000, immutable");
  entetes.set("x-content-type-options", "nosniff");

  const reponse = new Response(objet.body, { headers: entetes });
  waitUntil(cache.put(cleCache, reponse.clone()));
  return reponseConditionnelle(request, reponse);
};

/** Répond « pas modifié » (304) quand le navigateur a déjà la même image. */
function reponseConditionnelle(request: Request, reponse: Response) {
  const etag = reponse.headers.get("etag");
  const demande = request.headers.get("if-none-match");
  if (etag && demande && demande.split(",").some((e) => e.trim() === etag)) {
    return new Response(null, { status: 304, headers: reponse.headers });
  }
  return reponse;
}
