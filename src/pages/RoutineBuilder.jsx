import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStickyState from '../hooks/useStickyState';

export default function RoutineBuilder() {
  const navigate = useNavigate();
  
  // States
  const [routineName, setRoutineName] = useState('');
  const [routineDay, setRoutineDay] = useState('Lunes');
  const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false);
  const [routineExercises, setRoutineExercises] = useState([]);

  // Search states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  
  const defaultExercises = [
    "Press banca plano", "Press banca inclinado", "Press banca declinado", "Press militar",
    "Sentadilla libre", "Sentadilla en máquina", "Peso muerto", "Dominadas", "Remo con barra",
    "Curl de bíceps", "Extensión de tríceps", "Elevaciones laterales", "Prensa de piernas",
    "Zancadas", "Hip thrust", "Abdominales crunch", "Plancha"
  ];
  
  const [savedExercises, setSavedExercises] = useStickyState(defaultExercises, 'gymApp_exercises');
  const [exerciseMuscleMap, setExerciseMuscleMap] = useStickyState({}, 'gymApp_exerciseMuscles');

  // Muscle selection modal states
  const [isMuscleModalOpen, setIsMuscleModalOpen] = useState(false);
  const [isEditMuscleMode, setIsEditMuscleMode] = useState(false);
  const [pendingExerciseName, setPendingExerciseName] = useState('');
  const [tempSelectedMuscles, setTempSelectedMuscles] = useState([]);

  const muscleCategories = [
    {
      id: 'general',
      name: '❓ No lo sé / Omitir',
      muscles: [
        { id: 'unknown', name: 'No estoy seguro', desc: 'Omitir grupo muscular', icon: 'help_center' }
      ]
    },
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
      name: '🧘 Zona Media',
      muscles: [
        { id: 'abdominales', name: 'Abdominales', desc: 'Recto abdominal y oblicuos', icon: 'sports_gymnastics' },
      ]
    }
  ];

  const handleSelectExerciseFromSearch = (name) => {
    const savedMuscles = exerciseMuscleMap[name];
    if (savedMuscles && savedMuscles.length > 0) {
      // Already has muscles assigned, add directly to routine!
      const newExercise = {
        id: Date.now().toString(),
        name: name,
        muscles: savedMuscles,
        sets: []
      };
      setRoutineExercises([...routineExercises, newExercise]);
      if (!savedExercises.some(ex => ex.toLowerCase() === name.trim().toLowerCase())) {
        setSavedExercises([...savedExercises, name.trim()]);
      }
      setIsSearchOpen(false);
      setExerciseSearch('');
    } else {
      // No muscles saved, ask for them before adding
      setPendingExerciseName(name);
      setTempSelectedMuscles([]);
      setIsEditMuscleMode(false);
      setIsSearchOpen(false);
      setIsMuscleModalOpen(true);
    }
  };

  const handleEditMuscleMapping = (e, name) => {
    e.stopPropagation();
    setPendingExerciseName(name);
    setTempSelectedMuscles(exerciseMuscleMap[name] || []);
    setIsEditMuscleMode(true);
    setIsSearchOpen(false);
    setIsMuscleModalOpen(true);
  };

  const saveMuscleSelection = (addToRoutine) => {
    const finalMuscles = tempSelectedMuscles.length > 0 ? tempSelectedMuscles : [{ id: 'unknown', name: 'Desconocido', icon: 'help_center' }];

    if (addToRoutine) {
      // Adding directly to routine - DO NOT update global muscle map
      const newExercise = {
        id: Date.now().toString(),
        name: pendingExerciseName,
        muscles: finalMuscles,
        sets: []
      };
      setRoutineExercises([...routineExercises, newExercise]);
      
      if (!savedExercises.some(ex => ex.toLowerCase() === pendingExerciseName.trim().toLowerCase())) {
        setSavedExercises([...savedExercises, pendingExerciseName.trim()]);
      }
      setIsSearchOpen(false);
      setExerciseSearch('');
    } else {
      // Solo guardar: Update global muscle map
      setExerciseMuscleMap(prev => ({
        ...prev,
        [pendingExerciseName]: finalMuscles
      }));
      // Just save the mapping and re-open search
      setIsSearchOpen(true);
      // Ensure the exercise is at least in the savedExercises list
      if (!savedExercises.some(ex => ex.toLowerCase() === pendingExerciseName.trim().toLowerCase())) {
        setSavedExercises([...savedExercises, pendingExerciseName.trim()]);
      }
    }

    setIsMuscleModalOpen(false);
  };

  const toggleMuscle = (muscle) => {
    setTempSelectedMuscles(prev => 
      prev.find(m => m.id === muscle.id)
        ? prev.filter(m => m.id !== muscle.id)
        : [...prev, muscle]
    );
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newArr = [...routineExercises];
    const temp = newArr[index];
    newArr[index] = newArr[index - 1];
    newArr[index - 1] = temp;
    setRoutineExercises(newArr);
  };

  const handleMoveDown = (index) => {
    if (index === routineExercises.length - 1) return;
    const newArr = [...routineExercises];
    const temp = newArr[index];
    newArr[index] = newArr[index + 1];
    newArr[index + 1] = temp;
    setRoutineExercises(newArr);
  };

  const handleRemoveExercise = (id) => {
    setRoutineExercises(routineExercises.filter(ex => ex.id !== id));
  };

  const handleSaveRoutine = () => {
    if (!routineName.trim() || routineExercises.length === 0) return;
    
    const routines = JSON.parse(localStorage.getItem('gymApp_routines') || '[]');
    const newRoutine = {
      id: Date.now().toString(),
      name: routineName,
      day: routineDay,
      exercises: routineExercises
    };
    
    localStorage.setItem('gymApp_routines', JSON.stringify([...routines, newRoutine]));
    navigate(-1);
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex flex-col w-full min-h-screen pb-24 bg-surface"
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
            <h1 className="font-headline-md text-headline-md text-on-surface truncate">Armar Rutina</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-md pt-24 px-4">
        {/* Info Card */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-variant/30 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-on-surface-variant">Nombre de la Rutina</label>
            <input 
              type="text" 
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="bg-surface-container-highest py-3 px-4 font-headline-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary w-full"
              placeholder="Ej. Pecho y Tríceps"
            />
          </div>
          <div className="flex flex-col gap-1 relative z-50">
            <label className="font-label-sm text-on-surface-variant">Día de la Semana</label>
            <button 
              onClick={() => setIsDayDropdownOpen(!isDayDropdownOpen)}
              className="w-full flex items-center justify-between bg-surface-container-highest py-3 px-4 font-body-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-primary active:bg-surface-variant/50 transition-colors"
            >
              <span className="text-on-surface">{routineDay}</span>
              <span className={`material-symbols-outlined transition-transform duration-200 ${isDayDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            
            {/* Dropdown Menu */}
            {isDayDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-[60]" 
                  onClick={() => setIsDayDropdownOpen(false)}
                ></div>
                <div className="absolute top-[100%] left-0 right-0 mt-2 bg-surface rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-surface-variant/30 z-[70] overflow-hidden flex flex-col">
                  {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo', 'Cualquier Día'].map(day => (
                    <button
                      key={day}
                      onClick={() => {
                        setRoutineDay(day);
                        setIsDayDropdownOpen(false);
                      }}
                      className={`w-full text-left py-3 px-4 font-body-lg transition-colors border-b border-surface-variant/10 last:border-0 bg-surface ${routineDay === day ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-variant/30'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Exercises List */}
        <div className="flex flex-col gap-sm">
          <h3 className="font-headline-md text-on-surface">Ejercicios</h3>
          
          {routineExercises.length === 0 ? (
            <div className="bg-surface-container-low p-6 rounded-2xl border border-dashed border-primary/30 flex flex-col items-center justify-center opacity-70">
              <span className="material-symbols-outlined text-[48px] text-primary mb-2">fitness_center</span>
              <p className="font-body-md text-center">Aún no hay ejercicios.</p>
              <p className="font-label-sm text-center">Toca Añadir Ejercicio para empezar.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {routineExercises.map((ex, index) => (
                <div key={ex.id} className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-variant/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-label-lg text-on-surface-variant w-4">{index + 1}.</span>
                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                      {ex.muscles && ex.muscles.length === 1 ? (
                        <span className="material-symbols-outlined text-[20px] text-on-primary-container">{ex.muscles[0].icon}</span>
                      ) : ex.muscles && ex.muscles.length > 1 ? (
                        <span className="font-label-sm text-[12px] text-on-primary-container">+{ex.muscles.length}</span>
                      ) : (
                        <span className="material-symbols-outlined text-[20px] text-on-primary-container">help_center</span>
                      )}
                    </div>
                    <span className="font-headline-sm text-on-surface">{ex.name}</span>
                  </div>
                  
                  {/* Reorder and Delete Controls */}
                  <div className="flex items-center gap-1">
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-surface-container hover:bg-surface-container-highest disabled:opacity-30"
                      >
                        <span className="material-symbols-outlined text-[16px]">expand_less</span>
                      </button>
                      <button 
                        onClick={() => handleMoveDown(index)}
                        disabled={index === routineExercises.length - 1}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-surface-container hover:bg-surface-container-highest disabled:opacity-30"
                      >
                        <span className="material-symbols-outlined text-[16px]">expand_more</span>
                      </button>
                    </div>
                    <button 
                      onClick={() => handleRemoveExercise(ex.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-full text-error opacity-70 hover:opacity-100 hover:bg-error/10 active:bg-error/20 ml-1"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center justify-center gap-sm w-full py-4 mt-2 rounded-xl border-2 border-primary/20 text-primary font-headline-sm hover:bg-primary/5 transition-colors"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Añadir Ejercicio
          </button>

          {routineExercises.length > 0 && (
            <button 
              onClick={handleSaveRoutine}
              disabled={!routineName.trim()}
              className="flex items-center justify-center gap-sm w-full py-4 mt-4 rounded-xl bg-primary text-on-primary font-headline-md shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50 disabled:shadow-none"
            >
              <span className="material-symbols-outlined">task_alt</span>
              Finalizar y Guardar Rutina
            </button>
          )}
        </div>
      </div>
    </motion.div>

      {/* Exercise Search Screen */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          <div className="flex items-center gap-sm p-4 bg-surface-container shadow-sm shrink-0 pt-safe">
            <button 
              onClick={() => {
                setIsSearchOpen(false);
                setExerciseSearch('');
              }}
              className="w-12 h-12 flex items-center justify-center rounded-full active:bg-surface-variant text-on-surface-variant"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <input 
              autoFocus
              type="text"
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              placeholder="Buscar ejercicio..."
              className="flex-1 bg-transparent border-none focus:outline-none font-headline-sm text-on-surface py-2"
            />
            {exerciseSearch && (
              <button onClick={() => setExerciseSearch('')} className="w-10 h-10 flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {savedExercises
              .filter(ex => ex.toLowerCase().includes(exerciseSearch.toLowerCase()))
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
                      onClick={() => handleSelectExerciseFromSearch(ex)}
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
            
            {!savedExercises.some(ex => ex.toLowerCase() === exerciseSearch.trim().toLowerCase()) && exerciseSearch.trim().length > 0 && (
              <button
                onClick={() => handleSelectExerciseFromSearch(exerciseSearch.trim())}
                className="w-full text-left p-4 bg-primary/10 rounded-xl border border-primary/20 font-body-lg text-primary active:bg-primary/20 flex items-center justify-between mt-2 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">add_circle</span>
                  <span className="truncate font-bold">Crear "{exerciseSearch.trim()}"</span>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Muscle Selection Modal */}
      {isMuscleModalOpen && (
        <div className="fixed inset-0 z-[110] bg-white flex flex-col">
          <div className="flex items-center justify-between p-4 bg-surface-container shadow-sm shrink-0 pt-safe">
            <button onClick={() => setIsMuscleModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full active:bg-surface-variant text-on-surface-variant">
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <h2 className="font-headline-md text-headline-md text-on-surface">Músculos Involucrados</h2>
            <div className="w-12 h-12"></div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            {muscleCategories.map(cat => (
              <div key={cat.id} className="flex flex-col gap-2">
                <h3 className="font-label-sm text-label-sm text-primary mb-1">{cat.name}</h3>
                <div className="flex flex-col gap-1 bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm">
                  {cat.muscles.map(muscle => {
                    const isSelected = tempSelectedMuscles.some(m => m.id === muscle.id);
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
                          <span className={`font-body-md text-body-md ${isSelected ? 'text-primary font-bold' : 'text-on-surface'}`}>{muscle.name}</span>
                          {muscle.desc && <span className="text-[12px] text-on-surface-variant leading-tight">{muscle.desc}</span>}
                        </div>
                        <span className="material-symbols-outlined text-[20px] opacity-50">{muscle.icon}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-white border-t border-surface-variant/30 shrink-0 flex flex-col gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe pt-2">
            <button 
              onClick={() => saveMuscleSelection(false)} 
              className="w-full py-3 rounded-full border-2 border-primary/20 text-primary font-headline-sm active:bg-primary/5 transition-colors pointer-events-auto"
            >
              Solo guardar músculos
            </button>
            <button 
              onClick={() => saveMuscleSelection(true)} 
              className="w-full py-4 rounded-full bg-primary text-on-primary font-headline-md shadow-sm active:scale-[0.98] transition-transform pointer-events-auto"
            >
              Añadir a la Rutina
            </button>
          </div>
        </div>
      )}
    </>
  );
}
