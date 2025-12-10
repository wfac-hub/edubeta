import React, { useState, useMemo } from 'react';
import { Course, Student, Enrollment } from '../types';
import { useData } from '../contexts/DataContext';
import Button from './ui/Button';
import { X } from 'lucide-react';

/**
 * Genera un color de fondo determinista basado en una cadena (por ejemplo, iniciales).
 */
const getRandomColor = (char: string) => {
    if (!char) return '#64748b'; // color por defecto
    let hash = 0;
    for (let i = 0; i < char.length; i++) {
        hash = char.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316'];
    const index = Math.abs(hash % colors.length);
    return colors[index];
};

/**
 * Un modal que muestra el seguimiento de la asistencia de todos los alumnos de un curso,
 * con la capacidad de filtrar por mes. Estilos optimizados para día/noche.
 */
function StudentTrackingModal({ course, onClose }: { course: Course | null; onClose: () => void; }) {
    if (!course) return null;

    const { students, enrollments, courseClasses, attendanceRecords } = useData();
    
    /**
     * Calcula y memoiza la lista de meses que abarca el curso.
     * @returns {string[]} Un array de etiquetas de mes-año (ej., "Sep 25").
     */
    const courseMonths = useMemo(() => {
        const months = new Set<string>();
        const start = new Date(course.startDate);
        const end = new Date(course.endDate);
        let current = new Date(start.getUTCFullYear(), start.getUTCMonth(), 1);
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        while (current <= end) {
            const monthLabel = `${monthNames[current.getMonth()]} ${String(current.getFullYear()).slice(-2)}`;
            months.add(monthLabel);
            current.setMonth(current.getMonth() + 1);
        }
        return Array.from(months);
    }, [course.startDate, course.endDate]);

    /**
     * Convierte una etiqueta de mes-año a una clave `YYYY-MM`.
     */
    const monthYearToKey = (monthYear: string): string => {
        if (monthYear === 'Total') return 'total';
        const [monthStr, yearStr] = monthYear.split(' ');
        const monthMap: { [key: string]: number } = {'Ene': 0, 'Feb': 1, 'Mar': 2, 'Abr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Ago': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dic': 11};
        const month = monthMap[monthStr];
        const year = 2000 + parseInt(yearStr);
        return `${year}-${String(month).padStart(2, '0')}`;
    };
    
    // Estado para el mes actualmente seleccionado para filtrar las estadísticas.
    const [activeMonthKey, setActiveMonthKey] = useState('total');

    /**
     * Obtiene la lista de alumnos inscritos en el curso.
     */
    const enrolledStudents = useMemo(() => {
        const studentEnrollments = enrollments.filter(e => e.courseId === course.id);
        return studentEnrollments.map(enrollment => {
            const student = students.find(s => s.id === enrollment.studentId);
            return { student, enrollment };
        }).filter((item): item is { student: Student; enrollment: Enrollment } => !!item.student)
          .sort((a, b) => a.student.lastName.localeCompare(b.student.lastName));
    }, [course.id, enrollments, students]);

    /**
     * Calcula las estadísticas de asistencia para cada alumno.
     * Se recalcula si cambian los alumnos, las clases, los registros de asistencia o el mes activo.
     */
    const studentStats = useMemo(() => {
        return enrolledStudents.map(({ student, enrollment }) => {

            // Filtra las clases relevantes para el alumno y el mes seleccionado.
            const classesForStudent = courseClasses.filter(c => {
                if (c.courseId !== course.id) return false;
                
                const classDate = new Date(c.date);
                classDate.setUTCHours(0,0,0,0);
                const enrollmentDate = new Date(enrollment.enrollmentDate);
                enrollmentDate.setUTCHours(0,0,0,0);
                if (classDate < enrollmentDate) return false;

                if (enrollment.cancellationDate) {
                    const cancellationDate = new Date(enrollment.cancellationDate);
                    cancellationDate.setUTCHours(0,0,0,0);
                    if (classDate > cancellationDate) return false;
                }
                
                if (activeMonthKey === 'total') return true;
                
                const [year, month] = activeMonthKey.split('-');
                return c.date.getUTCFullYear() === parseInt(year) && c.date.getUTCMonth() === parseInt(month);
            });

            const records = attendanceRecords.filter(ar => 
                ar.studentId === student.id && classesForStudent.some(c => c.id === ar.classId)
            );

            const stats = {
                asistencias: records.filter(r => r.attended).length,
                faltas: records.filter(r => !r.attended).length,
                justificadas: records.filter(r => !r.attended && r.absenceJustified).length,
                noJustificadas: records.filter(r => !r.attended && !r.absenceJustified).length,
                retrasos: records.filter(r => r.late !== 'No').length,
                deberesHechos: records.filter(r => r.attended && r.homeworkDone).length,
                deberesNoHechos: records.filter(r => r.attended && !r.homeworkDone).length,
            };

            return { student, enrollment, stats };
        });
    }, [enrolledStudents, courseClasses, attendanceRecords, activeMonthKey, course.id]);

    const title = `Seguimiento de los alumnos por el curso`;
    const subTitle = `${course.name}`;

    return (
        <div 
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-primary-950 dark:bg-slate-900 text-white p-4 rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm opacity-80">{title}</p>
                            <h2 className="text-xl font-bold">{subTitle}</h2>
                        </div>
                         <button onClick={onClose} aria-label="Cerrar" className="text-white/70 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="px-6 py-3 border-b border-gray-200 dark:border-slate-700 overflow-x-auto hide-scrollbar">
                     <div className="flex items-center space-x-2">
                        {['Total', ...courseMonths].map(month => (
                             <button 
                                key={month} 
                                onClick={() => setActiveMonthKey(monthYearToKey(month))}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${monthYearToKey(month) === activeMonthKey ? 'bg-green-500 text-white shadow-sm' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'}`}
                             >
                                {month}
                             </button>
                        ))}
                     </div>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    <table className="min-w-full text-sm text-left">
                        <thead className="sticky top-0 bg-white dark:bg-slate-800 shadow-sm z-10">
                            <tr>
                                <th rowSpan={2} className="px-4 py-3 border-b border-r dark:border-slate-700 font-medium text-gray-600 dark:text-gray-300">Alumno</th>
                                <th colSpan={5} className="px-4 py-2 border-b text-center text-orange-600 dark:text-orange-400 font-semibold">Asistencia</th>
                                <th colSpan={2} className="px-4 py-2 border-b border-l dark:border-slate-700 text-center text-blue-600 dark:text-blue-400 font-semibold">Deberes</th>
                            </tr>
                            <tr className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50">
                                <th className="px-2 py-2 font-medium text-center">Asistencias</th>
                                <th className="px-2 py-2 font-medium text-center">Faltas</th>
                                <th className="px-2 py-2 font-medium text-center">Justificadas</th>
                                <th className="px-2 py-2 font-medium text-center">No justificadas</th>
                                <th className="px-2 py-2 font-medium text-center border-r dark:border-slate-700">Retrasos</th>
                                <th className="px-2 py-2 font-medium text-center">Días hechos</th>
                                <th className="px-2 py-2 font-medium text-center">Días no hechos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentStats.map(({ student, enrollment, stats }) => {
                                const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();
                                const avatarColor = getRandomColor(initials);
                                const isInactive = !enrollment.isActive;
                                return (
                                <tr key={student.id} className={`border-b dark:border-slate-700 ${isInactive ? 'bg-red-50 dark:bg-red-900/20 opacity-70' : ''}`}>
                                    <td className="px-4 py-2 border-r dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-xs" style={{backgroundColor: avatarColor}}>
                                                {initials}
                                            </div>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{student.lastName}, {student.firstName}</span>
                                        </div>
                                    </td>
                                    <td className="text-center px-2 py-2 font-medium text-gray-800 dark:text-gray-200">{stats.asistencias}</td>
                                    <td className="text-center px-2 py-2 font-medium text-gray-800 dark:text-gray-200">{stats.faltas}</td>
                                    <td className="text-center px-2 py-2">{stats.justificadas}</td>
                                    <td className="text-center px-2 py-2">{stats.noJustificadas}</td>
                                    <td className="text-center px-2 py-2 border-r dark:border-slate-700">{stats.retrasos}</td>
                                    <td className="text-center px-2 py-2 font-medium text-gray-800 dark:text-gray-200">{stats.deberesHechos}</td>
                                    <td className="text-center px-2 py-2 font-medium text-gray-800 dark:text-gray-200">{stats.deberesNoHechos}</td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                 <div className="p-4 bg-gray-100 dark:bg-slate-900/50 border-t dark:border-slate-700 flex justify-end rounded-b-lg">
                    <Button variant="secondary" onClick={onClose}>Cerrar</Button>
                </div>
            </div>
        </div>
    );
}

export default StudentTrackingModal;
