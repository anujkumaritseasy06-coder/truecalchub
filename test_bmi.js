function calculateBMI(system, feet, inches, lbs, cm, kg) {
  let bmi = 0;
  
  if (system === 'imperial') {
    const totalInches = (feet * 12) + inches;
    bmi = (lbs / (totalInches * totalInches)) * 703;
  } else {
    const m = cm / 100;
    bmi = kg / (m * m);
  }

  let cat = '';
  if (bmi < 18.5) cat = 'Underweight';
  else if (bmi >= 18.5 && bmi <= 24.9) cat = 'Normal Weight';
  else if (bmi >= 25 && bmi <= 29.9) cat = 'Overweight';
  else cat = 'Obesity';

  return { bmi, cat };
}

const tests = [
  { s: 'imperial', f: 5, i: 10, w: 160, exp: 'Normal Weight' },
  { s: 'imperial', f: 5, i: 8, w: 120, exp: 'Underweight' },
  { s: 'imperial', f: 5, i: 9, w: 200, exp: 'Overweight' },
  { s: 'imperial', f: 5, i: 6, w: 250, exp: 'Obesity' },
  { s: 'metric', cm: 180, kg: 75, exp: 'Normal Weight' }
];

tests.forEach((t, index) => {
  const res = calculateBMI(t.s, t.f || 0, t.i || 0, t.w || 0, t.cm || 0, t.kg || 0);
  console.log(`Test Case ${index+1}:`);
  console.log(`  Expected Category: ${t.exp}`);
  console.log(`  Calc BMI: ${res.bmi.toFixed(1)}`);
  console.log(`  Calc Category: ${res.cat}`);
  console.log(`  Pass: ${res.cat === t.exp}`);
});
