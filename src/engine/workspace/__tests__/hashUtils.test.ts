import { describe, it, expect } from 'vitest';
import { generateHash, verifyHash } from '../hashUtils';

describe('generateHash', () => {
  it('should return a hex string', async () => {
    const hash = await generateHash('hello world');
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it('should produce consistent results for the same input', async () => {
    const hash1 = await generateHash('test data');
    const hash2 = await generateHash('test data');
    expect(hash1).toBe(hash2);
  });

  it('should produce different results for different inputs', async () => {
    const hash1 = await generateHash('input A');
    const hash2 = await generateHash('input B');
    expect(hash1).not.toBe(hash2);
  });

  it('should handle empty string', async () => {
    const hash = await generateHash('');
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should handle unicode characters', async () => {
    const hash = await generateHash('Kundendaten mit Ümläüten');
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });
});

describe('verifyHash', () => {
  it('should return true for matching hash', async () => {
    const data = 'my project data';
    const hash = await generateHash(data);
    const result = await verifyHash(data, hash);
    expect(result).toBe(true);
  });

  it('should return false for non-matching hash', async () => {
    const result = await verifyHash('data', 'invalidhash');
    expect(result).toBe(false);
  });

  it('should detect tampered data', async () => {
    const original = 'original data';
    const hash = await generateHash(original);
    const result = await verifyHash('tampered data', hash);
    expect(result).toBe(false);
  });
});
