import type { Metadata } from "next";
import { Suspense } from "react";
import { Editeur } from "@/components/admin/Editeur";

export const metadata: Metadata = { title: "Modifier un design" };

export default function PageDesign() {
  return (
    <Suspense fallback={<p className="admin-aide">Chargement…</p>}>
      <Editeur />
    </Suspense>
  );
}
