// Catalogue de la maquette.
// Les trois créations orig-0001 à orig-0003 sont les vrais designs de l'atelier.
// Tout ce qui porte `exemple: true` est un visuel dessiné pour la maquette,
// à remplacer par les vrais designs avant le lancement.

export type Famille = "retrouves" | "atelier" | "petit-atelier";

export type Periode =
  | "antiquite"
  | "moyen-age"
  | "xvie"
  | "xviie"
  | "xviiie"
  | "xixe"
  | "xxe"
  | "aujourdhui";

export type Couleur =
  | "indigo"
  | "garance"
  | "safran"
  | "reseda"
  | "brun"
  | "or"
  | "noir"
  | "creme";

export type TypeMotif = "floral" | "geometrique" | "animalier" | "figuratif";

export interface Palier {
  licences: number;
  eur: number;
  usd: number;
}

export interface Design {
  id: string; // identifiant stable, ne change jamais après publication
  slug: string;
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
}

export const FAMILLES: Record<Famille, { nom: string; phrase: string; prevus: number; ouvrir: string }> = {
  retrouves: {
    nom: "Motifs retrouvés",
    phrase: "Des motifs anciens retrouvés dans les collections des musées, restaurés un à un.",
    prevus: 40,
    ouvrir: "Ouvrir les motifs retrouvés",
  },
  atelier: {
    nom: "Créations de l'atelier",
    phrase: "Des motifs inédits, nés ici, qu'on ne trouve nulle part ailleurs.",
    prevus: 40,
    ouvrir: "Ouvrir les créations de l'atelier",
  },
  "petit-atelier": {
    nom: "Le petit atelier",
    phrase: "Des dessins à colorier pour les tout-petits et pour ceux qui dessinent déjà.",
    prevus: 20,
    ouvrir: "Ouvrir le petit atelier",
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

export const TYPES: Record<TypeMotif, string> = {
  floral: "Floral",
  geometrique: "Géométrique",
  animalier: "Animalier",
  figuratif: "Figuratif",
};

const PRIX_RETROUVE = { eur: 12, usd: 14 };
const PRIX_ATELIER = { eur: 15, usd: 17 };
const PRIX_POCHETTE = { eur: 7.9, usd: 8.9 };

const EXEMPLE_RETROUVE =
  "Visuel d'exemple dessiné pour la maquette. Il sera remplacé par un motif restauré à partir d'une pièce de musée.";
const SOURCE_EXEMPLE = "Exemple de maquette, sans source réelle.";
const IA = "Dessin numérique créé avec l'assistance de l'IA";

export const DESIGNS: Design[] = [
  {
    id: "orig-0001",
    slug: "oiseaux-sur-branches-fleuries",
    titre: "Oiseaux sur branches fleuries",
    famille: "atelier",
    periode: "aujourdhui",
    date: "2026",
    origine: "L'atelier sous la maison",
    technique: IA,
    type: "animalier",
    couleurs: ["creme", "indigo", "garance", "reseda", "brun"],
    image: "/designs/orig-0001.webp",
    ratio: 426 / 316,
    resume:
      "Branches brunes sinueuses, grandes fleurs indigo et terracotta, oiseaux bleus à poitrine orangée sur fond crème.",
    cartel:
      "Création originale de l'atelier, inspirée des indiennes et des chintz. Les oiseaux se posent à intervalles irréguliers pour que l'œil ne repère pas la répétition.",
    source: "Création originale, ce n'est pas la reproduction d'un document d'archive.",
    ia: true,
    prix: PRIX_ATELIER,
  },
  {
    id: "orig-0002",
    slug: "losanges-a-rosaces",
    titre: "Losanges à rosaces",
    famille: "atelier",
    periode: "aujourdhui",
    date: "2026",
    origine: "L'atelier sous la maison",
    technique: IA,
    type: "geometrique",
    couleurs: ["creme", "indigo", "garance", "brun", "reseda"],
    image: "/designs/orig-0002.webp",
    ratio: 425 / 321,
    resume:
      "Treillis de losanges : rosaces rouges cerclées d'indigo, fleurs brunes à quatre pétales, bordures pointillées.",
    cartel:
      "Création originale de l'atelier, inspirée des impressions à la planche. Le treillis alterne deux losanges pour garder un rythme régulier sur de grandes surfaces.",
    source: "Création originale, ce n'est pas la reproduction d'un document d'archive.",
    ia: true,
    prix: { eur: 12, usd: 14 },
    edition: {
      paliers: [
        { licences: 10, eur: 12, usd: 14 },
        { licences: 10, eur: 18, usd: 21 },
        { licences: 10, eur: 25, usd: 29 },
      ],
      vendues: 3,
    },
  },
  {
    id: "orig-0003",
    slug: "rinceaux-floraux",
    titre: "Rinceaux floraux",
    famille: "atelier",
    periode: "aujourdhui",
    date: "2026",
    origine: "L'atelier sous la maison",
    technique: IA,
    type: "floral",
    couleurs: ["creme", "garance", "reseda"],
    image: "/designs/orig-0003.webp",
    ratio: 426 / 317,
    resume: "Grandes fleurs rouges, tulipes et rosaces reliées par des rinceaux vert sauge sur fond crème.",
    cartel:
      "Création originale de l'atelier, inspirée des indiennes. Palette volontairement réduite à trois couleurs, pour une impression économique.",
    source: "Création originale, ce n'est pas la reproduction d'un document d'archive.",
    ia: true,
    prix: PRIX_ATELIER,
  },
  {
    id: "dp-0001",
    slug: "meandre-a-la-grecque",
    titre: "Méandre à la grecque",
    famille: "retrouves",
    periode: "antiquite",
    date: "Antiquité",
    origine: "Grèce",
    technique: "Frise",
    type: "geometrique",
    couleurs: ["garance", "brun", "creme"],
    image: "/motifs/dp-0001.svg",
    ratio: 800 / 600,
    resume: "Frises de méandres garance séparées par des rangs de points bruns.",
    cartel: "La frise de méandres borde les vases et les architectures de la Grèce antique. " + EXEMPLE_RETROUVE,
    source: SOURCE_EXEMPLE,
    prix: PRIX_RETROUVE,
    exemple: true,
  },
  {
    id: "dp-0004",
    slug: "semis-de-fleurettes",
    titre: "Semis de fleurettes",
    famille: "retrouves",
    periode: "xviiie",
    date: "XVIIIe siècle",
    origine: "France",
    technique: "Indienne, impression à la planche",
    type: "floral",
    couleurs: ["creme", "garance", "indigo", "reseda", "safran"],
    image: "/motifs/dp-0004.svg",
    ratio: 900 / 600,
    resume: "Brins fleuris garance et indigo semés sur fond crème, ponctués de petits points.",
    cartel:
      "Le semis, des petits brins répartis sur tout le tissu, est l'un des dessins les plus imprimés par les manufactures d'indiennes. " +
      EXEMPLE_RETROUVE,
    source: SOURCE_EXEMPLE,
    prix: PRIX_RETROUVE,
    exemple: true,
  },
  {
    id: "dp-0002",
    slug: "ecailles-dorees",
    titre: "Écailles dorées",
    famille: "retrouves",
    periode: "xvie",
    date: "XVIe siècle",
    origine: "Italie",
    technique: "Tissu façonné",
    type: "geometrique",
    couleurs: ["indigo", "or"],
    image: "/motifs/dp-0002.svg",
    ratio: 1,
    resume: "Écailles imbriquées cernées d'or sur fond indigo.",
    cartel: "L'imbrication, des écailles qui se chevauchent, orne les étoffes et les céramiques de la Renaissance. " + EXEMPLE_RETROUVE,
    source: SOURCE_EXEMPLE,
    prix: PRIX_RETROUVE,
    exemple: true,
  },
  {
    id: "col-0001",
    slug: "la-grande-rosace",
    titre: "La grande rosace",
    famille: "petit-atelier",
    periode: "aujourdhui",
    date: "2026",
    origine: "L'atelier sous la maison",
    technique: "Dessin au trait à colorier",
    type: "geometrique",
    couleurs: [],
    image: "/coloriages/col-0001.svg",
    ratio: 848 / 600,
    resume: "Une rosace à gros traits et grandes zones, facile à colorier.",
    cartel:
      "Les rosaces décorent les vitraux des cathédrales. Celle-ci a de grandes zones, faciles à remplir pour les petites mains. Visuel d'exemple dessiné pour la maquette.",
    source: "Exemple de maquette.",
    niveau: "Tout-petits",
    prix: PRIX_POCHETTE,
    pochette: "Premiers coloriages",
    exemple: true,
  },
  {
    id: "dp-0003",
    slug: "quadrilobes-gothiques",
    titre: "Quadrilobes gothiques",
    famille: "retrouves",
    periode: "moyen-age",
    date: "Moyen Âge",
    origine: "France",
    technique: "Décor peint",
    type: "geometrique",
    couleurs: ["garance", "indigo", "or"],
    image: "/motifs/dp-0003.svg",
    ratio: 750 / 600,
    resume: "Quadrilobes indigo cernés d'or sur fond garance.",
    cartel: "Le quadrilobe, une fleur à quatre lobes, revient partout dans l'art gothique. " + EXEMPLE_RETROUVE,
    source: SOURCE_EXEMPLE,
    prix: PRIX_RETROUVE,
    exemple: true,
  },
  {
    id: "dp-0005",
    slug: "rayure-fleurie",
    titre: "Rayure fleurie",
    famille: "retrouves",
    periode: "xviiie",
    date: "XVIIIe siècle",
    origine: "France",
    technique: "Indienne, impression à la planche",
    type: "floral",
    couleurs: ["indigo", "garance", "creme", "safran"],
    image: "/motifs/dp-0005.svg",
    ratio: 800 / 600,
    resume: "Rayures indigo et garance alternées avec des colonnes de fleurettes.",
    cartel: "Les rayures fleuries habillaient les robes et les tentures au siècle des Lumières. " + EXEMPLE_RETROUVE,
    source: SOURCE_EXEMPLE,
    prix: PRIX_RETROUVE,
    exemple: true,
  },
  {
    id: "orig-0004",
    slug: "nuit-au-jardin",
    titre: "Nuit au jardin",
    famille: "atelier",
    periode: "aujourdhui",
    date: "2026",
    origine: "L'atelier sous la maison",
    technique: IA,
    type: "figuratif",
    couleurs: ["indigo", "or", "creme"],
    image: "/motifs/orig-0004.svg",
    ratio: 750 / 600,
    resume: "Croissants de lune dorés et fleurettes crème sur un ciel de nuit.",
    cartel: "Visuel d'exemple dessiné pour la maquette, à remplacer par une création de l'atelier.",
    source: "Exemple de maquette.",
    ia: true,
    prix: PRIX_ATELIER,
    exemple: true,
  },
  {
    id: "dp-0006",
    slug: "etoiles-a-huit-branches",
    titre: "Étoiles à huit branches",
    famille: "retrouves",
    periode: "moyen-age",
    date: "Moyen Âge",
    origine: "Andalousie",
    technique: "Zellige",
    type: "geometrique",
    couleurs: ["reseda", "garance", "indigo", "creme"],
    image: "/motifs/dp-0006.svg",
    ratio: 1,
    resume: "Étoiles garance et indigo à cœur crème sur fond réséda.",
    cartel: "L'étoile à huit branches structure les décors de zellige, faits de petits carreaux taillés. " + EXEMPLE_RETROUVE,
    source: SOURCE_EXEMPLE,
    prix: PRIX_RETROUVE,
    exemple: true,
  },
  {
    id: "col-0003",
    slug: "la-maison-et-son-atelier",
    titre: "La maison et son atelier",
    famille: "petit-atelier",
    periode: "aujourdhui",
    date: "2026",
    origine: "L'atelier sous la maison",
    technique: "Dessin au trait à colorier",
    type: "figuratif",
    couleurs: [],
    image: "/coloriages/col-0003.svg",
    ratio: 848 / 600,
    resume: "Une maison et, sous la terre, l'atelier secret avec sa table et sa lampe.",
    cartel:
      "Sous cette maison se cache un atelier. Qu'est-ce qu'on y fabrique ? L'enfant peut dessiner la suite. Visuel d'exemple dessiné pour la maquette.",
    source: "Exemple de maquette.",
    niveau: "Tout-petits",
    prix: PRIX_POCHETTE,
    pochette: "Premiers coloriages",
    exemple: true,
  },
  {
    id: "dp-0007",
    slug: "eventails",
    titre: "Éventails",
    famille: "retrouves",
    periode: "xxe",
    date: "XXe siècle",
    origine: "France",
    technique: "Papier peint",
    type: "geometrique",
    couleurs: ["noir", "or"],
    image: "/motifs/dp-0007.svg",
    ratio: 750 / 600,
    resume: "Éventails concentriques dorés sur fond noir.",
    cartel: "Les éventails superposés sont un motif favori des années Art déco. " + EXEMPLE_RETROUVE,
    source: SOURCE_EXEMPLE,
    prix: PRIX_RETROUVE,
    exemple: true,
  },
  {
    id: "dp-0008",
    slug: "treillage-de-feuilles",
    titre: "Treillage de feuilles",
    famille: "retrouves",
    periode: "xixe",
    date: "XIXe siècle",
    origine: "Angleterre",
    technique: "Papier peint imprimé à la planche",
    type: "floral",
    couleurs: ["reseda", "brun", "garance", "creme"],
    image: "/motifs/dp-0008.svg",
    ratio: 800 / 600,
    resume: "Treillage brun, feuilles réséda et baies garance sur fond écru.",
    cartel: "Les treillages feuillus sont typiques des papiers peints du mouvement Arts and Crafts. " + EXEMPLE_RETROUVE,
    source: SOURCE_EXEMPLE,
    prix: PRIX_RETROUVE,
    exemple: true,
  },
  {
    id: "col-0002",
    slug: "l-oiseau-des-indiennes",
    titre: "L'oiseau des indiennes",
    famille: "petit-atelier",
    periode: "aujourdhui",
    date: "2026",
    origine: "L'atelier sous la maison",
    technique: "Dessin au trait à colorier",
    type: "animalier",
    couleurs: [],
    image: "/coloriages/col-0002.svg",
    ratio: 848 / 600,
    resume: "Un oiseau sur une branche fleurie, avec des plumes et des pétales à détailler.",
    cartel:
      "Ce genre d'oiseau se posait déjà sur les tissus imprimés il y a 250 ans. Traits fins pour les enfants qui aiment les détails. Visuel d'exemple dessiné pour la maquette.",
    source: "Exemple de maquette.",
    niveau: "Petits dessinateurs",
    prix: PRIX_POCHETTE,
    pochette: "Oiseaux et jardins",
    exemple: true,
  },
  {
    id: "dp-0009",
    slug: "ikat-losange",
    titre: "Ikat losangé",
    famille: "retrouves",
    periode: "xixe",
    date: "XIXe siècle",
    origine: "Asie centrale",
    technique: "Ikat, teinture à réserve",
    type: "geometrique",
    couleurs: ["garance", "safran", "indigo", "creme"],
    image: "/motifs/dp-0009.svg",
    ratio: 900 / 600,
    resume: "Losanges aux bords dentelés garance, safran et indigo.",
    cartel:
      "Dans l'ikat, les fils sont teints avant le tissage : d'où ces contours qui semblent trembler. " + EXEMPLE_RETROUVE,
    source: SOURCE_EXEMPLE,
    prix: PRIX_RETROUVE,
    exemple: true,
  },
  {
    id: "orig-0005",
    slug: "racines-dorees",
    titre: "Racines dorées",
    famille: "atelier",
    periode: "aujourdhui",
    date: "2026",
    origine: "L'atelier sous la maison",
    technique: IA,
    type: "floral",
    couleurs: ["indigo", "or", "garance"],
    image: "/motifs/orig-0005.svg",
    ratio: 900 / 600,
    resume: "Tiges dorées ondulantes et bourgeons garance sur fond indigo.",
    cartel: "Visuel d'exemple dessiné pour la maquette, à remplacer par une création de l'atelier.",
    source: "Exemple de maquette.",
    ia: true,
    prix: PRIX_ATELIER,
    exemple: true,
  },
  {
    id: "dp-0010",
    slug: "feuilles-de-chanvre",
    titre: "Feuilles de chanvre",
    famille: "retrouves",
    periode: "xviiie",
    date: "XVIIIe siècle",
    origine: "Japon",
    technique: "Pochoir sur coton",
    type: "geometrique",
    couleurs: ["indigo", "creme"],
    image: "/motifs/dp-0010.svg",
    ratio: 690 / 600,
    resume: "Étoiles à six branches tracées en indigo sur fond crème.",
    cartel: "Ce motif japonais évoque les feuilles de chanvre, symbole de croissance. " + EXEMPLE_RETROUVE,
    source: SOURCE_EXEMPLE,
    prix: PRIX_RETROUVE,
    exemple: true,
  },
  {
    id: "col-0004",
    slug: "le-poisson-a-ecailles",
    titre: "Le poisson à écailles",
    famille: "petit-atelier",
    periode: "aujourdhui",
    date: "2026",
    origine: "L'atelier sous la maison",
    technique: "Dessin au trait à colorier",
    type: "animalier",
    couleurs: [],
    image: "/coloriages/col-0004.svg",
    ratio: 848 / 600,
    resume: "Un gros poisson à écailles, des bulles et une vague.",
    cartel:
      "Chaque écaille est une petite zone à colorier : on peut toutes les faire de couleurs différentes. Visuel d'exemple dessiné pour la maquette.",
    source: "Exemple de maquette.",
    niveau: "Tout-petits",
    prix: PRIX_POCHETTE,
    pochette: "Premiers coloriages",
    exemple: true,
  },
];

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

export function trouver(slug: string) {
  return DESIGNS.find((d) => d.slug === slug);
}

export function memeTiroir(d: Design, n = 4) {
  return DESIGNS.filter((x) => x.famille === d.famille && x.slug !== d.slug).slice(0, n);
}

export function prixEdition(d: Design) {
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
