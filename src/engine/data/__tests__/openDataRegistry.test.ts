import { describe, it, expect } from 'vitest';
import {
  DATASET_REGISTRY,
  getDatasetsByType,
  getBerlinDatasets,
  lorToBezirk,
  LOR_BEZIRK_MAP,
  type DatasetId,
  type DatasetInfo,
} from '@/data/openDataRegistry';

describe('openDataRegistry', () => {
  describe('DATASET_REGISTRY', () => {
    it('contains exactly 6 datasets', () => {
      expect(Object.keys(DATASET_REGISTRY)).toHaveLength(6);
    });

    it('has correct IDs', () => {
      const ids = Object.keys(DATASET_REGISTRY);
      expect(ids).toContain('titanic');
      expect(ids).toContain('iris');
      expect(ids).toContain('berlin-kfz-diebstahl');
      expect(ids).toContain('berlin-kriminalitaetsatlas');
      expect(ids).toContain('berlin-radzaehldaten');
      expect(ids).toContain('berlin-abwasser-viruslast');
    });

    it('all entries have required fields', () => {
      for (const [id, info] of Object.entries(DATASET_REGISTRY)) {
        expect(info.id).toBe(id);
        expect(info.name).toBeTruthy();
        expect(info.emoji).toBeTruthy();
        expect(info.description).toBeTruthy();
        expect(info.businessQuestion).toBeTruthy();
        expect(info.source).toBeTruthy();
        expect(info.sourceUrl).toBeTruthy();
        expect(info.license).toBeTruthy();
        expect(info.bundledCsvPath).toBeTruthy();
        expect(info.mlType).toMatch(/^(klassifikation|regression|clustering)$/);
        expect(info.approxRows).toBeGreaterThan(0);
        expect(info.columns).toBeGreaterThan(0);
        expect(info.featureDefinitions.length).toBeGreaterThan(0);
        expect(info.dataHints.length).toBeGreaterThan(0);
        expect(info.tags.length).toBeGreaterThan(0);
      }
    });

    it('all feature definitions have required fields', () => {
      for (const info of Object.values(DATASET_REGISTRY)) {
        for (const fd of info.featureDefinitions) {
          expect(fd.name).toBeTruthy();
          expect(fd.type).toMatch(/^(numerical|categorical|datetime|text)$/);
          expect(typeof fd.isTarget).toBe('boolean');
          expect(fd.description).toBeTruthy();
        }
      }
    });

    it('classification datasets have a target feature', () => {
      const classification = Object.values(DATASET_REGISTRY).filter(d => d.mlType === 'klassifikation');
      for (const ds of classification) {
        const hasTarget = ds.featureDefinitions.some(f => f.isTarget);
        expect(hasTarget).toBe(true);
      }
    });

    it('clustering dataset has no target feature', () => {
      const atlas = DATASET_REGISTRY['berlin-kriminalitaetsatlas'];
      const hasTarget = atlas.featureDefinitions.some(f => f.isTarget);
      expect(hasTarget).toBe(false);
    });
  });

  describe('getDatasetsByType', () => {
    it('returns 3 classification datasets', () => {
      const result = getDatasetsByType('klassifikation');
      expect(result).toHaveLength(3);
      expect(result.map(d => d.id)).toContain('titanic');
      expect(result.map(d => d.id)).toContain('iris');
      expect(result.map(d => d.id)).toContain('berlin-kfz-diebstahl');
    });

    it('returns 2 regression datasets', () => {
      const result = getDatasetsByType('regression');
      expect(result).toHaveLength(2);
      expect(result.map(d => d.id)).toContain('berlin-radzaehldaten');
      expect(result.map(d => d.id)).toContain('berlin-abwasser-viruslast');
    });

    it('returns 1 clustering dataset', () => {
      const result = getDatasetsByType('clustering');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('berlin-kriminalitaetsatlas');
    });
  });

  describe('getBerlinDatasets', () => {
    it('returns exactly 4 Berlin datasets', () => {
      const result = getBerlinDatasets();
      expect(result).toHaveLength(4);
    });

    it('all returned datasets have isBerlinOpenData=true', () => {
      const result = getBerlinDatasets();
      for (const ds of result) {
        expect(ds.isBerlinOpenData).toBe(true);
      }
    });

    it('does not include classic datasets', () => {
      const result = getBerlinDatasets();
      const ids = result.map(d => d.id);
      expect(ids).not.toContain('titanic');
      expect(ids).not.toContain('iris');
    });
  });

  describe('lorToBezirk', () => {
    it('maps known LOR codes to Bezirk names', () => {
      expect(lorToBezirk('01234567')).toBe('Mitte');
      expect(lorToBezirk('02345678')).toBe('Friedrichshain-Kreuzberg');
      expect(lorToBezirk('03456789')).toBe('Pankow');
      expect(lorToBezirk('12000000')).toBe('Reinickendorf');
    });

    it('returns Unbekannt for unknown codes', () => {
      expect(lorToBezirk('99999999')).toBe('Unbekannt');
      expect(lorToBezirk('00000000')).toBe('Unbekannt');
    });

    it('handles short codes gracefully', () => {
      expect(lorToBezirk('')).toBe('Unbekannt');
      expect(lorToBezirk('0')).toBe('Unbekannt');
    });
  });

  describe('LOR_BEZIRK_MAP', () => {
    it('contains all 12 Berlin Bezirke', () => {
      expect(Object.keys(LOR_BEZIRK_MAP)).toHaveLength(12);
    });
  });
});
