// This is the script I created to test out the shuffle algorithm

const crypto = require("crypto");

// Util Functions
function swap(arr, i, j) {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
  return arr;
}

// Generation of the Card Deck
let suitSet = ["Spades", "Hearts", "Clubs", "Diamonds"];

let cardSet = ["7", "8", "9", "10", "J", "Q", "K", "A"];
let cardPack = [];

function decodeCard(number) {
  const suit = suitSet[Math.floor(number / 8)];
  const card = cardSet[number % 8];

  return {
    suit,
    card,
  };
}

for (let i = 0; i < 32; i++) {
  cardPack.push(i);
}

// The Random Number Machine
let seed = crypto.randomInt(2 ** 32);
console.log("Initial Seed:", seed);

// LCG -> Linear Congruential Generator (https://en.wikipedia.org/wiki/Linear_congruential_generator)
let LCGNum = seed;

for (let i = 31; i >= 0; i--) {
  LCGNum = (1664525 * LCGNum + 1013904223) % 2 ** 32;
  const shuffleIndex = LCGNum % (i + 1);
  cardPack = swap(cardPack, i, shuffleIndex);
}

console.log(cardPack.map((v) => decodeCard(v)));
