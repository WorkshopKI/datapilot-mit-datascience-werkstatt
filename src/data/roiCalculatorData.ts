// ROI Calculator Data
// 4 Rechner-Definitionen mit Formeln und Defaults

export interface CalculatorField {
  id: string;
  label: string;
  unit: string;
  defaultValue: number;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
}

export interface CalculatorSection {
  title: string;
  fields: CalculatorField[];
}

export interface ROICalculatorDefinition {
  id: string;
  title: string;
  emoji: string;
  description: string;
  sections: CalculatorSection[];
}

// ========== Churn ROI Calculator ==========
export const churnCalculatorDefinition: ROICalculatorDefinition = {
  id: "churn",
  title: "Churn Prediction ROI",
  emoji: "📉",
  description: "Berechne den Mehrwert eines Churn-Prediction-Modells für dein Retention-Team.",
  sections: [
    {
      title: "Kundenbasis",
      fields: [
        { id: "customerBase", label: "Aktive Kunden", unit: "", defaultValue: 100000, min: 1000, hint: "Anzahl der Kunden, die churnen könnten" },
        { id: "churnRate", label: "Aktuelle Churn-Rate", unit: "%", defaultValue: 5, min: 0.1, max: 50, step: 0.1, hint: "Jährliche Abwanderungsrate" },
        { id: "clv", label: "Customer Lifetime Value", unit: "€", defaultValue: 500, min: 10, hint: "Durchschnittlicher Wert eines Kunden" },
      ],
    },
    {
      title: "Retention-Team",
      fields: [
        { id: "callsPerWeek", label: "Anrufe pro Woche", unit: "", defaultValue: 200, min: 10, hint: "Kapazität für Retention-Calls" },
        { id: "successRate", label: "Erfolgsquote bei True Positives", unit: "%", defaultValue: 30, min: 5, max: 80, step: 1, hint: "Wie viele der richtigen Anrufe halten den Kunden?" },
      ],
    },
    {
      title: "Modell-Performance",
      fields: [
        { id: "baselinePrecision", label: "Precision ohne Modell", unit: "%", defaultValue: 20, min: 1, max: 100, hint: "Trefferquote bei zufälliger Auswahl" },
        { id: "modelPrecision", label: "Precision mit Modell", unit: "%", defaultValue: 60, min: 1, max: 100, hint: "Trefferquote mit ML-Priorisierung" },
      ],
    },
  ],
};

export interface ChurnInput {
  customerBase: number;
  churnRate: number;
  clv: number;
  callsPerWeek: number;
  successRate: number;
  baselinePrecision: number;
  modelPrecision: number;
}

export interface ChurnOutput {
  withoutModel: {
    truePositivesPerWeek: number;
    savedPerWeek: number;
    savedPerYear: number;
    valuePerYear: number;
  };
  withModel: {
    truePositivesPerWeek: number;
    savedPerWeek: number;
    savedPerYear: number;
    valuePerYear: number;
  };
  delta: {
    additionalSavedPerYear: number;
    additionalValuePerYear: number;
    multiplier: number;
  };
}

export function calculateChurnROI(input: ChurnInput): ChurnOutput {
  const weeksPerYear = 52;
  const successRateDecimal = input.successRate / 100;
  const baselinePrecisionDecimal = input.baselinePrecision / 100;
  const modelPrecisionDecimal = input.modelPrecision / 100;
  
  const withoutModel = {
    truePositivesPerWeek: input.callsPerWeek * baselinePrecisionDecimal,
    savedPerWeek: input.callsPerWeek * baselinePrecisionDecimal * successRateDecimal,
    savedPerYear: 0,
    valuePerYear: 0,
  };
  withoutModel.savedPerYear = withoutModel.savedPerWeek * weeksPerYear;
  withoutModel.valuePerYear = withoutModel.savedPerYear * input.clv;
  
  const withModel = {
    truePositivesPerWeek: input.callsPerWeek * modelPrecisionDecimal,
    savedPerWeek: input.callsPerWeek * modelPrecisionDecimal * successRateDecimal,
    savedPerYear: 0,
    valuePerYear: 0,
  };
  withModel.savedPerYear = withModel.savedPerWeek * weeksPerYear;
  withModel.valuePerYear = withModel.savedPerYear * input.clv;
  
  const delta = {
    additionalSavedPerYear: withModel.savedPerYear - withoutModel.savedPerYear,
    additionalValuePerYear: withModel.valuePerYear - withoutModel.valuePerYear,
    multiplier: withModel.savedPerWeek / withoutModel.savedPerWeek,
  };
  
  return { withoutModel, withModel, delta };
}

// ========== Fraud ROI Calculator ==========
export const fraudCalculatorDefinition: ROICalculatorDefinition = {
  id: "fraud",
  title: "Fraud Detection ROI",
  emoji: "🔍",
  description: "Berechne die Einsparungen durch verbesserte Fraud-Erkennung.",
  sections: [
    {
      title: "Transaktionsvolumen",
      fields: [
        { id: "transactionsPerMonth", label: "Transaktionen pro Monat", unit: "", defaultValue: 1000000, min: 10000, hint: "Anzahl aller Transaktionen" },
        { id: "fraudRate", label: "Fraud-Rate", unit: "%", defaultValue: 0.5, min: 0.01, max: 10, step: 0.01, hint: "Anteil betrügerischer Transaktionen" },
        { id: "avgFraudAmount", label: "Durchschn. Schadenssumme", unit: "€", defaultValue: 500, min: 10, hint: "Durchschnittlicher Schaden pro Fraud-Fall" },
      ],
    },
    {
      title: "Prüfkapazität",
      fields: [
        { id: "reviewCapacity", label: "Prüfbare Cases pro Monat", unit: "", defaultValue: 5000, min: 100, hint: "Anzahl der Cases, die manuell geprüft werden können" },
        { id: "recoveryRate", label: "Recovery-Rate bei Erkennung", unit: "%", defaultValue: 80, min: 10, max: 100, hint: "Wie viel Schaden wird bei Erkennung verhindert?" },
      ],
    },
    {
      title: "Modell-Performance",
      fields: [
        { id: "baselinePrecision", label: "Precision ohne Modell", unit: "%", defaultValue: 5, min: 0.1, max: 100, step: 0.1, hint: "Trefferquote der aktuellen Regel-basierten Erkennung" },
        { id: "modelPrecision", label: "Precision mit Modell", unit: "%", defaultValue: 25, min: 0.1, max: 100, step: 0.1, hint: "Trefferquote mit ML-Modell" },
      ],
    },
  ],
};

export interface FraudInput {
  transactionsPerMonth: number;
  fraudRate: number;
  avgFraudAmount: number;
  reviewCapacity: number;
  recoveryRate: number;
  baselinePrecision: number;
  modelPrecision: number;
}

export interface FraudOutput {
  withoutModel: {
    fraudCasesTotal: number;
    detectedCases: number;
    preventedLoss: number;
    preventedLossPerYear: number;
  };
  withModel: {
    fraudCasesTotal: number;
    detectedCases: number;
    preventedLoss: number;
    preventedLossPerYear: number;
  };
  delta: {
    additionalDetected: number;
    additionalPreventedPerYear: number;
    multiplier: number;
  };
}

export function calculateFraudROI(input: FraudInput): FraudOutput {
  const monthsPerYear = 12;
  const fraudRateDecimal = input.fraudRate / 100;
  const recoveryRateDecimal = input.recoveryRate / 100;
  const baselinePrecisionDecimal = input.baselinePrecision / 100;
  const modelPrecisionDecimal = input.modelPrecision / 100;
  
  const fraudCasesTotal = input.transactionsPerMonth * fraudRateDecimal;
  
  const withoutModel = {
    fraudCasesTotal,
    detectedCases: input.reviewCapacity * baselinePrecisionDecimal,
    preventedLoss: 0,
    preventedLossPerYear: 0,
  };
  withoutModel.preventedLoss = withoutModel.detectedCases * input.avgFraudAmount * recoveryRateDecimal;
  withoutModel.preventedLossPerYear = withoutModel.preventedLoss * monthsPerYear;
  
  const withModel = {
    fraudCasesTotal,
    detectedCases: input.reviewCapacity * modelPrecisionDecimal,
    preventedLoss: 0,
    preventedLossPerYear: 0,
  };
  withModel.preventedLoss = withModel.detectedCases * input.avgFraudAmount * recoveryRateDecimal;
  withModel.preventedLossPerYear = withModel.preventedLoss * monthsPerYear;
  
  const delta = {
    additionalDetected: withModel.detectedCases - withoutModel.detectedCases,
    additionalPreventedPerYear: withModel.preventedLossPerYear - withoutModel.preventedLossPerYear,
    multiplier: withModel.detectedCases / withoutModel.detectedCases,
  };
  
  return { withoutModel, withModel, delta };
}

// ========== Conversion ROI Calculator ==========
export const conversionCalculatorDefinition: ROICalculatorDefinition = {
  id: "conversion",
  title: "Conversion Optimization ROI",
  emoji: "🎯",
  description: "Berechne den Mehrwert durch personalisierte Conversion-Optimierung.",
  sections: [
    {
      title: "Traffic & Conversion",
      fields: [
        { id: "monthlyVisitors", label: "Besucher pro Monat", unit: "", defaultValue: 500000, min: 10000, hint: "Unique Visitors auf der Website" },
        { id: "baselineConversion", label: "Aktuelle Conversion-Rate", unit: "%", defaultValue: 2.5, min: 0.1, max: 20, step: 0.1, hint: "Prozent der Besucher, die kaufen" },
        { id: "avgOrderValue", label: "Durchschn. Warenkorb", unit: "€", defaultValue: 75, min: 10, hint: "Average Order Value (AOV)" },
      ],
    },
    {
      title: "Kampagnenkosten",
      fields: [
        { id: "campaignReach", label: "Kampagnen-Reichweite", unit: "%", defaultValue: 30, min: 1, max: 100, hint: "Prozent der Besucher, die Personalisierung sehen" },
        { id: "campaignCostPerUser", label: "Kosten pro gezeigter Personalisierung", unit: "€", defaultValue: 0.05, min: 0, max: 5, step: 0.01, hint: "Variable Kosten (z.B. Incentives, Coupons)" },
      ],
    },
    {
      title: "Modell-Performance",
      fields: [
        { id: "uplift", label: "Conversion-Uplift durch Modell", unit: "%", defaultValue: 15, min: 1, max: 100, hint: "Wie viel besser konvertiert die targetierte Gruppe?" },
      ],
    },
  ],
};

export interface ConversionInput {
  monthlyVisitors: number;
  baselineConversion: number;
  avgOrderValue: number;
  campaignReach: number;
  campaignCostPerUser: number;
  uplift: number;
}

export interface ConversionOutput {
  baseline: {
    conversions: number;
    revenue: number;
    revenuePerYear: number;
  };
  withModel: {
    targetedVisitors: number;
    additionalConversions: number;
    additionalRevenue: number;
    campaignCosts: number;
    netRevenue: number;
    netRevenuePerYear: number;
  };
  delta: {
    additionalRevenuePerYear: number;
    roi: number;
  };
}

export function calculateConversionROI(input: ConversionInput): ConversionOutput {
  const monthsPerYear = 12;
  const baselineConversionDecimal = input.baselineConversion / 100;
  const campaignReachDecimal = input.campaignReach / 100;
  const upliftDecimal = input.uplift / 100;
  
  const baseline = {
    conversions: input.monthlyVisitors * baselineConversionDecimal,
    revenue: 0,
    revenuePerYear: 0,
  };
  baseline.revenue = baseline.conversions * input.avgOrderValue;
  baseline.revenuePerYear = baseline.revenue * monthsPerYear;
  
  const targetedVisitors = input.monthlyVisitors * campaignReachDecimal;
  const targetedConversions = targetedVisitors * baselineConversionDecimal;
  const additionalConversions = targetedConversions * upliftDecimal;
  const additionalRevenue = additionalConversions * input.avgOrderValue;
  const campaignCosts = targetedVisitors * input.campaignCostPerUser;
  
  const withModel = {
    targetedVisitors,
    additionalConversions,
    additionalRevenue,
    campaignCosts,
    netRevenue: additionalRevenue - campaignCosts,
    netRevenuePerYear: 0,
  };
  withModel.netRevenuePerYear = withModel.netRevenue * monthsPerYear;
  
  const delta = {
    additionalRevenuePerYear: withModel.netRevenuePerYear,
    roi: campaignCosts > 0 ? (additionalRevenue - campaignCosts) / campaignCosts * 100 : 0,
  };
  
  return { baseline, withModel, delta };
}

// ========== Demand Forecasting ROI Calculator ==========
export const demandCalculatorDefinition: ROICalculatorDefinition = {
  id: "demand",
  title: "Demand Forecasting ROI",
  emoji: "📦",
  description: "Berechne die Einsparungen durch bessere Nachfrageprognosen.",
  sections: [
    {
      title: "Bestandsstruktur",
      fields: [
        { id: "skuCount", label: "Anzahl SKUs", unit: "", defaultValue: 10000, min: 100, hint: "Anzahl verschiedener Produkte" },
        { id: "avgInventoryValue", label: "Durchschn. Lagerwert pro SKU", unit: "€", defaultValue: 500, min: 10, hint: "Durchschnittlicher Warenwert im Lager" },
        { id: "annualRevenue", label: "Jahresumsatz", unit: "€", defaultValue: 50000000, min: 100000, hint: "Gesamtumsatz pro Jahr" },
      ],
    },
    {
      title: "Aktuelle Probleme",
      fields: [
        { id: "stockoutRate", label: "Stockout-Rate", unit: "%", defaultValue: 5, min: 0.1, max: 30, step: 0.1, hint: "Prozent der Nachfrage, die nicht erfüllt werden kann" },
        { id: "overstockRate", label: "Überbestand-Rate", unit: "%", defaultValue: 15, min: 0.1, max: 50, step: 0.1, hint: "Prozent des Lagers, der zu viel ist" },
        { id: "obsolescenceRate", label: "Abschreibungsrate", unit: "%", defaultValue: 5, min: 0.1, max: 30, step: 0.1, hint: "Prozent des Überstocks, der abgeschrieben wird" },
      ],
    },
    {
      title: "Erwartete Verbesserung",
      fields: [
        { id: "forecastImprovement", label: "Forecast-Verbesserung", unit: "%", defaultValue: 30, min: 5, max: 80, hint: "Um wie viel wird der WMAPE reduziert?" },
      ],
    },
  ],
};

export interface DemandInput {
  skuCount: number;
  avgInventoryValue: number;
  annualRevenue: number;
  stockoutRate: number;
  overstockRate: number;
  obsolescenceRate: number;
  forecastImprovement: number;
}

export interface DemandOutput {
  current: {
    totalInventoryValue: number;
    stockoutLoss: number;
    holdingCosts: number;
    obsolescenceLoss: number;
    totalLoss: number;
  };
  improved: {
    stockoutLoss: number;
    holdingCosts: number;
    obsolescenceLoss: number;
    totalLoss: number;
  };
  delta: {
    stockoutSavings: number;
    holdingSavings: number;
    obsolescenceSavings: number;
    totalSavings: number;
  };
}

export function calculateDemandROI(input: DemandInput): DemandOutput {
  const stockoutRateDecimal = input.stockoutRate / 100;
  const overstockRateDecimal = input.overstockRate / 100;
  const obsolescenceRateDecimal = input.obsolescenceRate / 100;
  const forecastImprovementDecimal = input.forecastImprovement / 100;
  
  // Annahme: 20% Marge, Lagerhaltungskosten 15% des Warenwerts
  const marginRate = 0.20;
  const holdingCostRate = 0.15;
  
  const totalInventoryValue = input.skuCount * input.avgInventoryValue;
  
  const current = {
    totalInventoryValue,
    stockoutLoss: input.annualRevenue * stockoutRateDecimal * marginRate,
    holdingCosts: totalInventoryValue * overstockRateDecimal * holdingCostRate,
    obsolescenceLoss: totalInventoryValue * overstockRateDecimal * obsolescenceRateDecimal,
    totalLoss: 0,
  };
  current.totalLoss = current.stockoutLoss + current.holdingCosts + current.obsolescenceLoss;
  
  // Verbesserung reduziert Stockouts und Overstock proportional
  const improved = {
    stockoutLoss: current.stockoutLoss * (1 - forecastImprovementDecimal),
    holdingCosts: current.holdingCosts * (1 - forecastImprovementDecimal),
    obsolescenceLoss: current.obsolescenceLoss * (1 - forecastImprovementDecimal),
    totalLoss: 0,
  };
  improved.totalLoss = improved.stockoutLoss + improved.holdingCosts + improved.obsolescenceLoss;
  
  const delta = {
    stockoutSavings: current.stockoutLoss - improved.stockoutLoss,
    holdingSavings: current.holdingCosts - improved.holdingCosts,
    obsolescenceSavings: current.obsolescenceLoss - improved.obsolescenceLoss,
    totalSavings: current.totalLoss - improved.totalLoss,
  };
  
  return { current, improved, delta };
}

// Export alle Definitionen
export const roiCalculators = [
  churnCalculatorDefinition,
  fraudCalculatorDefinition,
  conversionCalculatorDefinition,
  demandCalculatorDefinition,
];
