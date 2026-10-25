import type { Metadata } from "next";
import Link from "next/link";
import { AvisProjet, Champ, MiseAJour } from "@/components/legal/Legal";
import { chemin } from "@/lib/i18n";
import { EDITEUR, MEDIATEUR, VERSION_CGV } from "@/lib/legal";
import { JOURS_ACCES } from "@/lib/licence";
import { metaPage } from "@/lib/partage";

export const metadata: Metadata = metaPage({
  chemin: chemin("cgv", "en"),
  autre: chemin("cgv", "fr"),
  langue: "en",
  titre: "Terms of sale",
  description: "Terms of sale for the licenses and files of L'atelier sous la maison: ordering, delivery, withdrawal, guarantees.",
});

const SUPPORT_LINK = "https://support.link.com/topics/sold-through-link";

export default function Terms() {
  return (
    <div className="contenu page-texte legal">
      <h1>Terms of sale</h1>
      <p className="page-texte__intro">
        These terms apply to every purchase made on {EDITEUR.site.replace("https://", "")}. You accept them by ticking the box provided before
        paying; the version in force on that day remains the one for your purchase.
      </p>
      <AvisProjet l="en" />

      <section aria-labelledby="cgv-1">
        <h2 id="cgv-1">1. Who is involved</h2>
        <p>
          The files and licenses are supplied by <Champ valeur={EDITEUR.nom} libelle="first name, last name, EI" l="en" />, a sole trader
          (entrepreneur individuel) operating under the trade name “{EDITEUR.enseigne}” (hereinafter “the atelier”), whose details are given in
          the <Link href={chemin("mentions", "en")}>legal notice</Link>.
        </p>
        <p>
          Payment is processed by Link, a Stripe group service, which acts as the official seller (merchant of record): Link collects the
          payment, calculates and remits taxes, sends you the receipt and the invoice, and handles requests about the transaction itself. Its
          own terms, shown on the payment page, apply to the payment. These terms govern the files, the license, delivery and your guarantees.
        </p>
      </section>

      <section aria-labelledby="cgv-2">
        <h2 id="cgv-2">2. What is sold</h2>
        <p>
          The atelier sells digital content: high-definition image files, without watermark, with a license of use and a numbered certificate.
          No physical item is shipped.
        </p>
        <ul className="licence__liste">
          <li>
            <strong>Rediscovered patterns</strong> are restorations of old public domain textiles and artworks; <strong>atelier originals</strong>{" "}
            are original patterns created with the assistance of artificial intelligence. Both are sold with the{" "}
            <Link href={chemin("licence", "en")}>standard license</Link>.
          </li>
          <li>
            Some patterns are offered as a <strong>limited edition</strong>: the number of licenses is set in advance, the price rises in steps
            and the pattern is withdrawn from sale once the edition is sold out.
          </li>
        </ul>
        <p>
          Each design page states the format of the file delivered, its dimensions in pixels and the matching print size. Files come in common
          image formats, readable by usual drawing, layout and printing software, and carry no technical protection. Previews on the site are
          reduced; colours may vary with the screen, the paper or the printer.
        </p>
        <p>
          A license is not a transfer of rights: it is neither exclusive nor transferable, and the atelier may sell the same design to other
          buyers. Its exact content is shown on the <Link href={chemin("licence", "en")}>Licenses</Link> page and copied into your certificate.
        </p>
      </section>

      <section aria-labelledby="cgv-3">
        <h2 id="cgv-3">3. Prices</h2>
        <p>
          Prices are shown in euros or US dollars, including all taxes. Depending on your country, Link's payment page may show you the price
          converted into your local currency. The amount shown on the payment page when you confirm is the amount charged. There are no
          delivery costs.
        </p>
      </section>

      <section aria-labelledby="cgv-4">
        <h2 id="cgv-4">4. Ordering and payment</h2>
        <ol className="legal__etapes">
          <li>On the design page, you choose the display currency and read the license.</li>
          <li>
            You tick two separate boxes: one to accept these terms and the license, the other to request immediate access to the files while
            acknowledging that you lose your right of withdrawal (see section 6).
          </li>
          <li>You are taken to Link's secure payment page, which shows the summary and the total price.</li>
          <li>
            You enter your email address and your payment method (bank card, Apple Pay, Google Pay, Link or a local payment method depending on
            your country), then confirm the payment.
          </li>
        </ol>
        <p>
          The contract is concluded as soon as the payment is confirmed. You immediately receive an order page and a confirmation email that
          sums up your purchase and your consent. Card details are entered on Link's page and never pass through the atelier's site. These terms
          are originally written in French; this English version is a translation, and the French version prevails.
        </p>
      </section>

      <section aria-labelledby="cgv-5">
        <h2 id="cgv-5">5. Delivery of the files</h2>
        <p>
          Files are delivered immediately after payment, on your order page. The link to that page is sent to you by email; it is personal.
          Downloads stay open for {JOURS_ACCES} days after purchase, and each download link generated on the page is valid for one hour.
          Remember to save your files: the license itself never expires.
        </p>
        <p>
          If you lose the link, the <Link href={chemin("retrouver", "en")}>Find my orders</Link> page sends it to you again. If a technical problem
          prevents you from downloading your files, write to the atelier: it will provide them another way.
        </p>
      </section>

      <section aria-labelledby="cgv-6">
        <h2 id="cgv-6">6. Right of withdrawal</h2>
        <p>
          The 14-day right of withdrawal does not apply to the supply of digital content not on a physical medium once that supply has begun
          with the consumer's prior express consent and acknowledgement that the right is lost (article L221-28, 13°, of the French Consumer
          Code).
        </p>
        <p>
          Since the files are made available as soon as you pay, a purchase is only possible after ticking the box by which you request this
          immediate access and acknowledge losing your right of withdrawal. The date and time of this consent are recorded and repeated in the
          order confirmation email. This takes nothing away from your legal guarantees (section 7).
        </p>
      </section>

      <section aria-labelledby="cgv-7">
        <h2 id="cgv-7">7. Legal guarantee of conformity</h2>
        <div className="legal__encadre">
          <p>
            You benefit from the legal guarantee of conformity for digital content (articles L224-25-1 to L224-25-31 of the French Consumer
            Code). For content supplied in a single act, such as the atelier's files, you have two years from supply to invoke it. During the
            first twelve months, you do not have to prove that the defect existed at the time of supply.
          </p>
          <p>
            You may ask for the file to be brought into conformity, free of charge and without undue delay. If this is impossible, refused, too
            late or ineffective, you may obtain a price reduction or, except for a minor defect, the termination of the contract with a full
            refund. A serious defect gives a direct right to a price reduction or termination.
          </p>
          <p>
            You also benefit from the guarantee against hidden defects (articles 1641 to 1649 of the French Civil Code), for two years from the
            discovery of the defect.
          </p>
        </div>
        <p>
          In practice: if a file is unreadable, incomplete, smaller than stated or does not match its description, write to{" "}
          <a href={`mailto:${EDITEUR.email}`}>{EDITEUR.email}</a> with your certificate number.
        </p>
      </section>

      <section aria-labelledby="cgv-8">
        <h2 id="cgv-8">8. License, certificate and intellectual property</h2>
        <p>
          Your purchase gives you the license for the design, as described on the <Link href={chemin("licence", "en")}>Licenses</Link> page on the
          day of purchase. The numbered license certificate is the proof of your rights; anyone can check its validity on the{" "}
          <Link href={chemin("certificat", "en")}>Verify a certificate</Link> page. Any use outside the license is prohibited.
        </p>
        <p>
          Rediscovered patterns reproduce public domain works: the license covers the file restored by the atelier, with no exclusivity over the
          original work. Since atelier originals are created with the assistance of artificial intelligence, no exclusivity or copyright
          protection is guaranteed.
        </p>
      </section>

      <section aria-labelledby="cgv-9">
        <h2 id="cgv-9">9. Refunds</h2>
        <p>
          Apart from the legal guarantees, a refund may be granted as a commercial gesture by the atelier or by Link. Any refund cancels the
          license: the certificate is then shown as invalid and downloads are closed. You must stop using the files and delete them.
        </p>
      </section>

      <section aria-labelledby="cgv-10">
        <h2 id="cgv-10">10. Liability</h2>
        <p>
          It is up to you to check, before buying, that the format and dimensions of the file suit your intended use, and to comply with the
          license. The atelier is not responsible for the use you make of the files, nor for differences in rendering due to printing or the
          medium. Nothing in these terms limits your consumer rights or the legal guarantees.
        </p>
      </section>

      <section aria-labelledby="cgv-11">
        <h2 id="cgv-11">11. Customer service and complaints</h2>
        <p>
          For any question about the files, the license or the certificate: <a href={`mailto:${EDITEUR.email}`}>{EDITEUR.email}</a>. For a
          question about the payment itself (receipt, invoice, charge, refund by Link): <a href={SUPPORT_LINK}>Link support</a>.
        </p>
      </section>

      <section aria-labelledby="cgv-12">
        <h2 id="cgv-12">12. Mediation</h2>
        <p>
          In the event of a dispute, first send a written complaint to the atelier. If it is not resolved, you may refer the matter free of charge
          to the consumer mediator: <Champ valeur={MEDIATEUR.nom} libelle="mediator's name" l="en" />,{" "}
          <Champ valeur={MEDIATEUR.adresse} libelle="mediator's address" l="en" />,{" "}
          {MEDIATEUR.site ? (
            <a href={MEDIATEUR.site}>{MEDIATEUR.site.replace(/^https?:\/\//, "")}</a>
          ) : (
            <Champ valeur="" libelle="mediator's website" l="en" />
          )}
          . You must do so within one year of your written complaint.
        </p>
      </section>

      <section aria-labelledby="cgv-13">
        <h2 id="cgv-13">13. Personal data</h2>
        <p>
          The data needed for your order is processed as explained on the <Link href={chemin("confidentialite", "en")}>Privacy</Link> page.
        </p>
      </section>

      <section aria-labelledby="cgv-14">
        <h2 id="cgv-14">14. Governing law</h2>
        <p>
          These terms are governed by French law. If you live in another country, you keep the protection of the mandatory rules of your
          country. In the event of a dispute, you may bring proceedings, at your choice, before one of the courts with territorial jurisdiction
          under the French Code of Civil Procedure, or before the court of the place where you lived when the contract was concluded.
        </p>
      </section>

      <MiseAJour version={VERSION_CGV} l="en" />
    </div>
  );
}
