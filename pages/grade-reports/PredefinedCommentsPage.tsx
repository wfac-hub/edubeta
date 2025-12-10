
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { MessageSquare, Plus, Trash2, Search, Edit, Check, X, CheckCircle } from 'lucide-react';
import { PredefinedComment } from '../../types';
import Modal from '../../components/ui/Modal';
import PredefinedCommentForm from '../../components/forms/PredefinedCommentForm';

const PredefinedCommentsPage = () => {
    const { predefinedComments, commentTags, teachers, updatePredefinedComment, deletePredefinedComments } = useData();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        teacherId: '',
        isActive: '',
    });
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingComment, setEditingComment] = useState<PredefinedComment | null>(null);

    const showFeedback = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredComments.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredComments = useMemo(() => {
        return predefinedComments.filter(comment => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = comment.text.toLowerCase().includes(searchLower);
            const matchesTeacher = filters.teacherId ? (comment.teacherId?.toString() === filters.teacherId) : true;
            const matchesActive = filters.isActive ? (String(comment.isActive) === filters.isActive) : true;

            return matchesSearch && matchesTeacher && matchesActive;
        });
    }, [predefinedComments, searchTerm, filters]);

    const getTeacherName = (id?: number) => {
        if (!id) return 'Global (Todos)';
        const t = teachers.find(tea => tea.id === id);
        return t ? `${t.name} ${t.lastName}` : 'Desconocido';
    };

    const getTagNames = (tagIds: number[]) => {
        return tagIds.map(id => {
            const tag = commentTags.find(t => t.id === id);
            return tag ? tag.name : null;
        }).filter(Boolean).join(', ');
    };
    
    const handleDelete = () => {
        if (confirm(`¿Borrar ${selectedIds.length} comentarios?`)) {
            deletePredefinedComments(selectedIds);
            setSelectedIds([]);
            showFeedback('Comentarios eliminados correctamente');
        }
    }
    
    const handleOpenModal = (comment: PredefinedComment | null) => {
        setEditingComment(comment);
        setIsModalOpen(true);
    };

    const handleSave = (comment: PredefinedComment) => {
        updatePredefinedComment(comment);
        setIsModalOpen(false);
        showFeedback(comment.id === 0 ? 'Comentario creado correctamente' : 'Comentario actualizado correctamente');
    };

    const inputClasses = "p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <MessageSquare className="text-primary-600" /> Comentarios predefinidos de informes
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Gestiona los comentarios que los profesores pueden reutilizar en los informes.
                    </p>
                </div>
                <div className="text-gray-500 text-sm font-medium">{filteredComments.length} Resultados</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />} onClick={() => handleOpenModal(null)}>Alta</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />} disabled={selectedIds.length === 0} onClick={handleDelete}>Borrar</Button>
                    {successMsg && (
                        <div className="ml-auto flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-fade-in bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-md">
                            <CheckCircle size={16} />
                            {successMsg}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    <select name="teacherId" value={filters.teacherId} onChange={handleFilterChange} className={inputClasses}><option value="">Profesor/a</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.name} {t.lastName}</option>)}</select>
                    <select name="isActive" value={filters.isActive} onChange={handleFilterChange} className={inputClasses}><option value="">¿Activo?</option><option value="true">Sí</option><option value="false">No</option></select>
                    
                    <div className="flex-grow"></div>
                    <div className="relative w-full sm:w-64">
                         <input
                            type="text"
                            placeholder="Buscar texto..."
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
                            <th className="p-4 w-10"><input type="checkbox" onChange={handleSelectAll} checked={filteredComments.length > 0 && selectedIds.length === filteredComments.length} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"/></th>
                            <th className="px-6 py-3 w-10"></th>
                            <th className="px-6 py-3 font-medium">Comentario</th>
                            <th className="px-6 py-3 font-medium">Profesor/a</th>
                            <th className="px-6 py-3 font-medium">Etiquetas</th>
                            <th className="px-6 py-3 font-medium text-center">¿Activo?</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {filteredComments.map(comment => (
                            <tr key={comment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                <td className="p-4"><input type="checkbox" checked={selectedIds.includes(comment.id)} onChange={() => handleSelectOne(comment.id)} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"/></td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleOpenModal(comment)} className="text-blue-500 hover:text-blue-700"><Edit size={16}/></button>
                                </td>
                                <td className="px-6 py-4 text-gray-900 dark:text-white truncate max-w-lg" title={comment.text}>{comment.text}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{getTeacherName(comment.teacherId)}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{getTagNames(comment.tags)}</td>
                                <td className="px-6 py-4 text-center">
                                    {comment.isActive ? <Check size={18} className="text-green-500 mx-auto"/> : <X size={18} className="text-red-500 mx-auto"/>}
                                </td>
                            </tr>
                        ))}
                        {filteredComments.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-8 text-gray-500">No se encontraron comentarios.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingComment ? 'Editar Comentario' : 'Nuevo Comentario'}>
                <PredefinedCommentForm comment={editingComment} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default PredefinedCommentsPage;
