import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const unitOptions = {
  calories: ['kcal', 'cal'],
  protein: ['g', 'kg'],
  carbs: ['g', 'kg'],
  water: ['ml', 'L', 'vasos'],
  gym: ['horas', 'min'],
  steps: ['pasos', 'km', 'cuadras']
};

const goalLabels = {
  calories: 'Energía',
  protein: 'Proteína',
  carbs: 'Carbohidratos',
  water: 'Agua',
  gym: 'Gimnasio',
  steps: 'Pasos'
};

const goalIcons = {
  calories: 'bolt',
  protein: 'fitness_center',
  carbs: 'grain',
  water: 'water_drop',
  gym: 'exercise',
  steps: 'directions_walk'
};

const CustomSelect = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-28">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-surface-container py-3 px-2 rounded-xl font-body-md text-body-md text-on-surface flex items-center justify-center gap-1 cursor-pointer select-none"
      >
        <span>{value}</span>
        <span className="material-symbols-outlined text-[16px]">expand_more</span>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-1 right-0 w-32 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container z-50 overflow-hidden"
            >
              {options.map(opt => (
                <div 
                  key={opt}
                  onClick={() => { onChange(opt); setIsOpen(false); }}
                  className={`py-2 px-3 text-center font-body-md text-body-md cursor-pointer hover:bg-surface-container-low transition-colors select-none ${value === opt ? 'text-primary bg-primary/5' : 'text-on-surface'}`}
                >
                  {opt}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function GoalSettingsModal({ isOpen, onClose, currentGoals, onSave }) {
  const [localGoals, setLocalGoals] = useState(currentGoals);

  if (!isOpen) return null;

  const handleChange = (key, field, value) => {
    setLocalGoals(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: field === 'value' ? Number(value) : value
      }
    }));
  };

  const handleSave = () => {
    onSave(localGoals);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface-container-lowest w-full max-w-md rounded-[24px] shadow-2xl flex flex-col max-h-[90vh] relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-md border-b border-surface-container rounded-t-[24px]">
            <h2 className="font-headline-md text-headline-md text-on-surface">Ajustar Metas</h2>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-surface-variant transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-md overflow-visible flex flex-col gap-md">
            {Object.keys(localGoals).map((key) => (
              <div key={key} className="flex flex-col gap-xs">
                <div className="flex items-center gap-2 text-on-surface-variant mb-1">
                  <span className="material-symbols-outlined text-[18px]">{goalIcons[key]}</span>
                  <label className="font-label-sm text-label-sm uppercase tracking-wider">{goalLabels[key]}</label>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={localGoals[key]?.value || ''}
                    onChange={(e) => handleChange(key, 'value', e.target.value)}
                    className="flex-1 bg-surface-container py-3 px-4 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <CustomSelect 
                    value={localGoals[key]?.unit || ''}
                    options={unitOptions[key]}
                    onChange={(newUnit) => handleChange(key, 'unit', newUnit)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-md border-t border-surface-container bg-surface-container-lowest rounded-b-[24px] mt-auto">
            <button onClick={handleSave} className="w-full py-3 rounded-full bg-primary text-on-primary font-headline-md text-[18px] shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform">
              Guardar Metas
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
