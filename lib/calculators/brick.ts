export type BrickType = 'standard' | 'modular' | 'norman' | 'jumbo' | 'custom';
export type ProjectType = 'wall' | 'patio';
export type UnitSystem = 'imperial' | 'metric';

export interface BrickDimensions {
  length: number; // inches or cm
  height: number; // inches or cm (used for walls)
  width: number;  // inches or cm (used for patio/pavers flat laying)
}

export const BRICK_SIZES: Record<BrickType, BrickDimensions> = {
  standard: { length: 8, height: 2.25, width: 3.625 },
  modular: { length: 7.625, height: 2.25, width: 3.625 },
  norman: { length: 11.625, height: 2.25, width: 3.625 },
  jumbo: { length: 8, height: 2.75, width: 3.625 },
  custom: { length: 8, height: 2.25, width: 3.625 },
};

export interface BrickSettings {
  projectType: ProjectType;
  brickType: BrickType;
  customDimensions?: BrickDimensions;
  mortarJointThickness: number; // inches or cm (0 for sand-swept patios)
  wastePercentage: number;
  totalArea: number; // sq ft or sq m
  deductionArea: number; // sq ft or sq m (doors, windows)
}

export interface BrickResult {
  netArea: number;
  bricksPerUnitArea: number; // bricks per sq ft or sq m
  totalBricksExact: number;
  totalBricksWithWaste: number;
  mortarBagsRequired: number; // 80lb bags
  sandRequiredTons: number; // for patios
}

export function calculateBricks(
  settings: BrickSettings,
  unit: UnitSystem = 'imperial'
): BrickResult {
  
  const brick = settings.brickType === 'custom' && settings.customDimensions 
    ? settings.customDimensions 
    : BRICK_SIZES[settings.brickType];

  const joint = settings.mortarJointThickness;
  
  // Calculate area of a single brick including its mortar joint
  let brickAreaWithJoint = 0;

  if (settings.projectType === 'wall') {
    // Wall: Face is length x height
    const effLength = brick.length + joint;
    const effHeight = brick.height + joint;
    brickAreaWithJoint = effLength * effHeight;
  } else {
    // Patio/Paver: Face is length x width
    const effLength = brick.length + joint;
    const effWidth = brick.width + joint;
    brickAreaWithJoint = effLength * effWidth;
  }

  // Conversion factor: 144 sq in per sq ft, 10000 sq cm per sq m
  const sqUnitsPerAreaUnit = unit === 'imperial' ? 144 : 10000;

  const bricksPerUnitArea = sqUnitsPerAreaUnit / brickAreaWithJoint;

  const netArea = settings.totalArea - settings.deductionArea;
  const safeArea = netArea > 0 ? netArea : 0;

  const totalBricksExact = safeArea * bricksPerUnitArea;
  const totalBricksWithWaste = Math.ceil(totalBricksExact * (1 + (settings.wastePercentage / 100)));

  // Mortar / Sand Estimation
  let mortarBagsRequired = 0;
  let sandRequiredTons = 0;

  if (settings.projectType === 'wall') {
    // Rule of thumb: ~7 bags of 80lb mortar per 1000 standard bricks.
    // We adjust based on joint thickness and brick size relative to standard.
    const standardBricksPerBag = 142; // 1000 / 7
    mortarBagsRequired = Math.ceil(totalBricksWithWaste / standardBricksPerBag);
  } else {
    // Patios usually use polymeric sand or regular sand for joints, plus a sand base.
    // 1 ton of sand covers ~100 sq ft at 1 inch deep base.
    // Joint sand: 1 50lb bag covers ~50 sq ft for thin joints.
    const baseSandTons = safeArea / (unit === 'imperial' ? 100 : 9.29); // 1 ton per 100 sqft
    const jointSandTons = (safeArea / (unit === 'imperial' ? 50 : 4.64)) * 0.025; // 50lb bags to tons
    sandRequiredTons = baseSandTons + jointSandTons;
  }

  return {
    netArea,
    bricksPerUnitArea,
    totalBricksExact,
    totalBricksWithWaste,
    mortarBagsRequired,
    sandRequiredTons
  };
}
