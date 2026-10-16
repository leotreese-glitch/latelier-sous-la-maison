import type { Metadata } from "next";
import { metaPage } from "@/lib/partage";
import Link from "next/link";
import { AvisProjet, Champ, MiseAJour } from "@/components/legal/Legal";
import { EDITEUR, MEDIATEUR, PRESTATAIRES, VERSION_CGV } from "@/lib/legal";
import { JOURS_ACCES } from "@/lib/licence";

export const metadata: Metadata = metaPage({
  chemin: "/conditions-de-vente/",
  titre: "Conditions de vente",
  description: "Conditions de vente des licences et fichiers de L'atelier sous la maison : commande, livraison, rétractation, garanties.",
});

const SUPPORT_LINK = "https://support.link.com/topics/sold-through-link";

export default function ConditionsDeVente() {
  return (
    <div className="contenu page-texte legal">
      <h1>Conditions de vente</h1>
      <p className="page-texte__intro">
        Ces conditions s'appliquent à tout achat fait sur {EDITEUR.site.replace("https://", "")}. Vous les acceptez en cochant la case prévue
        avant de payer ; la version en vigueur ce jour-là reste celle de votre achat.
      </p>
      <AvisProjet />

      <section aria-labelledby="cgv-1">
        <h2 id="cgv-1">1. Qui intervient</h2>
        <p>
          Les fichiers et les licences sont fournis par <Champ valeur={EDITEUR.nom} libelle="prénom, nom, EI" />, entrepreneur individuel
          exerçant sous le nom « {EDITEUR.enseigne} » (ci-après « l'atelier »), dont les coordonnées figurent dans les{" "}
          <Link href="/mentions-legales/">mentions légales</Link>.
        </p>
        <p>
          Le paiement est traité par {PRESTATAIRES.paiement.nom}, qui agit comme vendeur officiel (« merchant of record ») : c'est Link qui
          encaisse le paiement, calcule et reverse les taxes, vous adresse le reçu et la facture, et traite les demandes liées à la transaction
          elle-même. Ses propres conditions, affichées sur la page de paiement, s'appliquent au paiement. Les présentes conditions régissent les
          fichiers, la licence, la livraison et vos garanties.
        </p>
      </section>

      <section aria-labelledby="cgv-2">
        <h2 id="cgv-2">2. Ce qui est vendu</h2>
        <p>
          L'atelier vend des contenus numériques : des fichiers images en haute définition, sans filigrane, accompagnés d'une licence
          d'utilisation et d'un certificat numéroté. Aucun objet n'est expédié.
        </p>
        <ul className="licence__liste">
          <li>
            Les <strong>motifs retrouvés</strong> sont des restaurations de tissus anciens du domaine public ; les <strong>créations de
            l'atelier</strong> sont des motifs originaux réalisés avec l'assistance de l'intelligence artificielle. Tous deux sont vendus avec la{" "}
            <Link href="/licence/">licence standard</Link>.
          </li>
          <li>
            Les <strong>pochettes du petit atelier</strong> réunissent des dessins à colorier et sont vendues avec la{" "}
            <Link href="/licence/">licence coloriage</Link>.
          </li>
          <li>
            Certains motifs sont proposés en <strong>édition limitée</strong> : le nombre de licences est fixé à l'avance, le prix monte par
            paliers et le motif est retiré de la vente une fois l'édition épuisée.
          </li>
        </ul>
        <p>
          La page de chaque design indique le format du fichier livré, ses dimensions en pixels et la taille d'impression correspondante. Les
          fichiers sont dans des formats d'image courants, lisibles par les logiciels de dessin, de mise en page et d'impression usuels, et ne
          comportent aucune protection technique. Les aperçus du site sont réduits ; les couleurs peuvent varier selon l'écran, le papier ou
          l'imprimante.
        </p>
        <p>
          Une licence n'est pas une cession de droits : elle n'est ni exclusive ni transférable, et l'atelier peut vendre le même design à
          d'autres acheteurs. Son contenu exact figure sur la page <Link href="/licence/">Licences</Link> et est recopié dans votre certificat.
        </p>
      </section>

      <section aria-labelledby="cgv-3">
        <h2 id="cgv-3">3. Prix</h2>
        <p>
          Les prix sont affichés en euros ou en dollars américains, toutes taxes comprises. Selon votre pays, la page de paiement de Link peut
          vous présenter le prix converti dans votre monnaie locale. Le montant affiché sur la page de paiement, au moment où vous validez, est
          celui qui vous est facturé. Il n'y a pas de frais de livraison.
        </p>
      </section>

      <section aria-labelledby="cgv-4">
        <h2 id="cgv-4">4. Commande et paiement</h2>
        <ol className="legal__etapes">
          <li>Sur la page du design, vous choisissez la monnaie d'affichage et lisez la licence.</li>
          <li>
            Vous cochez deux cases distinctes : l'une pour accepter les présentes conditions et la licence, l'autre pour demander l'accès
            immédiat aux fichiers en reconnaissant perdre votre droit de rétractation (voir l'article 6).
          </li>
          <li>Vous êtes dirigé vers la page de paiement sécurisée de Link, où figurent le récapitulatif et le prix total.</li>
          <li>
            Vous saisissez votre adresse e-mail et votre moyen de paiement (carte bancaire, Apple Pay, Google Pay, Link ou un moyen de paiement
            local selon votre pays), puis vous validez le paiement.
          </li>
        </ol>
        <p>
          Le contrat est conclu dès la confirmation du paiement. Vous recevez aussitôt une page de commande et un e-mail de confirmation qui
          récapitule votre achat et votre accord. Les données bancaires sont saisies sur la page de Link et ne transitent jamais par le site de
          l'atelier. Le contrat est conclu en français.
        </p>
      </section>

      <section aria-labelledby="cgv-5">
        <h2 id="cgv-5">5. Livraison des fichiers</h2>
        <p>
          Les fichiers sont livrés immédiatement après le paiement, sur votre page de commande. Le lien de cette page vous est envoyé par
          e-mail ; il est personnel. Les téléchargements y restent ouverts {JOURS_ACCES} jours après l'achat, et chaque lien de téléchargement
          généré sur la page est valable une heure. Pensez à enregistrer vos fichiers : la licence, elle, n'expire pas.
        </p>
        <p>
          Si vous perdez le lien, la page <Link href="/commande/retrouver/">Retrouver mes commandes</Link> vous le renvoie. Si un problème
          technique vous empêche de télécharger vos fichiers, écrivez à l'atelier : il vous les fournira par un autre moyen.
        </p>
      </section>

      <section aria-labelledby="cgv-6">
        <h2 id="cgv-6">6. Droit de rétractation</h2>
        <p>
          Le droit de rétractation de 14 jours ne s'applique pas à la fourniture d'un contenu numérique sans support matériel lorsque cette
          fourniture a commencé avec l'accord préalable et exprès du consommateur, qui a reconnu perdre ce droit (article L221-28, 13°, du Code
          de la consommation).
        </p>
        <p>
          Les fichiers étant mis à votre disposition dès le paiement, l'achat n'est possible qu'après avoir coché la case par laquelle vous
          demandez cet accès immédiat et reconnaissez perdre votre droit de rétractation. La date et l'heure de cet accord sont enregistrées et
          rappelées dans l'e-mail de confirmation de commande. Cela ne retire rien à vos garanties légales (article 7).
        </p>
      </section>

      <section aria-labelledby="cgv-7">
        <h2 id="cgv-7">7. Garantie légale de conformité</h2>
        <div className="legal__encadre">
          <p>
            Vous bénéficiez de la garantie légale de conformité des contenus numériques (articles L224-25-1 à L224-25-31 du Code de la
            consommation). Pour un contenu fourni en une seule fois, comme les fichiers de l'atelier, vous disposez de deux ans à compter de
            la fourniture pour la faire jouer. Pendant les douze premiers mois, vous n'avez pas à prouver que le défaut existait au moment de
            la fourniture.
          </p>
          <p>
            Vous pouvez demander la mise en conformité du fichier, gratuitement et sans délai injustifié. Si elle est impossible, refusée,
            trop tardive ou sans effet, vous pouvez obtenir une réduction du prix ou, sauf défaut mineur, la résolution du contrat avec
            remboursement intégral. Un défaut grave ouvre droit directement à la réduction du prix ou à la résolution.
          </p>
          <p>
            Vous bénéficiez aussi de la garantie des vices cachés (articles 1641 à 1649 du Code civil), pendant deux ans à compter de la
            découverte du défaut.
          </p>
        </div>
        <p>
          Concrètement : si un fichier est illisible, incomplet, de dimensions inférieures à celles annoncées ou ne correspond pas à sa
          description, écrivez à <a href={`mailto:${EDITEUR.email}`}>{EDITEUR.email}</a> avec votre numéro de certificat.
        </p>
      </section>

      <section aria-labelledby="cgv-8">
        <h2 id="cgv-8">8. Licence, certificat et propriété intellectuelle</h2>
        <p>
          L'achat vous donne la licence correspondant au design, telle que décrite sur la page <Link href="/licence/">Licences</Link> le jour de
          l'achat. Le certificat de licence, numéroté, fait foi ; chacun peut en vérifier la validité sur la page{" "}
          <Link href="/certificat/">Vérifier un certificat</Link>. Tout usage hors de la licence est interdit.
        </p>
        <p>
          Les motifs retrouvés reproduisent des œuvres du domaine public : la licence porte sur le fichier restauré par l'atelier, sans aucune
          exclusivité sur l'œuvre ancienne. Les créations de l'atelier étant réalisées avec l'assistance de l'intelligence artificielle, aucune
          exclusivité ni protection par le droit d'auteur n'est garantie.
        </p>
      </section>

      <section aria-labelledby="cgv-9">
        <h2 id="cgv-9">9. Remboursement</h2>
        <p>
          En dehors des garanties légales, un remboursement peut être accordé à titre commercial par l'atelier ou par Link. Tout remboursement
          annule la licence : le certificat est alors indiqué comme non valide et les téléchargements sont fermés. Vous devez cesser d'utiliser
          les fichiers et les supprimer.
        </p>
      </section>

      <section aria-labelledby="cgv-10">
        <h2 id="cgv-10">10. Responsabilité</h2>
        <p>
          Il vous appartient de vérifier, avant l'achat, que le format et les dimensions du fichier conviennent à l'usage que vous prévoyez, et
          de respecter la licence. L'atelier n'est pas responsable de l'usage que vous faites des fichiers, ni des différences de rendu dues à
          l'impression ou au support. Rien dans ces conditions ne limite vos droits de consommateur ni les garanties légales.
        </p>
      </section>

      <section aria-labelledby="cgv-11">
        <h2 id="cgv-11">11. Service client et réclamations</h2>
        <p>
          Pour toute question sur les fichiers, la licence ou le certificat : <a href={`mailto:${EDITEUR.email}`}>{EDITEUR.email}</a>. Pour une
          question sur le paiement lui-même (reçu, facture, prélèvement, remboursement par Link) :{" "}
          <a href={SUPPORT_LINK}>l'assistance de Link</a>.
        </p>
      </section>

      <section aria-labelledby="cgv-12">
        <h2 id="cgv-12">12. Médiation</h2>
        <p>
          En cas de litige, adressez d'abord une réclamation écrite à l'atelier. Si elle n'aboutit pas, vous pouvez recourir gratuitement au
          médiateur de la consommation : <Champ valeur={MEDIATEUR.nom} libelle="nom du médiateur" />,{" "}
          <Champ valeur={MEDIATEUR.adresse} libelle="adresse du médiateur" />,{" "}
          {MEDIATEUR.site ? <a href={MEDIATEUR.site}>{MEDIATEUR.site.replace(/^https?:\/\//, "")}</a> : <Champ valeur="" libelle="site du médiateur" />}
          . Vous devez le saisir dans l'année qui suit votre réclamation écrite.
        </p>
      </section>

      <section aria-labelledby="cgv-13">
        <h2 id="cgv-13">13. Données personnelles</h2>
        <p>
          Les données nécessaires à la commande sont traitées comme expliqué dans la page{" "}
          <Link href="/confidentialite/">Confidentialité</Link>.
        </p>
      </section>

      <section aria-labelledby="cgv-14">
        <h2 id="cgv-14">14. Droit applicable</h2>
        <p>
          Ces conditions sont soumises au droit français. Si vous résidez dans un autre pays, vous conservez la protection des règles
          impératives de votre pays. En cas de litige, vous pouvez saisir à votre choix l'une des juridictions territorialement compétentes en
          vertu du Code de procédure civile, ou celle du lieu où vous demeuriez au moment de la conclusion du contrat.
        </p>
      </section>

      <MiseAJour version={VERSION_CGV} />
    </div>
  );
}
