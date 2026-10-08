import { lireDesign, lireFichiers, slugLibre, versDonnees } from "../../../../server/base";
import { erreur, json, type Env } from "../../../../server/env";
import { manquesPourPublier, slugifier, type Design, type Statut } from "../../../../lib/modele";

const STATUTS: Statut[] = ["brouillon", "publie", "retire"];

function identifiant(params: Record<string, string | string[]>) {
  return String(params.id ?? "");
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = identifiant(params);
  const design = await lireDesign(env.DB!, id);
  if (!design) return erreur(404, "Design introuvable.");
  return json({ design, fichiers: await lireFichiers(env.DB!, id) });
};

/**
 * Enregistre un design. Règles :
 * - l'identifiant ne change jamais ;
 * - l'adresse (slug) est figée dès la première publication ;
 * - la publication est refusée tant que la fiche est incomplète.
 */
export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const db = env.DB!;
  const id = identifiant(params);
  const actuel = await lireDesign(db, id);
  if (!actuel) return erreur(404, "Design introuvable.");

  const corps = (await request.json().catch(() => null)) as { design?: Partial<Design>; statut?: Statut } | null;
  if (!corps?.design) return erreur(400, "Contenu manquant.");
  const statut = corps.statut ?? actuel.statut ?? "brouillon";
  if (!STATUTS.includes(statut)) return erreur(400, "Statut inconnu.");

  // Champs que seul le serveur gère : on garde les valeurs actuelles.
  const fusion: Design = {
    ...actuel,
    ...corps.design,
    id: actuel.id,
    famille: actuel.famille,
    image: actuel.image,
    ratio: actuel.ratio,
    filigraneIntegre: actuel.filigraneIntegre,
    hd: actuel.hd,
    exemple: actuel.exemple,
  };
  // Une valeur null envoyée par l'éditeur veut dire « retirer ce champ » (ex. fin d'une édition limitée).
  for (const [cle, valeur] of Object.entries(corps.design)) {
    if (valeur === null) delete (fusion as unknown as Record<string, unknown>)[cle];
  }

  let slug = actuel.slug;
  const souhaite = slugifier(corps.design.slug ?? actuel.slug);
  if (souhaite && souhaite !== actuel.slug) {
    if (actuel.publieLe) return erreur(409, "L'adresse de la fiche est figée depuis sa première publication.");
    slug = await slugLibre(db, souhaite, id);
  }

  if (statut === "publie") {
    const nbHd = (await lireFichiers(db, id)).filter((f) => f.role === "hd").length;
    const manques = manquesPourPublier(fusion, nbHd);
    if (manques.length) return erreur(422, "La fiche n'est pas prête à être publiée.", { manques });
  }

  const maintenant = new Date().toISOString();
  const publieLe = statut === "publie" && !actuel.publieLe ? maintenant : actuel.publieLe ?? null;
  await db
    .prepare("UPDATE designs SET slug = ?2, statut = ?3, donnees = ?4, publie_le = ?5, modifie_le = ?6 WHERE id = ?1")
    .bind(id, slug, statut, JSON.stringify(versDonnees(fusion)), publieLe, maintenant)
    .run();

  return json({ design: await lireDesign(db, id), fichiers: await lireFichiers(db, id) });
};

/** Suppression réservée aux brouillons jamais publiés et aux exemples de la maquette. */
export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const db = env.DB!;
  const id = identifiant(params);
  const design = await lireDesign(db, id);
  if (!design) return erreur(404, "Design introuvable.");
  if (design.publieLe && !design.exemple) {
    return erreur(409, "Un design déjà publié ne se supprime pas : retirez-le de la vente pour garder son identifiant.");
  }
  const fichiers = await lireFichiers(db, id);
  if (fichiers.length && env.MEDIAS) await env.MEDIAS.delete(fichiers.map((f) => f.cle));
  await db.batch([
    db.prepare("DELETE FROM fichiers WHERE design_id = ?1").bind(id),
    db.prepare("DELETE FROM designs WHERE id = ?1").bind(id),
  ]);
  return json({ supprime: id });
};
