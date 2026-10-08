import { useId } from "react";

export type Piste = "racines" | "trappe" | "soupirail";

type Props = {
  piste?: Piste;
  className?: string;
  titre?: string;
};

const MAISON = "M8 31 L32 10 L56 31 M14 27 V52 H50 V27";
const PORTE = "M28 52 V43 H36 V52";

/** Marque de L'atelier sous la maison. Le trait suit la couleur du texte, l'or reste l'or. */
export function Marque({ piste = "racines", className, titre }: Props) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 64 82"
      className={className}
      role={titre ? "img" : undefined}
      aria-label={titre}
      aria-hidden={titre ? undefined : true}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {piste === "soupirail" && (
        <defs>
          <radialGradient id={`${id}-lueur`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="var(--or-clair)" stopOpacity="0.85" />
            <stop offset="1" stopColor="var(--or)" stopOpacity="0" />
          </radialGradient>
        </defs>
      )}
      {piste === "soupirail" && <circle cx="44" cy="55" r="15" fill={`url(#${id}-lueur)`} />}
      <path d={MAISON} stroke="currentColor" strokeWidth="2.6" />
      {piste !== "trappe" && <path d={PORTE} stroke="currentColor" strokeWidth="2.6" />}
      <path d="M2 52 H62" stroke="currentColor" strokeWidth="2.6" />
      {piste === "racines" && (
        <g stroke="var(--or)" strokeWidth="2.6">
          <path d="M32 52 V71" />
          <path d="M32 57 C24 58 17 62 19 69 C21 75 28 73 26.5 68.5" />
          <path d="M32 57 C40 58 47 62 45 69 C43 75 36 73 37.5 68.5" />
          <circle cx="32" cy="76" r="3.2" fill="var(--or)" stroke="none" />
        </g>
      )}
      {piste === "trappe" && (
        <g stroke="var(--or)" strokeWidth="2.6">
          <path d="M20 38 H26 V44 H32 V50 H38 V56 H44 V62" />
          <circle cx="46" cy="72" r="3" fill="var(--or)" stroke="none" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx="46" cy="66.5" rx="1.9" ry="3" transform={`rotate(${a} 46 72)`} />
          ))}
        </g>
      )}
      {piste === "soupirail" && (
        <path d="M39.5 57 V52.5 A4.5 4.5 0 0 1 48.5 52.5 V57 Z" fill="var(--or)" stroke="var(--or)" strokeWidth="1.4" />
      )}
    </svg>
  );
}

export function Logo({ piste = "racines" }: { piste?: Piste }) {
  return (
    <span className="logo">
      <Marque piste={piste} className="logo__marque" />
      <span className="logo__nom">L'atelier sous la maison</span>
    </span>
  );
}
