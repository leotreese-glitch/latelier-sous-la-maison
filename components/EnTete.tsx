"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";
import { ChoixDevise } from "./Devise";

const LIENS = [
  { href: "/explorer/", nom: "Explorer" },
  { href: "/explorer/?famille=retrouves", nom: "Motifs retrouvés" },
  { href: "/explorer/?famille=atelier", nom: "Créations de l'atelier" },
  { href: "/explorer/?famille=petit-atelier", nom: "Le petit atelier" },
];

export function EnTete() {
  const [ouvert, setOuvert] = useState(false);
  const chemin = usePathname();

  return (
    <header className="entete">
      <div className="entete__barre">
        <Link href="/" className="entete__accueil" aria-label="L'atelier sous la maison, accueil">
          <Logo />
        </Link>
        <nav className={`entete__nav${ouvert ? " est-ouvert" : ""}`} aria-label="Navigation principale" id="nav-principale">
          {LIENS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOuvert(false)}
              aria-current={l.href === "/explorer/" && chemin?.startsWith("/explorer") ? "page" : undefined}
            >
              {l.nom}
            </Link>
          ))}
        </nav>
        <div className="entete__outils">
          <ChoixDevise />
          <span className="entete__compte" title="Les comptes arrivent à l'étape 3">
            Mon compte
          </span>
          <button
            type="button"
            className="entete__menu"
            aria-expanded={ouvert}
            aria-controls="nav-principale"
            onClick={() => setOuvert((o) => !o)}
          >
            {ouvert ? "Fermer" : "Menu"}
          </button>
        </div>
      </div>
    </header>
  );
}
