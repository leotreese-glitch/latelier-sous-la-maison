import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FicheMotif, metaFiche } from "@/components/pages/FicheMotif";
import { DESIGNS, trouver } from "@/lib/catalogue";

export const dynamicParams = false;

export function generateStaticParams() {
  return DESIGNS.map((d) => ({ slug: d.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = trouver((await params).slug);
  return d ? metaFiche(d, "en") : {};
}

export default async function Page({ params }: Props) {
  const d = trouver((await params).slug);
  if (!d) notFound();
  return <FicheMotif d={d} l="en" />;
}
