import { useState, useEffect } from 'react';
import useStickyState from '../hooks/useStickyState';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ExerciseSearchModal from '../components/ExerciseSearchModal';

export default function GymSession() {
  const navigate = useNavigate();

  const [elapsedTime, setElapsedTime] = useStickyState(0, 'gymApp_elapsedTime');
  const [isRunning, setIsRunning] = useStickyState(false, 'gymApp_isRunning');
  
  // Array of { id, name, muscles, sets: [{ id, weight, reps, rest }] }
  const [exercises, setExercises] = useStickyState([], 'gymApp_freeWorkoutExercises');
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [hasExistingWorkout, setHasExistingWorkout] = useState(false);

  const [isSaveRoutineModalOpen, setIsSaveRoutineModalOpen] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [routineDay, setRoutineDay] = useState('Lunes');

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (time) => {
    let diffInHrs = time / 3600;
    let hh = Math.floor(diffInHrs);
    let diffInMin = (diffInHrs - hh) * 60;
    let mm = Math.floor(diffInMin);
    let diffInSec = (diffInMin - mm) * 60;
    let ss = Math.floor(diffInSec);

    return hh > 0 
      ? `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`
      : `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
  };

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleExerciseSelected = (exerciseData) => {
    const newExercise = {
      id: Date.now() + Math.random(),
      name: exerciseData.name,
      muscles: exerciseData.muscles,
      sets: [
        { id: Date.now(), weight: '', reps: '', rest: 90 }
      ]
    };
    setExercises([...exercises, newExercise]);
    setIsSearchOpen(false);
  };

  const handleAddSet = (exerciseId) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        // Find last set to copy its weight and rest as default
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, { 
            id: Date.now() + Math.random(), 
            weight: lastSet ? lastSet.weight : '', 
            reps: '', 
            rest: lastSet ? lastSet.rest : 90 
          }]
        };
      }
      return ex;
    }));
  };

  const handleRemoveSet = (exerciseId, setId) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.filter(s => s.id !== setId)
        };
      }
      return ex;
    }));
  };

  const handleRemoveExercise = (exerciseId) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const handleSetChange = (exerciseId, setId, field, value) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.id === setId) {
              return { ...s, [field]: value };
            }
            return s;
          })
        };
      }
      return ex;
    }));
  };

  const handleFinishWorkoutClick = () => {
    if (exercises.length === 0) {
       alert('No has agregado ningún ejercicio a tu sesión.');
       return;
    }
    const existing = JSON.parse(localStorage.getItem('gymApp_registeredExercises') || '[]');
    setHasExistingWorkout(existing.length > 0);
    setIsFinishModalOpen(true);
  };

  const confirmSaveWorkout = (shouldSave) => {
    if (shouldSave) {
      // Overwrite the existing workout of the day with the current one
      localStorage.setItem('gymApp_registeredExercises', JSON.stringify([...exercises]));
      
      const currentElapsed = JSON.parse(localStorage.getItem('gymApp_elapsedTime') || '0');
      localStorage.setItem('gymApp_elapsedTime', JSON.stringify(currentElapsed + elapsedTime));
    }
    
    setIsRunning(false);
    setExercises([]);
    setElapsedTime(0);
    setIsFinishModalOpen(false);
    navigate('/routines');
  };

  const handleSaveAsRoutine = () => {
    if (!routineName.trim() || exercises.length === 0) return;
    const routines = JSON.parse(localStorage.getItem('gymApp_routines') || '[]');
    const newRoutine = {
      id: Date.now().toString(),
      name: routineName,
      day: routineDay,
      exercises: exercises
    };
    localStorage.setItem('gymApp_routines', JSON.stringify([...routines, newRoutine]));
    setIsSaveRoutineModalOpen(false);
    setRoutineName('');
    alert('Rutina guardada exitosamente.');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col w-full min-h-screen bg-surface pb-32"
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
            <h1 className="font-headline-md text-headline-md text-on-surface truncate">Entrenamiento Libre</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if(exercises.length === 0) {
                  alert('Agrega al menos un ejercicio antes de guardar como rutina.');
                } else {
                  setIsSaveRoutineModalOpen(true);
                }
              }}
              className="w-10 h-10 flex items-center justify-center text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-colors active:scale-95"
              title="Guardar como Rutina"
            >
              <span className="material-symbols-outlined text-[20px]">save</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4 pt-24 px-4 pb-12">
        
        {/* Global Timer Card */}
        <div className="bg-surface-container-low p-6 rounded-[24px] shadow-sm flex flex-col items-center gap-4">
          <div className="text-center font-display-lg text-primary tabular-nums tracking-tight leading-none">
            {formatTime(elapsedTime)}
          </div>
          <button 
            onClick={handleToggleTimer}
            className={`w-full max-w-[200px] flex items-center justify-center gap-2 py-3 rounded-full font-headline-sm transition-colors shadow-sm ${isRunning ? 'bg-error/10 text-error' : 'bg-primary text-on-primary'}`}
          >
            <span className="material-symbols-outlined text-[20px]">{isRunning ? 'pause' : 'play_arrow'}</span>
            <span>{isRunning ? 'Pausar' : 'Iniciar'}</span>
          </button>
        </div>

        {/* Exercises List */}
        <div className="flex flex-col gap-6 mt-4">
          <AnimatePresence>
            {exercises.map((ex, exIdx) => (
              <motion.div 
                key={ex.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl shadow-sm flex flex-col overflow-hidden"
              >
                {/* Exercise Header */}
                <div className="p-4 bg-surface-container-lowest flex items-center justify-between border-b border-surface-variant/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px] text-on-primary-container">
                        {ex.muscles?.[0]?.icon || 'fitness_center'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-primary uppercase tracking-wider">Ejercicio {exIdx + 1}</span>
                      <h2 className="font-headline-sm text-on-surface leading-tight">{ex.name}</h2>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveExercise(ex.id)}
                    className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>

                {/* Sets */}
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between px-2 mb-1">
                    <span className="w-8 text-center font-label-md text-on-surface-variant uppercase tracking-wider">Set</span>
                    <span className="flex-1 text-center font-label-md text-on-surface-variant uppercase tracking-wider">kg</span>
                    <span className="flex-1 text-center font-label-md text-on-surface-variant uppercase tracking-wider">reps</span>
                    <span className="flex-1 text-center font-label-md text-on-surface-variant uppercase tracking-wider">desc</span>
                    <div className="w-8"></div>
                  </div>

                  <AnimatePresence>
                    {ex.sets.map((set, setIdx) => (
                      <motion.div 
                        key={set.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2"
                      >
                        <div className="w-8 flex items-center justify-center font-headline-sm text-on-surface-variant">
                          {setIdx + 1}
                        </div>
                        
                        <input 
                          type="number" 
                          value={set.weight}
                          onChange={(e) => handleSetChange(ex.id, set.id, 'weight', e.target.value)}
                          placeholder="0"
                          className="flex-1 bg-surface-container py-2 text-center font-headline-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary w-full"
                        />
                        
                        <input 
                          type="number" 
                          value={set.reps}
                          onChange={(e) => handleSetChange(ex.id, set.id, 'reps', e.target.value)}
                          placeholder="0"
                          className="flex-1 bg-surface-container py-2 text-center font-headline-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary w-full"
                        />

                        <input 
                          type="number" 
                          value={set.rest}
                          onChange={(e) => handleSetChange(ex.id, set.id, 'rest', e.target.value)}
                          placeholder="90"
                          className="flex-1 bg-surface-container py-2 text-center font-headline-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary w-full"
                        />
                        
                        <button 
                          onClick={() => handleRemoveSet(ex.id, set.id)}
                          className="w-8 h-8 flex items-center justify-center text-on-surface-variant active:text-error rounded-full shrink-0 opacity-50 active:opacity-100"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <button 
                    onClick={() => handleAddSet(ex.id)}
                    className="mt-2 py-3 border-2 border-dashed border-primary/30 text-primary font-label-lg uppercase tracking-wider rounded-xl active:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Añadir Serie
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <button 
          onClick={() => setIsSearchOpen(true)}
          className="mt-4 w-full py-4 rounded-2xl bg-primary-container text-on-primary-container font-headline-sm shadow-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Agregar Ejercicio
        </button>
      </div>

      <div className="fixed bottom-0 inset-x-0 p-4 bg-surface/90 backdrop-blur-2xl border-t border-surface-variant/20 pb-safe z-50">
        <button 
          onClick={handleFinishWorkoutClick}
          disabled={exercises.length === 0}
          className="w-full py-4 rounded-full bg-primary text-on-primary font-headline-md shadow-md shadow-primary/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
        >
          <span className="material-symbols-outlined">done_all</span>
          Finalizar Entrenamiento
        </button>
      </div>

      {isSearchOpen && (
        <ExerciseSearchModal 
          onClose={() => setIsSearchOpen(false)}
          onSelect={handleExerciseSelected}
        />
      )}

      {/* Finish Confirmation Modal */}
      {isFinishModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-3xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-primary text-[24px]">task_alt</span>
            </div>
            
            <h3 className="font-headline-md text-center text-on-surface">Finalizar Entrenamiento</h3>
            
            <p className="font-body-md text-center text-on-surface-variant">
              {hasExistingWorkout 
                ? 'Ya hay un entrenamiento guardado hoy. ¿Quieres eliminarlo y reemplazarlo por este?' 
                : '¿Quieres guardar este entrenamiento como el entrenamiento del día de hoy?'}
            </p>
            
            <div className="flex flex-col gap-2 mt-4">
              <button 
                onClick={() => confirmSaveWorkout(true)}
                className="w-full py-3 rounded-full font-headline-sm text-on-primary bg-primary active:bg-primary/90 shadow-sm transition-colors"
              >
                Sí, guardar
              </button>
              <button 
                onClick={() => confirmSaveWorkout(false)}
                className="w-full py-3 rounded-full font-headline-sm text-on-surface bg-surface-container-high active:bg-surface-container-highest transition-colors"
              >
                No, solo descartar
              </button>
              <button 
                onClick={() => setIsFinishModalOpen(false)}
                className="w-full py-3 mt-2 rounded-full font-label-lg text-on-surface-variant active:bg-surface-variant/20 transition-colors"
              >
                Cancelar (Seguir entrenando)
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Save Routine Modal */}
      {isSaveRoutineModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-[28px] p-6 flex flex-col gap-4 shadow-xl">
            <h3 className="font-headline-md text-on-surface">Guardar como Rutina</h3>
            <p className="font-body-sm text-on-surface-variant">
              Guarda los {exercises.length} ejercicios actuales como una rutina reutilizable.
            </p>
            <input 
              type="text" 
              placeholder="Nombre de la Rutina (ej. Pecho y Bíceps)" 
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="w-full bg-surface-container py-3 px-4 rounded-xl font-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select 
              value={routineDay}
              onChange={(e) => setRoutineDay(e.target.value)}
              className="w-full bg-surface-container py-3 px-4 rounded-xl font-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            >
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
              <option value="Sábado">Sábado</option>
              <option value="Domingo">Domingo</option>
            </select>
            
            <div className="flex justify-end gap-2 mt-4">
              <button 
                onClick={() => setIsSaveRoutineModalOpen(false)}
                className="px-6 py-2 rounded-full text-on-surface-variant font-label-lg active:bg-surface-variant/20"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveAsRoutine}
                className="px-6 py-2 rounded-full bg-primary text-on-primary font-label-lg active:scale-95 transition-transform shadow-sm"
              >
                Guardar Rutina
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
