const { calculateTopsoil } = require('./lib/calculators/topsoil.ts');

const test1 = calculateTopsoil('rectangle', { length: 10, width: 10, depth: 4/12 }, 'feet', 15);
console.log("10x10x4 Lawn Base (15% Settling):", {
  cuFeet: test1.cubicFeet,
  cuYards: test1.cubicYards,
  tons: test1.totalTons,
  bags40: test1.bags40lb
});

const test2 = calculateTopsoil('circular', { diameter: 8, depth: 6/12 }, 'feet', 0);
console.log("8ft diameter Planter 6in deep (0% Settling):", {
  cuFeet: test2.cubicFeet,
  cuYards: test2.cubicYards,
  tons: test2.totalTons,
  bags40: test2.bags40lb
});
