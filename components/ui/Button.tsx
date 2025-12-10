/**
 * Este archivo define un componente de Botón reutilizable y altamente personalizable.
 * Estandariza la apariencia de los botones en toda la aplicación y admite
 * diferentes variantes visuales, tamaños y la inclusión de iconos.
 */

import React from 'react';

/**
 * Define las props para el componente Button.
 * Extiende los atributos estándar de un botón HTML para permitir todas las propiedades nativas como `onClick`, `disabled`, etc.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** El contenido que se mostrará dentro del botón. Puede ser texto u otros elementos de React. Opcional para permitir botones solo con icono. */
  children?: React.ReactNode;
  /** El estilo visual del botón. Por defecto es 'primary'. */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** El tamaño del botón, que afecta al padding y al tamaño de la fuente. Por defecto es 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Un nodo de React opcional (normalmente un icono) para mostrar a la izquierda del contenido del botón. */
  leftIcon?: React.ReactNode;
  /** Un nodo de React opcional (normalmente un icono) para mostrar a la derecha del contenido del botón. */
  rightIcon?: React.ReactNode;
}

/**
 * Un componente de botón estilizado y reutilizable.
 * Construye sus clases CSS dinámicamente en función de las props `variant` y `size`.
 * @param {object} props - Las props del componente.
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  ...props // Recoge cualquier otro atributo estándar de un botón.
}) => {
  // Clases base que se aplican a todas las variantes de botones.
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  // Objeto que mapea las variantes a sus correspondientes clases de Tailwind CSS.
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 focus:ring-primary-500',
  };

  // Objeto que mapea los tamaños a sus correspondientes clases de Tailwind CSS.
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // Determina el margen para un icono si también hay `children` (contenido de texto).
  const iconSpacing = children ? (leftIcon ? 'mr-2' : rightIcon ? 'ml-2' : '') : '';

  return (
    <button
      // Combina todas las clases: base, específicas de la variante, específicas del tamaño y cualquier clase personalizada pasada.
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      // Propaga el resto de las props (ej., `onClick`, `disabled`) al elemento del botón.
      {...props}
    >
      {leftIcon && <span className={iconSpacing}>{leftIcon}</span>}
      {children}
      {rightIcon && <span className={iconSpacing}>{rightIcon}</span>}
    </button>
  );
};

export default Button;