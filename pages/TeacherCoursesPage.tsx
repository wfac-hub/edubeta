
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import { MoveLeft, Users, Calendar, Check, X, MoreHorizontal } from 'lucide-react';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { Course } from '../types';

const TeacherCoursesPage = () => {
    const { teacherId } = useParams();
    const { goBack } = useNavigationHistory();
    const { teachers, courses, enrollments, updateCourse } = useData();
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [togglingCourse, setTogglingCourse] = useState<Course | null>(null);

    const teacher = useMemo(() => teachers.find(t => t.id === parseInt(teacherId || '0')), [teachers, teacherId]);
    const teacherCourses = useMemo(() => {
        if (!teacher) return [];
        // Modified logic to include secondary teachers
        return courses.filter(c => c.teacherId === teacher.id || c.secondaryTeacherId === teacher.id);
    }, [teacher, courses]);

    const handleToggleActive = (course: Course) => {
        setTogglingCourse(course);
    };

    const confirmToggleActive = () => {
        if (togglingCourse) {
            updateCourse({ ...togglingCourse, isActive: !togglingCourse.isActive });
            setTogglingCourse(null);
        }
    };

    if (!teacher) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-semibold">Profesor no encontrado</h2>
                <Link to="/teachers" className="text-blue-500 hover:underline mt-4 inline-block">Volver a la lista de profesores</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Cursos del profesor/a: {teacher.name} {teacher.lastName}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Listado de todos los cursos asignados a este profesor (como principal o secundario).
                </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16} />} onClick={goBack}>Volver</Button>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {/* Mobile View */}
                <div className="md:hidden divide-y divide-gray-200 dark:divide-slate-700">
                    {teacherCourses.map(course => {
                        const activeEnrollments = enrollments.filter(e => e.courseId === course.id && e.isActive).length;
                        return (
                            <div key={course.id} className="group">
                                <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === course.id ? null : course.id)}>
                                    <div className="flex-grow">
                                        <Link to={`/courses/${course.id}/classes`} onClick={e => e.stopPropagation()} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">{course.name}</Link>
                                        {course.secondaryTeacherId === teacher.id && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">Secundario</span>}
                                    </div>
                                    <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === course.id ? 'rotate-90' : ''}`} />
                                </div>
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === course.id ? 'max-h-[500px]' : ''}`}>
                                    <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-2">
                                        <div className="flex justify-between"><span className="font-semibold">Alumnos:</span> <Link to={`/courses/${course.id}/students`} className="flex items-center gap-1 text-blue-500 hover:underline"><Users size={16} /><span>{activeEnrollments}</span></Link></div>
                                        <div className="flex justify-between"><span className="font-semibold">Horarios:</span> <div className="flex items-center gap-1"><Calendar size={16} /><span>{course.scheduleIds.length}</span></div></div>
                                        <div className="flex justify-between"><span className="font-semibold">Fecha inicio:</span> <span>{new Date(course.startDate).toLocaleDateString()}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">Fecha fin:</span> <span>{new Date(course.endDate).toLocaleDateString()}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">Activo:</span> <button onClick={(e) => { e.stopPropagation(); handleToggleActive(course);}}>{course.isActive ? <Check size={20} className="text-green-500" /> : <X size={20} className="text-red-500"/>}</button></div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block">
                    <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">Curso</th>
                                <th scope="col" className="px-6 py-3">Rol</th>
                                <th scope="col" className="px-6 py-3">Alumnos</th>
                                <th scope="col" className="px-6 py-3">Horarios</th>
                                <th scope="col" className="px-6 py-3">Fecha inicio curso</th>
                                <th scope="col" className="px-6 py-3">Fecha fin curso</th>
                                <th scope="col" className="px-6 py-3">¿Activo?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teacherCourses.map(course => {
                                const activeEnrollments = enrollments.filter(e => e.courseId === course.id && e.isActive).length;
                                return (
                                    <tr key={course.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                        <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">
                                            <Link to={`/courses/${course.id}/classes`}>{course.name}</Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            {course.teacherId === teacher.id ? 'Principal' : 'Secundario'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/courses/${course.id}/students`} className="flex items-center gap-1 text-blue-500 hover:underline">
                                                <Users size={16} />
                                                <span>{activeEnrollments}</span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1"><Calendar size={16} /><span>{course.scheduleIds.length}</span></div>
                                        </td>
                                        <td className="px-6 py-4">{new Date(course.startDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">{new Date(course.endDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleToggleActive(course)}>
                                                {course.isActive ? <Check size={20} className="text-green-500" /> : <X size={20} className="text-red-500"/>}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {teacherCourses.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">Este profesor no tiene cursos asignados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!togglingCourse}
                onClose={() => setTogglingCourse(null)}
                onConfirm={confirmToggleActive}
                title="Confirmar cambio de estado"
                message={`¿Estás seguro de que quieres ${togglingCourse?.isActive ? 'desactivar' : 'activar'} el curso "${togglingCourse?.name}"?`}
            />
        </div>
    );
};

export default TeacherCoursesPage;
