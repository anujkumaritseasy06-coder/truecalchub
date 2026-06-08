const { execSync } = require('child_process');

// We test the engine manually.
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

function calculateConcrete(dims, unit, wasteFactorPct) {
  const l = convertToFeet(dims.length, unit);
  const w = convertToFeet(dims.width, unit);
  const d = convertToFeet(dims.depth, unit);
  
  const cuFt = l * w * d;
  const sqFt = l * w;
  
  const wasteMultiplier = 1 + (wasteFactorPct / 100);
  const totalCuFt = cuFt * wasteMultiplier;
  const totalCuYards = totalCuFt / 27;

  return {
    cubicYards: totalCuYards,
    cubicFeet: totalCuFt,
    areaSqFt: sqFt,
    bags80lb: Math.ceil(totalCuFt / 0.60),
    trucksRequired: Math.ceil(totalCuYards / 10),
  };
}

console.log("Patio Slab (10x10x4, 0% waste):", calculateConcrete({length: 10, width: 10, depth: 4/12}, 'feet', 0));
console.log("Driveway Slab (20x20x6, 0% waste):", calculateConcrete({length: 20, width: 20, depth: 6/12}, 'feet', 0));
console.log("Garage Slab (24x24x6, 10% waste):", calculateConcrete({length: 24, width: 24, depth: 6/12}, 'feet', 10));
console.log("Foundation Slab (40x30x8, 10% waste):", calculateConcrete({length: 40, width: 30, depth: 8/12}, 'feet', 10));
