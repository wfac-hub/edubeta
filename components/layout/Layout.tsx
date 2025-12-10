/**
 * Este archivo define el componente principal de Layout para la aplicación.
 * El componente Layout proporciona la estructura consistente que envuelve el contenido de la mayoría de las páginas.
 * Incluye la Cabecera (Header) y la Barra Lateral (Sidebar) y gestiona la visibilidad de la barra lateral en dispositivos móviles.
 */

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * El componente principal de layout.
 * Organiza la Cabecera, la Barra Lateral y el área de contenido principal (`children`).
 * @param {object} props - Las props del componente.
 * @param {React.ReactNode} props.children - El contenido de la página que se renderizará dentro del layout principal.
 */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado para controlar la visibilidad de la barra lateral, principalmente para vistas móviles y de tableta.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // El contenedor raíz para toda la ventana gráfica.
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-slate-900">
      
      {/* 
        El componente Header, que siempre es visible en la parte superior.
        Recibe el estado de la barra lateral y una función para cambiarlo,
        permitiendo que el menú de hamburguesa dentro del Header controle la Sidebar.
      */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Un contenedor para la Sidebar y el contenido principal, dispuestos horizontalmente. */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* El componente Sidebar. Se muestra condicionalmente según el estado `sidebarOpen`. */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* 
          El área de contenido principal donde se renderizan los componentes específicos de la página (pasados como `children`).
          `flex-1` hace que ocupe el espacio horizontal restante.
          `overflow-y-auto` permite que el contenido principal se desplace verticalmente si excede la altura de la ventana.
        */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 text-gray-800 dark:text-slate-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;