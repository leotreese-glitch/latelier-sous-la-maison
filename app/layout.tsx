import type { Metadata, Viewport } from "next";
import "@fontsource/im-fell-french-canon/400.css";
import "@fontsource/im-fell-french-canon/400-italic.css";
import "@fontsource-variable/jost/wght.css";
import "./globals.css";
import { DeviseProvider } from "@/components/Devise";
import { EnTete } from "@/components/EnTete";
import { PiedDePage } from "@/components/PiedDePage";
import { Protection } from "@/components/Protection";

export const metadata: Metadata = {
  title: {
    default: "L'atelier sous la maison",
    template: "%s, L'atelier sous la maison",
  },
  description:
    "Motifs anciens restaurés, créations originales et coloriages, livrés en haute définition avec leur licence.",
  robots: { index: false, follow: false }, // maquette : pas d'indexation
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
        <p className="bandeau-maquette">Maquette de travail : contenus et prix d'exemple, paiement inactif.</p>
        <DeviseProvider>
          <EnTete />
          <main id="contenu">{children}</main>
          <PiedDePage />
        </DeviseProvider>
        <Protection />
      </body>
    </html>
  );
}
