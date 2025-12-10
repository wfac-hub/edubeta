import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { Save, Shield } from 'lucide-react';
import { Teacher, WikiCategory } from '../../types';

/**
 * Página para gestionar los permisos de los profesores sobre las categorías de la Wiki.
 * Permite a un administrador asignar acceso de lectura y escritura a cada profesor por categoría.
 * Estilos optimizados para día/noche.
 */
function WikiPermissionsPage() {
    const { teachers, wikiCategories, wikiPermissions, updateWikiPermission, deleteWikiPermissions } = useData();
    const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);

    /**
     * Gestiona el cambio de permiso de acceso (lectura) para una categoría.
     * Si el permiso existe, lo borra. Si no, lo crea con `canEdit=false`.
     */
    const handlePermissionChange = (categoryId: number) => {
        if (!selectedTeacher) return;

        const existingPerm = wikiPermissions.find(p => 
            p.teacherId === selectedTeacher && 
            p.categoryId === categoryId && 
            !p.classId
        );

        if (existingPerm) {
            deleteWikiPermissions([existingPerm.id]);
        } else {
            updateWikiPermission({
                id: 0,
                teacherId: selectedTeacher,
                categoryId: categoryId,
                canEdit: false
            });
        }
    };

    /**
     * Comprueba si un profesor tiene acceso a una categoría.
     */
    const hasPermission = (teacherId: number, categoryId: number) => {
        return wikiPermissions.some(p => p.teacherId === teacherId && p.categoryId === categoryId && !p.classId);
    };

    /**
     * Comprueba si un profesor tiene permiso de edición para una categoría.
     */
    const isEditor = (teacherId: number, categoryId: number) => {
        const perm = wikiPermissions.find(p => p.teacherId === teacherId && p.categoryId === categoryId && !p.classId);
        return perm?.canEdit || false;
    };
    
    /**
     * Gestiona el cambio del permiso de edición.
     */
    const handleEditToggle = (categoryId: number, canEdit: boolean) => {
         if (!selectedTeacher) return;
         const existingPerm = wikiPermissions.find(p => p.teacherId === selectedTeacher && p.categoryId === categoryId && !p.classId);
         if (existingPerm) {
             updateWikiPermission({ ...existingPerm, canEdit });
         }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Shield /> Gestión de Permisos Wiki
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Teachers List */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Profesores</h3>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-slate-700 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {teachers.map(teacher => (
                            <div 
                                key={teacher.id}
                                onClick={() => setSelectedTeacher(teacher.id)}
                                className={`p-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors ${selectedTeacher === teacher.id ? 'bg-blue-100 dark:bg-slate-700 border-l-4 border-primary-500' : ''}`}
                            >
                                <p className="font-medium text-gray-900 dark:text-white">{teacher.name} {teacher.lastName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{teacher.email}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Permissions Grid */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                    {!selectedTeacher ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                            <Shield size={48} className="mb-4 opacity-20" />
                            <p>Selecciona un profesor para configurar sus permisos.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                                    Permisos para: {teachers.find(t => t.id === selectedTeacher)?.name}
                                </h3>
                            </div>
                            
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase border-b dark:border-slate-700">
                                    <tr>
                                        <th className="py-2 font-medium">Categoría</th>
                                        <th className="py-2 text-center font-medium">Acceso</th>
                                        <th className="py-2 text-center font-medium">¿Puede Editar?</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {wikiCategories.map(cat => {
                                        const hasAccess = hasPermission(selectedTeacher, cat.id);
                                        const canEdit = isEditor(selectedTeacher, cat.id);
                                        return (
                                            <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                                <td className="py-3 font-medium text-gray-800 dark:text-gray-200">{cat.name}</td>
                                                <td className="py-3 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={hasAccess} 
                                                        onChange={() => handlePermissionChange(cat.id)}
                                                    />
                                                </td>
                                                <td className="py-3 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={canEdit} 
                                                        disabled={!hasAccess}
                                                        onChange={(e) => handleEditToggle(cat.id, e.target.checked)}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                                * Al dar acceso a una categoría, el profesor podrá ver todos los temas y lecciones dentro de ella. El permiso de edición permite crear y modificar contenido.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default WikiPermissionsPage;
