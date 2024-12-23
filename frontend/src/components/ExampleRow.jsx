import "./ExampleRow.css";
import PropTypes from "prop-types";

const getExampleStatus = (char, index, word, position) => {
    // Only show status for the position we're demonstrating
    if (index !== position) return "";

    // For the "G" in "GRAPE" example - correct position
    if (char === "G" && word === "GRAPE") return "correct";

    // For the "C" in "FOCUS" example - wrong position
    if (char === "C" && word === "FOCUS") return "present";

    // For the "O" in "MANGO" example - not in word
    if (char === "O" && word === "MANGO") return "absent";

    return "";
};

function ExampleRow({ word, position, children }) {
    return (
        <div className="example">
            <div className="example-tiles">
                {word.split("").map((char, index) => (
                    <div
                        key={index}
                        className={`example-tile ${getExampleStatus(
                            char,
                            index,
                            word,
                            position
                        )}`}
                    >
                        {char}
                    </div>
                ))}
            </div>
            <p className="example-text">{children}</p>
        </div>
    );
}

ExampleRow.propTypes = {
    word: PropTypes.string.isRequired,
    position: PropTypes.number.isRequired,
    children: PropTypes.node.isRequired,
};

export default ExampleRow;
