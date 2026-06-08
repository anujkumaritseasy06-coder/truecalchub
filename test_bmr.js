function calculateBMR(gender, age, system, feet, inches, lbs, cm, kg) {
  let weightKg = 0;
  let heightCm = 0;

  if (system === 'imperial') {
    const totalInches = (feet * 12) + inches;
    weightKg = lbs * 0.453592;
    heightCm = totalInches * 2.54;
  } else {
    weightKg = kg;
    heightCm = cm;
  }

  // Mifflin-St Jeor Equation
  let mifflin = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  mifflin = gender === 'male' ? mifflin + 5 : mifflin - 161;

  // Harris-Benedict Equation (Revised 1984)
  let harris = 0;
  if (gender === 'male') {
    harris = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
  } else {
    harris = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
  }

  return { 
    mifflin: Math.round(mifflin), 
    harris: Math.round(harris) 
  };
}

const tests = [
  { g: 'male', a: 25, s: 'imperial', f: 5, i: 10, w: 180 },
  { g: 'female', a: 30, s: 'imperial', f: 5, i: 5, w: 140 },
  { g: 'male', a: 45, s: 'imperial', f: 6, i: 0, w: 220 },
  { g: 'female', a: 55, s: 'imperial', f: 5, i: 4, w: 160 },
  { g: 'male', a: 35, s: 'metric', cm: 180, kg: 80 }
];

tests.forEach((t, index) => {
  const res = calculateBMR(t.g, t.a, t.s, t.f || 0, t.i || 0, t.w || 0, t.cm || 0, t.kg || 0);
  console.log(`Test Case ${index+1}:`);
  console.log(`  Mifflin: ${res.mifflin}`);
  console.log(`  Harris: ${res.harris}`);
});
