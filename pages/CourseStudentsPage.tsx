
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import { MoveLeft, Trash2, UserPlus, RefreshCw, Download, Mail, FileSignature, FilePlus, Send, Repeat, Search, Check, X, Calendar, FileText, Receipt, FileInput, ShieldCheck, Settings, MoreHorizontal, Phone, MessageSquare } from 'lucide-react';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { getRandomColor, calculateAge, formatDate, isSameDayMonth, checkBirthdayVisibility } from '../utils/helpers';
import { Student, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';
import BirthdayIcon from '../components/ui/BirthdayIcon';
import DebtAlertIcon from '../components/ui/DebtAlertIcon';

const CourseStudentsPage = () => {
    const { courseId } = useParams();
    const { goBack } = useNavigationHistory();
    const navigate = useNavigate();
    const { courses, studentMap, enrollments, users, attendanceRecords, deleteEnrollments, academyProfile, courseClasses } = useData();
    const { user } = useAuth();
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const course = useMemo(() => courses.find(c => c.id === parseInt(courseId || '0')), [courses, courseId]);
    const teacher = useMemo(() => users.find(u => u.id === course?.teacherId), [users, course]);

    const enrolledStudents = useMemo(() => {
        if (!course) return [];
        const courseEnrollments = enrollments.filter(e => e.courseId === course.id);
        return courseEnrollments.map(enrollment => {
            const student = studentMap[enrollment.studentId];
            return { ...student, enrollment };
        }).filter((s): s is Student & { enrollment: any } => !!s.id);
    }, [course, enrollments, studentMap]);

    // Pre-calcular IDs de clases pasadas de este curso específico
    const pastCourseClassIds = useMemo(() => {
        if (!course) return new Set();
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        
        return new Set(
            courseClasses
                .filter(c => c.courseId === course.id && new Date(c.date) <= now)
                .map(c => c.id)
        );
    }, [courseClasses, course]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedStudentIds(enrolledStudents.map(s => s.id));
        } else {
            setSelectedStudentIds([]);
        }
    };
    
    const handleSelectOne = (id: number) => {
        setSelectedStudentIds(prev =>
            prev.includes(id) ? prev.filter(studentId => studentId !== id) : [...prev, id]
        );
    };

    const handleDelete = () => {
        const enrollmentsToDelete = enrolledStudents
            .filter(s => selectedStudentIds.includes(s.id))
            .map(s => s.enrollment.id);
        deleteEnrollments(enrollmentsToDelete);
        setSelectedStudentIds([]);
        setIsDeleteConfirmOpen(false);
    };

    if (!course) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-semibold">Curso no encontrado</h2>
                <Link to="/courses" className="text-blue-500 hover:underline mt-4 inline-block">Volver a la lista de cursos</Link>
            </div>
        );
    }
    
    const handleSendWhatsAppForStudent = (student: Student) => {
        if (student.phone1) {
             const message = encodeURIComponent(`Hola ${student.firstName}, te contactamos desde el centro.`);
             window.open(`https://wa.me/${student.phone1}?text=${message}`, '_blank');
        }
    }

    const activeEnrollments = enrolledStudents.filter(s => s.enrollment.isActive).length;
    const isTeacher = user?.role === Role.TEACHER;
    const canSeeBirthdays = checkBirthdayVisibility(user?.role, academyProfile);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{course.name} - {teacher?.name} ({course.status})</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Alumnos del curso</p>
                </div>
                 <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">{activeEnrollments} Resultados</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16}/>} onClick={goBack}>Volver</Button>
                    {!isTeacher && (
                        <>
                            <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16}/>} onClick={() => setIsDeleteConfirmOpen(true)} disabled={selectedStudentIds.length === 0}>Borrar</Button>
                            <Button variant="secondary" size="sm" leftIcon={<UserPlus size={16}/>} onClick={() => navigate(`/courses/${courseId}/enroll`)}>Inscribir alumnos</Button>
                            <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={16}/>}>Actualizar recibos</Button>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {/* Simplified Table for Teachers */}
                {isTeacher ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Alumno</th>
                                    <th scope="col" className="px-6 py-3 text-center">Edad</th>
                                    <th scope="col" className="px-6 py-3">Teléfono 1</th>
                                    <th scope="col" className="px-6 py-3">Teléfono 2</th>
                                    <th scope="col" className="px-6 py-3">Email 1</th>
                                    <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrolledStudents.map((student) => {
                                    if (!student.id) return null;
                                    const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();
                                    const avatarColor = getRandomColor(initials);
                                    const isBirthday = canSeeBirthdays && isSameDayMonth(student.birthDate);
                                    return (
                                        <tr key={student.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3 relative">
                                                    <div className="relative inline-block flex-shrink-0 w-9 h-9">
                                                        {student.photoUrl ? (
                                                            <img src={student.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                                                        ) : (
                                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs ${avatarColor}`}>{initials}</div>
                                                        )}
                                                        {isBirthday && <div className="absolute -top-3 -left-2 z-10 pointer-events-none"><BirthdayIcon size={30} /></div>}
                                                    </div>
                                                    <span className="font-medium text-gray-900 dark:text-white">{student.firstName} {student.lastName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">{calculateAge(student.birthDate!)}</td>
                                            <td className="px-6 py-4">{student.phone1}</td>
                                            <td className="px-6 py-4">{student.phone2 || '--'}</td>
                                            <td className="px-6 py-4">{student.email1}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-3">
                                                    <a href={`mailto:${student.email1}`} title="Email" className="text-blue-500 hover:text-blue-600"><Mail size={18}/></a>
                                                    <button onClick={() => handleSendWhatsAppForStudent(student)} title="Whatsapp" className="text-green-500 hover:text-green-600"><MessageSquare size={18}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    // Full view for Admins/Coordinators
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                                <tr>
                                    <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={enrolledStudents.length > 0 && selectedStudentIds.length === enrolledStudents.length} className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500" /></th>
                                    <th scope="col" className="px-6 py-3">Foto</th>
                                    <th scope="col" className="px-6 py-3">Nombre completo</th>
                                    <th scope="col" className="px-6 py-3">Edad</th>
                                    <th scope="col" className="px-6 py-3">Asistencia</th>
                                    <th scope="col" className="px-6 py-3">Informes/notas</th>
                                    <th scope="col" className="px-6 py-3">Recibos</th>
                                    <th scope="col" className="px-6 py-3">Autoriz.</th>
                                    <th scope="col" className="px-6 py-3">¿ACTIVA?</th>
                                    <th scope="col" className="px-6 py-3">ALTA</th>
                                    <th scope="col" className="px-6 py-3">BAJA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrolledStudents.map((student) => {
                                    if (!student.id) return null;
                                    const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();
                                    const avatarColor = getRandomColor(initials);
                                    
                                    // Calcular asistencia usando el set de clases pasadas para este curso
                                    const attendanceCount = attendanceRecords.filter(ar => 
                                        ar.studentId === student.id && 
                                        ar.attended &&
                                        pastCourseClassIds.has(ar.classId)
                                    ).length;

                                    const isBirthday = canSeeBirthdays && isSameDayMonth(student.birthDate);
                                    
                                    return (
                                        <tr key={student.id} className={`border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-gray-600/50 ${!student.enrollment.isActive ? 'bg-red-50 dark:bg-red-900/20 opacity-70' : 'bg-white dark:bg-gray-800'}`}>
                                            <td className="w-4 p-4"><input type="checkbox" checked={selectedStudentIds.includes(student.id!)} onChange={() => handleSelectOne(student.id!)} className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500" /></td>
                                            <td className="px-6 py-4">
                                                <div className="relative inline-block w-10 h-10 flex-shrink-0">
                                                    {student.photoUrl ? (
                                                        <img src={student.photoUrl} alt={`${student.firstName} ${student.lastName}`} className="w-10 h-10 rounded-full object-cover" />
                                                    ) : (
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${avatarColor}`}>{initials}</div>
                                                    )}
                                                    {isBirthday && <div className="absolute -top-3 -left-2 z-10 pointer-events-none"><BirthdayIcon size={30} /></div>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <DebtAlertIcon studentId={student.id} />
                                                    <Link to={`/students/${student.id}/edit`} className="hover:underline">
                                                        {student.firstName} {student.lastName}
                                                    </Link>
                                                </div>
                                            </td>
                                            {/* ... rest of columns ... */}
                                            <td className="px-6 py-4">{calculateAge(student.birthDate!)}</td>
                                            <td className="px-6 py-4">
                                                <Link to={`/students/${student.id}/attendance?courseId=${courseId}`} className="flex items-center gap-1 text-blue-500 hover:underline">
                                                    <Calendar size={14}/>
                                                    <span>{attendanceCount}</span>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4"><div className="flex items-center gap-1 text-red-500"><FileText size={14}/><span>{student.stats?.invoices}</span></div></td>
                                            <td className="px-6 py-4">
                                                <Link to={`/students/${student.id}/receipts?courseId=${courseId}`} className="flex items-center gap-1 text-blue-500 hover:underline">
                                                    <Receipt size={14}/><span>{student.stats?.receipts}</span>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link to={`/students/${student.id}/authorizations`} className="flex items-center gap-1 text-blue-500 hover:underline">
                                                    <ShieldCheck size={14}/><span>{student.stats?.authorizations}</span>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => navigate(`/enrollments/${student.enrollment.id}/cancel`)}>
                                                    {student.enrollment.isActive ? <Check size={20} className="text-green-500"/> : <X size={20} className="text-red-500"/>}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">{formatDate(student.enrollment.enrollmentDate)}</td>
                                            <td className="px-6 py-4">{formatDate(student.enrollment.cancellationDate)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {!isTeacher && (
                <ConfirmationModal
                    isOpen={isDeleteConfirmOpen}
                    onClose={() => setIsDeleteConfirmOpen(false)}
                    onConfirm={handleDelete}
                    title="Confirmar Borrado de Inscripción"
                    message={`¿Estás seguro de que quieres borrar las inscripciones seleccionadas?`}
                    confirmText="Dar de Baja"
                />
            )}
        </div>
    );
};

export default CourseStudentsPage;
