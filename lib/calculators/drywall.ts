export type UnitSystem = 'imperial' | 'metric';
export type SheetSize = '4x8' | '4x10' | '4x12' | '4x14';

export interface RoomDimensions {
  length: number;
  width: number;
  height: number;
  includeCeiling: boolean;
}

export interface Exclusions {
  doors: number;
  doorWidth: number;
  doorHeight: number;
  windows: number;
  windowWidth: number;
  windowHeight: number;
  customSqFt: number; // custom exclusion area
  outsideCorners: number; // for corner bead calculation
}

export interface DrywallResult {
  grossArea: number;
  netArea: number;
  totalAreaWithWaste: number;
  sheetsRequired: number;
  jointTapeFeet: number;
  jointCompoundLbs: number;
  screwsNeeded: number;
  cornerBeadsNeeded: number;
  sheetSizeArea: number;
}

export function calculateDrywall(
  rooms: RoomDimensions[],
  exclusions: Exclusions,
  sheetSize: SheetSize,
  wasteFactor: number, // percentage, e.g. 10
  unit: UnitSystem = 'imperial'
): DrywallResult {
  
  let grossArea = 0;

  rooms.forEach(room => {
    // Walls area = 2 * (L * H) + 2 * (W * H)
    const wallsArea = (2 * room.length * room.height) + (2 * room.width * room.height);
    grossArea += wallsArea;
    
    // Ceiling area = L * W
    if (room.includeCeiling) {
      grossArea += (room.length * room.width);
    }
  });

  let excludedArea = 0;
  // Calculate standard exclusions
  excludedArea += (exclusions.doors * exclusions.doorWidth * exclusions.doorHeight);
  excludedArea += (exclusions.windows * exclusions.windowWidth * exclusions.windowHeight);
  excludedArea += exclusions.customSqFt;

  const netArea = Math.max(0, grossArea - excludedArea);
  
  const wasteMultiplier = 1 + (wasteFactor / 100);
  const totalAreaWithWaste = netArea * wasteMultiplier;

  let sheetArea = 32; // Default 4x8
  if (unit === 'imperial') {
    switch (sheetSize) {
      case '4x8': sheetArea = 32; break;
      case '4x10': sheetArea = 40; break;
      case '4x12': sheetArea = 48; break;
      case '4x14': sheetArea = 56; break;
    }
  } else {
    // Metric approximation: 4x8 feet ≈ 1.2x2.4 meters ≈ 2.88 sq meters
    switch (sheetSize) {
      case '4x8': sheetArea = 2.88; break;
      case '4x10': sheetArea = 3.60; break;
      case '4x12': sheetArea = 4.32; break;
      case '4x14': sheetArea = 5.04; break;
    }
  }

  const sheetsRequired = Math.ceil(totalAreaWithWaste / sheetArea);
  
  // Formulas based on sq ft (or sq m). We normalize to imperial for constant factors if needed, 
  // but if unit is metric, we need metric factors. 
  // Let's assume input dimensions are in feet if 'imperial' and meters if 'metric'.
  // We'll calculate material factors based on the total sheets, as sheets are a standardized unit of measure.
  
  // Constants per sheet (4x8 equivalent size)
  // Joint tape: ~37 feet per 100 sq ft => ~11.84 ft per 32 sq ft sheet. Let's use 0.37 per sq ft.
  // Mud: ~0.053 lbs per sq ft
  // Screws: ~32 screws per 4x8 sheet => 1 screw per sq ft.
  
  let areaForMats = totalAreaWithWaste;
  if (unit === 'metric') {
    // convert metric area (sq m) to sq ft for standard material estimations
    areaForMats = totalAreaWithWaste * 10.7639;
  }

  const jointTapeFeet = areaForMats * 0.37;
  const jointCompoundLbs = areaForMats * 0.053;
  const screwsNeeded = Math.ceil(areaForMats * 1); // approx 1 screw per sq ft
  
  // Corner beads: usually 1 per outside corner. Length depends on room height.
  // We'll just output the count of corner beads needed based on input.
  const cornerBeadsNeeded = exclusions.outsideCorners;

  return {
    grossArea,
    netArea,
    totalAreaWithWaste,
    sheetsRequired,
    jointTapeFeet: Math.ceil(jointTapeFeet),
    jointCompoundLbs: Math.ceil(jointCompoundLbs),
    screwsNeeded,
    cornerBeadsNeeded,
    sheetSizeArea: sheetArea
  };
}
