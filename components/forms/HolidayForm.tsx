import React, { useState, useEffect } from 'react';
import { Holiday, HolidayDate, HolidayDateType } from '../../types';
import Button from '../ui/Button';
import { useData } from '../../contexts/DataContext';

interface HolidayFormProps {
    holiday: Holiday | null;
    onSave: (holiday: Holiday) => void;
    onClose: () => void;
}

const HolidayForm: React.FC<HolidayFormProps> = ({ holiday, onSave, onClose }) => {
    const { locations } = useData();
    const [formData, setFormData] = useState<Omit<Holiday, 'id'>>({
        name: '',
        date: { type: 'specific', day: 1, month: 1, year: new Date().getFullYear() },
        location: '',
    });

    useEffect(() => {
        if (holiday) {
            setFormData(holiday);
        } else {
            setFormData({
                name: '',
                date: { type: 'specific', day: 1, month: 1, year: new Date().getFullYear() },
                location: '',
            });
        }
    }, [holiday]);

    const handleDateTypeChange = (type: HolidayDateType) => {
        let newDate: HolidayDate;
        const today = new Date();
        switch (type) {
            case 'recurring':
                newDate = { type: 'recurring', day: 1, month: 1 };
                break;
            case 'range':
                newDate = { type: 'range', startDate: today.toISOString().split('T')[0], endDate: new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0] };
                break;
            case 'specific':
            default:
                newDate = { type: 'specific', day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear() };
                break;
        }
        setFormData(prev => ({ ...prev, date: newDate }));
    };
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const processedValue = (name === 'startDate' || name === 'endDate') ? value : parseInt(value, 10) || 0;
        setFormData(prev => ({
            ...prev,
            date: { ...prev.date, [name]: processedValue }
        }));
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const holidayToSave: Holiday = {
            id: holiday?.id || 0,
            ...formData,
        };
        onSave(holidayToSave);
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
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Fecha</label>
                <div className="flex flex-wrap gap-4">
                    <label className="flex items-center"><input type="radio" checked={formData.date.type === 'specific'} onChange={() => handleDateTypeChange('specific')} className="mr-2 h-4 w-4 rounded-full border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500"/>Día concreto</label>
                    <label className="flex items-center"><input type="radio" checked={formData.date.type === 'recurring'} onChange={() => handleDateTypeChange('recurring')} className="mr-2 h-4 w-4 rounded-full border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500"/>Fecha recurrente (anual)</label>
                    <label className="flex items-center"><input type="radio" checked={formData.date.type === 'range'} onChange={() => handleDateTypeChange('range')} className="mr-2 h-4 w-4 rounded-full border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500"/>Rango de fecha</label>
                </div>
            </div>

            {formData.date.type === 'specific' && (
                <div className="grid grid-cols-3 gap-2">
                    <input type="number" name="day" placeholder="Día" value={formData.date.day || ''} onChange={handleDateChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200"/>
                    <input type="number" name="month" placeholder="Mes" value={formData.date.month || ''} onChange={handleDateChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200"/>
                    <input type="number" name="year" placeholder="Año" value={formData.date.year || ''} onChange={handleDateChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200"/>
                </div>
            )}
            {formData.date.type === 'recurring' && (
                 <div className="grid grid-cols-2 gap-2">
                    <input type="number" name="day" placeholder="Día" value={formData.date.day || ''} onChange={handleDateChange} min="1" max="31" className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200"/>
                    <input type="number" name="month" placeholder="Mes" value={formData.date.month || ''} onChange={handleDateChange} min="1" max="12" className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200"/>
                </div>
            )}
            {formData.date.type === 'range' && (
                <div className="grid grid-cols-2 gap-2">
                    <input type="date" name="startDate" value={formData.date.startDate || ''} onChange={handleDateChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200"/>
                    <input type="date" name="endDate" value={formData.date.endDate || ''} onChange={handleDateChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200"/>
                </div>
            )}

            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Solo festivo en (opcional)</label>
                <select
                    name="location"
                    id="location"
                    value={formData.location || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                    <option value="">General (todas las localizaciones)</option>
                    {locations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit">{holiday ? 'Actualizar' : 'Crear'}</Button>
            </div>
        </form>
    );
};

export default HolidayForm;