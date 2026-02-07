import { CopilotTabs } from "@/components/copilot/CopilotTabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { copilotVsTutor } from "@/data/copilotData";
import { Handshake, CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function CopilotFaehigkeiten() {
  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      <CopilotTabs activeTab="was-kann" />

      <div className="flex items-center gap-3 mb-6">
        <Handshake className="h-8 w-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Was kann der KI Copilot?</h1>
      </div>

      {/* Intro */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Dein Arbeitspartner, kein Lehrer</h2>
        <p className="text-muted-foreground">
          Der KI Copilot ist kein Tutor – er arbeitet mit dir. Er analysiert deine Daten, erstellt Visualisierungen, trainiert Modelle und baut Dashboards. Du triffst die Entscheidungen, er führt die technische Arbeit aus.
        </p>
      </section>

      {/* Was er konkret tut */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Was er konkret tut</h2>
        <div className="space-y-2">
          {[
            "Daten automatisch einlesen und auf Qualität prüfen",
            "Korrelationen, Verteilungen und Auffälligkeiten visualisieren",
            "Missing Values, Encoding und Feature Engineering vorschlagen",
            "Baseline + 2 Modelle trainieren und vergleichen",
            "Feature Importance berechnen und erklären",
            "Interaktive HTML-Dashboards für Stakeholder erstellen",
            "Ergebnisse in einfacher Sprache zusammenfassen"
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Was er nicht ist */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Was er nicht ist</h2>
        <div className="space-y-2">
          {[
            "Kein Ersatz für Fachwissen – er gibt Empfehlungen, du entscheidest",
            "Kein Big-Data-Tool – optimiert für Datensätze bis 50.000 Zeilen",
            "Kein Deep-Learning-Framework – fokussiert auf erklärbare Modelle (sklearn)"
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tutor vs. Copilot */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">KI Tutor vs. KI Copilot – was ist der Unterschied?</h2>
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {copilotVsTutor.headers.map((header, index) => (
                    <th key={index} className="text-left p-3 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {copilotVsTutor.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b last:border-0">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className={`p-3 ${cellIndex === 0 ? "font-medium" : ""}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="text-center pt-6 border-t">
        <a 
          href="/ki-assistenten/copilot" 
          className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
        >
          Zurück zur Übersicht
          <ArrowRight className="h-4 w-4" />
        </a>
      </section>
    </div>
  );
}
