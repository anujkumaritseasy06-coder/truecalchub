const { calculateFenceCost } = require('./lib/calculators/fence-cost.ts');

const test1 = calculateFenceCost(100, 'pine', '6', 1, 'flat', 'diy');
console.log("Scenario 1 (100ft Pine, 6ft, 1 Gate, Flat, DIY):", JSON.stringify(test1, null, 2));

const test2 = calculateFenceCost(150, 'cedar', '8', 2, 'sloped', 'pro');
console.log("Scenario 2 (150ft Cedar, 8ft, 2 Gates, Sloped, PRO):", JSON.stringify(test2, null, 2));

const test3 = calculateFenceCost(200, 'vinyl', '4', 0, 'rocky', 'pro');
console.log("Scenario 3 (200ft Vinyl, 4ft, 0 Gates, Rocky, PRO):", JSON.stringify(test3, null, 2));
