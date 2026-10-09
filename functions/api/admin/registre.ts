import registre from "../../../lib/registre-retrouves.json";
import { prochainIdentifiant } from "../../../server/base";
import { json, type Env } from "../../../server/env";
import { slugifier, type Design } from "../../../lib/modele";

/**
 * Pièces de musée retenues dans le registre des motifs retrouvés (vérifiées le 2026-10-09).
 * Chaque entrée devient un brouillon déjà rempli ; `cle` est le numéro d'inventaire du musée.
 */
type Entree = Partial<Design> & { cle: string };
const ENTREES = registre as Entree[];

/** Numéros d'inventaire déjà présents dans la base, pour ne jamais créer de doublon. */
async function referencesPresentes(db: D1Database) {
  const { results } = await db.prepare("SELECT donnees FROM designs WHERE id LIKE 'dp-%'").all<{ donnees: string }>();
  const refs = new Set<string>();
  for (const r of results) {
    try {
      const ref = (JSON.parse(r.donnees) as Partial<Design>).droits?.reference?.trim();
      if (ref) refs.add(ref);
    } catch {
      // ligne illisible : ignorée
    }
  }
  return refs;
}

async function restants(db: D1Database) {
  const refs = await referencesPresentes(db);
  return ENTREES.filter((e) => !refs.has(e.cle));
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const r = await restants(env.DB!);
  return json({ total: ENTREES.length, restants: r.length });
};

/** Crée en brouillon toutes les pièces du registre qui ne sont pas encore dans la base. */
export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
  const db = env.DB!;
  const a_creer = await restants(db);
  if (!a_creer.length) return json({ crees: [] });

  const premier = await prochainIdentifiant(db, "retrouves");
  let numero = Number(premier.slice(3));
  const { results } = await db.prepare("SELECT slug FROM designs").all<{ slug: string }>();
  const pris = new Set(results.map((r) => r.slug));
  const maintenant = new Date().toISOString();

  const crees: string[] = [];
  const requetes = a_creer.map((e) => {
    const id = `dp-${String(numero++).padStart(4, "0")}`;
    const base = slugifier(e.titre ?? "") || id;
    let slug = base;
    for (let n = 2; pris.has(slug); n++) slug = `${base}-${n}`;
    pris.add(slug);
    crees.push(id);
    const { cle: _cle, ...donnees } = e;
    return db
      .prepare("INSERT INTO designs (id, slug, statut, donnees, publie_le, cree_le, modifie_le) VALUES (?1, ?2, 'brouillon', ?3, NULL, ?4, ?4)")
      .bind(id, slug, JSON.stringify({ couleurs: [], image: "", ...donnees, famille: "retrouves" }), maintenant);
  });
  await db.batch(requetes);
  return json({ crees }, 201);
};
