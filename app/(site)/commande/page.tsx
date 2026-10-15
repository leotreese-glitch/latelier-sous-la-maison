import type { Metadata } from "next";
import { Commande } from "@/components/commande/Commande";

export const metadata: Metadata = {
  title: "Votre commande",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function PageCommande() {
  return (
    <div className="contenu page-texte commande">
      <Commande />
    </div>
  );
}
