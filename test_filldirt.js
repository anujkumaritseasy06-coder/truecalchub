const { calculateFillDirt } = require('./lib/calculators/fillDirt.ts');

const test1 = calculateFillDirt('rectangle', { length: 10, width: 10, depth: 12/12 }, 'feet', 20);
console.log("10x10x12 Trench (20% Compaction):", {
  cuFeet: test1.cubicFeet,
  cuYards: test1.cubicYards,
  tons: test1.totalTons,
  bags40: test1.bags40lb
});

const test2 = calculateFillDirt('circular', { diameter: 15, depth: 24/12 }, 'feet', 30);
console.log("15ft diameter Sinkhole 24in deep (30% Compaction):", {
  cuFeet: test2.cubicFeet,
  cuYards: test2.cubicYards,
  tons: test2.totalTons,
  bags40: test2.bags40lb
});
