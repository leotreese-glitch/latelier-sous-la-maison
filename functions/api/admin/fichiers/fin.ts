import { lireDesign, lireFichiers, versDonnees } from "../../../../server/base";
import { erreur, json, type Env } from "../../../../server/env";
import { cleValide, IDENTIFIANT, type Role } from "../../../../server/fichiers";

interface Corps {
  design?: string;
  role?: Role;
  cle?: string;
  uploadId?: string;
  parties?: { numero: number; etag: string }[];
  nom?: string;
  type?: string;
  taille?: number;
  largeur?: number;
  hauteur?: number;
}

/** Assemble les morceaux, enregistre le fichier et met la fiche à jour (aperçu ou fichier HD). */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.MEDIAS) return erreur(503, "Le stockage des fichiers n'est pas branché.", { code: "non-configure" });
  const db = env.DB!;
  const c = (await request.json().catch(() => ({}))) as Corps;
  const design = c.design ?? "";
  if (!IDENTIFIANT.test(design)) return erreur(400, "Design inconnu.");
  if (c.role !== "hd" && c.role !== "apercu") return erreur(400, "Rôle de fichier inconnu.");
  if (!c.cle || !cleValide(c.cle, c.role, design) || !c.uploadId || !c.parties?.length) return erreur(400, "Envoi incomplet.");

  const actuel = await lireDesign(db, design);
  if (!actuel) return erreur(404, "Design introuvable.");

  const envoi = env.MEDIAS.resumeMultipartUpload(c.cle, c.uploadId);
  let objet: R2Object;
  try {
    objet = await envoi.complete(c.parties.map((p) => ({ partNumber: p.numero, etag: p.etag })));
  } catch (e) {
    await envoi.abort().catch(() => {});
    return erreur(500, "L'assemblage du fichier a échoué. Réessayez l'envoi.", { detail: String(e) });
  }

  const largeur = Number.isFinite(c.largeur) ? Math.round(c.largeur!) : null;
  const hauteur = Number.isFinite(c.hauteur) ? Math.round(c.hauteur!) : null;
  const maintenant = new Date().toISOString();
  const nom = (c.nom ?? c.cle.split("/").pop() ?? "fichier").slice(0, 200);
  const type = c.type ?? "application/octet-stream";

  const requetes = [
    db
      .prepare(
        "INSERT OR REPLACE INTO fichiers (cle, design_id, role, nom, type_mime, taille, largeur, hauteur, cree_le) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
      )
      .bind(c.cle, design, c.role, nom, type, objet.size, largeur, hauteur, maintenant),
  ];

  const mise = { ...actuel };
  const anciensApercus: string[] = [];
  if (c.role === "apercu") {
    mise.image = `/media/${c.cle}`;
    if (largeur && hauteur) mise.ratio = hauteur / largeur;
    mise.filigraneIntegre = true;
    const anciens = (await lireFichiers(db, design)).filter((f) => f.role === "apercu" && f.cle !== c.cle);
    for (const f of anciens) {
      anciensApercus.push(f.cle);
      requetes.push(db.prepare("DELETE FROM fichiers WHERE cle = ?1").bind(f.cle));
    }
  } else if (largeur && hauteur) {
    const format = nom.split(".").pop()?.toUpperCase() ?? "";
    if (!mise.hd || largeur * hauteur >= mise.hd.largeur * mise.hd.hauteur) {
      mise.hd = { largeur, hauteur, format, taille: objet.size };
    }
  }
  requetes.push(
    db.prepare("UPDATE designs SET donnees = ?2, modifie_le = ?3 WHERE id = ?1").bind(design, JSON.stringify(versDonnees(mise)), maintenant),
  );
  await db.batch(requetes);
  if (anciensApercus.length) await env.MEDIAS.delete(anciensApercus);

  return json({ design: await lireDesign(db, design), fichiers: await lireFichiers(db, design) });
};
