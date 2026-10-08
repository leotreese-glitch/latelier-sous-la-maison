"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Devise = "eur" | "usd";

const Ctx = createContext<{ devise: Devise; choisir: (d: Devise) => void }>({
  devise: "eur",
  choisir: () => {},
});

export function DeviseProvider({ children }: { children: ReactNode }) {
  const [devise, choisir] = useState<Devise>("eur");
  return <Ctx.Provider value={{ devise, choisir }}>{children}</Ctx.Provider>;
}

export function useDevise() {
  return useContext(Ctx);
}

export function formatPrix(montant: number, devise: Devise) {
  if (devise === "eur") {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: montant % 1 ? 2 : 0 }).format(montant);
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: montant % 1 ? 2 : 0 }).format(montant);
}

export function Prix({ eur, usd }: { eur: number; usd: number }) {
  const { devise } = useDevise();
  return <>{formatPrix(devise === "eur" ? eur : usd, devise)}</>;
}

export function ChoixDevise() {
  const { devise, choisir } = useDevise();
  return (
    <div className="devise" role="group" aria-label="Devise d'affichage des prix">
      <button type="button" aria-pressed={devise === "eur"} onClick={() => choisir("eur")}>
        €
      </button>
      <button type="button" aria-pressed={devise === "usd"} onClick={() => choisir("usd")}>
        $
      </button>
    </div>
  );
}
