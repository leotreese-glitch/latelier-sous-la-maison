import type { Metadata } from "next";
import { Suspense } from "react";
import { Explorer } from "@/components/Explorer";

export const metadata: Metadata = { title: "Explorer l'atelier" };

export default function PageExplorer() {
  return (
    <>
      <div className="contenu explorer__tete">
        <h1>Explorer l'atelier</h1>
        <p>Filtrez par tiroir, par couleur ou par époque. Chaque design est livré en haute définition avec sa licence.</p>
      </div>
      <Suspense>
        <Explorer />
      </Suspense>
    </>
  );
}
