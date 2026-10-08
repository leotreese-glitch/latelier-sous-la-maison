import { prochainIdentifiant, versDesign, type LigneDesign } from "../../../../server/base";
import { erreur, json, type Env } from "../../../../server/env";
import { FAMILLES, type Design, type Famille } from "../../../../lib/modele";

/** Tous les designs, publiés ou non, avec le nombre de fichiers HD de chacun. */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const db = env.DB!;
  const { results } = await db.prepare("SELECT * FROM designs ORDER BY modifie_le DESC").all<LigneDesign>();
  const { results: comptes } = await db
    .prepare("SELECT design_id, COUNT(*) AS n FROM fichiers WHERE role = 'hd' GROUP BY design_id")
    .all<{ design_id: string; n: number }>();
  const hd = new Map(comptes.map((c) => [c.design_id, c.n]));
  return json({ designs: results.map((l) => ({ ...versDesign(l), fichiersHd: hd.get(l.id) ?? 0 })) });
};

const DEFAUTS: Record<Famille, Partial<Design>> = {
  retrouves: {
    periode: "xviiie",
    origine: "",
    technique: "",
    type: "floral",
    prix: { eur: 12, usd: 14 },
    source: "",
    droits: { musee: "", reference: "", url: "", statut: "a-verifier", conditions: "", consulteLe: "" },
  },
  atelier: {
    periode: "aujourdhui",
    date: String(new Date().getFullYear()),
    origine: "L'atelier sous la maison",
    technique: "Dessin numérique créé avec l'assistance de l'IA",
    type: "floral",
    ia: true,
    prix: { eur: 15, usd: 17 },
    source: "Création originale, ce n'est pas la reproduction d'un document d'archive.",
  },
  "petit-atelier": {
    periode: "aujourdhui",
    date: String(new Date().getFullYear()),
    origine: "L'atelier sous la maison",
    technique: "Dessin au trait à colorier",
    type: "animalier",
    niveau: "Tout-petits",
    pochette: "",
    prix: { eur: 7.9, usd: 8.9 },
    source: "Création originale de l'atelier.",
  },
};

/** Crée un brouillon vide dans le tiroir choisi, avec son identifiant définitif. */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const db = env.DB!;
  const corps = (await request.json().catch(() => ({}))) as { famille?: string };
  const famille = corps.famille as Famille;
  if (!famille || !(famille in FAMILLES)) return erreur(400, "Tiroir inconnu.");

  const id = await prochainIdentifiant(db, famille);
  const maintenant = new Date().toISOString();
  const donnees: Partial<Design> = {
    titre: "",
    famille,
    date: "",
    couleurs: [],
    image: "",
    ratio: 1.33,
    resume: "",
    cartel: "",
    ...DEFAUTS[famille],
  };
  await db
    .prepare("INSERT INTO designs (id, slug, statut, donnees, publie_le, cree_le, modifie_le) VALUES (?1, ?1, 'brouillon', ?2, NULL, ?3, ?3)")
    .bind(id, JSON.stringify(donnees), maintenant)
    .run();
  return json({ id }, 201);
};
