function calculateLoan(P, R, Y, M, E) {
  const n = (Y * 12) + M;
  const r = R / 100 / 12;

  let baseM = 0;
  if (r === 0) {
    baseM = P / n;
  } else {
    baseM = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const standardTotalInterest = (baseM * n) - P;

  let balance = P;
  let actualMonths = 0;
  let actualInterest = 0;
  const actualMonthlyPayment = baseM + E;

  let safetyCounter = 0;
  if (r === 0) {
    actualMonths = Math.ceil(P / actualMonthlyPayment);
    actualInterest = 0;
  } else {
    while (balance > 0 && safetyCounter < 1200) {
      const interestForMonth = balance * r;
      actualInterest += interestForMonth;
      
      let principalPaid = actualMonthlyPayment - interestForMonth;
      if (principalPaid > balance) {
        principalPaid = balance;
      }
      
      balance -= principalPaid;
      actualMonths++;
      safetyCounter++;
    }
  }

  const tSavings = Math.max(0, standardTotalInterest - actualInterest);
  const mSaved = Math.max(0, n - actualMonths);

  return {
    baseM,
    actualInterest,
    tSavings,
    actualMonths,
    mSaved
  };
}

const tests = [
  { P: 250000, R: 6, Y: 5, M: 0, E: 0 }, // Wait, Test Case 1 says Loan Amount: 25,000. Let me check the prompt: 25000.
  { P: 25000, R: 6, Y: 5, M: 0, E: 0 },
  { P: 50000, R: 8, Y: 10, M: 0, E: 0 },
  { P: 100000, R: 7.5, Y: 15, M: 0, E: 0 },
  { P: 250000, R: 5.5, Y: 30, M: 0, E: 0 },
  { P: 50000, R: 8, Y: 10, M: 0, E: 200 }
];

tests.forEach((t, i) => {
  if (i === 0) return; // skip the wrong 250k test I typed first
  const res = calculateLoan(t.P, t.R, t.Y, t.M, t.E);
  console.log(`Test Case ${i}:`);
  console.log(`  M_PI: ${res.baseM.toFixed(2)}`);
  console.log(`  Total Interest: ${res.actualInterest.toFixed(2)}`);
  if (t.E > 0) {
    console.log(`  Interest Savings: ${res.tSavings.toFixed(2)}`);
    console.log(`  Time Saved: ${res.mSaved} months`);
  }
});
