

import React, { useState, useEffect } from 'react';
import { Population } from '../../types';
import Button from '../ui/Button';

interface PopulationFormProps {
    population: Population | null;
    onSave: (population: Population) => void;
    onClose: () => void;
}

const SPANISH_PROVINCES = [
    'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Barcelona', 'Burgos', 'Cáceres',
    'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real', 'Córdoba', 'La Coruña', 'Cuenca', 'Gerona', 'Granada', 'Guadalajara',
    'Guipúzcoa', 'Huelva', 'Huesca', 'Islas Baleares', 'Jaén', 'León', 'Lérida', 'Lugo', 'Madrid', 'Málaga', 'Murcia',
    'Navarra', 'Orense', 'Palencia', 'Las Palmas', 'Pontevedra', 'La Rioja', 'Salamanca', 'Santa Cruz de Tenerife',
    'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza'
];

const PopulationForm: React.FC<PopulationFormProps> = ({ population, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<Population, 'id' | 'studentCount'>>({
        name: '',
        province: 'Teruel',
        country: 'España',
    });

    useEffect(() => {
        if (population) {
            setFormData(population);
        } else {
            setFormData({
                name: '',
                province: 'Teruel',
                country: 'España',
            });
        }
    }, [population]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const populationToSave: Population = {
            id: population?.id || 0,
            studentCount: population?.studentCount || 0,
            ...formData,
        };
        onSave(populationToSave);
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
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">País</label>
                <input
                    type="text"
                    name="country"
                    id="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500"
                    required
                    readOnly
                />
            </div>
            <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Provincia</label>
                <select
                    name="province"
                    id="province"
                    value={formData.province}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500"
                    required
                >
                    {SPANISH_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit">{population ? 'Actualizar' : 'Crear'}</Button>
            </div>
        </form>
    );
};

export default PopulationForm;