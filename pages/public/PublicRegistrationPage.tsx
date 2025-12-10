
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

/**
 * PublicRegistrationPage (Desactivada temporalmente)
 * Se ha reemplazado el contenido complejo por un placeholder para evitar errores de compilación
 * y conflictos de tipos mientras se refactoriza.
 */
const PublicRegistrationPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900">
            <div className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md text-center max-w-md border border-gray-200 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Página en Mantenimiento</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    El sistema de inscripción pública se encuentra actualmente deshabilitado para realizar tareas de mantenimiento y actualización de la base de datos.
                </p>
                <div className="flex justify-center">
                    <Button onClick={() => navigate('/login')}>Volver al inicio</Button>
                </div>
            </div>
        </div>
    );
};

export default PublicRegistrationPage;
