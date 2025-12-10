

import React, { useState, useEffect } from 'react';
import { WeekSchedule } from '../../types';
import Button from '../ui/Button';

interface WeekScheduleFormProps {
    schedule: WeekSchedule | null;
    onSave: (schedule: WeekSchedule) => void;
    onClose: () => void;
}

const WeekScheduleForm: React.FC<WeekScheduleFormProps> = ({ schedule, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<WeekSchedule, 'id' | 'name'>>({
        day: 'Lunes',
        startTime: '10:00',
        endTime: '11:00',
    });
    const [descriptiveName, setDescriptiveName] = useState('');

    useEffect(() => {
        if (schedule) {
            const { name, ...rest } = schedule;
            setFormData(rest);
        } else {
            setFormData({
                day: 'Lunes',
                startTime: '10:00',
                endTime: '11:00',
            });
        }
    }, [schedule]);
    
    useEffect(() => {
        const dayAbbr = formData.day.substring(0, 2);
        const newName = `${dayAbbr} ${formData.startTime} - ${formData.endTime}`;
        setDescriptiveName(newName);
    }, [formData.day, formData.startTime, formData.endTime]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const scheduleToSave: WeekSchedule = {
            id: schedule?.id || 0,
            name: descriptiveName,
            ...formData,
        };
        onSave(scheduleToSave);
    };
    
    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre descriptivo</label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    value={descriptiveName}
                    readOnly
                    className="mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:outline-none"
                />
            </div>
            <div>
                 <label htmlFor="day" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Día de la semana</label>
                <select
                    name="day"
                    id="day"
                    value={formData.day}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500"
                >
                    {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora entrada</label>
                    <input
                        type="time"
                        name="startTime"
                        id="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora salida</label>
                    <input
                        type="time"
                        name="endTime"
                        id="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500"
                        required
                    />
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit">{schedule ? 'Actualizar' : 'Crear'}</Button>
            </div>
        </form>
    );
};

export default WeekScheduleForm;