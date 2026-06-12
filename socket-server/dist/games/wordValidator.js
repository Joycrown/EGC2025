"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBibleWord = isBibleWord;
exports.validateWord = validateWord;
const hangman_1 = require("./hangman");
// Bible proper-nouns and key terms — awards bonus points in Word Chain
const BIBLE_WORD_SET = new Set(hangman_1.WORD_BANK.map(e => e.word.toUpperCase()));
// ~275,000 common English words, loaded once at startup — no API needed
const an_array_of_english_words_1 = __importDefault(require("an-array-of-english-words"));
const ENGLISH_WORD_SET = new Set(an_array_of_english_words_1.default.map(w => w.toUpperCase()));
function isBibleWord(word) {
    return BIBLE_WORD_SET.has(word.toUpperCase());
}
async function validateWord(word) {
    const upper = word.toUpperCase();
    // 1. Bible bank — instant, awards Bible bonus points
    if (BIBLE_WORD_SET.has(upper))
        return { valid: true, isBibleWord: true };
    // 2. Local English dictionary — instant, no network, survives server restarts
    if (ENGLISH_WORD_SET.has(upper))
        return { valid: true, isBibleWord: false };
    return { valid: false, isBibleWord: false };
}
