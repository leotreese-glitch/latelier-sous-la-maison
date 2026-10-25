import type { Metadata } from "next";
import { Commande } from "@/components/commande/Commande";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function Page() {
  return (
    <div className="contenu page-texte commande">
      <Commande l="en" />
    </div>
  );
}
