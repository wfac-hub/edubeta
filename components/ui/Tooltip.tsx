
import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Props para el componente Tooltip.
 */
interface TooltipProps {
  /** El contenido que se mostrará dentro del tooltip. */
  content: React.ReactNode;
  /** El elemento que activará el tooltip al hacer clic. */
  children?: React.ReactNode;
  /** Clases CSS adicionales para el contenedor principal. */
  className?: string;
}

/**
 * Un componente de Tooltip (información emergente) que se activa al hacer clic.
 * Muestra `content` en un cuadro flotante cuando se hace clic en `children`.
 * Se cierra al hacer clic de nuevo en el activador o al hacer clic fuera del tooltip.
 */
function Tooltip({ content, children, className }: TooltipProps) {
  // Estado para controlar si el tooltip está visible.
  const [isOpen, setIsOpen] = useState(false);
  // Ref para el contenedor principal del tooltip para detectar clics fuera de él.
  const wrapperRef = useRef<HTMLDivElement>(null);

  /**
   * Cambia el estado de visibilidad del tooltip.
   * `useCallback` se usa para memorizar la función y evitar recreaciones innecesarias.
   */
  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  /**
   * `useEffect` para manejar el cierre del tooltip al hacer clic fuera de él.
   * Añade un event listener al documento cuando el tooltip se abre y lo elimina cuando se cierra.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Si el clic ocurre fuera del `wrapperRef`, cierra el tooltip.
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    
    // Función de limpieza para eliminar el listener cuando el componente se desmonta.
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className={`relative inline-flex items-center ${className}`}>
      {/* El elemento hijo que actúa como activador del tooltip. */}
      <div onClick={handleToggle}>
        {children}
      </div>
      {/* El contenido del tooltip, se renderiza condicionalmente. */}
      {isOpen && (
        <div 
          className="absolute z-50 min-w-max p-3 text-sm font-normal text-gray-700 bg-white border border-gray-200 rounded-lg shadow-xl -top-2 left-1/2 -translate-x-1/2 -translate-y-full dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
          style={{ transform: 'translate(-50%, -100%)', marginBottom: '8px' }}
        >
          {/* Pequeño triángulo (flecha) que apunta al activador. */}
          <div className="absolute w-3 h-3 bg-white border-b border-r border-gray-200 rotate-45 -bottom-[7px] left-1/2 -translate-x-1/2 dark:bg-slate-700 dark:border-slate-600"></div>
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
