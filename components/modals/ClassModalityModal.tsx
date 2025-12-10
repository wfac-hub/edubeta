import React, { useState, useEffect } from 'react';
import { CourseClass } from '../../types';
import { useData } from '../../contexts/DataContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface ClassModalityModalProps {
    isOpen: boolean;
    onClose: () => void;
    classData: CourseClass;
    onSave: (classData: CourseClass) => void;
}

const ClassModalityModal: React.FC<ClassModalityModalProps> = ({ isOpen, onClose, classData, onSave }) => {
    const { courses, classrooms } = useData();
    const course = courses.find(c => c.id === classData.courseId);

    const [formData, setFormData] = useState({
        modality: classData.modality || course?.modality || 'Presencial',
        classroomId: classData.classroomId || course?.classroomId || 0,
    });
    
    useEffect(() => {
        setFormData({
            modality: classData.modality || course?.modality || 'Presencial',
            classroomId: classData.classroomId || course?.classroomId || 0,
        });
    }, [classData, course]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'classroomId' ? parseInt(value) : value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...classData,
            modality: formData.modality as 'Presencial' | 'Online',
            classroomId: formData.classroomId,
        });
    };
    
    const dateStr = classData.date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = `${classData.startTime}-${classData.endTime}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Modalidad de la clase - Día ${dateStr}`}>
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
                    <label className="block text-sm font-medium">Modalidad</label>
                    <div className="flex gap-4 mt-1">
                        <label className="flex items-center gap-2"><input type="radio" name="modality" value="Presencial" checked={formData.modality === 'Presencial'} onChange={handleChange} className="h-4 w-4 rounded-full border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" /> Presencial</label>
                        <label className="flex items-center gap-2"><input type="radio" name="modality" value="Online" checked={formData.modality === 'Online'} onChange={handleChange} className="h-4 w-4 rounded-full border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" /> On-line</label>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Aula</label>
                    <select name="classroomId" value={formData.classroomId} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200">
                        {classrooms.map(c => <option key={c.id} value={c.id}>{c.name} - {c.location}</option>)}
                    </select>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                    <Button type="button" variant="danger" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Actualizar</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ClassModalityModal;