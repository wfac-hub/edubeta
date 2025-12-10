
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { CourseClass } from '../types';
import Button from '../components/ui/Button';
import { CheckCircle } from 'lucide-react';

const RescheduleClassPage = () => {
    const { courseId, classId } = useParams();
    const navigate = useNavigate();
    const { courses, courseClasses, teachers, classrooms, updateCourseClass } = useData();

    const [formData, setFormData] = useState<Partial<CourseClass>>({});
    const [step, setStep] = useState(1);

    const course = useMemo(() => courses.find(c => c.id === parseInt(courseId || '0')), [courses, courseId]);
    const classData = useMemo(() => courseClasses.find(c => c.id === classId), [courseClasses, classId]);

    useEffect(() => {
        if (classData) {
            setFormData({
                ...classData,
                date: classData.date.toISOString().split('T')[0] as any, // Format for date input
                // Fix: A Course's modality can be 'Híbrido', but a CourseClass modality can only be 'Presencial' or 'Online'.
                // Default to 'Presencial' if the course is 'Híbrido' and the class modality is not specified.
                modality: classData.modality || (course?.modality === 'Híbrido' ? 'Presencial' : (course?.modality as 'Presencial' | 'Online')) || 'Presencial',
            });
        }
    }, [classData, course]);
    
    if (!course || !classData) {
        return <div className="p-8 text-center">Clase o curso no encontrado.</div>;
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        let processedValue: any = value;

        if (name === 'isSubstitution') {
            processedValue = value === 'true';
        } else if (name === 'teacherId' || name === 'classroomId') {
            processedValue = parseInt(value, 10);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: processedValue,
        }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dateStr = String(formData.date);
        const [year, month, day] = dateStr.split('-').map(Number);

        const updatedClass: CourseClass = {
            ...classData,
            ...formData,
            date: new Date(Date.UTC(year, month - 1, day)),
            id: classData.id,
            courseId: classData.courseId,
        };
        
        updateCourseClass(updatedClass);
        setStep(2);
    };

    const handleFinish = () => {
        navigate('/attendance-calendar');
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Reprogramar día de clase para el curso: <Link to={`/courses/${courseId}/classes`} className="text-primary-600 hover:underline">{course.name}</Link>
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Modifica la fecha y hora del día de clase para reprogramarlo.
                </p>
            </div>
            
            <div className="flex items-center p-4">
                <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-500'}`}>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${step >= 1 ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'}`}>
                        1
                    </div>
                    <span className="ml-2 font-semibold">Configuración de la clase</span>
                </div>
                <div className="flex-grow border-t-2 mx-4 border-gray-300 dark:border-gray-600"></div>
                 <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-500'}`}>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${step >= 2 ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'}`}>
                        <CheckCircle size={18}/>
                    </div>
                    <span className="ml-2 font-semibold">Resultado del día reprogramado</span>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                {step === 1 ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium">Fecha*</label>
                            <input type="date" name="date" value={formData.date as unknown as string || ''} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                            <p className="text-xs text-gray-500 mt-1">Fechas del curso: {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium">Hora entrada*</label>
                                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Hora salida*</label>
                                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Profesor/a</label>
                            <select name="teacherId" value={formData.teacherId} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.name} {t.lastName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">¿Es una sustitución?</label>
                            <div className="flex gap-4 mt-1">
                                <label className="flex items-center gap-2"><input type="radio" name="isSubstitution" value="true" checked={formData.isSubstitution === true} onChange={handleChange} className="h-4 w-4 rounded-full border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" /> Sí</label>
                                <label className="flex items-center gap-2"><input type="radio" name="isSubstitution" value="false" checked={formData.isSubstitution === false} onChange={handleChange} className="h-4 w-4 rounded-full border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" /> No</label>
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
                             <select name="classroomId" value={formData.classroomId} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name} - {c.location}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                            <Button type="button" variant="danger" onClick={() => navigate(-1)}>Cancelar</Button>
                            <Button type="submit">Siguiente &gt;</Button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center p-8">
                        <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">Clase Reprogramada</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            La clase ha sido actualizada con éxito.
                        </p>
                        <Button onClick={handleFinish}>Finalizar</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RescheduleClassPage;
