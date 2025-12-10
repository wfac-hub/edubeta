
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import { Check, X, Calendar as CalendarIcon, Edit, Mail, MoreHorizontal, Book, AlertCircle, CheckCircle } from 'lucide-react';
import { CourseClass, Role, WikiLesson, TaughtSession } from '../types';
import CommentModal from '../components/CommentModal';
import { useAuth } from '../contexts/AuthContext';
import ClassModalityModal from '../components/modals/ClassModalityModal';
import ClassTeacherModal from '../components/modals/ClassTeacherModal';

const AttendanceCalendarPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { 
        courses, 
        teachers, 
        classrooms, 
        courseClasses, 
        updateCourseClass, 
        attendanceRecords,
        enrollments,
        students,
        wikiLessons,
        wikiClasses, // Importamos las clases de la wiki
        wikiCategories, // Importamos las categorías de la wiki
        wikiPermissions,
        taughtSessions,
        addTaughtSession,
        updateTaughtSession
    } = useData();
    const { user: authUser } = useAuth();
    
    const [viewingDate, setViewingDate] = useState(() => {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        return today;
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const dateParam = params.get('date');
        if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
            const [year, month, day] = dateParam.split('-').map(Number);
            const newDate = new Date(Date.UTC(year, month - 1, day));
            if (!isNaN(newDate.getTime())) {
                setViewingDate(newDate);
            }
        }
    }, [location.search]);


    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [commentingClass, setCommentingClass] = useState<CourseClass | null>(null);
    const [activeCommentTab, setActiveCommentTab] = useState<'internal' | 'public' | 'documents'>('internal');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const [editingClass, setEditingClass] = useState<CourseClass | null>(null);
    const [isModalityModalOpen, setIsModalityModalOpen] = useState(false);
    const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
    
    // Estado para feedback visual en pantalla
    const [feedback, setFeedback] = useState<{ type: 'error' | 'success', message: string } | null>(null);

    const showFeedback = (type: 'error' | 'success', message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 4000);
    };

    const currentTeacher = useMemo(() => {
        if (authUser?.role === Role.TEACHER) {
            return teachers.find(t => t.id === authUser.id);
        }
        return null;
    }, [authUser, teachers]);

    const canEditStudentAreaComments = useMemo(() => {
        if (!currentTeacher) return true; // Admins, coordinators, etc. can always edit
        return currentTeacher.permissions.canEditStudentAreaComments;
    }, [currentTeacher]);

    const dailyClasses = useMemo(() => {
        return courseClasses.filter(c => {
            // Teacher Filter
            if (authUser?.role === Role.TEACHER) {
                const course = courses.find(cr => cr.id === c.courseId);
                if (c.teacherId !== authUser.id && course?.secondaryTeacherId !== authUser.id) {
                    return false;
                }
            }
            const classDate = new Date(c.date);
            classDate.setUTCHours(0, 0, 0, 0);
            return classDate.getTime() === viewingDate.getTime();
        });
    }, [courseClasses, viewingDate, authUser, courses]);

    const isToday = useMemo(() => {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        return viewingDate.getTime() === today.getTime();
    }, [viewingDate]);

    const handleDateChange = (days: number) => {
        setViewingDate(prev => {
            const newDate = new Date(prev);
            newDate.setUTCDate(newDate.getUTCDate() + days);
            return newDate;
        });
    };

    const goToToday = () => {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        setViewingDate(today);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedClassIds(dailyClasses.map(c => c.id));
        } else {
            setSelectedClassIds([]);
        }
    };
    
    const handleSelectOne = (id: string) => {
        setSelectedClassIds(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
    };

    const handleStatusChange = (classId: string, newStatus: CourseClass['status']) => {
        const classToUpdate = courseClasses.find(c => c.id === classId);
        if (classToUpdate) {
            // Delegate logic completely to DataContext to ensure consistency and refresh
            updateCourseClass({ ...classToUpdate, status: newStatus });
        }
    };

    const handleRescheduleClick = (classItem: CourseClass) => {
        if (classItem.status !== 'Pendiente') {
            showFeedback('error', 'Solo se pueden reprogramar clases con estado "Pendiente".');
            return;
        }
        navigate(`/courses/${classItem.courseId}/classes/${classItem.id}/reschedule`);
    };

    const handleOpenModalityModal = (classItem: CourseClass) => {
        setEditingClass(classItem);
        setIsModalityModalOpen(true);
    };

    const handleOpenTeacherModal = (classItem: CourseClass) => {
        setEditingClass(classItem);
        setIsTeacherModalOpen(true);
    };

    const handleSaveClassUpdate = (updatedClass: CourseClass) => {
        updateCourseClass(updatedClass);
        setIsModalityModalOpen(false);
        setIsTeacherModalOpen(false);
        setEditingClass(null);
        showFeedback('success', 'Clase actualizada correctamente');
    };

    const handleOpenCommentModal = (classItem: CourseClass, tab: 'internal' | 'public' | 'documents') => {
        setCommentingClass(classItem);
        setActiveCommentTab(tab);
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

    // Wiki Integration: Get available lessons for a teacher based on permissions
    const getAvailableLessons = (teacherId: number): WikiLesson[] => {
        if (authUser?.role === Role.ADMIN) return wikiLessons; // Admins see all

        // Get permissions for this specific teacher
        const perms = wikiPermissions.filter(p => p.teacherId === teacherId);
        const allowedClassIds = perms.filter(p => p.classId).map(p => p.classId);
        
        return wikiLessons.filter(lesson => {
            // Check if teacher has permission for the lesson's class explicitly
            if (allowedClassIds.includes(lesson.classId)) return true;
            
            // Check if teacher has permission for the lesson's category (and no specific class restriction in permission logic, usually null classId means full category)
            const hasCategoryAccess = perms.some(p => p.categoryId === lesson.categoryId && !p.classId);
            return hasCategoryAccess;
        });
    };

    const handleLessonChange = (classItem: CourseClass, lessonIdStr: string) => {
        const lessonId = lessonIdStr ? parseInt(lessonIdStr) : undefined;
        updateCourseClass({ ...classItem, lessonId });

        // Sync with Taught Sessions
        if (lessonId) {
             const course = courses.find(c => c.id === classItem.courseId);
             const [startH, startM] = classItem.startTime.split(':').map(Number);
             const [endH, endM] = classItem.endTime.split(':').map(Number);
             const duration = (endH * 60 + endM) - (startH * 60 + startM);

             const existingSession = taughtSessions.find(s => s.courseClassId === classItem.id);

             const sessionData: TaughtSession = {
                 id: existingSession ? existingSession.id : 0, // 0 indicates creation if not found
                 teacherId: classItem.teacherId,
                 date: classItem.date.toISOString().split('T')[0],
                 duration: duration,
                 group: course?.name || 'Clase',
                 lessonId: lessonId,
                 notes: 'Generado automáticamente desde el calendario',
                 courseClassId: classItem.id
             };

             if (existingSession) {
                 updateTaughtSession(sessionData);
             } else {
                 addTaughtSession(sessionData);
             }
        }
    };

    const statusColors: Record<CourseClass['status'], string> = {
        Pendiente: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-400 dark:border-yellow-700',
        Hecha: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-400 dark:border-green-700',
        Anulada: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-400 dark:border-red-700',
    };

    return (
        <div className="space-y-6 relative">
            {/* Feedback Toast */}
            {feedback && (
                <div className={`fixed top-20 right-4 z-50 p-4 rounded-md shadow-lg flex items-center gap-3 border animate-in slide-in-from-right-10 fade-in duration-300 ${
                    feedback.type === 'error' 
                        ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/80 dark:text-red-200 dark:border-red-700' 
                        : 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/80 dark:text-green-200 dark:border-green-700'
                }`}>
                    {feedback.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>}
                    <span className="font-medium">{feedback.message}</span>
                </div>
            )}

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Calendario</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Navega por el calendario para consultar los cursos que tienes asignados.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <CalendarIcon size={24} />
                    <span className="font-semibold">{dailyClasses.length} Resultados</span>
                </div>
            </div>

            <div className="flex justify-between items-center text-center">
                <div className="flex items-center gap-2">
                    <button onClick={() => handleDateChange(-1)} className="text-primary-600 dark:text-primary-400 hover:underline">
                        &lt;&lt; Día anterior
                    </button>
                    {!isToday && (
                        <>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <button onClick={goToToday} className="text-primary-600 dark:text-primary-400 hover:underline">
                                Hoy
                            </button>
                        </>
                    )}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white capitalize">
                    {viewingDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                </h2>
                <button onClick={() => handleDateChange(1)} className="text-primary-600 dark:text-primary-400 hover:underline">
                    Día siguiente &gt;&gt;
                </button>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {/* Mobile View (up to LG) */}
                <div className="lg:hidden divide-y divide-gray-200 dark:divide-slate-700">
                    {dailyClasses.map(c => {
                        const course = courses.find(cr => cr.id === c.courseId);
                        const teacher = teachers.find(t => t.id === c.teacherId);
                        const classroom = classrooms.find(cl => cl.id === (c.classroomId || course?.classroomId));
                        const modality = c.modality || course?.modality;
                        const attendanceForThisClass = attendanceRecords.filter(ar => ar.classId === c.id && ar.attended).length;
                        const availableLessons = getAvailableLessons(c.teacherId);

                        return (
                            <div key={c.id} className="group">
                                <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === c.id ? null : c.id)}>
                                    <input type="checkbox" checked={selectedClassIds.includes(c.id)} onChange={() => handleSelectOne(c.id)} onClick={e => e.stopPropagation()} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500 mt-1"/>
                                    <div className="flex-grow">
                                        <p className="font-medium">{`${c.startTime}-${c.endTime}`}</p>
                                        <p className="text-sm text-blue-500">{course?.name}</p>
                                    </div>
                                    <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === c.id ? 'rotate-90' : ''}`} />
                                </div>
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === c.id ? 'max-h-[500px]' : ''}`}>
                                    <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-3">
                                        <div className="flex justify-between items-center"><span className="font-semibold">Modalidad:</span> <div className="flex items-center gap-2"><button onClick={(e) => { e.stopPropagation(); handleOpenModalityModal(c);}} className="text-blue-600 dark:text-blue-400"><Edit size={14}/></button><div><div className="font-semibold text-gray-800 dark:text-gray-200">{modality}</div><div className="text-xs text-gray-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: classroom?.color || '#A0AEC0' }}></div>{classroom?.name}</div></div></div></div>
                                        <div className="flex justify-between items-center"><span className="font-semibold">Profesor/a:</span> <div className="flex items-center gap-2"><button onClick={(e) => { e.stopPropagation(); handleOpenTeacherModal(c);}} className="text-blue-600 dark:text-blue-400"><Edit size={14}/></button><span onClick={(e) => { e.stopPropagation(); handleOpenTeacherModal(c);}} className="text-blue-500 hover:underline cursor-pointer">{teacher?.name} {teacher?.lastName}</span></div></div>
                                        <div className="flex justify-between"><span className="font-semibold">Sustitución:</span> <span>{c.isSubstitution ? <Check size={20} className="text-green-500"/> : <X size={20} className="text-red-500"/>}</span></div>
                                        <div className="flex justify-between items-center"><span className="font-semibold">Estado:</span> <select value={c.status} onChange={(e) => handleStatusChange(c.id, e.target.value as CourseClass['status'])} className={`p-1 border rounded-md text-xs font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 ${statusColors[c.status]}`} onClick={(e) => e.stopPropagation()}><option value="Pendiente">Pendiente</option><option value="Hecha">Hecha</option><option value="Anulada">Anulada</option></select></div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">Lección:</span>
                                            {c.status === 'Hecha' ? (
                                                <select 
                                                    value={c.lessonId || ''} 
                                                    onChange={(e) => handleLessonChange(c, e.target.value)}
                                                    className="w-40 p-1 text-xs border rounded bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600"
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    <option value="">-- Seleccionar --</option>
                                                    {(() => {
                                                        const grouped = availableLessons.reduce((acc, lesson) => {
                                                            const key = `${lesson.categoryId}-${lesson.classId}`;
                                                            if (!acc[key]) {
                                                                acc[key] = {
                                                                    category: wikiCategories.find(cat => cat.id === lesson.categoryId),
                                                                    class: wikiClasses.find(wc => wc.id === lesson.classId),
                                                                    lessons: []
                                                                };
                                                            }
                                                            acc[key].lessons.push(lesson);
                                                            return acc;
                                                        }, {} as Record<string, { category: any, class: any, lessons: WikiLesson[] }>);

                                                        return Object.values(grouped).map((group, idx) => (
                                                            <optgroup 
                                                                key={idx} 
                                                                label={`${group.category?.name || 'Sin Cat.'} > ${group.class?.name || 'Sin Tema'}`}
                                                            >
                                                                {group.lessons.map(l => (
                                                                    <option key={l.id} value={l.id}>{l.title}</option>
                                                                ))}
                                                            </optgroup>
                                                        ));
                                                    })()}
                                                </select>
                                            ) : (
                                                <span className="text-gray-400 text-xs">--</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between"><span className="font-semibold">Asistencia:</span> <span>{c.status === 'Hecha' ? (<Link to={`/courses/${c.courseId}/classes/${c.id}/attendance`} className="flex items-center gap-2 text-blue-500 font-semibold hover:underline"><CalendarIcon size={16}/><span>{attendanceForThisClass}</span></Link>) : (<span className="text-gray-400 italic text-xs">[No realizada]</span>)}</span></div>
                                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-slate-600">
                                            <button 
                                                className="p-1.5 text-blue-600 border border-blue-200 rounded hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30" 
                                                onClick={(e) => { e.stopPropagation(); handleRescheduleClick(c); }}
                                            >
                                                <Edit size={14}/>
                                            </button>
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenCommentModal(c, 'internal')}>Interno</Button>
                                            {canEditStudentAreaComments && <Button variant="ghost" size="sm" onClick={() => handleOpenCommentModal(c, 'public')}>Área alumnos</Button>}
                                            <button><Mail size={16} className="text-gray-400"/></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                {/* Desktop View (from LG) */}
                <div className="hidden lg:block">
                    <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                            <tr>
                                <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={dailyClasses.length > 0 && selectedClassIds.length === dailyClasses.length}/></th>
                                <th scope="col" className="px-6 py-3">Horario</th>
                                <th scope="col" className="px-6 py-3">Curso</th>
                                <th scope="col" className="px-6 py-3">Modalidad</th>
                                <th scope="col" className="px-6 py-3">Profesor/a</th>
                                <th scope="col" className="px-6 py-3">¿Es una sustitución?</th>
                                <th scope="col" className="px-6 py-3">Estado</th>
                                <th scope="col" className="px-6 py-3">Lección Impartida</th>
                                <th scope="col" className="px-6 py-3">Asistencia</th>
                                <th scope="col" className="px-6 py-3">Comentario</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dailyClasses.map(c => {
                                const course = courses.find(cr => cr.id === c.courseId);
                                const teacher = teachers.find(t => t.id === c.teacherId);
                                const classroom = classrooms.find(cl => cl.id === (c.classroomId || course?.classroomId));
                                const modality = c.modality || course?.modality;
                                const attendanceForThisClass = attendanceRecords.filter(ar => ar.classId === c.id && ar.attended).length;
                                const availableLessons = getAvailableLessons(c.teacherId);

                                return (
                                    <tr key={c.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                        <td className="w-4 p-4">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" checked={selectedClassIds.includes(c.id)} onChange={() => handleSelectOne(c.id)}/>
                                                {/* FIX: Agregado onClick para abrir el formulario de edición */}
                                                <button 
                                                    className="text-gray-400 hover:text-primary-600 transition-colors p-1" 
                                                    onClick={() => handleRescheduleClick(c)}
                                                    title="Editar / Reprogramar Clase"
                                                >
                                                    <Edit size={14}/>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer" onClick={() => handleRescheduleClick(c)}>
                                            <div className="flex items-center gap-2">
                                                <Edit size={14}/>
                                                <span>{`Vi ${c.startTime}-${c.endTime}`}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{course?.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                            <button onClick={() => handleOpenModalityModal(c)} className="text-blue-600 dark:text-blue-400"><Edit size={14}/></button>
                                                <div>
                                                    <div className="font-semibold text-gray-800 dark:text-gray-200">{modality}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: classroom?.color || '#A0AEC0' }}></div>
                                                        {classroom?.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleOpenTeacherModal(c)} className="text-blue-600 dark:text-blue-400"><Edit size={14}/></button>
                                                <span onClick={() => handleOpenTeacherModal(c)} className="text-blue-500 hover:underline cursor-pointer">{teacher?.name} {teacher?.lastName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">{c.isSubstitution ? <Check size={20} className="text-green-500 mx-auto"/> : <X size={20} className="text-red-500 mx-auto"/>}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <select
                                                    value={c.status}
                                                    onChange={(e) => handleStatusChange(c.id, e.target.value as CourseClass['status'])}
                                                    className={`p-1 border rounded-md text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 ${statusColors[c.status]}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <option value="Pendiente">Pendiente</option>
                                                    <option value="Hecha">Hecha</option>
                                                    <option value="Anulada">Anulada</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {c.status === 'Hecha' ? (
                                                <div className="flex items-center gap-2">
                                                    <Book size={16} className="text-gray-400" />
                                                    <select 
                                                        value={c.lessonId || ''} 
                                                        onChange={(e) => handleLessonChange(c, e.target.value)}
                                                        className="w-48 p-1 text-xs border rounded bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600"
                                                    >
                                                        <option value="">-- Seleccionar --</option>
                                                        {(() => {
                                                            const grouped = availableLessons.reduce((acc, lesson) => {
                                                                const key = `${lesson.categoryId}-${lesson.classId}`;
                                                                if (!acc[key]) {
                                                                    acc[key] = {
                                                                        category: wikiCategories.find(cat => cat.id === lesson.categoryId),
                                                                        class: wikiClasses.find(wc => wc.id === lesson.classId),
                                                                        lessons: []
                                                                    };
                                                                }
                                                                acc[key].lessons.push(lesson);
                                                                return acc;
                                                            }, {} as Record<string, { category: any, class: any, lessons: WikiLesson[] }>);

                                                            return Object.values(grouped).map((group, idx) => (
                                                                <optgroup 
                                                                    key={idx} 
                                                                    label={`${group.category?.name || 'Sin Cat.'} > ${group.class?.name || 'Sin Tema'}`}
                                                                >
                                                                    {group.lessons.map(l => (
                                                                        <option key={l.id} value={l.id}>{l.title}</option>
                                                                    ))}
                                                                </optgroup>
                                                            ));
                                                        })()}
                                                    </select>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">Clase pendiente</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {c.status === 'Hecha' ? (
                                                <Link to={`/courses/${c.courseId}/classes/${c.id}/attendance`} className="flex items-center gap-2 text-blue-500 font-semibold hover:underline">
                                                    <CalendarIcon size={16}/>
                                                    <span>{attendanceForThisClass}</span>
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">[Clase no realizada]</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleOpenCommentModal(c, 'internal')}>Interno</Button>
                                                {canEditStudentAreaComments && <Button variant="ghost" size="sm" onClick={() => handleOpenCommentModal(c, 'public')}>Área de alumnos</Button>}
                                                <button><Mail size={16} className="text-gray-400"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {dailyClasses.length === 0 && (
                                <tr><td colSpan={10} className="text-center py-8 text-gray-500">No hay clases programadas para este día.</td></tr>
                            )}
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

            {isModalityModalOpen && editingClass && (
                <ClassModalityModal
                    isOpen={isModalityModalOpen}
                    onClose={() => setIsModalityModalOpen(false)}
                    classData={editingClass}
                    onSave={handleSaveClassUpdate}
                />
            )}
            
            {isTeacherModalOpen && editingClass && (
                <ClassTeacherModal
                    isOpen={isTeacherModalOpen}
                    onClose={() => setIsTeacherModalOpen(false)}
                    classData={editingClass}
                    onSave={handleSaveClassUpdate}
                />
            )}

        </div>
    );
};

export default AttendanceCalendarPage;
