import type { Metadata } from "next";
import { metaPage } from "@/lib/partage";
import { Suspense } from "react";
import { Explorer } from "@/components/Explorer";
import { Mosaique } from "@/components/Mosaique";
import { DESIGNS } from "@/lib/catalogue";

export const metadata: Metadata = metaPage({
  chemin: "/explorer/",
  titre: "Explorer l'atelier",
  description: "Tous les motifs de l'atelier : motifs anciens retrouvés dans les musées, créations originales et coloriages, par couleur, époque et type.",
});

export default function PageExplorer() {
  return (
    <>
      <div className="contenu explorer__tete">
        <h1>Explorer l'atelier</h1>
        <p>Filtrez par tiroir, par couleur ou par époque. Chaque design est livré en haute définition avec sa licence.</p>
      </div>
      {/* Avant le chargement du script (et pour les moteurs de recherche) : la grille complète, sans filtres. */}
      <Suspense
        fallback={
          <div className="contenu resultats">
            <Mosaique designs={DESIGNS} etiquette="Tous les designs" />
          </div>
        }
      >
        <Explorer />
      </Suspense>
    </>
  );
}
