export type UnitSystem = 'imperial' | 'metric';
export type InsulationMaterial = 'fiberglass_batt' | 'blown_cellulose' | 'blown_fiberglass' | 'spray_foam_closed' | 'spray_foam_open' | 'rigid_foam';
export type FramingSpacing = '16_oc' | '24_oc' | 'none';

export interface InsulationArea {
  length: number;
  width: number;
}

export interface InsulationDeduction {
  length: number;
  width: number;
}

export interface InsulationSettings {
  material: InsulationMaterial;
  targetRValue: number;
  framingSpacing: FramingSpacing;
  useVaporBarrier: boolean;
  wasteFactor: number;
}

export interface InsulationResult {
  grossAreaSqFt: number;
  netAreaSqFt: number;
  
  requiredThicknessInches: number;
  
  // Material specific outputs
  battRolls: number; // Assuming standard 40 sqft roll
  blownBags: number; // Assuming standard coverage charts
  sprayFoamBoardFeet: number;
  sprayFoamKits: number; // Assuming 600 board-foot kit
  rigidFoamSheets: number; // 4x8 sheet (32 sqft)
  
  vaporBarrierRolls: number; // Assuming 500 sqft roll
  
  // Advanced feature: rough payback estimation
  estimatedEnergySavingsPerYear: number;
}

export function calculateInsulation(
  areas: InsulationArea[],
  deductions: InsulationDeduction[],
  settings: InsulationSettings,
  unit: UnitSystem = 'imperial'
): InsulationResult {
  
  let totalGrossArea = 0;
  areas.forEach(area => {
    totalGrossArea += (area.length * area.width);
  });

  let totalDeductions = 0;
  deductions.forEach(deduction => {
    totalDeductions += (deduction.length * deduction.width);
  });

  const rawArea = Math.max(0, totalGrossArea - totalDeductions);
  const sqFtConversion = unit === 'metric' ? 10.7639 : 1;
  const rawAreaSqFt = rawArea * sqFtConversion;

  // Framing Deductions
  // 16" O.C. framing typically takes up 9-10% of the wall/ceiling area
  // 24" O.C. framing typically takes up 6-7% of the area
  let framingDeductionPercent = 0;
  if (settings.framingSpacing === '16_oc') framingDeductionPercent = 0.095;
  if (settings.framingSpacing === '24_oc') framingDeductionPercent = 0.065;

  // The Net Area is the actual cavity space that needs insulation
  const netAreaSqFt = rawAreaSqFt * (1 - framingDeductionPercent);
  
  // Add waste factor
  const installationAreaWithWaste = netAreaSqFt * (1 + (settings.wasteFactor / 100));

  // Determine R-Value per inch based on material
  let rValuePerInch = 0;
  switch (settings.material) {
    case 'fiberglass_batt': rValuePerInch = 3.14; break;
    case 'blown_cellulose': rValuePerInch = 3.5; break;
    case 'blown_fiberglass': rValuePerInch = 2.5; break;
    case 'spray_foam_closed': rValuePerInch = 6.5; break;
    case 'spray_foam_open': rValuePerInch = 3.6; break;
    case 'rigid_foam': rValuePerInch = 5.0; break; // XPS foam average
  }

  // Calculate required thickness to hit target R-Value
  const requiredThicknessInches = settings.targetRValue / rValuePerInch;

  // Material Estimation
  let battRolls = 0;
  let blownBags = 0;
  let sprayFoamBoardFeet = 0;
  let sprayFoamKits = 0;
  let rigidFoamSheets = 0;

  switch (settings.material) {
    case 'fiberglass_batt':
      // Standard roll covers ~40 sq ft depending on thickness. We use a generalized 40 sqft for calculation simplicity.
      battRolls = Math.ceil(installationAreaWithWaste / 40);
      break;
      
    case 'blown_cellulose':
      // A standard 25-30lb bag of cellulose covers ~40 sq ft at R-30 (approx 8.5 inches thick)
      // Volume calculation: 1 bag ≈ 30 cubic feet of expanded material. 
      // Cubic feet needed = (Area * Thickness) / 12
      const cubicFeetCellulose = (installationAreaWithWaste * requiredThicknessInches) / 12;
      blownBags = Math.ceil(cubicFeetCellulose / 15); // Rough industry average yield
      break;
      
    case 'blown_fiberglass':
      const cubicFeetFiberglass = (installationAreaWithWaste * requiredThicknessInches) / 12;
      blownBags = Math.ceil(cubicFeetFiberglass / 25); // Fiberglass bags yield more cubic volume
      break;
      
    case 'spray_foam_closed':
    case 'spray_foam_open':
      // Board feet = Sq Ft * Thickness in inches
      sprayFoamBoardFeet = installationAreaWithWaste * requiredThicknessInches;
      // Standard commercial kit yields 600 board feet
      sprayFoamKits = Math.ceil(sprayFoamBoardFeet / 600);
      break;
      
    case 'rigid_foam':
      // 4x8 sheet = 32 sq ft. 
      // If required thickness is 4 inches and sheets are 2 inches, they need 2 layers.
      // We calculate total sq ft needed by layers.
      // Assuming 2-inch thick standard boards
      const layersNeeded = Math.ceil(requiredThicknessInches / 2);
      rigidFoamSheets = Math.ceil((installationAreaWithWaste * layersNeeded) / 32);
      break;
  }

  // Vapor barrier: covers gross area since it goes over studs
  let vaporBarrierRolls = 0;
  if (settings.useVaporBarrier) {
    const vaporWaste = rawAreaSqFt * (1 + (settings.wasteFactor / 100));
    vaporBarrierRolls = Math.ceil(vaporWaste / 500); // 500 sq ft rolls
  }

  // Advanced Feature: Energy Payback
  // Rough estimate: Upgrading to R-38+ can save ~$0.15 to $0.25 per sqft per year depending on climate.
  // We use a simplified formula: (Target R - 10) * 0.01 * netAreaSqFt
  const savingsFactor = Math.max(0, settings.targetRValue - 10) * 0.012;
  const estimatedEnergySavingsPerYear = netAreaSqFt * savingsFactor;

  return {
    grossAreaSqFt: rawAreaSqFt,
    netAreaSqFt,
    requiredThicknessInches,
    battRolls,
    blownBags,
    sprayFoamBoardFeet,
    sprayFoamKits,
    rigidFoamSheets,
    vaporBarrierRolls,
    estimatedEnergySavingsPerYear
  };
}
