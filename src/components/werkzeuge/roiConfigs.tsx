// ROI Calculator Konfigurationen - ersetzt die 4 einzelnen Calculator-Komponenten
import { 
  churnCalculatorDefinition, 
  fraudCalculatorDefinition,
  conversionCalculatorDefinition,
  demandCalculatorDefinition,
  calculateChurnROI,
  calculateFraudROI,
  calculateConversionROI,
  calculateDemandROI,
  type ChurnInput,
  type ChurnOutput,
  type FraudInput,
  type FraudOutput,
  type ConversionInput,
  type ConversionOutput,
  type DemandInput,
  type DemandOutput,
} from "@/data/roiCalculatorData";
import { ROICalculator, formatCurrency, formatNumber, type ROIFormattedResult } from "./ROICalculator";

// ========== Churn Config ==========
const churnDefaults: ChurnInput = {
  customerBase: 100000,
  churnRate: 5,
  clv: 500,
  callsPerWeek: 200,
  successRate: 30,
  baselinePrecision: 20,
  modelPrecision: 60,
};

const formatChurnResult = (inputs: ChurnInput, result: ChurnOutput): ROIFormattedResult => ({
  mainResult: {
    label: "Zusätzlicher Wert pro Jahr",
    value: formatCurrency(result.delta.additionalValuePerYear),
    sublabel: `${formatNumber(result.delta.additionalSavedPerYear)} zusätzlich gerettete Kunden`,
  },
  comparisonRows: [
    {
      label: "True Positives pro Woche",
      withoutModel: formatNumber(result.withoutModel.truePositivesPerWeek, 1),
      withModel: formatNumber(result.withModel.truePositivesPerWeek, 1),
    },
    {
      label: "Gerettete Kunden pro Woche",
      withoutModel: formatNumber(result.withoutModel.savedPerWeek, 1),
      withModel: formatNumber(result.withModel.savedPerWeek, 1),
    },
    {
      label: "Gerettete Kunden pro Jahr",
      withoutModel: formatNumber(result.withoutModel.savedPerYear),
      withModel: formatNumber(result.withModel.savedPerYear),
    },
    {
      label: "Wert pro Jahr",
      withoutModel: formatCurrency(result.withoutModel.valuePerYear),
      withModel: formatCurrency(result.withModel.valuePerYear),
    },
  ],
  interpretation: `Mit dem ML-Modell rettest du ${formatNumber(result.delta.multiplier, 1)}× so viele Kunden wie ohne Modell. Das entspricht einem Mehrwert von ${formatCurrency(result.delta.additionalValuePerYear)} pro Jahr.`,
  assumptions: [
    "Die Precision-Werte sind realistisch geschätzt (validiert durch Testdaten)",
    "Die Erfolgsquote der Intervention bleibt konstant",
    "Alle geretteten Kunden bleiben für die volle CLV-Periode",
    "Kosten für Interventionen (Rabatte, etc.) sind nicht berücksichtigt",
  ],
});

export function ChurnCalculator() {
  return (
    <ROICalculator<ChurnInput, ChurnOutput>
      definition={churnCalculatorDefinition}
      defaultInputs={churnDefaults}
      calculateFn={calculateChurnROI}
      formatResult={formatChurnResult}
    />
  );
}

// ========== Fraud Config ==========
const fraudDefaults: FraudInput = {
  transactionsPerMonth: 1000000,
  fraudRate: 0.5,
  avgFraudAmount: 500,
  reviewCapacity: 5000,
  recoveryRate: 80,
  baselinePrecision: 5,
  modelPrecision: 25,
};

const formatFraudResult = (inputs: FraudInput, result: FraudOutput): ROIFormattedResult => ({
  mainResult: {
    label: "Zusätzlich verhinderte Schäden pro Jahr",
    value: formatCurrency(result.delta.additionalPreventedPerYear),
    sublabel: `${formatNumber(result.delta.additionalDetected)} zusätzlich erkannte Cases pro Monat`,
  },
  comparisonRows: [
    {
      label: "Fraud-Cases pro Monat (gesamt)",
      withoutModel: formatNumber(result.withoutModel.fraudCasesTotal),
      withModel: formatNumber(result.withModel.fraudCasesTotal),
    },
    {
      label: "Erkannte Cases pro Monat",
      withoutModel: formatNumber(result.withoutModel.detectedCases),
      withModel: formatNumber(result.withModel.detectedCases),
    },
    {
      label: "Verhinderte Schäden pro Monat",
      withoutModel: formatCurrency(result.withoutModel.preventedLoss),
      withModel: formatCurrency(result.withModel.preventedLoss),
    },
    {
      label: "Verhinderte Schäden pro Jahr",
      withoutModel: formatCurrency(result.withoutModel.preventedLossPerYear),
      withModel: formatCurrency(result.withModel.preventedLossPerYear),
    },
  ],
  interpretation: `Mit dem ML-Modell erkennst du ${formatNumber(result.delta.multiplier, 1)}× so viele Fraud-Cases bei gleicher Prüfkapazität. Das entspricht zusätzlich verhinderten Schäden von ${formatCurrency(result.delta.additionalPreventedPerYear)} pro Jahr.`,
  assumptions: [
    "Die Precision-Werte basieren auf validiertem Testdaten-Performance",
    "Die Prüfkapazität bleibt konstant",
    "Recovery-Rate gilt für alle erkannten Cases gleich",
    "Betrugsmuster ändern sich nicht signifikant",
  ],
});

export function FraudCalculator() {
  return (
    <ROICalculator<FraudInput, FraudOutput>
      definition={fraudCalculatorDefinition}
      defaultInputs={fraudDefaults}
      calculateFn={calculateFraudROI}
      formatResult={formatFraudResult}
    />
  );
}

// ========== Conversion Config ==========
const conversionDefaults: ConversionInput = {
  monthlyVisitors: 500000,
  baselineConversion: 2.5,
  avgOrderValue: 75,
  campaignReach: 30,
  campaignCostPerUser: 0.05,
  uplift: 15,
};

const formatConversionResult = (inputs: ConversionInput, result: ConversionOutput): ROIFormattedResult => ({
  mainResult: {
    label: "Netto-Mehrwert pro Jahr",
    value: formatCurrency(result.delta.additionalRevenuePerYear),
    sublabel: `ROI: ${formatNumber(result.delta.roi)}%`,
  },
  comparisonRows: [
    {
      label: "Baseline Conversions pro Monat",
      withoutModel: formatNumber(result.baseline.conversions),
      withModel: formatNumber(result.baseline.conversions),
    },
    {
      label: "Targetierte Besucher",
      withoutModel: "0",
      withModel: formatNumber(result.withModel.targetedVisitors),
    },
    {
      label: "Zusätzliche Conversions",
      withoutModel: "0",
      withModel: formatNumber(result.withModel.additionalConversions, 1),
    },
    {
      label: "Kampagnenkosten pro Monat",
      withoutModel: "0 €",
      withModel: formatCurrency(result.withModel.campaignCosts),
    },
    {
      label: "Netto-Mehrwert pro Monat",
      withoutModel: "0 €",
      withModel: formatCurrency(result.withModel.netRevenue),
    },
  ],
  interpretation: `Durch personalisierte Conversion-Optimierung erzielst du ${formatNumber(result.withModel.additionalConversions)} zusätzliche Conversions pro Monat. Nach Abzug der Kampagnenkosten bleibt ein Netto-Mehrwert von ${formatCurrency(result.delta.additionalRevenuePerYear)} pro Jahr.`,
  assumptions: [
    "Der Uplift ist durch A/B-Tests validiert",
    "AOV bleibt bei personalisierten Käufern gleich",
    "Kampagnenkosten bleiben konstant",
    "Keine negativen Effekte auf nicht-targetierte Besucher",
  ],
});

export function ConversionCalculator() {
  return (
    <ROICalculator<ConversionInput, ConversionOutput>
      definition={conversionCalculatorDefinition}
      defaultInputs={conversionDefaults}
      calculateFn={calculateConversionROI}
      formatResult={formatConversionResult}
    />
  );
}

// ========== Demand Config ==========
const demandDefaults: DemandInput = {
  skuCount: 10000,
  avgInventoryValue: 500,
  annualRevenue: 50000000,
  stockoutRate: 5,
  overstockRate: 15,
  obsolescenceRate: 5,
  forecastImprovement: 30,
};

const formatDemandResult = (inputs: DemandInput, result: DemandOutput): ROIFormattedResult => ({
  mainResult: {
    label: "Gesamteinsparung pro Jahr",
    value: formatCurrency(result.delta.totalSavings),
    sublabel: `${inputs.forecastImprovement}% Forecast-Verbesserung`,
  },
  comparisonRows: [
    {
      label: "Stockout-Kosten (Marge)",
      withoutModel: formatCurrency(result.current.stockoutLoss),
      withModel: formatCurrency(result.improved.stockoutLoss),
    },
    {
      label: "Lagerhaltungskosten",
      withoutModel: formatCurrency(result.current.holdingCosts),
      withModel: formatCurrency(result.improved.holdingCosts),
    },
    {
      label: "Abschreibungen",
      withoutModel: formatCurrency(result.current.obsolescenceLoss),
      withModel: formatCurrency(result.improved.obsolescenceLoss),
    },
    {
      label: "Gesamtverluste",
      withoutModel: formatCurrency(result.current.totalLoss),
      withModel: formatCurrency(result.improved.totalLoss),
    },
  ],
  interpretation: `Durch ${inputs.forecastImprovement}% bessere Nachfrageprognosen reduzierst du Stockout-Kosten um ${formatCurrency(result.delta.stockoutSavings)}, Lagerhaltungskosten um ${formatCurrency(result.delta.holdingSavings)} und Abschreibungen um ${formatCurrency(result.delta.obsolescenceSavings)}.`,
  assumptions: [
    "Marge: 20% des Umsatzes",
    "Lagerhaltungskosten: 15% des Warenwerts pro Jahr",
    "Forecast-Verbesserung reduziert Stockouts und Überbestände proportional",
    "Keine strukturellen Änderungen im Sortiment",
  ],
});

export function DemandCalculator() {
  return (
    <ROICalculator<DemandInput, DemandOutput>
      definition={demandCalculatorDefinition}
      defaultInputs={demandDefaults}
      calculateFn={calculateDemandROI}
      formatResult={formatDemandResult}
    />
  );
}
