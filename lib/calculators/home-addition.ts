export type AdditionStructure = 'bump_out' | 'ground_level' | 'second_story' | 'garage';
export type RoomType = 'bedroom_living' | 'master_suite' | 'kitchen' | 'bathroom_only' | 'sunroom';
export type FinishQuality = 'standard' | 'premium' | 'luxury';

export interface AdditionSettings {
  structure: AdditionStructure;
  roomType: RoomType;
  finishQuality: FinishQuality;
  squareFootage: number;
  
  // Real Estate ROI Inputs
  currentHomeValue?: number;
  currentHomeSqFt?: number;
}

export interface CostBreakdown {
  foundation: number;
  framingExterior: number;
  interiorFinishes: number;
  softCosts: number; // Permits, Architects, Engineering
}

export interface CostEstimate {
  low: number;
  average: number;
  high: number;
  breakdown: CostBreakdown;
}

export interface RealEstateROI {
  estimatedValueAdded: number;
  newHomeValue: number;
  roiPercentage: number;
  pricePerSqFtAdded: number;
}

export interface AdditionResult {
  cost: CostEstimate;
  roi?: RealEstateROI;
}

// Base cost per square foot for the RAW structural shell (National Averages)
const STRUCTURE_BASE_COSTS: Record<AdditionStructure, number> = {
  bump_out: 180,      // Micro additions are expensive per sq ft due to minimum overheads
  ground_level: 150,  // Standard slab/crawlspace extension
  second_story: 220,  // Requires removing roof, strengthening existing foundation/walls
  garage: 80,         // Unfinished space, minimal insulation/drywall
};

// Multipliers for the type of room being built (Plumbing/Electrical weight)
const ROOM_MULTIPLIERS: Record<RoomType, number> = {
  bedroom_living: 1.0,  // "Dry" rooms are baseline
  sunroom: 0.8,         // Pre-fab or highly glazed, less drywall/insulation needed
  master_suite: 1.4,    // Requires a full bathroom, heavy plumbing
  bathroom_only: 2.0,   // Extremely dense plumbing/tile cost in a small footprint
  kitchen: 2.2,         // Massive plumbing, heavy electrical (220v), cabinetry
};

// Finish Quality Multipliers (Affects Interior Finishes heavily)
const FINISH_MULTIPLIERS: Record<FinishQuality, number> = {
  standard: 1.0, // Builder grade (LVP floors, fiberglass showers, laminate counters)
  premium: 1.3,  // High end (Hardwood, tile showers, quartz counters)
  luxury: 1.7,   // Custom (Exotic woods, massive wet rooms, sub-zero appliances)
};

// ROI Return Percentages based on Remodeling Magazine's Cost vs Value report
const ROI_PERCENTAGES: Record<RoomType, number> = {
  bedroom_living: 0.65, // ~65% return
  master_suite: 0.55,   // ~55% return
  bathroom_only: 0.60,  // ~60% return
  kitchen: 0.70,        // ~70% return
  sunroom: 0.45,        // ~45% return
};

export function calculateHomeAddition(settings: AdditionSettings): AdditionResult {
  const { structure, roomType, finishQuality, squareFootage, currentHomeValue, currentHomeSqFt } = settings;

  // 1. Calculate Base Square Foot Cost
  let baseSqFt = STRUCTURE_BASE_COSTS[structure];

  // Garages don't get massive room multipliers unless specified, but we assume standard living space here
  if (structure !== 'garage') {
    baseSqFt *= ROOM_MULTIPLIERS[roomType];
    baseSqFt *= FINISH_MULTIPLIERS[finishQuality];
  } else {
    // If it's a garage, finish quality only slightly impacts it (e.g. epoxy floors, better doors)
    if (finishQuality === 'premium') baseSqFt *= 1.1;
    if (finishQuality === 'luxury') baseSqFt *= 1.3;
  }

  // 2. Generate Total Average Cost
  const totalAverageCost = baseSqFt * squareFootage;

  // 3. Create Cost Breakdown (Approximate Industry Ratios)
  let foundationRatio = 0.15;
  let framingRatio = 0.35;
  let interiorRatio = 0.40;
  let softRatio = 0.10;

  if (structure === 'second_story') {
    foundationRatio = 0.05; // Less foundation, mostly structural reinforcement
    framingRatio = 0.45;    // Heavy framing and new roofing
  } else if (structure === 'bump_out') {
    softRatio = 0.15;       // Fixed permit costs hit harder on small footprints
    interiorRatio = 0.35;
  }

  if (roomType === 'kitchen' || roomType === 'bathroom_only') {
    interiorRatio += 0.15;  // Cabinetry, appliances, plumbing fixtures
    framingRatio -= 0.15;
  }

  const breakdown: CostBreakdown = {
    foundation: totalAverageCost * foundationRatio,
    framingExterior: totalAverageCost * framingRatio,
    interiorFinishes: totalAverageCost * interiorRatio,
    softCosts: totalAverageCost * softRatio,
  };

  // 4. Calculate Ranges
  // Low: DIY labor offset, rural areas, discount materials
  // High: HCOL areas (NY/SF), white-glove general contractor
  const cost: CostEstimate = {
    low: totalAverageCost * 0.8,
    average: totalAverageCost,
    high: totalAverageCost * 1.3,
    breakdown,
  };

  // 5. Calculate Advanced Real Estate ROI
  let roi: RealEstateROI | undefined = undefined;

  if (currentHomeValue && currentHomeValue > 0 && currentHomeSqFt && currentHomeSqFt > 0) {
    // Base ROI on the National Average Return for that room type
    const expectedReturnPct = ROI_PERCENTAGES[roomType];
    
    // Value added is the cost of the addition multiplied by the expected return
    const estimatedValueAdded = totalAverageCost * expectedReturnPct;
    
    // The new total home value
    const newHomeValue = currentHomeValue + estimatedValueAdded;

    // What is the effective "price per square foot" of the value they just added?
    const pricePerSqFtAdded = estimatedValueAdded / squareFootage;

    roi = {
      estimatedValueAdded,
      newHomeValue,
      roiPercentage: expectedReturnPct * 100,
      pricePerSqFtAdded,
    };
  }

  return { cost, roi };
}
