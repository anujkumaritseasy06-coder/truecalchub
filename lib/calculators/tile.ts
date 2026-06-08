export type UnitSystem = 'imperial' | 'metric';
export type TilePattern = 'straight' | 'diagonal' | 'brick' | 'herringbone';

export interface TileArea {
  length: number;
  width: number;
}

export interface TileDeduction {
  length: number;
  width: number;
}

export interface TileSettings {
  tileLength: number; // inches or cm
  tileWidth: number; // inches or cm
  tileThickness: number; // inches or mm
  jointWidth: number; // inches or mm
  pattern: TilePattern;
  customWasteFactor?: number;
  boxQuantity: number;
  useBackerboard: boolean;
}

export interface TileResult {
  netAreaSqFt: number;
  grossAreaSqFt: number; // with waste
  totalTiles: number;
  totalBoxes: number;
  thinsetBags: number; // 50lb bags
  groutPounds: number;
  backerboardSheets: number; // 3x5 sheets
  recommendedWastePercent: number;
}

export function calculateTile(
  areas: TileArea[],
  deductions: TileDeduction[],
  settings: TileSettings,
  unit: UnitSystem = 'imperial'
): TileResult {
  
  let totalGrossArea = 0;
  areas.forEach(area => {
    totalGrossArea += (area.length * area.width);
  });

  let totalDeductions = 0;
  deductions.forEach(deduction => {
    totalDeductions += (deduction.length * deduction.width);
  });

  const netArea = Math.max(0, totalGrossArea - totalDeductions);

  // Convert to Sq Ft if metric
  const sqFtConversion = unit === 'metric' ? 10.7639 : 1;
  const netAreaSqFt = netArea * sqFtConversion;

  // Determine Waste Factor based on pattern
  let recommendedWaste = 10;
  switch (settings.pattern) {
    case 'straight':
    case 'brick':
      recommendedWaste = 10;
      break;
    case 'diagonal':
      recommendedWaste = 15;
      break;
    case 'herringbone':
      recommendedWaste = 20;
      break;
  }

  const activeWaste = settings.customWasteFactor !== undefined ? settings.customWasteFactor : recommendedWaste;
  const grossAreaSqFt = netAreaSqFt * (1 + (activeWaste / 100));

  // Tile dimensions to inches for calculations
  const lengthIn = unit === 'metric' ? settings.tileLength / 2.54 : settings.tileLength;
  const widthIn = unit === 'metric' ? settings.tileWidth / 2.54 : settings.tileWidth;
  const thicknessIn = unit === 'metric' ? settings.tileThickness / 25.4 : settings.tileThickness;
  const jointIn = unit === 'metric' ? settings.jointWidth / 25.4 : settings.jointWidth;

  // Area of one tile in sq ft
  const tileAreaSqFt = (lengthIn * widthIn) / 144;
  
  // Total Tiles
  const totalTiles = tileAreaSqFt > 0 ? Math.ceil(grossAreaSqFt / tileAreaSqFt) : 0;
  
  // Total Boxes
  const totalBoxes = settings.boxQuantity > 0 ? Math.ceil(totalTiles / settings.boxQuantity) : 0;

  // Thinset mortar calculation: roughly one 50lb bag per 60 sq ft (assuming standard 1/4"x3/8" trowel)
  const thinsetBags = Math.ceil(grossAreaSqFt / 60);

  // Advanced Grout Calculation (Industry standard formula)
  // Grout Pounds = ((L + W) / (L * W)) * Thickness * Joint Width * SqFt * Density Factor
  // Where measurements are in inches. Standard sanded grout density factor is approx 150.
  let groutPounds = 0;
  if (lengthIn > 0 && widthIn > 0) {
    groutPounds = ((lengthIn + widthIn) / (lengthIn * widthIn)) * thicknessIn * jointIn * grossAreaSqFt * 150;
  }
  groutPounds = Math.ceil(groutPounds);

  // Backerboard calculation (standard 3x5 ft sheets = 15 sq ft per sheet)
  // Backerboard doesn't use the full tile waste factor, usually 5-10% is enough, let's use 10%
  let backerboardSheets = 0;
  if (settings.useBackerboard) {
    backerboardSheets = Math.ceil((netAreaSqFt * 1.10) / 15);
  }

  return {
    netAreaSqFt,
    grossAreaSqFt,
    totalTiles,
    totalBoxes,
    thinsetBags,
    groutPounds,
    backerboardSheets,
    recommendedWastePercent: recommendedWaste
  };
}
