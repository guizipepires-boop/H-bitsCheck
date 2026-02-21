import React, { useState } from 'react';
import Modal from './Modal';

interface AddEntryModalProps {
  visible: boolean;
  habitName: string;
  onClose: () => void;
  onSubmit: (value: number) => void;
}

const AddEntryModal: React.FC<AddEntryModalProps> = ({ visible, habitName, onClose, onSubmit }) => {
  const [value, setValue] = useState('');
  const handleSubmit = () => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return;
    onSubmit(num);
    setValue('');
    onClose();
  };
  return (
    <Modal visible={visible} onClose={onClose}>
      <h2 className="mb-4 text-lg font-semibold text-white">{habitName}</h2>
      <div className="space-y-4">
        <input
          type="number"
          className="w-full rounded-md bg-surface p-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Digite a quantidade..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          className="w-full rounded-md bg-primary py-2 font-semibold text-black transition hover:opacity-90"
          onClick={handleSubmit}
        >
          Adicionar
        </button>
      </div>
    </Modal>
  );
};

export default AddEntryModal;