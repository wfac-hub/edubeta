import React, { useState, useEffect } from 'react';
import { CourseClass } from '../../types';
import { useData } from '../../contexts/DataContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface ClassTeacherModalProps {
    isOpen: boolean;
    onClose: () => void;
    classData: CourseClass;
    onSave: (classData: CourseClass) => void;
}

const ClassTeacherModal: React.FC<ClassTeacherModalProps> = ({ isOpen, onClose, classData, onSave }) => {
    const { teachers } = useData();

    const [formData, setFormData] = useState({
        teacherId: classData.teacherId,
        isSubstitution: classData.isSubstitution,
    });
    
    useEffect(() => {
        setFormData({
            teacherId: classData.teacherId,
            isSubstitution: classData.isSubstitution,
        });
    }, [classData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'radio' ? value === 'true' : parseInt(value)
        }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...classData,
            teacherId: formData.teacherId,
            isSubstitution: formData.isSubstitution,
        });
    };
    
    const dateStr = classData.date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = `${classData.startTime}-${classData.endTime}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edición de profesor/a">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Actualizar – Días de clase</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Fecha*</label>
                        <input type="text" value={dateStr} readOnly className="mt-1 w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Horario</label>
                        <input type="text" value={timeStr} readOnly className="mt-1 w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Profesor/a</label>
                    <select name="teacherId" value={formData.teacherId} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200">
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name} {t.lastName}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium">¿Es una sustitución?</label>
                    <div className="flex gap-4 mt-1">
                        <label className="flex items-center gap-2"><input type="radio" name="isSubstitution" value="true" checked={formData.isSubstitution === true} onChange={handleChange} className="h-4 w-4 rounded-full border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" /> Sí</label>
                        <label className="flex items-center gap-2"><input type="radio" name="isSubstitution" value="false" checked={formData.isSubstitution === false} onChange={handleChange} className="h-4 w-4 rounded-full border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" /> No</label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Marca Sí para poder escoger quien hará la sustitución.</p>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                    <Button type="button" variant="danger" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Actualizar</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ClassTeacherModal;