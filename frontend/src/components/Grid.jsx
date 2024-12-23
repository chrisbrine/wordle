import { WORD_LENGTH, MAX_ATTEMPTS } from "../constants";
import { getGuessStatuses } from "../utils/wordUtils";
import PropTypes from "prop-types";

function Grid({ gameData = {} }) {
    return (
        <div className="grid">
            {Array(MAX_ATTEMPTS)
                .fill()
                .map((_, rowIndex) => {
                    // Only evaluate completed rows
                    const isCompletedRow =
                        rowIndex < gameData.currentAttempt;
                    const statuses =
                        isCompletedRow && gameData.word
                            ? getGuessStatuses(
                                  gameData.attempts[rowIndex],
                                  gameData.word
                              )
                            : Array(WORD_LENGTH).fill("");

                    return (
                        <div key={rowIndex} className="grid-row">
                            {Array(WORD_LENGTH)
                                .fill()
                                .map((_, colIndex) => {
                                    const letter =
                                        gameData.attempts[rowIndex]?.[
                                            colIndex
                                        ] || "";
                                    const status =
                                        statuses[colIndex] || "";

                                    return (
                                        <div
                                            key={colIndex}
                                            className={`grid-cell ${
                                                letter ? "filled" : ""
                                            } ${status}`}
                                        >
                                            {letter}
                                        </div>
                                    );
                                })}
                        </div>
                    );
                })}
        </div>
    );
}
Grid.propTypes = {
    gameData: PropTypes.any,
};

export default Grid;
