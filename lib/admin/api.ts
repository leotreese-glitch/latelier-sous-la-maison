import type { Design, Famille, Statut } from "../modele";

export interface Fichier {
  cle: string;
  role: "hd" | "apercu";
  nom: string;
  type_mime: string;
  taille: number;
  largeur: number | null;
  hauteur: number | null;
  cree_le: string;
}

export type DesignAdmin = Design & { creeLe: string; modifieLe: string; fichiersHd?: number };

export interface EtatConfig {
  base: boolean;
  stockage: boolean;
  motDePasse: boolean;
  secretSession: boolean;
  crochet: boolean;
}

export class ErreurApi extends Error {
  constructor(
    message: string,
    public statut: number,
    public code?: string,
    public manques?: string[],
    public config?: EtatConfig,
  ) {
    super(message);
  }
}

async function appel<T>(chemin: string, options: RequestInit = {}): Promise<T> {
  let rep: Response;
  try {
    rep = await fetch(chemin, {
      credentials: "same-origin",
      ...options,
      headers: { "content-type": "application/json", ...(options.headers ?? {}) },
    });
  } catch {
    throw new ErreurApi("Connexion impossible : vérifiez votre accès à Internet.", 0);
  }
  const corps = (await rep.json().catch(() => ({}))) as Record<string, unknown>;
  if (!rep.ok) {
    throw new ErreurApi(
      String(corps.erreur ?? `Erreur ${rep.status}`),
      rep.status,
      corps.code as string | undefined,
      corps.manques as string[] | undefined,
      corps.config as EtatConfig | undefined,
    );
  }
  return corps as T;
}

const json = (corps: unknown) => JSON.stringify(corps);

export const api = {
  etat: () => appel<{ connecte: boolean; config: EtatConfig }>("/api/admin/connexion"),
  connexion: (motDePasse: string) => appel<{ connecte: boolean }>("/api/admin/connexion", { method: "POST", body: json({ motDePasse }) }),
  deconnexion: () => appel<{ connecte: boolean }>("/api/admin/connexion", { method: "DELETE" }),
  liste: () => appel<{ designs: DesignAdmin[] }>("/api/admin/designs"),
  creer: (famille: Famille) => appel<{ id: string }>("/api/admin/designs", { method: "POST", body: json({ famille }) }),
  lire: (id: string) => appel<{ design: DesignAdmin; fichiers: Fichier[] }>(`/api/admin/designs/${encodeURIComponent(id)}`),
  enregistrer: (id: string, design: Partial<Design>, statut: Statut) =>
    appel<{ design: DesignAdmin; fichiers: Fichier[] }>(`/api/admin/designs/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: json({ design, statut }),
    }),
  supprimer: (id: string) => appel<{ supprime: string }>(`/api/admin/designs/${encodeURIComponent(id)}`, { method: "DELETE" }),
  supprimerFichier: (cle: string) => appel<{ fichiers: Fichier[] }>("/api/admin/fichiers/supprimer", { method: "POST", body: json({ cle }) }),
  etatMiseAJour: () => appel<{ derniereMiseAJour: string; changements: number; crochet: boolean }>("/api/admin/mise-a-jour"),
  miseAJour: () => appel<{ demandeLe: string }>("/api/admin/mise-a-jour", { method: "POST" }),
};

const TAILLE_MORCEAU = 20 * 1024 * 1024; // 20 Mo par morceau (le minimum accepté par R2 est 5 Mo)

function envoyerMorceau(url: string, morceau: Blob, surProgres: (octets: number) => void) {
  return new Promise<{ numero: number; etag: string }>((resoudre, rejeter) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.withCredentials = true;
    xhr.setRequestHeader("content-type", "application/octet-stream");
    xhr.upload.onprogress = (e) => surProgres(e.loaded);
    xhr.onload = () => {
      try {
        const corps = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resoudre(corps);
        else rejeter(new ErreurApi(corps.erreur ?? `Erreur ${xhr.status}`, xhr.status, corps.code));
      } catch {
        rejeter(new ErreurApi(`Erreur ${xhr.status}`, xhr.status));
      }
    };
    xhr.onerror = () => rejeter(new ErreurApi("L'envoi a été interrompu : vérifiez votre connexion.", 0));
    xhr.send(morceau);
  });
}

/** Envoie un fichier en morceaux de 20 Mo, avec la progression en pourcentage. */
export async function envoyerFichier(options: {
  design: string;
  role: "hd" | "apercu";
  fichier: Blob;
  nom: string;
  type: string;
  largeur?: number;
  hauteur?: number;
  surProgres?: (pourcent: number) => void;
}) {
  const { design, role, fichier, nom, type } = options;
  const { cle, uploadId } = await appel<{ cle: string; uploadId: string }>("/api/admin/fichiers/debut", {
    method: "POST",
    body: json({ design, role, nom, type }),
  });
  const parties: { numero: number; etag: string }[] = [];
  const total = fichier.size || 1;
  let envoye = 0;
  for (let debut = 0, numero = 1; debut < fichier.size || numero === 1; debut += TAILLE_MORCEAU, numero++) {
    const morceau = fichier.slice(debut, Math.min(debut + TAILLE_MORCEAU, fichier.size));
    const url = `/api/admin/fichiers/partie?cle=${encodeURIComponent(cle)}&uploadId=${encodeURIComponent(uploadId)}&numero=${numero}`;
    const partie = await envoyerMorceau(url, morceau, (o) => options.surProgres?.(Math.round(((envoye + o) / total) * 100)));
    envoye += morceau.size;
    parties.push(partie);
    if (fichier.size === 0) break;
  }
  return appel<{ design: DesignAdmin; fichiers: Fichier[] }>("/api/admin/fichiers/fin", {
    method: "POST",
    body: json({ design, role, cle, uploadId, parties, nom, type, taille: fichier.size, largeur: options.largeur, hauteur: options.hauteur }),
  });
}
