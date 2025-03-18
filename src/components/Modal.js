import React from "react";

const Modal = ({ show, onClose, title, children, btnText }) => {
  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{title}</h2>
        <div className="modal-body">{children}</div>
        <button className="boton-modal" onClick={onClose}>
          {btnText}
        </button>
      </div>
    </div>
  );
};

export default Modal;
