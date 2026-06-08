export type UnitSystem = 'imperial' | 'metric';
export type StairType = 'standard' | 'deck';

export interface StairSettings {
  totalRise: number; // inches or cm
  targetRiserHeight: number; // typically 7" or 18cm
  targetTreadDepth: number; // typically 10" or 11" (25-28cm)
  stringerWidth: number; // Number of stringers across the width
  stairType: StairType;
  hasLanding: boolean;
  landingSplitPercentage: number; // e.g. 50% for exactly halfway
}

export interface FlightResult {
  totalRise: number;
  totalRun: number;
  numberOfSteps: number;
  actualRiserHeight: number;
  actualTreadDepth: number;
  stringerLength: number;
  stringerAngle: number;
}

export interface CodeCompliance {
  isCompliant: boolean;
  warnings: string[];
}

export interface StairMaterialEstimate {
  stringers2x12: number; // How many 16ft or 12ft 2x12s needed
  treadBoards: number; // Assuming 2 deck boards per tread
  riserBoards: number; // Assuming 1 board per riser
}

export interface StairResult {
  flight1: FlightResult;
  flight2?: FlightResult; // Only if landing exists
  
  codeCompliance: CodeCompliance;
  materialEstimate?: StairMaterialEstimate; // Only for deck stairs
}

export function calculateStairs(
  settings: StairSettings,
  unit: UnitSystem = 'imperial'
): StairResult {
  
  // Helper to calculate a single flight
  const calcFlight = (flightRise: number): FlightResult => {
    // 1. Calculate number of risers (steps)
    let numRisers = Math.round(flightRise / settings.targetRiserHeight);
    if (numRisers < 1) numRisers = 1;

    // 2. Exact riser height
    const actualRiserHeight = flightRise / numRisers;

    // 3. Number of treads (always one less than risers for a standard flight attaching to a landing/floor)
    const numTreads = numRisers - 1;
    
    // 4. Exact tread depth
    const actualTreadDepth = settings.targetTreadDepth; // Tread depth is usually a fixed target based on material or code

    // 5. Total Run
    const totalRun = numTreads * actualTreadDepth;

    // 6. Stringer Hypotenuse Length (Pythagorean Theorem)
    const stringerLength = Math.sqrt(Math.pow(flightRise, 2) + Math.pow(totalRun, 2));

    // 7. Stringer Angle (Pitch) in degrees
    const stringerAngle = Math.atan(flightRise / totalRun) * (180 / Math.PI);

    return {
      totalRise: flightRise,
      totalRun,
      numberOfSteps: numRisers,
      actualRiserHeight,
      actualTreadDepth,
      stringerLength,
      stringerAngle
    };
  };

  let flight1: FlightResult;
  let flight2: FlightResult | undefined = undefined;

  if (settings.hasLanding) {
    const flight1Rise = settings.totalRise * (settings.landingSplitPercentage / 100);
    const flight2Rise = settings.totalRise - flight1Rise;
    
    flight1 = calcFlight(flight1Rise);
    flight2 = calcFlight(flight2Rise);
  } else {
    flight1 = calcFlight(settings.totalRise);
  }

  // Code Compliance Evaluation (Using standard IBC - International Building Code)
  // Max rise = 7.75" (19.7cm), Min tread = 10" (25.4cm)
  const maxRiseLimit = unit === 'imperial' ? 7.75 : 19.7;
  const minTreadLimit = unit === 'imperial' ? 10.0 : 25.4;
  
  const warnings: string[] = [];
  let isCompliant = true;

  if (flight1.actualRiserHeight > maxRiseLimit || (flight2 && flight2.actualRiserHeight > maxRiseLimit)) {
    isCompliant = false;
    warnings.push(`Riser height exceeds standard IBC maximum of ${maxRiseLimit}${unit === 'imperial' ? '"' : 'cm'}.`);
  }
  
  if (flight1.actualTreadDepth < minTreadLimit || (flight2 && flight2.actualTreadDepth < minTreadLimit)) {
    isCompliant = false;
    warnings.push(`Tread depth is below standard IBC minimum of ${minTreadLimit}${unit === 'imperial' ? '"' : 'cm'}.`);
  }

  // Material Estimation (Specifically for Deck Stairs)
  let materialEstimate: StairMaterialEstimate | undefined = undefined;
  
  if (settings.stairType === 'deck') {
    // Stringers: Number of stringers * number of flights
    const numFlights = settings.hasLanding ? 2 : 1;
    // Assume we need one 12ft or 16ft 2x12 per stringer cut (standard practice)
    const stringers2x12 = settings.stringerWidth * numFlights;

    // Treads: standard decking is 5/4x6, so usually 2 boards per tread
    const totalTreads = flight1.numberOfSteps - 1 + (flight2 ? flight2.numberOfSteps - 1 : 0);
    const boardsPerTread = 2; // Assuming 5/4x6 boards
    const treadBoards = totalTreads * boardsPerTread;

    // Risers: standard solid risers use 1x8 boards (1 board per riser)
    const totalRisers = flight1.numberOfSteps + (flight2 ? flight2.numberOfSteps : 0);
    const riserBoards = totalRisers * 1;

    materialEstimate = {
      stringers2x12,
      treadBoards,
      riserBoards
    };
  }

  return {
    flight1,
    flight2,
    codeCompliance: {
      isCompliant,
      warnings
    },
    materialEstimate
  };
}
