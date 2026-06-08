const matter = require('gray-matter');
const fs = require('fs');

const fileContents = fs.readFileSync('./content/calculators/compound-interest-calculator.mdx', 'utf8');
const { data } = matter(fileContents);
console.log(JSON.stringify(data.faqs, null, 2));
