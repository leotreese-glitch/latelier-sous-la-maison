import { EnTete } from "@/components/EnTete";
import { PiedDePage } from "@/components/PiedDePage";

export default function LayoutSite({ children }: { children: React.ReactNode }) {
  return (
    <>
      <p className="bandeau-maquette">Maquette de travail : contenus et prix d'exemple, paiement inactif.</p>
      <EnTete />
      <main id="contenu">{children}</main>
      <PiedDePage />
    </>
  );
}
