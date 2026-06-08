function calculateMortgage(P_total, D, R, T) {
  const L = P_total - D;
  const r = R / 100 / 12;
  const n = T * 12;

  let M_PI = 0;
  if (r === 0) {
    M_PI = L / n;
  } else {
    M_PI = L * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const tInterest = (M_PI * n) - L;
  const tCost = (M_PI * n); // Note: In my React code, Total Cost of Loan = (M_PI * n)

  return {
    M_PI: M_PI,
    tInterest: tInterest,
    tCost: tCost,
    L: L
  };
}

const tests = [
  { P: 400000, D: 400000 * 0.20, R: 7, T: 30 },
  { P: 250000, D: 250000 * 0.10, R: 6, T: 15 },
  { P: 750000, D: 750000 * 0.25, R: 6.5, T: 30 },
  { P: 1000000, D: 1000000 * 0.30, R: 5.5, T: 20 },
];

tests.forEach((t, i) => {
  const res = calculateMortgage(t.P, t.D, t.R, t.T);
  console.log(`Test Case ${i+1}:`);
  console.log(`  Loan: ${res.L}`);
  console.log(`  M_PI: ${res.M_PI.toFixed(2)}`);
  console.log(`  Total Interest: ${res.tInterest.toFixed(2)}`);
});
