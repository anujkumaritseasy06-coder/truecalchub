export type FenceUnit = 'feet' | 'meters';
export type FenceMaterialType = 'wood' | 'vinyl' | 'split-rail' | 'chain-link';

export interface FenceCalculationResult {
  // Common Structural
  totalPosts: number;
  totalSections: number;
  
  // Wood Specific
  totalPickets: number;
  totalRails: number;
  totalScrews: number;

  // Vinyl Specific
  vinylPanels: number;

  // Split Rail Specific
  splitRailLogs: number;

  // Chain Link Specific
  chainLinkMeshRolls: number; // 50ft rolls
  chainLinkTopRail: number;   // 21ft rails
  chainLinkTensionBands: number;

  // Common Hardware & Earthwork
  concrete80lbBags: number;
  concrete50lbBags: number;
  dirtDisplacedCuYards: number;
  gateHinges: number;
  gateLatches: number;
}

export function convertToFeet(value: number, unit: FenceUnit): number {
  if (value < 0 || isNaN(value)) return 0;
  return unit === 'meters' ? value * 3.28084 : value;
}

/**
 * Advanced Level-3 Calculation engine for Fences.
 */
export function calculateFence(
  lengthValue: number,
  unit: FenceUnit,
  materialType: FenceMaterialType,
  postSpacingFeet: number,
  holeDepthInches: number,
  railsPerSection: number,
  picketWidthInches: number,
  numberOfGates: number,
  wastePct: number
): FenceCalculationResult {
  const l_ft = convertToFeet(lengthValue, unit);
  
  if (l_ft <= 0) {
    return {
      totalPosts: 0, totalSections: 0,
      totalPickets: 0, totalRails: 0, totalScrews: 0,
      vinylPanels: 0, splitRailLogs: 0,
      chainLinkMeshRolls: 0, chainLinkTopRail: 0, chainLinkTensionBands: 0,
      concrete80lbBags: 0, concrete50lbBags: 0, dirtDisplacedCuYards: 0,
      gateHinges: 0, gateLatches: 0
    };
  }

  const wasteMultiplier = 1 + (wastePct / 100);

  // 1. POSTS & SECTIONS
  const rawSections = Math.ceil(l_ft / postSpacingFeet);
  const totalPosts = rawSections + 1 + numberOfGates;
  const totalSections = rawSections + numberOfGates; 

  // 2. GATE HARDWARE
  const gateHinges = numberOfGates * 2;
  const gateLatches = numberOfGates * 1;

  // 3. EARTHWORK & CONCRETE
  // Assume an 8-inch diameter hole
  // Cylinder Vol = pi * r^2 * h
  const holeVolCuInches = Math.PI * Math.pow(4, 2) * holeDepthInches;
  const holeVolCuFt = holeVolCuInches / 1728;

  // Post Displacement
  let postWidthInches = 3.5; // Standard 4x4
  if (materialType === 'vinyl') postWidthInches = 5; // 5x5 PVC post
  if (materialType === 'chain-link') postWidthInches = 2.375; // Terminal pipe

  const postDisplacementCuInches = Math.pow(postWidthInches, 2) * holeDepthInches;
  const postDisplacementCuFt = postDisplacementCuInches / 1728;

  const concretePerHoleCuFt = holeVolCuFt - postDisplacementCuFt;
  const totalConcreteCuFt = totalPosts * concretePerHoleCuFt;

  const bags80 = Math.ceil(totalConcreteCuFt / 0.60);
  const bags50 = Math.ceil(totalConcreteCuFt / 0.37);

  // Dirt Fluff Factor (30% expansion when dug up)
  const totalDirtCuFt = totalPosts * holeVolCuFt * 1.30;
  const dirtDisplacedCuYards = parseFloat((totalDirtCuFt / 27).toFixed(2));

  // 4. MATERIAL SPECIFIC LOGIC
  let finalPickets = 0, finalRails = 0, finalScrews = 0;
  let vinylPanels = 0;
  let splitRailLogs = 0;
  let chainLinkMeshRolls = 0, chainLinkTopRail = 0, chainLinkTensionBands = 0;

  if (materialType === 'wood') {
    const totalInches = l_ft * 12;
    const rawPickets = Math.ceil(totalInches / picketWidthInches);
    finalPickets = Math.ceil(rawPickets * wasteMultiplier);

    const rawRails = totalSections * railsPerSection;
    finalRails = Math.ceil(rawRails * wasteMultiplier);

    const screwsPerPicket = railsPerSection * 2;
    finalScrews = Math.ceil((finalPickets * screwsPerPicket) * wasteMultiplier);
  } 
  else if (materialType === 'vinyl') {
    // Vinyl uses pre-assembled panels
    vinylPanels = Math.ceil(totalSections * wasteMultiplier);
  }
  else if (materialType === 'split-rail') {
    // Standard split rail uses 10ft rails (post spacing usually 10ft)
    const rawLogs = totalSections * railsPerSection;
    splitRailLogs = Math.ceil(rawLogs * wasteMultiplier);
  }
  else if (materialType === 'chain-link') {
    // Chain link comes in 50ft rolls
    chainLinkMeshRolls = Math.ceil((l_ft / 50) * wasteMultiplier);
    // Top rails are usually 21ft pieces
    chainLinkTopRail = Math.ceil((l_ft / 21) * wasteMultiplier);
    // Tension bands (3 per terminal post/gate)
    chainLinkTensionBands = (2 + (numberOfGates * 2)) * 3; // Start/end = 2 terminals, each gate adds 2 terminals
  }

  return {
    totalPosts,
    totalSections,
    totalPickets: finalPickets,
    totalRails: finalRails,
    totalScrews: finalScrews,
    vinylPanels,
    splitRailLogs,
    chainLinkMeshRolls,
    chainLinkTopRail,
    chainLinkTensionBands,
    concrete80lbBags: bags80,
    concrete50lbBags: bags50,
    dirtDisplacedCuYards,
    gateHinges,
    gateLatches
  };
}

export interface FencePostCalculationResult {
  totalPosts: number;
  totalSections: number;
  concrete80lbBags: number;
  concrete50lbBags: number;
  dirtDisplacedCuYards: number;
}

export function calculateFencePosts(
  lengthValue: number,
  unit: FenceUnit,
  postSpacingFeet: number,
  numberOfGates: number,
  holeDiameterInches: number,
  holeDepthInches: number,
  postWidthInches: number,
  wastePct: number
): FencePostCalculationResult {
  const l_ft = convertToFeet(lengthValue, unit);
  
  if (l_ft <= 0) {
    return {
      totalPosts: 0, totalSections: 0,
      concrete80lbBags: 0, concrete50lbBags: 0, dirtDisplacedCuYards: 0
    };
  }

  // 1. POSTS
  const rawSections = Math.ceil(l_ft / postSpacingFeet);
  const rawPosts = rawSections + 1 + numberOfGates;
  const wasteMultiplier = 1 + (wastePct / 100);
  const totalPosts = Math.ceil(rawPosts * wasteMultiplier);
  const totalSections = rawSections + numberOfGates;

  // 2. EARTHWORK & CONCRETE
  const holeRadius = holeDiameterInches / 2;
  const holeVolCuInches = Math.PI * Math.pow(holeRadius, 2) * holeDepthInches;
  const holeVolCuFt = holeVolCuInches / 1728;

  // Post Displacement (assuming square for math simplicity, or round if 2.375)
  // For round post, displacement is pi*r^2*h. For square, w^2*h.
  // We will assume square displacement for simplicity unless it's very small.
  // Actually, to be safe, we'll just treat it as square w*w*h.
  const postDisplacementCuInches = Math.pow(postWidthInches, 2) * holeDepthInches;
  const postDisplacementCuFt = postDisplacementCuInches / 1728;

  const concretePerHoleCuFt = holeVolCuFt - postDisplacementCuFt;
  const totalConcreteCuFt = totalPosts * concretePerHoleCuFt;

  const bags80 = Math.ceil(totalConcreteCuFt / 0.60);
  const bags50 = Math.ceil(totalConcreteCuFt / 0.37);

  // Dirt Fluff Factor (30% expansion when dug up)
  const totalDirtCuFt = totalPosts * holeVolCuFt * 1.30;
  const dirtDisplacedCuYards = parseFloat((totalDirtCuFt / 27).toFixed(2));

  return {
    totalPosts,
    totalSections,
    concrete80lbBags: bags80,
    concrete50lbBags: bags50,
    dirtDisplacedCuYards
  };
}
