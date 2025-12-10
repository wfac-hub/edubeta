/**
 * Este archivo define un componente de Input reutilizable y estilizado.
 * Estandariza la apariencia de los campos de texto en toda la aplicación e
 * incluye características como etiquetas, iconos y visualización de mensajes de error.
 */

import React from 'react';

/**
 * Define las props para el componente Input.
 * Extiende los atributos estándar de un input HTML para permitir todas las propiedades nativas.
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Una etiqueta opcional para mostrar encima del campo de entrada. */
  label?: string;
  /** Un icono opcional para mostrar dentro del campo de entrada a la izquierda. */
  icon?: React.ReactNode;
  /** Un mensaje de error opcional para mostrar debajo del campo de entrada. */
  error?: string;
}

/**
 * Un componente de campo de entrada estilizado y reutilizable.
 * Admite una etiqueta opcional, un icono dentro del campo y muestra un mensaje de error.
 * El componente maneja estilos responsivos y atributos de accesibilidad como `htmlFor`.
 * @param {string} [label] - Texto para la etiqueta asociada con el input.
 * @param {React.ReactNode} [icon] - Un nodo de React (típicamente un componente de icono) para mostrar dentro del input.
 * @param {string} [error] - Una cadena con el mensaje de error. Si se proporciona, el borde del input se volverá rojo.
 * @param {string} [id] - El ID para el input, utilizado para vincular la etiqueta correctamente.
 * @param {object} ...props - Cualquier otro atributo estándar de un input HTML (ej., `type`, `placeholder`, `onChange`).
 */
const Input: React.FC<InputProps> = ({ label, icon, error, id, ...props }) => {
  const hasIcon = icon !== undefined;
  return (
    <div>
      {/* Renderiza la etiqueta si se proporciona */}
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {/* Renderiza el contenedor del icono si se proporciona un icono */}
        {hasIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {icon}
          </div>
        )}
        <input
          id={id}
          // Aplica dinámicamente clases CSS basadas en las props
          className={`
            block w-full rounded-md 
            border-gray-300 dark:border-slate-600 
            bg-white dark:bg-slate-900 
            text-gray-900 dark:text-slate-200 
            focus:border-primary-500 focus:ring-primary-500 
            sm:text-sm 
            ${hasIcon ? 'pl-10' : 'pl-3'} 
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          `}
          {...props}
        />
      </div>
      {/* Renderiza el mensaje de error si se proporciona */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;