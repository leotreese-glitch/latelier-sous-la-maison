import type { Metadata } from "next";
import { metaPage } from "@/lib/partage";
import Link from "next/link";
import { AvisProjet, Champ, MiseAJour } from "@/components/legal/Legal";
import { CONSERVATION_COMMANDES_ANS, EDITEUR, PRESTATAIRES } from "@/lib/legal";

export const metadata: Metadata = metaPage({
  chemin: "/confidentialite/",
  titre: "Confidentialité",
  description: "Quelles données L'atelier sous la maison traite, pourquoi, combien de temps, et vos droits.",
});

export default function Confidentialite() {
  return (
    <div className="contenu page-texte legal">
      <h1>Confidentialité</h1>
      <p className="page-texte__intro">
        L'atelier ne collecte que ce qu'il faut pour vous livrer vos fichiers et prouver votre licence. Pas de publicité, pas de mesure
        d'audience, pas de revente de données.
      </p>
      <AvisProjet />

      <section aria-labelledby="conf-1">
        <h2 id="conf-1">Responsable du traitement</h2>
        <p>
          <Champ valeur={EDITEUR.nom} libelle="prénom, nom, EI" />, « {EDITEUR.enseigne} », joignable à{" "}
          <a href={`mailto:${EDITEUR.email}`}>{EDITEUR.email}</a>. Ses autres coordonnées figurent dans les{" "}
          <Link href="/mentions-legales/">mentions légales</Link>.
        </p>
      </section>

      <section aria-labelledby="conf-2">
        <h2 id="conf-2">Données traitées, pourquoi et combien de temps</h2>
        <h3>Quand vous achetez</h3>
        <p>
          Le paiement se fait sur la page de Link, qui recueille vos données de paiement : l'atelier ne voit jamais votre numéro de carte. Une
          fois le paiement confirmé, Link lui transmet votre adresse e-mail, votre nom, votre pays, le montant et la monnaie. L'atelier y ajoute
          le numéro de certificat, le lien secret de votre page de commande, la date et l'heure de votre accord (conditions de vente,
          renonciation à la rétractation) et le nombre de téléchargements.
        </p>
        <ul className="licence__liste">
          <li>
            Pour exécuter la vente : livrer les fichiers, établir le certificat, vous envoyer l'e-mail de confirmation et vous renvoyer vos
            liens si vous les perdez (base légale : le contrat).
          </li>
          <li>
            Pour prouver la licence et votre accord, et tenir la comptabilité (bases légales : l'intérêt légitime de l'atelier et de l'acheteur
            à prouver la licence ; les obligations légales).
          </li>
          <li>Pour informer l'atelier de chaque vente par un e-mail interne (base légale : l'intérêt légitime).</li>
        </ul>
        <p>
          Ces données sont conservées {CONSERVATION_COMMANDES_ANS} ans après l'achat, pour que votre licence reste vérifiable.
        </p>

        <h3>La vérification publique des certificats</h3>
        <p>
          Toute personne qui connaît un numéro de certificat peut le vérifier sur la page <Link href="/certificat/">Vérifier un certificat</Link>.
          Elle y voit le nom du titulaire (ou, à défaut, son adresse e-mail masquée, comme c***@exemple.fr), le design, la date et la licence.
          Ce numéro n'est communiqué qu'à vous : c'est vous qui choisissez de le montrer. Vous pouvez demander que votre nom soit remplacé par
          votre adresse masquée (base légale : l'intérêt légitime à prouver la licence).
        </p>

        <h3>« Retrouver mes commandes »</h3>
        <p>
          L'adresse saisie sert uniquement à chercher vos commandes et à vous envoyer leurs liens ; elle n'est pas enregistrée. Pour limiter
          les abus, une empreinte chiffrée et irréversible de cette adresse est gardée, avec votre adresse IP, pendant 24 heures au plus.
        </p>

        <h3>Sécurité du site</h3>
        <p>
          Votre adresse IP est utilisée pour bloquer les tentatives répétées (limite de demandes, protection de l'administration), puis
          effacée automatiquement après 24 heures (base légale : l'intérêt légitime à protéger le site). L'hébergeur traite aussi des données
          techniques de connexion pour afficher et protéger le site.
        </p>

        <h3>Quand vous écrivez à l'atelier</h3>
        <p>
          Les messages envoyés à {EDITEUR.email} sont transférés vers la messagerie de l'atelier, hébergée par Google (Gmail). Ils sont gardés
          le temps de traiter votre demande, puis 3 ans au plus (base légale : l'intérêt légitime à vous répondre, ou le contrat).
        </p>
      </section>

      <section aria-labelledby="conf-3">
        <h2 id="conf-3">Qui reçoit vos données</h2>
        <p>Seul l'atelier y a accès, avec les prestataires techniques suivants, qui agissent pour son compte :</p>
        <ul className="licence__liste">
          <li>Cloudflare : hébergement du site, de la base des commandes et des fichiers, transfert des e-mails reçus.</li>
          <li>{PRESTATAIRES.courriel.nom} : envoi des e-mails de commande ; données hébergées dans l'Union européenne.</li>
          <li>Google : messagerie de l'atelier.</li>
        </ul>
        <p>
          Link, du groupe Stripe, traite les données de paiement en tant que responsable de traitement distinct, selon sa propre{" "}
          <a href={PRESTATAIRES.paiement.confidentialite}>politique de confidentialité</a>.
        </p>
        <p>
          Cloudflare et Google sont des sociétés américaines : des données peuvent être traitées aux États-Unis. Ces transferts sont encadrés
          par le cadre de protection des données UE–États-Unis (Data Privacy Framework), auquel ces sociétés adhèrent, et par les clauses
          contractuelles types de la Commission européenne.
        </p>
      </section>

      <section aria-labelledby="conf-4">
        <h2 id="conf-4">Cookies</h2>
        <p>
          Le site ne dépose aucun cookie publicitaire ni de mesure d'audience : aucun bandeau de consentement n'est donc nécessaire. Le seul
          cookie de l'atelier sert à la connexion de l'administration et ne concerne pas les visiteurs. L'hébergeur peut déposer des cookies
          techniques strictement nécessaires à la sécurité. La page de paiement de Link applique ses propres règles.
        </p>
      </section>

      <section aria-labelledby="conf-5">
        <h2 id="conf-5">Vos droits</h2>
        <p>
          Vous pouvez demander l'accès à vos données, leur rectification, leur effacement, leur portabilité, la limitation de leur traitement,
          ou vous opposer à un traitement fondé sur l'intérêt légitime, en écrivant à <a href={`mailto:${EDITEUR.email}`}>{EDITEUR.email}</a>.
          L'atelier répond dans un délai d'un mois. Certaines données doivent toutefois être gardées pour prouver la vente ou respecter la loi.
          Pour les données de paiement, adressez-vous à Link.
        </p>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la CNIL (<a href="https://www.cnil.fr">cnil.fr</a>).
        </p>
      </section>

      <MiseAJour />
    </div>
  );
}
