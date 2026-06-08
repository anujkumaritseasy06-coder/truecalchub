function calculateAPR(P, R, Y, F, C, O) {
  const totalFeesCalc = F + C + O;
  const n = Y * 12;
  const r = R / 100 / 12;

  let baseM = 0;
  if (r === 0) {
    baseM = P / n;
  } else {
    baseM = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const adjustedLoanAmount = P - totalFeesCalc;
  let aprResult = R;

  if (totalFeesCalc === 0) {
    aprResult = R;
  } else if (baseM > 0 && adjustedLoanAmount > 0) {
    let low = 0;
    let high = 1; 
    let mid = 0;
    
    for (let i = 0; i < 100; i++) { 
      mid = (low + high) / 2;
      
      let pv = 0;
      if (mid === 0) {
        pv = baseM * n;
      } else {
        pv = baseM * ((1 - Math.pow(1 + mid, -n)) / mid);
      }

      if (pv > adjustedLoanAmount) {
        low = mid;
      } else {
        high = mid;
      }
    }
    
    aprResult = mid * 12 * 100;
  }

  return {
    apr: aprResult,
    baseM
  };
}

const tests = [
  { P: 25000, R: 6, Y: 5, F: 500, C: 0, O: 0 },
  { P: 50000, R: 7, Y: 10, F: 1500, C: 0, O: 0 },
  { P: 250000, R: 6, Y: 30, F: 0, C: 8000, O: 0 },
  { P: 500000, R: 5.5, Y: 30, F: 0, C: 12000, O: 0 },
];

tests.forEach((t, i) => {
  const res = calculateAPR(t.P, t.R, t.Y, t.F, t.C, t.O);
  console.log(`Test Case ${i+1}:`);
  console.log(`  M_PI: ${res.baseM.toFixed(2)}`);
  console.log(`  APR: ${res.apr.toFixed(3)}%`);
});
