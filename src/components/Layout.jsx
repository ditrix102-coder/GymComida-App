import { Outlet, NavLink } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen overflow-x-hidden">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]"></header>
      
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-24 bg-surface px-margin-mobile">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-around h-16 px-4">
          <NavLink 
            to="/" 
            className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined">calendar_today</span>
            <span className="text-label-sm">Hoy</span>
          </NavLink>
          
          <NavLink 
            to="/gym" 
            className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined">fitness_center</span>
            <span className="text-label-sm">Gym</span>
          </NavLink>
          
          <NavLink 
            to="/profile" 
            className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined">person</span>
            <span className="text-label-sm">Perfil</span>
          </NavLink>
          
          <NavLink 
            to="/diary" 
            className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            <svg viewBox="0 0 128 128" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="dragonBallBody" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#ffe600"/>
                  <stop offset="20%" stopColor="#ffb700"/>
                  <stop offset="65%" stopColor="#ff7700"/>
                  <stop offset="90%" stopColor="#e64a00"/>
                  <stop offset="100%" stopColor="#b32400"/>
                </radialGradient>
                <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="70%" stopColor="#ff9900" stopOpacity="0"/>
                  <stop offset="95%" stopColor="#991b00" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#4d0000" stopOpacity="0.8"/>
                </radialGradient>
                <linearGradient id="topHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85"/>
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
                </linearGradient>
                <filter id="starGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#7a0000" floodOpacity="0.55"/>
                </filter>
                <g id="star" filter="url(#starGlow)">
                  <polygon points="0,-15 3.52,-4.85 14.21,-4.62 5.68,1.86 8.79,12.1 0,5.98 -8.79,12.1 -5.68,1.86 -14.21,-4.62 -3.52,-4.85" fill="#cc0000"/>
                </g>
              </defs>
              <circle cx="64" cy="64" r="58" fill="url(#dragonBallBody)"/>
              <circle cx="64" cy="64" r="58" fill="url(#innerGlow)"/>
              <circle cx="64" cy="64" r="58" fill="none" stroke="#d94100" strokeWidth="1.5" opacity="0.6"/>
              <use href="#star" x="64" y="64"/>
              <use href="#star" x="64" y="33"/>
              <use href="#star" x="90.8" y="48.5"/>
              <use href="#star" x="90.8" y="79.5"/>
              <use href="#star" x="64" y="95"/>
              <use href="#star" x="37.2" y="79.5"/>
              <use href="#star" x="37.2" y="48.5"/>
              <path d="M 28 38 C 38 20, 90 20, 100 38 C 88 27, 40 27, 28 38 Z" fill="url(#topHighlight)"/>
              <ellipse cx="44" cy="28" rx="8" ry="4" transform="rotate(-30 44 28)" fill="#ffffff" opacity="0.6"/>
            </svg>
            <span className="text-label-sm">+ Más</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
