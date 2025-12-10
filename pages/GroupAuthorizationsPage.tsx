import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';
import Button from '../components/ui/Button';
import { MoveLeft, Plus, Trash2, Edit, Search, Check, X } from 'lucide-react';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const BooleanIcon = ({ value }: { value: boolean }) => {
    return value ? <Check className="text-green-500 mx-auto" size={20} /> : <X className="text-red-500 mx-auto" size={20} />;
};

const GroupAuthorizationsPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const { authGroups, authorizations, deleteAuthorizations } = useData();

    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const group = useMemo(() => authGroups.find(g => g.id === parseInt(groupId || '0')), [authGroups, groupId]);

    const filteredAuthorizations = useMemo(() => {
        if (!group) return [];
        return authorizations
            .filter(auth => auth.groupId === group.id)
            .filter(auth => auth.internalTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [authorizations, group, searchTerm]);

    if (!group) {
        return <div className="p-8 text-center">Grupo no encontrado.</div>;
    }

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedItems(e.target.checked ? filteredAuthorizations.map(a => a.id) : []);
    };

    const handleSelectOne = (id: number) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]);
    };
    
    const handleDelete = () => {
        deleteAuthorizations(selectedItems);
        setSelectedItems([]);
        setIsDeleteConfirmOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Autorizaciones - {group.name}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Autorizaciones del grupo seleccionado. Configura sus contenidos, inicializa el valor para tus alumnos con el botón "Autorizar" y utiliza el menú "Config. apartados" para seleccionar las que aparecen por defecto para la firma.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">{filteredAuthorizations.length} Resultado(s)</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                 <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16} />} onClick={goBack}>Volver</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />} onClick={() => navigate(`/doc-config/authorizations/new/${groupId}`)}>Alta</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />} onClick={() => setIsDeleteConfirmOpen(true)} disabled={selectedItems.length === 0}>Borrar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Edit size={16} />} disabled>Autorizar</Button>
                    <div className="flex-grow"></div>
                    <div className="relative w-full sm:w-64">
                         <input
                            type="text"
                            placeholder="Buscar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-4 pr-10 border rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                        />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>
            
             <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                        <tr>
                            <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={filteredAuthorizations.length > 0 && selectedItems.length === filteredAuthorizations.length} /></th>
                            <th scope="col" className="px-6 py-3">Título interno</th>
                            <th scope="col" className="px-6 py-3 text-center">Área alumno?</th>
                            <th scope="col" className="px-6 py-3 text-center">Área inscripción?</th>
                            <th scope="col" className="px-6 py-3 text-center">¿Es aut. derechos imágen?</th>
                            <th scope="col" className="px-6 py-3 text-center">¿Es aut. comunicaciones?</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAuthorizations.map(auth => (
                            <tr key={auth.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50">
                                <td className="p-4"><input type="checkbox" checked={selectedItems.includes(auth.id)} onChange={() => handleSelectOne(auth.id)} /></td>
                                <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                    <Link to={`/doc-config/authorizations/${auth.id}/edit`} className="hover:underline">{auth.internalTitle}</Link>
                                </td>
                                <td className="px-6 py-4 text-center"><BooleanIcon value={auth.showInStudentArea} /></td>
                                <td className="px-6 py-4 text-center"><BooleanIcon value={auth.showInEnrollment} /></td>
                                <td className="px-6 py-4 text-center"><BooleanIcon value={auth.isImageRightsAuth} /></td>
                                <td className="px-6 py-4 text-center"><BooleanIcon value={auth.isCommunicationsAuth} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredAuthorizations.length === 0 && <p className="text-center py-8 text-gray-500">No hay autorizaciones en este grupo.</p>}
            </div>
             <div className="flex justify-end items-center text-sm text-gray-500">
                {filteredAuthorizations.length} Resultado(s)
            </div>
            
             <ConfirmationModal 
                isOpen={isDeleteConfirmOpen} 
                onClose={() => setIsDeleteConfirmOpen(false)} 
                onConfirm={handleDelete}
                title="Confirmar borrado"
                message={`¿Estás seguro que quieres borrar ${selectedItems.length} autorización(es)?`}
             />
        </div>
    );
};

export default GroupAuthorizationsPage;
