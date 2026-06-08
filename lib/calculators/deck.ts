export type DeckUnit = 'feet' | 'inches';

export interface DeckDimensions {
  length: number; // Running parallel to the house
  width: number;  // Projecting away from the house
}

export interface DeckCalculationResult {
  squareFeet: number;
  deckingLinealFeet: number;
  deckingBoards12ft: number;
  deckingBoards16ft: number;
  joistLinealFeet: number;
  joists12ft: number;
  joists16ft: number;
  totalScrews: number;
}

export function convertToFeet(value: number, unit: DeckUnit): number {
  if (value < 0 || isNaN(value)) return 0;
  return unit === 'inches' ? value / 12 : value;
}

export function convertToInches(value: number, unit: DeckUnit): number {
  if (value < 0 || isNaN(value)) return 0;
  return unit === 'feet' ? value * 12 : value;
}

/**
 * Core calculation engine for Decking.
 * - Decking boards assume standard 5.5" width + 1/8" gap = 5.625" coverage.
 * - Joists run parallel to Width, spaced along the Length.
 */
export function calculateDeck(
  dims: DeckDimensions,
  unit: DeckUnit,
  joistSpacingInches: number,
  wastePct: number
): DeckCalculationResult {
  const l_ft = convertToFeet(dims.length, unit);
  const w_ft = convertToFeet(dims.width, unit);
  
  const l_inches = l_ft * 12;
  const w_inches = w_ft * 12;

  const sqFt = l_ft * w_ft;
  if (sqFt === 0) {
    return {
      squareFeet: 0, deckingLinealFeet: 0, deckingBoards12ft: 0, deckingBoards16ft: 0,
      joistLinealFeet: 0, joists12ft: 0, joists16ft: 0, totalScrews: 0
    };
  }

  const wasteMultiplier = 1 + (wastePct / 100);

  // 1. DECKING BOARDS
  // Area in sq inches / 5.625" coverage width = Total length in inches needed
  const coverageWidthInches = 5.625;
  const totalDeckingInches = (sqFt * 144) / coverageWidthInches;
  const rawDeckingLinealFeet = totalDeckingInches / 12;
  const finalDeckingLinealFeet = rawDeckingLinealFeet * wasteMultiplier;

  // 2. JOISTS
  // Joists span the Width, spaced along the Length.
  // Formula: (Length / Spacing) + 1
  const numberOfJoists = Math.floor(l_inches / joistSpacingInches) + 1;
  // Length of each field joist is the Width of the deck
  const fieldJoistLinealFeet = numberOfJoists * w_ft;
  
  // Rim Joists (Perimeter box: 2x Length, 2x Width)
  const rimJoistLinealFeet = (l_ft * 2) + (w_ft * 2);
  
  const rawJoistLinealFeet = fieldJoistLinealFeet + rimJoistLinealFeet;
  const finalJoistLinealFeet = rawJoistLinealFeet * wasteMultiplier;

  // 3. FASTENERS (SCREWS)
  // Standard rule of thumb: 3.5 screws per square foot for 16" O.C.
  // If spacing is 12", you need more screws. If 24", less.
  // Ratio: 16 / Spacing * 3.5
  const baseScrews = sqFt * 3.5;
  const screwMultiplier = 16 / joistSpacingInches;
  const finalScrews = baseScrews * screwMultiplier * wasteMultiplier;

  return {
    squareFeet: sqFt,
    deckingLinealFeet: finalDeckingLinealFeet,
    deckingBoards12ft: Math.ceil(finalDeckingLinealFeet / 12),
    deckingBoards16ft: Math.ceil(finalDeckingLinealFeet / 16),
    joistLinealFeet: finalJoistLinealFeet,
    joists12ft: Math.ceil(finalJoistLinealFeet / 12),
    joists16ft: Math.ceil(finalJoistLinealFeet / 16),
    totalScrews: Math.ceil(finalScrews),
  };
}
