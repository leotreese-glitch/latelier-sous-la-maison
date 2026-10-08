import Link from "next/link";

export default function Introuvable() {
  return (
    <div className="contenu vide">
      <h1 className="section__titre">Cette page n'est pas dans l'atelier.</h1>
      <p style={{ marginTop: 16 }}>Le lien est peut-être ancien. Le catalogue complet est toujours accessible.</p>
      <Link href="/explorer/" className="bouton bouton--or">
        Explorer l'atelier
      </Link>
    </div>
  );
}
