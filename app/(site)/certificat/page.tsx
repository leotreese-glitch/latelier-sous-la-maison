import type { Metadata } from "next";
import { Certificat } from "@/components/commande/Certificat";

export const metadata: Metadata = {
  title: "Certificat de licence",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function PageCertificat() {
  return (
    <div className="contenu page-texte">
      <Certificat />
    </div>
  );
}
