const fs = require('fs');
const tsNode = require('child_process').execSync;

// We will just write a simple JS test replicating the logic to test it here.
function convertToFeet(value, unit) {
  if (value < 0 || isNaN(value)) return 0;
  switch (unit) {
    case 'feet': return value;
    case 'inches': return value / 12;
    case 'yards': return value * 3;
    case 'meters': return value * 3.28084;
    case 'centimeters': return value * 0.0328084;
    default: return value;
  }
}

function calculateConcrete(shape, dims, unit, wasteFactorPct) {
  let cuFt = 0;
  let sqFt = 0;
  const l = convertToFeet(dims.length || 0, unit);
  const w = convertToFeet(dims.width || 0, unit);
  const d = convertToFeet(dims.depth || 0, unit);
  const dia = convertToFeet(dims.diameter || 0, unit);

  switch (shape) {
    case 'rectangle':
    case 'footing':
    case 'wall':
      cuFt = l * w * d;
      sqFt = l * w;
      break;
    case 'square':
      cuFt = l * l * d;
      sqFt = l * l;
      break;
    case 'circular':
      const radius = dia / 2;
      sqFt = Math.PI * (radius * radius);
      cuFt = sqFt * d;
      break;
    case 'column':
      const colRadius = dia / 2;
      sqFt = Math.PI * (colRadius * colRadius);
      cuFt = sqFt * d;
      break;
    case 'stairs':
      const runs = dims.runs || 0;
      const rDepth = convertToFeet(dims.runDepth || 0, unit);
      const stepVol = w * rDepth * d;
      cuFt = stepVol * runs;
      sqFt = w * rDepth * runs;
      break;
  }

  const wasteMultiplier = 1 + (wasteFactorPct / 100);
  const totalCuFt = cuFt * wasteMultiplier;
  const totalCuYards = totalCuFt / 27;

  return {
    cubicYards: totalCuYards,
    cubicFeet: totalCuFt,
    bags80lb: Math.ceil(totalCuFt / 0.60),
    trucksRequired: Math.ceil(totalCuYards / 10),
  };
}

const t1 = calculateConcrete('rectangle', { length: 10, width: 10, depth: 4/12 }, 'feet', 10);
console.log("10x10 slab, 4 inches deep, 10% waste:", t1);
// 10 * 10 * 0.333333 = 33.33 cu ft.
// + 10% = 36.66 cu ft.
// 36.66 / 27 = 1.35 cu yards.

const t2 = calculateConcrete('stairs', { width: 4, runDepth: 11/12, depth: 7/12, runs: 5 }, 'feet', 0);
console.log("5 steps, 4ft wide, 11in tread, 7in riser:", t2);
// 4 * (11/12) * (7/12) * 5 = 10.69 cu ft.
// 10.69 / 27 = 0.39 cu yards.
