import { ConceptCard } from "../ConceptCard";
import { konzepte } from "@/data/metrikenData";

export function KonzepteTab() {
  // Filter out concepts already shown in Statistik tab
  const mainConcepts = konzepte.filter(k => 
    ["anscombe", "overfitting", "korrelation"].includes(k.id)
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">Wichtige Konzepte</h2>
        <div className="space-y-4">
          {mainConcepts.map(concept => (
            <ConceptCard key={concept.id} concept={concept} />
          ))}
        </div>
      </section>
    </div>
  );
}
