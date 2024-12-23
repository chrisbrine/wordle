import { useState, useCallback, useEffect } from "react";
import { WORD_LENGTH, MAX_ATTEMPTS } from "../constants/game";
import { getCurrentGame, submitGuess } from "../services/gameService";
import {
    DEFAULT_STATS,
    getStatistics,
    updateStatistics,
} from "../services/statsService";
import { getWordOfTheDay } from "../utils/wordManager";

const DEFAULT_GAME_STATE = {
    attempts: Array(MAX_ATTEMPTS).fill(""),
    currentAttempt: 0,
    isGameOver: false,
    isWon: false,
    word: "",
    expiresAt: 0,
};

export function useGameState() {
    const [gameData, setGameData] = useState(DEFAULT_GAME_STATE);

    const [stats, setStats] = useState(DEFAULT_STATS);

    useEffect(() => {
        getCurrentGame().then((gameState) => {
            setGameData((prev) => ({
                ...prev,
                ...gameState,
            }));
        });
        getStatistics().then((stats) => {
            setStats(stats);
        });
        getWordOfTheDay().then((wordData) => {
            if (wordData.word !== gameData.word) {
                setGameData((prev) => ({
                    ...prev,
                    ...wordData,
                }));
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleGuess = useCallback(
        (currentWord) => {
            if (
                !currentWord ||
                currentWord.length !== WORD_LENGTH ||
                !gameData.word
            )
                return null;

            // hook up to api
            submitGuess(currentWord, gameData.currentAttempt);

            const won = currentWord === gameData.word;
            const isLastAttempt =
                gameData.currentAttempt === MAX_ATTEMPTS - 1;

            if (won) {
                const newStats = {
                    ...stats,
                    gamesPlayed: (stats.gamesPlayed || 0) + 1,
                    gamesWon: (stats.gamesWon || 0) + 1,
                };

                setGameData((prev) => ({
                    ...prev,
                    isGameOver: true,
                    isWon: true,
                }));
                setStats({ ...newStats });
                updateStatistics({ ...newStats });
                return { isGameOver: true, isWon: true };
            }

            if (isLastAttempt) {
                const newStats = {
                    ...stats,
                    gamesPlayed: (stats.gamesPlayed || 0) + 1,
                    currentStreak: 0,
                };

                setGameData((prev) => ({
                    ...prev,
                    isGameOver: true,
                    isWon: false,
                }));
                setStats(newStats);
                updateStatistics(newStats);
                return { isGameOver: true, isWon: false };
            }

            setGameData((prev) => ({
                ...prev,
                currentAttempt: prev.currentAttempt + 1,
            }));

            return null;
        },
        [gameData.currentAttempt, gameData.word, stats]
    );

    const updateAttempts = useCallback((newAttempts) => {
        if (!Array.isArray(newAttempts)) return;

        setGameData((prev) => ({
            ...prev,
            attempts: newAttempts,
        }));
    }, []);

    return {
        gameData,
        stats,
        handleGuess,
        updateAttempts,
        setGameData,
    };
}
