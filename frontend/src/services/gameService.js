import { getFromStorage, setInStorage } from "../utils/storage";
import { MAX_ATTEMPTS } from "../constants/game";

const DEFAULT_GAME = {
    attempts: Array(MAX_ATTEMPTS).fill(""),
    currentAttempt: 0,
    isGameOver: false,
    isWon: false,
};

export async function getCurrentGame() {
    return getFromStorage("GAME", DEFAULT_GAME);
}

export function saveGameState(gameState) {
    return setInStorage("GAME", gameState);
}

export function submitGuess(word, attempt) {
    // In offline mode, just record the attempt
    return {
        word,
        attempt,
        timestamp: Date.now(),
    };
}
