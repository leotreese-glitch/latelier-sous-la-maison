import { COULEURS, type Couleur } from "../modele";

/** Côté le plus long de l'aperçu public, en pixels. Assez pour la loupe, trop peu pour imprimer. */
export const TAILLE_APERCU = 1200;

export const IMAGES_LISIBLES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export interface ImageLue {
  source: CanvasImageSource;
  largeur: number;
  hauteur: number;
  liberer: () => void;
}

function dimensionsSvg(texte: string) {
  const doc = new DOMParser().parseFromString(texte, "image/svg+xml").documentElement;
  const w = parseFloat(doc.getAttribute("width") ?? "");
  const h = parseFloat(doc.getAttribute("height") ?? "");
  if (w > 0 && h > 0) return { w, h };
  const vb = (doc.getAttribute("viewBox") ?? "").split(/[\s,]+/).map(Number);
  if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) return { w: vb[2], h: vb[3] };
  return { w: 1000, h: 1000 };
}

/** Ouvre une image PNG, JPEG, WebP ou SVG pour la mesurer et en tirer l'aperçu. */
export async function lireImage(fichier: File): Promise<ImageLue> {
  if (fichier.type === "image/svg+xml") {
    const texte = await fichier.text();
    const { w, h } = dimensionsSvg(texte);
    // Un SVG n'a pas de pixels : on le dessine à la taille de l'aperçu.
    const echelle = TAILLE_APERCU / Math.max(w, h);
    const url = URL.createObjectURL(new Blob([texte], { type: "image/svg+xml" }));
    const img = new Image();
    img.width = Math.round(w * echelle);
    img.height = Math.round(h * echelle);
    await new Promise<void>((ok, ko) => {
      img.onload = () => ok();
      img.onerror = () => ko(new Error("Ce SVG ne s'ouvre pas dans le navigateur."));
      img.src = url;
    });
    return { source: img, largeur: Math.round(w), hauteur: Math.round(h), liberer: () => URL.revokeObjectURL(url) };
  }
  const bitmap = await createImageBitmap(fichier).catch(() => {
    throw new Error("Cette image ne s'ouvre pas dans le navigateur. Essayez en PNG ou en JPEG.");
  });
  return { source: bitmap, largeur: bitmap.width, hauteur: bitmap.height, liberer: () => bitmap.close() };
}

/** Filigrane répété en diagonale, incrusté dans les pixels de l'aperçu. */
function dessinerFiligrane(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const taille = Math.max(14, Math.round(w / 38));
  const texte = "L’atelier sous la maison";
  ctx.save();
  ctx.font = `${taille}px "IM Fell French Canon", Georgia, serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
  ctx.lineWidth = Math.max(1, taille / 28);
  ctx.translate(w / 2, h / 2);
  ctx.rotate((-24 * Math.PI) / 180);
  const pasX = ctx.measureText(texte).width + taille * 4;
  const pasY = taille * 5.5;
  const portee = Math.hypot(w, h);
  for (let y = -portee, rang = 0; y < portee; y += pasY, rang++) {
    for (let x = -portee + (rang % 2) * (pasX / 2); x < portee; x += pasX) {
      ctx.strokeText(texte, x, y);
      ctx.fillText(texte, x, y);
    }
  }
  ctx.restore();
}

/** Fabrique l'aperçu public : 1200 px maximum, filigrane incrusté, WebP (ou JPEG si le navigateur ne sait pas). */
export async function fabriquerApercu(image: ImageLue) {
  const echelle = Math.min(1, TAILLE_APERCU / Math.max(image.largeur, image.hauteur));
  const w = Math.max(1, Math.round(image.largeur * echelle));
  const h = Math.max(1, Math.round(image.hauteur * echelle));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(image.source, 0, 0, w, h);
  await document.fonts.load(`${Math.round(w / 38)}px "IM Fell French Canon"`).catch(() => {});
  dessinerFiligrane(ctx, w, h);

  const versBlob = (type: string, qualite: number) => new Promise<Blob | null>((ok) => canvas.toBlob(ok, type, qualite));
  let blob = await versBlob("image/webp", 0.84);
  if (!blob || blob.type !== "image/webp") blob = await versBlob("image/jpeg", 0.86);
  if (!blob) throw new Error("L'aperçu n'a pas pu être fabriqué.");
  return { blob, type: blob.type, largeur: w, hauteur: h };
}

const RVB = COULEURS.map((c) => ({
  cle: c.cle,
  r: parseInt(c.hex.slice(1, 3), 16),
  v: parseInt(c.hex.slice(3, 5), 16),
  b: parseInt(c.hex.slice(5, 7), 16),
}));

/** Couleurs de la palette du site présentes dans l'image, avec leur part (en %). */
export function couleursDominantes(image: ImageLue, seuil = 5): { cle: Couleur; part: number }[] {
  const cote = 96;
  const echelle = cote / Math.max(image.largeur, image.hauteur);
  const w = Math.max(1, Math.round(image.largeur * echelle));
  const h = Math.max(1, Math.round(image.hauteur * echelle));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(image.source, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);
  const comptes = new Map<Couleur, number>();
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const [r, v, b] = [data[i], data[i + 1], data[i + 2]];
    let meilleure = RVB[0];
    let distance = Infinity;
    for (const c of RVB) {
      // Distance pondérée : l'œil est plus sensible au vert qu'au bleu.
      const d = 2 * (r - c.r) ** 2 + 4 * (v - c.v) ** 2 + 3 * (b - c.b) ** 2;
      if (d < distance) {
        distance = d;
        meilleure = c;
      }
    }
    comptes.set(meilleure.cle, (comptes.get(meilleure.cle) ?? 0) + 1);
    total++;
  }
  return [...comptes.entries()]
    .map(([cle, n]) => ({ cle, part: Math.round((n / Math.max(1, total)) * 100) }))
    .filter((c) => c.part >= seuil)
    .sort((a, b) => b.part - a.part);
}
