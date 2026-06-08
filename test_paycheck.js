function calculatePaycheck(A, Freq, FedRate, StateRate, K401) {
  const PreTax = 0;
  const PostTax = 0;

  const gross = A / Freq;
  const k401Amount = gross * (K401 / 100);
  const totalPreTax = k401Amount + PreTax;

  const taxableIncome = gross - totalPreTax;
  
  const fedTax = taxableIncome * (FedRate / 100);
  const stateTax = taxableIncome * (StateRate / 100);
  const tTaxes = fedTax + stateTax;

  const net = taxableIncome - tTaxes - PostTax;

  return {
    gross,
    fedTax,
    stateTax,
    k401Amount,
    net
  };
}

const tests = [
  { A: 50000, Freq: 26, Fed: 12, State: 5, K: 0 },
  { A: 75000, Freq: 12, Fed: 22, State: 6, K: 0 },
  { A: 120000, Freq: 24, Fed: 24, State: 7, K: 5 },
  { A: 250000, Freq: 12, Fed: 35, State: 10, K: 10 },
];

tests.forEach((t, i) => {
  const res = calculatePaycheck(t.A, t.Freq, t.Fed, t.State, t.K);
  console.log(`Test Case ${i+1}:`);
  console.log(`  Gross: $${res.gross.toFixed(2)}`);
  if (t.K > 0) {
    console.log(`  401k: $${res.k401Amount.toFixed(2)}`);
  }
  console.log(`  Fed Tax: $${res.fedTax.toFixed(2)}`);
  console.log(`  State Tax: $${res.stateTax.toFixed(2)}`);
  console.log(`  Net: $${res.net.toFixed(2)}`);
});
