const { calculateAsphalt } = require('./lib/calculators/asphalt.ts');

const test1 = calculateAsphalt('rectangle', { length: 10, width: 10, depth: 2/12 }, 'feet');
console.log("10x10x2 Driveway (Asphalt):", {
  tons: test1.totalTons,
  tackCoat: test1.tackCoatGallons,
  sqFt: test1.areaSquareFeet
});

const test2 = calculateAsphalt('rectangle', { length: 20, width: 20, depth: 4/12 }, 'feet');
console.log("20x20x4 Parking Lot (Asphalt):", {
  tons: test2.totalTons,
  tackCoat: test2.tackCoatGallons,
  sqFt: test2.areaSquareFeet
});

const test3 = calculateAsphalt('circular', { diameter: 40, depth: 3/12 }, 'feet');
console.log("40ft Cul-de-sac 3in deep (Asphalt):", {
  tons: test3.totalTons,
  tackCoat: test3.tackCoatGallons,
  sqFt: test3.areaSquareFeet
});
