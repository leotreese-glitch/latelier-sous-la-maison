import type { Metadata } from "next";
import { Retrouver } from "@/components/commande/Retrouver";

export const metadata: Metadata = {
  title: "Find my orders",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="contenu page-texte">
      <Retrouver l="en" />
    </div>
  );
}
