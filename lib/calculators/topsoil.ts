export type TopsoilShape = 'rectangle' | 'circular';
export type TopsoilUnit = 'feet' | 'inches' | 'yards' | 'meters';

export interface TopsoilDimensions {
  length?: number;
  width?: number;
  depth?: number;
  diameter?: number;
}

export interface TopsoilCalculationResult {
  cubicFeet: number;
  cubicYards: number;
  totalTons: number;
  totalPounds: number;
  bags40lb: number;
  areaSquareFeet: number;
}

export function convertToFeet(value: number, unit: TopsoilUnit): number {
  if (value < 0 || isNaN(value)) return 0;
  switch (unit) {
    case 'feet': return value;
    case 'inches': return value / 12;
    case 'yards': return value * 3;
    case 'meters': return value * 3.28084;
    default: return value;
  }
}

/**
 * Core calculation engine for Topsoil.
 * Uses the industry standard: 1 Cubic Yard = 2,000 lbs (1 Ton)
 */
export function calculateTopsoil(
  shape: TopsoilShape,
  dims: TopsoilDimensions,
  unit: TopsoilUnit,
  settlingPct: number
): TopsoilCalculationResult {
  let cuFt = 0;
  let sqFt = 0;

  const l = convertToFeet(dims.length || 0, unit);
  const w = convertToFeet(dims.width || 0, unit);
  const d = convertToFeet(dims.depth || 0, unit);
  const dia = convertToFeet(dims.diameter || 0, unit);

  switch (shape) {
    case 'rectangle':
      sqFt = l * w;
      cuFt = sqFt * d;
      break;
    case 'circular':
      const radius = dia / 2;
      sqFt = Math.PI * (radius * radius);
      cuFt = sqFt * d;
      break;
    default:
      cuFt = 0;
  }

  // Apply Settling Multiplier
  const multiplier = 1 + (settlingPct / 100);
  const totalCuFt = cuFt * multiplier;

  const totalCuYards = totalCuFt / 27;
  
  // 1 Cubic Yard = 2000 lbs
  const totalPounds = totalCuYards * 2000;
  const totalTons = totalPounds / 2000;

  return {
    cubicFeet: totalCuFt,
    cubicYards: totalCuYards,
    totalTons: totalTons,
    totalPounds: totalPounds,
    bags40lb: Math.ceil(totalPounds / 40),
    areaSquareFeet: sqFt
  };
}
