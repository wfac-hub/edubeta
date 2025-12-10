

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Student, AttendanceRecord, LateType, CourseClass } from '../types';
import Button from '../components/ui/Button';
import { MoveLeft, RefreshCw, Search, Check, X, Mail, MessageSquare, Book, Users, UserCircle2, MoreHorizontal, EyeOff, ArrowRightCircle } from 'lucide-react';
import CommentModal from '../components/CommentModal';
import { getRandomColor, isSameDayMonth, checkBirthdayVisibility } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import BirthdayIcon from '../components/ui/BirthdayIcon';

const StudentStatusIcon = ({ student }: { student: Student }) => {
    const showEyeOff = !student.authorizations.imageRights;
    const showArrow = student.authorizations.canLeaveAlone;

    if (!showEyeOff && !showArrow) {
        return null;
    }

    return (
        <>
            {showEyeOff && (
                <span title="Sin autorización de imagen" className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md z-10">
                    <EyeOff size={10} className="text-red-500" />
                </span>
            )}
            {showArrow && (
                 <span title="Autorizado para salir solo/a" className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md z-10">
                    <ArrowRightCircle size={10} className="text-green-500" />
                </span>
            )}
        </>
    );
};

const AttendancePage = () => {
    const { courseId, classId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { 
        courses, 
        students, 
        users, 
        enrollments, 
        courseClasses, 
        attendanceRecords, 
        updateAttendanceRecord,
        updateCourseClass,
        emailTemplates,
        sendEmail,
        academyProfile
    } = useData();
    
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [commentingClass, setCommentingClass] = useState<CourseClass | null>(null);
    const [activeCommentTab, setActiveCommentTab] = useState<'internal' | 'public' | 'documents'>('internal');
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const course = useMemo(() => courses.find(c => c.id === parseInt(courseId || '0')), [courses, courseId]);
    const courseClass = useMemo(() => courseClasses.find(c => c.id === classId), [courseClasses, classId]);
    const teacher = useMemo(() => users.find(u => u.id === course?.teacherId), [users, course]);

    const enrolledStudents = useMemo(() => {
        if (!course || !courseClass) return [];
        const courseEnrollments = enrollments.filter(e => {
            if (e.courseId !== course.id || !e.isActive) {
                return false;
            }
            const enrollmentDate = new Date(e.enrollmentDate);
            enrollmentDate.setUTCHours(0, 0, 0, 0);
            const classDate = new Date(courseClass.date);
            classDate.setUTCHours(0, 0, 0, 0);
            return enrollmentDate <= classDate;
        });
        
        return courseEnrollments.map(enrollment => {
            return students.find(s => s.id === enrollment.studentId);
        }).filter((s): s is Student => s !== undefined);
    }, [course, courseClass, enrollments, students]);

    const [pageAttendance, setPageAttendance] = useState<AttendanceRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (classId) {
            const initialAttendance = enrolledStudents.map(student => {
                const existingRecord = attendanceRecords.find(ar => ar.classId === classId && ar.studentId === student.id);
                if (existingRecord) {
                    return existingRecord;
                }
                const defaultRecord = {
                    id: `${student.id}-${classId}`,
                    classId: classId!,
                    studentId: student.id,
                    attended: true,
                    late: 'No' as const,
                    absenceJustified: false,
                    homeworkDone: true,
                    comments: ''
                };
                updateAttendanceRecord(defaultRecord);
                return defaultRecord;
            });
            setPageAttendance(initialAttendance);
        }
    }, [enrolledStudents, attendanceRecords, classId, updateAttendanceRecord]);
    
    const filteredStudents = useMemo(() => {
        return enrolledStudents.filter(student => {
            const fullName = `${student.firstName} ${student.lastName}`;
            return fullName.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [enrolledStudents, searchTerm]);


    const handleOpenCommentModal = (classItem: CourseClass) => {
        setCommentingClass(classItem);
        setActiveCommentTab('internal');
        setIsCommentModalOpen(true);
    };

    const handleCloseCommentModal = () => {
        setIsCommentModalOpen(false);
        setCommentingClass(null);
    };

    const handleSaveComment = (updatedClass: CourseClass) => {
        updateCourseClass(updatedClass);
        handleCloseCommentModal();
    };
    
    const handleSendAttendanceEmail = (student: Student) => {
        const template = emailTemplates.find(t => t.systemSlug === 'attendance_warning');
        if (!template) {
            alert("No se encontró la plantilla de sistema 'Aviso de Falta'. Por favor, configúrala en Comunicaciones > Plantillas.");
            return;
        }
        
        if (confirm(`¿Enviar email de aviso de falta a ${student.firstName}?`)) {
            const recipients = [{ email: student.email1, name: `${student.firstName} ${student.lastName}` }];
            sendEmail(template.id, recipients, {
                '#{DATE}#': new Date().toLocaleDateString()
            });
            alert(`Email enviado correctamente a ${student.email1}`);
        }
    };

    const handleAttendanceChange = (studentId: number, field: keyof Omit<AttendanceRecord, 'id' | 'classId' | 'studentId'>, value: any) => {
        setPageAttendance(prevAttendance => 
            prevAttendance.map(record => {
                if (record.studentId === studentId) {
                    const newRecord = { ...record, [field]: value };
                    
                    if (field === 'attended') {
                        if (value === false) { // Became absent
                            newRecord.homeworkDone = false;
                            newRecord.late = 'No';
                            newRecord.absenceJustified = true; // Default to justified
                        } else { // Became present
                            newRecord.absenceJustified = false;
                        }
                    }
                    
                    updateAttendanceRecord(newRecord);
                    return newRecord;
                }
                return record;
            })
        );
    };

    const handleInvertAttendance = () => {
        const studentIdsToInvert = filteredStudents.map(s => s.id);
         setPageAttendance(prevAttendance => 
            prevAttendance.map(record => {
                 if (!studentIdsToInvert.includes(record.studentId)) return record;

                const newRecord = { ...record, attended: !record.attended };
                if (newRecord.attended === false) {
                    newRecord.homeworkDone = false;
                    newRecord.late = 'No';
                    newRecord.absenceJustified = true; // Default to justified
                } else {
                    newRecord.absenceJustified = false;
                }
                updateAttendanceRecord(newRecord);
                return newRecord;
            })
        );
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedStudentIds(filteredStudents.map(s => s.id));
        } else {
            setSelectedStudentIds([]);
        }
    };
    
    const handleSelectOne = (id: number) => {
        setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    };

    if (!course || !courseClass) {
        return <div className="p-8 text-center text-lg">Clase no encontrada.</div>;
    }

    const lateOptions: LateType[] = ['No', '5 minutos tarde', '10 minutos tarde', '15 minutos tarde', '20 minutos tarde', '25 minutos tarde', '30 o más minutos tarde'];
    const canSeeBirthdays = checkBirthdayVisibility(user?.role, academyProfile);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                        Asistencia: <span className="text-primary-600 dark:text-primary-400">{course.name} - {teacher?.name} (Activo)</span>
                    </h1>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                        Día {new Date(courseClass.date).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">{filteredStudents.length} Resultados</span>
                </div>
            </div>

             <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16} />} onClick={() => navigate(-1)}>Volver</Button>
                    <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={16} />} onClick={handleInvertAttendance}>Invertir la asistencia</Button>
                    <div className="flex-grow"></div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenCommentModal(courseClass)}>Interno</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenCommentModal(courseClass)}>Área de alumnos</Button>
                        <Button variant="ghost" size="sm" leftIcon={<Mail size={16}/>}></Button>
                        <Button variant="primary" size="sm" leftIcon={<Book size={16}/>} onClick={() => navigate(`/courses/${courseId}/resources`)}>Recursos curso</Button>
                    </div>
                    <div className="relative w-full sm:w-auto">
                        <input type="text" placeholder="Buscar" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full sm:w-64 p-2 pl-4 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 focus:ring-primary-500 focus:border-primary-500" />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {/* Mobile View */}
                <div className="md:hidden divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredStudents.map((student) => {
                        const record = pageAttendance.find(r => r.studentId === student.id);
                        if (!record) return null;
                        const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();
                        const avatarColor = getRandomColor(initials);
                        const isBirthday = canSeeBirthdays && isSameDayMonth(student.birthDate);

                         return (
                            <div key={student.id} className={`group ${!record.attended ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                                 <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === student.id ? null : student.id)}>
                                     <input type="checkbox" checked={selectedStudentIds.includes(student.id)} onChange={() => handleSelectOne(student.id)} onClick={e => e.stopPropagation()} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500 mt-1"/>
                                     <div className="relative inline-block flex-shrink-0 w-9 h-9">
                                        {student.photoUrl ? (
                                            <img src={student.photoUrl} alt={`${student.firstName} ${student.lastName}`} className="w-9 h-9 rounded-full object-cover" />
                                        ) : (
                                            <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-sm ${avatarColor}`}>{initials}</div>
                                        )}
                                        {isBirthday && <div className="absolute -top-3 -left-2 z-10 pointer-events-none"><BirthdayIcon size={30} /></div>}
                                        <StudentStatusIcon student={student} />
                                     </div>
                                    <div className="flex-grow">
                                        <p className="font-medium text-gray-900 dark:text-white whitespace-nowrap">{student.firstName} {student.lastName}</p>
                                    </div>
                                    <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === student.id ? 'rotate-90' : ''}`} />
                                </div>
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === student.id ? 'max-h-[1000px]' : ''}`}>
                                    <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-4">
                                        <div className="flex justify-between items-center"><span className="font-semibold">¿Ha asistido?:</span> <button onClick={() => handleAttendanceChange(student.id, 'attended', !record.attended)}>{record.attended ? <Check size={20} className="text-green-500"/> : <X size={20} className="text-red-500"/>}</button></div>
                                        <div className="flex justify-between items-center"><span className="font-semibold">¿Con retraso?:</span> <select value={record.late} onChange={(e) => handleAttendanceChange(student.id, 'late', e.target.value as LateType)} disabled={!record.attended} className="p-1 border rounded-md text-xs bg-white dark:bg-gray-900 disabled:bg-gray-100 dark:disabled:bg-gray-700/50">{lateOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                                        {record.attended && record.late !== 'No' && <div className="flex justify-between items-center"><span className="font-semibold">Avisar retraso:</span> <div className="flex items-center gap-1"><Button variant="ghost" size="sm"><Mail size={16} /></Button><Button variant="ghost" size="sm"><MessageSquare size={16} /></Button></div></div>}
                                        {!record.attended && <div className="flex justify-between items-center"><span className="font-semibold">¿Falta justificada?:</span> <select value={String(record.absenceJustified)} onChange={(e) => handleAttendanceChange(student.id, 'absenceJustified', e.target.value === 'true')} className="p-1 border rounded-md text-xs bg-white dark:bg-gray-900"><option value="true">Sí</option><option value="false">No</option></select></div>}
                                        {!record.attended && !record.absenceJustified && <div className="flex justify-between items-center"><span className="font-semibold">Avisar falta:</span> <div className="flex items-center gap-1"><Button variant="ghost" size="sm" onClick={() => handleSendAttendanceEmail(student)}><Mail size={16} /></Button><Button variant="ghost" size="sm"><MessageSquare size={16} /></Button></div></div>}
                                        <div className="flex justify-between items-center"><span className="font-semibold">¿Deberes hechos?:</span> <button onClick={() => handleAttendanceChange(student.id, 'homeworkDone', !record.homeworkDone)} disabled={!record.attended}>{record.homeworkDone ? <Check size={20} className="text-green-500"/> : <div className="w-5 h-5"/>}</button></div>
                                        <div className="flex justify-between items-center"><span className="font-semibold">Comentarios:</span> <button className="text-blue-500 hover:underline text-xs" onClick={() => handleOpenCommentModal(courseClass)}>[ comentarios ]</button></div>
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
                                <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" /></th>
                                <th scope="col" className="px-6 py-3">Alumno</th>
                                <th scope="col" className="px-6 py-3">¿Ha asistido?</th>
                                <th scope="col" className="px-6 py-3">¿Con retraso?</th>
                                <th scope="col" className="px-6 py-3">Avisar del retraso</th>
                                <th scope="col" className="px-6 py-3">¿Falta justificada?</th>
                                <th scope="col" className="px-6 py-3">Avisar de la falta</th>
                                <th scope="col" className="px-6 py-3">¿Deberes hechos?</th>
                                <th scope="col" className="px-6 py-3">Comentarios</th>
                            </tr>
                        </thead>
                        <tbody>
                        {filteredStudents.map(student => {
                            const record = pageAttendance.find(r => r.studentId === student.id);
                            if (!record) return null;

                            const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();
                            const avatarColor = getRandomColor(initials);
                            const isBirthday = canSeeBirthdays && isSameDayMonth(student.birthDate);
                            
                            return (
                                <tr key={student.id} className={`border-b dark:border-gray-700 transition-colors ${!record.attended ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-gray-800'} hover:bg-gray-50 dark:hover:bg-gray-600/50`}>
                                    <td className="w-4 p-4"><input type="checkbox" checked={selectedStudentIds.includes(student.id)} onChange={() => handleSelectOne(student.id)} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500"/></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3 relative">
                                            <div className="relative inline-block w-9 h-9 flex-shrink-0">
                                                {student.photoUrl ? (
                                                    <img src={student.photoUrl} alt={`${student.firstName} ${student.lastName}`} className="w-9 h-9 rounded-full object-cover" />
                                                ) : (
                                                    <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-sm ${avatarColor}`}>
                                                        {initials}
                                                    </div>
                                                )}
                                                {isBirthday && <div className="absolute -top-4 -left-3 z-10 pointer-events-none"><BirthdayIcon size={30} /></div>}
                                                <StudentStatusIcon student={student} />
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">{student.firstName} {student.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleAttendanceChange(student.id, 'attended', !record.attended)}>
                                            {record.attended ? <Check size={20} className="text-green-500"/> : <X size={20} className="text-red-500"/>}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <select
                                                value={record.late}
                                                onChange={(e) => handleAttendanceChange(student.id, 'late', e.target.value as LateType)}
                                                disabled={!record.attended}
                                                className="p-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed"
                                            >
                                            {lateOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {record.attended && record.late !== 'No' && (
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="sm"><Mail size={16} /></Button>
                                                <Button variant="ghost" size="sm"><MessageSquare size={16} /></Button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {!record.attended && (
                                            <select
                                                value={String(record.absenceJustified)}
                                                onChange={(e) => handleAttendanceChange(student.id, 'absenceJustified', e.target.value === 'true')}
                                                className="p-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                                            >
                                                <option value="true">Sí</option>
                                                <option value="false">No</option>
                                            </select>
                                        )}
                                    </td>
                                    <td>
                                        {!record.attended && !record.absenceJustified && (
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => handleSendAttendanceEmail(student)} title="Enviar Email Aviso"><Mail size={16} /></Button>
                                                <Button variant="ghost" size="sm" title="Enviar WhatsApp"><MessageSquare size={16} /></Button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleAttendanceChange(student.id, 'homeworkDone', !record.homeworkDone)} disabled={!record.attended}>
                                            {record.homeworkDone ? <Check size={20} className="text-green-500"/> : <div className="w-5 h-5"/>}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-500 hover:underline text-xs" onClick={() => handleOpenCommentModal(courseClass)}>[ comentarios ]</button>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            </div>

            {isCommentModalOpen && commentingClass && (
                <CommentModal
                    isOpen={isCommentModalOpen}
                    onClose={handleCloseCommentModal}
                    courseClass={commentingClass}
                    onSave={handleSaveComment}
                    activeTab={activeCommentTab}
                />
            )}
        </div>
    );
};

export default AttendancePage;
