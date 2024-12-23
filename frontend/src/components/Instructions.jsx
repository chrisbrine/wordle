import Modal from "./Modal";
import ExampleRow from "./ExampleRow";
import PropTypes from "prop-types";

function Instructions({ onClose }) {
    return (
        <Modal onClose={onClose}>
            <div className="instructions-content">
                <h2>How To Play</h2>
                <p>Guess the hidden word in five attempts.</p>
                <p>Each attempt must be a valid 5-letter word.</p>
                <p>
                    After each attempt, the color of the letters changes to
                    show how close you are to guessing the word.
                </p>

                <div className="examples">
                    <h3>Examples</h3>
                    <ExampleRow word="GRAPE" position={0} letter="G">
                        The letter <strong>G</strong> is in the word and in
                        the correct position.
                    </ExampleRow>
                    <ExampleRow word="FOCUS" position={2} letter="C">
                        The letter <strong>C</strong> is in the word but in
                        the correct position.
                    </ExampleRow>
                    <ExampleRow word="MANGO" position={4} letter="O">
                        The letter <strong>O</strong> is not in the word.
                    </ExampleRow>
                </div>

                <p>
                    There may be repeated letters. The hints are
                    independent for each letter.
                </p>

                <button className="modal-button" onClick={onClose}>
                    Play
                </button>
            </div>
        </Modal>
    );
}
Instructions.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default Instructions;
