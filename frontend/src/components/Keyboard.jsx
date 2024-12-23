import { KEYBOARD_KEYS } from "../constants";
import { getGuessStatuses } from "../utils/wordUtils";
import PropTypes from "prop-types";

function Keyboard({ gameData = {}, onKeyPress }) {
    const { attempts, currentAttempt, word } = gameData;
    const targetWord = word;
    const getKeyStatus = (key) => {
        if (!targetWord) return "";

        let status = "";

        // Only check completed attempts
        for (let i = 0; i < currentAttempt; i++) {
            const attempt = attempts[i];
            if (!attempt) continue;

            const statuses = getGuessStatuses(attempt, targetWord);

            for (let j = 0; j < attempt.length; j++) {
                if (attempt[j] === key) {
                    const newStatus = statuses[j];
                    // Prefer 'correct' over 'present' over 'absent'
                    if (newStatus === "correct") return "correct";
                    if (newStatus === "present" && status !== "correct")
                        status = "present";
                    if (newStatus === "absent" && !status)
                        status = "absent";
                }
            }
        }
        return status;
    };

    return (
        <div className="keyboard">
            {KEYBOARD_KEYS.map((row, rowIndex) => (
                <div key={rowIndex} className="keyboard-row">
                    {row.map((key) => (
                        <button
                            key={key}
                            data-key={key}
                            className={`keyboard-key ${getKeyStatus(key)}`}
                            onClick={() => onKeyPress(key)}
                        >
                            {key === "BACKSPACE" ? "←" : key}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
}
Keyboard.propTypes = {
    gameData: PropTypes.any,
    onKeyPress: PropTypes.func.isRequired,
};

export default Keyboard;
