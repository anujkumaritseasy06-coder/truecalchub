const { calculateDeck } = require('./lib/calculators/deck.ts');

const test1 = calculateDeck({ length: 10, width: 10 }, 'feet', 16, 10);
console.log("10x10 Standard Wood Deck (16 O.C., 10% Waste):", {
  sqFt: test1.squareFeet,
  deckingLF: test1.deckingLinealFeet,
  boards16: test1.deckingBoards16ft,
  joistLF: test1.joistLinealFeet,
  screws: test1.totalScrews
});

const test2 = calculateDeck({ length: 20, width: 12 }, 'feet', 12, 15);
console.log("20x12 Composite Deck (12 O.C., 15% Waste):", {
  sqFt: test2.squareFeet,
  deckingLF: test2.deckingLinealFeet,
  boards16: test2.deckingBoards16ft,
  joistLF: test2.joistLinealFeet,
  screws: test2.totalScrews
});
