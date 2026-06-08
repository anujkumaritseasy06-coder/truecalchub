export type BlockUnit = 'feet' | 'inches' | 'yards' | 'meters' | 'centimeters';

export interface BlockDimensions {
  wallLength: number;
  wallHeight: number;
  blockLengthInches: number;
  blockHeightInches: number;
  mortarJointInches: number;
}

export interface BlockCalculationResult {
  wallAreaSqFt: number;
  wallAreaSqMeters: number;
  blockFaceAreaSqFt: number;
  rawBlocksRequired: number;
  wasteAdjustedBlocks: number;
  estimatedPallets: number;
  estimatedMortarBags: number;
}

/**
 * Converts a given value from the specified unit into decimal Feet.
 */
export function convertToFeet(value: number, unit: BlockUnit): number {
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
 * Core calculation engine for CMU Block tools.
 */
export function calculateBlocks(
  dims: BlockDimensions,
  wallUnit: BlockUnit,
  wasteFactorPct: number
): BlockCalculationResult {
  
  // 1. Calculate Total Wall Area in SqFt
  const wLength = convertToFeet(dims.wallLength || 0, wallUnit);
  const wHeight = convertToFeet(dims.wallHeight || 0, wallUnit);
  const wallAreaSqFt = wLength * wHeight;
  
  if (wallAreaSqFt <= 0) {
    return {
      wallAreaSqFt: 0,
      wallAreaSqMeters: 0,
      blockFaceAreaSqFt: 0,
      rawBlocksRequired: 0,
      wasteAdjustedBlocks: 0,
      estimatedPallets: 0,
      estimatedMortarBags: 0
    };
  }

  // 2. Calculate Block Face Area including the mortar joint
  // E.g. an 8x16 block with a 3/8" joint acts as an 8.375 x 16.375 block structurally
  const bLength = (dims.blockLengthInches || 0) + (dims.mortarJointInches || 0);
  const bHeight = (dims.blockHeightInches || 0) + (dims.mortarJointInches || 0);
  
  // Convert block area from sq inches to sq ft
  const blockFaceAreaSqFt = (bLength * bHeight) / 144;

  if (blockFaceAreaSqFt <= 0) {
    return {
      wallAreaSqFt,
      wallAreaSqMeters: wallAreaSqFt * 0.092903,
      blockFaceAreaSqFt: 0,
      rawBlocksRequired: 0,
      wasteAdjustedBlocks: 0,
      estimatedPallets: 0,
      estimatedMortarBags: 0
    };
  }

  // 3. Raw Block Count
  const rawBlocks = wallAreaSqFt / blockFaceAreaSqFt;

  // 4. Apply Waste Factor
  const wasteMultiplier = 1 + ((wasteFactorPct || 0) / 100);
  const wasteAdjustedBlocks = Math.ceil(rawBlocks * wasteMultiplier);

  // 5. Pallets & Mortar
  // Assuming 90 standard blocks per pallet
  const estimatedPallets = Math.ceil(wasteAdjustedBlocks / 90);
  
  // Industry standard: ~3 bags of mortar per 100 CMU blocks
  const estimatedMortarBags = Math.ceil(wasteAdjustedBlocks * (3 / 100));

  return {
    wallAreaSqFt,
    wallAreaSqMeters: wallAreaSqFt * 0.092903,
    blockFaceAreaSqFt,
    rawBlocksRequired: rawBlocks,
    wasteAdjustedBlocks,
    estimatedPallets,
    estimatedMortarBags,
  };
}
