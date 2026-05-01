import { PersonaId } from './featureOptions';

export interface RandomSource {
  next(): number;
}

function hashString(input: string): number {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let result = Math.imul(value ^ (value >>> 15), value | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

export function createLegacyRandomSource(): RandomSource {
  return {
    next: () => Math.random(),
  };
}

export function createSeededRandomSource(seed: string): RandomSource {
  const generator = mulberry32(hashString(seed));

  return {
    next: () => generator(),
  };
}

export interface DeterministicSeedContext {
  gameStartFen: string;
  currentFen: string;
  moveCount: number;
  sideToMove: 'w' | 'b';
  persona: PersonaId;
}

export function buildDeterministicSeed({
  gameStartFen,
  currentFen,
  moveCount,
  sideToMove,
  persona,
}: DeterministicSeedContext): string {
  return [gameStartFen, currentFen, String(moveCount), sideToMove, persona].join('|');
}
