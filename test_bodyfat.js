function calculateBodyFat(gender, age, system, feet, inches, lbs, cm, kg, neck, waist, hip) {
  let wKg = 0;
  let hCm = 0;
  let nCm = 0;
  let waCm = 0;
  let hiCm = 0;

  if (system === 'imperial') {
    const totalInches = (feet * 12) + inches;
    wKg = lbs * 0.453592;
    hCm = totalInches * 2.54;
    nCm = neck * 2.54;
    waCm = waist * 2.54;
    hiCm = hip * 2.54;
  } else {
    wKg = kg;
    hCm = cm;
    nCm = neck;
    waCm = waist;
    hiCm = hip;
  }

  let bf = 0;

  if (gender === 'male') {
    const d = 1.0324 - 0.19077 * Math.log10(waCm - nCm) + 0.15456 * Math.log10(hCm);
    bf = (495 / d) - 450;
  } else {
    const d = 1.29579 - 0.35004 * Math.log10(waCm + hiCm - nCm) + 0.22100 * Math.log10(hCm);
    bf = (495 / d) - 450;
  }

  return { bf: bf.toFixed(1) };
}

const tests = [
  { g: 'male', a: 30, s: 'imperial', f: 5, i: 10, w: 180, n: 15, wa: 34, hi: 0 },
  { g: 'male', a: 40, s: 'imperial', f: 6, i: 0, w: 220, n: 16, wa: 40, hi: 0 },
  { g: 'female', a: 30, s: 'imperial', f: 5, i: 5, w: 140, n: 13, wa: 30, hi: 38 },
  { g: 'female', a: 45, s: 'imperial', f: 5, i: 4, w: 180, n: 14, wa: 38, hi: 44 },
  { g: 'male', a: 35, s: 'metric', cm: 180, kg: 80, n: 40, wa: 88, hi: 0 }
];

tests.forEach((t, index) => {
  const res = calculateBodyFat(t.g, t.a, t.s, t.f || 0, t.i || 0, t.w || 0, t.cm || 0, t.kg || 0, t.n, t.wa, t.hi);
  console.log(`Test Case ${index+1}:`);
  console.log(`  Calc BF%: ${res.bf}`);
});
