import type { Metadata } from "next";
import Link from "next/link";
import { AvisProjet, Champ, MiseAJour } from "@/components/legal/Legal";
import { EDITEUR, HEBERGEUR, PRESTATAIRES } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur, hébergeur et prestataires du site L'atelier sous la maison.",
};

export default function MentionsLegales() {
  return (
    <div className="contenu page-texte legal">
      <h1>Mentions légales</h1>
      <AvisProjet />

      <section aria-labelledby="titre-editeur">
        <h2 id="titre-editeur">Éditeur du site</h2>
        <p>
          Le site {EDITEUR.site.replace("https://", "")} est édité par <Champ valeur={EDITEUR.nom} libelle="prénom, nom, EI" />, entrepreneur
          individuel exerçant sous le nom commercial « {EDITEUR.enseigne} ».
        </p>
        <ul className="legal__fiche">
          <li>
            Adresse : <Champ valeur={EDITEUR.adresse} libelle="adresse" />
          </li>
          <li>
            Téléphone : <Champ valeur={EDITEUR.telephone} libelle="téléphone" />
          </li>
          <li>
            E-mail : <a href={`mailto:${EDITEUR.email}`}>{EDITEUR.email}</a>
          </li>
          <li>
            SIRET : <Champ valeur={EDITEUR.siret} libelle="SIRET" />
          </li>
          {EDITEUR.immatriculation && <li>Immatriculation : {EDITEUR.immatriculation}</li>}
          <li>
            TVA : <Champ valeur={EDITEUR.tva} libelle="mention de TVA" />
          </li>
        </ul>
        <p>
          Directeur de la publication : <Champ valeur={EDITEUR.nom} libelle="prénom, nom" />.
        </p>
      </section>

      <section aria-labelledby="titre-hebergeur">
        <h2 id="titre-hebergeur">Hébergement</h2>
        <p>
          Le site et ses fichiers sont hébergés par {HEBERGEUR.nom}, {HEBERGEUR.adresse}, téléphone {HEBERGEUR.telephone},{" "}
          <a href={HEBERGEUR.site}>{HEBERGEUR.site.replace("https://", "")}</a>.
        </p>
      </section>

      <section aria-labelledby="titre-prestataires">
        <h2 id="titre-prestataires">Paiement et e-mails</h2>
        <p>
          Les paiements sont traités par {PRESTATAIRES.paiement.nom}, qui agit comme {PRESTATAIRES.paiement.detail}. Les e-mails de commande
          sont envoyés par {PRESTATAIRES.courriel.nom}, {PRESTATAIRES.courriel.detail}.
        </p>
      </section>

      <section aria-labelledby="titre-pi">
        <h2 id="titre-pi">Propriété intellectuelle</h2>
        <p>
          Les textes, cartels, aperçus, l'identité visuelle et les créations de l'atelier sont protégés. Leur reproduction sans autorisation
          est interdite, à l'exception de l'usage prévu par la licence achetée (voir <Link href="/licence/">les licences</Link>).
        </p>
        <p>
          Les motifs retrouvés reproduisent des œuvres du domaine public conservées dans des musées ; chaque fiche indique le musée, le
          numéro d'inventaire et un lien vers la notice d'origine. Ce qui est vendu est le fichier restauré par l'atelier, pas l'œuvre
          ancienne elle-même. Les créations de l'atelier sont réalisées avec l'assistance de l'intelligence artificielle.
        </p>
      </section>

      <section aria-labelledby="titre-credits">
        <h2 id="titre-credits">Crédits</h2>
        <p>Polices de caractères : IM Fell French Canon et Jost, distribuées sous licence libre SIL Open Font License.</p>
      </section>

      <section aria-labelledby="titre-liens">
        <h2 id="titre-liens">Voir aussi</h2>
        <p>
          <Link href="/conditions-de-vente/">Conditions de vente</Link> · <Link href="/confidentialite/">Confidentialité</Link> ·{" "}
          <Link href="/licence/">Licences</Link>
        </p>
      </section>
      <MiseAJour />
    </div>
  );
}
