import type { MetadataRoute } from "next";
import { DESIGNS } from "@/lib/catalogue";
import { chemin, cheminMotif, type Page } from "@/lib/i18n";
import { adresseAbsolue, imageDesign } from "@/lib/partage";

// Plan du site pour les moteurs de recherche, fabriqué avec les pages (out/sitemap.xml).
// Chaque page y figure dans les deux langues, avec l'adresse de sa traduction.
export const dynamic = "force-static";

const PAGES: Page[] = ["accueil", "explorer", "licence", "cgv", "mentions", "confidentialite"];

function paire(fr: string, en: string) {
  const langues = { languages: { fr: adresseAbsolue(fr), en: adresseAbsolue(en) } };
  return [
    { url: adresseAbsolue(fr), alternates: langues },
    { url: adresseAbsolue(en), alternates: langues },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = PAGES.flatMap((p) => paire(chemin(p, "fr"), chemin(p, "en")));
  const fiches = DESIGNS.filter((d) => !d.exemple).flatMap((d) => {
    const image = imageDesign(d);
    return paire(cheminMotif(d.slug, "fr"), cheminMotif(d.slug, "en")).map((e) => ({
      ...e,
      ...(d.publieLe ? { lastModified: d.publieLe } : {}),
      ...(image ? { images: [adresseAbsolue(image)] } : {}),
    }));
  });
  return [...pages, ...fiches];
}
