export type GravelShape = 'rectangle' | 'square' | 'circular';
export type GravelUnit = 'feet' | 'inches' | 'yards' | 'meters' | 'centimeters';

export type RockType = 'crushed_stone' | 'pea_gravel' | 'river_rock' | 'sand' | 'limestone' | 'drainage_rock';

export interface GravelDimensions {
  length?: number;
  width?: number;
  depth?: number;
  diameter?: number;
}

export interface GravelCalculationResult {
  cubicYards: number;
  cubicFeet: number;
  cubicMeters: number;
  totalPounds: number;
  totalTons: number;
  bags50lb: number;
  bags40lb: number;
  areaSquareFeet: number;
  primaryArea?: { label: string; sqFt: number; sqMeters: number };
}

/**
 * Density lookup in LBS per Cubic Yard
 */
export const ROCK_DENSITIES: Record<RockType, number> = {
  crushed_stone: 2800,   // Standard #57 or base
  pea_gravel: 2600,      // Slightly lighter due to roundness/voids
  river_rock: 2700,      // Smooth stones
  sand: 2600,            // Masonry or leveling sand
  limestone: 2750,       // Dense crushed limestone
  drainage_rock: 2500    // Large clear stone (#3 or #4) with lots of void space
};

export function convertToFeet(value: number, unit: GravelUnit): number {
  if (value < 0 || isNaN(value)) return 0;
  switch (unit) {
    case 'feet': return value;
    case 'inches': return value / 12;
    case 'yards': return value * 3;
    case 'meters': return value * 3.28084;
    case 'centimeters': return value * 0.0328084;
    default: return value;
  }
}

/**
 * Core calculation engine for Gravel and Aggregates.
 */
export function calculateGravel(
  shape: GravelShape,
  dims: GravelDimensions,
  unit: GravelUnit,
  rockType: RockType,
  compactionPct: number
): GravelCalculationResult {
  let cuFt = 0;
  let sqFt = 0;
  let primaryAreaLabel = 'Surface Area';

  const l = convertToFeet(dims.length || 0, unit);
  const w = convertToFeet(dims.width || 0, unit);
  const d = convertToFeet(dims.depth || 0, unit);
  const dia = convertToFeet(dims.diameter || 0, unit);

  switch (shape) {
    case 'rectangle':
      cuFt = l * w * d;
      sqFt = l * w;
      break;
    case 'square':
      cuFt = l * l * d;
      sqFt = l * l;
      break;
    case 'circular':
      const radius = dia / 2;
      sqFt = Math.PI * (radius * radius);
      cuFt = sqFt * d;
      break;
    default:
      cuFt = 0;
  }

  // Apply Compaction/Waste Multiplier
  const multiplier = 1 + (compactionPct / 100);
  const totalCuFt = cuFt * multiplier;

  // Volumetric Conversions
  const totalCuYards = totalCuFt / 27;
  const totalCuMeters = totalCuFt * 0.0283168;

  // Density Weight Calculation
  const densityPerYard = ROCK_DENSITIES[rockType] || 2800;
  const totalPounds = totalCuYards * densityPerYard;
  const totalTons = totalPounds / 2000;

  return {
    cubicYards: totalCuYards,
    cubicFeet: totalCuFt,
    cubicMeters: totalCuMeters,
    totalPounds: totalPounds,
    totalTons: totalTons,
    bags50lb: Math.ceil(totalPounds / 50),
    bags40lb: Math.ceil(totalPounds / 40),
    areaSquareFeet: sqFt,
    primaryArea: sqFt > 0 ? {
      label: primaryAreaLabel,
      sqFt: sqFt,
      sqMeters: sqFt * 0.092903
    } : undefined
  };
}
