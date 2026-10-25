// Modèle commun au site, à l'administration et à l'API.
// Aucune donnée ici : seulement les types, les listes de référence et les règles.

export type Famille = "retrouves" | "atelier" | "petit-atelier";
export type Statut = "brouillon" | "publie" | "retire";

export type Periode =
  | "antiquite"
  | "moyen-age"
  | "xvie"
  | "xviie"
  | "xviiie"
  | "xixe"
  | "xxe"
  | "aujourdhui";

export type Couleur = "indigo" | "garance" | "safran" | "reseda" | "brun" | "or" | "noir" | "creme";

export type TypeMotif = "floral" | "geometrique" | "animalier" | "figuratif";

export type StatutDroits = "a-verifier" | "domaine-public" | "refuse";

/** Champs d'un design traduits en anglais (affichés sur /en/ ; à défaut, le texte français). */
export const CHAMPS_TRADUITS = ["titre", "resume", "cartel", "origine", "technique", "date", "source"] as const;
export type ChampTraduit = (typeof CHAMPS_TRADUITS)[number];
export type TexteAnglais = Partial<Record<ChampTraduit, string>>;

export interface Palier {
  licences: number;
  eur: number;
  usd: number;
}

/** Preuves de droits d'un motif du domaine public (journal tenu pour chaque design). */
export interface Droits {
  musee: string;
  reference: string;
  url: string;
  statut: StatutDroits;
  conditions: string; // conditions de réutilisation des images du musée
  consulteLe: string; // date de consultation de la notice (AAAA-MM-JJ)
  note?: string; // note interne, jamais publiée
}

export interface FichierHd {
  largeur: number;
  hauteur: number;
  format: string; // ex. PNG, SVG, PDF
  taille: number; // octets
}

export interface Design {
  id: string; // identifiant stable, ne change jamais après publication
  slug: string; // adresse de la fiche, figée après la première publication
  titre: string;
  famille: Famille;
  periode: Periode;
  date: string;
  origine: string;
  technique: string;
  type: TypeMotif;
  couleurs: Couleur[];
  image: string;
  ratio: number; // hauteur / largeur de l'aperçu
  resume: string;
  cartel: string;
  source: string;
  ia?: boolean;
  niveau?: "Tout-petits" | "Petits dessinateurs";
  prix: { eur: number; usd: number };
  edition?: { paliers: Palier[]; vendues: number };
  pochette?: string;
  exemple?: boolean;
  statut?: Statut;
  publieLe?: string;
  filigraneIntegre?: boolean; // l'aperçu porte déjà le filigrane incrusté
  hd?: FichierHd;
  droits?: Droits;
  /** Fichiers livrés à l'acheteur, tels que déposés dans l'administration (calculé par l'API du catalogue). */
  livrables?: Livrable[];
  /** Version anglaise des textes de la fiche. */
  en?: TexteAnglais;
}

export interface Livrable {
  format: string;
  largeur: number | null;
  hauteur: number | null;
  taille: number;
}

export const FAMILLES: Record<Famille, { nom: string; phrase: string; prevus: number; ouvrir: string; prefixe: string }> = {
  retrouves: {
    nom: "Motifs retrouvés",
    phrase: "Des motifs anciens retrouvés dans les collections des musées, restaurés un à un.",
    prevus: 40,
    ouvrir: "Ouvrir les motifs retrouvés",
    prefixe: "dp",
  },
  atelier: {
    nom: "Créations de l'atelier",
    phrase: "Des motifs inédits, nés ici, qu'on ne trouve nulle part ailleurs.",
    prevus: 40,
    ouvrir: "Ouvrir les créations de l'atelier",
    prefixe: "orig",
  },
  "petit-atelier": {
    nom: "Le petit atelier",
    phrase: "Des dessins à colorier pour les tout-petits et pour ceux qui dessinent déjà.",
    prevus: 20,
    ouvrir: "Ouvrir le petit atelier",
    prefixe: "col",
  },
};

/**
 * Tiroirs ouverts sur le site public. Le petit atelier (coloriages) est retiré de la vente depuis le 25 octobre 2026 :
 * ses designs restent en base et dans l'administration, mais n'apparaissent plus sur le site.
 */
export const TIROIRS_OUVERTS: Famille[] = ["retrouves", "atelier"];

/** Libellés anglais des tiroirs. */
export const FAMILLES_EN: Record<Famille, { nom: string; phrase: string; ouvrir: string }> = {
  retrouves: {
    nom: "Rediscovered patterns",
    phrase: "Old patterns rediscovered in museum collections and restored one by one.",
    ouvrir: "Open the rediscovered patterns",
  },
  atelier: {
    nom: "Atelier originals",
    phrase: "New patterns, born here, that you won't find anywhere else.",
    ouvrir: "Open the atelier originals",
  },
  "petit-atelier": {
    nom: "The little atelier",
    phrase: "Colouring pages for little ones and for those who already draw.",
    ouvrir: "Open the little atelier",
  },
};

export const PERIODES: { cle: Periode; nom: string }[] = [
  { cle: "antiquite", nom: "Antiquité" },
  { cle: "moyen-age", nom: "Moyen Âge" },
  { cle: "xvie", nom: "XVIe siècle" },
  { cle: "xviie", nom: "XVIIe siècle" },
  { cle: "xviiie", nom: "XVIIIe siècle" },
  { cle: "xixe", nom: "XIXe siècle" },
  { cle: "xxe", nom: "XXe siècle" },
  { cle: "aujourdhui", nom: "Aujourd'hui" },
];

export const COULEURS: { cle: Couleur; nom: string; hex: string }[] = [
  { cle: "indigo", nom: "Indigo", hex: "#2C4470" },
  { cle: "garance", nom: "Garance", hex: "#9E2B25" },
  { cle: "safran", nom: "Safran", hex: "#D2A03A" },
  { cle: "reseda", nom: "Réséda", hex: "#6E7A45" },
  { cle: "brun", nom: "Brun", hex: "#5A3E2E" },
  { cle: "or", nom: "Or", hex: "#C9A44C" },
  { cle: "noir", nom: "Noir", hex: "#23211F" },
  { cle: "creme", nom: "Crème", hex: "#EFE4CC" },
];

export const PERIODES_EN: Record<Periode, string> = {
  antiquite: "Antiquity",
  "moyen-age": "Middle Ages",
  xvie: "16th century",
  xviie: "17th century",
  xviiie: "18th century",
  xixe: "19th century",
  xxe: "20th century",
  aujourdhui: "Today",
};

export const COULEURS_EN: Record<Couleur, string> = {
  indigo: "Indigo",
  garance: "Madder red",
  safran: "Saffron",
  reseda: "Weld green",
  brun: "Brown",
  or: "Gold",
  noir: "Black",
  creme: "Cream",
};

export const TYPES_EN: Record<TypeMotif, string> = {
  floral: "Floral",
  geometrique: "Geometric",
  animalier: "Animal",
  figuratif: "Figurative",
};

export const TYPES: Record<TypeMotif, string> = {
  floral: "Floral",
  geometrique: "Géométrique",
  animalier: "Animalier",
  figuratif: "Figuratif",
};

export const STATUTS_DROITS: Record<StatutDroits, string> = {
  "a-verifier": "À vérifier",
  "domaine-public": "Domaine public vérifié",
  refuse: "Refusé : droits non libres",
};

export const RECU: Record<Famille, string[]> = {
  retrouves: [
    "PNG haute définition, 300 DPI, restauré (taches et déchirures retirées)",
    "Carreau raccordable, pour imprimer en continu sans couture visible",
    "SVG vectoriel, net à toutes les tailles",
    "Plusieurs déclinaisons de couleurs",
    "Fiche historique en PDF",
    "Certificat de licence à votre nom",
  ],
  atelier: [
    "PNG haute définition, 300 DPI",
    "SVG vectoriel, net à toutes les tailles",
    "Carreau raccordable, pour imprimer en continu sans couture visible",
    "Plusieurs déclinaisons de couleurs",
    "Certificat de licence à votre nom",
  ],
  "petit-atelier": [
    "PDF vectoriel aux formats A4 et US Letter",
    "Les 5 dessins de la pochette, traits nets à toutes les tailles",
    "Deux lignes d'histoire à lire avec l'enfant",
    "Impression illimitée pour la famille ou une classe",
  ],
};

/** Prix minimum : sous 5 €, les frais fixes de paiement pèsent trop. */
export const PRIX_MINIMUM_EUR = 5;
/** Taille minimale conseillée du fichier HD, en pixels sur le plus grand côté. */
export const HD_MINIMUM_PX = 3000;

export function slugifier(texte: string) {
  return texte
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function prixEdition(d: Pick<Design, "edition">) {
  if (!d.edition) return null;
  let reste = d.edition.vendues;
  for (let i = 0; i < d.edition.paliers.length; i++) {
    const p = d.edition.paliers[i];
    if (reste < p.licences) {
      return { palier: p, index: i, restantes: p.licences - reste, suivant: d.edition.paliers[i + 1] };
    }
    reste -= p.licences;
  }
  return null;
}

const vide = (s: unknown) => typeof s !== "string" || s.trim() === "";

/** Seules les adresses web classiques sont acceptées comme liens (jamais javascript: ou data:). */
export function lienSur(url: unknown): url is string {
  return typeof url === "string" && /^https?:\/\/[^\s]+$/i.test(url.trim());
}

/**
 * Ce qui manque avant de pouvoir publier un design.
 * Liste vide : publication possible.
 */
export function manquesPourPublier(d: Partial<Design>, nombreFichiersHd: number): string[] {
  const m: string[] = [];
  if (vide(d.titre)) m.push("Le titre est vide.");
  if (!d.famille || !(d.famille in FAMILLES)) m.push("Choisissez un tiroir.");
  if (!d.periode) m.push("Choisissez une époque.");
  if (vide(d.date)) m.push("La date affichée est vide.");
  if (vide(d.origine)) m.push("L'origine est vide.");
  if (vide(d.technique)) m.push("La technique est vide.");
  if (!d.type) m.push("Choisissez un type de motif.");
  if (vide(d.resume)) m.push("Le résumé est vide.");
  if (vide(d.cartel)) m.push("Le texte du cartel est vide.");
  if (vide(d.source)) m.push("La source est vide.");
  if (vide(d.image)) m.push("Il manque l'aperçu : déposez le fichier haute définition ou une image d'aperçu.");
  if (!d.exemple && nombreFichiersHd < 1) m.push("Il manque le fichier haute définition à livrer.");
  if (d.famille !== "petit-atelier" && (!d.couleurs || d.couleurs.length === 0)) m.push("Cochez au moins une couleur.");
  if (d.famille === "petit-atelier" && vide(d.niveau)) m.push("Indiquez pour qui est le coloriage.");
  const eur = d.edition?.paliers?.[0]?.eur ?? d.prix?.eur ?? 0;
  if (!(eur >= PRIX_MINIMUM_EUR)) m.push(`Le prix doit être d'au moins ${PRIX_MINIMUM_EUR} €.`);
  if (!(d.prix?.usd && d.prix.usd > 0)) m.push("Le prix en dollars est vide.");
  if (d.edition) {
    if (!d.edition.paliers?.length) m.push("L'édition limitée n'a aucun palier.");
    for (const [i, p] of (d.edition.paliers ?? []).entries()) {
      if (!(p.licences > 0) || !(p.eur >= PRIX_MINIMUM_EUR) || !(p.usd > 0)) m.push(`Le palier ${i + 1} de l'édition limitée est incomplet.`);
    }
  }
  if (d.famille === "retrouves" && !d.exemple) {
    const dr = d.droits;
    if (!dr || vide(dr.musee) || vide(dr.reference) || vide(dr.url) || vide(dr.conditions) || vide(dr.consulteLe)) {
      m.push("Preuves de droits incomplètes : musée, référence, lien de la notice, conditions de réutilisation et date de consultation.");
    } else if (!lienSur(dr.url)) {
      m.push("Le lien vers la notice doit commencer par https:// (ou http://).");
    } else if (dr.statut !== "domaine-public") {
      m.push("Le statut des droits doit être « Domaine public vérifié » pour publier.");
    }
  }
  return m;
}

/** Ce qui est rendu public d'un design : jamais la note interne des droits. */
export function versionPublique(d: Design): Design {
  if (!d.droits) return d;
  const { note: _note, ...droits } = d.droits;
  return { ...d, droits };
}

// ——— Libellés et textes selon la langue ———

type L = "fr" | "en";

export function nomFamille(f: Famille, l: L) {
  return l === "en" ? FAMILLES_EN[f].nom : FAMILLES[f].nom;
}

export function nomPeriode(p: Periode, l: L) {
  return l === "en" ? PERIODES_EN[p] : (PERIODES.find((x) => x.cle === p)?.nom ?? p);
}

export function nomCouleur(c: Couleur, l: L) {
  return l === "en" ? COULEURS_EN[c] : (COULEURS.find((x) => x.cle === c)?.nom ?? c);
}

export function nomType(t: TypeMotif, l: L) {
  return l === "en" ? TYPES_EN[t] : TYPES[t];
}

/** Les textes d'une fiche dans la langue demandée (le français quand la traduction manque). */
export function texteDesign(d: Pick<Design, ChampTraduit | "en">, l: L): Record<ChampTraduit, string> {
  const fr = { titre: d.titre, resume: d.resume, cartel: d.cartel, origine: d.origine, technique: d.technique, date: d.date, source: d.source };
  if (l !== "en" || !d.en) return fr;
  const r = { ...fr };
  for (const c of CHAMPS_TRADUITS) {
    const v = d.en[c];
    if (typeof v === "string" && v.trim()) r[c] = v;
  }
  return r;
}

/** La traduction anglaise est-elle complète pour les champs affichés ? */
export function traductionComplete(d: Pick<Design, ChampTraduit | "en">) {
  return CHAMPS_TRADUITS.every((c) => !d[c]?.trim() || Boolean(d.en?.[c]?.trim()));
}
