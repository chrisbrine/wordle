import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Modal from "./Modal";
import { getNextWordTime, formatTimeRemaining } from "../utils/timeUtils";

function Statistics({ stats, onClose, gameState }) {
    const [timeRemaining, setTimeRemaining] = useState(getNextWordTime());
    const { gamesPlayed, gamesWon } = stats;

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(getNextWordTime());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <Modal onClose={onClose}>
            <div className="stats-container">
                <div className="stats-header">
                    <h2>STATISTICS</h2>
                </div>

                <div className="stats-row">
                    <div className="stat-item">
                        <span className="stat-number">{gamesPlayed}</span>
                        <span className="stat-label">Played</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{gamesWon}</span>
                        <span className="stat-label">Victories</span>
                    </div>
                </div>

                {gameState.isGameOver && (
                    <div className="game-result">
                        <h3>
                            {gameState.isWon ? "You won!" : "Game Over"}
                        </h3>
                        <p>The word was: {gameState.word}</p>
                    </div>
                )}

                <div className="next-word-timer">
                    <h3>NEXT WORD IN</h3>
                    <span className="countdown">
                        {formatTimeRemaining(timeRemaining)}
                    </span>
                </div>

                <button className="modal-button" onClick={onClose}>
                    Accept
                </button>
            </div>
        </Modal>
    );
}
Statistics.propTypes = {
    stats: PropTypes.shape({
        gamesPlayed: PropTypes.number.isRequired,
        gamesWon: PropTypes.number.isRequired,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    gameState: PropTypes.shape({
        isGameOver: PropTypes.bool.isRequired,
        isWon: PropTypes.bool.isRequired,
        word: PropTypes.string.isRequired,
    }).isRequired,
};

export default Statistics;
