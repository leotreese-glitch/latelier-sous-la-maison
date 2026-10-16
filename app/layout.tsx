import type { Metadata, Viewport } from "next";
import "@fontsource/im-fell-french-canon/400.css";
import "@fontsource/im-fell-french-canon/400-italic.css";
import "@fontsource-variable/jost/wght.css";
import "./globals.css";
import { DeviseProvider } from "@/components/Devise";
import { Protection } from "@/components/Protection";
import { IMAGE_PARTAGE, NOM_SITE } from "@/lib/partage";
import { ADRESSE, INDEXATION } from "@/lib/site";

const DESCRIPTION = "Motifs anciens restaurés, créations originales et coloriages, livrés en haute définition avec leur licence.";

export const metadata: Metadata = {
  metadataBase: new URL(ADRESSE),
  title: {
    default: NOM_SITE,
    template: `%s, ${NOM_SITE}`,
  },
  description: DESCRIPTION,
  // Pas d'indexation avant le lancement : interrupteur INDEXATION dans lib/site.ts.
  robots: INDEXATION ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { type: "website", siteName: NOM_SITE, locale: "fr_FR", title: NOM_SITE, description: DESCRIPTION, images: [IMAGE_PARTAGE] },
  twitter: { card: "summary_large_image", title: NOM_SITE, description: DESCRIPTION, images: [IMAGE_PARTAGE.url] },
};

export const viewport: Viewport = {
  themeColor: "#171E33",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <a className="evitement" href="#contenu">
          Aller au contenu
        </a>
        <DeviseProvider>{children}</DeviseProvider>
        <Protection />
      </body>
    </html>
  );
}
