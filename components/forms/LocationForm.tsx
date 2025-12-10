


import React, { useState, useEffect } from 'react';
import { Location, Population } from '../../types';
import Button from '../ui/Button';
import { useData } from '../../contexts/DataContext';

interface LocationFormProps {
    location: Location | null;
    onSave: (location: Location) => void;
    onClose: () => void;
}

const LocationForm: React.FC<LocationFormProps> = ({ location, onSave, onClose }) => {
    const { populations } = useData();
    const [formData, setFormData] = useState<Omit<Location, 'id' | 'classroomCount'>>({
        name: '',
        population: populations[0]?.name || '',
        isExternal: false,
    });

    useEffect(() => {
        if (location) {
            setFormData(location);
        } else {
            setFormData({
                name: '',
                population: populations[0]?.name || '',
                isExternal: false,
            });
        }
    }, [location, populations]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const locationToSave: Location = {
            id: location?.id || 0,
            classroomCount: location?.classroomCount || 0,
            ...formData,
        };
        onSave(locationToSave);
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
                <label htmlFor="population" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Población</label>
                <select
                    name="population"
                    id="population"
                    value={formData.population}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500"
                >
                    {populations.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
            </div>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    name="isExternal"
                    id="isExternal"
                    checked={formData.isExternal}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
                />
                 <label htmlFor="isExternal" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">¿Localización externa?</label>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit">{location ? 'Actualizar' : 'Crear'}</Button>
            </div>
        </form>
    );
};

export default LocationForm;