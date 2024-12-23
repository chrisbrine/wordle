import { getWord } from "../services/api";
// import { getFromStorage, setInStorage } from "./storage";
import { setInStorage } from "./storage";

const FALLBACK_WORDS = ["REACT", "BUILD", "CODES", "STACK", "LEARN"];

function getTodayIndex() {
    const num = Math.round(Math.random() * FALLBACK_WORDS.length - 1);
    return num >= FALLBACK_WORDS.length
        ? FALLBACK_WORDS.length - 1
        : num < 0
        ? 0
        : num;
}

function getMidnightTimestamp() {
    return new Date(new Date().setHours(24, 0, 0, 0)).getTime();
}

export async function getWordOfTheDay() {
    // Try to get it from the server API first
    try {
        const wordData = await getWord();
        if (wordData) {
            const gameData = {
                word: wordData.word,
                expiresAt: wordData.expires,
            };
            // setInStorage("WORD", gameData);
            return gameData;
        }
    } catch (error) {
        console.error("Error getting the current word:", error);
    }

    // Try to get cached word first
    // const cached = getFromStorage("WORD", null);
    // if (cached && cached.expiresAt > Date.now()) {
    //     return cached;
    // }

    // Generate new word
    const word = FALLBACK_WORDS[getTodayIndex()];
    const gameData = {
        word,
        expiresAt: getMidnightTimestamp(),
    };

    setInStorage("WORD", gameData);
    return gameData;
}
