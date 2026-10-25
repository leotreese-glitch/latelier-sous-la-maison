import type { Metadata, Viewport } from "next";
import "@fontsource/im-fell-french-canon/400.css";
import "@fontsource/im-fell-french-canon/400-italic.css";
import "@fontsource-variable/jost/wght.css";
import "../globals.css";
import { BANDEAU, Document } from "@/components/Document";
import { EnTete } from "@/components/EnTete";
import { PiedDePage } from "@/components/PiedDePage";
import { metaRacine } from "@/lib/partage";

// Mise en page racine du site anglais (adresses sous /en/).
export const metadata: Metadata = metaRacine("en");

export const viewport: Viewport = { themeColor: "#171E33" };

export default function LayoutAnglais({ children }: { children: React.ReactNode }) {
  return (
    <Document langue="en">
      <p className="bandeau-maquette">{BANDEAU.en}</p>
      <EnTete l="en" />
      <main id="contenu">{children}</main>
      <PiedDePage l="en" />
    </Document>
  );
}
