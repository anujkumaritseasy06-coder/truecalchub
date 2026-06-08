const { calculateMulch } = require('./lib/calculators/mulch.ts');

const test1 = calculateMulch('rectangle', { length: 10, width: 10, depth: 3/12 }, 'feet');
console.log("10x10x3 Garden Bed (Mulch):", {
  cuFeet: test1.cubicFeet,
  cuYards: test1.cubicYards,
  bags2: test1.bags2_0,
  bags3: test1.bags3_0
});

const test2 = calculateMulch('circular', { diameter: 5, depth: 3/12 }, 'feet');
console.log("5ft diameter Tree Ring 3in deep (Mulch):", {
  cuFeet: test2.cubicFeet,
  cuYards: test2.cubicYards,
  bags2: test2.bags2_0
});
