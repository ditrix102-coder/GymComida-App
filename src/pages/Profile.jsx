import { useState, useRef } from 'react';
import useStickyState from '../hooks/useStickyState';
import { motion } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import GoalSettingsModal from '../components/GoalSettingsModal';
import ProfileInfoModal from '../components/ProfileInfoModal';

export default function Profile() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [endOfDayTime, setEndOfDayTime] = useStickyState('23:59', 'gymApp_endOfDayTime');
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('profileImage') || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmOGDqdcPG-oL8G3DDT5QRs0DJdMLPvxkM2w9HjylbNOkuOPvswyqn8VQy_fr5VkdrbKq6jUl9qnmVl6CQ-DbHf8eR3gy8CeL-c9MVKkJ3Hl9rFWCV5H2MO0N3DfwVBAzcUTtlOE3QllZed83SbOU9WIjX7TWvT_sX7-cXHMTZtGH1-msa049mrk9jQ_1uU35ji50OEc_WcpLjZPwLv8sv22m-WUNxuNq4zY4Runv7jWSgcTx7cfGYtg';
  });
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useStickyState({
    firstName: 'Elena',
    lastName: 'Ríos',
    age: 28,
    weight: 65,
    height: 165,
    hips: 95
  }, 'gymApp_userInfo');
  const [goals, setGoals] = useStickyState({
    calories: { value: 2000, unit: 'kcal' },
    protein: { value: 140, unit: 'g' },
    carbs: { value: 220, unit: 'g' },
    water: { value: 2500, unit: 'ml' },
    gym: { value: 1.5, unit: 'horas' },
    steps: { value: 10000, unit: 'pasos' }
  }, 'gymApp_goals');
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    setIsInfoModalOpen(true);
  };

  const handleEditImageClick = (e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfileImage(base64String);
        localStorage.setItem('profileImage', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadData = async () => {
    const todayDateString = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const data = {
      date: todayDateString,
      nutrition: {
        water: JSON.parse(localStorage.getItem('gymApp_water') || '0'),
        waterEstimative: JSON.parse(localStorage.getItem('gymApp_waterEstimative') || 'false'),
        steps: JSON.parse(localStorage.getItem('gymApp_steps') || '0'),
        meals: JSON.parse(localStorage.getItem('gymApp_meals') || '[]')
      },
      gym: {
        registeredExercises: JSON.parse(localStorage.getItem('gymApp_registeredExercises') || '[]'),
        elapsedTime: JSON.parse(localStorage.getItem('gymApp_elapsedTime') || '0')
      },
      goals: JSON.parse(localStorage.getItem('gymApp_goals') || '{}'),
      wellness: JSON.parse(localStorage.getItem('gymApp_wellness') || '{}')
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const fileName = `GymComida_Export_${todayDateString}.json`;

    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.writeFile({
          path: `GymComida/${fileName}`,
          data: jsonString,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
          recursive: true
        });
        alert(`Exportado correctamente a Documentos/GymComida/${fileName}`);
      } catch (e) {
        console.error('Error saving file natively', e);
        alert('Error al guardar el archivo en el celular.');
      }
    } else {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleResetData = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar todos los datos de hoy? Esto borrará el progreso de agua, pasos, comidas y ejercicios de la sesión actual.')) {
      localStorage.setItem('gymApp_water', '0');
      localStorage.setItem('gymApp_waterEstimative', 'false');
      localStorage.setItem('gymApp_steps', '0');
      localStorage.setItem('gymApp_meals', '[]');
      localStorage.setItem('gymApp_registeredExercises', '[]');
      localStorage.setItem('gymApp_elapsedTime', '0');
      window.location.reload();
    }
  };


  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col w-full gap-lg pb-12"
    >
      {/* Profile Header */}
      <section className="flex flex-col items-center pt-md pb-xs">
        <div className="relative mb-md cursor-pointer group" onClick={handleImageClick}>
          <div 
            className="w-32 h-32 rounded-full overflow-hidden shadow-lg shadow-tertiary/10 ring-4 ring-surface-container-lowest relative z-10 bg-cover bg-center group-active:scale-95 transition-transform" 
            style={{ backgroundImage: `url("${profileImage}")` }}
          ></div>
          {/* Decorative accent */}
          <div 
            onClick={handleEditImageClick}
            className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-md shadow-primary/20 z-20 group-hover:scale-110 transition-transform hover:bg-primary-container hover:text-on-primary-container"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>add_photo_alternate</span>
          </div>
          {/* Background glow */}
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full translate-y-4 scale-90 z-0"></div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-xs">{userInfo.firstName} {userInfo.lastName}</h1>
      </section>

      {/* Daily Targets Summary */}
      <section className="px-2">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-md px-2">Metas Diarias</h2>
        <div className="grid grid-cols-2 gap-sm">
          {/* Calorie Goal Card */}
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-[0_10px_30px_rgba(45,90,39,0.05)] relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4"></div>
            <div>
              <div className="flex items-center gap-xs text-on-surface-variant mb-xs">
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                <span className="font-label-sm text-label-sm">Energía</span>
              </div>
              <div className="font-display-lg text-display-lg text-primary tracking-tight">
                {goals?.calories?.value || 2000}
              </div>
            </div>
            <div className="font-body-md text-body-md text-on-surface-variant mt-auto">{goals?.calories?.unit || 'kcal'} / día</div>
            {/* Tiny sparkline representation */}
            <div className="absolute bottom-4 right-4 w-12 h-6 flex items-end gap-1 opacity-40">
              <div className="w-2 bg-primary rounded-t-sm h-full"></div>
              <div className="w-2 bg-primary rounded-t-sm h-3/4"></div>
              <div className="w-2 bg-primary rounded-t-sm h-5/6"></div>
              <div className="w-2 bg-primary/30 rounded-t-sm h-2/4"></div>
            </div>
          </div>
          
          {/* Macro Goals Stack */}
          <div className="flex flex-col gap-sm">
            {/* Protein */}
            <div className="bg-surface-container-lowest p-sm rounded-xl shadow-[0_10px_30px_rgba(45,90,39,0.05)] flex items-center justify-between">
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant mb-0.5">Proteína</div>
                <div className="font-headline-md text-headline-md text-secondary">{goals?.protein?.value || 140}{goals?.protein?.unit || 'g'}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">fitness_center</span>
              </div>
            </div>
            {/* Carbs */}
            <div className="bg-surface-container-lowest p-sm rounded-xl shadow-[0_10px_30px_rgba(45,90,39,0.05)] flex items-center justify-between">
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant mb-0.5">Carbs</div>
                <div className="font-headline-md text-headline-md text-primary">{goals?.carbs?.value || 220}{goals?.carbs?.unit || 'g'}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">grain</span>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsGoalModalOpen(true)}
          className="w-full mt-sm py-3 px-4 rounded-full border border-secondary text-secondary font-label-sm text-label-sm flex items-center justify-center gap-xs active:bg-secondary/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          Ajustar Metas
        </button>
      </section>

      {/* Settings Menu */}
      <section className="px-2">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-sm px-2">Ajustes</h2>
        <div className="bg-surface-container-lowest rounded-[24px] shadow-[0_10px_30px_rgba(45,90,39,0.05)] overflow-hidden">
          {/* Preferences Section */}
          <div className="px-md py-sm">
            <h3 className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase mb-xs opacity-70">Preferencias</h3>
            <div 
              className="flex items-center justify-between py-sm cursor-pointer group active:opacity-70 transition-opacity"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                </div>
                <span className="font-body-md text-body-md text-on-surface">Notificaciones</span>
              </div>
              {/* Custom Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notificationsEnabled}
                  onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>
          </div>
          {/* Divider */}
          <div className="h-[1px] w-full bg-surface-container"></div>
          {/* End of Day Setting */}
          <div className="px-md py-sm">
            <div className="flex items-center justify-between py-sm">
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined text-[20px]">schedule</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md text-on-surface">Fin de Día</span>
                  <span className="text-[12px] text-on-surface-variant leading-tight max-w-[180px]">Hora en que se exportan y reinician los datos</span>
                </div>
              </div>
              <input 
                type="time" 
                value={endOfDayTime}
                onChange={(e) => setEndOfDayTime(e.target.value)}
                className="bg-surface-container-highest text-on-surface font-label-sm px-2 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
          {/* Manual Actions */}
          <div className="px-md py-md flex flex-col gap-sm border-t border-surface-container">
            <button 
              onClick={handleDownloadData}
              className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center gap-xs active:scale-95 transition-transform shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Descargar Datos de Hoy
            </button>
            <button 
              onClick={handleResetData}
              className="w-full py-3 px-4 rounded-xl bg-error/10 text-error font-label-sm text-label-sm flex items-center justify-center gap-xs active:bg-error/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              Reiniciar Todo (Día Nuevo)
            </button>
          </div>
        </div>
      </section>

      <GoalSettingsModal 
        isOpen={isGoalModalOpen} 
        onClose={() => setIsGoalModalOpen(false)} 
        currentGoals={goals}
        onSave={(newGoals) => setGoals(newGoals)}
      />

      <ProfileInfoModal 
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        userInfo={userInfo}
        onSave={setUserInfo}
        profileImage={profileImage}
      />
    </motion.div>
  );
}
