import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileInfoModal({ isOpen, onClose, userInfo, onSave, profileImage }) {
  const [isEditing, setIsEditing] = useState(false);
  const [localInfo, setLocalInfo] = useState(userInfo);

  useEffect(() => {
    setLocalInfo(userInfo);
    if (isOpen) {
      setIsEditing(false);
    }
  }, [userInfo, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setLocalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(localInfo);
    setIsEditing(false);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-inverse-surface/80 backdrop-blur-md flex flex-col justify-end sm:justify-center sm:p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface-container-lowest w-full sm:max-w-md sm:rounded-[32px] rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
        >
          {/* Header Image Area */}
          <div className="relative w-full h-64 sm:h-72 bg-surface-container shrink-0">
            <div 
              className="absolute inset-0 bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url("${profileImage}")` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-transparent"></div>
            
            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest/50 backdrop-blur-md text-on-surface active:bg-surface-container transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            {/* Edit/Save Button */}
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)} 
                className="absolute top-4 left-4 py-2 px-4 rounded-full bg-primary/90 backdrop-blur-md text-on-primary font-label-md flex items-center gap-2 active:bg-primary transition-colors shadow-lg"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Editar Info
              </button>
            ) : (
              <button 
                onClick={handleSave} 
                className="absolute top-4 left-4 py-2 px-4 rounded-full bg-secondary/90 backdrop-blur-md text-on-secondary font-label-md flex items-center gap-2 active:bg-secondary transition-colors shadow-lg"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                Guardar
              </button>
            )}
          </div>

          {/* Info Content Area */}
          <div className="flex flex-col px-6 pb-8 -mt-16 relative z-10 overflow-y-auto">
            
            {/* Name section */}
            <div className="flex flex-col items-center mb-8">
              {isEditing ? (
                <div className="flex gap-2 w-full max-w-[280px]">
                  <input 
                    type="text" 
                    value={localInfo.firstName || ''}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="Nombre"
                    className="flex-1 bg-surface-container py-2 px-4 rounded-xl font-headline-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-center w-1/2"
                  />
                  <input 
                    type="text" 
                    value={localInfo.lastName || ''}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Apellido"
                    className="flex-1 bg-surface-container py-2 px-4 rounded-xl font-headline-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-center w-1/2"
                  />
                </div>
              ) : (
                <h2 className="font-display-sm text-display-sm text-on-surface text-center shadow-sm drop-shadow-md bg-surface-container-lowest/40 px-6 py-2 rounded-2xl backdrop-blur-md">
                  {localInfo.firstName} {localInfo.lastName}
                </h2>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Age */}
              <MetricCard 
                icon="cake" 
                label="Edad" 
                value={localInfo.age} 
                unit="años" 
                field="age"
                isEditing={isEditing}
                onChange={handleChange}
                colorClass="text-tertiary bg-tertiary/10 ring-tertiary/20"
              />
              
              {/* Weight */}
              <MetricCard 
                icon="scale" 
                label="Peso" 
                value={localInfo.weight} 
                unit="kg" 
                field="weight"
                isEditing={isEditing}
                onChange={handleChange}
                colorClass="text-primary bg-primary/10 ring-primary/20"
              />

              {/* Height */}
              <MetricCard 
                icon="height" 
                label="Altura" 
                value={localInfo.height} 
                unit="cm" 
                field="height"
                isEditing={isEditing}
                onChange={handleChange}
                colorClass="text-secondary bg-secondary/10 ring-secondary/20"
              />

              {/* Hips */}
              <MetricCard 
                icon="accessibility_new" 
                label="Cadera" 
                value={localInfo.hips} 
                unit="cm" 
                field="hips"
                isEditing={isEditing}
                onChange={handleChange}
                colorClass="text-error bg-error/10 ring-error/20"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function MetricCard({ icon, label, value, unit, field, isEditing, onChange, colorClass }) {
  return (
    <div className={`p-4 rounded-2xl ring-1 shadow-sm flex flex-col items-center gap-2 ${colorClass}`}>
      <span className="material-symbols-outlined text-[24px] mb-1 opacity-80">{icon}</span>
      <span className="font-label-sm text-label-sm uppercase tracking-wider opacity-70">{label}</span>
      
      {isEditing ? (
        <div className="flex items-center gap-1">
          <input 
            type="number" 
            value={value || ''}
            onChange={(e) => onChange(field, e.target.value)}
            className="w-16 bg-surface-container-lowest/50 py-1 px-2 rounded-lg font-headline-sm text-center focus:outline-none focus:ring-1 focus:ring-current text-current"
          />
          <span className="font-body-sm text-body-sm opacity-80">{unit}</span>
        </div>
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="font-headline-sm text-headline-sm">{value || '--'}</span>
          <span className="font-body-sm text-body-sm opacity-80">{unit}</span>
        </div>
      )}
    </div>
  );
}
