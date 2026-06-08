const { calculateFencePosts } = require('./lib/calculators/fence.ts');

const test1 = calculateFencePosts(100, 'feet', 8, 0, 8, 24, 3.5, 0);
console.log("Scenario 1 (4x4 Wood, 8in Auger, 24in Deep):", test1);

const test2 = calculateFencePosts(150, 'feet', 8, 2, 12, 48, 5.5, 0);
console.log("Scenario 2 (6x6 Wood, 12in Auger, 48in Deep):", test2);

const test3 = calculateFencePosts(200, 'feet', 10, 0, 6, 36, 2.375, 5);
console.log("Scenario 3 (Steel Pipe, 6in Auger, 36in Deep):", test3);
