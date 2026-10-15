import type { Metadata } from "next";
import { JOURS_ACCES, LICENCES, VERSION_LICENCE, type Licence } from "@/lib/licence";

export const metadata: Metadata = {
  title: "Licences",
  description: "Ce que vous pouvez faire, et ne pas faire, avec un design acheté à L'atelier sous la maison.",
};

function BlocLicence({ l, pour }: { l: Licence; pour: string }) {
  return (
    <section className="licence" aria-labelledby={`titre-${l.type}`}>
      <h2 id={`titre-${l.type}`}>{l.nom}</h2>
      <p className="licence__pour">{pour}</p>
      <p>{l.resume}</p>
      <h3>Vous pouvez</h3>
      <ul className="licence__liste licence__liste--oui">
        {l.permis.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <h3>Vous ne pouvez pas</h3>
      <ul className="licence__liste licence__liste--non">
        {l.interdit.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <h3>À savoir</h3>
      <ul className="licence__liste">
        {l.mentions.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </section>
  );
}

export default function PageLicence() {
  return (
    <div className="contenu page-texte">
      <h1>Les licences</h1>
      <p className="page-texte__intro">
        Chaque achat donne une licence, pas la propriété du motif. Le texte en vigueur le jour de l'achat est recopié dans votre certificat : il
        ne change plus pour vous, même si cette page évolue.
      </p>
      <BlocLicence l={LICENCES.standard} pour="Pour les motifs retrouvés et les créations de l'atelier." />
      <BlocLicence l={LICENCES.coloriage} pour="Pour les pochettes du petit atelier." />
      <section className="licence" aria-labelledby="titre-pratique">
        <h2 id="titre-pratique">En pratique</h2>
        <ul className="licence__liste">
          <li>
            Après le paiement, une page de commande vous donne vos fichiers et votre certificat. Les téléchargements restent ouverts {JOURS_ACCES}{" "}
            jours ; la licence, elle, n'expire pas.
          </li>
          <li>Chaque certificat porte un numéro unique, vérifiable sur la page « Vérifier un certificat ».</li>
          <li>Le lien de votre commande vous est aussi envoyé par e-mail. En cas de perte, la page « Retrouver mes commandes » vous le renvoie.</li>
          <li>
            Les fichiers numériques sont livrés tout de suite : en cochant la case avant de payer, vous renoncez au droit de rétractation de 14
            jours.
          </li>
        </ul>
      </section>
      <p className="page-texte__version">Version {VERSION_LICENCE}.</p>
    </div>
  );
}
