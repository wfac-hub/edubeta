


import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import { MoveLeft, Trash2, UserPlus, Search, Check, X, Calendar, FileText, Receipt, MoreHorizontal } from 'lucide-react';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import EnrollCourseModal from '../components/modals/EnrollCourseModal';
import { NewEnrollment } from '../types';

const StudentCoursesPage = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const { students, courses, enrollments, teachers, classrooms, deleteEnrollments, addEnrollments, attendanceRecords, reports } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

    const student = useMemo(() => students.find(s => s.id === parseInt(studentId || '0')), [students, studentId]);

    const studentCourses = useMemo(() => {
        if (!student) return [];
        return enrollments
            .filter(e => e.studentId === student.id)
            .map(e => {
                const course = courses.find(c => c.id === e.courseId);
                return { course, enrollment: e };
            })
            .filter(item => item.course)
            .filter(item => item.course!.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [student, enrollments, courses, searchTerm]);

    if (!student) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-semibold">Alumno no encontrado</h2>
                <Link to="/students" className="text-blue-500 hover:underline mt-4 inline-block">Volver a la lista de alumnos</Link>
            </div>
        );
    }
    
    const handleDelete = () => {
        const enrollmentsToDelete = studentCourses
            .filter(sc => selectedCourses.includes(sc.course!.id))
            .map(sc => sc.enrollment.id);
        
        deleteEnrollments(enrollmentsToDelete);
        setSelectedCourses([]);
        setIsDeleteConfirmOpen(false);
    };

    const handleEnroll = (courseIds: number[]) => {
        const enrollmentsToAdd: NewEnrollment[] = courseIds.map(courseId => ({
            studentId: student.id,
            courseId,
            enrollmentDate: new Date().toISOString().split('T')[0],
            isActive: true,
        }));
        addEnrollments(enrollmentsToAdd);
        setIsEnrollModalOpen(false);
    };

    const getTeacherName = (teacherId: number) => teachers.find(t => t.id === teacherId)?.name || 'N/A';
    const getClassroom = (classroomId: number) => classrooms.find(c => c.id === classroomId);
    const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleDateString('es-ES') : '--';

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedCourses(studentCourses.map(sc => sc.course!.id));
        } else {
            setSelectedCourses([]);
        }
    };

    const handleSelectOne = (id: number) => {
        setSelectedCourses(prev => prev.includes(id) ? prev.filter(courseId => courseId !== id) : [...prev, id]);
    };
    
    const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();

    const coursesToDeleteNames = studentCourses
        .filter(sc => selectedCourses.includes(sc.course!.id))
        .map(sc => sc.course!.name);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-2xl bg-green-500">
                        {initials}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{student.lastName}, {student.firstName}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cursos del alumno/a</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">{studentCourses.length} Resultados</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16}/>} onClick={goBack}>Volver</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16}/>} disabled={selectedCourses.length === 0} onClick={() => setIsDeleteConfirmOpen(true)}>Borrar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<UserPlus size={16}/>} onClick={() => setIsEnrollModalOpen(true)}>Inscribir a cursos</Button>
                    <div className="flex-grow"></div>
                    <div className="relative w-full sm:w-64">
                         <input
                            type="text"
                            placeholder="Buscar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-4 pr-10 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {/* Mobile View */}
                <div className="md:hidden divide-y divide-gray-200 dark:divide-slate-700">
                    {studentCourses.map(({ course, enrollment }) => {
                        if (!course) return null;
                        const classroom = getClassroom(course.classroomId);
                        const attendanceCount = attendanceRecords.filter(ar => ar.studentId === student.id && ar.classId.startsWith(`${course.id}-`) && ar.attended).length;
                        const reportsCount = reports.filter(r => r.studentId === student.id && r.courseId === course.id).length;
                        
                        return (
                             <div key={course.id} className={`group ${!course.isActive || !enrollment.isActive ? 'bg-red-50 dark:bg-red-900/20 opacity-70' : ''}`}>
                                <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === course.id ? null : course.id)}>
                                    <input type="checkbox" checked={selectedCourses.includes(course.id)} onChange={() => handleSelectOne(course.id)} onClick={e => e.stopPropagation()} className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 mt-1" />
                                    <div className="flex-grow">
                                        <Link to={`/courses/${course.id}/students`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                            {course.name} ({course.status})
                                        </Link>
                                    </div>
                                    <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === course.id ? 'rotate-90' : ''}`} />
                                </div>
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === course.id ? 'max-h-[500px]' : ''}`}>
                                    <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-2">
                                        <div className="flex justify-between"><span className="font-semibold">Profesor/a:</span> <span>{getTeacherName(course.teacherId)}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">Modalidad:</span> <span>{course.modality}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">Aula:</span> <span>{classroom?.name} ({classroom?.location})</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">Fecha Inicio:</span> <span>{formatDate(course.startDate)}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">Fecha Fin:</span> <span>{formatDate(course.endDate)}</span></div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">Asistencia:</span> 
                                            <Link to={`/students/${student.id}/attendance?courseId=${course.id}`} className="flex items-center gap-1 text-blue-500 hover:underline">
                                                <Calendar size={14}/>
                                                <span>{attendanceCount}</span>
                                            </Link>
                                        </div>
                                        <div className="flex justify-between items-center"><span className="font-semibold">Informes/notas:</span> 
                                            <Link to={`/grade-reports/reports?studentId=${student.id}&courseId=${course.id}`} className="flex items-center gap-1 text-blue-500 hover:underline">
                                                <FileText size={14}/><span>{reportsCount}</span>
                                            </Link>
                                        </div>
                                        <div className="flex justify-between items-center"><span className="font-semibold">Recibos:</span> 
                                            <Link to={`/students/${student.id}/receipts?courseId=${course.id}`} className="flex items-center gap-1 text-blue-500 hover:underline">
                                                <Receipt size={14}/><span>{student.stats.receipts}</span>
                                            </Link>
                                        </div>
                                        <div className="flex justify-between"><span className="font-semibold">Inscripción activa:</span> <button onClick={() => navigate(`/enrollments/${enrollment.id}/cancel`)}>{enrollment.isActive ? <Check size={20} className="text-green-500"/> : <X size={20} className="text-red-500"/>}</button></div>
                                        <div className="flex justify-between"><span className="font-semibold">Fecha alta:</span> <span>{formatDate(enrollment.enrollmentDate)}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">Fecha baja:</span> <span>{formatDate(enrollment.cancellationDate)}</span></div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                            <tr>
                                <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={studentCourses.length > 0 && selectedCourses.length === studentCourses.length} className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"/></th>
                                <th scope="col" className="px-6 py-3">Curso</th>
                                <th scope="col" className="px-6 py-3">Profesor/a</th>
                                <th scope="col" className="px-6 py-3">Modalidad</th>
                                <th scope="col" className="px-6 py-3">Aula</th>
                                <th scope="col" className="px-6 py-3">Fecha inicio</th>
                                <th scope="col" className="px-6 py-3">Fecha fin</th>
                                <th scope="col" className="px-6 py-3">Asistencia</th>
                                <th scope="col" className="px-6 py-3">Informes/notas</th>
                                <th scope="col" className="px-6 py-3">Recibos</th>
                                <th scope="col" className="px-6 py-3">¿Activo?</th>
                                <th scope="col" className="px-6 py-3">ALTA</th>
                                <th scope="col" className="px-6 py-3">BAJA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentCourses.map(({ course, enrollment }) => {
                                if (!course) return null;
                                const classroom = getClassroom(course.classroomId);
                                const attendanceCount = attendanceRecords.filter(ar => ar.studentId === student.id && ar.classId.startsWith(`${course.id}-`) && ar.attended).length;
                                const reportsCount = reports.filter(r => r.studentId === student.id && r.courseId === course.id).length;

                                return (
                                    <tr key={course.id} className={`border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50 ${!course.isActive || !enrollment.isActive ? 'bg-red-50 dark:bg-red-900/20 opacity-70' : 'bg-white dark:bg-slate-800'}`}>
                                        <td className="p-4"><input type="checkbox" checked={selectedCourses.includes(course.id)} onChange={() => handleSelectOne(course.id)} className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"/></td>
                                        <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                            <Link to={`/courses/${course.id}/students`} className="hover:underline">{course.name} ({course.status})</Link>
                                        </td>
                                        <td className="px-6 py-4">{getTeacherName(course.teacherId)}</td>
                                        <td className="px-6 py-4">{course.modality}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: classroom?.color || '#A0AEC0'}}></div>
                                                <div>
                                                    <div className="font-semibold text-gray-800 dark:text-gray-200">{classroom?.name}</div>
                                                    <div className="text-xs text-gray-500">{classroom?.location}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{formatDate(course.startDate)}</td>
                                        <td className="px-6 py-4">{formatDate(course.endDate)}</td>
                                        <td className="px-6 py-4">
                                            <Link to={`/students/${student.id}/attendance?courseId=${course.id}`} className="flex items-center gap-1 text-blue-500 hover:underline">
                                                <Calendar size={14}/>
                                                <span>{attendanceCount}</span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                             <Link to={`/grade-reports/reports?studentId=${student.id}&courseId=${course.id}`} className="flex items-center gap-1 text-blue-500 hover:underline">
                                                <FileText size={14}/><span>{reportsCount}</span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/students/${student.id}/receipts?courseId=${course.id}`} className="flex items-center gap-1 text-blue-500 hover:underline">
                                                <Receipt size={14}/><span>{student.stats.receipts}</span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => navigate(`/enrollments/${enrollment.id}/cancel`)}>
                                                {enrollment.isActive ? <Check size={20} className="text-green-500"/> : <X size={20} className="text-red-500"/>}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">{formatDate(enrollment.enrollmentDate)}</td>
                                        <td className="px-6 py-4">{formatDate(enrollment.cancellationDate)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {studentCourses.length === 0 && <p className="text-center py-8 text-gray-500">Este alumno no está inscrito en ningún curso.</p>}
            </div>

            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Confirmar Baja del Curso"
                message={
                    <div>
                        <p>¿Estás seguro que quieres dar de baja a {student.firstName} de los siguientes cursos?</p>
                        <ul className="list-disc list-inside my-2 bg-red-50 dark:bg-red-900/50 p-2 rounded">
                            {coursesToDeleteNames.map(name => <li key={name}>{name}</li>)}
                        </ul>
                         <p>Esta acción no se puede deshacer.</p>
                    </div>
                }
                confirmText="Dar de Baja"
            />

            {isEnrollModalOpen && (
                <EnrollCourseModal
                    isOpen={isEnrollModalOpen}
                    onClose={() => setIsEnrollModalOpen(false)}
                    student={student}
                    onSave={handleEnroll}
                />
            )}
        </div>
    );
};

export default StudentCoursesPage;