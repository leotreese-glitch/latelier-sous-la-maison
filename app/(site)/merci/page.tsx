import type { Metadata } from "next";
import { Merci } from "@/components/commande/Merci";

export const metadata: Metadata = {
  title: "Merci",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function PageMerci() {
  return (
    <div className="contenu page-texte">
      <Merci />
    </div>
  );
}
