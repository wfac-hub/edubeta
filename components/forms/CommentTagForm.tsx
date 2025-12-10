import React, { useState, useEffect } from 'react';
import { CommentTag } from '../../types';
import Button from '../ui/Button';

interface CommentTagFormProps {
    tag: CommentTag | null;
    onSave: (tag: CommentTag) => void;
    onClose: () => void;
}

const CommentTagForm: React.FC<CommentTagFormProps> = ({ tag, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<CommentTag, 'id'>>({
        name: '',
        isActive: true,
    });

    useEffect(() => {
        if (tag) {
            setFormData(tag);
        } else {
             setFormData({ name: '', isActive: true });
        }
    }, [tag]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const tagToSave: CommentTag = {
            id: tag?.id || 0,
            ...formData,
        };
        onSave(tagToSave);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de la etiqueta</label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500"
                    required
                />
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
                <Button type="submit">{tag ? 'Actualizar' : 'Crear'}</Button>
            </div>
        </form>
    );
};

export default CommentTagForm;