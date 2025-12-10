
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';
import { AuthorizationGroup } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Plus, Trash2, Pencil, Search, CheckCircle } from 'lucide-react';
import AuthorizationGroupForm from '../components/forms/AuthorizationGroupForm';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const AuthorizationGroupsPage = () => {
    const { authGroups, authorizations, updateAuthGroup, deleteAuthGroups } = useData();
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<AuthorizationGroup | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const showFeedback = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const filteredGroups = useMemo(() => {
        return authGroups.filter(group => 
            group.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [authGroups, searchTerm]);
    
    const getAuthorizationCount = (groupId: number) => {
        return authorizations.filter(auth => auth.groupId === groupId).length;
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedItems(e.target.checked ? filteredGroups.map(g => g.id) : []);
    };

    const handleSelectOne = (id: number) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]);
    };

    const handleOpenModal = (group: AuthorizationGroup | null) => {
        setEditingGroup(group);
        setIsModalOpen(true);
    };
    
    const handleSave = (data: AuthorizationGroup) => {
        updateAuthGroup(data);
        setIsModalOpen(false);
        setEditingGroup(null);
        showFeedback(data.id === 0 ? 'Grupo creado correctamente' : 'Grupo actualizado correctamente');
    };

    const handleDelete = () => {
        deleteAuthGroups(selectedItems);
        setSelectedItems([]);
        setIsDeleteConfirmOpen(false);
        showFeedback('Grupos eliminados correctamente');
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Grupos de autorizaciones</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Agrupa tus autorizaciones por bloques semánticos. Utiliza el título y descripción como texto introductorio para todas las autorizaciones de cada agrupación.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">{filteredGroups.length} Resultados</span>
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                 <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />} onClick={() => handleOpenModal(null)}>Alta</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />} onClick={() => setIsDeleteConfirmOpen(true)} disabled={selectedItems.length === 0}>Borrar</Button>
                    {successMsg && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-fade-in bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-md">
                            <CheckCircle size={16} />
                            {successMsg}
                        </div>
                    )}
                    <div className="flex-grow"></div>
                    <div className="relative w-full sm:w-64">
                         <input
                            type="text"
                            placeholder="Buscar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-4 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                        <tr>
                            <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={filteredGroups.length > 0 && selectedItems.length === filteredGroups.length} /></th>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Autorizaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGroups.map(group => (
                            <tr key={group.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50">
                                <td className="p-4">
                                     <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={selectedItems.includes(group.id)} onChange={() => handleSelectOne(group.id)} />
                                        <button onClick={() => handleOpenModal(group)} className="text-gray-400 hover:text-primary-600"><Pencil size={14} /></button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                    <Link to={`/doc-config/auth-groups/${group.id}`} className="hover:underline">{group.name}</Link>
                                </td>
                                <td className="px-6 py-4">
                                    <Link to={`/doc-config/auth-groups/${group.id}`} className="flex items-center gap-2 text-blue-500 font-semibold hover:underline">
                                        <CheckCircle size={16} />
                                        <span>{getAuthorizationCount(group.id)}</span>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredGroups.length === 0 && <p className="text-center py-8 text-gray-500">No hay grupos de autorizaciones.</p>}
            </div>
             <div className="flex justify-end items-center text-sm text-gray-500">
                {filteredGroups.length} Resultados
            </div>

             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingGroup ? 'Editar Grupo' : 'Nuevo Grupo'}>
                <AuthorizationGroupForm group={editingGroup} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
            </Modal>
             <ConfirmationModal 
                isOpen={isDeleteConfirmOpen} 
                onClose={() => setIsDeleteConfirmOpen(false)} 
                onConfirm={handleDelete}
                title="Confirmar borrado"
                message={`¿Estás seguro que quieres borrar ${selectedItems.length} grupo(s)? Se borrarán también todas las autorizaciones asociadas.`}
             />
        </div>
    );
};

export default AuthorizationGroupsPage;
