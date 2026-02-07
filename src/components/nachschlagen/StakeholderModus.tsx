import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TermDetail } from "./TermDetail";
import {
  terms,
  termCategories,
  businessQuestions,
  businessQuestionCategories,
  getTermById,
  getTermsByCategory,
  getQuestionsByCategory,
  type Term,
  type BusinessQuestion,
} from "@/data/termsData";
import { getTermCategoryIcon, getBusinessCategoryIcon } from "@/data/icons";

interface StakeholderModusProps {
  filteredTerms: Term[];
  selectedTermId: string | null;
  onSelectTerm: (termId: string | null) => void;
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  isSearching: boolean;
}

export function StakeholderModus({
  filteredTerms,
  selectedTermId,
  onSelectTerm,
  activeCategory,
  onCategoryChange,
  isSearching,
}: StakeholderModusProps) {
  const [activeTab, setActiveTab] = useState<"ds" | "business">("ds");
  const [activeBusinessCategory, setActiveBusinessCategory] = useState(businessQuestionCategories[0]?.id || "");
  const [selectedQuestion, setSelectedQuestion] = useState<BusinessQuestion | null>(null);

  // Get visible terms based on search or category
  const visibleTerms = isSearching
    ? filteredTerms
    : getTermsByCategory(activeCategory);

  // Get visible business questions
  const visibleQuestions = isSearching
    ? businessQuestions.filter(q => 
        q.question.toLowerCase().includes(activeCategory.toLowerCase()) ||
        q.dsAnswer.toLowerCase().includes(activeCategory.toLowerCase())
      )
    : getQuestionsByCategory(activeBusinessCategory);

  const selectedTerm = selectedTermId ? getTermById(selectedTermId) : null;

  const handleSelectRelated = (termId: string) => {
    const term = getTermById(termId);
    if (term) {
      onCategoryChange(term.category);
      onSelectTerm(term.id);
    }
  };

  const handleSelectQuestion = (question: BusinessQuestion) => {
    setSelectedQuestion(question);
  };

  const handleRelatedTermFromQuestion = (termName: string) => {
    const term = terms.find(t => t.id === termName || t.name.toLowerCase() === termName.toLowerCase());
    if (term) {
      setActiveTab("ds");
      onCategoryChange(term.category);
      onSelectTerm(term.id);
      setSelectedQuestion(null);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "ds" | "business")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ds">DS → Business</TabsTrigger>
          <TabsTrigger value="business">Business → DS</TabsTrigger>
        </TabsList>

        <TabsContent value="ds" className="space-y-6 mt-6">
          {/* Category buttons */}
          <div className="flex flex-wrap gap-2">
            {termCategories.map((category) => {
              const Icon = getTermCategoryIcon(category.id);
              return (
                <Button
                  key={category.id}
                  variant={!isSearching && activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    onCategoryChange(category.id);
                    onSelectTerm(null);
                  }}
                  className="gap-1.5"
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>

          {/* Term badges */}
          <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto sm:max-h-none sm:overflow-visible">
            {visibleTerms.map((term) => (
              <Badge
                key={term.id}
                variant={selectedTermId === term.id ? "default" : "outline"}
                className={cn(
                  "cursor-pointer py-2 px-4",
                  selectedTermId === term.id
                    ? ""
                    : "hover:bg-primary/10 hover:border-primary/50"
                )}
                onClick={() => onSelectTerm(term.id)}
              >
                {term.name}
              </Badge>
            ))}
          </div>

          {visibleTerms.length === 0 && (
            <p className="text-muted-foreground text-center py-8">Keine Begriffe gefunden.</p>
          )}

          {/* Term detail */}
          {selectedTerm && (
            <TermDetail term={selectedTerm} onSelectRelated={handleSelectRelated} />
          )}
        </TabsContent>

        <TabsContent value="business" className="space-y-6 mt-6">
          {/* Business category buttons */}
          <div className="flex flex-wrap gap-2">
            {businessQuestionCategories.map((category) => {
              const Icon = getBusinessCategoryIcon(category.id);
              return (
                <Button
                  key={category.id}
                  variant={activeBusinessCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setActiveBusinessCategory(category.id);
                    setSelectedQuestion(null);
                  }}
                  className="gap-1.5"
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>

          {/* Question badges */}
          <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto sm:max-h-none sm:overflow-visible">
            {(isSearching ? businessQuestions : visibleQuestions).map((q) => (
              <Badge
                key={q.id}
                variant={selectedQuestion?.id === q.id ? "default" : "outline"}
                className={cn(
                  "cursor-pointer py-2 px-4 text-left",
                  selectedQuestion?.id === q.id
                    ? ""
                    : "hover:bg-primary/10 hover:border-primary/50"
                )}
                onClick={() => handleSelectQuestion(q)}
              >
                {q.question}
              </Badge>
            ))}
          </div>

          {visibleQuestions.length === 0 && !isSearching && (
            <p className="text-muted-foreground text-center py-8">Keine Fragen gefunden.</p>
          )}

          {/* Question detail */}
          {selectedQuestion && (
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                  {selectedQuestion.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-1">Antwort</h4>
                  <p>{selectedQuestion.dsAnswer}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Erläuterung</h4>
                  <p className="text-muted-foreground text-sm">{selectedQuestion.explanation}</p>
                </div>
                {selectedQuestion.relatedTerms.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-1">Relevante DS-Begriffe</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedQuestion.relatedTerms.map((rt) => (
                        <Badge
                          key={rt}
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80"
                          onClick={() => handleRelatedTermFromQuestion(rt)}
                        >
                          {rt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
