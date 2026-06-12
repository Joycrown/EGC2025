"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickSafeLetter = pickSafeLetter;
exports.nextRequiredLetter = nextRequiredLetter;
const hangman_1 = require("./hangman");
// Index Bible words by first letter — used only to pick a safe STARTING letter
const WORD_INDEX = new Map();
hangman_1.WORD_BANK.forEach(e => WORD_INDEX.set(e.word[0].toUpperCase(), true));
// Pick a random letter that has at least one Bible word starting with it.
// Used once at game start so the first required letter is always achievable.
function pickSafeLetter() {
    const letters = Array.from(WORD_INDEX.keys());
    return letters[Math.floor(Math.random() * letters.length)];
}
// After a word is accepted the next required letter is simply the last letter
// of that word — no bank check needed because any valid English word is accepted.
function nextRequiredLetter(word) {
    return word[word.length - 1].toUpperCase();
}
