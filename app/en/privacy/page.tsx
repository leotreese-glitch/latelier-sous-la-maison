import type { Metadata } from "next";
import Link from "next/link";
import { AvisProjet, Champ, MiseAJour } from "@/components/legal/Legal";
import { chemin } from "@/lib/i18n";
import { CONSERVATION_COMMANDES_ANS, EDITEUR, PRESTATAIRES } from "@/lib/legal";
import { metaPage } from "@/lib/partage";

export const metadata: Metadata = metaPage({
  chemin: chemin("confidentialite", "en"),
  autre: chemin("confidentialite", "fr"),
  langue: "en",
  titre: "Privacy",
  description: "What data L'atelier sous la maison processes, why, for how long, and your rights.",
});

export default function Privacy() {
  return (
    <div className="contenu page-texte legal">
      <h1>Privacy</h1>
      <p className="page-texte__intro">
        The atelier only collects what it needs to deliver your files and prove your license. No advertising, no audience measurement, no
        resale of data.
      </p>
      <AvisProjet l="en" />

      <section aria-labelledby="conf-1">
        <h2 id="conf-1">Data controller</h2>
        <p>
          <Champ valeur={EDITEUR.nom} libelle="first name, last name, EI" l="en" />, “{EDITEUR.enseigne}”, reachable at{" "}
          <a href={`mailto:${EDITEUR.email}`}>{EDITEUR.email}</a>. Other contact details are given in the{" "}
          <Link href={chemin("mentions", "en")}>legal notice</Link>.
        </p>
      </section>

      <section aria-labelledby="conf-2">
        <h2 id="conf-2">Data processed, why and for how long</h2>
        <h3>When you buy</h3>
        <p>
          Payment takes place on Link's page, which collects your payment details: the atelier never sees your card number. Once the payment is
          confirmed, Link sends the atelier your email address, your name, your country, the amount and the currency. The atelier adds the
          certificate number, the secret link to your order page, the date and time of your consent (terms of sale, waiver of withdrawal), the
          number of downloads and the language of the site used for the purchase.
        </p>
        <ul className="licence__liste">
          <li>
            To perform the sale: deliver the files, issue the certificate, send you the confirmation email and send your links again if you lose
            them (legal basis: the contract).
          </li>
          <li>
            To prove the license and your consent, and to keep the accounts (legal bases: the legitimate interest of the atelier and the buyer in
            proving the license; legal obligations).
          </li>
          <li>To inform the atelier of each sale with an internal email (legal basis: legitimate interest).</li>
        </ul>
        <p>This data is kept for {CONSERVATION_COMMANDES_ANS} years after the purchase, so that your license remains verifiable.</p>

        <h3>Public verification of certificates</h3>
        <p>
          Anyone who knows a certificate number can check it on the <Link href={chemin("certificat", "en")}>Verify a certificate</Link> page. They
          see the holder's name (or, failing that, a masked email address such as c***@example.com), the design, the date and the license. The
          number is only given to you: you choose whether to show it. You may ask for your name to be replaced by your masked address (legal
          basis: legitimate interest in proving the license).
        </p>

        <h3>“Find my orders”</h3>
        <p>
          The address you enter is only used to look up your orders and send you their links; it is not stored. To limit abuse, an encrypted,
          irreversible fingerprint of that address is kept, together with your IP address, for 24 hours at most.
        </p>

        <h3>Site security</h3>
        <p>
          Your IP address is used to block repeated attempts (request limits, protection of the administration area), then deleted
          automatically after 24 hours (legal basis: legitimate interest in protecting the site). The host also processes technical connection
          data to display and protect the site.
        </p>

        <h3>When you write to the atelier</h3>
        <p>
          Messages sent to {EDITEUR.email} are forwarded to the atelier's mailbox, hosted by Google (Gmail). They are kept for as long as needed
          to handle your request, then 3 years at most (legal basis: legitimate interest in replying to you, or the contract).
        </p>
      </section>

      <section aria-labelledby="conf-3">
        <h2 id="conf-3">Who receives your data</h2>
        <p>Only the atelier has access to it, with the following technical providers acting on its behalf:</p>
        <ul className="licence__liste">
          <li>Cloudflare: hosting of the site, the order database and the files, forwarding of incoming emails.</li>
          <li>{PRESTATAIRES.courriel.nom}: sending order emails; data hosted in the European Union.</li>
          <li>Google: the atelier's mailbox.</li>
        </ul>
        <p>
          Link, part of the Stripe group, processes payment data as a separate data controller, under its own{" "}
          <a href={PRESTATAIRES.paiement.confidentialite}>privacy policy</a>.
        </p>
        <p>
          Cloudflare and Google are American companies: data may be processed in the United States. These transfers are covered by the EU–US
          Data Privacy Framework, to which these companies adhere, and by the European Commission's standard contractual clauses.
        </p>
      </section>

      <section aria-labelledby="conf-4">
        <h2 id="conf-4">Cookies</h2>
        <p>
          The site sets no advertising or audience-measurement cookies, so no consent banner is needed. The atelier's only cookie is used to log
          in to the administration area and does not concern visitors. The host may set technical cookies that are strictly necessary for
          security. Link's payment page applies its own rules.
        </p>
      </section>

      <section aria-labelledby="conf-5">
        <h2 id="conf-5">Your rights</h2>
        <p>
          You may request access to your data, its rectification, erasure or portability, the restriction of its processing, or object to
          processing based on legitimate interest, by writing to <a href={`mailto:${EDITEUR.email}`}>{EDITEUR.email}</a>. The atelier replies
          within one month. Some data must however be kept to prove the sale or comply with the law. For payment data, contact Link.
        </p>
        <p>
          If you believe your rights are not respected, you may lodge a complaint with the CNIL, the French data protection authority (
          <a href="https://www.cnil.fr">cnil.fr</a>), or with the authority of your country.
        </p>
      </section>

      <MiseAJour l="en" />
    </div>
  );
}
