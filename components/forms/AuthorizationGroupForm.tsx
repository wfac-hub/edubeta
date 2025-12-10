

import React, { useState, useEffect } from 'react';
import { AuthorizationGroup } from '../../types';
import Button from '../ui/Button';

/**
 * Props para el componente AuthorizationGroupForm.
 */
interface AuthorizationGroupFormProps {
    /** El grupo a editar, o `null` si se está creando uno nuevo. */
    group: AuthorizationGroup | null;
    /** Función a llamar cuando se guarda el formulario. */
    onSave: (group: AuthorizationGroup) => void;
    /** Función a llamar para cerrar el modal/formulario. */
    onClose: () => void;
}

/**
 * Un formulario para crear o editar un `AuthorizationGroup`.
 * Se utiliza dentro de un modal en la página `AuthorizationGroupsPage`.
 */
// FIX: Refactoriza el componente de función de flecha a una declaración de función para mejorar la legibilidad y evitar posibles problemas con el herramental de fast-refresh, lo que podría estar causando el error de "expresión no invocable".
function AuthorizationGroupForm({ group, onSave, onClose }: AuthorizationGroupFormProps) {
    // Estado para el nombre del grupo en el formulario.
    const [name, setName] = useState('');

    /**
     * `useEffect` para inicializar el estado del formulario.
     * Si se pasa un `group` (modo edición), se establece su nombre.
     * Si no (modo creación), se limpia el campo.
     * Se ejecuta cada vez que cambia la prop `group`.
     */
    useEffect(() => {
        if (group) {
            setName(group.name);
        } else {
            setName('');
        }
    }, [group]);

    /**
     * Maneja el envío del formulario.
     * Construye el objeto `AuthorizationGroup` y llama a la función `onSave`.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const groupToSave: AuthorizationGroup = {
            id: group?.id || 0, // Si es un nuevo grupo, el ID 0 indica creación en DataContext.
            name,
        };
        onSave(groupToSave);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500"
                    required
                />
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit">{group ? 'Actualizar' : 'Crear'}</Button>
            </div>
        </form>
    );
}

export default AuthorizationGroupForm;