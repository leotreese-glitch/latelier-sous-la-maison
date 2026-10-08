// Règles communes aux envois de fichiers.

export type Role = "hd" | "apercu";

export const TYPES_HD = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/tiff",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
];
export const TYPES_APERCU = ["image/webp", "image/jpeg", "image/png"];

/** Nom de fichier sûr : lettres, chiffres, tirets, un point avant l'extension. */
export function nomSur(nom: string) {
  const propre = nom
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+/, "")
    .slice(-100);
  return propre || "fichier";
}

export function cleFichier(role: Role, design: string, nom: string, type: string) {
  if (role === "apercu") {
    const ext = type === "image/jpeg" ? "jpg" : type === "image/png" ? "png" : "webp";
    return `apercus/${design}/${Date.now()}.${ext}`;
  }
  return `hd/${design}/${nomSur(nom)}`;
}

/** Une clé n'est acceptée que si elle appartient bien au design et au rôle annoncés. */
export function cleValide(cle: string, role: Role, design: string) {
  const prefixe = role === "apercu" ? `apercus/${design}/` : `hd/${design}/`;
  return cle.startsWith(prefixe) && !cle.includes("..") && cle.length < 300;
}

export const IDENTIFIANT = /^(dp|orig|col)-\d{4}$/;
