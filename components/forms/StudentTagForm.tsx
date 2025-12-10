import React, { useState, useEffect } from 'react';
import { StudentTag } from '../../types';
import Button from '../ui/Button';

interface StudentTagFormProps {
    tag: StudentTag | null;
    onSave: (tag: StudentTag) => void;
    onClose: () => void;
}

const StudentTagForm: React.FC<StudentTagFormProps> = ({ tag, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<StudentTag, 'id'>>({
        name: '',
        color: '#3b82f6', // Default blue
    });

    useEffect(() => {
        if (tag) {
            setFormData(tag);
        } else {
             setFormData({ name: '', color: '#3b82f6' });
        }
    }, [tag]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const tagToSave: StudentTag = {
            id: tag?.id || 0,
            ...formData,
        };
        onSave(tagToSave);
    };

    const PREDEFINED_COLORS = [
        '#ef4444', // red
        '#f97316', // orange
        '#eab308', // yellow
        '#22c55e', // green
        '#14b8a6', // teal
        '#3b82f6', // blue
        '#8b5cf6', // purple
        '#ec4899', // pink
        '#64748b', // slate
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
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
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color (opcional)</label>
                <div className="flex flex-wrap gap-3">
                    {PREDEFINED_COLORS.map(color => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${formData.color === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                            aria-label={`Color ${color}`}
                        />
                    ))}
                </div>
                <input 
                    type="color" 
                    name="color" 
                    value={formData.color} 
                    onChange={handleChange}
                    className="mt-4 h-8 w-full cursor-pointer"
                />
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit">{tag ? 'Actualizar' : 'Crear'}</Button>
            </div>
        </form>
    );
};

export default StudentTagForm;