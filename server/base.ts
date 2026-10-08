/// <reference types="@cloudflare/workers-types" />
import graines from "../lib/graines.json";
import { FAMILLES, type Design, type Famille, type Statut } from "../lib/modele";

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
];

let pret: Promise<void> | null = null;

export function preparerBase(db: D1Database) {
  if (!pret) {
    pret = (async () => {
      await db.batch(SCHEMA.map((s) => db.prepare(s)));
      const deja = await db.prepare("SELECT valeur FROM meta WHERE cle = 'graines'").first<{ valeur: string }>();
      if (!deja) await semer(db);
    })().catch((e) => {
      pret = null;
      throw e;
    });
  }
  return pret;
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
