function calculateSalary(A, H, D, V, Hol) {
  const totalWeeks = 365 / 7; // 52.142857
  const hoursPerDay = H / D;
  const standardAnnualWorkDays = D * totalWeeks;
  
  const actualWorkDays = standardAnnualWorkDays - V - Hol;
  const actualWorkHours = actualWorkDays * hoursPerDay;

  const hourlyRate = A / actualWorkHours;
  const dailyRate = hourlyRate * hoursPerDay;
  const weeklyRate = A / totalWeeks;
  const biWeeklyRate = A / (totalWeeks / 2);
  const monthlyRate = A / 12;

  return {
    hourly: hourlyRate,
    daily: dailyRate,
    weekly: weeklyRate,
    biWeekly: biWeeklyRate,
    monthly: monthlyRate
  };
}

const tests = [
  { A: 50000, H: 40, D: 5, V: 0, Hol: 0 },
  { A: 75000, H: 40, D: 5, V: 0, Hol: 0 },
  { A: 120000, H: 45, D: 5, V: 0, Hol: 0 },
  { A: 250000, H: 50, D: 5, V: 0, Hol: 0 },
  { A: 80000, H: 40, D: 5, V: 15, Hol: 10 },
];

tests.forEach((t, i) => {
  const res = calculateSalary(t.A, t.H, t.D, t.V, t.Hol);
  console.log(`Test Case ${i+1}:`);
  console.log(`  Hourly: $${res.hourly.toFixed(2)}`);
  console.log(`  Daily: $${res.daily.toFixed(2)}`);
  console.log(`  Weekly: $${res.weekly.toFixed(2)}`);
  console.log(`  Bi-Weekly: $${res.biWeekly.toFixed(2)}`);
  console.log(`  Monthly: $${res.monthly.toFixed(2)}`);
});
