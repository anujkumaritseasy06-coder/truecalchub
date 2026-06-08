const fs = require('fs');

const html = fs.readFileSync('.next/server/app/finance/compound-interest-calculator.html', 'utf8');

// The HTML from Next.js server components can be tricky. Let's look for "FAQPage" without worrying about quotes.
if (html.includes('FAQPage')) {
  console.log("FAQPage schema found in HTML directly!");
} else {
  console.log("FAQPage not found in raw HTML. Let's check if it's encoded...");
  if (html.includes('FAQPage') || html.includes('FAQPage\\\"')) {
     console.log("Found encoded");
  }
}

// Let's extract the actual application/ld+json script tags
const regex = /<script type="application\/ld\+json">(.*?)<\/script>/g;
let match;
const schemas = [];
while ((match = regex.exec(html)) !== null) {
  schemas.push(match[1]);
}

console.log("Found JSON-LD blocks:", schemas.length);
schemas.forEach((s, i) => {
  console.log(`Block ${i + 1}: ${s.substring(0, 50)}...`);
  if (s.includes('FAQPage')) {
    console.log("  -> SUCCESS: FAQPage found in Block", i + 1);
  }
});
