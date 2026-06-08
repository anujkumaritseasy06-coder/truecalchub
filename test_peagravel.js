const { calculateGravel } = require('./lib/calculators/gravel.ts');

const test1 = calculateGravel('rectangle', { length: 10, width: 10, depth: 4/12 }, 'feet', 'pea_gravel', 0);
console.log("10x10x4 Dog Run (Pea Gravel, 0% compaction):", {
  cuYards: test1.cubicYards,
  tons: test1.totalTons,
  pounds: test1.totalPounds
});

const test3 = calculateGravel('circular', { diameter: 12, depth: 4/12 }, 'feet', 'pea_gravel', 0);
console.log("12ft Firepit (Pea Gravel, 0% compaction):", {
  cuYards: test3.cubicYards,
  tons: test3.totalTons,
  pounds: test3.totalPounds
});
