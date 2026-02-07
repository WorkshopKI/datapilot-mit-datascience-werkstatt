// Data Generator Interface (Mock Implementation for Phase 1)
// Generates synthetic datasets for learning purposes

import { Feature, ProjectType } from '../types';

export interface GeneratedDataset {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  description: string;
}

export interface DataGeneratorConfig {
  type: ProjectType;
  rowCount: number;
  features: Feature[];
  noiseFactor?: number;
}

// Mock datasets for Phase 1
const MOCK_CHURN_DATA: Record<string, unknown>[] = [
  { Kunde_ID: 'K001', Alter: 35, Vertragslaufzeit_Monate: 24, Monatliche_Kosten: 79.99, Support_Tickets: 2, Churn: 'Nein' },
  { Kunde_ID: 'K002', Alter: 52, Vertragslaufzeit_Monate: 6, Monatliche_Kosten: 99.99, Support_Tickets: 8, Churn: 'Ja' },
  { Kunde_ID: 'K003', Alter: 28, Vertragslaufzeit_Monate: 48, Monatliche_Kosten: 49.99, Support_Tickets: 0, Churn: 'Nein' },
  { Kunde_ID: 'K004', Alter: 41, Vertragslaufzeit_Monate: 12, Monatliche_Kosten: 89.99, Support_Tickets: 5, Churn: 'Ja' },
  { Kunde_ID: 'K005', Alter: 63, Vertragslaufzeit_Monate: 36, Monatliche_Kosten: 59.99, Support_Tickets: 1, Churn: 'Nein' },
];

export class DataGenerator {
  static generate(config: DataGeneratorConfig): GeneratedDataset {
    console.log('[DataGenerator] Mock generate:', config);
    
    // For Phase 1, return mock data
    const columns = config.features.map(f => f.name);
    
    return {
      columns,
      rows: MOCK_CHURN_DATA,
      rowCount: MOCK_CHURN_DATA.length,
      description: `Mock-Datensatz mit ${MOCK_CHURN_DATA.length} Zeilen für ${config.type}`,
    };
  }

  static getPreviewData(projectType: ProjectType): GeneratedDataset {
    switch (projectType) {
      case 'klassifikation':
        return {
          columns: ['Kunde_ID', 'Alter', 'Vertragslaufzeit_Monate', 'Monatliche_Kosten', 'Support_Tickets', 'Churn'],
          rows: MOCK_CHURN_DATA,
          rowCount: MOCK_CHURN_DATA.length,
          description: 'Kundenabwanderung (Churn) Beispieldaten',
        };
      case 'regression':
        return {
          columns: ['Quadratmeter', 'Zimmer', 'Baujahr', 'Stadtteil', 'Preis'],
          rows: [
            { Quadratmeter: 85, Zimmer: 3, Baujahr: 2010, Stadtteil: 'Zentrum', Preis: 320000 },
            { Quadratmeter: 120, Zimmer: 4, Baujahr: 2015, Stadtteil: 'Vorstadt', Preis: 450000 },
          ],
          rowCount: 2,
          description: 'Immobilienpreis Beispieldaten',
        };
      case 'clustering':
        return {
          columns: ['Kunde_ID', 'Jahresumsatz', 'Bestellhäufigkeit', 'Durchschnittlicher_Warenkorb'],
          rows: [
            { Kunde_ID: 'K001', Jahresumsatz: 5000, Bestellhäufigkeit: 12, Durchschnittlicher_Warenkorb: 416 },
            { Kunde_ID: 'K002', Jahresumsatz: 250, Bestellhäufigkeit: 2, Durchschnittlicher_Warenkorb: 125 },
          ],
          rowCount: 2,
          description: 'Kundensegmentierung Beispieldaten',
        };
      default:
        return { columns: [], rows: [], rowCount: 0, description: '' };
    }
  }
}
