import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, Target, BarChart3, Lightbulb, Boxes } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RegressionTab } from "@/components/metriken/tabs/RegressionTab";
import { KlassifikationTab } from "@/components/metriken/tabs/KlassifikationTab";
import { ClusteringTab } from "@/components/metriken/tabs/ClusteringTab";
import { StatistikTab } from "@/components/metriken/tabs/StatistikTab";
import { KonzepteTab } from "@/components/metriken/tabs/KonzepteTab";

const tabs = [
  { id: "regression", label: "Regression", shortLabel: "Reg.", icon: TrendingUp },
  { id: "klassifikation", label: "Klassifikation", shortLabel: "Klass.", icon: Target },
  { id: "clustering", label: "Clustering", shortLabel: "Clust.", icon: Boxes },
  { id: "statistik", label: "Statistik", shortLabel: "Stat.", icon: BarChart3 },
  { id: "konzepte", label: "Konzepte", shortLabel: "Konz.", icon: Lightbulb },
];

export default function MetrikenReferenz() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "regression";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      {/* Back Link */}
      <Link 
        to="/nachschlagen" 
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 md:mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Zurück zu Nachschlagen
      </Link>

      {/* Header */}
      <div className="mb-4 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Metriken-Referenz</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Statistische Maße für ML-Modelle verstehen und richtig einsetzen.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full grid grid-cols-5 mb-8">
          {tabs.map(tab => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <tab.icon className="h-4 w-4" />
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="regression">
          <RegressionTab />
        </TabsContent>

        <TabsContent value="klassifikation">
          <KlassifikationTab />
        </TabsContent>

        <TabsContent value="clustering">
          <ClusteringTab />
        </TabsContent>

        <TabsContent value="statistik">
          <StatistikTab />
        </TabsContent>

        <TabsContent value="konzepte">
          <KonzepteTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
