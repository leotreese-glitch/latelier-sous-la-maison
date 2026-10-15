import type { Metadata } from "next";
import { Retrouver } from "@/components/commande/Retrouver";

export const metadata: Metadata = {
  title: "Retrouver mes commandes",
  robots: { index: false, follow: false },
};

export default function PageRetrouver() {
  return (
    <div className="contenu page-texte">
      <Retrouver />
    </div>
  );
}
