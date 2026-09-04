import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

import Layout from './components/Layout';
import Nutrition from './pages/Nutrition';
import Gym from './pages/Gym';
import GymSession from './pages/GymSession';
import Routines from './pages/Routines';
import RoutineBuilder from './pages/RoutineBuilder';
import Profile from './pages/Profile';
import FoodRegistration from './pages/FoodRegistration';
import ActiveWorkout from './pages/ActiveWorkout';
import Diary from './pages/Diary';

function GlobalWatcher() {
  useEffect(() => {
    const checkEndOfDay = () => {
      try {
        if (!localStorage.getItem('gymApp_goals')) {
          localStorage.setItem('gymApp_goals', JSON.stringify({
            calories: { value: 2000, unit: 'kcal' },
            protein: { value: 140, unit: 'g' },
            carbs: { value: 220, unit: 'g' },
            water: { value: 2500, unit: 'ml' },
            gym: { value: 1.5, unit: 'horas' },
            steps: { value: 10000, unit: 'pasos' }
          }));
        }
        
        const endOfDayTimeStr = localStorage.getItem('gymApp_endOfDayTime');
        const endOfDay = endOfDayTimeStr ? JSON.parse(endOfDayTimeStr) : '23:59';
        
        const now = new Date();
        const currentHours = now.getHours().toString().padStart(2, '0');
        const currentMinutes = now.getMinutes().toString().padStart(2, '0');
        const currentTimeStr = `${currentHours}:${currentMinutes}`;
        
        const todayDateString = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
        
        let currentDay = localStorage.getItem('gymApp_currentDay');
        if (!currentDay) {
          currentDay = todayDateString;
          localStorage.setItem('gymApp_currentDay', currentDay);
        }
        const lastExportDate = localStorage.getItem('gymApp_lastExportDate');

        const doExportAndReset = async (dateLabel) => {
          const data = {
            date: dateLabel,
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
          const fileName = `GymComida_Export_${dateLabel}.json`;

          if (Capacitor.isNativePlatform()) {
            try {
              await Filesystem.writeFile({
                path: `GymComida/${fileName}`,
                data: jsonString,
                directory: Directory.Documents,
                encoding: Encoding.UTF8,
                recursive: true
              });
            } catch (e) {
              console.error('Error saving file natively', e);
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

          localStorage.setItem('gymApp_water', '0');
          localStorage.setItem('gymApp_steps', '0');
          localStorage.setItem('gymApp_meals', '[]');
          localStorage.setItem('gymApp_registeredExercises', '[]');
          localStorage.setItem('gymApp_elapsedTime', '0');
          localStorage.removeItem('gymApp_wellness');
          
          localStorage.setItem('gymApp_lastExportDate', dateLabel);
        };

        let needsReload = false;

        if (todayDateString !== currentDay) {
          if (lastExportDate !== currentDay) {
            doExportAndReset(currentDay);
            needsReload = true;
          }
          localStorage.setItem('gymApp_currentDay', todayDateString);
        } else if (currentTimeStr >= endOfDay && lastExportDate !== todayDateString) {
          doExportAndReset(todayDateString);
          needsReload = true;
        }

        if (needsReload) {
          window.location.reload();
        }
      } catch (e) {
        console.error('Error in GlobalWatcher', e);
      }
    };

    checkEndOfDay();
    const interval = setInterval(checkEndOfDay, 60000);
    return () => clearInterval(interval);
  }, []);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Nutrition />} />
          <Route path="gym" element={<Gym />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/log-food" element={<FoodRegistration />} />
        <Route path="/gym/improvisar" element={<GymSession />} />
        <Route path="/routines" element={<Routines />} />
        <Route path="/routines/new" element={<RoutineBuilder />} />
        <Route path="/active-routine" element={<ActiveWorkout />} />
        <Route path="/diary" element={<Diary />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalWatcher />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
