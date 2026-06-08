const { calculateBlocks } = require('./lib/calculators/block.ts');

function calcBlocks(dims, wallUnit, wasteFactorPct) {
  const wL = dims.wallLength;
  const wH = dims.wallHeight;
  const wallAreaSqFt = wL * wH;
  
  const bL = dims.blockLengthInches + dims.mortarJointInches;
  const bH = dims.blockHeightInches + dims.mortarJointInches;
  
  const blockFaceAreaSqFt = (bL * bH) / 144;
  
  const rawBlocks = wallAreaSqFt / blockFaceAreaSqFt;
  const wasteMultiplier = 1 + (wasteFactorPct / 100);
  const wasteAdjustedBlocks = Math.ceil(rawBlocks * wasteMultiplier);
  
  return {
    wallAreaSqFt,
    blockFaceAreaSqFt,
    rawBlocks,
    wasteAdjustedBlocks,
    estimatedPallets: Math.ceil(wasteAdjustedBlocks / 90),
    estimatedMortarBags: Math.ceil(wasteAdjustedBlocks * 0.03)
  };
}

console.log("Garden Wall (20x4, 10% waste):", calcBlocks({wallLength: 20, wallHeight: 4, blockLengthInches: 15.625, blockHeightInches: 7.625, mortarJointInches: 0.375}, 'feet', 10));
console.log("Retaining Wall (30x6, 10% waste):", calcBlocks({wallLength: 30, wallHeight: 6, blockLengthInches: 15.625, blockHeightInches: 7.625, mortarJointInches: 0.375}, 'feet', 10));
console.log("Basement Wall (40x8, 10% waste):", calcBlocks({wallLength: 40, wallHeight: 8, blockLengthInches: 15.625, blockHeightInches: 7.625, mortarJointInches: 0.375}, 'feet', 10));
console.log("Commercial Wall (100x12, 10% waste):", calcBlocks({wallLength: 100, wallHeight: 12, blockLengthInches: 15.625, blockHeightInches: 7.625, mortarJointInches: 0.375}, 'feet', 10));
