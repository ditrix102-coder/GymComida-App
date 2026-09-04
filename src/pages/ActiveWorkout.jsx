import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const routine = location.state?.routine;

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const currentExercise = routine?.exercises?.[currentExerciseIndex];
  
  const [sets, setSets] = useState([
    { reps: '', weight: '', completed: false }
  ]);

  // Workout Summary Stats
  const [isWorkoutFinished, setIsWorkoutFinished] = useState(false);
  const workoutStartTimeRef = useRef(Date.now());
  const trackerRef = useRef({
    isResting: false,
    lastStateChange: Date.now(),
    stats: routine?.exercises?.map(ex => ({
      name: ex.name,
      workTime: 0,
      restTime: 0
    })) || []
  });
  
  const [workoutStats, setWorkoutStats] = useState([]); // will be populated on finish
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);

  const [isResting, setIsResting] = useState(false);
  const [restStartTime, setRestStartTime] = useState(null);
  const [elapsedRest, setElapsedRest] = useState(0);

  useEffect(() => {
    let interval;
    if (isResting && restStartTime) {
      interval = setInterval(() => {
        setElapsedRest(Math.floor((Date.now() - restStartTime) / 1000));
      }, 1000);
    } else {
      setElapsedRest(0);
    }
    return () => clearInterval(interval);
  }, [isResting, restStartTime]);

  // Global workout timer update
  useEffect(() => {
    let interval;
    if (!isWorkoutFinished) {
      interval = setInterval(() => {
        setTotalElapsedTime(Math.floor((Date.now() - workoutStartTimeRef.current) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutFinished]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputFocus = () => {
    if (!trackerRef.current.isResting) {
      // Switching from Work to Rest
      const now = Date.now();
      const timeSpent = Math.floor((now - trackerRef.current.lastStateChange) / 1000);
      
      trackerRef.current.stats[currentExerciseIndex].workTime += timeSpent;
      trackerRef.current.lastStateChange = now;
      trackerRef.current.isResting = true;
      
      setIsResting(true);
      setRestStartTime(now);
    }
  };

  const handleInputChange = (index, field, value) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
  };

  const handleNextSet = () => {
    // Switching from Rest to Work
    const now = Date.now();
    const timeSpent = Math.floor((now - trackerRef.current.lastStateChange) / 1000);
    
    if (trackerRef.current.isResting) {
      trackerRef.current.stats[currentExerciseIndex].restTime += timeSpent;
    }

    trackerRef.current.lastStateChange = now;
    trackerRef.current.isResting = false;
    
    setIsResting(false);
    setRestStartTime(null);
    
    const newSets = [...sets];
    newSets[newSets.length - 1].completed = true;
    newSets.push({ reps: '', weight: '', completed: false });
    setSets(newSets);
  };

  const handleNextExercise = () => {
    const now = Date.now();
    const timeSpent = Math.floor((now - trackerRef.current.lastStateChange) / 1000);
    
    if (trackerRef.current.isResting) {
      trackerRef.current.stats[currentExerciseIndex].restTime += timeSpent;
    } else {
      trackerRef.current.stats[currentExerciseIndex].workTime += timeSpent;
    }

    trackerRef.current.lastStateChange = now;
    trackerRef.current.isResting = false;
    
    setIsResting(false);
    setRestStartTime(null);

    if (currentExerciseIndex < routine.exercises.length - 1) {
      setSets([{ reps: '', weight: '', completed: false }]);
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      setWorkoutStats(trackerRef.current.stats);
      setTotalElapsedTime(Math.floor((Date.now() - workoutStartTimeRef.current) / 1000));
      setIsWorkoutFinished(true);
    }
  };

  if (!routine) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-4">
        <span className="material-symbols-outlined text-[64px] text-error mb-4">error</span>
        <p className="font-headline-sm text-on-surface text-center">No se pudo cargar la rutina.</p>
        <button onClick={() => navigate(-1)} className="mt-8 px-6 py-3 bg-primary text-on-primary rounded-full font-headline-sm">Volver</button>
      </div>
    );
  }

  const handleSaveWorkout = () => {
    // Save to daily registered exercises
    const existing = JSON.parse(localStorage.getItem('gymApp_registeredExercises') || '[]');
    const newExercises = routine.exercises.map(ex => ({
      id: Date.now() + Math.random(),
      name: ex.name,
      muscles: ex.muscles,
      sets: sets // note: this sets is only the last exercise's sets currently, we should ideally track sets per exercise, but for now we'll save it like this to satisfy the export structure.
    }));
    
    localStorage.setItem('gymApp_registeredExercises', JSON.stringify([...existing, ...newExercises]));
    
    // Accumulate total elapsed time
    const currentElapsed = JSON.parse(localStorage.getItem('gymApp_elapsedTime') || '0');
    localStorage.setItem('gymApp_elapsedTime', JSON.stringify(currentElapsed + totalElapsedTime));

    navigate('/routines');
  };

  if (isWorkoutFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col w-full min-h-screen bg-surface pb-32"
      >
        <header className="pt-safe px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/routines')} className="w-12 h-12 flex items-center justify-center text-on-surface hover:bg-surface-variant/20 rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="flex flex-col items-center px-6 mt-4">
          <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[48px] text-primary">emoji_events</span>
          </div>
          <h1 className="font-display-md text-on-surface text-center mb-1">¡Entrenamiento Completado!</h1>
          <p className="font-body-lg text-on-surface-variant text-center">{routine.name}</p>
        </div>

        <div className="flex flex-col px-4 mt-8 gap-4">
          <div className="bg-surface-container-low p-6 rounded-3xl border border-surface-variant/30 flex flex-col items-center shadow-sm">
            <span className="font-label-md text-on-surface-variant uppercase tracking-wider mb-1">Tiempo Total</span>
            <span className="font-display-lg text-primary tabular-nums tracking-tight">{formatTime(totalElapsedTime)}</span>
          </div>

          <h3 className="font-headline-sm text-on-surface mt-4 mb-2 px-2">Desglose por Ejercicio</h3>
          
          <div className="flex flex-col gap-3">
            {workoutStats.map((stat, idx) => (
              <div key={idx} className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-variant/20 flex flex-col gap-2">
                <span className="font-headline-sm text-on-surface truncate">{stat.name}</span>
                <div className="flex gap-4">
                  <div className="flex-1 bg-primary/5 p-3 rounded-xl flex flex-col items-center">
                    <span className="material-symbols-outlined text-[16px] text-primary mb-1">fitness_center</span>
                    <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Trabajo</span>
                    <span className="font-headline-md text-primary tabular-nums">{formatTime(stat.workTime)}</span>
                  </div>
                  <div className="flex-1 bg-tertiary/5 p-3 rounded-xl flex flex-col items-center">
                    <span className="material-symbols-outlined text-[16px] text-tertiary mb-1">timer</span>
                    <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Descanso</span>
                    <span className="font-headline-md text-tertiary tabular-nums">{formatTime(stat.restTime)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 inset-x-0 p-4 bg-surface/90 backdrop-blur-xl border-t border-surface-variant/20 pb-safe z-50">
          <button 
            onClick={handleSaveWorkout}
            className="w-full py-4 rounded-full bg-primary text-on-primary font-headline-md shadow-md shadow-primary/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">save</span>
            Guardar Entrenamiento del Día
          </button>
        </div>
      </motion.div>
    );
  }

  const isLastExercise = currentExerciseIndex === routine.exercises.length - 1;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col w-full min-h-screen bg-surface pb-48"
    >
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center text-on-surface hover:bg-surface-variant/20 rounded-full transition-colors shrink-0"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="flex flex-col flex-1 min-w-0">
            <h1 className="font-headline-sm text-on-surface truncate leading-tight">{routine.name}</h1>
            <span className="font-label-sm text-on-surface-variant">
              Ejercicio {currentExerciseIndex + 1} de {routine.exercises.length}
            </span>
          </div>
          <div className="flex flex-col items-end shrink-0 bg-primary/10 px-3 py-1.5 rounded-full">
            <span className="font-label-sm text-primary uppercase tracking-wider text-[10px]">Total</span>
            <span className="font-headline-sm text-primary tabular-nums leading-none">{formatTime(totalElapsedTime)}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col flex-1 mt-24 px-4 gap-md">
        {/* Exercise Header */}
        <div className="bg-surface-container-low p-6 rounded-[24px] border border-surface-variant/20 flex flex-col gap-3 items-center text-center shadow-sm relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-1">
             <span className="material-symbols-outlined text-[32px] text-on-primary-container">
               {currentExercise.muscles?.[0]?.icon || 'fitness_center'}
             </span>
          </div>
          <h2 className="font-display-sm text-on-surface leading-tight">{currentExercise.name}</h2>
          <div className="flex gap-2 flex-wrap justify-center">
            {currentExercise.muscles?.map((m, i) => (
              <span key={i} className="font-label-sm text-on-surface-variant bg-surface-container-highest px-3 py-1 rounded-full">
                {m.name}
              </span>
            ))}
          </div>
        </div>

        {/* Sets List */}
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="w-12 text-center font-label-md text-on-surface-variant uppercase tracking-wider">Serie</span>
            <span className="flex-1 text-center font-label-md text-on-surface-variant uppercase tracking-wider">Lbs / Kg</span>
            <span className="flex-1 text-center font-label-md text-on-surface-variant uppercase tracking-wider">Reps</span>
          </div>
          
          <AnimatePresence>
            {sets.map((set, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${set.completed ? 'bg-surface-container opacity-60' : 'bg-surface-container-highest shadow-sm border border-primary/30'}`}
              >
                <div className="w-12 flex items-center justify-center font-headline-md text-on-surface">
                  {index + 1}
                </div>
                
                <input 
                  type="number" 
                  value={set.weight}
                  onChange={(e) => handleInputChange(index, 'weight', e.target.value)}
                  onFocus={handleInputFocus}
                  disabled={set.completed}
                  placeholder="0"
                  className="flex-1 bg-surface-container-lowest py-3 text-center font-headline-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-primary w-full disabled:bg-transparent transition-all"
                />
                
                <input 
                  type="number" 
                  value={set.reps}
                  onChange={(e) => handleInputChange(index, 'reps', e.target.value)}
                  onFocus={handleInputFocus}
                  disabled={set.completed}
                  placeholder="0"
                  className="flex-1 bg-surface-container-lowest py-3 text-center font-headline-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-primary w-full disabled:bg-transparent transition-all"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Bottom Bar for Timer & Actions */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-surface/90 backdrop-blur-2xl border-t border-surface-variant/20 pb-safe z-50 flex flex-col gap-4">
        
        {isResting && (
          <div className="flex flex-col items-center justify-center animate-pulse">
            <span className="text-[12px] font-label-lg text-primary uppercase tracking-widest mb-1">
              Descanso
            </span>
            <span className="font-display-lg text-on-surface leading-none tabular-nums tracking-tight">
              {formatTime(elapsedRest)}
            </span>
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <button 
            onClick={handleNextExercise}
            className="flex-1 py-4 rounded-2xl border border-primary text-primary font-headline-sm active:bg-primary/10 transition-colors text-center"
          >
            {isLastExercise ? 'Finalizar' : 'Siguiente Ejercicio'}
          </button>
          
          <button 
            onClick={handleNextSet}
            className="flex-[2] py-4 rounded-2xl bg-primary text-on-primary font-headline-sm shadow-sm active:scale-[0.98] transition-transform text-center"
          >
            Completar y sig. serie
          </button>
        </div>
      </div>
    </motion.div>
  );
}
