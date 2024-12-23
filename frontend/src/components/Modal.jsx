import { useCallback } from "react";
import { useModalKeyboard } from "../hooks/useModalKeyboard";

import PropTypes from "prop-types";

function Modal({ children, onClose }) {
    const handleClickOutside = useCallback(
        (e) => {
            if (e.target.classList.contains("modal")) {
                onClose();
            }
        },
        [onClose]
    );

    // Use the modal keyboard hook
    useModalKeyboard(onClose);

    return (
        <div className="modal" onClick={handleClickOutside}>
            <div className="modal-content">{children}</div>
        </div>
    );
}

Modal.propTypes = {
    children: PropTypes.node.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default Modal;
