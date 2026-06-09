import { describe, it, expect } from 'vitest';
import { parseAppId, parseLabel, formatWindowTitle } from './instanceIdentity';

describe('parseAppId', () => {
  it('returns null for undefined', () => {
    expect(parseAppId(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseAppId('')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    expect(parseAppId('   ')).toBeNull();
  });

  it('returns valid app-id unchanged', () => {
    expect(parseAppId('goose-work')).toBe('goose-work');
  });

  it('returns null when value contains a space', () => {
    expect(parseAppId('goose work')).toBeNull();
  });

  it('returns null when value exceeds 64 characters', () => {
    expect(parseAppId('a'.repeat(65))).toBeNull();
  });

  it('returns null when value contains special shell characters', () => {
    expect(parseAppId('goose;rm -rf')).toBeNull();
  });

  it('accepts dots, underscores, and hyphens', () => {
    expect(parseAppId('com.example.goose_work-v2')).toBe('com.example.goose_work-v2');
  });

  it('accepts exactly 64 characters', () => {
    expect(parseAppId('a'.repeat(64))).toBe('a'.repeat(64));
  });
});

describe('parseLabel', () => {
  it('returns plain label unchanged', () => {
    expect(parseLabel('Work')).toBe('Work');
  });

  it('strips control characters', () => {
    expect(parseLabel('A\u0000B')).toBe('AB');
  });

  it('returns null for empty string', () => {
    expect(parseLabel('')).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(parseLabel(undefined)).toBeNull();
  });

  it('truncates to 64 characters', () => {
    expect(parseLabel('x'.repeat(100))).toBe('x'.repeat(64));
  });

  it('strips DEL character', () => {
    expect(parseLabel('A\u007FB')).toBe('AB');
  });
});

describe('formatWindowTitle', () => {
  it('returns undefined for null label', () => {
    expect(formatWindowTitle(null)).toBeUndefined();
  });

  it('returns formatted title with em-dash for a label', () => {
    expect(formatWindowTitle('Work')).toBe('Goose — Work');
  });
});
