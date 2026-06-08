const { calculateBlocks } = require('./lib/calculators/block.ts');

// We can just replicate the math to make it simpler to run via node (without TS)
function convertToFeet(value, unit) {
  if (value < 0 || isNaN(value)) return 0;
  switch (unit) {
    case 'feet': return value;
    case 'inches': return value / 12;
    case 'yards': return value * 3;
    case 'meters': return value * 3.28084;
    case 'centimeters': return value * 0.0328084;
    default: return value;
  }
}

function calcBlocks(dims, wallUnit, wasteFactorPct) {
  const wLength = convertToFeet(dims.wallLength, wallUnit);
  const wHeight = convertToFeet(dims.wallHeight, wallUnit);
  const wallAreaSqFt = wLength * wHeight;
  
  const bLength = dims.blockLengthInches + dims.mortarJointInches;
  const bHeight = dims.blockHeightInches + dims.mortarJointInches;
  
  const blockFaceAreaSqFt = (bLength * bHeight) / 144;
  
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

const t1 = calcBlocks({
  wallLength: 10,
  wallHeight: 10,
  blockLengthInches: 15.625,
  blockHeightInches: 7.625,
  mortarJointInches: 0.375
}, 'feet', 10);

console.log("10x10 wall, 8x16 nominal block, 10% waste:", t1);
// Expected: Wall 100 sq ft
// Face: 16x8 = 128 sq in = 0.88888 sq ft
// Raw Blocks: 112.5
// Waste (10%): 112.5 * 1.10 = 123.75 -> ceil -> 124 blocks.
// Pallets: ceil(124/90) = 2
// Mortar: ceil(124*0.03) = 4

const t2 = calcBlocks({
  wallLength: 50,
  wallHeight: 6,
  blockLengthInches: 15.625,
  blockHeightInches: 7.625,
  mortarJointInches: 0.375
}, 'feet', 5);

console.log("50x6 wall, 8x16 nominal block, 5% waste:", t2);
// Expected: Wall 300 sq ft
// Raw Blocks: 337.5
// Waste (5%): 354.375 -> ceil -> 355 blocks.
// Pallets: ceil(355/90) = 4
// Mortar: ceil(355*0.03) = 11
