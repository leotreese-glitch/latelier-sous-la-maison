// Métadonnées de partage et de référencement communes à toutes les pages :
// adresse canonique, versions dans l'autre langue (hreflang), aperçu Open Graph (Facebook, WhatsApp, Instagram, Pinterest…).
import type { Metadata } from "next";
import { LOCALE_OG, type Langue } from "./i18n";
import type { Design } from "./modele";
import { ADRESSE, INDEXATION } from "./site";

export const NOM_SITE = "L'atelier sous la maison";

/** Image de partage par défaut (1200 × 630), dans public/, une par langue. */
export const IMAGE_PARTAGE: Record<Langue, { url: string; width: number; height: number; alt: string }> = {
  fr: { url: "/partage.png", width: 1200, height: 630, alt: NOM_SITE },
  en: { url: "/partage-en.png", width: 1200, height: 630, alt: NOM_SITE },
};

export const DESCRIPTION_SITE: Record<Langue, string> = {
  fr: "Motifs anciens retrouvés dans les musées et restaurés, et créations originales, livrés en haute définition avec leur licence.",
  en: "Old patterns rediscovered in museum collections and restored, and original designs, delivered in high definition with their license.",
};

/** Métadonnées d'une mise en page racine (une par langue). */
export function metaRacine(l: Langue): Metadata {
  return {
    metadataBase: new URL(ADRESSE),
    title: { default: NOM_SITE, template: `%s, ${NOM_SITE}` },
    description: DESCRIPTION_SITE[l],
    // Pas d'indexation avant le lancement : interrupteur INDEXATION dans lib/site.ts.
    robots: INDEXATION ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: NOM_SITE,
      locale: LOCALE_OG[l],
      title: NOM_SITE,
      description: DESCRIPTION_SITE[l],
      images: [IMAGE_PARTAGE[l]],
    },
    twitter: { card: "summary_large_image", title: NOM_SITE, description: DESCRIPTION_SITE[l], images: [IMAGE_PARTAGE[l].url] },
  };
}

/** Aperçu public d'un design, seulement s'il porte le filigrane incrusté (jamais un fichier propre). */
export function imageDesign(d: Pick<Design, "image" | "filigraneIntegre" | "exemple">) {
  return !d.exemple && d.filigraneIntegre && d.image?.startsWith("/media/") ? d.image : null;
}

export function adresseAbsolue(chemin: string) {
  return `${ADRESSE}${chemin}`;
}

/** Lien « Enregistrer sur Pinterest », sans script ni cookie de Pinterest sur le site. */
export function lienPinterest(d: Pick<Design, "titre" | "image" | "filigraneIntegre" | "exemple">, page: string) {
  const image = imageDesign(d);
  if (!image) return null;
  const p = new URLSearchParams({
    url: adresseAbsolue(page),
    media: adresseAbsolue(image),
    description: `${d.titre}, ${NOM_SITE}`,
  });
  return `https://www.pinterest.com/pin/create/button/?${p.toString()}`;
}

/**
 * Métadonnées d'une page : titre, description, adresse canonique, version dans l'autre langue et aperçu de partage.
 * Next.js remplace l'objet openGraph du gabarit au lieu de le fusionner : tout est donc redonné ici.
 */
export function metaPage(options: {
  chemin: string;
  /** Adresse de la même page dans l'autre langue, quand elle existe. */
  autre?: string;
  langue?: Langue;
  titre?: string;
  description?: string;
  image?: string | null;
  alt?: string;
  indexable?: boolean;
}): Metadata {
  const l = options.langue ?? "fr";
  const images = options.image ? [{ url: options.image, alt: options.alt ?? options.titre ?? NOM_SITE }] : [IMAGE_PARTAGE[l]];
  const description = options.description ?? DESCRIPTION_SITE[l];
  const langues = options.autre
    ? l === "fr"
      ? { fr: options.chemin, en: options.autre, "x-default": options.chemin }
      : { fr: options.autre, en: options.chemin, "x-default": options.autre }
    : undefined;
  const meta: Metadata = {
    alternates: { canonical: options.chemin, ...(langues ? { languages: langues } : {}) },
    openGraph: {
      type: "website",
      siteName: NOM_SITE,
      locale: LOCALE_OG[l],
      ...(options.autre ? { alternateLocale: [LOCALE_OG[l === "fr" ? "en" : "fr"]] } : {}),
      url: options.chemin,
      title: options.titre ?? NOM_SITE,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: options.titre ?? NOM_SITE,
      description,
      images: images.map((i) => i.url),
    },
  };
  if (options.titre) meta.title = options.titre;
  meta.description = description;
  if (options.indexable === false) meta.robots = { index: false, follow: true };
  return meta;
}
