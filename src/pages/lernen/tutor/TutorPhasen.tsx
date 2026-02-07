import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TutorTabs } from "@/components/tutor/TutorTabs";
import { tutorPhasen } from "@/data/content";
import { Info, CheckCircle, AlertTriangle, Plus } from "lucide-react";

export default function TutorPhasen() {
  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-5xl">
      <TutorTabs activeTab="phasen" />
      
      <h1 className="text-2xl md:text-4xl font-bold mb-2">Die Phasen im KI Tutor</h1>
      <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-8">
        In jeder Phase erarbeitest du konkrete Deliverables:
      </p>

      <div className="space-y-6 md:space-y-8">
        {/* Phasen Tabelle */}
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Phase</TableHead>
                    <TableHead>Was du klärst</TableHead>
                    <TableHead>Deliverable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tutorPhasen.map((phase, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{phase.phase}</TableCell>
                      <TableCell className="text-muted-foreground">{phase.klaerung}</TableCell>
                      <TableCell className="text-muted-foreground">{phase.deliverable}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Legende */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Feedback-Symbole
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Nach jeder Phase bekommst du Feedback:
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-muted-foreground">✅ passt</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="text-muted-foreground">⚠️ Risiko</span>
              </div>
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                <span className="text-muted-foreground">➕ fehlt</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
