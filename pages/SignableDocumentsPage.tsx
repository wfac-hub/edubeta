


import React from 'react';
import Button from '../components/ui/Button';
import { Plus, Copy, Trash2 } from 'lucide-react';

/**
 * Página para la gestión de "Documentos Firmables".
 * NOTA: Esta página es actualmente un marcador de posición (placeholder) y no tiene funcionalidad implementada.
 * En una futura versión, permitiría a los administradores crear y gestionar plantillas de documentos
 * personalizadas que los alumnos o tutores pueden firmar digitalmente, además de las autorizaciones estándar.
 */
// FIX: Refactoriza el componente de función de flecha a una declaración de función para mejorar la legibilidad y evitar posibles problemas con el herramental de fast-refresh, lo que podría estar causando el error de "expresión no invocable".
function SignableDocumentsPage() {
    return (
        <div className="space-y-6">
             <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Documentos firmables</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Redacta como documentos firmables los textos legales que necesites que te firmen los alumnos, excepto las "Condiciones legales" y de "Protección de datos", que puedes redactar en el menú "Config. textos".
                    </p>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">0 Resultados</span>
                </div>
            </div>
            {/* Panel de acciones (actualmente deshabilitadas o sin funcionalidad) */}
             <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />}>Alta</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Copy size={16} />}>Duplicar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />}>Borrar</Button>
                </div>
            </div>
            {/* Contenido principal que indica que no hay datos */}
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 text-center">
                 <p className="text-gray-500">No hay documentos firmables.</p>
            </div>
             <div className="flex justify-end items-center text-sm text-gray-500">
                0 Resultados
            </div>
        </div>
    );
}

export default SignableDocumentsPage;