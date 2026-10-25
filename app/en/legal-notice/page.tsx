import type { Metadata } from "next";
import Link from "next/link";
import { AvisProjet, Champ, MiseAJour } from "@/components/legal/Legal";
import { chemin } from "@/lib/i18n";
import { EDITEUR, HEBERGEUR } from "@/lib/legal";
import { metaPage } from "@/lib/partage";

export const metadata: Metadata = metaPage({
  chemin: chemin("mentions", "en"),
  autre: chemin("mentions", "fr"),
  langue: "en",
  titre: "Legal notice",
  description: "Publisher, host and service providers of the L'atelier sous la maison website.",
});

export default function LegalNotice() {
  return (
    <div className="contenu page-texte legal">
      <h1>Legal notice</h1>
      <AvisProjet l="en" />

      <section aria-labelledby="titre-editeur">
        <h2 id="titre-editeur">Publisher</h2>
        <p>
          The website {EDITEUR.site.replace("https://", "")} is published by <Champ valeur={EDITEUR.nom} libelle="first name, last name, EI" l="en" />, a
          sole trader (entrepreneur individuel) operating under the trade name “{EDITEUR.enseigne}”.
        </p>
        <ul className="legal__fiche">
          <li>
            Address: <Champ valeur={EDITEUR.adresse} libelle="address" l="en" />
          </li>
          <li>
            Phone: <Champ valeur={EDITEUR.telephone} libelle="phone number" l="en" />
          </li>
          <li>
            Email: <a href={`mailto:${EDITEUR.email}`}>{EDITEUR.email}</a>
          </li>
          <li>
            SIRET: <Champ valeur={EDITEUR.siret} libelle="SIRET" l="en" />
          </li>
          {EDITEUR.immatriculation && <li>Registration: {EDITEUR.immatriculation}</li>}
          <li>
            VAT: <Champ valeur={EDITEUR.tva} libelle="VAT statement" l="en" />
          </li>
        </ul>
        <p>
          Publication director: <Champ valeur={EDITEUR.nom} libelle="first name, last name" l="en" />.
        </p>
      </section>

      <section aria-labelledby="titre-hebergeur">
        <h2 id="titre-hebergeur">Hosting</h2>
        <p>
          The website and its files are hosted by {HEBERGEUR.nom}, 101 Townsend St., San Francisco, CA 94107, United States, phone{" "}
          {HEBERGEUR.telephone}, <a href={HEBERGEUR.site}>{HEBERGEUR.site.replace("https://", "")}</a>.
        </p>
      </section>

      <section aria-labelledby="titre-prestataires">
        <h2 id="titre-prestataires">Payment and emails</h2>
        <p>
          Payments are processed by Link, a Stripe group service, which acts as the official seller (merchant of record): collection, receipts,
          invoices and taxes. Order emails are sent by Brevo (Sendinblue SAS), 17 rue de Salneuve, 75017 Paris, France; data is hosted in the
          European Union.
        </p>
      </section>

      <section aria-labelledby="titre-pi">
        <h2 id="titre-pi">Intellectual property</h2>
        <p>
          The texts, museum labels, previews, visual identity and atelier originals are protected. Reproducing them without permission is
          prohibited, except for the use allowed by the license purchased (see <Link href={chemin("licence", "en")}>the licenses</Link>).
        </p>
        <p>
          Rediscovered patterns reproduce public domain works held by museums; each design page gives the museum, the inventory number and a
          link to the original record. What is sold is the file restored by the atelier, not the original work itself. Atelier originals are
          created with the assistance of artificial intelligence.
        </p>
      </section>

      <section aria-labelledby="titre-credits">
        <h2 id="titre-credits">Credits</h2>
        <p>Typefaces: IM Fell French Canon and Jost, distributed under the SIL Open Font License.</p>
      </section>

      <section aria-labelledby="titre-liens">
        <h2 id="titre-liens">See also</h2>
        <p>
          <Link href={chemin("cgv", "en")}>Terms of sale</Link> · <Link href={chemin("confidentialite", "en")}>Privacy</Link> ·{" "}
          <Link href={chemin("licence", "en")}>Licenses</Link>
        </p>
      </section>
      <MiseAJour l="en" />
    </div>
  );
}
