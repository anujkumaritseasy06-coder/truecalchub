const fs = require('fs');
const { execSync } = require('child_process');

const files = fs.readdirSync(__dirname).filter(f => f.startsWith('test_') && f.endsWith('.js') && f !== 'test_schema.js' && f !== 'test_mdx.js');
const report = [];

for (const file of files) {
  try {
    const output = execSync(`node ${file}`, { encoding: 'utf-8' });
    report.push({
      calculator: file.replace('test_', '').replace('.js', ''),
      pass: !output.toLowerCase().includes('fail') && !output.toLowerCase().includes('error'),
      output: output.trim()
    });
  } catch (error) {
    report.push({
      calculator: file.replace('test_', '').replace('.js', ''),
      pass: false,
      output: error.stdout ? error.stdout.toString() : error.message
    });
  }
}

fs.writeFileSync('audit_results_part2.json', JSON.stringify(report, null, 2));
console.log('Part 2 audit (Math/Functional) complete.');
