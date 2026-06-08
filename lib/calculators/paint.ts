export type UnitSystem = 'imperial' | 'metric';
export type SurfaceTexture = 'smooth' | 'light_texture' | 'heavy_stucco' | 'bare_brick';
export type ProjectMode = 'interior' | 'exterior';

export interface RoomDimensions {
  length: number;
  width: number;
  height: number;
  paintCeiling: boolean;
  paintTrim: boolean;
}

export interface Exclusions {
  doors: number;
  doorWidth: number;
  doorHeight: number;
  windows: number;
  windowWidth: number;
  windowHeight: number;
}

export interface PaintSettings {
  mode: ProjectMode;
  texture: SurfaceTexture;
  coats: number;
  usePrimer: boolean;
  wasteFactor: number; // percentage, e.g., 10
}

export interface PaintResult {
  netWallArea: number;
  netCeilingArea: number;
  trimLinearLength: number;
  
  wallPaintGallons: number;
  ceilingPaintGallons: number;
  trimPaintGallons: number;
  primerGallons: number;
  
  tapeRolls: number;
}

export function calculatePaint(
  rooms: RoomDimensions[],
  exclusions: Exclusions,
  settings: PaintSettings,
  unit: UnitSystem = 'imperial'
): PaintResult {
  
  let totalGrossWallArea = 0;
  let totalCeilingArea = 0;
  let totalTrimLength = 0;

  rooms.forEach(room => {
    // Wall Area
    const wallArea = (2 * room.length * room.height) + (2 * room.width * room.height);
    totalGrossWallArea += wallArea;
    
    // Ceiling Area
    if (room.paintCeiling) {
      totalCeilingArea += (room.length * room.width);
    }
    
    // Trim length (baseboards usually)
    if (room.paintTrim) {
      totalTrimLength += (2 * room.length) + (2 * room.width);
    }
  });

  // Calculate standard exclusions
  const excludedArea = (exclusions.doors * exclusions.doorWidth * exclusions.doorHeight) + 
                       (exclusions.windows * exclusions.windowWidth * exclusions.windowHeight);

  // Subtract exclusions from walls only (assuming windows/doors are in walls)
  const netWallArea = Math.max(0, totalGrossWallArea - excludedArea);
  
  // Convert metric (sq m) to sq ft for standard material estimations if needed
  // Paint coverage is universally measured in sq ft/gallon or sq m/liter.
  // We will normalize to Imperial (Sq Ft / Gallons) for logic, and UI can handle metric conversions if needed, 
  // but to keep it simple, let's do all calculations based on Imperial equivalents.
  
  let conversionFactor = 1; // 1 if imperial
  if (unit === 'metric') {
    conversionFactor = 10.7639; // 1 sq meter = 10.7639 sq ft
  }

  const wallAreaSqFt = netWallArea * conversionFactor;
  const ceilingAreaSqFt = totalCeilingArea * conversionFactor;
  // Linear feet conversion (1 meter = 3.28084 ft)
  const trimFeet = totalTrimLength * (unit === 'metric' ? 3.28084 : 1);

  // Base Spread Rate: ~350 sq ft per gallon for standard interior smooth drywall.
  // Exterior paint on siding is often ~300 sq ft per gallon.
  let baseSpread = settings.mode === 'interior' ? 350 : 300;

  // Adjust for Texture
  let textureMultiplier = 1;
  switch (settings.texture) {
    case 'smooth': textureMultiplier = 1; break;
    case 'light_texture': textureMultiplier = 0.85; break; // absorbs 15% more paint
    case 'heavy_stucco': textureMultiplier = 0.65; break;  // absorbs 35% more paint
    case 'bare_brick': textureMultiplier = 0.50; break;    // absorbs 50% more paint
  }

  const actualSpreadPerGallon = baseSpread * textureMultiplier;
  const primerSpreadPerGallon = 250 * textureMultiplier; // Primer is thicker and absorbs more

  // Calculate raw gallons needed
  let rawWallPaint = (wallAreaSqFt / actualSpreadPerGallon) * settings.coats;
  let rawCeilingPaint = (ceilingAreaSqFt / actualSpreadPerGallon) * (settings.mode === 'interior' ? 1 : settings.coats); // usually 1 coat for ceilings
  
  // Trim paint: ~1 gallon covers 300 linear feet of 6-inch trim
  let rawTrimPaint = (trimFeet / 300) * settings.coats;

  let rawPrimer = 0;
  if (settings.usePrimer) {
    // Primer usually applied to walls and ceilings
    rawPrimer = ((wallAreaSqFt + ceilingAreaSqFt) / primerSpreadPerGallon) * 1; // usually 1 coat of primer
  }

  // Apply waste factor
  const wasteMultiplier = 1 + (settings.wasteFactor / 100);
  
  const wallPaintGallons = Math.ceil(rawWallPaint * wasteMultiplier);
  const ceilingPaintGallons = Math.ceil(rawCeilingPaint * wasteMultiplier);
  const trimPaintGallons = Math.ceil(rawTrimPaint * wasteMultiplier);
  const primerGallons = Math.ceil(rawPrimer * wasteMultiplier);

  // Tape calculation:
  // Tape is needed around doors, windows, ceiling line (if ceiling not painted or different color), and baseboards.
  // Let's roughly estimate tape needed based on trim and exclusions.
  // 1 roll = ~180 linear feet (standard 60 yards)
  let tapeFeetNeeded = trimFeet + 
                       (exclusions.doors * (exclusions.doorWidth + 2 * exclusions.doorHeight) * (unit === 'metric' ? 3.28 : 1)) +
                       (exclusions.windows * (2 * exclusions.windowWidth + 2 * exclusions.windowHeight) * (unit === 'metric' ? 3.28 : 1));
  
  const tapeRolls = Math.ceil((tapeFeetNeeded * wasteMultiplier) / 180);

  return {
    netWallArea,
    netCeilingArea: totalCeilingArea,
    trimLinearLength: totalTrimLength,
    wallPaintGallons: wallPaintGallons || 0,
    ceilingPaintGallons: ceilingPaintGallons || 0,
    trimPaintGallons: trimPaintGallons || 0,
    primerGallons: primerGallons || 0,
    tapeRolls: tapeRolls || 0
  };
}
