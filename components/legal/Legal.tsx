import { infosLegalesManquantes, MISE_A_JOUR_LEGALE } from "@/lib/legal";

/** Valeur légale, ou mention visible « à compléter » tant qu'elle manque. */
export function Champ({ valeur, libelle }: { valeur: string; libelle: string }) {
  return valeur ? <>{valeur}</> : <span className="legal__manque">[{libelle} : à compléter]</span>;
}

/** Avertissement affiché tant que les informations de l'entreprise ne sont pas toutes renseignées. */
export function AvisProjet() {
  const manques = infosLegalesManquantes();
  if (manques.length === 0) return null;
  return (
    <p className="legal__avis" role="note">
      Texte en préparation : l'entreprise est en cours de création. Il manque encore : {manques.join(", ")}.
    </p>
  );
}

export function MiseAJour({ version }: { version?: string }) {
  return (
    <p className="page-texte__version">
      Dernière mise à jour : {MISE_A_JOUR_LEGALE}
      {version ? `, version ${version}` : ""}.
    </p>
  );
}
