/**
 * Este archivo define el ThemeContext para gestionar el tema de la aplicación (claro/oscuro).
 * Proporciona un componente `ThemeProvider` para envolver la aplicación y un hook `useTheme`
 * para que los componentes puedan acceder y controlar el estado del tema.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

// Define los posibles valores del tema.
type Theme = 'light' | 'dark';

// Define la forma de los datos del contexto que se proporcionarán a los consumidores.
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Crea el contexto con un valor inicial de `undefined`.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * El componente ThemeProvider es responsable de gestionar el estado del tema.
 * Lee la preferencia del usuario desde localStorage o la configuración de su sistema,
 * aplica el tema al elemento raíz HTML y proporciona el estado del tema y
 * una función para cambiarlo a sus hijos.
 * @param {object} props - Las props del componente.
 * @param {React.ReactNode} props.children - Los componentes hijos que tendrán acceso al contexto del tema.
 */
// Fix: Changed ThemeProvider to be a React.FC to ensure type consistency with other providers.
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado para el tema actual. Se inicializa de forma diferida desde localStorage o la preferencia del sistema.
  const [theme, setTheme] = useState<Theme>(() => {
    // Esta función solo se ejecuta en el renderizado inicial.
    if (typeof window !== 'undefined' && window.localStorage) {
        // 1. Comprueba si hay una preferencia de tema almacenada en localStorage.
        const storedPrefs = window.localStorage.getItem('theme');
        if (storedPrefs === 'dark' || storedPrefs === 'light') {
            return storedPrefs;
        }
        // 2. Si no hay preferencia almacenada, comprueba la preferencia del sistema operativo/navegador del usuario.
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
    }
    // 3. Por defecto, se establece 'light' si no se encuentra ninguna otra preferencia.
    return 'light';
  });

  // Efecto para aplicar los cambios de tema al DOM y persistirlos.
  useEffect(() => {
    const root = window.document.documentElement;
    // Elimina cualquier clase de tema existente para evitar conflictos.
    root.classList.remove('light', 'dark');
    // Añade la clase del tema actual al elemento <html>.
    // Tailwind CSS utiliza esta clase (ej., `.dark`) para los estilos del modo oscuro.
    root.classList.add(theme);
    // Almacena la preferencia del usuario en localStorage para futuras visitas.
    localStorage.setItem('theme', theme);
  }, [theme]); // Este efecto se vuelve a ejecutar cada vez que cambia el estado `theme`.

  /**
   * Cambia el tema entre 'light' y 'dark'.
   */
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Proporciona el estado del tema y la función de cambio a todos los componentes descendientes.
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Un hook personalizado para acceder al contexto del tema.
 * Proporciona una forma conveniente para que los componentes obtengan el tema actual y la función de cambio.
 * @returns {ThemeContextType} El valor del contexto del tema.
 * @throws {Error} Si se usa fuera de un `ThemeProvider`.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};