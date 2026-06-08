export type MulchShape = 'rectangle' | 'circular';
export type MulchUnit = 'feet' | 'inches' | 'yards' | 'meters';

export interface MulchDimensions {
  length?: number;
  width?: number;
  depth?: number;
  diameter?: number;
}

export interface MulchCalculationResult {
  cubicFeet: number;
  cubicYards: number;
  bags1_5: number;
  bags2_0: number;
  bags3_0: number;
  areaSquareFeet: number;
}

export function convertToFeet(value: number, unit: MulchUnit): number {
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
 * Core calculation engine for Mulch.
 * Mulch is strictly volumetric. There is no weight (Tons) conversion
 * because wood moisture content makes weight incredibly unpredictable.
 */
export function calculateMulch(
  shape: MulchShape,
  dims: MulchDimensions,
  unit: MulchUnit
): MulchCalculationResult {
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

  const totalCuYards = cuFt / 27;

  return {
    cubicFeet: cuFt,
    cubicYards: totalCuYards,
    bags1_5: Math.ceil(cuFt / 1.5),
    bags2_0: Math.ceil(cuFt / 2.0),
    bags3_0: Math.ceil(cuFt / 3.0),
    areaSquareFeet: sqFt
  };
}
