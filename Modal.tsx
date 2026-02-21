import React, { useState } from 'react';
import Modal from './Modal';

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, unit: string, quickAdd: number[]) => void;
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({ visible, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [quick, setQuick] = useState('5,10,20');

  const handleSubmit = () => {
    const values = quick
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v)
      .map((v) => parseInt(v, 10))
      .filter((n) => !isNaN(n) && n > 0);
    if (!name.trim() || !unit.trim() || values.length === 0) return;
    onSubmit(name.trim(), unit.trim(), values);
    // reset fields
    setName('');
    setUnit('');
    setQuick('5,10,20');
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <h2 className="mb-4 text-xl font-semibold text-white">Novo Hábito</h2>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Nome</label>
          <input
            type="text"
            className="w-full rounded-md bg-surface p-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ex: Flexões"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Unidade</label>
          <input
            type="text"
            className="w-full rounded-md bg-surface p-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="ex: reps, min, ml, km"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Botões rápidos</label>
          <input
            type="text"
            className="w-full rounded-md bg-surface p-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="5,10,20"
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-400">Separe os valores por vírgula</p>
        </div>
        <button
          className="mt-2 w-full rounded-md bg-primary py-2 text-center font-semibold text-black transition hover:opacity-90"
          onClick={handleSubmit}
          disabled={!name.trim() || !unit.trim()}
        >
          Criar Hábito
        </button>
      </div>
    </Modal>
  );
};

export default AddHabitModal;