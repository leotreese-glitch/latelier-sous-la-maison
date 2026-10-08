import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Introuvable() {
  return (
    <main id="contenu" className="contenu vide">
      <p style={{ marginBottom: 40 }}>
        <Link href="/" className="entete__accueil" aria-label="L'atelier sous la maison, accueil">
          <Logo />
        </Link>
      </p>
      <h1 className="section__titre">Cette page n'est pas dans l'atelier.</h1>
      <p style={{ marginTop: 16 }}>Le lien est peut-être ancien. Le catalogue complet est toujours accessible.</p>
      <Link href="/explorer/" className="bouton bouton--or">
        Explorer l'atelier
      </Link>
    </main>
  );
}
