"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { chemin, equivalent, type Langue } from "@/lib/i18n";
import { nomFamille, TIROIRS_OUVERTS } from "@/lib/modele";
import { Logo } from "./Logo";
import { ChoixDevise } from "./Devise";

const T = {
  fr: { accueil: "L'atelier sous la maison, accueil", nav: "Navigation principale", explorer: "Explorer", commandes: "Mes commandes", menu: "Menu", fermer: "Fermer" },
  en: { accueil: "L'atelier sous la maison, home", nav: "Main navigation", explorer: "Explore", commandes: "My orders", menu: "Menu", fermer: "Close" },
};

/** Lien vers la même page dans l'autre langue, en gardant les paramètres (numéro de commande, filtre…). */
export function ChangerLangue({ l, className, complet = false }: { l: Langue; className?: string; complet?: boolean }) {
  const chemin_ = usePathname() ?? "/";
  const cible: Langue = l === "fr" ? "en" : "fr";
  const href = equivalent(chemin_, cible);
  const aller = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.assign(`${href}${window.location.search}${window.location.hash}`);
  };
  return (
    <a
      href={href}
      onClick={aller}
      hrefLang={cible}
      lang={cible}
      className={className ?? "langue"}
      aria-label={complet ? undefined : cible === "en" ? "English version" : "Version française"}
    >
      {complet ? (cible === "en" ? "English version" : "Version française") : cible === "en" ? "EN" : "FR"}
    </a>
  );
}

export function EnTete({ l }: { l: Langue }) {
  const [ouvert, setOuvert] = useState(false);
  const chemin_ = usePathname();
  const t = T[l];
  const explorer = chemin("explorer", l);
  const liens = [
    { href: explorer, nom: t.explorer },
    ...TIROIRS_OUVERTS.map((f) => ({ href: `${explorer}?famille=${f}`, nom: nomFamille(f, l) })),
  ];

  return (
    <header className="entete">
      <div className="entete__barre">
        <Link href={chemin("accueil", l)} className="entete__accueil" aria-label={t.accueil}>
          <Logo />
        </Link>
        <nav className={`entete__nav${ouvert ? " est-ouvert" : ""}`} aria-label={t.nav} id="nav-principale">
          {liens.map((lien) => (
            <Link
              key={lien.href}
              href={lien.href}
              onClick={() => setOuvert(false)}
              aria-current={lien.href === explorer && chemin_?.startsWith(explorer) ? "page" : undefined}
            >
              {lien.nom}
            </Link>
          ))}
          {/* Dans le menu des petits écrans seulement : la barre n'a plus la place pour ces deux liens. */}
          <Link href={chemin("retrouver", l)} className="entete__nav-extra" onClick={() => setOuvert(false)}>
            {t.commandes}
          </Link>
          <ChangerLangue l={l} className="entete__nav-extra" complet />
        </nav>
        <div className="entete__outils">
          <ChoixDevise />
          <ChangerLangue l={l} />
          <Link href={chemin("retrouver", l)} className="entete__compte">
            {t.commandes}
          </Link>
          <button
            type="button"
            className="entete__menu"
            aria-expanded={ouvert}
            aria-controls="nav-principale"
            onClick={() => setOuvert((o) => !o)}
          >
            {ouvert ? t.fermer : t.menu}
          </button>
        </div>
      </div>
    </header>
  );
}
