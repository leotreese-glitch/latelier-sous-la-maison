// Langues du site : le français à la racine, l'anglais sous /en/.
// Ce fichier est partagé par les pages et par les fonctions serveur (aucune dépendance à React).

export type Langue = "fr" | "en";

export const LANGUES: Langue[] = ["fr", "en"];

/** Locale utilisée pour les dates, les montants et les nombres. */
export const LOCALE: Record<Langue, string> = { fr: "fr-FR", en: "en-US" };

/** Locale Open Graph. */
export const LOCALE_OG: Record<Langue, string> = { fr: "fr_FR", en: "en_US" };

export function langueValide(v: unknown): Langue {
  return v === "en" ? "en" : "fr";
}

/** Adresses des pages dans chaque langue. */
export const PAGES = {
  accueil: { fr: "/", en: "/en/" },
  explorer: { fr: "/explorer/", en: "/en/explore/" },
  licence: { fr: "/licence/", en: "/en/license/" },
  cgv: { fr: "/conditions-de-vente/", en: "/en/terms/" },
  confidentialite: { fr: "/confidentialite/", en: "/en/privacy/" },
  mentions: { fr: "/mentions-legales/", en: "/en/legal-notice/" },
  certificat: { fr: "/certificat/", en: "/en/certificate/" },
  commande: { fr: "/commande/", en: "/en/order/" },
  retrouver: { fr: "/commande/retrouver/", en: "/en/order/find/" },
  merci: { fr: "/merci/", en: "/en/thank-you/" },
} as const;

export type Page = keyof typeof PAGES;

export function chemin(page: Page, l: Langue): string {
  return PAGES[page][l];
}

export function cheminMotif(slug: string, l: Langue) {
  return l === "en" ? `/en/pattern/${slug}/` : `/motif/${slug}/`;
}

export function langueDe(pathname: string): Langue {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "fr";
}

/** L'adresse équivalente dans l'autre langue (accueil par défaut si la page n'existe pas dans cette langue). */
export function equivalent(pathname: string, cible: Langue): string {
  const p = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const source = langueDe(p);
  const motif = source === "en" ? /^\/en\/pattern\/([^/]+)\/$/.exec(p) : /^\/motif\/([^/]+)\/$/.exec(p);
  if (motif) return cheminMotif(motif[1], cible);
  for (const page of Object.keys(PAGES) as Page[]) {
    if (PAGES[page][source] === p) return PAGES[page][cible];
  }
  return PAGES.accueil[cible];
}
