import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import useStickyState from '../hooks/useStickyState';

export default function FoodRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category') || 'comida';
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
  const [foods, setFoods] = useState([]);
  const [inputs, setInputs] = useState({
    qty: '', name: '', prep: '', weight: '', cal: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [meals, setMeals] = useStickyState([], 'gymApp_meals');

  const handleAdd = () => {
    if (!inputs.name) return;
    setFoods([...foods, { ...inputs, id: Date.now(), category }]);
    setInputs({ qty: '', name: '', prep: '', weight: '', cal: '' });
  };

  const handleRemove = (id) => {
    setFoods(foods.filter(f => f.id !== id));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setMeals([...meals, ...foods]);
      setTimeout(() => {
        setSaved(false);
        setFoods([]);
        navigate(-1);
      }, 1500);
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col w-full h-full pb-md"
    >
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 flex items-center gap-sm">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center text-on-surface hover:bg-surface-variant/20 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h1 className="font-headline-md text-headline-md text-on-surface truncate">Log Meal</h1>
        </div>
      </header>

      <div className="mb-sm pt-24 px-4">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-xs">Registrar {categoryTitle}</h2>
        <p className="font-body-md text-body-md text-on-surface-variant leading-snug">Detalla lo que consumiste para mantener tu registro al día.</p>
      </div>
      
      <div className="flex flex-col gap-md flex-1 px-4">
        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-sm">
            <label className="font-label-sm text-label-sm text-on-surface">ALIMENTOS AÑADIDOS</label>
            <div className="flex flex-col gap-xs">
              {foods.length === 0 ? (
                <p className="text-on-surface-variant text-body-md italic py-xs">No hay alimentos añadidos aún.</p>
              ) : (
                foods.map(food => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={food.id} 
                    className="flex items-center justify-between bg-surface-container p-sm rounded-lg"
                  >
                    <span className="text-body-md text-on-surface">
                      {food.qty || '1'} - {food.name} - {food.prep || 'Natural'} - {food.weight || '0'}gr
                    </span>
                    <button 
                      onClick={() => handleRemove(food.id)}
                      className="text-error hover:bg-error/10 p-xs rounded-full transition-colors"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col gap-sm p-sm bg-surface-container-low rounded-xl border border-outline-variant/30">
            <label className="font-label-sm text-label-sm text-on-surface text-center">NUEVO ALIMENTO</label>
            <div className="flex flex-col md:grid md:grid-cols-12 gap-xs">
              <input 
                type="number" placeholder="Cantidad" 
                value={inputs.qty} onChange={e => setInputs({...inputs, qty: e.target.value})}
                className="w-full md:col-span-3 bg-surface-container-lowest text-on-surface font-body-md p-sm rounded-lg outline-none focus:ring-2 focus:ring-primary" 
              />
              <input 
                type="text" placeholder="Nombre (ej: Huevo)" 
                value={inputs.name} onChange={e => setInputs({...inputs, name: e.target.value})}
                className="w-full md:col-span-9 bg-surface-container-lowest text-on-surface font-body-md p-sm rounded-lg outline-none focus:ring-2 focus:ring-primary" 
              />
              <input 
                type="text" placeholder="Preparación (ej: Cocido)" 
                value={inputs.prep} onChange={e => setInputs({...inputs, prep: e.target.value})}
                className="w-full md:col-span-5 bg-surface-container-lowest text-on-surface font-body-md p-sm rounded-lg outline-none focus:ring-2 focus:ring-primary" 
              />
              <input 
                type="number" placeholder="Peso en gramos" 
                value={inputs.weight} onChange={e => setInputs({...inputs, weight: e.target.value})}
                className="w-full md:col-span-3 bg-surface-container-lowest text-on-surface font-body-md p-sm rounded-lg outline-none focus:ring-2 focus:ring-primary" 
              />
              <input 
                type="number" placeholder="Calorías (Kcal)" 
                value={inputs.cal} onChange={e => setInputs({...inputs, cal: e.target.value})}
                className="w-full md:col-span-4 bg-surface-container-lowest text-on-surface font-body-md p-sm rounded-lg outline-none focus:ring-2 focus:ring-primary" 
              />
            </div>
            <button 
              onClick={handleAdd}
              type="button" 
              className="mt-xs flex items-center justify-center gap-xs py-sm bg-secondary-container/30 text-on-secondary-container font-label-sm rounded-full hover:bg-secondary-container/50 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Añadir alimento
            </button>
          </div>
        </div>

        <div className="mt-auto pt-lg">
          <button 
            onClick={handleSave}
            disabled={isSaving || saved}
            className={`w-full text-on-primary font-headline-md text-headline-md py-sm rounded-full shadow-[0_8px_16px_rgba(137,81,0,0.2)] transition-colors flex items-center justify-center gap-2 ${saved ? 'bg-tertiary' : 'bg-primary'}`}
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: '"FILL" 1' }}>sync</span>
                Guardando...
              </>
            ) : saved ? (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                Guardado
              </>
            ) : (
              'Guardar Registro'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
