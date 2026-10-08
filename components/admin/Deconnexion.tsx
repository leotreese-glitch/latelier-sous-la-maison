"use client";

import { api } from "@/lib/admin/api";

export function Deconnexion() {
  return (
    <button
      type="button"
      className="effacer"
      onClick={async () => {
        await api.deconnexion().catch(() => {});
        window.location.href = "/admin/";
      }}
    >
      Se déconnecter
    </button>
  );
}
