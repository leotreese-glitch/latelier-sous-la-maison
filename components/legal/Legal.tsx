import type { Langue } from "@/lib/i18n";
import { infosLegalesManquantes, MISE_A_JOUR_LEGALE, MISE_A_JOUR_LEGALE_EN } from "@/lib/legal";

/** Valeur légale, ou mention visible « à compléter » tant qu'elle manque. */
export function Champ({ valeur, libelle, l = "fr" }: { valeur: string; libelle: string; l?: Langue }) {
  return valeur ? <>{valeur}</> : <span className="legal__manque">[{libelle} : {l === "en" ? "to be completed" : "à compléter"}]</span>;
}

/** Avertissement affiché tant que les informations de l'entreprise ne sont pas toutes renseignées. */
export function AvisProjet({ l = "fr" }: { l?: Langue }) {
  const manques = infosLegalesManquantes(l);
  if (manques.length === 0) return null;
  return (
    <p className="legal__avis" role="note">
      {l === "en"
        ? `Draft text: the business is being registered. Still missing: ${manques.join(", ")}.`
        : `Texte en préparation : l'entreprise est en cours de création. Il manque encore : ${manques.join(", ")}.`}
    </p>
  );
}

export function MiseAJour({ version, l = "fr" }: { version?: string; l?: Langue }) {
  if (l === "en") {
    return (
      <p className="page-texte__version">
        Last updated: {MISE_A_JOUR_LEGALE_EN}
        {version ? `, version ${version}` : ""}. This English text is a translation; the French version prevails.
      </p>
    );
  }
  return (
    <p className="page-texte__version">
      Dernière mise à jour : {MISE_A_JOUR_LEGALE}
      {version ? `, version ${version}` : ""}.
    </p>
  );
}
