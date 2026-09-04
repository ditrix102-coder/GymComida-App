import { useState } from 'react';
import useStickyState from '../hooks/useStickyState';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Nutrition() {
  const [water, setWater] = useStickyState(0, 'gymApp_water');
  const [waterEstimative, setWaterEstimative] = useStickyState(false, 'gymApp_waterEstimative');
  const [steps, setSteps] = useStickyState(0, 'gymApp_steps');
  const [meals, setMeals] = useStickyState([], 'gymApp_meals');

  const [wellness, setWellness] = useStickyState({
    morning: { weight: '', waist: '', mood: '' },
    afternoon: { weight: '', waist: '', mood: '' },
    night: { weight: '', waist: '', mood: '' }
  }, 'gymApp_wellness');

  const getInitialTab = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) return 'morning';
    if (currentHour >= 12 && currentHour < 20) return 'afternoon';
    return 'night';
  };

  const [wellnessTab, setWellnessTab] = useState(getInitialTab);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);

  const handleWellnessTabClick = (tab) => {
    const currentHour = new Date().getHours();
    let isCorrectTime = false;
    
    if (tab === 'morning' && currentHour >= 5 && currentHour < 12) isCorrectTime = true;
    if (tab === 'afternoon' && currentHour >= 12 && currentHour < 20) isCorrectTime = true;
    if (tab === 'night' && (currentHour >= 20 || currentHour < 5)) isCorrectTime = true;

    if (!isCorrectTime) {
      setPendingTab(tab);
      setShowTimeWarning(true);
    } else {
      setWellnessTab(tab);
    }
  };

  const confirmTimeWarning = (force) => {
    if (force) {
      setWellnessTab(pendingTab);
    } else {
      setWellnessTab(getInitialTab());
    }
    setShowTimeWarning(false);
  };

  const handleWellnessUpdate = (field, value) => {
    setWellness(prev => ({
      ...prev,
      [wellnessTab]: {
        ...prev[wellnessTab],
        [field]: value
      }
    }));
  };

  const moodOptions = [
    { id: 'feliz', label: 'Feliz', emoji: '😄' },
    { id: 'animado', label: 'Animado', emoji: '⚡' },
    { id: 'normal', label: 'Normal', emoji: '😐' },
    { id: 'estresado', label: 'Estresado', emoji: '😫' },
    { id: 'cansado', label: 'Cansado', emoji: '😴' }
  ];

  const [goals] = useStickyState({
    calories: { value: 2000, unit: 'kcal' },
    water: { value: 2500, unit: 'ml' },
    steps: { value: 10000, unit: 'pasos' }
  }, 'gymApp_goals');

  const calGoal = goals.calories.value;
  const calUnit = goals.calories.unit;
  
  const waterGoal = goals.water.value;
  const waterUnit = goals.water.unit;
  
  const stepsGoal = goals.steps.value;
  const stepsUnit = goals.steps.unit;

  const consumedCalories = meals.reduce((total, meal) => total + (parseFloat(meal.cal) || 0), 0);
  const calPercentage = Math.min((consumedCalories / calGoal) * 100, 100);

  const getWaterIncrement = () => {
    if (waterUnit === 'vasos') return 1;
    if (waterUnit === 'L') return 0.25;
    return 250;
  };
  const waterIncrement = getWaterIncrement();

  const addWater = () => setWater(w => Math.min(w + waterIncrement, waterGoal));
  const removeWater = () => setWater(w => Math.max(w - waterIncrement, 0));

  const addSteps = (amount) => setSteps(s => s + amount);
  const removeSteps = (amount) => setSteps(s => Math.max(s - amount, 0));

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col w-full gap-lg"
    >
      {/* Date Header */}
      <div className="flex items-center justify-between mt-sm">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition-colors active:bg-surface-container hover:bg-surface-container"></button>
        <div className="flex flex-col items-center">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Hoy</span>
          <span className="font-headline-md text-headline-md text-on-surface">14 de Octubre</span>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition-colors active:bg-surface-container hover:bg-surface-container opacity-50 cursor-not-allowed"></button>
      </div>

      {/* Daily Progress Summary */}
      <div className="bg-surface-container-low rounded-xl p-md flex flex-col gap-sm shadow-[0_10px_30px_rgba(45,90,39,0.05)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50"></div>
        <div className="relative z-10 flex justify-between items-end mb-2">
          <div>
            <span className="font-body-md text-body-md text-on-surface-variant">Calorías consumidas</span>
            <div className="flex items-baseline gap-xs mt-1">
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{consumedCalories}</span>
              <span className="font-body-md text-body-md text-on-surface-variant">/ {calGoal} {calUnit}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container">local_fire_department</span>
          </div>
        </div>
        <div className="relative z-10 h-3 w-full bg-[#F2F4F2] rounded-full overflow-hidden mt-2">
          <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: `${calPercentage}%` }}></div>
        </div>
      </div>

      {/* Habits Section */}
      <div className="flex flex-col gap-md">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface">Hábitos</h2>
        </div>
        <div className="grid grid-cols-1 gap-md">
          {/* Water Habit Card */}
          <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0_10px_30px_rgba(45,90,39,0.05)] flex flex-col gap-sm">
            <div className="flex items-center justify-between">
              <div className="flex gap-sm items-center">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-secondary-container text-[24px]">water_drop</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface text-[20px] leading-tight">Agua</h3>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {water} / {waterGoal} {waterUnit} {waterEstimative ? '(Estimativo)' : ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-sm">
                <button onClick={removeWater} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant active:bg-surface-container-high">
                  <span className="material-symbols-outlined text-[20px]">remove</span>
                </button>
                <button onClick={addWater} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary active:bg-primary-container">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-end px-1 mt-1">
              <label className="text-[13px] text-on-surface-variant flex items-center gap-2 cursor-pointer font-label-sm">
                <input 
                  type="checkbox" 
                  checked={waterEstimative} 
                  onChange={(e) => setWaterEstimative(e.target.checked)} 
                  className="w-4 h-4 rounded border-surface-container-highest text-secondary focus:ring-secondary focus:ring-offset-0 bg-surface-container-low" 
                />
                Es una medida estimativa
              </label>
            </div>

            <div className="h-2 w-full bg-[#F2F4F2] rounded-full overflow-hidden mt-1">
              <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${(water / waterGoal) * 100}%` }}></div>
            </div>
          </div>

          {/* Steps Habit Card */}
          <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0_10px_30px_rgba(45,90,39,0.05)] flex flex-col gap-sm">
            <div className="flex items-center justify-between">
              <div className="flex gap-sm items-center">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary-container text-[24px]">directions_walk</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface text-[20px] leading-tight">Pasos</h3>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{steps} / {stepsGoal} {stepsUnit}</span>
                </div>
              </div>
              <div className="flex flex-col gap-xs items-end">
                <div className="flex gap-xs">
                  <button onClick={() => addSteps(1)} className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-[12px] font-bold active:bg-primary-container shadow-sm">+1</button>
                  <button onClick={() => addSteps(10)} className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-[12px] font-bold active:bg-primary-container shadow-sm">+10</button>
                  <button onClick={() => addSteps(100)} className="w-10 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-[12px] font-bold active:bg-primary-container shadow-sm">+100</button>
                  <button onClick={() => addSteps(1000)} className="w-12 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-[12px] font-bold active:bg-primary-container shadow-sm">+1k</button>
                </div>
                <div className="flex gap-xs">
                  <button onClick={() => removeSteps(10)} className="w-12 h-8 rounded-full bg-surface-container text-on-surface flex items-center justify-center text-[12px] font-bold active:bg-surface-container-high shadow-sm">-10</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meal Entries Grid */}
      <div className="flex flex-col gap-md">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface">Comidas</h2>
        </div>
        
        {[
          { id: 'desayuno', name: 'Desayuno', icon: 'bakery_dining' },
          { id: 'almuerzo', name: 'Almuerzo', icon: 'restaurant' },
          { id: 'merienda', name: 'Merienda', icon: 'coffee' },
          { id: 'cena', name: 'Cena', icon: 'dinner_dining' },
          { id: 'snack', name: 'Snacks', icon: 'cookie' },
        ].map((category) => {
          const categoryMeals = meals.filter(m => m.category === category.id);
          const categoryCal = categoryMeals.reduce((tot, m) => tot + (parseFloat(m.cal) || 0), 0);

          return (
            <div key={category.id} className="bg-surface-container-lowest rounded-xl p-md shadow-[0_10px_30px_rgba(45,90,39,0.05)] flex flex-col gap-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary opacity-80"></div>
              <div className="flex items-start justify-between">
                <div className="flex gap-sm items-center">
                  <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>{category.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface text-[20px] leading-tight">{category.name}</h3>
                    <span className="font-label-sm text-label-sm text-secondary">{categoryCal} kcal</span>
                  </div>
                </div>
                <Link to={`/log-food?category=${category.id}`} className="h-8 px-4 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm transition-colors active:bg-primary/20 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Añadir</span>
                </Link>
              </div>
              
              {/* List of registered items for this category */}
              {categoryMeals.length > 0 && (
                <div className="mt-2 flex flex-col gap-xs border-t border-surface-container pt-sm">
                  {categoryMeals.map(meal => (
                    <div key={meal.id} className="flex justify-between items-center text-sm">
                      <div className="flex flex-col">
                        <span className="text-on-surface font-body-md font-medium">{meal.name}</span>
                        <span className="text-on-surface-variant text-[12px]">{meal.qty} {meal.weight ? `(${meal.weight})` : ''} {meal.prep ? `- ${meal.prep}` : ''}</span>
                      </div>
                      <span className="text-on-surface-variant font-label-sm">{meal.cal} kcal</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Registro Diario (Wellness Tracker) */}
      <div className="flex flex-col gap-md">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface">Registro Diario</h2>
        </div>
        
        <div className="bg-surface-container-low rounded-2xl p-4 shadow-sm flex flex-col gap-4 border border-surface-variant/20">
          
          {/* Tabs */}
          <div className="flex bg-surface-container p-1 rounded-xl gap-1">
            <button 
              onClick={() => handleWellnessTabClick('morning')}
              className={`flex-1 py-2 font-label-md rounded-lg transition-colors ${wellnessTab === 'morning' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'}`}
            >
              Mañana
            </button>
            <button 
              onClick={() => handleWellnessTabClick('afternoon')}
              className={`flex-1 py-2 font-label-md rounded-lg transition-colors ${wellnessTab === 'afternoon' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'}`}
            >
              Tarde
            </button>
            <button 
              onClick={() => handleWellnessTabClick('night')}
              className={`flex-1 py-2 font-label-md rounded-lg transition-colors ${wellnessTab === 'night' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'}`}
            >
              Noche
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 relative">
              <label className="font-label-sm text-on-surface-variant ml-1">Peso</label>
              <input 
                type="number" 
                value={wellness[wellnessTab]?.weight || ''}
                onChange={(e) => handleWellnessUpdate('weight', e.target.value)}
                placeholder="Ej. 75"
                className="bg-surface-container-highest py-3 px-4 rounded-xl font-headline-sm focus:outline-none focus:ring-2 focus:ring-primary w-full"
              />
              <span className="absolute right-4 bottom-3 font-label-sm text-on-surface-variant opacity-70">kg</span>
            </div>
            
            <div className="flex flex-col gap-1 relative">
              <label className="font-label-sm text-on-surface-variant ml-1">Cintura</label>
              <input 
                type="number" 
                value={wellness[wellnessTab]?.waist || ''}
                onChange={(e) => handleWellnessUpdate('waist', e.target.value)}
                placeholder="Ej. 80"
                className="bg-surface-container-highest py-3 px-4 rounded-xl font-headline-sm focus:outline-none focus:ring-2 focus:ring-primary w-full"
              />
              <span className="absolute right-4 bottom-3 font-label-sm text-on-surface-variant opacity-70">cm</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-2 relative">
            <label className="font-label-sm text-on-surface-variant ml-1">¿Cómo me siento?</label>
            <div className="relative">
              <select
                value={wellness[wellnessTab]?.mood || ''}
                onChange={(e) => handleWellnessUpdate('mood', e.target.value)}
                className="w-full bg-surface-container-highest py-3 px-4 rounded-xl font-headline-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none text-on-surface"
              >
                <option value="" disabled>Selecciona una opción</option>
                {moodOptions.map(mood => (
                  <option key={mood.id} value={mood.id}>
                    {mood.emoji} {mood.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {showTimeWarning && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-3xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-error text-[24px]">schedule</span>
            </div>
            <h3 className="font-headline-md text-center text-on-surface">Horario Inusual</h3>
            <p className="font-body-md text-center text-on-surface-variant">
              Aún no es horario de {pendingTab === 'morning' ? 'Mañana' : pendingTab === 'afternoon' ? 'Tarde' : 'Noche'}. ¿Estás seguro de que quieres rellenar este horario?
            </p>
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => confirmTimeWarning(false)}
                className="flex-1 py-3 rounded-full font-headline-sm text-on-surface bg-surface-container-high active:bg-surface-container-highest transition-colors"
              >
                No, volver
              </button>
              <button 
                onClick={() => confirmTimeWarning(true)}
                className="flex-1 py-3 rounded-full font-headline-sm text-on-primary bg-primary active:bg-primary/90 shadow-sm transition-colors"
              >
                Sí, rellenar
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
}
