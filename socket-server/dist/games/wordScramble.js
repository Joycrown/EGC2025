"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickRandomWord = void 0;
exports.scrambleWord = scrambleWord;
exports.toScrambleClientState = toScrambleClientState;
exports.isCorrectAnswer = isCorrectAnswer;
const hangman_1 = require("./hangman");
Object.defineProperty(exports, "pickRandomWord", { enumerable: true, get: function () { return hangman_1.pickRandomWord; } });
// Fisher-Yates shuffle, ensures result !== original
function scrambleWord(word) {
    const letters = word.split('');
    let result = word;
    let attempts = 0;
    while (result === word && attempts < 20) {
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        result = letters.join('');
        attempts++;
    }
    // For very short words (2 letters) where shuffle always = original, reverse instead
    if (result === word && word.length > 1) {
        result = word.split('').reverse().join('');
    }
    return result;
}
function toScrambleClientState(scrambledWord, category, hint, wordNumber, totalWords, wordSolved) {
    return { scrambledWord, category, hint, wordNumber, totalWords, wordSolved };
}
function isCorrectAnswer(answer, word) {
    return answer.trim().toUpperCase() === word.toUpperCase();
}
