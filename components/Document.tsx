import type { ReactNode } from "react";
import type { Langue } from "@/lib/i18n";
import { DeviseProvider } from "./Devise";
import { Protection } from "./Protection";

/**
 * Le document HTML d'une langue. Chaque langue a sa propre mise en page racine :
 * la balise <html lang> est juste dès la page statique, et changer de langue recharge la page.
 */
export function Document({ langue, children }: { langue: Langue; children: ReactNode }) {
  return (
    <html lang={langue}>
      <body>
        <a className="evitement" href="#contenu">
          {langue === "en" ? "Skip to content" : "Aller au contenu"}
        </a>
        <DeviseProvider langue={langue}>{children}</DeviseProvider>
        <Protection />
      </body>
    </html>
  );
}

export const BANDEAU: Record<Langue, string> = {
  fr: "Site en préparation : le paiement fonctionne en mode test, aucune carte réelle n'est débitée.",
  en: "Site in preparation: payments run in test mode, no real card is charged.",
};
