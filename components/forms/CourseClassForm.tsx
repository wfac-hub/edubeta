import React, { useState, useEffect } from 'react';
import { CourseClass, Course, User, Role } from '../../types';
import { useData } from '../../contexts/DataContext';
import Button from '../ui/Button';

interface CourseClassFormProps {
    course: Course;
    classData: Partial<CourseClass> | null;
    onSave: (newClass: CourseClass) => void;
    onClose: () => void;
}

const CourseClassForm: React.FC<CourseClassFormProps> = ({ course, classData, onSave, onClose }) => {
    const { users } = useData();
    const teachers = users.filter(u => u.role === Role.TEACHER);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        startTime: '17:00',
        endTime: '18:30',
        teacherId: course.teacherId,
        isSubstitution: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const [year, month, day] = formData.date.split('-').map(Number);
        const classDate = new Date(year, month - 1, day);

        const newClass: CourseClass = {
            id: classData?.id || `${course.id}-${Date.now()}`,
            courseId: course.id,
            date: classDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
            teacherId: Number(formData.teacherId),
            isSubstitution: formData.isSubstitution,
            status: 'Pendiente',
        };
        onSave(newClass);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha</label>
                <input
                    type="date"
                    name="date"
                    id="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200"
                    required
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora Inicio</label>
                    <input type="time" name="startTime" id="startTime" value={formData.startTime} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900"/>
                </div>
                <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora Fin</label>
                    <input type="time" name="endTime" id="endTime" value={formData.endTime} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900"/>
                </div>
            </div>
            <div>
                <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profesor/a</label>
                <select name="teacherId" id="teacherId" value={formData.teacherId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>
             <div className="flex items-center">
                <input type="checkbox" name="isSubstitution" id="isSubstitution" checked={formData.isSubstitution} onChange={handleChange} className="h-4 w-4 rounded border-gray-300"/>
                <label htmlFor="isSubstitution" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">¿Es una sustitución?</label>
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit">Guardar Clase</Button>
            </div>
        </form>
    );
};

export default CourseClassForm;
