import type { Metadata } from "next";
import "@fontsource/im-fell-french-canon/400.css";
import "@fontsource-variable/jost/wght.css";
import "./globals.css";
import { Logo } from "@/components/Logo";

// Page 404 commune aux deux langues (le site a une mise en page racine par langue).
export const metadata: Metadata = {
  title: "Page introuvable · Page not found, L'atelier sous la maison",
  robots: { index: false, follow: false },
};

export default function PageIntrouvable() {
  return (
    <html lang="fr">
      <body>
        <main id="contenu" className="contenu vide">
          <p style={{ marginBottom: 40 }}>
            <a href="/" className="entete__accueil" aria-label="L'atelier sous la maison, accueil">
              <Logo />
            </a>
          </p>
          <h1 className="section__titre">Cette page n'est pas dans l'atelier.</h1>
          <p style={{ marginTop: 16 }}>Le lien est peut-être ancien. Le catalogue complet est toujours accessible.</p>
          <a href="/explorer/" className="bouton bouton--or">
            Explorer l'atelier
          </a>
          <div lang="en" style={{ marginTop: 56 }}>
            <h2 className="section__titre">This page is not in the atelier.</h2>
            <p style={{ marginTop: 16 }}>The link may be old. The full catalogue is still available.</p>
            <a href="/en/explore/" className="bouton bouton--contour">
              Explore the atelier
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
