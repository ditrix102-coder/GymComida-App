import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStickyState from '../hooks/useStickyState';

export default function Routines() {
  const navigate = useNavigate();
  const [routines, setRoutines] = useStickyState([], 'gymApp_routines');
  const [registeredExercises, setRegisteredExercises] = useStickyState([], 'gymApp_registeredExercises');
  const [elapsedTime, setElapsedTime] = useStickyState(0, 'gymApp_elapsedTime');
  const [routineToDelete, setRoutineToDelete] = useState(null);
  const [selectedRoutineToStart, setSelectedRoutineToStart] = useState(null);

  const handleDeleteRoutine = (id) => {
    setRoutineToDelete(id);
  };

  const confirmDelete = () => {
    setRoutines(routines.filter(r => r.id !== routineToDelete));
    setRoutineToDelete(null);
  };

  const handleOpenRoutineDetails = (routine) => {
    setSelectedRoutineToStart(routine);
  };

  const confirmStartRoutine = () => {
    navigate('/active-routine', { state: { routine: selectedRoutineToStart } });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col w-full min-h-screen pb-md bg-surface"
    >
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <button 
              onClick={() => navigate(-1)}
              className="w-12 h-12 flex items-center justify-center text-on-surface hover:bg-surface-variant/20 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back_ios_new</span>
            </button>
            <h1 className="font-headline-md text-headline-md text-on-surface truncate">Rutinas</h1>
          </div>
          
          <button 
            onClick={() => navigate('/routines/new')}
            className="w-12 h-12 flex items-center justify-center text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col flex-1 mt-24 px-4 gap-md">
        {routines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50 mt-xl">
            <span className="material-symbols-outlined text-[64px] mb-4">list_alt</span>
            <p className="font-body-lg text-body-lg text-center">Aún no tienes rutinas guardadas.</p>
            <p className="font-body-sm text-body-sm text-center mt-2">Toca el botón + para armar tu primera rutina.</p>
          </div>
        ) : (
          routines.map((routine) => (
            <div key={routine.id} className="bg-surface-container-low rounded-[24px] p-5 shadow-sm border border-surface-variant/20 flex flex-col gap-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={() => handleDeleteRoutine(routine.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-error opacity-60 hover:opacity-100 hover:bg-error/10 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>

              <div className="flex flex-col gap-1 pr-10">
                <h2 className="font-headline-md text-headline-md text-on-surface leading-tight">{routine.name}</h2>
                <span className="font-label-sm text-on-surface-variant bg-surface-container-high self-start px-2 py-1 rounded-md text-[11px] uppercase tracking-wider">
                  Día: {routine.day}
                </span>
              </div>
              
              <div className="flex flex-col gap-1 mt-1">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {routine.exercises.length} {routine.exercises.length === 1 ? 'ejercicio' : 'ejercicios'} guardados
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {routine.exercises.slice(0, 3).map((ex, idx) => (
                    <span key={idx} className="text-[12px] text-on-surface bg-surface-container-highest px-2 py-1 rounded-full truncate max-w-[120px]">
                      {ex.name}
                    </span>
                  ))}
                  {routine.exercises.length > 3 && (
                    <span className="text-[12px] text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded-full">
                      +{routine.exercises.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <button 
                onClick={() => handleOpenRoutineDetails(routine)}
                className="mt-4 flex items-center justify-center gap-xs w-full py-3.5 rounded-full bg-primary text-on-primary font-headline-sm shadow-md shadow-primary/30 active:scale-[0.98] transition-transform"
              >
                <span className="material-symbols-outlined text-[20px]">info</span>
                Detalles de Rutina
              </button>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {routineToDelete && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-[24px] shadow-lg p-6 flex flex-col gap-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">¿Eliminar Rutina?</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">¿Estás seguro de que quieres eliminar esta rutina? Esta acción no se puede deshacer.</p>
            
            <div className="flex gap-sm mt-4">
              <button 
                onClick={() => setRoutineToDelete(null)}
                className="flex-1 py-3 rounded-full text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors font-label-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-full text-on-error bg-error hover:bg-error/90 transition-colors font-label-sm shadow-sm shadow-error/30"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Routine Details Preview Modal */}
      {selectedRoutineToStart && (
        <div className="fixed inset-0 z-[110] bg-surface flex flex-col">
          <header className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
            <div className="h-16 px-4 flex items-center justify-between">
              <button 
                onClick={() => setSelectedRoutineToStart(null)}
                className="w-12 h-12 flex items-center justify-center text-on-surface hover:bg-surface-variant/20 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <h1 className="font-headline-md text-headline-md text-on-surface truncate pr-12">Detalles</h1>
            </div>
          </header>

          <div className="flex flex-col flex-1 mt-24 px-4 gap-md overflow-y-auto pb-32">
            <div className="flex flex-col items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[48px] text-primary">fitness_center</span>
              <h2 className="font-display-sm text-center">{selectedRoutineToStart.name}</h2>
              <span className="font-label-lg text-on-surface-variant uppercase tracking-wider">{selectedRoutineToStart.day}</span>
            </div>

            <div className="bg-surface-container-lowest rounded-[24px] p-5 shadow-sm border border-surface-variant/20">
              <h3 className="font-headline-sm text-primary mb-3">Ejercicios</h3>
              <div className="flex flex-col gap-3">
                {selectedRoutineToStart.exercises.map((ex, idx) => (
                  <div key={idx} className="flex flex-col gap-1 border-b border-surface-variant/30 pb-3 last:border-0 last:pb-0">
                    <span className="font-body-lg font-bold">{idx + 1}. {ex.name}</span>
                    <div className="flex gap-2 mt-1">
                      {ex.muscles?.map((m, i) => (
                        <span key={i} className="text-[11px] bg-primary/10 text-primary px-2 py-1 rounded-full">{m.name}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 inset-x-0 p-4 bg-surface/90 backdrop-blur-xl border-t border-surface-variant/20 pb-safe z-50">
            <button 
              onClick={confirmStartRoutine}
              className="flex items-center justify-center gap-sm w-full py-4 rounded-full bg-primary text-on-primary font-headline-md shadow-md shadow-primary/30 active:scale-[0.98] transition-transform"
            >
              <span className="material-symbols-outlined">play_arrow</span>
              Iniciar Entrenamiento
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
