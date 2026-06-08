const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir(path.join(__dirname, 'components/calculators'), (filePath) => {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace useState<string>('123.45') with useState<string>('')
    const regex1 = /useState<string>\(['"][0-9.]+['"]\)/g;
    let newContent = content.replace(regex1, "useState<string>('')");
    
    // Replace useState('123.45') with useState('')
    const regex2 = /useState\(['"][0-9.]+['"]\)/g;
    newContent = newContent.replace(regex2, "useState('')");

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  }
});

console.log("Done fixing defaults.");
