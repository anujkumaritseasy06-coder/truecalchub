const { calculateConcrete } = require('./lib/calculators/concrete.ts');

const patio = calculateConcrete('rectangle', { length: 10, width: 10, depth: 4/12 }, 'feet', 0);
console.log("Patio Slab (10x10x4, 0% waste):", {
  cuYards: patio.cubicYards,
  bags80: patio.bags80lb
});

const sidewalk = calculateConcrete('rectangle', { length: 20, width: 3, depth: 4/12 }, 'feet', 10);
console.log("Sidewalk (20x3x4, 10% waste):", {
  cuYards: sidewalk.cubicYards,
  bags60: sidewalk.bags60lb
});

const shed = calculateConcrete('rectangle', { length: 12, width: 12, depth: 6/12 }, 'feet', 10);
console.log("Shed (12x12x6, 10% waste):", {
  cuYards: shed.cubicYards,
  bags80: shed.bags80lb
});

const garage = calculateConcrete('rectangle', { length: 24, width: 24, depth: 6/12 }, 'feet', 10);
console.log("Garage (24x24x6, 10% waste):", {
  cuYards: garage.cubicYards,
  bags80: garage.bags80lb
});

const foundation = calculateConcrete('rectangle', { length: 40, width: 30, depth: 8/12 }, 'feet', 10);
console.log("Foundation (40x30x8, 10% waste):", {
  cuYards: foundation.cubicYards,
  bags80: foundation.bags80lb
});
