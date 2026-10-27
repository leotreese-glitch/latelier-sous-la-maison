import registreRetrouves from "../../../lib/registre-retrouves.json";
import registreAtelier from "../../../lib/registre-atelier.json";
import { prochainIdentifiant } from "../../../server/base";
import { json, type Env } from "../../../server/env";
import { FAMILLES, slugifier, type Design, type Famille } from "../../../lib/modele";

/**
 * Designs préparés par Claude, prêts à devenir des brouillons déjà remplis :
 * - les pièces de musée du registre des motifs retrouvés (lot 1 vérifié le 2026-10-09, lot 2 le 2026-10-25),
 *   avec leur version anglaise quand elle est fournie (champ `en`) ;
 * - les créations de l'atelier envoyées par Léo (titres, résumés et cartels à relire).
 * Une entrée déjà présente dans la base n'est jamais recréée.
 */
type Entree = Partial<Design> & { cle: string };

const COMMUN_ATELIER: Partial<Design> = {
  periode: "aujourdhui",
  date: "2026",
  origine: "L'atelier sous la maison",
  technique: "Dessin numérique",
  ia: false,
  prix: { eur: 15, usd: 17 },
  source: "Création originale, ce n'est pas la reproduction d'un document d'archive.",
};

const REGISTRES: { famille: Famille; entrees: Entree[]; deja: (d: Partial<Design>) => string | undefined; cle: (e: Entree) => string }[] = [
  {
    famille: "retrouves",
    entrees: registreRetrouves as Entree[],
    deja: (d) => d.droits?.reference?.trim(),
    cle: (e) => e.cle,
  },
  {
    famille: "atelier",
    entrees: (registreAtelier as Entree[]).map((e) => ({ ...COMMUN_ATELIER, ...e })),
    deja: (d) => d.titre?.trim().toLowerCase(),
    cle: (e) => (e.titre ?? "").trim().toLowerCase(),
  },
];

/** Pour chaque tiroir, les entrées du registre qui ne sont pas encore dans la base. */
async function restants(db: D1Database) {
  const resultat: { famille: Famille; entrees: Entree[] }[] = [];
  for (const r of REGISTRES) {
    const { results } = await db
      .prepare("SELECT donnees FROM designs WHERE id LIKE ?1")
      .bind(`${FAMILLES[r.famille].prefixe}-%`)
      .all<{ donnees: string }>();
    const presentes = new Set<string>();
    for (const l of results) {
      try {
        const v = r.deja(JSON.parse(l.donnees) as Partial<Design>);
        if (v) presentes.add(v);
      } catch {
        // ligne illisible : ignorée
      }
    }
    resultat.push({ famille: r.famille, entrees: r.entrees.filter((e) => !presentes.has(r.cle(e))) });
  }
  return resultat;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const r = await restants(env.DB!);
  const parTiroir = Object.fromEntries(r.map((x) => [x.famille, x.entrees.length]));
  return json({ restants: r.reduce((n, x) => n + x.entrees.length, 0), parTiroir });
};

/** Crée en brouillon tout ce qui attend dans les registres. */
export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
  const db = env.DB!;
  const a_creer = await restants(db);
  const { results } = await db.prepare("SELECT slug FROM designs").all<{ slug: string }>();
  const pris = new Set(results.map((r) => r.slug));
  const maintenant = new Date().toISOString();

  const crees: string[] = [];
  const requetes: D1PreparedStatement[] = [];
  for (const { famille, entrees } of a_creer) {
    if (!entrees.length) continue;
    const prefixe = FAMILLES[famille].prefixe;
    let numero = Number((await prochainIdentifiant(db, famille)).slice(prefixe.length + 1));
    for (const e of entrees) {
      const id = `${prefixe}-${String(numero++).padStart(4, "0")}`;
      const base = slugifier(e.titre ?? "") || id;
      let slug = base;
      for (let n = 2; pris.has(slug); n++) slug = `${base}-${n}`;
      pris.add(slug);
      crees.push(id);
      const { cle: _cle, ...donnees } = e;
      requetes.push(
        db
          .prepare("INSERT INTO designs (id, slug, statut, donnees, publie_le, cree_le, modifie_le) VALUES (?1, ?2, 'brouillon', ?3, NULL, ?4, ?4)")
          .bind(id, slug, JSON.stringify({ couleurs: [], image: "", ...donnees, famille }), maintenant),
      );
    }
  }
  if (requetes.length) await db.batch(requetes);
  return json({ crees }, requetes.length ? 201 : 200);
};
