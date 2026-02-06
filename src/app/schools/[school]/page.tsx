import { getAllEntities } from "@/lib/api";
import { UnitArchive } from "@/components/archive/UnitArchive";
import { notFound } from "next/navigation";

const SCHOOLS = ["Elemental", "Wild", "War", "Astral", "Holy", "Technomancy", "Necromancy", "Titan"];

export async function generateStaticParams() {
  return SCHOOLS.map((school) => ({
    school: school,
  }));
}

interface SchoolPageProps {
  params: Promise<{ school: string }>;
}

export async function generateMetadata({ params }: SchoolPageProps) {
  const { school } = await params;
  return {
    title: `${decodeURIComponent(school)} Units | SpellcastersDB`,
    description: `Browse all units from the ${decodeURIComponent(school)} magic school.`,
  };
}

export default async function SchoolPage({ params }: SchoolPageProps) {
  const { school } = await params;
  const decodedSchool = decodeURIComponent(school);

  if (!SCHOOLS.includes(decodedSchool)) {
    notFound();
  }

  const allEntities = await getAllEntities();

  return (
    <div className="min-h-screen bg-surface-main text-foreground p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-primary to-brand-secondary mb-2">
            {decodedSchool} School
          </h1>
          <p className="text-gray-400">All units practicing {decodedSchool} magic.</p>
        </div>
        
        <UnitArchive 
            initialUnits={allEntities} 
            defaultFilters={{ schools: [decodedSchool] }}
        />
      </div>
    </div>
  );
}
