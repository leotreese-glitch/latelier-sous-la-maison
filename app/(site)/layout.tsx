import { EnTete } from "@/components/EnTete";
import { PiedDePage } from "@/components/PiedDePage";

export default function LayoutSite({ children }: { children: React.ReactNode }) {
  return (
    <>
      <p className="bandeau-maquette">Site en préparation : le paiement fonctionne en mode test, aucune carte réelle n'est débitée.</p>
      <EnTete />
      <main id="contenu">{children}</main>
      <PiedDePage />
    </>
  );
}
