

import React, { useState, useEffect } from 'react';
import { LevelGroup } from '../../types';
import Button from '../ui/Button';

interface LevelGroupFormProps {
    group: LevelGroup | null;
    onSave: (group: LevelGroup) => void;
    onClose: () => void;
}

const LevelGroupForm: React.FC<LevelGroupFormProps> = ({ group, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<LevelGroup, 'id'>>({
        name: '',
        emoji: '📚',
    });

    useEffect(() => {
        if (group) {
            setFormData(group);
        } else {
             setFormData({ name: '', emoji: '📚' });
        }
    }, [group]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const groupToSave: LevelGroup = {
            id: group?.id || 0,
            ...formData,
        };
        onSave(groupToSave);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <label htmlFor="emoji" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Emoji</label>
                <input
                    type="text"
                    name="emoji"
                    id="emoji"
                    value={formData.emoji}
                    onChange={handleChange}
                    maxLength={2}
                    className="mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500"
                />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit">{group ? 'Actualizar' : 'Crear'}</Button>
            </div>
        </form>
    );
};

export default LevelGroupForm;