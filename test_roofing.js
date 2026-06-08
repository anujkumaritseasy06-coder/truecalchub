const { calculateRoofing } = require('./lib/calculators/roofing.ts');

const test1 = calculateRoofing(50, 30, 6, 'average', 'architectural', 1.5, 1, true);
console.log("Scenario 1 (50x30, 6/12 pitch, Arch Shingles, 1 Layer Tear-off, Re-deck):", JSON.stringify(test1, null, 2));

const test2 = calculateRoofing(40, 25, 12, 'complex', 'metal', 1.0, 2, false);
console.log("Scenario 2 (40x25, 12/12 pitch, Metal, 2 Layers Tear-off):", JSON.stringify(test2, null, 2));

const test3 = calculateRoofing(100, 50, 2, 'simple', '3-tab', 0, 0, false);
console.log("Scenario 3 (100x50, 2/12 pitch, 3-Tab, New Construction):", JSON.stringify(test3, null, 2));
