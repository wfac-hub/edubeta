
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { CommentTag } from '../../types';
import Button from '../../components/ui/Button';
import { Tag, Plus, Trash2, Search, Check, Edit, X, CheckCircle } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import CommentTagForm from '../../components/forms/CommentTagForm';

const CommentTagsPage = () => {
    const { commentTags, updateCommentTag, deleteCommentTags } = useData();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<CommentTag | null>(null);

    const showFeedback = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredTags.map(t => t.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
    };

    const filteredTags = useMemo(() => {
        return commentTags.filter(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [commentTags, searchTerm]);

    const handleDelete = () => {
        if (confirm(`¿Borrar ${selectedIds.length} etiquetas?`)) {
            deleteCommentTags(selectedIds);
            setSelectedIds([]);
            showFeedback('Etiquetas eliminadas correctamente');
        }
    };

    const handleOpenModal = (tag: CommentTag | null) => {
        setEditingTag(tag);
        setIsModalOpen(true);
    };

    const handleSave = (tag: CommentTag) => {
        updateCommentTag(tag);
        setIsModalOpen(false);
        showFeedback(tag.id === 0 ? 'Etiqueta creada correctamente' : 'Etiqueta actualizada correctamente');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Tag className="text-primary-600" /> Etiquetas para comentarios predefinidos
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Etiquetas de comentarios predefinidos, un comentario puede tener varias etiquetas.
                    </p>
                </div>
                <div className="text-gray-500 text-sm font-medium">{filteredTags.length} Resultados</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />} onClick={() => handleOpenModal(null)}>Alta</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />} disabled={selectedIds.length === 0} onClick={handleDelete}>Borrar</Button>
                    
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
                            className="w-full p-2 pl-4 pr-10 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <table className="min-w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-4 w-10"><input type="checkbox" onChange={handleSelectAll} checked={filteredTags.length > 0 && selectedIds.length === filteredTags.length} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"/></th>
                            <th className="px-6 py-3 w-20 text-center">Editar</th>
                            <th className="px-6 py-3 font-medium">Nombre</th>
                            <th className="px-6 py-3 font-medium text-center">¿Activo?</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {filteredTags.map(tag => (
                            <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                <td className="p-4"><input type="checkbox" checked={selectedIds.includes(tag.id)} onChange={() => handleSelectOne(tag.id)} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"/></td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleOpenModal(tag)} className="text-blue-500 hover:text-blue-700"><Edit size={16}/></button>
                                </td>
                                <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{tag.name}</td>
                                <td className="px-6 py-4 text-center">
                                    {tag.isActive ? <Check size={18} className="text-green-500 mx-auto"/> : <X size={18} className="text-red-500 mx-auto"/>}
                                </td>
                            </tr>
                        ))}
                        {filteredTags.length === 0 && (
                            <tr><td colSpan={4} className="text-center py-8 text-gray-500">No se encontraron etiquetas.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTag ? 'Editar Etiqueta' : 'Nueva Etiqueta'}>
                <CommentTagForm tag={editingTag} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default CommentTagsPage;
