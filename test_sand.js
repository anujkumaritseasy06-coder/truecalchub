const { calculateGravel } = require('./lib/calculators/gravel.ts');

const test1 = calculateGravel('rectangle', { length: 10, width: 10, depth: 4/12 }, 'feet', 'sand', 0);
console.log("10x10x4 Sandbox (Sand, 0% compaction):", {
  cuYards: test1.cubicYards,
  tons: test1.totalTons,
  pounds: test1.totalPounds
});

const test2 = calculateGravel('rectangle', { length: 12, width: 12, depth: 1/12 }, 'feet', 'sand', 10);
console.log("12x12x1 Paver Base (Sand, 10% compaction):", {
  cuYards: test2.cubicYards,
  tons: test2.totalTons,
  pounds: test2.totalPounds
});
