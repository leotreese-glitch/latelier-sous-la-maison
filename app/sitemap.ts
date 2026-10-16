import type { MetadataRoute } from "next";
import { DESIGNS } from "@/lib/catalogue";
import { adresseAbsolue, imageDesign } from "@/lib/partage";

// Plan du site pour les moteurs de recherche, fabriqué avec les pages (out/sitemap.xml).
export const dynamic = "force-static";

const PAGES = ["/", "/explorer/", "/licence/", "/conditions-de-vente/", "/mentions-legales/", "/confidentialite/"];

export default function sitemap(): MetadataRoute.Sitemap {
  const fiches = DESIGNS.filter((d) => !d.exemple).map((d) => {
    const image = imageDesign(d);
    return {
      url: adresseAbsolue(`/motif/${d.slug}/`),
      ...(d.publieLe ? { lastModified: d.publieLe } : {}),
      ...(image ? { images: [adresseAbsolue(image)] } : {}),
    };
  });
  return [...PAGES.map((chemin) => ({ url: adresseAbsolue(chemin) })), ...fiches];
}
