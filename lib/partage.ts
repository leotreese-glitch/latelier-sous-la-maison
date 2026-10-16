// Métadonnées de partage et de référencement communes à toutes les pages :
// adresse canonique, aperçu Open Graph (Facebook, WhatsApp, Instagram, Pinterest…) et carte de partage.
import type { Metadata } from "next";
import type { Design } from "./modele";
import { ADRESSE } from "./site";

export const NOM_SITE = "L'atelier sous la maison";

/** Image de partage par défaut (1200 × 630), dans public/. */
export const IMAGE_PARTAGE = { url: "/partage.png", width: 1200, height: 630, alt: NOM_SITE };

/** Aperçu public d'un design, seulement s'il porte le filigrane incrusté (jamais un fichier propre). */
export function imageDesign(d: Pick<Design, "image" | "filigraneIntegre" | "exemple">) {
  return !d.exemple && d.filigraneIntegre && d.image?.startsWith("/media/") ? d.image : null;
}

export function adresseAbsolue(chemin: string) {
  return `${ADRESSE}${chemin}`;
}

/** Lien « Enregistrer sur Pinterest », sans script ni cookie de Pinterest sur le site. */
export function lienPinterest(d: Pick<Design, "slug" | "titre" | "image" | "filigraneIntegre" | "exemple">) {
  const image = imageDesign(d);
  if (!image) return null;
  const p = new URLSearchParams({
    url: adresseAbsolue(`/motif/${d.slug}/`),
    media: adresseAbsolue(image),
    description: `${d.titre}, ${NOM_SITE}`,
  });
  return `https://www.pinterest.com/pin/create/button/?${p.toString()}`;
}

/**
 * Métadonnées d'une page : titre, description, adresse canonique et aperçu de partage.
 * Next.js remplace l'objet openGraph du gabarit au lieu de le fusionner : tout est donc redonné ici.
 */
export function metaPage(options: {
  chemin: string;
  titre?: string;
  description?: string;
  image?: string | null;
  alt?: string;
  indexable?: boolean;
}): Metadata {
  const images = options.image ? [{ url: options.image, alt: options.alt ?? options.titre ?? NOM_SITE }] : [IMAGE_PARTAGE];
  const meta: Metadata = {
    alternates: { canonical: options.chemin },
    openGraph: {
      type: "website",
      siteName: NOM_SITE,
      locale: "fr_FR",
      url: options.chemin,
      title: options.titre ?? NOM_SITE,
      description: options.description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: options.titre ?? NOM_SITE,
      description: options.description,
      images: images.map((i) => i.url),
    },
  };
  if (options.titre) meta.title = options.titre;
  if (options.description) meta.description = options.description;
  if (options.indexable === false) meta.robots = { index: false, follow: true };
  return meta;
}
