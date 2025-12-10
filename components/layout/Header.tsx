
/**
 * Este archivo define el componente Header para la aplicación.
 * El Header es una barra fija en la parte superior de la página que contiene el logo,
 * un menú de hamburguesa para móviles, un interruptor de tema, un icono de notificaciones y un menú desplegable de perfil de usuario.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Menu, Sun, Moon, Bell, ChevronDown, LogOut, User as UserIcon, Rocket, Database, Cake, Link as LinkIcon, CheckCircle, AlertCircle, Loader, Settings } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { checkBirthdayVisibility } from '../../utils/helpers';
import BirthdayIcon from '../ui/BirthdayIcon';
import { Role } from '../../types';
import { createClient } from '@supabase/supabase-js';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

/**
 * El componente principal del Header.
 * @param {boolean} sidebarOpen - El estado actual de la barra lateral.
 * @param {(open: boolean) => void} setSidebarOpen - Función para cambiar la visibilidad de la barra lateral.
 */
const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { todayBirthdays, academyProfile, dbConfig, updateDbConfig } = useData();
  const navigate = useNavigate();
  
  // Estado para la visibilidad del menú desplegable del perfil de usuario y notificaciones.
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  
  // Estado de conexión Supabase
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const userDropdownRef = useRef<any>(null);
  const notificationDropdownRef = useRef<any>(null);
  const userTrigger = useRef<any>(null);
  const notificationTrigger = useRef<any>(null);

  // Calculate visible birthdays based on permissions
  const canSeeBirthdays = checkBirthdayVisibility(user?.role, academyProfile);
  const visibleBirthdays = canSeeBirthdays ? todayBirthdays : [];
  const hasNotifications = visibleBirthdays.length > 0;

  // Check if Supabase is configured properly (not default placeholder)
  const isSupabaseConfigured = dbConfig.supabaseConfig?.url && 
                               dbConfig.supabaseConfig?.anonKey && 
                               !dbConfig.supabaseConfig.url.includes('xyz.supabase.co');

  // Efecto para cerrar los desplegables al hacer clic fuera.
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(target) &&
        !userTrigger.current.contains(target)
      ) {
        setDropdownOpen(false);
      }
      
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(target) &&
        !notificationTrigger.current.contains(target)
      ) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, []);
  
  // Limpiar mensaje de estado después de unos segundos
  useEffect(() => {
    if (connectionStatus !== 'idle') {
        const timer = setTimeout(() => {
            setConnectionStatus('idle');
            setStatusMessage('');
        }, 4000);
        return () => clearTimeout(timer);
    }
  }, [connectionStatus]);

  /**
   * Maneja el proceso de cierre de sesión: llama a la función logout del AuthContext
   * y redirige al usuario a la página de login.
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * Alterna rápidamente entre proveedores de datos (Local/Supabase) para desarrollo.
   */
  const toggleProvider = () => {
      const newProvider = dbConfig.provider === 'local' ? 'supabase' : 'local';
      updateDbConfig({ ...dbConfig, provider: newProvider });
  };
  
  const handleConnectToSupabase = async () => {
      if (!isSupabaseConfigured) {
          navigate('/admin/database'); // Si no hay config, redirige a config
          return;
      }

      setIsConnecting(true);
      setConnectionStatus('idle');

      try {
          // Intento de conexión en segundo plano
          const sb = dbConfig.supabaseConfig!;
          const supabase = createClient(sb.url, sb.anonKey);
          const { error } = await supabase.from('users').select('id', { count: 'exact', head: true });
          
          if (error && error.code !== '42P01' && error.code !== 'PGRST116') {
               throw error;
          }

          // Éxito
          setConnectionStatus('success');
          setStatusMessage('¡Conectado!');
          updateDbConfig({ ...dbConfig, provider: 'supabase' }); // Esto dispara la recarga de datos globalmente

      } catch (error: any) {
          console.error("Error conectando:", error);
          setConnectionStatus('error');
          setStatusMessage('Error al conectar');
      } finally {
          setIsConnecting(false);
      }
  };

  return (
    <header className="sticky top-0 z-40 flex w-full bg-primary-950 dark:bg-gray-800 border-b border-primary-900 dark:border-gray-700">
      <div className="relative flex flex-grow items-center justify-between py-2 px-4 md:px-6 2xl:px-11">
        
        {/* === Lado izquierdo de la cabecera === */}
        <div className="flex items-center gap-4">
          {/* Botón de menú de hamburguesa (visible solo en pantallas pequeñas) */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="z-50 block rounded-sm p-1.5 lg:hidden"
          >
            <Menu className="text-white dark:text-gray-300" />
          </button>
          
          {/* Logo y título (visible solo en pantallas grandes) */}
          <div className="hidden lg:flex items-center gap-2">
            <Rocket className="text-primary-400" size={32} />
            <h1 className="text-2xl font-bold text-white">EduBeta</h1>
          </div>
        </div>

        {/* === Logo centrado (visible solo en pantallas pequeñas) === */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:hidden">
          <div className="flex items-center gap-2">
            <Rocket className="text-primary-400" size={28} />
            <h1 className="text-xl font-bold text-white">EduBeta</h1>
          </div>
        </div>

        {/* === Lado derecho de la cabecera === */}
        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            
            {/* Indicador de estado de Base de Datos (Solo Admin) */}
            {user?.role === Role.ADMIN && (
                <li>
                    {dbConfig.provider === 'supabase' ? (
                         // MODO SUPABASE: Toggle para volver a local
                         <button 
                            onClick={toggleProvider}
                            title="Click para cambiar a modo Local"
                            className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer active:scale-95 bg-emerald-900/50 text-emerald-400 border-emerald-700 hover:bg-emerald-900"
                        >
                            <Database size={12} />
                            <span>Supabase</span>
                        </button>
                    ) : (
                        // MODO LOCAL: Botón de conectar
                        <div className="flex items-center gap-2">
                            {isSupabaseConfigured ? (
                                <button 
                                    onClick={handleConnectToSupabase}
                                    disabled={isConnecting}
                                    className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-all active:scale-95 
                                        ${connectionStatus === 'error' 
                                            ? 'bg-red-900/50 border-red-700 text-red-300' 
                                            : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700'}`}
                                >
                                    {isConnecting ? <Loader size={12} className="animate-spin"/> : <LinkIcon size={12} />}
                                    <span>{statusMessage || 'Conectar a Supabase'}</span>
                                </button>
                            ) : (
                                <button 
                                    onClick={() => navigate('/admin/database')}
                                    className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
                                >
                                    <Settings size={12} />
                                    <span>Configurar Supabase</span>
                                </button>
                            )}
                        </div>
                    )}
                </li>
            )}

            {/* Botón para cambiar el tema */}
            <li>
              <button onClick={toggleTheme} className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10 dark:text-gray-300 dark:hover:bg-gray-700">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </li>
            
            {/* Botón de notificaciones */}
            <li className="relative">
               {hasNotifications && (
                  <span className="absolute -top-0.5 right-0 z-10 h-2 w-2 rounded-full bg-red-500">
                    <span className="absolute -z-10 inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                  </span>
               )}
              <button 
                ref={notificationTrigger}
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Bell size={20} />
              </button>

               {/* Notification Dropdown */}
               {notificationOpen && (
                  <div 
                    ref={notificationDropdownRef}
                    className="absolute right-0 mt-12 w-72 rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 shadow-lg z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                      <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">Notificaciones</h5>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                       {visibleBirthdays.length > 0 && (
                          <div className="px-4 py-2">
                             <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Cumpleaños hoy</p>
                             <ul className="space-y-2">
                                {visibleBirthdays.map(s => (
                                   <li key={s.id} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                      <BirthdayIcon size={20} />
                                      <span>{s.firstName} {s.lastName}</span>
                                   </li>
                                ))}
                             </ul>
                          </div>
                       )}
                       {!hasNotifications && (
                          <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                             No tienes notificaciones nuevas.
                          </div>
                       )}
                    </div>
                  </div>
               )}
            </li>
          </ul>

          {/* Menú desplegable del perfil de usuario */}
          <div className="relative">
            <button
              ref={userTrigger}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-4"
            >
              <span className="hidden text-right lg:block">
                <span className="block text-sm font-medium text-white">{user?.name}</span>
                <span className="block text-xs text-gray-300 dark:text-gray-400">{user?.role}</span>
              </span>
              <img src={user?.avatar} alt={user?.name} className="h-10 w-10 rounded-full object-cover" />
              <ChevronDown size={20} className="hidden fill-current sm:block text-white dark:text-gray-300" />
            </button>

            {/* Contenido del menú desplegable */}
            {dropdownOpen && (
              <div
                ref={userDropdownRef}
                className="absolute right-0 mt-4 flex w-60 flex-col rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 shadow-lg"
              >
                <ul className="flex flex-col gap-2 border-b border-gray-200 dark:border-slate-700 p-4">
                  <li>
                    <RouterLink to="/profile" className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary-500 text-gray-700 dark:text-gray-200 dark:hover:text-primary-400">
                      <UserIcon size={18} /> Mi Perfil
                    </RouterLink>
                  </li>
                </ul>
                <button onClick={handleLogout} className="flex items-center gap-3.5 py-4 px-6 text-sm font-medium duration-300 ease-in-out hover:text-primary-500 text-gray-700 dark:text-gray-200 dark:hover:text-primary-400">
                  <LogOut size={18} /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;