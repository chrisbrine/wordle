import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import Grid from "./components/Grid";
import Keyboard from "./components/Keyboard";
import Instructions from "./components/Instructions";
import Statistics from "./components/Statistics";
import { useKeyboard } from "./hooks/useKeyboard";
import { useGameState } from "./hooks/useGameState";
import { WORD_LENGTH, MAX_ATTEMPTS } from "./constants/game";
import { getWordOfTheDay } from "./utils/wordManager";
import { saveGameState } from "./services/gameService";
import "./App.css";
import "./styles/modal.css";

export default function App() {
    const { gameData, stats, handleGuess, updateAttempts, setGameData } =
        useGameState();
    const [showInstructions, setShowInstructions] = useState(true);
    const [showStats, setShowStats] = useState(false);

    useEffect(() => {
        if (gameData.isGameOver && !showStats) {
            saveGameState(gameData);
        }
    }, [showStats, gameData]);

    // useEffect(() => {
    //     const checkExpiry = () => {
    //         if (gameData?.expiresAt && Date.now() >= gameData.expiresAt) {
    //             resetGame();
    //         }
    //     };

    //     const timer = setInterval(checkExpiry, 1000);
    //     return () => clearInterval(timer);
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [gameData?.expiresAt, gameData]);

    const resetGame = useCallback(() => {
        const newGameData = {
            ...gameData,
            attempts: Array(MAX_ATTEMPTS).fill(""),
            currentAttempt: 0,
            isGameOver: false,
            isWon: false,
        };
        getWordOfTheDay().then((wordData) => {
            if (wordData.word !== gameData.word) {
                setGameData((prev) => ({
                    ...prev,
                    ...wordData,
                    attempts: Array(MAX_ATTEMPTS).fill(""),
                    currentAttempt: 0,
                    isGameOver: false,
                    isWon: false,
                }));
            }
        });

        setGameData(newGameData);
        setShowStats(false);
        saveGameState(newGameData);
    }, [gameData, setGameData]);

    const handleKeyPress = (key) => {
        if (!gameData || gameData.isGameOver) return;

        const attempts = gameData.attempts || Array(MAX_ATTEMPTS).fill("");
        const currentAttempt = gameData.currentAttempt || 0;
        const currentWord = attempts[currentAttempt] || "";

        if (key === "ENTER") {
            if (currentWord.length === WORD_LENGTH) {
                const result = handleGuess(currentWord);
                if (result?.isGameOver) {
                    setShowStats(true);
                }
            }
        } else if (key === "BACKSPACE") {
            if (currentWord.length > 0) {
                const newAttempts = [...attempts];
                newAttempts[currentAttempt] = currentWord.slice(0, -1);
                updateAttempts(newAttempts);
            }
        } else if (currentWord.length < WORD_LENGTH) {
            const newAttempts = [...attempts];
            newAttempts[currentAttempt] = currentWord + key;
            updateAttempts(newAttempts);
        }
    };

    useKeyboard(handleKeyPress, showInstructions || showStats);

    if (!gameData) return null;

    return (
        <div className="app">
            <Header
                onInstructionsClick={() => setShowInstructions(true)}
                onStatsClick={() => setShowStats(true)}
            />
            <main className="game-container">
                <Grid gameData={gameData} />
                <Keyboard
                    onKeyPress={handleKeyPress}
                    gameData={gameData}
                />
            </main>

            {showInstructions && (
                <Instructions onClose={() => setShowInstructions(false)} />
            )}

            {showStats && (
                <Statistics
                    stats={stats}
                    gameState={gameData}
                    onClose={() => {
                        setShowStats(false);
                        if (gameData.isGameOver) {
                            resetGame();
                        }
                    }}
                />
            )}
        </div>
    );
}
