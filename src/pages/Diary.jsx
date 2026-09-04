import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStickyState from '../hooks/useStickyState';
import { useNavigate } from 'react-router-dom';

export default function Diary() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(false);

  // The diary entries
  const [entries, setEntries] = useStickyState([], 'gymApp_diary');
  const [newEntry, setNewEntry] = useState('');
  
  const endRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries, isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === '24122005') {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPasswordInput('');
    }
  };

  const handleSaveEntry = () => {
    if (!newEntry.trim()) return;
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    const entry = {
      id: Date.now().toString(),
      text: newEntry.trim(),
      dateStr: dateStr.charAt(0).toUpperCase() + dateStr.slice(1),
      timeStr: timeStr,
      timestamp: now.getTime()
    };
    
    setEntries([...entries, entry]);
    setNewEntry('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative lock background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
           <span className="material-symbols-outlined text-[300px]">lock</span>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-low p-8 rounded-[32px] w-full max-w-sm shadow-xl flex flex-col items-center relative z-10 border border-surface-variant/20"
        >
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-6 shadow-inner">
             <span className="material-symbols-outlined text-[32px] text-primary">key</span>
          </div>
          
          <h1 className="font-display-sm text-on-surface mb-2 text-center">Acceso Restringido</h1>
          <p className="font-body-md text-on-surface-variant text-center mb-8">
            Ingresa la contraseña para acceder a la libreta secreta.
          </p>
          
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <div className="relative">
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setError(false);
                }}
                placeholder="Contraseña"
                className={`w-full bg-surface-container-highest py-4 px-6 rounded-2xl font-headline-md tracking-widest text-center text-on-surface focus:outline-none focus:ring-2 transition-all ${error ? 'ring-2 ring-error text-error placeholder:text-error/50' : 'focus:ring-primary'}`}
                autoFocus
              />
              <AnimatePresence>
                {error && (
                  <motion.span 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-6 inset-x-0 text-center font-label-sm text-error"
                  >
                    Contraseña incorrecta
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            
            <button 
              type="submit"
              className="mt-4 w-full py-4 rounded-full bg-primary text-on-primary font-headline-sm shadow-md active:scale-95 transition-transform"
            >
              Desbloquear
            </button>
          </form>
          
          <button 
            onClick={() => navigate('/')}
            className="mt-6 font-label-md text-on-surface-variant active:text-on-surface transition-colors"
          >
            Volver al inicio
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col w-full min-h-screen bg-surface"
    >
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-variant/20">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <button 
              onClick={() => navigate('/')}
              className="w-12 h-12 flex items-center justify-center text-on-surface hover:bg-surface-variant/20 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back_ios_new</span>
            </button>
            <div className="flex flex-col">
              <h1 className="font-headline-md text-headline-md text-on-surface leading-tight">Libreta Secreta</h1>
              <span className="font-label-sm text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">lock</span>
                Cifrado y Sellado
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Diary Entries List */}
      <div className="flex-1 overflow-y-auto pt-24 pb-32 px-4 flex flex-col gap-6">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50 mt-20">
            <span className="material-symbols-outlined text-[64px] mb-4 text-on-surface-variant">menu_book</span>
            <p className="font-body-lg text-on-surface-variant text-center max-w-[250px]">
              La libreta está vacía. Lo que escribas aquí quedará sellado permanentemente con su fecha y hora.
            </p>
          </div>
        ) : (
          entries.map((entry, idx) => {
            const showDateHeader = idx === 0 || entries[idx - 1].dateStr !== entry.dateStr;
            
            return (
              <div key={entry.id} className="flex flex-col">
                {showDateHeader && (
                  <div className="flex items-center justify-center my-4 sticky top-20 z-10">
                    <span className="bg-surface-variant text-on-surface-variant font-label-sm px-4 py-1 rounded-full shadow-sm text-[11px] uppercase tracking-widest border border-outline-variant/30">
                      {entry.dateStr}
                    </span>
                  </div>
                )}
                
                <div className="bg-surface-container-lowest rounded-2xl rounded-tl-sm p-4 shadow-sm border border-surface-variant/40 self-start w-[90%] max-w-[340px] flex flex-col gap-2 relative mt-2">
                  <span className="font-label-sm text-primary absolute top-3 right-4 bg-primary/10 px-2 py-0.5 rounded-md">
                    {entry.timeStr}
                  </span>
                  <p className="font-body-lg text-on-surface whitespace-pre-wrap leading-relaxed mt-6">
                    {entry.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 inset-x-0 p-3 bg-surface/90 backdrop-blur-2xl border-t border-surface-variant/30 pb-safe z-50">
        <div className="flex items-end gap-2 bg-surface-container-highest p-2 rounded-[28px]">
          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="Escribe en tu libreta..."
            className="flex-1 bg-transparent min-h-[48px] max-h-[120px] py-3 px-4 font-body-lg text-on-surface focus:outline-none resize-none placeholder:text-on-surface-variant/60"
            rows={1}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = (e.target.scrollHeight) + 'px';
            }}
          />
          <button 
            onClick={handleSaveEntry}
            disabled={!newEntry.trim()}
            className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md active:scale-90 transition-transform disabled:opacity-40 disabled:active:scale-100"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
