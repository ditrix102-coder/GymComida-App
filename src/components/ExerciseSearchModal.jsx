import { useState } from 'react';
import useStickyState from '../hooks/useStickyState';

export const muscleCategories = [
  {
    id: 'inferior',
    name: '🦵 Tren Inferior',
    muscles: [
      { id: 'cuadriceps', name: 'Cuádriceps', desc: 'Parte delantera', icon: 'directions_run' },
      { id: 'isquios', name: 'Isquiotibiales', desc: 'Parte trasera', icon: 'directions_run' },
      { id: 'gluteos', name: 'Glúteos', desc: 'Mayor y medio', icon: 'directions_run' },
      { id: 'gemelos', name: 'Gemelos / Pantorrillas', desc: '', icon: 'directions_run' },
      { id: 'aductores', name: 'Aductores / Abductores', desc: 'Cara interna y externa', icon: 'directions_run' },
    ]
  },
  {
    id: 'torso',
    name: '🧳 Torso',
    muscles: [
      { id: 'pecho', name: 'Pecho / Pectorales', desc: '', icon: 'fitness_center' },
      { id: 'espalda', name: 'Espalda Alta y Media', desc: 'Dorsal, trapecios, romboides', icon: 'accessibility_new' },
      { id: 'hombros', name: 'Hombros / Deltoides', desc: 'Anterior, Lateral, Posterior', icon: 'accessibility' },
      { id: 'lumbares', name: 'Lumbares / Erectores espinales', desc: 'Espalda baja', icon: 'accessibility_new' },
    ]
  },
  {
    id: 'brazos',
    name: '💪 Brazos',
    muscles: [
      { id: 'biceps', name: 'Bíceps', desc: 'Parte delantera', icon: 'front_hand' },
      { id: 'triceps', name: 'Tríceps', desc: 'Parte trasera', icon: 'front_hand' },
      { id: 'antebrazos', name: 'Antebrazos', desc: '', icon: 'front_hand' },
    ]
  },
  {
    id: 'core',
    name: '🎯 Core',
    muscles: [
      { id: 'abdominales', name: 'Abdominales', desc: 'Recto abdominal', icon: 'accessibility' },
      { id: 'oblicuos', name: 'Oblicuos', desc: 'Laterales', icon: 'accessibility' },
    ]
  }
];

const defaultExercises = [
  "Press banca plano", "Press banca inclinado", "Press banca declinado", "Press militar",
  "Sentadilla libre", "Sentadilla en máquina", "Peso muerto", "Dominadas",
  "Remo con barra", "Curl de bíceps", "Extensión de tríceps", "Elevaciones laterales",
  "Prensa de piernas", "Zancadas", "Hip thrust"
];

export default function ExerciseSearchModal({ onClose, onSelect }) {
  const [savedExercises, setSavedExercises] = useStickyState(defaultExercises, 'gymApp_exercises');
  const [exerciseMuscleMap, setExerciseMuscleMap] = useStickyState({}, 'gymApp_exerciseMuscles');

  const [search, setSearch] = useState('');
  const [isMuscleModalOpen, setIsMuscleModalOpen] = useState(false);
  const [pendingExercise, setPendingExercise] = useState('');
  const [tempMuscles, setTempMuscles] = useState([]);

  const handleSelectFromSearch = (ex) => {
    const hasMuscles = exerciseMuscleMap[ex] && exerciseMuscleMap[ex].length > 0;
    if (hasMuscles) {
      onSelect({ name: ex, muscles: exerciseMuscleMap[ex] });
    } else {
      setPendingExercise(ex);
      setTempMuscles([]);
      setIsMuscleModalOpen(true);
    }
  };

  const handleEditMuscleMapping = (e, ex) => {
    e.stopPropagation();
    setPendingExercise(ex);
    setTempMuscles(exerciseMuscleMap[ex] || []);
    setIsMuscleModalOpen(true);
  };

  const saveMuscleSelection = (addToRoutine) => {
    if (tempMuscles.length === 0) return;
    
    // Guardar mapa global
    const newMap = { ...exerciseMuscleMap, [pendingExercise]: tempMuscles };
    setExerciseMuscleMap(newMap);

    // Si es un ejercicio nuevo que acabamos de tipear, guardarlo en lista global
    const isNew = !savedExercises.some(e => e.toLowerCase() === pendingExercise.toLowerCase());
    if (isNew) {
      setSavedExercises([...savedExercises, pendingExercise]);
    }

    setIsMuscleModalOpen(false);

    if (addToRoutine) {
      onSelect({ name: pendingExercise, muscles: tempMuscles });
    }
  };

  const toggleMuscle = (muscle) => {
    setTempMuscles(prev => 
      prev.find(m => m.id === muscle.id)
        ? prev.filter(m => m.id !== muscle.id)
        : [...prev, muscle]
    );
  };

  if (isMuscleModalOpen) {
    return (
      <div className="fixed inset-0 z-[120] bg-surface flex flex-col">
        <div className="flex items-center justify-between p-4 bg-surface-container shadow-sm shrink-0 pt-safe">
          <button onClick={() => setIsMuscleModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full active:bg-surface-variant text-on-surface-variant">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <h2 className="font-headline-md text-on-surface truncate px-2">{pendingExercise}</h2>
          <div className="w-12 h-12"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          <p className="font-body-md text-on-surface-variant text-center">Selecciona los músculos que trabaja este ejercicio.</p>
          {muscleCategories.map(cat => (
            <div key={cat.id} className="flex flex-col gap-2">
              <h3 className="font-label-sm text-primary mb-1">{cat.name}</h3>
              <div className="flex flex-col gap-1 bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm">
                {cat.muscles.map(muscle => {
                  const isSelected = tempMuscles.some(m => m.id === muscle.id);
                  return (
                    <button
                      key={muscle.id}
                      onClick={() => toggleMuscle(muscle)}
                      className={`flex items-center gap-3 p-4 text-left transition-colors border-b border-surface-variant/30 last:border-0 ${isSelected ? 'bg-primary/10' : 'active:bg-surface-variant'}`}
                    >
                      <div className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary border-primary text-on-primary' : 'border-outline text-transparent'}`}>
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className={`font-body-md ${isSelected ? 'text-primary font-bold' : 'text-on-surface'}`}>{muscle.name}</span>
                        {muscle.desc && <span className="text-[12px] text-on-surface-variant leading-tight">{muscle.desc}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-surface-container shadow-[0_-4px_16px_rgba(0,0,0,0.05)] pb-safe flex flex-col gap-2">
          <button 
            onClick={() => saveMuscleSelection(true)}
            disabled={tempMuscles.length === 0}
            className="w-full py-4 rounded-xl bg-primary text-on-primary font-headline-sm shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            Guardar y Añadir a Rutina
          </button>
          <button 
            onClick={() => saveMuscleSelection(false)}
            disabled={tempMuscles.length === 0}
            className="w-full py-4 rounded-xl border border-primary/20 text-primary font-headline-sm active:bg-primary/5 transition-colors disabled:opacity-50"
          >
            Solo Guardar Músculos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] bg-surface flex flex-col">
      <div className="flex items-center gap-sm p-4 bg-surface-container shadow-sm shrink-0 pt-safe">
        <button 
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center rounded-full active:bg-surface-variant text-on-surface-variant"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <input 
          autoFocus
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ejercicio..."
          className="flex-1 bg-transparent border-none focus:outline-none font-headline-sm text-on-surface py-2"
        />
        {search && (
          <button onClick={() => setSearch('')} className="w-10 h-10 flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {savedExercises
          .filter(ex => ex.toLowerCase().includes(search.toLowerCase()))
          .map((ex, idx) => {
            const hasMuscles = exerciseMuscleMap[ex] && exerciseMuscleMap[ex].length > 0;
            return (
              <div key={idx} className="w-full flex items-center p-2 bg-surface-container-lowest rounded-xl border border-surface-variant/30 shadow-sm gap-2">
                <button
                  onClick={(e) => handleEditMuscleMapping(e, ex)}
                  className="w-12 h-12 flex items-center justify-center shrink-0 rounded-lg active:bg-surface-variant/50 text-on-surface-variant"
                >
                  <span className="material-symbols-outlined">edit</span>
                </button>
                
                <button
                  onClick={() => handleSelectFromSearch(ex)}
                  className="flex-1 flex items-center justify-between text-left py-2 px-2 active:bg-surface-variant/50 rounded-lg overflow-hidden"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${hasMuscles ? 'bg-tertiary' : 'bg-error'}`}></div>
                    <span className="truncate font-body-lg text-on-surface">{ex}</span>
                  </div>
                  <span className="material-symbols-outlined text-[24px] text-primary shrink-0 ml-2">add_circle</span>
                </button>
              </div>
            );
          })}
        
        {!savedExercises.some(ex => ex.toLowerCase() === search.trim().toLowerCase()) && search.trim().length > 0 && (
          <button
            onClick={() => handleSelectFromSearch(search.trim())}
            className="w-full text-left p-4 bg-primary/10 rounded-xl border border-primary/20 font-body-lg text-primary active:bg-primary/20 flex items-center justify-between mt-2 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">add_circle</span>
              <span className="truncate font-bold">Crear "{search.trim()}"</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
