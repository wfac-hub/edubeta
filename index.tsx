
/**
 * Este es el punto de entrada principal para la aplicación React.
 * Importa las bibliotecas necesarias (React, ReactDOM) y el componente raíz App.
 * Luego, encuentra el elemento 'root' en el archivo index.html y renderiza el componente App dentro de él.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Encuentra el elemento raíz del DOM donde se montará la aplicación React.
// Este elemento está definido en `index.html`.
const rootElement = document.getElementById('root');

// Asegura que el elemento raíz exista antes de intentar renderizar la aplicación.
// Esta es una verificación de seguridad para prevenir errores en tiempo de ejecución si el HTML está mal configurado.
if (!rootElement) {
  throw new Error("No se pudo encontrar el elemento raíz para montar la aplicación");
}

// Crea una raíz de React, que es la forma moderna de renderizar una aplicación (Modo Concurrente).
const root = ReactDOM.createRoot(rootElement);

// Renderiza el componente principal de la aplicación (App) en la raíz.
// <React.StrictMode> es un envoltorio que ayuda a identificar problemas potenciales en una aplicación.
// Activa comprobaciones y advertencias adicionales para sus descendientes y solo se ejecuta en modo de desarrollo.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);