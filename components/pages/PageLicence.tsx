import Link from "next/link";
import { chemin, type Langue } from "@/lib/i18n";
import { JOURS_ACCES, LICENCES, LICENCES_EN, VERSION_LICENCE, type Licence } from "@/lib/licence";

export const TEXTES_LICENCE = {
  fr: {
    titre: "Les licences",
    description: "Ce que vous pouvez faire, et ne pas faire, avec un design acheté à L'atelier sous la maison.",
    intro:
      "Chaque achat donne une licence, pas la propriété du motif. Le texte en vigueur le jour de l'achat est recopié dans votre certificat : il ne change plus pour vous, même si cette page évolue.",
    pour: "Pour les motifs retrouvés et les créations de l'atelier.",
    peut: "Vous pouvez",
    pasPeut: "Vous ne pouvez pas",
    savoir: "À savoir",
    pratique: "En pratique",
    p1: `Après le paiement, une page de commande vous donne vos fichiers et votre certificat. Les téléchargements restent ouverts ${JOURS_ACCES} jours ; la licence, elle, n'expire pas.`,
    p2: "Chaque certificat porte un numéro unique, vérifiable sur la page « Vérifier un certificat ».",
    p3: "Le lien de votre commande vous est aussi envoyé par e-mail. En cas de perte, la page « Retrouver mes commandes » vous le renvoie.",
    p4: "Les fichiers numériques sont livrés tout de suite : avant de payer, vous demandez cet accès immédiat et reconnaissez perdre le droit de rétractation de 14 jours. Le détail figure dans les",
    cgv: "conditions de vente",
    version: `Version ${VERSION_LICENCE}.`,
  },
  en: {
    titre: "Licenses",
    description: "What you can and cannot do with a design bought from L'atelier sous la maison.",
    intro:
      "Every purchase gives you a license, not ownership of the pattern. The text in force on the day of purchase is copied into your certificate: it no longer changes for you, even if this page does.",
    pour: "For rediscovered patterns and atelier originals.",
    peut: "You may",
    pasPeut: "You may not",
    savoir: "Good to know",
    pratique: "In practice",
    p1: `After payment, an order page gives you your files and your certificate. Downloads stay open for ${JOURS_ACCES} days; the license itself never expires.`,
    p2: "Every certificate has a unique number that can be checked on the “Verify a certificate” page.",
    p3: "The link to your order is also sent to you by email. If you lose it, the “Find my orders” page sends it again.",
    p4: "Digital files are delivered immediately: before paying, you request this immediate access and acknowledge that you lose the 14-day right of withdrawal. Details are in the",
    cgv: "terms of sale",
    version: `Version ${VERSION_LICENCE}. This English text is a translation; the French version prevails.`,
  },
};

function BlocLicence({ licence, pour, l }: { licence: Licence; pour: string; l: Langue }) {
  const t = TEXTES_LICENCE[l];
  return (
    <section className="licence" aria-labelledby={`titre-${licence.type}`}>
      <h2 id={`titre-${licence.type}`}>{licence.nom}</h2>
      <p className="licence__pour">{pour}</p>
      <p>{licence.resume}</p>
      <h3>{t.peut}</h3>
      <ul className="licence__liste licence__liste--oui">
        {licence.permis.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <h3>{t.pasPeut}</h3>
      <ul className="licence__liste licence__liste--non">
        {licence.interdit.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <h3>{t.savoir}</h3>
      <ul className="licence__liste">
        {licence.mentions.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </section>
  );
}

export function PageLicence({ l }: { l: Langue }) {
  const t = TEXTES_LICENCE[l];
  const licences = l === "en" ? LICENCES_EN : LICENCES;
  return (
    <div className="contenu page-texte">
      <h1>{t.titre}</h1>
      <p className="page-texte__intro">{t.intro}</p>
      {/* La licence coloriage reste dans le code (commandes passées), mais le petit atelier n'est plus en vente. */}
      <BlocLicence licence={licences.standard} pour={t.pour} l={l} />
      <section className="licence" aria-labelledby="titre-pratique">
        <h2 id="titre-pratique">{t.pratique}</h2>
        <ul className="licence__liste">
          <li>{t.p1}</li>
          <li>{t.p2}</li>
          <li>{t.p3}</li>
          <li>
            {t.p4} <Link href={chemin("cgv", l)}>{t.cgv}</Link>.
          </li>
        </ul>
      </section>
      <p className="page-texte__version">{t.version}</p>
    </div>
  );
}
