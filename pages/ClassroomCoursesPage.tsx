
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import { MoveLeft, Trash2, Pencil, Search, Users, Monitor, Building as BuildingIcon, Check, X, Folder, Calendar, MoreHorizontal } from 'lucide-react';
import { Course } from '../types';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';

const ClassroomCoursesPage = () => {
    const { classroomId } = useParams();
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const { courses, teachers, classrooms, locations, enrollments } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const classroom = useMemo(() => classrooms.find(c => c.id === parseInt(classroomId || '0')), [classrooms, classroomId]);
    const location = useMemo(() => locations.find(l => l.name === classroom?.location), [locations, classroom]);
    
    const classroomCourses = useMemo(() => {
        if (!classroom) return [];
        return courses.filter(course =>
            course.classroomId === classroom.id &&
            course.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [classroom, courses, searchTerm]);

    if (!classroom) {
        return <div className="p-8 text-center">Aula no encontrada.</div>;
    }

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedCourses(classroomCourses.map(c => c.id));
        } else {
            setSelectedCourses([]);
        }
    };

    const handleSelectOne = (id: number) => {
        if (selectedCourses.includes(id)) {
            setSelectedCourses(selectedCourses.filter(courseId => courseId !== id));
        } else {
            setSelectedCourses([...selectedCourses, id]);
        }
    };

    const getTeacherName = (teacherId: number) => teachers.find(t => t.id === teacherId)?.name || 'N/A';
    
    const inputClasses = "w-full p-2 pl-4 pr-10 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500";
    const checkboxClasses = "h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Cursos del aula – {classroom.name}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cursos asociados al aula escogida.</p>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Calendar size={24} />
                    <span className="font-semibold">{classroomCourses.length} Resultados</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16} />} onClick={goBack}>Volver</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Pencil size={16} />}>Modificar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />}>Borrar</Button>
                    <div className="flex-grow"></div>
                    <div className="relative w-full sm:w-64">
                         <input
                            type="text"
                            placeholder="Buscar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={inputClasses}
                        />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {/* Mobile View */}
                 <div className="md:hidden divide-y divide-gray-200 dark:divide-slate-700">
                    {classroomCourses.map((course: Course) => {
                        const activeEnrollments = enrollments.filter(e => e.courseId === course.id && e.isActive).length;
                        return (
                            <div key={course.id} className="group">
                                <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === course.id ? null : course.id)}>
                                     <div className="flex items-center gap-2 mt-1">
                                        <input type="checkbox" checked={selectedCourses.includes(course.id)} onChange={() => handleSelectOne(course.id)} onClick={e => e.stopPropagation()} className={checkboxClasses} />
                                        <button className="text-gray-400 hover:text-primary-600"><Pencil size={14} /></button>
                                    </div>
                                    <div className="flex-grow">
                                        <Link to={`/courses/${course.id}/classes`} onClick={e => e.stopPropagation()} className="font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap hover:underline">{course.name}</Link>
                                    </div>
                                    <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === course.id ? 'rotate-90' : ''}`} />
                                </div>
                                 <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === course.id ? 'max-h-[500px]' : ''}`}>
                                    <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-2">
                                        <div className="flex justify-between"><span className="font-semibold">Alumnos:</span> <Link to={`/courses/${course.id}/students`} className="flex items-center gap-1 text-blue-500 hover:underline"><Users size={16} /><span className="font-semibold">{activeEnrollments}</span></Link></div>
                                        <div className="flex justify-between"><span className="font-semibold">Profesor/a:</span> <span>{getTeacherName(course.teacherId)}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">Modalidad:</span> <span>{course.modality}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">Horarios:</span> <div className="flex items-center gap-1"><Monitor size={16} /><span>{course.scheduleIds.length}</span></div></div>
                                        <div className="flex justify-between"><span className="font-semibold">Clases:</span> <Link to={`/courses/${course.id}/classes`} className="flex items-center gap-1 text-blue-500 hover:underline"><BuildingIcon size={16} /><span>{course.classesCount}</span></Link></div>
                                        <div className="flex justify-between"><span className="font-semibold">Recursos:</span> <Link to={`/courses/${course.id}/resources`} className="flex items-center gap-1 text-red-500 hover:underline"><Folder size={16} /><span>{course.resourcesCount}</span></Link></div>
                                        <div className="flex justify-between"><span className="font-semibold">Fecha Inicio:</span> <span>{new Date(course.startDate).toLocaleDateString()}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">Fecha Fin:</span> <span>{new Date(course.endDate).toLocaleDateString()}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">¿Activo?:</span> <span>{course.isActive ? <Check size={20} className="text-green-500" /> : <X size={20} className="text-red-500" />}</span></div>
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
                                <th scope="col" className="p-4">
                                    <input type="checkbox" onChange={handleSelectAll} className={checkboxClasses} />
                                </th>
                                <th scope="col" className="px-6 py-3">Curso</th>
                                <th scope="col" className="px-6 py-3">Alumnos</th>
                                <th scope="col" className="px-6 py-3">Profesor/a</th>
                                <th scope="col" className="px-6 py-3">Modalidad</th>
                                <th scope="col" className="px-6 py-3">Aula</th>
                                <th scope="col" className="px-6 py-3">Horarios</th>
                                <th scope="col" className="px-6 py-3">Clases</th>
                                <th scope="col" className="px-6 py-3">Recur.</th>
                                <th scope="col" className="px-6 py-3">Fecha inicio curso</th>
                                <th scope="col" className="px-6 py-3">Fecha fin curso</th>
                                <th scope="col" className="px-6 py-3">¿Activo?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classroomCourses.map((course: Course) => {
                                const activeEnrollments = enrollments.filter(e => e.courseId === course.id && e.isActive).length;
                                return (
                                    <tr key={course.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50">
                                        <td className="w-4 p-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCourses.includes(course.id)}
                                                    onChange={() => handleSelectOne(course.id)}
                                                    className={checkboxClasses}
                                                />
                                                <button className="text-gray-400 hover:text-primary-600"><Pencil size={14} /></button>
                                            </div>
                                        </td>
                                        <td scope="row" className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap hover:underline">
                                            <Link to={`/courses/${course.id}/classes`}>{course.name}</Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/courses/${course.id}/students`} className="flex items-center gap-1 text-blue-500 hover:underline">
                                                <Users size={16} />
                                                <span className="font-semibold">{activeEnrollments}</span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">{getTeacherName(course.teacherId)}</td>
                                        <td className="px-6 py-4">{course.modality}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: classroom?.color || '#A0AEC0'}}></div>
                                                <div>
                                                    <div className="font-semibold text-gray-800 dark:text-gray-200">{classroom.name}</div>
                                                    <div className="text-xs text-gray-500">{location?.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1"><Monitor size={16} /><span>{course.scheduleIds.length}</span></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/courses/${course.id}/classes`} className="flex items-center gap-1 text-blue-500 hover:underline">
                                                <BuildingIcon size={16} />
                                                <span>{course.classesCount}</span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-red-500">
                                            <Link to={`/courses/${course.id}/resources`} className="flex items-center gap-1 text-red-500 hover:underline">
                                                <Folder size={16} />
                                                <span>{course.resourcesCount}</span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">{new Date(course.startDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">{new Date(course.endDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">{course.isActive ? <Check size={20} className="text-green-500" /> : <X size={20} className="text-red-500" />}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                 {classroomCourses.length === 0 && (
                    <p className="text-center py-8 text-gray-500">No se encontraron cursos para esta aula.</p>
                )}
            </div>
        </div>
    );
};

export default ClassroomCoursesPage;
