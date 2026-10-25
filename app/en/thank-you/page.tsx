import type { Metadata } from "next";
import { Merci } from "@/components/commande/Merci";

export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function Page() {
  return (
    <div className="contenu page-texte">
      <Merci l="en" />
    </div>
  );
}
