import React, { useState } from 'react';
import Modal from './Modal';

interface CreateGoalModalProps {
  visible: boolean;
  habitName: string;
  onClose: () => void;
  onSubmit: (target: number, duration: number) => void;
}

const CreateGoalModal: React.FC<CreateGoalModalProps> = ({ visible, habitName, onClose, onSubmit }) => {
  const [target, setTarget] = useState('3000');
  const [duration, setDuration] = useState('30');
  const handleSubmit = () => {
    const t = parseFloat(target);
    const d = parseInt(duration, 10);
    if (isNaN(t) || t <= 0 || isNaN(d) || d <= 0) return;
    onSubmit(t, d);
    setTarget('3000');
    setDuration('30');
    onClose();
  };
  return (
    <Modal visible={visible} onClose={onClose}>
      <h2 className="mb-4 text-lg font-semibold text-white">Nova Meta — {habitName}</h2>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Quantidade Alvo</label>
          <input
            type="number"
            className="w-full rounded-md bg-surface p-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="3000"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Duração em dias</label>
          <input
            type="number"
            className="w-full rounded-md bg-surface p-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="30"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        <button
          className="mt-2 w-full rounded-md bg-primary py-2 font-semibold text-black transition hover:opacity-90"
          onClick={handleSubmit}
        >
          Criar Meta
        </button>
      </div>
    </Modal>
  );
};

export default CreateGoalModal;