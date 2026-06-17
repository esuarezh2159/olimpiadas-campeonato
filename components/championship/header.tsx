'use client';

import { useEffect, useState } from 'react';

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: 'dashboard' | 'disciplinas' | 'series' | 'equipos' | 'fechas' | 'partidos' | 'posiciones' | 'estadios' | 'eliminatorias' | 'usuarios') => void;
  onCalendarClick: () => void;
}

export function Header({ activeSection, onSectionChange, onCalendarClick }: HeaderProps) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Obtener información del usuario del localStorage
    const userData = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.rol || 'viewer');
        setUserName(user.usuario || 'Usuario');
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Definir opciones por rol
  const allOptions = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'disciplinas', label: 'Disciplinas' },
    { id: 'series', label: 'Series' },
    { id: 'equipos', label: 'Equipos' },
    { id: 'fechas', label: 'Fechas' },
    { id: 'partidos', label: 'Partidos' },
    { id: 'posiciones', label: 'Posiciones' },
    { id: 'estadios', label: 'Sitios' },
    { id: 'eliminatorias', label: 'Eliminatorias' },
    { id: 'usuarios', label: 'Usuarios' },
  ];

  // Filtrar opciones según rol
  const getVisibleOptions = () => {
    if (userRole === 'admin') {
      return allOptions;
    } else if (userRole === 'viewer') {
      // Viewer solo puede ver Dashboard y Posiciones
      return allOptions.filter(opt => ['dashboard', 'posiciones'].includes(opt.id));
    }
    return allOptions; // Default a todas las opciones
  };

  const visibleOptions = getVisibleOptions();

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center shadow-md overflow-hidden">
              <img
                src="/logo.jpeg"
                alt="Logo Olimpiadas Deportivas"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Olimpiadas Deportivas</h1>
              <p className="text-slate-300 text-sm">Sistema de gestión integral</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {userName && (
              <div className="text-right">
                <p className="text-sm text-slate-300">Bienvenido</p>
                <p className="font-medium">{userName}</p>
                <p className="text-xs text-slate-400 capitalize">({userRole})</p>
              </div>
            )}
            {userRole === 'admin' && (
              <button
                onClick={onCalendarClick}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-4 py-2 rounded-lg transition shadow-md whitespace-nowrap"
                title="Programar calendario del campeonato"
              >
                📅 Programar Calendario
              </button>
            )}
          </div>
        </div>

        <nav className="flex gap-2 flex-wrap">
          {visibleOptions.map(item => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeSection === item.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
