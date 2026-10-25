// Textes des licences vendues sur le site.
// Le texte en vigueur au moment de l'achat est recopié dans chaque commande : il ne change plus pour l'acheteur.
// À faire relire par un juriste avant le passage en paiement réel.

import type { Famille } from "./modele";

export type TypeLicence = "standard" | "coloriage";

export const VERSION_LICENCE = "2026-10";

/** Durée pendant laquelle l'acheteur peut télécharger ses fichiers depuis sa page de commande. */
export const JOURS_ACCES = 30;

export interface Licence {
  type: TypeLicence;
  version: string;
  nom: string;
  resume: string;
  permis: string[];
  interdit: string[];
  mentions: string[];
}

export const LICENCES: Record<TypeLicence, Licence> = {
  standard: {
    type: "standard",
    version: VERSION_LICENCE,
    nom: "Licence standard",
    resume:
      "Licence non exclusive, accordée à un seul acheteur, sans limite de durée ni de territoire, pour un usage personnel et commercial.",
    permis: [
      "Imprimer et reproduire le motif sur tout support, y compris sur des produits que vous vendez (tissus, papeterie, décoration, vêtements, emballages).",
      "Modifier le motif : couleurs, échelle, recadrage, assemblage avec d'autres éléments.",
      "Utiliser le motif dans vos créations numériques et vos supports de communication.",
      "Faire fabriquer vos produits par un imprimeur ou un atelier, qui peut recevoir le fichier pour cette seule fabrication.",
    ],
    interdit: [
      "Revendre, partager, prêter ou mettre à disposition le fichier lui-même, modifié ou non, y compris dans une banque d'images, un pack de motifs ou un modèle à télécharger.",
      "Utiliser le motif comme logo ou le déposer comme marque, dessin ou modèle.",
      "Se servir du fichier pour entraîner ou alimenter un système d'intelligence artificielle.",
      "Présenter le motif comme votre propre création originale.",
    ],
    mentions: [
      "Les motifs retrouvés reproduisent des œuvres du domaine public : la licence porte sur le fichier restauré par L'atelier sous la maison, pas sur l'œuvre ancienne elle-même. Aucune exclusivité n'est accordée.",
      "Les créations de l'atelier sont réalisées avec l'assistance de l'IA. Aucune exclusivité ni protection par le droit d'auteur n'est garantie.",
      "Le certificat de licence fait foi. Il est vérifiable en ligne grâce à son numéro.",
    ],
  },
  coloriage: {
    type: "coloriage",
    version: VERSION_LICENCE,
    nom: "Licence coloriage",
    resume: "Licence d'impression pour un usage familial ou pédagogique, sans limite de durée.",
    permis: [
      "Imprimer les dessins autant de fois que vous le souhaitez pour votre famille.",
      "Imprimer les dessins pour une classe, un centre de loisirs ou un atelier dont vous avez la charge, sans les vendre.",
    ],
    interdit: [
      "Vendre les impressions ou le fichier, ou les intégrer à un produit vendu.",
      "Partager, publier ou mettre à disposition le fichier, y compris sur un site ou un réseau de classe ouvert.",
      "Se servir du fichier pour entraîner ou alimenter un système d'intelligence artificielle.",
    ],
    mentions: ["Le certificat de licence fait foi. Il est vérifiable en ligne grâce à son numéro."],
  },
};

export function typeLicence(famille: Famille): TypeLicence {
  return famille === "petit-atelier" ? "coloriage" : "standard";
}

/** Texte anglais des licences, recopié dans les commandes passées sur la version anglaise du site. */
export const LICENCES_EN: Record<TypeLicence, Licence> = {
  standard: {
    type: "standard",
    version: VERSION_LICENCE,
    nom: "Standard license",
    resume:
      "A non-exclusive license granted to a single buyer, with no time or territory limit, for personal and commercial use.",
    permis: [
      "Print and reproduce the pattern on any medium, including products you sell (fabrics, stationery, home decor, clothing, packaging).",
      "Modify the pattern: colours, scale, cropping, combining it with other elements.",
      "Use the pattern in your digital creations and your marketing materials.",
      "Have your products made by a printer or a workshop, which may receive the file for that production only.",
    ],
    interdit: [
      "Resell, share, lend or make available the file itself, modified or not, including in a stock image library, a pattern pack or a downloadable template.",
      "Use the pattern as a logo or register it as a trademark, design or model.",
      "Use the file to train or feed an artificial intelligence system.",
      "Present the pattern as your own original creation.",
    ],
    mentions: [
      "Rediscovered patterns reproduce public domain works: the license covers the file restored by L'atelier sous la maison, not the original artwork itself. No exclusivity is granted.",
      "Atelier originals are created with the assistance of AI. No exclusivity or copyright protection is guaranteed.",
      "The license certificate is the proof of your rights. It can be verified online with its number.",
    ],
  },
  coloriage: {
    type: "coloriage",
    version: VERSION_LICENCE,
    nom: "Colouring license",
    resume: "A printing license for family or educational use, with no time limit.",
    permis: [
      "Print the drawings as many times as you like for your family.",
      "Print the drawings for a class, a holiday club or a workshop you run, without selling them.",
    ],
    interdit: [
      "Sell the prints or the file, or include them in a product you sell.",
      "Share, publish or make available the file, including on a website or an open class network.",
      "Use the file to train or feed an artificial intelligence system.",
    ],
    mentions: ["The license certificate is the proof of your rights. It can be verified online with its number."],
  },
};

export function licenceSelonLangue(type: TypeLicence, langue: "fr" | "en") {
  return langue === "en" ? LICENCES_EN[type] : LICENCES[type];
}
