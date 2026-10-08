import type { Metadata } from "next";
import { Marque, type Piste } from "@/components/Logo";

export const metadata: Metadata = { title: "Identité visuelle" };

const PISTES: { cle: Piste; nom: string; texte: string; retenue?: boolean }[] = [
  {
    cle: "racines",
    nom: "Les racines",
    texte: "Les fondations de la maison deviennent un ornement doré qui pousse sous terre. C'est la piste reprise dans la descente de l'accueil.",
    retenue: true,
  },
  {
    cle: "trappe",
    nom: "L'escalier",
    texte: "Un escalier descend de la maison vers une rosace dorée : on comprend tout de suite qu'il y a quelque chose en bas.",
  },
  {
    cle: "soupirail",
    nom: "Le soupirail",
    texte: "Une fenêtre de cave d'où filtre une lueur d'or. La piste la plus simple, la plus lisible en petit.",
  },
];

const TEINTES = [
  { nom: "Nuit", hex: "#171E33", role: "Fond du site, la nuit autour de la maison" },
  { nom: "Encre", hex: "#1B2238", role: "Texte sur papier, boutons sombres" },
  { nom: "Papier", hex: "#ECE2CB", role: "Cartels, texte sur fond de nuit" },
  { nom: "Or", hex: "#C9A44C", role: "Lumière de l'atelier, liens, prix" },
  { nom: "Or clair", hex: "#E9D08E", role: "Survol, lueur du soupirail" },
  { nom: "Garance", hex: "#9E2B25", role: "Accent rare, sur papier uniquement" },
];

export default function Identite() {
  return (
    <div className="contenu identite">
      <h1>Identité visuelle</h1>
      <p className="identite__intro">
        Page de travail pour valider la marque : les trois pistes de logo, les couleurs et les typographies.
      </p>

      <section aria-labelledby="titre-logo">
        <h2 id="titre-logo">Trois pistes de logo</h2>
        <p>Chaque piste est montrée sur fond de nuit, sur papier, puis avec le nom. Les racines sont retenues.</p>
        <ul className="pistes">
          {PISTES.map((p) => (
            <li key={p.cle} className={`piste${p.retenue ? " piste--retenue" : ""}`}>
              <div className="piste__fonds">
                <div className="piste__fond piste__fond--nuit">
                  <Marque piste={p.cle} titre={`${p.nom}, sur fond de nuit`} />
                </div>
                <div className="piste__fond piste__fond--papier">
                  <Marque piste={p.cle} titre={`${p.nom}, sur papier`} />
                </div>
              </div>
              <div className="piste__bloc">
                <Marque piste={p.cle} />
                <span>
                  L'atelier
                  <br />
                  sous la maison
                </span>
              </div>
              <div className="piste__texte">
                <h3>{p.nom}</h3>
                {p.retenue && <p className="piste__retenue">Piste retenue le 8 octobre 2026</p>}
                <p>{p.texte}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titre-couleurs-id">
        <h2 id="titre-couleurs-id">Couleurs</h2>
        <p>La nuit autour de la maison, l'or de l'atelier, le papier des cartels.</p>
        <ul className="palette">
          {TEINTES.map((t) => (
            <li key={t.hex}>
              <div className="palette__echantillon" style={{ background: t.hex }} />
              <strong>{t.nom}</strong>
              <span>{t.hex}</span>
              <span>{t.role}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titre-typo">
        <h2 id="titre-typo">Typographies</h2>
        <p>Une gravure ancienne pour les titres, une linéale des années 1920 pour le texte : l'ancien et l'inédit côte à côte.</p>
        <div className="specimen">
          <p className="specimen__nom">IM Fell French Canon, pour les titres</p>
          <p className="specimen__fell">Motifs retrouvés, motifs inédits</p>
        </div>
        <div className="specimen">
          <p className="specimen__nom">Jost, pour le texte et l'interface</p>
          <p className="specimen__jost">
            Chaque design est livré en haute définition, avec un carreau raccordable, un fichier vectoriel et un certificat de licence à votre nom.
          </p>
        </div>
      </section>

      <section aria-labelledby="titre-principes">
        <h2 id="titre-principes">Principes</h2>
        <p>Trois règles pour garder la marque cohérente.</p>
        <ul className="principes">
          <li>La nuit est le fond, l'or est la lumière : l'or ne sert qu'à ce qui mérite l'attention.</li>
          <li>Chaque design a son cartel en papier, comme une pièce de musée.</li>
          <li>Un seul effet spectaculaire, la descente de l'accueil. Le reste du site reste calme.</li>
        </ul>
      </section>
    </div>
  );
}
