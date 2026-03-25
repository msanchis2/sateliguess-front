import React from "react";

export interface IModalProps {
  onClose: () => void;
  title: string;
  btnText: string;
  children: React.ReactNode;
}

const Modal: React.FC<IModalProps> = ({ onClose, title, children, btnText }) => {
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
