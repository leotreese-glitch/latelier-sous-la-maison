import type { Metadata } from "next";
import { Certificat } from "@/components/commande/Certificat";

export const metadata: Metadata = {
  title: "License certificate",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function Page() {
  return (
    <div className="contenu page-texte">
      <Certificat l="en" />
    </div>
  );
}
