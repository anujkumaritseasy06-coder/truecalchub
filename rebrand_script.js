const fs = require('fs');
const path = require('path');

const DIRS_TO_SCAN = ['app', 'components', 'content', 'lib'];
const IGNORE_FILES = ['rebrand_script.js', 'package-lock.json', '.next', 'node_modules'];

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    if (IGNORE_FILES.includes(f)) return;
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

let modifiedCount = 0;

DIRS_TO_SCAN.forEach(dir => {
  walkDir(path.join(__dirname, dir), (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.mdx') || filePath.endsWith('.md') || filePath.endsWith('.json')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let newContent = content
        .replace(/Ultimate Calculator Hub/gi, 'TrueCalcHub')
        .replace(/ultimatecalculatorhub\.com/gi, 'truecalchub.com');

      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Rebranded: ${filePath}`);
        modifiedCount++;
      }
    }
  });
});

console.log(`Rebranding complete! Modified ${modifiedCount} files.`);
