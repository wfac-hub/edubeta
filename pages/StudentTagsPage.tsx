
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { StudentTag } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Plus, Trash2, Pencil, Search, MoreHorizontal, CheckCircle } from 'lucide-react';
import StudentTagForm from '../components/forms/StudentTagForm';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const StudentTagsPage = () => {
    const { studentTags, updateStudentTag, deleteStudentTags } = useData();
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<StudentTag | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const showFeedback = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const filteredTags = useMemo(() => {
        return studentTags.filter(tag => 
            tag.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [studentTags, searchTerm]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedItems(e.target.checked ? filteredTags.map(t => t.id) : []);
    };

    const handleSelectOne = (id: number) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]);
    };

    const handleOpenModal = (tag: StudentTag | null) => {
        setEditingTag(tag);
        setIsModalOpen(true);
    };
    
    const handleSave = (data: StudentTag) => {
        updateStudentTag(data);
        setIsModalOpen(false);
        setEditingTag(null);
        showFeedback(data.id === 0 ? 'Etiqueta creada correctamente' : 'Etiqueta actualizada correctamente');
    };

    const handleDelete = () => {
        deleteStudentTags(selectedItems);
        setSelectedItems([]);
        setIsDeleteConfirmOpen(false);
        showFeedback('Etiquetas eliminadas correctamente');
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Etiquetas para alumnos</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Gestiona la lista de etiquetas disponibles para los alumnos.
                        Todas estas etiquetas estarán disponibles para tus alumnos y te permitirá filtrarlos en las listas.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">{filteredTags.length} Resultados</span>
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
                 {/* Mobile View */}
                <div className="lg:hidden divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredTags.map(tag => (
                        <div key={tag.id} className="group">
                             <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === tag.id ? null : tag.id)}>
                                <div className="flex items-center gap-2 mt-1">
                                    <input type="checkbox" checked={selectedItems.includes(tag.id)} onChange={() => handleSelectOne(tag.id)} onClick={e => e.stopPropagation()} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" />
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(tag); }} className="text-gray-400 hover:text-primary-600"><Pencil size={14} /></button>
                                </div>
                                <div className="flex-grow flex items-center gap-3">
                                    {tag.color && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }}></div>}
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{tag.name}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Desktop View */}
                <table className="hidden lg:table min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                        <tr>
                            <th scope="col" className="p-4 w-16"><input type="checkbox" onChange={handleSelectAll} checked={filteredTags.length > 0 && selectedItems.length === filteredTags.length} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" /></th>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTags.map(tag => (
                            <tr key={tag.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50">
                                <td className="p-4">
                                     <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={selectedItems.includes(tag.id)} onChange={() => handleSelectOne(tag.id)} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" />
                                        <button onClick={() => handleOpenModal(tag)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"><Pencil size={14} /></button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    <div className="flex items-center gap-3">
                                        {tag.color && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }}></div>}
                                        {tag.name}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredTags.length === 0 && <p className="text-center py-8 text-gray-500">No hay etiquetas definidas.</p>}
            </div>

             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTag ? 'Editar Etiqueta' : 'Nueva Etiqueta'}>
                <StudentTagForm tag={editingTag} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
            </Modal>
             <ConfirmationModal 
                isOpen={isDeleteConfirmOpen} 
                onClose={() => setIsDeleteConfirmOpen(false)} 
                onConfirm={handleDelete}
                title="Confirmar borrado"
                message={`¿Estás seguro que quieres borrar ${selectedItems.length} etiqueta(s)?`}
             />
        </div>
    );
};

export default StudentTagsPage;
