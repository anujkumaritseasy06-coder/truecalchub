const { calculateGravel } = require('./lib/calculators/gravel.ts');

const test1 = calculateGravel('rectangle', { length: 10, width: 10, depth: 4/12 }, 'feet', 'crushed_stone', 10);
console.log("10x10x4 Driveway (Crushed Stone, 10% compaction):", {
  cuYards: test1.cubicYards,
  tons: test1.totalTons,
  pounds: test1.totalPounds
});

const test2 = calculateGravel('rectangle', { length: 20, width: 20, depth: 6/12 }, 'feet', 'pea_gravel', 0);
console.log("20x20x6 Patio Base (Pea Gravel, 0% compaction):", {
  cuYards: test2.cubicYards,
  tons: test2.totalTons,
  pounds: test2.totalPounds
});

const test3 = calculateGravel('circular', { diameter: 12, depth: 4/12 }, 'feet', 'river_rock', 10);
console.log("12ft Firepit (River Rock, 10% compaction):", {
  cuYards: test3.cubicYards,
  tons: test3.totalTons,
  pounds: test3.totalPounds
});
