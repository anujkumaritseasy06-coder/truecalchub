export type RoofingMaterial = 'architectural' | '3-tab' | 'metal' | 'cedar';
export type RoofComplexity = 'simple' | 'average' | 'complex';

export interface RoofingCalculationResult {
  // Areas
  baseAreaSqFt: number;
  pitchMultiplier: number;
  trueSurfaceAreaSqFt: number;
  areaWithWasteSqFt: number;

  // Primary Material
  totalSquares: number;
  shingleBundles: number; 
  metalPanels: number; 
  ridgeCapLinearFeet: number;
  ridgeCapBundles: number;
  starterShingleBundles: number;

  // Underlayment & Protection
  underlaymentRolls: number; 
  iceAndWaterShieldRolls: number; 
  dripEdgePieces: number; 

  // Fasteners
  roofingNailsPounds: number;

  // LEVEL 4 V2 UPGRADES
  osbSheets: number; // For re-decking
  ridgeVentLinearFeet: number; // Exhaust
  soffitVents: number; // Intake
  stepFlashingPieces: number; // For chimneys/sidewalls
  valleyFlashingFeet: number; // W-Valley
  tearOffWeightLbs: number;
  recommendedDumpster: string;
}

/**
 * Returns the geometric secant multiplier for a given pitch (X in 12).
 */
export function getPitchMultiplier(pitchX: number): number {
  if (pitchX < 0) return 1.0;
  return Math.sqrt(Math.pow(pitchX / 12, 2) + 1);
}

export function calculateRoofing(
  houseLengthFt: number,
  houseWidthFt: number,
  pitchX: number, 
  complexity: RoofComplexity,
  material: RoofingMaterial,
  eaveOverhangFt: number = 1.5,
  tearOffLayers: number = 0,
  reDecking: boolean = false
): RoofingCalculationResult {

  if (houseLengthFt <= 0 || houseWidthFt <= 0) {
    return {
      baseAreaSqFt: 0, pitchMultiplier: 1, trueSurfaceAreaSqFt: 0, areaWithWasteSqFt: 0,
      totalSquares: 0, shingleBundles: 0, metalPanels: 0, ridgeCapLinearFeet: 0,
      ridgeCapBundles: 0, starterShingleBundles: 0, underlaymentRolls: 0, 
      iceAndWaterShieldRolls: 0, dripEdgePieces: 0, roofingNailsPounds: 0,
      osbSheets: 0, ridgeVentLinearFeet: 0, soffitVents: 0, stepFlashingPieces: 0,
      valleyFlashingFeet: 0, tearOffWeightLbs: 0, recommendedDumpster: 'None'
    };
  }

  // 1. BASE AREA & TRUE SURFACE AREA
  const roofFootprintLength = houseLengthFt + (eaveOverhangFt * 2);
  const roofFootprintWidth = houseWidthFt + (eaveOverhangFt * 2);
  const baseAreaSqFt = roofFootprintLength * roofFootprintWidth;

  const pitchMultiplier = getPitchMultiplier(pitchX);
  const trueSurfaceAreaSqFt = baseAreaSqFt * pitchMultiplier;

  // 2. WASTE FACTOR
  let wastePct = 0.10; 
  if (complexity === 'simple') wastePct = 0.05; 
  if (complexity === 'average') wastePct = 0.10; 
  if (complexity === 'complex') wastePct = 0.15; 

  const areaWithWasteSqFt = trueSurfaceAreaSqFt * (1 + wastePct);

  // 3. SQUARES
  const rawSquares = areaWithWasteSqFt / 100;
  const totalSquares = parseFloat(rawSquares.toFixed(2));

  // 4. PRIMARY MATERIAL
  let shingleBundles = 0;
  let metalPanels = 0;

  if (material === 'architectural' || material === '3-tab' || material === 'cedar') {
    shingleBundles = Math.ceil(totalSquares * 3);
  } else if (material === 'metal') {
    const panelLength = (roofFootprintWidth / 2) * pitchMultiplier;
    const panelSqFt = 1.333 * panelLength;
    if (panelSqFt > 0) {
      metalPanels = Math.ceil(areaWithWasteSqFt / panelSqFt);
    }
  }

  // 5. PERIMETER & ACCESSORIES
  const perimeterFt = (roofFootprintLength * 2) + (roofFootprintWidth * 2);
  const dripEdgePieces = Math.ceil((perimeterFt * 1.10) / 10);
  const starterShingleBundles = Math.ceil((perimeterFt * 1.10) / 100);

  const eaveLengthTotal = roofFootprintLength * 2;
  const rowsOfIceAndWater = 2; 
  const totalIceAndWaterLinFt = eaveLengthTotal * rowsOfIceAndWater;
  const iceAndWaterShieldRolls = Math.ceil(totalIceAndWaterLinFt / 65);

  const underlaymentRolls = Math.ceil(areaWithWasteSqFt / 400);

  let ridgeCapLinearFeet = roofFootprintLength;
  if (complexity === 'complex') {
    ridgeCapLinearFeet = roofFootprintLength + (roofFootprintWidth * 1.5);
  }
  const ridgeCapBundles = Math.ceil(ridgeCapLinearFeet / 30);

  // 6. FASTENERS 
  const roofingNailsPounds = Math.ceil(totalSquares * 2.5);

  // 7. NEW: DECKING (OSB Sheets)
  let osbSheets = 0;
  if (reDecking) {
    // A standard sheet of OSB is 4x8 (32 sq ft). Add 10% waste for cutoffs.
    osbSheets = Math.ceil((trueSurfaceAreaSqFt * 1.10) / 32);
  }

  // 8. NEW: FLASHING SYSTEMS
  let stepFlashingPieces = 0;
  let valleyFlashingFeet = 0;
  
  if (complexity === 'average') {
    stepFlashingPieces = 50; // standard chimney
    valleyFlashingFeet = 40; // a couple standard valleys
  } else if (complexity === 'complex') {
    stepFlashingPieces = 150; // multiple dormers, sidewalls
    valleyFlashingFeet = 120; // complex intersecting rooflines
  }

  // 9. NEW: VENTILATION (The 1:300 Rule)
  // Required Net Free Area (NFA) = Base Attic Area (sq ft) / 300
  // Half for intake (soffit), Half for exhaust (ridge)
  const totalNfaSqFt = baseAreaSqFt / 300;
  const exhaustNfaSqInches = (totalNfaSqFt / 2) * 144;
  const intakeNfaSqInches = (totalNfaSqFt / 2) * 144;

  // Ridge vent typically provides 18 sq inches of NFA per linear foot.
  let ridgeVentLinearFeet = Math.ceil(exhaustNfaSqInches / 18);
  // Cap it at the actual length of the ridge
  if (ridgeVentLinearFeet > ridgeCapLinearFeet) {
    ridgeVentLinearFeet = Math.ceil(ridgeCapLinearFeet);
  }

  // Standard 8x16 soffit vent provides ~60 sq inches of NFA
  const soffitVents = Math.ceil(intakeNfaSqInches / 60);

  // 10. NEW: TEAR-OFF LOGISTICS & DUMPSTER SIZING
  let tearOffWeightLbs = 0;
  let recommendedDumpster = 'None';

  if (tearOffLayers > 0) {
    // Weight per square based on material
    let lbsPerSquare = 350; // Architectural default
    if (material === '3-tab') lbsPerSquare = 240;
    if (material === 'cedar') lbsPerSquare = 300;
    if (material === 'metal') lbsPerSquare = 100; // Metal is light
    
    // Total physical squares being torn off (no waste factor, just true area)
    const trueSquares = trueSurfaceAreaSqFt / 100;
    
    // Total weight = Squares * Layers * Weight per square
    tearOffWeightLbs = Math.round(trueSquares * tearOffLayers * lbsPerSquare);

    // Add estimated weight for torn-off felt, nails, and possibly OSB (if replacing)
    // Roughly 20 lbs per square of trash
    tearOffWeightLbs += (trueSquares * 20 * tearOffLayers);

    if (reDecking) {
      // Tearing off OSB = ~45 lbs per sheet
      tearOffWeightLbs += (osbSheets * 45);
    }

    if (tearOffWeightLbs <= 4000) {
      recommendedDumpster = '10-Yard Dumpster';
    } else if (tearOffWeightLbs <= 8000) {
      recommendedDumpster = '20-Yard Dumpster';
    } else if (tearOffWeightLbs <= 12000) {
      recommendedDumpster = '30-Yard Dumpster';
    } else {
      recommendedDumpster = '40-Yard Dumpster (Or Multiple 20s)';
    }
  }

  return {
    baseAreaSqFt: parseFloat(baseAreaSqFt.toFixed(2)),
    pitchMultiplier: parseFloat(pitchMultiplier.toFixed(4)),
    trueSurfaceAreaSqFt: parseFloat(trueSurfaceAreaSqFt.toFixed(2)),
    areaWithWasteSqFt: parseFloat(areaWithWasteSqFt.toFixed(2)),
    totalSquares,
    shingleBundles,
    metalPanels,
    ridgeCapLinearFeet: parseFloat(ridgeCapLinearFeet.toFixed(2)),
    ridgeCapBundles,
    starterShingleBundles,
    underlaymentRolls,
    iceAndWaterShieldRolls,
    dripEdgePieces,
    roofingNailsPounds,
    osbSheets,
    ridgeVentLinearFeet,
    soffitVents,
    stepFlashingPieces,
    valleyFlashingFeet,
    tearOffWeightLbs,
    recommendedDumpster
  };
}
