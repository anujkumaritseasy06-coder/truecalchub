const { calculateGravel } = require('./lib/calculators/gravel.ts');

const test1 = calculateGravel('rectangle', { length: 10, width: 10, depth: 4/12 }, 'feet', 'crushed_stone', 10);
console.log("10x10x4 Driveway Base (10% Compaction):", {
  cuFeet: test1.cubicFeet,
  cuYards: test1.cubicYards,
  tons: test1.totalTons,
  bags50: test1.bags50lb
});

const test2 = calculateGravel('circular', { diameter: 12, depth: 6/12 }, 'feet', 'crushed_stone', 0);
console.log("12ft diameter Fire Pit Base 6in deep (0% Compaction):", {
  cuFeet: test2.cubicFeet,
  cuYards: test2.cubicYards,
  tons: test2.totalTons,
  bags50: test2.bags50lb
});
