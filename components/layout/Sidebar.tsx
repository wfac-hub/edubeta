
/**
 * Este archivo define el componente Sidebar.
 * Renderiza el menú de navegación principal de la aplicación. Los elementos del menú se generan dinámicamente
 * a partir de la constante `SIDENAV_ITEMS` y se filtran según el rol del usuario actual.
 * También maneja el comportamiento responsive, apareciendo como una superposición en móviles y un panel estático en escritorio.
 */

import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { SIDENAV_ITEMS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { ChevronDown, X } from 'lucide-react';
import { SideNavItem, SubMenuItem, Role } from '../../types';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

/**
 * Un subcomponente que renderiza un único elemento del menú de la barra lateral.
 * Maneja tanto enlaces normales como submenús colapsables.
 * @param {SideNavItem} item - Los datos del elemento de navegación.
 * @param {() => void} closeSidebar - Una función para cerrar la barra lateral (usada en móviles cuando se hace clic en un enlace).
 */
const SidebarMenuItem: React.FC<{ item: SideNavItem; closeSidebar: () => void; }> = ({ item, closeSidebar }) => {
    const { pathname } = useLocation();
    const { user } = useAuth();
    const { wikiPermissions } = useData();
    const [isSubmenuOpen, setSubmenuOpen] = useState(false);

    // Filtrar submenú por rol y permisos específicos
    const visibleSubmenu = item.submenu?.filter(sub => {
        // 1. Filtro básico por Rol
        if (sub.roles && user && !sub.roles.includes(user.role)) {
            return false;
        }

        // 2. Filtro específico para el Editor de Wiki (Solo mostrar si tiene permisos de edición)
        if (sub.path === '/wiki/editor' && user?.role === Role.TEACHER) {
             const hasEditPermission = wikiPermissions.some(p => p.teacherId === user.id && p.canEdit);
             return hasEditPermission;
        }

        return true;
    }) as SubMenuItem[] | undefined;


    // Determina si el elemento del menú padre debe resaltarse como activo porque una ruta hija está activa.
    const isParentActive = visibleSubmenu ? visibleSubmenu.some(sub => pathname.startsWith(sub.path)) : false;

    const toggleSubmenu = () => {
        setSubmenuOpen(!isSubmenuOpen);
    }
    
    // Efecto para abrir automáticamente el submenú si uno de sus hijos es la página activa.
    useEffect(() => {
        if(isParentActive) {
            setSubmenuOpen(true);
        }
    }, [pathname, item.path, isParentActive]);

    // Si el elemento tiene un submenú (y tiene items visibles), renderízalo como una sección colapsable.
    if(item.submenu && visibleSubmenu && visibleSubmenu.length > 0) {
        return (
            <li>
                <button
                    onClick={toggleSubmenu}
                    className={`group relative flex w-full items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-slate-700 dark:text-slate-300 duration-300 ease-in-out hover:bg-slate-100 dark:hover:bg-slate-700 ${
                        // Resaltar si la ruta principal está activa O una ruta hija está activa.
                        (pathname.includes(item.path) || isParentActive) && 'bg-primary-600 text-white'
                    }`}
                >
                    {item.icon}
                    {item.title}
                    <ChevronDown size={16} className={`absolute right-4 transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {/* El contenido del submenú, que se expande/contrae con una transición de max-height. */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-slate-50 dark:bg-gray-700/50 ${isSubmenuOpen ? 'max-h-[50rem]' : 'max-h-0'}`}>
                    <ul className="mt-2 flex flex-col gap-2 p-2.5 pl-6">
                        {visibleSubmenu.map((subItem) => (
                             <li key={subItem.path}>
                                <NavLink
                                    to={subItem.path}
                                    onClick={closeSidebar} // Cierra la barra lateral en móvil después de la navegación.
                                    className={({ isActive }) =>
                                    `group relative flex items-center gap-2.5 rounded-md px-4 py-2 font-medium text-slate-600 dark:text-slate-400 duration-300 ease-in-out hover:text-primary-600 dark:hover:text-primary-400 ${
                                        isActive && '!text-primary-600 dark:!text-primary-400 font-semibold'
                                    }`
                                    }
                                >
                                    {subItem.icon && <span className="text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400">{subItem.icon}</span>}
                                    {subItem.title}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </li>
        )
    }

    // Si es un elemento de menú normal (sin submenú o submenú vacío), renderiza un simple NavLink.
    // Nota: Si tenía submenú pero quedó vacío por filtros, se renderizará como enlace principal a item.path.
    // Esto es útil si el padre es navegable (ej. /wiki), pero si no lo es, podría ser confuso.
    // En este caso '/wiki' redirige a '/wiki/home', así que funciona bien.
    return (
         <li>
            <NavLink
            to={item.path}
            onClick={closeSidebar}
            className={({ isActive }) =>
                `group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-slate-700 dark:text-slate-300 duration-300 ease-in-out hover:bg-slate-100 dark:hover:bg-slate-700 ${
                isActive && 'bg-primary-600 text-white'
                }`
            }
            >
            {item.icon}
            {item.title}
            </NavLink>
        </li>
    )
}

/**
 * El componente principal de la Sidebar.
 * Gestiona su propio estado de visibilidad y renderiza la lista de `SidebarMenuItem`s.
 * @param {boolean} sidebarOpen - Indica si la barra lateral debe ser visible (controlado por Layout).
 * @param {(open: boolean) => void} setSidebarOpen - Función para actualizar la visibilidad de la barra lateral.
 */
const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth(); // Obtiene el usuario actual para filtrar los elementos del menú por rol.

  const trigger = useRef<any>(null); // Ref para el botón de hamburguesa (no está en este componente, pero se usa para la lógica de clic fuera).
  const sidebar = useRef<any>(null); // Ref para el elemento de la barra lateral.

  // Efecto para manejar el cierre de la barra lateral al hacer clic fuera de ella en móvil.
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [sidebarOpen, setSidebarOpen]);

  // Efecto para manejar el cierre de la barra lateral al presionar la tecla 'Escape'.
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [sidebarOpen, setSidebarOpen]);
  
  /**
   * Cierra la barra lateral si está abierta. Se pasa a los elementos del menú
   * para asegurar que la barra lateral se cierre después de la navegación en móvil.
   */
  const closeSidebar = () => {
      if(sidebarOpen) {
          setSidebarOpen(false);
      }
  }

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-50 flex h-full w-72 flex-col overflow-y-hidden border-r border-gray-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 duration-300 ease-linear lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Botón de cierre para la vista móvil */}
      <div className="flex items-center justify-end px-4 pt-2 lg:hidden">
          <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          >
              <X size={24} />
          </button>
      </div>
      
      {/* Contenedor desplazable para el menú de navegación */}
      <div className="custom-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="py-4 px-4 lg:px-6">
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Menu</h3>
            <ul className="mb-6 flex flex-col gap-1.5">
              {/* Filtra SIDENAV_ITEMS según el rol del usuario actual antes de mapearlos */}
              {SIDENAV_ITEMS.filter(item => user && item.roles.includes(user.role)).map((item) => (
                <SidebarMenuItem key={item.path} item={item} closeSidebar={closeSidebar} />
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
