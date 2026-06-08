function calculateCalorie(gender, age, system, feet, inches, lbs, cm, kg, activity) {
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

  const tdee = mifflin * activity;

  return { 
    bmr: Math.round(mifflin), 
    tdee: Math.round(tdee) 
  };
}

const tests = [
  { g: 'male', a: 25, s: 'imperial', f: 5, i: 10, w: 180, act: 1.55 },
  { g: 'female', a: 30, s: 'imperial', f: 5, i: 5, w: 140, act: 1.375 },
  { g: 'male', a: 45, s: 'imperial', f: 6, i: 0, w: 220, act: 1.725 },
  { g: 'female', a: 55, s: 'imperial', f: 5, i: 4, w: 160, act: 1.2 },
  { g: 'male', a: 35, s: 'metric', cm: 180, kg: 80, act: 1.9 }
];

tests.forEach((t, index) => {
  const res = calculateCalorie(t.g, t.a, t.s, t.f || 0, t.i || 0, t.w || 0, t.cm || 0, t.kg || 0, t.act);
  console.log(`Test Case ${index+1}:`);
  console.log(`  Expected Activity Mult: ${t.act}`);
  console.log(`  BMR: ${res.bmr}`);
  console.log(`  TDEE: ${res.tdee}`);
});
