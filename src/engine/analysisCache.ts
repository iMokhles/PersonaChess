import { AnalyzedMove, ClassifiedMove } from './types';

export interface AnalysisCacheEntry {
  key: string;
  moves: AnalyzedMove[];
  classifiedMoves?: ClassifiedMove[];
  timestamp: number;
}

export function buildAnalysisCacheKey(
  fen: string,
  depth: number,
  multiPV: number,
): string {
  return `${fen}|depth:${depth}|multipv:${multiPV}`;
}

export class AnalysisCache {
  private entries = new Map<string, AnalysisCacheEntry>();

  constructor(private maxSize: number = 200) {}

  configure(maxSize: number): void {
    this.maxSize = Math.max(1, maxSize);
    this.trim();
  }

  get(key: string): AnalysisCacheEntry | null {
    const entry = this.entries.get(key);

    if (!entry) {
      return null;
    }

    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry;
  }

  set(entry: AnalysisCacheEntry): void {
    this.entries.set(entry.key, entry);
    this.trim();
  }

  invalidate(key?: string): void {
    if (key) {
      this.entries.delete(key);
      return;
    }

    this.entries.clear();
  }

  get size(): number {
    return this.entries.size;
  }

  private trim(): void {
    while (this.entries.size > this.maxSize) {
      const oldestKey = this.entries.keys().next().value;

      if (!oldestKey) {
        break;
      }

      this.entries.delete(oldestKey);
    }
  }
}

export const analysisCache = new AnalysisCache();
