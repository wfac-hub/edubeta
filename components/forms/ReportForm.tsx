import React, { useState, useEffect } from 'react';
import { Report, ReportStatus, Student, Course } from '../../types';
import Button from '../ui/Button';
import { useData } from '../../contexts/DataContext';

interface ReportFormProps {
    report: Report | null;
    onSave: (report: Report) => void;
    onClose: () => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ report, onSave, onClose }) => {
    const { students, courses, enrollments } = useData();
    const [formData, setFormData] = useState<Omit<Report, 'id'>>({
        studentId: 0,
        courseId: 0,
        title: '',
        type: 'Evaluación Trimestral',
        deliveryDate: new Date().toISOString().split('T')[0],
        status: 'No inicializado',
        isGenerated: false,
    });

    // Filter to show only active enrollments for selection
    const activeEnrollments = enrollments.filter(e => e.isActive).map(e => {
        const s = students.find(st => st.id === e.studentId);
        const c = courses.find(co => co.id === e.courseId);
        return { enrollment: e, student: s, course: c };
    }).filter(item => item.student && item.course);


    useEffect(() => {
        if (report) {
            setFormData(report);
        } else {
            // Default to first available student/course if creating new
            if (activeEnrollments.length > 0) {
                 setFormData(prev => ({
                     ...prev,
                     studentId: activeEnrollments[0].student!.id,
                     courseId: activeEnrollments[0].course!.id
                 }));
            }
        }
    }, [report]); // Depend only on report to avoid reset on other changes

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'enrollment') {
            const [sId, cId] = value.split('-').map(Number);
            setFormData(prev => ({ ...prev, studentId: sId, courseId: cId }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.studentId === 0 || formData.courseId === 0) {
            alert("Debes seleccionar un alumno y curso.");
            return;
        }
        const reportToSave: Report = {
            id: report?.id || 0,
            ...formData,
        };
        onSave(reportToSave);
    };

    const currentEnrollmentValue = `${formData.studentId}-${formData.courseId}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alumno - Curso</label>
                <select
                    name="enrollment"
                    value={currentEnrollmentValue}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                    disabled={!!report} // Disable changing student/course on edit to avoid confusion
                >
                    {activeEnrollments.map(item => (
                        <option key={item.enrollment.id} value={`${item.student!.id}-${item.course!.id}`}>
                            {item.student!.lastName}, {item.student!.firstName} - {item.course!.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título del Informe</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                    placeholder="Ej. Informe 1er Trimestre"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                    >
                        <option>Evaluación Trimestral</option>
                        <option>Informe Final</option>
                        <option>Nota simple</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de entrega</label>
                    <input
                        type="date"
                        name="deliveryDate"
                        value={formData.deliveryDate}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                >
                    <option value="No inicializado">No inicializado</option>
                    <option value="En edición">En edición</option>
                    <option value="En revisión">En revisión</option>
                    <option value="Acabado">Acabado</option>
                    <option value="Enviado">Enviado</option>
                </select>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit">{report ? 'Actualizar' : 'Crear Informe'}</Button>
            </div>
        </form>
    );
};

export default ReportForm;