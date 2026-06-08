const { calculateConcrete } = require('./lib/calculators/concrete.ts');

const slab1 = calculateConcrete('rectangle', { length: 10, width: 10, depth: 4/12 }, 'feet', 0);
console.log("10x10x4 Slab (0% waste):", slab1.cubicYards);

const slab2 = calculateConcrete('rectangle', { length: 20, width: 20, depth: 6/12 }, 'feet', 0);
console.log("20x20x6 Slab (0% waste):", slab2.cubicYards);

const column = calculateConcrete('column', { diameter: 12/12, depth: 4 }, 'feet', 0);
console.log("12-inch Column, 4ft deep (0% waste):", column.cubicYards);

const stairs = calculateConcrete('stairs', { width: 4, runDepth: 11/12, depth: 7/12, runs: 10 }, 'feet', 0);
console.log("Stairs (4ft wide, 11in run, 7in rise, 10 steps, 0% waste):", stairs.cubicYards);
