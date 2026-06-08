export type ConcreteShape = 'rectangle' | 'square' | 'circular' | 'column' | 'footing' | 'wall' | 'stairs';
export type ConcreteUnit = 'feet' | 'inches' | 'yards' | 'meters' | 'centimeters';

export interface ConcreteDimensions {
  length?: number;
  width?: number;
  depth?: number;
  diameter?: number;
  runs?: number;
  runDepth?: number; // depth of a single stair run
}

export interface ConcreteCalculationResult {
  cubicYards: number;
  cubicFeet: number;
  cubicMeters: number;
  liters: number;
  bags80lb: number;
  bags60lb: number;
  bags50lb: number;
  bags40lb: number;
  trucksRequired: number;
  areaSquareFeet: number;
  areaSquareMeters: number;
  primaryArea?: { label: string; sqFt: number; sqMeters: number };
  rawCubicFeet: number; // before waste
}

/**
 * Converts a given value from the specified unit into decimal Feet.
 */
export function convertToFeet(value: number, unit: ConcreteUnit): number {
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
 * Core calculation engine for all Concrete tools.
 * Normalizes inputs to Cubic Feet, applies waste, and returns comprehensive yield data.
 */
export function calculateConcrete(
  shape: ConcreteShape,
  dims: ConcreteDimensions,
  unit: ConcreteUnit,
  wasteFactorPct: number
): ConcreteCalculationResult {
  let cuFt = 0;
  let sqFt = 0;
  let primaryAreaLabel = '';

  const l = convertToFeet(dims.length || 0, unit);
  const w = convertToFeet(dims.width || 0, unit);
  const d = convertToFeet(dims.depth || 0, unit);
  const dia = convertToFeet(dims.diameter || 0, unit);

  switch (shape) {
    case 'rectangle':
    case 'footing':
    case 'wall':
      cuFt = l * w * d;
      sqFt = l * w;
      primaryAreaLabel = shape === 'wall' ? 'Wall Surface Area' : shape === 'footing' ? 'Footing Surface Area' : 'Slab Area';
      break;
    case 'square':
      cuFt = l * l * d;
      sqFt = l * l;
      primaryAreaLabel = 'Slab Area';
      break;
    case 'circular':
      const radius = dia / 2;
      sqFt = Math.PI * (radius * radius);
      cuFt = sqFt * d;
      primaryAreaLabel = 'Slab Area';
      break;
    case 'column':
      const colRadius = dia / 2;
      sqFt = Math.PI * (colRadius * colRadius); // Cross section
      cuFt = sqFt * d; // d acts as height here
      primaryAreaLabel = 'Column Cross Section Area';
      break;
    case 'stairs':
      const runs = dims.runs || 0;
      const rDepth = convertToFeet(dims.runDepth || 0, unit);
      // For a stair, volume of one step = width * runDepth * riserHeight(depth)
      const stepVol = w * rDepth * d;
      cuFt = stepVol * runs;
      sqFt = w * rDepth * runs; // total tread area
      primaryAreaLabel = 'Total Tread Surface Area';
      break;
    default:
      cuFt = 0;
  }

  const rawCubicFeet = cuFt;

  // Apply Waste Allowance
  const wasteMultiplier = 1 + (wasteFactorPct / 100);
  const totalCuFt = cuFt * wasteMultiplier;

  // Metric Conversions
  const totalCuYards = totalCuFt / 27;
  const totalCuMeters = totalCuFt * 0.0283168;
  const totalLiters = totalCuFt * 28.3168;

  // Yield Assumptions
  const yield80 = 0.60;
  const yield60 = 0.45;
  const yield50 = 0.375;
  const yield40 = 0.30;
  const truckCapacity = 10; // cubic yards

  return {
    cubicYards: totalCuYards,
    cubicFeet: totalCuFt,
    cubicMeters: totalCuMeters,
    liters: totalLiters,
    bags80lb: Math.ceil(totalCuFt / yield80),
    bags60lb: Math.ceil(totalCuFt / yield60),
    bags50lb: Math.ceil(totalCuFt / yield50),
    bags40lb: Math.ceil(totalCuFt / yield40),
    trucksRequired: Math.ceil(totalCuYards / truckCapacity),
    rawCubicFeet,
    areaSquareFeet: sqFt,
    areaSquareMeters: sqFt * 0.092903,
    primaryArea: sqFt > 0 ? {
      label: primaryAreaLabel,
      sqFt: sqFt,
      sqMeters: sqFt * 0.092903
    } : undefined
  };
}
