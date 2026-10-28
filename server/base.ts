/// <reference types="@cloudflare/workers-types" />
import graines from "../lib/graines.json";
import { FAMILLES, type Design, type Famille, type Statut } from "../lib/modele";
import { TRADUCTIONS_2026_10 } from "./traductions";

/** Texte SQL littéral (apostrophes doublées), pour les migrations écrites dans le code. */
function litteral(texte: string) {
  return `'${texte.replace(/'/g, "''")}'`;
}

// Le schéma se crée tout seul au premier appel : rien à coller dans la console D1.
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS designs (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    statut TEXT NOT NULL DEFAULT 'brouillon',
    donnees TEXT NOT NULL,
    publie_le TEXT,
    cree_le TEXT NOT NULL,
    modifie_le TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS designs_statut ON designs (statut, publie_le)`,
  `CREATE TABLE IF NOT EXISTS fichiers (
    cle TEXT PRIMARY KEY,
    design_id TEXT NOT NULL,
    role TEXT NOT NULL,
    nom TEXT NOT NULL,
    type_mime TEXT NOT NULL,
    taille INTEGER NOT NULL,
    largeur INTEGER,
    hauteur INTEGER,
    cree_le TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS fichiers_design ON fichiers (design_id, role)`,
  `CREATE TABLE IF NOT EXISTS tentatives_connexion (ip TEXT NOT NULL, quand INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS tentatives_ip ON tentatives_connexion (ip, quand)`,
  `CREATE TABLE IF NOT EXISTS meta (cle TEXT PRIMARY KEY, valeur TEXT NOT NULL)`,
  // Une ligne par achat payé. `id` est le jeton secret de la page de commande de l'acheteur.
  `CREATE TABLE IF NOT EXISTS commandes (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE,
    paiement_id TEXT,
    design_id TEXT NOT NULL,
    certificat TEXT NOT NULL UNIQUE,
    statut TEXT NOT NULL DEFAULT 'payee',
    montant INTEGER NOT NULL,
    devise TEXT NOT NULL,
    email TEXT,
    nom TEXT,
    pays TEXT,
    mode_test INTEGER NOT NULL DEFAULT 0,
    donnees TEXT NOT NULL,
    telechargements INTEGER NOT NULL DEFAULT 0,
    payee_le TEXT NOT NULL,
    cree_le TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS commandes_paiement ON commandes (paiement_id)`,
  `CREATE INDEX IF NOT EXISTS commandes_design ON commandes (design_id)`,
];

let pret: Promise<void> | null = null;

export function preparerBase(db: D1Database) {
  if (!pret) {
    pret = (async () => {
      await db.batch(SCHEMA.map((s) => db.prepare(s)));
      const deja = await db.prepare("SELECT valeur FROM meta WHERE cle = 'graines'").first<{ valeur: string }>();
      if (!deja) await semer(db);
      await migrer(db);
      // Les adresses IP et empreintes des limites de fréquence ne sont gardées que 24 heures (annoncé dans la page Confidentialité).
      await db.prepare("DELETE FROM tentatives_connexion WHERE quand < ?1").bind(Date.now() - 24 * 3600 * 1000).run();
    })().catch((e) => {
      pret = null;
      throw e;
    });
  }
  return pret;
}

/**
 * Corrections ponctuelles des données, appliquées une seule fois chacune (la clé est notée dans meta).
 * Elles ne changent pas la date de modification : le site est reconstruit en même temps qu'elles arrivent.
 */
const MIGRATIONS: { cle: string; requete: string | string[] }[] = [
  {
    // Suivi de l'e-mail de confirmation envoyé à l'acheteur (une seule fois par commande).
    cle: "migration:2026-10-15-commandes-courriel-envoye",
    requete: "ALTER TABLE commandes ADD COLUMN courriel_envoye_le TEXT",
  },
  {
    cle: "migration:2026-10-15-commandes-courriel-tente",
    requete: "ALTER TABLE commandes ADD COLUMN courriel_tente_le TEXT",
  },
  {
    // Trois motifs de la maquette publiés sans l'étiquette « Exemple » et sans fichier HD :
    // retirés de la vente à la demande de Léo (15 octobre 2026). Ils restent supprimables dans l'administration.
    cle: "migration:2026-10-15-exemples-orig",
    requete: `UPDATE designs SET statut = 'retire', donnees = json_set(donnees, '$.exemple', json('true'))
      WHERE id IN ('orig-0001', 'orig-0002', 'orig-0003')
      AND NOT EXISTS (SELECT 1 FROM fichiers f WHERE f.design_id = designs.id AND f.role = 'hd')`,
  },
  {
    // Version anglaise des 46 designs publiés au 25 octobre 2026. Seulement là où il n'y en a pas encore.
    cle: "migration:2026-10-25-traductions-en",
    requete: Object.entries(TRADUCTIONS_2026_10).map(
      ([id, en]) =>
        `UPDATE designs SET donnees = json_set(donnees, '$.en', json(${litteral(JSON.stringify(en))}))
        WHERE id = ${litteral(id)} AND json_extract(donnees, '$.en') IS NULL`,
    ),
  },
  {
    // À la demande de Léo (28 octobre 2026) : plus de phrase sur l'IA dans les cartels ni dans la technique.
    // La mention reste dans la licence, les conditions de vente et la case « IA » de chaque fiche.
    cle: "migration:2026-10-28-cartels-sans-ia",
    requete: [
      ["$.cartel", " Créé avec l'assistance de l'IA.", ""],
      ["$.cartel", "Créé avec l'assistance de l'IA.", ""],
      ["$.en.cartel", " Created with the assistance of AI.", ""],
      ["$.en.cartel", "Created with the assistance of AI.", ""],
      ["$.technique", "Dessin numérique créé avec l'assistance de l'IA", "Dessin numérique"],
      ["$.en.technique", "Digital drawing created with the assistance of AI", "Digital drawing"],
      // Sans la mention de l'IA, « peints » laisserait croire à une peinture faite à la main.
      ["$.cartel", "peints à larges touches", "rendus à larges touches"],
      ["$.en.cartel", "painted in broad strokes", "rendered in broad strokes"],
    ].map(
      ([chemin, avant, apres]) =>
        `UPDATE designs SET donnees = json_set(donnees, ${litteral(chemin)}, replace(json_extract(donnees, ${litteral(chemin)}), ${litteral(avant)}, ${litteral(apres)}))
        WHERE instr(json_extract(donnees, ${litteral(chemin)}), ${litteral(avant)}) > 0`,
    ),
  },
  {
    // Vérification du 28 octobre 2026 : le fichier déposé ne correspond pas à la fiche
    // (orig-0017 et orig-0028 portent une autre image ; orig-0023 garde la fausse signature et le numéro 1/30).
    // Repassées en brouillon jusqu'au dépôt du bon fichier ; Léo les republie ensuite depuis l'administration.
    cle: "migration:2026-10-28-images-a-remplacer",
    requete: `UPDATE designs SET statut = 'brouillon', modifie_le = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE statut = 'publie' AND (
        (id = 'orig-0017' AND slug = 'rubans-rouges-et-lunes-bleues') OR
        (id = 'orig-0023' AND slug = 'le-cavalier-et-le-serpent') OR
        (id = 'orig-0028' AND slug = 'le-diable-et-le-chien'))`,
  },
  {
    // À la demande de Léo (28 octobre 2026) : plus de ligne « réalisée avec l'assistance de l'IA » sur les fiches.
    // La mention reste dans la licence et les conditions de vente.
    cle: "migration:2026-10-28-fiches-sans-case-ia",
    requete: `UPDATE designs SET donnees = json_set(donnees, '$.ia', json('false')) WHERE json_extract(donnees, '$.ia') = 1`,
  },
  {
    // À la demande de Léo (28 octobre 2026) : les 41 designs dont le fichier HD fait moins de 4 000 px
    // repassent en brouillon, vidés de leur fichier HD et de leur aperçu, pour qu'il y dépose une version
    // d'au moins 4 000 px puis les republie. Textes, version anglaise, adresse et droits sont conservés.
    // Rien n'est effacé du stockage : les anciennes lignes sont gardées dans fichiers_archives et designs_archives.
    cle: "migration:2026-10-28-fichiers-a-agrandir",
    requete: (() => {
      const ids = [
        ...Array.from({ length: 39 }, (_, i) => `dp-${String(11 + i).padStart(4, "0")}`),
        "orig-0006",
        "orig-0011",
      ]
        .map(litteral)
        .join(", ");
      const cibles = `id IN (${ids}) AND statut = 'publie'`;
      const motif = litteral("fichier HD de moins de 4 000 px, à remplacer (28 octobre 2026)");
      const maintenant = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";
      return [
        `CREATE TABLE IF NOT EXISTS fichiers_archives (
          cle TEXT PRIMARY KEY, design_id TEXT NOT NULL, role TEXT NOT NULL, nom TEXT NOT NULL, type_mime TEXT NOT NULL,
          taille INTEGER NOT NULL, largeur INTEGER, hauteur INTEGER, cree_le TEXT NOT NULL, archive_le TEXT NOT NULL, motif TEXT NOT NULL)`,
        `CREATE TABLE IF NOT EXISTS designs_archives (
          id TEXT NOT NULL, statut TEXT NOT NULL, donnees TEXT NOT NULL, archive_le TEXT NOT NULL, motif TEXT NOT NULL)`,
        `INSERT INTO designs_archives (id, statut, donnees, archive_le, motif)
          SELECT id, statut, donnees, ${maintenant}, ${motif} FROM designs WHERE ${cibles}`,
        `INSERT OR IGNORE INTO fichiers_archives
          SELECT cle, design_id, role, nom, type_mime, taille, largeur, hauteur, cree_le, ${maintenant}, ${motif} FROM fichiers
          WHERE role = 'hd' AND COALESCE(largeur, 0) < 4000 AND COALESCE(hauteur, 0) < 4000
          AND design_id IN (SELECT id FROM designs WHERE ${cibles})`,
        `DELETE FROM fichiers WHERE cle IN (SELECT cle FROM fichiers_archives WHERE motif = ${motif})`,
        `UPDATE designs SET statut = 'brouillon', modifie_le = ${maintenant},
          donnees = json_remove(json_set(donnees, '$.image', '', '$.filigraneIntegre', json('false')), '$.hd')
          WHERE ${cibles}`,
      ];
    })(),
  },
  {
    // Décision de Léo (28 octobre 2026), une fois tous les fichiers à 4 000 px : un seul prix, 29,99 € / 34,99 $,
    // pour tous les motifs retrouvés et toutes les créations (brouillons compris), hors exemples de la maquette.
    cle: "migration:2026-10-28-prix-29-99",
    requete: `UPDATE designs SET donnees = json_set(donnees, '$.prix', json('{"eur":29.99,"usd":34.99}')),
      modifie_le = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE (id LIKE 'dp-%' OR id LIKE 'orig-%') AND COALESCE(json_extract(donnees, '$.exemple'), 0) != 1`,
  },
  {
    // À la demande de Léo (28 octobre 2026) : suppression des 16 fiches « Exemple » de la maquette encore publiées.
    // Les dessins SVG restent dans public/motifs et public/coloriages ; les lignes supprimées sont gardées dans designs_archives.
    cle: "migration:2026-10-28-suppression-exemples",
    requete: (() => {
      const ids = [
        ...Array.from({ length: 10 }, (_, i) => `dp-${String(1 + i).padStart(4, "0")}`),
        "orig-0004",
        "orig-0005",
        "col-0001",
        "col-0002",
        "col-0003",
        "col-0004",
      ]
        .map(litteral)
        .join(", ");
      const cibles = `id IN (${ids}) AND json_extract(donnees, '$.exemple') = 1`;
      const motif = litteral("exemple de la maquette, supprimé à la demande de Léo (28 octobre 2026)");
      const maintenant = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";
      return [
        `CREATE TABLE IF NOT EXISTS fichiers_archives (
          cle TEXT PRIMARY KEY, design_id TEXT NOT NULL, role TEXT NOT NULL, nom TEXT NOT NULL, type_mime TEXT NOT NULL,
          taille INTEGER NOT NULL, largeur INTEGER, hauteur INTEGER, cree_le TEXT NOT NULL, archive_le TEXT NOT NULL, motif TEXT NOT NULL)`,
        `CREATE TABLE IF NOT EXISTS designs_archives (
          id TEXT NOT NULL, statut TEXT NOT NULL, donnees TEXT NOT NULL, archive_le TEXT NOT NULL, motif TEXT NOT NULL)`,
        `INSERT INTO designs_archives (id, statut, donnees, archive_le, motif)
          SELECT id, statut, donnees, ${maintenant}, ${motif} FROM designs WHERE ${cibles}`,
        `INSERT OR IGNORE INTO fichiers_archives
          SELECT cle, design_id, role, nom, type_mime, taille, largeur, hauteur, cree_le, ${maintenant}, ${motif} FROM fichiers
          WHERE design_id IN (SELECT id FROM designs WHERE ${cibles})`,
        `DELETE FROM fichiers WHERE design_id IN (SELECT id FROM designs WHERE ${cibles})`,
        `DELETE FROM designs WHERE ${cibles}`,
      ];
    })(),
  },
];

async function migrer(db: D1Database) {
  for (const m of MIGRATIONS) {
    if (await lireMeta(db, m.cle)) continue;
    const noter = db.prepare("INSERT OR REPLACE INTO meta (cle, valeur) VALUES (?1, ?2)").bind(m.cle, new Date().toISOString());
    try {
      const requetes = Array.isArray(m.requete) ? m.requete : [m.requete];
      await db.batch([...requetes.map((r) => db.prepare(r)), noter]);
    } catch (e) {
      // Deux instances peuvent lancer la même correction au même moment : la seconde trouve la colonne déjà là.
      if (/duplicate column/i.test(String(e))) {
        await noter.run();
        continue;
      }
      if (await lireMeta(db, m.cle)) continue;
      throw e;
    }
  }
}

/** Remplit la base avec le catalogue de départ, une seule fois dans la vie du site. */
async function semer(db: D1Database) {
  const maintenant = new Date().toISOString();
  const lignes = (graines as Design[]).map((d) => {
    const { id, slug, statut, publieLe, ...reste } = d;
    return db
      .prepare(
        "INSERT OR IGNORE INTO designs (id, slug, statut, donnees, publie_le, cree_le, modifie_le) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6)",
      )
      .bind(id, slug, statut ?? "publie", JSON.stringify(reste), publieLe ?? maintenant, maintenant);
  });
  await db.batch([
    ...lignes,
    db.prepare("INSERT OR REPLACE INTO meta (cle, valeur) VALUES ('graines', ?1)").bind(maintenant),
    db.prepare("INSERT OR REPLACE INTO meta (cle, valeur) VALUES ('derniere_mise_a_jour', ?1)").bind(maintenant),
  ]);
}

export interface LigneDesign {
  id: string;
  slug: string;
  statut: Statut;
  donnees: string;
  publie_le: string | null;
  cree_le: string;
  modifie_le: string;
}

export function versDesign(l: LigneDesign): Design & { creeLe: string; modifieLe: string } {
  const donnees = JSON.parse(l.donnees) as Omit<Design, "id" | "slug" | "statut" | "publieLe">;
  return {
    ...donnees,
    id: l.id,
    slug: l.slug,
    statut: l.statut,
    publieLe: l.publie_le ?? undefined,
    creeLe: l.cree_le,
    modifieLe: l.modifie_le,
  };
}

/** Sépare ce qui va dans la colonne JSON de ce qui a sa propre colonne. */
export function versDonnees(d: Partial<Design>) {
  const { id: _i, slug: _s, statut: _st, publieLe: _p, ...reste } = d as Design & { creeLe?: string; modifieLe?: string };
  delete (reste as { creeLe?: string }).creeLe;
  delete (reste as { modifieLe?: string }).modifieLe;
  delete (reste as { fichiersHd?: number }).fichiersHd;
  return reste;
}

export async function prochainIdentifiant(db: D1Database, famille: Famille) {
  const prefixe = FAMILLES[famille].prefixe;
  const { results } = await db.prepare("SELECT id FROM designs WHERE id LIKE ?1").bind(`${prefixe}-%`).all<{ id: string }>();
  const max = results.reduce((m, r) => Math.max(m, Number(r.id.slice(prefixe.length + 1)) || 0), 0);
  return `${prefixe}-${String(max + 1).padStart(4, "0")}`;
}

export async function slugLibre(db: D1Database, souhaite: string, idActuel: string) {
  let candidat = souhaite || idActuel;
  for (let n = 2; n < 100; n++) {
    const pris = await db.prepare("SELECT id FROM designs WHERE slug = ?1 AND id != ?2").bind(candidat, idActuel).first();
    if (!pris) return candidat;
    candidat = `${souhaite}-${n}`;
  }
  return `${souhaite}-${idActuel}`;
}

export async function lireDesign(db: D1Database, id: string) {
  const l = await db.prepare("SELECT * FROM designs WHERE id = ?1").bind(id).first<LigneDesign>();
  return l ? versDesign(l) : null;
}

export async function lireFichiers(db: D1Database, id: string) {
  const { results } = await db
    .prepare("SELECT cle, role, nom, type_mime, taille, largeur, hauteur, cree_le FROM fichiers WHERE design_id = ?1 ORDER BY cree_le")
    .bind(id)
    .all<{ cle: string; role: string; nom: string; type_mime: string; taille: number; largeur: number | null; hauteur: number | null; cree_le: string }>();
  return results;
}

export async function lireMeta(db: D1Database, cle: string) {
  const r = await db.prepare("SELECT valeur FROM meta WHERE cle = ?1").bind(cle).first<{ valeur: string }>();
  return r?.valeur ?? null;
}

export function ecrireMeta(db: D1Database, cle: string, valeur: string) {
  return db.prepare("INSERT OR REPLACE INTO meta (cle, valeur) VALUES (?1, ?2)").bind(cle, valeur).run();
}
