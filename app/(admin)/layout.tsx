import type { Metadata, Viewport } from "next";
import "@fontsource/im-fell-french-canon/400.css";
import "@fontsource/im-fell-french-canon/400-italic.css";
import "@fontsource-variable/jost/wght.css";
import "../globals.css";

// Mise en page racine de l'administration (en français, jamais indexée).
export const metadata: Metadata = {
  title: { default: "Administration", template: "%s, L'atelier sous la maison" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#171E33" };

export default function RacineAdmin({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <a className="evitement" href="#contenu">
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
