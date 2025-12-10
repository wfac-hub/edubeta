import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import { MoveLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';
import { Course, CourseClass, Teacher } from '../types';

/**
 * Calcula la duración en horas entre dos tiempos en formato "HH:MM".
 * @param startTime - Hora de inicio.
 * @param endTime - Hora de fin.
 * @returns La duración en horas (ej., 1.5 para 1h 30m).
 */
const calculateDuration = (startTime: string, endTime: string): number => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    return durationMinutes / 60;
};

/**
 * Página que muestra el resumen de horas impartidas por un profesor en un mes específico.
 * Permite navegar entre meses y distingue entre horas normales y de sustitución.
 */
const TeacherHoursPage = () => {
    const { teacherId } = useParams();
    const { goBack } = useNavigationHistory();
    const { teachers, courses, courseClasses, classrooms } = useData();
    
    // Estado para controlar el mes y año que se está visualizando.
    const [viewingDate, setViewingDate] = useState(new Date());

    // Obtiene el profesor correspondiente al ID de la URL.
    const teacher = useMemo(() => {
        return teachers.find(t => t.id === parseInt(teacherId || '0'));
    }, [teachers, teacherId]);

    /**
     * Memoiza el cálculo de las horas del mes. Este es el núcleo de la lógica de la página.
     * Se recalcula solo si los datos relevantes (clases, profesor, fecha) cambian.
     */
    const monthlySummary = useMemo(() => {
        if (!teacher) return { totalHours: 0, totalSubstitutionHours: 0, classesByCourse: [] };

        const firstDay = new Date(viewingDate.getFullYear(), viewingDate.getMonth(), 1);
        const lastDay = new Date(viewingDate.getFullYear(), viewingDate.getMonth() + 1, 0);

        // 1. Filtra las clases que son del profesor, del mes actual y que han sido marcadas como "Hecha".
        const relevantClasses = courseClasses.filter(c => 
            c.teacherId === teacher.id &&
            c.status === 'Hecha' &&
            new Date(c.date) >= firstDay &&
            new Date(c.date) <= lastDay
        );

        // 2. Agrupa las clases por curso y calcula las horas.
        const byCourse = relevantClasses.reduce((acc, classItem) => {
            const course = courses.find(cr => cr.id === classItem.courseId);
            if (!course) return acc;

            const classroom = classrooms.find(cl => cl.id === (classItem.classroomId || course.classroomId));
            const duration = calculateDuration(classItem.startTime, classItem.endTime);

            // Si es la primera vez que vemos este curso, lo inicializamos en el acumulador.
            if (!acc[course.id]) {
                acc[course.id] = { 
                    courseName: course.name, 
                    hours: 0, 
                    substitutionHours: 0, 
                    location: classroom?.location || 'N/A' 
                };
            }
            
            // Suma la duración al total de horas normales o de sustitución.
            if (classItem.isSubstitution) {
                acc[course.id].substitutionHours += duration;
            } else {
                acc[course.id].hours += duration;
            }
            
            return acc;
        }, {} as Record<number, { courseName: string, hours: number, substitutionHours: number, location: string }>);

        // 3. Calcula los totales generales.
        const classesByCourse = Object.values(byCourse);
        const totalHours = classesByCourse.reduce((sum, item: any) => sum + item.hours, 0);
        const totalSubstitutionHours = classesByCourse.reduce((sum, item: any) => sum + item.substitutionHours, 0);

        return { totalHours, totalSubstitutionHours, classesByCourse };

    }, [teacher, courseClasses, viewingDate, courses, classrooms]);

    if (!teacher) {
        return <div className="p-8 text-center">Profesor no encontrado.</div>;
    }

    // Función para cambiar de mes.
    const handleMonthChange = (amount: number) => {
        setViewingDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Resumen de horas</h1>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16} />} onClick={goBack}>Volver</Button>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {/* Navegador de Mes */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{teacher.name} {teacher.lastName}</h2>
                    <div className="flex justify-center items-center gap-4 mt-2">
                        <Button variant="ghost" size="sm" onClick={() => handleMonthChange(-1)} leftIcon={<ChevronLeft />}>Mes anterior</Button>
                        <span className="font-semibold text-lg capitalize w-48 text-center text-gray-800 dark:text-gray-200">
                            {viewingDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => handleMonthChange(1)} rightIcon={<ChevronRight />}>Mes siguiente</Button>
                    </div>
                </div>

                {/* Barra de Totales */}
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg flex flex-col md:flex-row justify-around font-bold mb-6 text-center">
                    <span className="text-blue-800 dark:text-blue-200">Total Horas: {monthlySummary.totalHours.toFixed(2)}</span>
                    <span className="text-blue-800 dark:text-blue-200">Total horas substitución: {monthlySummary.totalSubstitutionHours.toFixed(2)}</span>
                </div>

                {/* Tabla de Horas por Curso */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-gray-600 dark:text-gray-300">Curso</th>
                                <th className="px-6 py-3 text-left text-gray-600 dark:text-gray-300">Horas este mes</th>
                                <th className="px-6 py-3 text-left text-gray-600 dark:text-gray-300">Sustitución</th>
                                <th className="px-6 py-3 text-left text-gray-600 dark:text-gray-300">Localización</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {monthlySummary.classesByCourse.map((item: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{item.courseName}</td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{item.hours.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{item.substitutionHours > 0 ? `Sí (${item.substitutionHours.toFixed(2)}h)` : 'No'}</td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{item.location}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {monthlySummary.classesByCourse.length === 0 && (
                        <p className="text-center py-8 text-gray-500 dark:text-gray-400">No hay horas registradas para este mes.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherHoursPage;