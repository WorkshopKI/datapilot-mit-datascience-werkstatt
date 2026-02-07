import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, Filter, X } from "lucide-react";
import { useCases, problemTypes, industries, type UseCase } from "@/data/useCaseData";
import { UseCaseDetail } from "./UseCaseDetail";

export function UseCaseLibrary() {
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [filterProblemType, setFilterProblemType] = useState<string>("all");
  const [filterIndustry, setFilterIndustry] = useState<string>("all");

  const filteredUseCases = useCases.filter((uc) => {
    if (filterProblemType !== "all" && uc.problemType !== filterProblemType) return false;
    if (filterIndustry !== "all" && uc.industry !== filterIndustry) return false;
    return true;
  });

  const hasActiveFilters = filterProblemType !== "all" || filterIndustry !== "all";

  const resetFilters = () => {
    setFilterProblemType("all");
    setFilterIndustry("all");
  };

  const getProblemTypeLabel = (id: string) => problemTypes.find((pt) => pt.id === id)?.label || id;
  const getIndustryLabel = (id: string) => industries.find((ind) => ind.id === id)?.label || id;

  const renderStars = (count: number) => {
    return Array.from({ length: 3 }).map((_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < count ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`}
      />
    ));
  };

  if (selectedUseCase) {
    return (
      <UseCaseDetail
        useCase={selectedUseCase}
        onBack={() => setSelectedUseCase(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Use-Case-Bibliothek</h2>
        <p className="text-muted-foreground">
          12 praxisnahe Data-Science-Use-Cases mit Stolperfallen und Praxis-Stories.
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        
        <Select value={filterProblemType} onValueChange={setFilterProblemType}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Problemtyp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Problemtypen</SelectItem>
            {problemTypes.map((pt) => (
              <SelectItem key={pt.id} value={pt.id}>{pt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterIndustry} onValueChange={setFilterIndustry}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Branche" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Branchen</SelectItem>
            {industries.map((ind) => (
              <SelectItem key={ind.id} value={ind.id}>{ind.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Filter zurücksetzen"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredUseCases.length} von {useCases.length} Use Cases
        </div>
      </div>

      {/* Use Case Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUseCases.map((uc) => (
          <Card
            key={uc.id}
            className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5"
            onClick={() => setSelectedUseCase(uc)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <span className="text-3xl">{uc.emoji}</span>
                <div className="flex items-center gap-0.5">
                  {renderStars(uc.levelStars)}
                </div>
              </div>
              <h3 className="text-lg font-semibold mt-2">{uc.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {uc.shortDescription}
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {getProblemTypeLabel(uc.problemType)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getIndustryLabel(uc.industry)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUseCases.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Keine Use Cases gefunden mit diesen Filtern.</p>
          <button
            className="text-primary hover:underline mt-2"
            onClick={resetFilters}
          >
            Filter zurücksetzen
          </button>
        </div>
      )}
    </div>
  );
}
