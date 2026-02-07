import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, BookOpen } from "lucide-react";
import { ModeToggle } from "@/components/nachschlagen/ModeToggle";
import { SchnellModus } from "@/components/nachschlagen/SchnellModus";
import { StakeholderModus } from "@/components/nachschlagen/StakeholderModus";
import { terms, termCategories, searchTerms, getTermById } from "@/data/termsData";

type Mode = "schnell" | "stakeholder";

export default function BegriffeUebersetzungen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = (searchParams.get("modus") as Mode) || "schnell";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(termCategories[0]?.id || "metriken");

  // Set mode via URL
  const setMode = (newMode: Mode) => {
    setSearchParams({ modus: newMode });
  };

  // Filter terms based on search
  const filteredTerms = useMemo(() => {
    return searchTerms(searchQuery);
  }, [searchQuery]);

  const isSearching = searchQuery.length > 0;

  // Switch from Schnell to Stakeholder with preselected term
  const handleShowDetails = (termId: string) => {
    const term = getTermById(termId);
    if (term) {
      setSelectedTermId(termId);
      setActiveCategory(term.category);
      setMode("stakeholder");
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-4 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Begriffe & Übersetzungen</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Data-Science-Begriffe verstehen und erklären.
        </p>
      </div>

      {/* Mode Toggle */}
      <ModeToggle mode={mode} onChange={setMode} />

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Begriff suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content based on mode */}
      {mode === "schnell" ? (
        <Card>
          <CardContent className="pt-4 pb-2">
            <SchnellModus terms={filteredTerms} onShowDetails={handleShowDetails} />
          </CardContent>
        </Card>
      ) : (
        <StakeholderModus
          filteredTerms={filteredTerms}
          selectedTermId={selectedTermId}
          onSelectTerm={setSelectedTermId}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          isSearching={isSearching}
        />
      )}
    </div>
  );
}
