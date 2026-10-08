import type { Design } from "@/lib/catalogue";

/** Le motif appliqué sur quatre objets. Les ombres donnent le volume, le motif reste net. */
export function VoirSur({ d }: { d: Design }) {
  const id = d.id;
  const tuile = d.famille === "petit-atelier" ? 200 : 96;
  const hauteur = Math.round(tuile * d.ratio);
  const motif = (cle: string, echelle = 1) => (
    <pattern id={`${id}-${cle}`} width={tuile * echelle} height={hauteur * echelle} patternUnits="userSpaceOnUse">
      <image href={d.image} width={tuile * echelle} height={hauteur * echelle} preserveAspectRatio="xMidYMid slice" />
    </pattern>
  );

  return (
    <ul className="voir-sur" aria-label="Le motif sur des objets">
      <li>
        <figure>
          <svg viewBox="0 0 200 220" role="img" aria-label={`${d.titre} sur un tissu drapé`}>
            <defs>
              {motif("tissu", 0.8)}
              <linearGradient id={`${id}-plis`} x1="0" x2="1">
                <stop offset="0" stopColor="#000" stopOpacity="0.35" />
                <stop offset="0.18" stopColor="#fff" stopOpacity="0.12" />
                <stop offset="0.34" stopColor="#000" stopOpacity="0.28" />
                <stop offset="0.52" stopColor="#fff" stopOpacity="0.14" />
                <stop offset="0.7" stopColor="#000" stopOpacity="0.3" />
                <stop offset="0.86" stopColor="#fff" stopOpacity="0.1" />
                <stop offset="1" stopColor="#000" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            <rect x="24" y="22" width="152" height="5" rx="2.5" fill="#8a7a55" />
            <path d="M30 26 H170 L176 186 Q160 200 146 188 Q130 202 114 189 Q98 203 82 189 Q66 202 50 188 Q36 199 24 186 Z" fill={`url(#${id}-tissu)`} />
            <path d="M30 26 H170 L176 186 Q160 200 146 188 Q130 202 114 189 Q98 203 82 189 Q66 202 50 188 Q36 199 24 186 Z" fill={`url(#${id}-plis)`} />
          </svg>
          <figcaption>Tissu</figcaption>
        </figure>
      </li>
      <li>
        <figure>
          <svg viewBox="0 0 200 220" role="img" aria-label={`${d.titre} sur un coussin`}>
            <defs>
              {motif("coussin", 0.7)}
              <radialGradient id={`${id}-volume`} cx="0.45" cy="0.4" r="0.7">
                <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
                <stop offset="0.6" stopColor="#000" stopOpacity="0" />
                <stop offset="1" stopColor="#000" stopOpacity="0.45" />
              </radialGradient>
            </defs>
            <ellipse cx="100" cy="186" rx="78" ry="9" fill="#000" opacity="0.35" />
            <path d="M30 46 Q100 34 170 46 Q182 112 170 178 Q100 190 30 178 Q18 112 30 46 Z" fill={`url(#${id}-coussin)`} />
            <path d="M30 46 Q100 34 170 46 Q182 112 170 178 Q100 190 30 178 Q18 112 30 46 Z" fill={`url(#${id}-volume)`} stroke="#000" strokeOpacity="0.25" />
          </svg>
          <figcaption>Coussin</figcaption>
        </figure>
      </li>
      <li>
        <figure>
          <svg viewBox="0 0 200 220" role="img" aria-label={`${d.titre} sur la couverture d'un carnet`}>
            <defs>
              {motif("carnet", 0.6)}
              <linearGradient id={`${id}-reliure`} x1="0" x2="1">
                <stop offset="0" stopColor="#000" stopOpacity="0.45" />
                <stop offset="0.12" stopColor="#000" stopOpacity="0.1" />
                <stop offset="1" stopColor="#000" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect x="52" y="32" width="112" height="164" rx="5" fill="#000" opacity="0.3" transform="translate(5 5)" />
            <rect x="52" y="32" width="112" height="164" rx="5" fill={`url(#${id}-carnet)`} />
            <rect x="52" y="32" width="112" height="164" rx="5" fill={`url(#${id}-reliure)`} />
            <rect x="146" y="32" width="6" height="164" fill="#1b2238" opacity="0.85" />
            <rect x="72" y="140" width="72" height="26" rx="2" fill="#ece2cb" opacity="0.92" />
            <path d="M80 150 H136 M80 157 H118" stroke="#1b2238" strokeOpacity="0.5" strokeWidth="2" />
          </svg>
          <figcaption>Carnet</figcaption>
        </figure>
      </li>
      <li>
        <figure>
          <svg viewBox="0 0 200 220" role="img" aria-label={`${d.titre} en papier peint`}>
            <defs>
              {motif("mur", 0.55)}
              <linearGradient id={`${id}-jour`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
                <stop offset="1" stopColor="#000" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="200" height="186" fill={`url(#${id}-mur)`} />
            <rect x="0" y="0" width="200" height="186" fill={`url(#${id}-jour)`} />
            <rect x="0" y="186" width="200" height="34" fill="#3a3027" />
            <rect x="0" y="180" width="200" height="8" fill="#ece2cb" />
            <path d="M58 180 V140 H142 V180 M64 140 V180 M136 140 V180" fill="none" stroke="#1b2238" strokeWidth="5" />
            <rect x="54" y="132" width="92" height="9" fill="#1b2238" />
            <path d="M92 132 C86 116 90 104 100 98 C110 104 114 116 108 132 Z" fill="#9e2b25" />
          </svg>
          <figcaption>Papier peint</figcaption>
        </figure>
      </li>
    </ul>
  );
}
