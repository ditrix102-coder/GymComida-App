import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Gym() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col w-full h-[80vh] justify-center items-center gap-md"
    >
      <div className="flex flex-col items-center mb-xl">
        <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-[48px] text-on-primary-container">fitness_center</span>
        </div>
        <h1 className="font-display-sm text-display-sm text-on-surface text-center leading-tight">Entrenamiento</h1>
        <p className="font-body-md text-body-md text-on-surface-variant text-center mt-2 max-w-[250px]">Elige cómo quieres entrenar hoy</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm px-4">
        <Link 
          to="/routines"
          className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl shadow-md border border-surface-variant/30 active:scale-95 transition-all"
        >
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-on-primary text-[28px]">add</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface">+ Rutina</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Arma o selecciona una rutina</span>
          </div>
        </Link>

        <Link 
          to="/gym/improvisar"
          className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl shadow-md border border-surface-variant/30 active:scale-95 transition-all"
        >
          <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-on-secondary-container text-[28px]">timer</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface">Improvisar</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Entrena libremente con cronómetro</span>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
