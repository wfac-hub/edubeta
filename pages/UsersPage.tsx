


import React from 'react';
// Importa explícitamente el tipo `Column` para un tipado más estricto.
import Table, { Column } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { User } from '../types';
import { useData } from '../contexts/DataContext';
import { Edit, Trash, PlusCircle } from 'lucide-react';

/**
 * Página para la gestión de usuarios del sistema (Administradores, Coordinadores, etc.).
 * Muestra una lista de todos los usuarios utilizando el componente genérico `Table`.
 */
// FIX: Refactoriza el componente de función de flecha a una declaración de función para mejorar la legibilidad y evitar posibles problemas con el herramental de fast-refresh, lo que podría estar causando el error de "expresión no invocable".
function UsersPage() {
    const { users } = useData();
    
    /**
     * Define la configuración de las columnas para la tabla de usuarios.
     * `header`: El texto que se muestra en la cabecera de la columna.
     * `accessor`: Cómo obtener los datos para cada celda. Puede ser una clave del objeto de datos
     *             o una función de renderizado personalizada que recibe el objeto de la fila completo.
     * `sortable`: Indica si la columna se puede ordenar.
     */
    const columns: Column<User>[] = [
        {
            header: 'Nombre',
            accessor: (user: User) => (
                <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full mr-4" src={user.avatar} alt={user.name} />
                    <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                </div>
            ),
        },
        { header: 'Rol', accessor: 'role', sortable: true },
        { 
            header: 'Estado', 
            accessor: (user: User) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
        { header: 'Último Acceso', accessor: 'lastLogin', sortable: true },
    ];

    /**
     * Función que renderiza los botones de acción (editar, borrar) para cada fila de la tabla.
     * Esta función se pasa como prop al componente `Table`.
     * @param {User} user - El objeto de usuario de la fila actual.
     * @returns {React.ReactNode} Los botones de acción para la fila.
     */
    const renderRowActions = (user: User) => (
        <div className="space-x-2">
            <Button variant="ghost" size="sm"><Edit size={16} /></Button>
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600"><Trash size={16} /></Button>
        </div>
    );
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h1>
                <Button leftIcon={<PlusCircle size={18} />}>
                    Nuevo Usuario
                </Button>
            </div>
            {/* 
              Renderiza el componente de tabla genérico, pasando los datos, la configuración de las columnas
              y la función de renderizado de acciones.
            */}
            <Table<User>
                columns={columns}
                data={users}
                renderRowActions={renderRowActions}
            />
        </div>
    );
}

export default UsersPage;