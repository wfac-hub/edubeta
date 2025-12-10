

import React, { useState, useEffect } from 'react';
import { Classroom } from '../../types';
import Button from '../ui/Button';
import { useData } from '../../contexts/DataContext';

interface ClassroomFormProps {
    classroom: Classroom | null;
    onSave: (classroom: Classroom) => void;
    onClose: () => void;
}

const PREDEFINED_COLORS = [
    { name: 'Azul', value: '#4A90E2' },
    { name: 'Rojo', value: '#F56565' },
    { name: 'Granate', value: '#D657D8' },
    { name: 'Verde', value: '#48BB78' },
    { name: 'Turquesa', value: '#38B2AC' },
    { name: 'Naranja', value: '#ED8936' },
    { name: 'Gris', value: '#A0AEC0' },
    { name: 'Marrón', value: '#8B4513' }
];


const ClassroomForm: React.FC<ClassroomFormProps> = ({ classroom, onSave, onClose }) => {
    const { locations } = useData();
    const [formData, setFormData] = useState<Omit<Classroom, 'id' | 'courseCount'>>({
        name: '',
        location: locations[0]?.name || '',
        color: '#4A90E2',
        order: 0,
    });

    useEffect(() => {
        if (classroom) {
            setFormData(classroom);
        } else {
            setFormData({
                name: '',
                location: locations[0]?.name || '',
                color: '#4A90E2',
                order: 0,
            });
        }
    }, [classroom, locations]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
         const classroomToSave: Classroom = {
            id: classroom?.id || 0,
            courseCount: classroom?.courseCount || 0,
            ...formData,
            order: Number(formData.order)
        };
        onSave(classroomToSave);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Localización</label>
                <select
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500"
                >
                    {locations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre aula</label>
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
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color calendario</label>
                <div className="flex items-center gap-2 mt-1">
                    <select
                        name="color"
                        id="color"
                        value={formData.color}
                        onChange={handleChange}
                        className="block w-full rounded-md shadow-sm sm:text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500"
                    >
                        {PREDEFINED_COLORS.map(c => (
                            <option key={c.value} value={c.value}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                     <div className="w-8 h-8 rounded-md flex-shrink-0" style={{ backgroundColor: formData.color }}></div>
                </div>
            </div>
            <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Orden</label>
                <input
                    type="number"
                    name="order"
                    id="order"
                    value={formData.order || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500"
                />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit">{classroom ? 'Actualizar' : 'Alta'}</Button>
            </div>
        </form>
    );
};

export default ClassroomForm;