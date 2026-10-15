import { preparerBase, versDesign, type LigneDesign } from "../../server/base";
import { erreur, json, type Env } from "../../server/env";
import { versionPublique, type Livrable } from "../../lib/modele";

const FORMATS: Record<string, string> = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WebP",
  "image/svg+xml": "SVG",
  "image/tiff": "TIFF",
  "application/pdf": "PDF",
  "application/zip": "ZIP",
  "application/x-zip-compressed": "ZIP",
};

/** Catalogue publié, lu au moment de la fabrication du site. */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) return json({ code: "non-configure", erreur: "La base de données n'est pas branchée." }, 503);
  try {
    await preparerBase(env.DB);
    const { results } = await env.DB.prepare(
      "SELECT * FROM designs WHERE statut = 'publie' ORDER BY publie_le DESC",
    ).all<LigneDesign>();
    // Ce que l'acheteur recevra réellement : la liste des fichiers HD déposés (jamais leurs adresses).
    const { results: fichiers } = await env.DB.prepare(
      "SELECT f.design_id, f.type_mime, f.largeur, f.hauteur, f.taille FROM fichiers f JOIN designs d ON d.id = f.design_id WHERE d.statut = 'publie' AND f.role = 'hd' ORDER BY f.cree_le",
    ).all<{ design_id: string; type_mime: string; largeur: number | null; hauteur: number | null; taille: number }>();
    const livrables = new Map<string, Livrable[]>();
    for (const f of fichiers) {
      const liste = livrables.get(f.design_id) ?? [];
      liste.push({ format: FORMATS[f.type_mime] ?? "Fichier", largeur: f.largeur, hauteur: f.hauteur, taille: f.taille });
      livrables.set(f.design_id, liste);
    }
    const designs = results.map((l) => {
      const { creeLe: _c, modifieLe: _m, ...d } = versDesign(l);
      return { ...versionPublique(d), livrables: livrables.get(l.id) ?? [] };
    });
    return json({ designs, genereLe: new Date().toISOString() });
  } catch (e) {
    return erreur(500, "Lecture du catalogue impossible.", { detail: String(e) });
  }
};
