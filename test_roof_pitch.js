const { calculateRoofPitch } = require('./lib/calculators/roof-pitch.ts');

const test1 = calculateRoofPitch('pitch', 0, 0, 0, 6, 24, 18);
console.log("Scenario 1 (6/12 pitch, 24ft span, 18in overhang):", JSON.stringify(test1, null, 2));

const test2 = calculateRoofPitch('pitch', 0, 0, 0, 12, 30, 24);
console.log("Scenario 2 (12/12 pitch, 30ft span, 24in overhang):", JSON.stringify(test2, null, 2));

const test3 = calculateRoofPitch('rise-run', 4, 12, 0, 0, 40, 12);
console.log("Scenario 3 (4/12 rise-run, 40ft span, 12in overhang):", JSON.stringify(test3, null, 2));
