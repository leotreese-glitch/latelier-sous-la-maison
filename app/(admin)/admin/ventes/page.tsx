import type { Metadata } from "next";
import { Ventes } from "@/components/admin/Ventes";

export const metadata: Metadata = { title: "Ventes" };

export default function PageVentes() {
  return <Ventes />;
}
