"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Langue } from "@/lib/i18n";

export type Devise = "eur" | "usd";

const Ctx = createContext<{ devise: Devise; choisir: (d: Devise) => void; langue: Langue }>({
  devise: "eur",
  choisir: () => {},
  langue: "fr",
});

/** Monnaie d'affichage : l'euro sur le site français, le dollar sur le site anglais (au choix ensuite). */
export function DeviseProvider({ children, langue = "fr" }: { children: ReactNode; langue?: Langue }) {
  const [devise, choisir] = useState<Devise>(langue === "en" ? "usd" : "eur");
  return <Ctx.Provider value={{ devise, choisir, langue }}>{children}</Ctx.Provider>;
}

export function useDevise() {
  return useContext(Ctx);
}

export function formatPrix(montant: number, devise: Devise, langue: Langue = "fr") {
  const locale = langue === "en" ? "en-US" : devise === "eur" ? "fr-FR" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: devise === "eur" ? "EUR" : "USD",
    minimumFractionDigits: montant % 1 ? 2 : 0,
  }).format(montant);
}

export function Prix({ eur, usd }: { eur: number; usd: number }) {
  const { devise, langue } = useDevise();
  return <>{formatPrix(devise === "eur" ? eur : usd, devise, langue)}</>;
}

export function ChoixDevise() {
  const { devise, choisir, langue } = useDevise();
  return (
    <div className="devise" role="group" aria-label={langue === "en" ? "Currency for prices" : "Devise d'affichage des prix"}>
      <button type="button" aria-pressed={devise === "eur"} onClick={() => choisir("eur")}>
        €
      </button>
      <button type="button" aria-pressed={devise === "usd"} onClick={() => choisir("usd")}>
        $
      </button>
    </div>
  );
}
