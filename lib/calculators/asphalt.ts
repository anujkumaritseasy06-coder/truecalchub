export type AsphaltShape = 'rectangle' | 'circular';
export type AsphaltUnit = 'feet' | 'inches' | 'yards' | 'meters';

export interface AsphaltDimensions {
  length?: number;
  width?: number;
  depth?: number;
  diameter?: number;
}

export interface AsphaltCalculationResult {
  cubicFeet: number;
  cubicYards: number;
  totalPounds: number;
  totalTons: number;
  tackCoatGallons: number;
  areaSquareFeet: number;
}

export function convertToFeet(value: number, unit: AsphaltUnit): number {
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
 * Core calculation engine for Hot Mix Asphalt.
 * Based on industry standard density of 145 lbs per cubic foot.
 */
export function calculateAsphalt(
  shape: AsphaltShape,
  dims: AsphaltDimensions,
  unit: AsphaltUnit
): AsphaltCalculationResult {
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

  // Asphalt Density Math (145 lbs per cubic foot)
  const densityPerCuFt = 145;
  const totalPounds = cuFt * densityPerCuFt;
  const totalTons = totalPounds / 2000;

  // Volumetric Conversions
  const totalCuYards = cuFt / 27;

  // Tack Coat Math (0.05 gallons per square yard)
  const sqYards = sqFt / 9;
  const tackCoatGallons = sqYards * 0.05;

  return {
    cubicFeet: cuFt,
    cubicYards: totalCuYards,
    totalPounds: totalPounds,
    totalTons: totalTons,
    tackCoatGallons: tackCoatGallons,
    areaSquareFeet: sqFt
  };
}
