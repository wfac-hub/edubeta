import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Course } from '../types';
import Button from '../components/ui/Button';
import { MoveLeft, Search, Users, Calendar as CalendarIcon, Check, X, Pencil, MoreHorizontal } from 'lucide-react';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import ScheduleSelectionModal from '../components/ScheduleSelectionModal';
import Modal from '../components/ui/Modal';
import CourseForm from '../components/CourseForm';

const LevelCoursesPage = () => {
    const { levelId } = useParams();
    const { goBack } = useNavigationHistory();
    const { courseLevels, courses, teachers, enrollments, schedules, updateCourse } = useData();

    const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    
    const [togglingCourse, setTogglingCourse] = useState<Course | null>(null);
    const [scheduleModalCourse, setScheduleModalCourse] = useState<Course | null>(null);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    const level = useMemo(() => courseLevels.find(l => l.id === parseInt(levelId || '0')), [courseLevels, levelId]);

    const levelCourses = useMemo(() => {
        if (!level) return [];
        return courses
            .filter(course => course.level === level.name)
            .filter(course => course.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [level, courses, searchTerm]);

    if (!level) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-semibold">Nivel no encontrado</h2>
                <Link to="/center-management/level-grouping" className="text-blue-500 hover:underline mt-4 inline-block">Volver a agrupaciones</Link>
            </div>
        );
    }
    
    const getTeacherName = (teacherId: number) => {
        const teacher = teachers.find(t => t.id === teacherId);
        return teacher ? `${teacher.name} ${teacher.lastName}` : 'N/A';
    };

    const handleToggleActive = (course: Course) => {
        setTogglingCourse(course);
    };

    const confirmToggleActive = () => {
        if (togglingCourse) {
            updateCourse({ ...togglingCourse, isActive: !togglingCourse.isActive });
            setTogglingCourse(null);
        }
    };
    
    const handleSaveSchedules = (updatedScheduleIds: number[]) => {
        if (scheduleModalCourse) {
            updateCourse({ ...scheduleModalCourse, scheduleIds: updatedScheduleIds });
        }
        setScheduleModalCourse(null);
    };
    
    const handleSaveCourse = (courseToSave: Course) => {
        updateCourse(courseToSave);
        setEditingCourse(null);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedCourses(e.target.checked ? levelCourses.map(c => c.id) : []);
    };

    const handleSelectOne = (id: number) => {
        setSelectedCourses(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
    };

    const formatDescriptiveName = (course: Course) => {
        const teacherName = getTeacherName(course.teacherId);
        const statusText = course.isActive ? 'Activo' : (course.status === 'Completado' ? 'Cerrado' : 'Inactivo');
        return `${course.name} - ${teacherName} (${statusText})`;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Cursos del nivel – {level.name}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cursos asociados al nivel</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16} />} onClick={goBack}>Volver</Button>
                    <div className="flex-grow"></div>
                    <div className="relative w-full sm:w-64">
                         <input
                            type="text"
                            placeholder="Buscar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-4 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {/* Mobile View */}
                <div className="md:hidden divide-y divide-gray-200 dark:divide-slate-700">
                    {levelCourses.map(course => {
                        const activeEnrollments = enrollments.filter(e => e.courseId === course.id && e.isActive).length;
                        return (
                             <div key={course.id} className={`group ${!course.isActive ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                                <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === course.id ? null : course.id)}>
                                    <input type="checkbox" checked={selectedCourses.includes(course.id)} onChange={() => handleSelectOne(course.id)} onClick={e => e.stopPropagation()} className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 mt-1" />
                                    <div className="flex-grow">
                                        <button onClick={(e) => { e.stopPropagation(); setEditingCourse(course); }} className="font-medium text-blue-600 dark:text-blue-400 hover:underline text-left">
                                            {formatDescriptiveName(course)}
                                        </button>
                                    </div>
                                    <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === course.id ? 'rotate-90' : ''}`} />
                                </div>
                                 <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === course.id ? 'max-h-[500px]' : ''}`}>
                                    <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-2">
                                         <div className="flex justify-between"><span className="font-semibold">Alumnos:</span> <Link to={`/courses/${course.id}/students`} onClick={e => e.stopPropagation()} className="flex items-center gap-2 text-blue-500 font-semibold hover:underline"><Users size={16}/><span>{activeEnrollments}</span></Link></div>
                                         <div className="flex justify-between"><span className="font-semibold">Profesor/a:</span> <span>{getTeacherName(course.teacherId)}</span></div>
                                         <div className="flex justify-between"><span className="font-semibold">Horarios:</span> <button onClick={(e) => { e.stopPropagation(); setScheduleModalCourse(course); }} className="flex items-center gap-2 text-blue-500 font-semibold hover:underline"><CalendarIcon size={16}/><span>{course.scheduleIds.length}</span></button></div>
                                         <div className="flex justify-between"><span className="font-semibold">Fecha inicio:</span> <span>{new Date(course.startDate).toLocaleDateString()}</span></div>
                                         <div className="flex justify-between"><span className="font-semibold">Fecha fin:</span> <span>{new Date(course.endDate).toLocaleDateString()}</span></div>
                                         <div className="flex justify-between"><span className="font-semibold">Activo:</span> <button onClick={(e) => { e.stopPropagation(); handleToggleActive(course);}}>{course.isActive ? <Check size={20} className="text-green-500"/> : <X size={20} className="text-red-500"/>}</button></div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block">
                    <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                            <tr>
                                <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={selectedCourses.length > 0 && selectedCourses.length === levelCourses.length} className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700" /></th>
                                <th scope="col" className="px-6 py-3">Id</th>
                                <th scope="col" className="px-6 py-3">Alumnos</th>
                                <th scope="col" className="px-6 py-3">Profesor/a</th>
                                <th scope="col" className="px-6 py-3">Horarios</th>
                                <th scope="col" className="px-6 py-3">Fecha inicio curso</th>
                                <th scope="col" className="px-6 py-3">Fecha fin curso</th>
                                <th scope="col" className="px-6 py-3">¿Activo?</th>
                            </tr>
                        </thead>
                        <tbody>
                           {levelCourses.map(course => {
                                const activeEnrollments = enrollments.filter(e => e.courseId === course.id && e.isActive).length;
                                return (
                                <tr key={course.id} className={`border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50 ${!course.isActive ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-slate-800'}`}>
                                    <td className="w-4 p-4">
                                        <input type="checkbox" checked={selectedCourses.includes(course.id)} onChange={() => handleSelectOne(course.id)} className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700" />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setEditingCourse(course)} className="text-gray-400 hover:text-primary-600"><Pencil size={14} /></button>
                                            <button onClick={() => setEditingCourse(course)} className="hover:underline text-left">
                                                {formatDescriptiveName(course)}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link to={`/courses/${course.id}/students`} className="flex items-center gap-2 text-blue-500 font-semibold hover:underline">
                                            <Users size={16}/>
                                            <span>{activeEnrollments}</span>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">{getTeacherName(course.teacherId)}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => setScheduleModalCourse(course)} className="flex items-center gap-2 text-blue-500 font-semibold hover:underline">
                                            <CalendarIcon size={16}/>
                                            <span>{course.scheduleIds.length}</span>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">{new Date(course.startDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{new Date(course.endDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleToggleActive(course)}>
                                            {course.isActive ? <Check size={20} className="text-green-500"/> : <X size={20} className="text-red-500"/>}
                                        </button>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                 {levelCourses.length === 0 && (
                    <p className="text-center py-8 text-gray-500">No hay cursos asociados a este nivel.</p>
                )}
            </div>

            <ConfirmationModal
                isOpen={!!togglingCourse}
                onClose={() => setTogglingCourse(null)}
                onConfirm={confirmToggleActive}
                title="Confirmar cambio de estado"
                message={`¿Estás seguro de que quieres ${togglingCourse?.isActive ? 'desactivar' : 'activar'} el curso "${togglingCourse?.name}"?`}
            />

            {scheduleModalCourse && (
                <ScheduleSelectionModal
                    isOpen={!!scheduleModalCourse}
                    onClose={() => setScheduleModalCourse(null)}
                    course={scheduleModalCourse}
                    onSave={handleSaveSchedules}
                />
            )}
            
            <Modal
                isOpen={!!editingCourse}
                onClose={() => setEditingCourse(null)}
                title={editingCourse ? `Editar Curso: ${editingCourse.name}` : 'Alta de Nuevo Curso'}
            >
                <CourseForm
                    course={editingCourse}
                    onSave={handleSaveCourse}
                    onClose={() => setEditingCourse(null)}
                />
            </Modal>
        </div>
    );
};

export default LevelCoursesPage;
