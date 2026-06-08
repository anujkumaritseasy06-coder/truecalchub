const { calculateFence } = require('./lib/calculators/fence.ts');

const wood = calculateFence(100, 'feet', 'wood', 8, 24, 3, 5.5, 1, 10);
console.log("Wood (100ft, 8ft O.C., 24in hole, 3-rail, 5.5in picket, 1 gate, 10% waste):", wood);

const vinyl = calculateFence(120, 'feet', 'vinyl', 8, 36, 0, 0, 0, 5);
console.log("Vinyl (120ft, 8ft O.C., 36in hole, 0 gate, 5% waste):", vinyl);

const split = calculateFence(200, 'feet', 'split-rail', 10, 48, 3, 0, 2, 10);
console.log("Split Rail (200ft, 10ft O.C., 48in hole, 3-hole, 2 gate, 10% waste):", split);

const chain = calculateFence(300, 'feet', 'chain-link', 10, 24, 0, 0, 0, 0);
console.log("Chain Link (300ft, 10ft O.C., 24in hole, 0 gate, 0% waste):", chain);
