import type { Metadata, Viewport } from "next";
import "@fontsource/im-fell-french-canon/400.css";
import "@fontsource/im-fell-french-canon/400-italic.css";
import "@fontsource-variable/jost/wght.css";
import "../globals.css";
import { BANDEAU, Document } from "@/components/Document";
import { EnTete } from "@/components/EnTete";
import { PiedDePage } from "@/components/PiedDePage";
import { metaRacine } from "@/lib/partage";

// Mise en page racine du site français (à la racine des adresses).
export const metadata: Metadata = metaRacine("fr");

export const viewport: Viewport = { themeColor: "#171E33" };

export default function LayoutSite({ children }: { children: React.ReactNode }) {
  return (
    <Document langue="fr">
      <p className="bandeau-maquette">{BANDEAU.fr}</p>
      <EnTete l="fr" />
      <main id="contenu">{children}</main>
      <PiedDePage l="fr" />
    </Document>
  );
}
