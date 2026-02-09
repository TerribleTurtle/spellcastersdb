import { Metadata } from "next";

import { EntityShowcase } from "@/components/inspector/EntityShowcase";
import { notFound } from "next/navigation";

import { getEntityById, getTitans } from "@/lib/api";
import { Titan } from "@/types/api";

interface TitanPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const titans = await getTitans();
  return titans.map((titan) => ({
    id: titan.entity_id,
  }));
}

export async function generateMetadata({
  params,
}: TitanPageProps): Promise<Metadata> {
  const { id } = await params;
  const entity = await getEntityById(id);
  const titan = entity as Titan;

  if (!titan || titan.category !== "Titan") {
    return { title: "Titan Not Found" };
  }

  return {
    title: titan.name,
    description: titan.description,
    openGraph: {
      title: titan.name,
      description: titan.description,
    },
  };
}

export default async function TitanPage({ params }: TitanPageProps) {
  const { id } = await params;
  const entity = await getEntityById(id);
  const titan = entity as Titan;

  if (!titan || titan.category !== "Titan") {
    notFound();
  }

  return (
    <EntityShowcase 
      item={titan} 
      backUrl="/titans"
      backLabel="Back to Titans"
    />
  );
}
