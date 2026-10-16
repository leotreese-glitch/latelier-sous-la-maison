import type { MetadataRoute } from "next";
import { adresseAbsolue } from "@/lib/partage";

// Les robots peuvent lire les pages publiques (y compris Pinterest pour les épingles).
// Tant que lib/site.ts a INDEXATION = false, chaque page leur demande de ne pas l'indexer.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/commande/", "/merci/", "/certificat/"] },
    sitemap: adresseAbsolue("/sitemap.xml"),
  };
}
