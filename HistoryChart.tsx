import React from 'react';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ visible, onClose, children }) => {
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-xl bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-200"
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;