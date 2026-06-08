export type RoofPitchInputMode = 'rise-run' | 'angle' | 'pitch';

export interface RoofPitchResult {
  pitchX: number; // The "X" in X/12
  pitchString: string; // "6/12"
  angleDegrees: number;
  pitchMultiplier: number;
  slopePercentage: number;
  roofCategory: string; // Flat, Low, Standard, Steep
  
  // LEVEL 3 FRAMING METRICS
  rafterLengthFt: number | null;
  peakHeightFt: number | null;
  plumbCutAngle: number;
  levelCutAngle: number;
  eaveDropInches: number | null;
}

export function calculateRoofPitch(
  mode: RoofPitchInputMode,
  riseInches: number,
  runInches: number,
  angleDegreesInput: number,
  pitchXInput: number,
  buildingSpanFt: number | null = null,
  overhangInches: number = 0
): RoofPitchResult {
  
  let pitchX = 0;
  
  const emptyBase = { pitchX: 0, pitchString: '0/12', angleDegrees: 0, pitchMultiplier: 1, slopePercentage: 0, roofCategory: 'Invalid', rafterLengthFt: null, peakHeightFt: null, plumbCutAngle: 90, levelCutAngle: 0, eaveDropInches: null };

  if (mode === 'rise-run') {
    if (runInches <= 0 || isNaN(runInches)) return emptyBase;
    pitchX = (riseInches / runInches) * 12;
  } else if (mode === 'angle') {
    if (isNaN(angleDegreesInput) || angleDegreesInput < 0 || angleDegreesInput >= 90) return emptyBase;
    const radians = angleDegreesInput * (Math.PI / 180);
    pitchX = 12 * Math.tan(radians);
  } else if (mode === 'pitch') {
    if (isNaN(pitchXInput) || pitchXInput < 0) return emptyBase;
    pitchX = pitchXInput;
  }

  // Calculate derivatives based on standardized pitchX
  const rise = pitchX;
  const run = 12;
  
  // Angle
  const angleRadians = Math.atan(rise / run);
  const angleDegrees = angleRadians * (180 / Math.PI);
  
  // Multiplier
  const pitchMultiplier = Math.sqrt(Math.pow(pitchX / 12, 2) + 1);
  
  // Slope Percentage
  const slopePercentage = (rise / run) * 100;
  
  // Categorize
  let roofCategory = 'Flat';
  if (pitchX >= 1 && pitchX < 4) {
    roofCategory = 'Low Slope';
  } else if (pitchX >= 4 && pitchX <= 9) {
    roofCategory = 'Standard Slope';
  } else if (pitchX > 9) {
    roofCategory = 'Steep Slope';
  }

  // FRAMING METRICS
  let rafterLengthFt: number | null = null;
  let peakHeightFt: number | null = null;
  let eaveDropInches: number | null = null;
  
  const plumbCutAngle = 90 - angleDegrees;
  const levelCutAngle = angleDegrees;

  if (buildingSpanFt && buildingSpanFt > 0) {
    const halfSpanFt = buildingSpanFt / 2;
    // Peak Height = Run * Pitch (in terms of foot rise per foot run)
    peakHeightFt = halfSpanFt * (pitchX / 12);
    
    // Rafter Length = Total Run * Multiplier
    const totalRunFt = halfSpanFt + (overhangInches / 12);
    rafterLengthFt = totalRunFt * pitchMultiplier;
    
    // Eave Drop = overhang * (pitchX/12)
    eaveDropInches = overhangInches * (pitchX / 12);
  }

  return {
    pitchX: parseFloat(pitchX.toFixed(2)),
    pitchString: `${parseFloat(pitchX.toFixed(2))}/12`,
    angleDegrees: parseFloat(angleDegrees.toFixed(2)),
    pitchMultiplier: parseFloat(pitchMultiplier.toFixed(4)),
    slopePercentage: parseFloat(slopePercentage.toFixed(2)),
    roofCategory,
    rafterLengthFt: rafterLengthFt !== null ? parseFloat(rafterLengthFt.toFixed(2)) : null,
    peakHeightFt: peakHeightFt !== null ? parseFloat(peakHeightFt.toFixed(2)) : null,
    plumbCutAngle: parseFloat(plumbCutAngle.toFixed(2)),
    levelCutAngle: parseFloat(levelCutAngle.toFixed(2)),
    eaveDropInches: eaveDropInches !== null ? parseFloat(eaveDropInches.toFixed(2)) : null
  };
}
