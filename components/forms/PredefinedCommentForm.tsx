import React, { useState, useEffect } from 'react';
import { PredefinedComment, Teacher, CommentTag } from '../../types';
import Button from '../ui/Button';
import { useData } from '../../contexts/DataContext';

interface PredefinedCommentFormProps {
    comment: PredefinedComment | null;
    onSave: (comment: PredefinedComment) => void;
    onClose: () => void;
}

const PredefinedCommentForm: React.FC<PredefinedCommentFormProps> = ({ comment, onSave, onClose }) => {
    const { teachers, commentTags } = useData();
    const [formData, setFormData] = useState<Omit<PredefinedComment, 'id'>>({
        text: '',
        teacherId: undefined,
        tags: [],
        isActive: true,
    });

    useEffect(() => {
        if (comment) {
            setFormData(comment);
        } else {
             setFormData({ text: '', teacherId: undefined, tags: [], isActive: true });
        }
    }, [comment]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let processedValue: any = value;

        if (type === 'checkbox' && name === 'isActive') {
             processedValue = (e.target as HTMLInputElement).checked;
        } else if (name === 'teacherId') {
            processedValue = value ? parseInt(value) : undefined;
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleTagChange = (tagId: number) => {
        setFormData(prev => {
            const newTags = prev.tags.includes(tagId)
                ? prev.tags.filter(id => id !== tagId)
                : [...prev.tags, tagId];
            return { ...prev, tags: newTags };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const commentToSave: PredefinedComment = {
            id: comment?.id || 0,
            ...formData,
        };
        onSave(commentToSave);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comentario</label>
                <textarea
                    name="text"
                    id="text"
                    rows={4}
                    value={formData.text}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500"
                    required
                />
            </div>

            <div>
                <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profesor/a</label>
                <select
                    name="teacherId"
                    id="teacherId"
                    value={formData.teacherId || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                >
                    <option value="">-- Global (Todos) --</option>
                    {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name} {t.lastName}</option>
                    ))}
                </select>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Etiquetas</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 dark:border-slate-700 rounded bg-gray-50 dark:bg-slate-800">
                    {commentTags.map(tag => (
                         <label key={tag.id} className="inline-flex items-center px-3 py-1 rounded-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.tags.includes(tag.id)}
                                onChange={() => handleTagChange(tag.id)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-2"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-200">{tag.name}</span>
                        </label>
                    ))}
                    {commentTags.length === 0 && <p className="text-xs text-gray-500">No hay etiquetas creadas.</p>}
                </div>
            </div>
            
            <div className="flex items-center">
                <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    ¿Activo?
                </label>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit">{comment ? 'Actualizar' : 'Crear'}</Button>
            </div>
        </form>
    );
};

export default PredefinedCommentForm;