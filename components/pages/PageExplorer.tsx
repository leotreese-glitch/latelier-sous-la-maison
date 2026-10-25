import { Suspense } from "react";
import { Explorer } from "@/components/Explorer";
import { Mosaique } from "@/components/Mosaique";
import { DESIGNS } from "@/lib/catalogue";
import type { Langue } from "@/lib/i18n";

export const TEXTES_EXPLORER = {
  fr: {
    titre: "Explorer l'atelier",
    description: "Tous les motifs de l'atelier : motifs anciens retrouvés dans les musées et créations originales, par couleur, époque et type.",
    intro: "Filtrez par tiroir, par couleur ou par époque. Chaque design est livré en haute définition avec sa licence.",
    tous: "Tous les designs",
  },
  en: {
    titre: "Explore the atelier",
    description: "Every pattern in the atelier: old patterns rediscovered in museum collections and original designs, by colour, period and type.",
    intro: "Filter by drawer, colour or period. Every design is delivered in high definition with its license.",
    tous: "All designs",
  },
};

export function PageExplorer({ l }: { l: Langue }) {
  const t = TEXTES_EXPLORER[l];
  return (
    <>
      <div className="contenu explorer__tete">
        <h1>{t.titre}</h1>
        <p>{t.intro}</p>
      </div>
      {/* Avant le chargement du script (et pour les moteurs de recherche) : la grille complète, sans filtres. */}
      <Suspense
        fallback={
          <div className="contenu resultats">
            <Mosaique designs={DESIGNS} etiquette={t.tous} l={l} />
          </div>
        }
      >
        <Explorer l={l} />
      </Suspense>
    </>
  );
}
