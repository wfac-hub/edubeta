/**
 * Este archivo define un componente reutilizable de Tarjeta (Card) y sus subcomponentes.
 * Estos componentes se utilizan para crear contenedores de contenido consistentes y estilizados
 * en toda la aplicación, siguiendo un patrón de diseño basado en tarjetas.
 */

import React from 'react';

// Define las props para los componentes de Tarjeta, que principalmente aceptan hijos y una clase CSS opcional.
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * El componente principal de Tarjeta.
 * Proporciona un contenedor estilizado con fondo, borde, esquinas redondeadas y sombra.
 * @param {React.ReactNode} children - El contenido que se renderizará dentro de la tarjeta.
 * @param {string} [className] - Clases CSS adicionales opcionales para aplicar al contenedor de la tarjeta.
 */
const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-4 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Un subcomponente para la sección de cabecera de una Tarjeta.
 * Añade un borde inferior y espaciado para separar la cabecera del contenido de la tarjeta.
 * @param {React.ReactNode} children - El contenido de la cabecera de la tarjeta (ej., un CardTitle).
 * @param {string} [className] - Clases CSS adicionales opcionales.
 */
export const CardHeader: React.FC<CardProps> = ({ children, className }) => (
    <div className={`border-b border-gray-200 dark:border-slate-700 pb-4 mb-4 ${className}`}>
        {children}
    </div>
);

/**
 * Un subcomponente para renderizar el título dentro de un CardHeader.
 * Proporciona un estilo estándar para los títulos de las tarjetas.
 * @param {React.ReactNode} children - El texto o elementos para el título.
 * @param {string} [className] - Clases CSS adicionales opcionales.
 */
export const CardTitle: React.FC<CardProps> = ({ children, className }) => (
    <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>
        {children}
    </h3>
);

/**
 * Un subcomponente para el área de contenido principal de una Tarjeta.
 * Es esencialmente un div que se puede usar para aplicar estilos específicos al bloque de contenido.
 * @param {React.ReactNode} children - El contenido principal de la tarjeta.
 * @param {string} [className] - Clases CSS adicionales opcionales.
 */
export const CardContent: React.FC<CardProps> = ({ children, className }) => (
    <div className={className}>
        {children}
    </div>
);

export default Card;