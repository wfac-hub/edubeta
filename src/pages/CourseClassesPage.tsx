
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { generateCourseClasses } from '../utils/calendar';
import Button from '../components/ui/Button';
import { MoveLeft, Plus, Mail, Trash2, Download, Search, X, Check, Calendar as CalendarIcon, Edit, RefreshCw, MoreHorizontal, Book } from 'lucide-react';
import { CourseClass, Role, WikiLesson, TaughtSession } from '../types';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Modal from '../components/ui/Modal';
import CourseClassForm from '../components/forms/CourseClassForm';
import CommentModal from '../components/CommentModal';
import { useAuth } from '../contexts/AuthContext';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';

const CourseClassesPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const { 
        courses, 
        teachers, 
        classrooms, 
        schedules, 
        holidays, 
        courseClasses, 
        deleteCourseClasses, 
        addCourseClass, 
        updateCourseClass, 
        setCourseClasses, 
        attendanceRecords,
        updateAttendanceRecord, // Import updateAttendanceRecord
        enrollments, // Import enrollments
        students, // Import students
        wikiLessons,
        wikiClasses,
        wikiCategories,
        wikiPermissions,
        taughtSessions,
        addTaughtSession,
        updateTaughtSession
    } = useData();
    const { user: authUser } = useAuth();
    
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);
    const [classesToUpdate, setClassesToUpdate] = useState<{ toDelete: CourseClass[], toAdd: CourseClass[] }>({ toDelete: [], toAdd: [] });
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');
    
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [commentingClass, setCommentingClass] = useState<CourseClass | null>(null);
    const [activeCommentTab, setActiveCommentTab] = useState<'internal' | 'public' | 'documents'>('internal');

    const course = useMemo(() => courses.find(c => c.id === parseInt(courseId || '0')), [courses, courseId]);
    const teacher = useMemo(() => teachers.find(t => t.id === course?.teacherId), [teachers, course]);
    const classroom = useMemo(() => classrooms.find(c => c.id === course?.classroomId), [classrooms, course]);
    
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
    
    const classesForThisCourse = useMemo(() => {
        return courseClasses.filter(c => c.courseId === course?.id);
    }, [courseClasses, course]);

    const filteredClasses = useMemo(() => {
        return classesForThisCourse.filter(c => {
            const searchMatch = c.date.toLocaleDateString().includes(searchTerm) || teacher?.name.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = statusFilter ? c.status === statusFilter : true;
            const dateFromMatch = dateFromFilter ? c.date >= new Date(dateFromFilter) : true;
            const dateToMatch = dateToFilter ? c.date <= new Date(dateToFilter) : true;
            return searchMatch && statusMatch && dateFromMatch && dateToMatch;
        });
    }, [classesForThisCourse, searchTerm, statusFilter, dateFromFilter, dateToFilter, teacher]);

    // Get available lessons based on permissions
    const getAvailableLessons = (teacherId: number): WikiLesson[] => {
        if (authUser?.role === Role.ADMIN) return wikiLessons;

        const perms = wikiPermissions.filter(p => p.teacherId === teacherId);
        const allowedClassIds = perms.filter(p => p.classId).map(p => p.classId);
        
        return wikiLessons.filter(lesson => {
            if (allowedClassIds.includes(lesson.classId)) return true;
            const hasCategoryAccess = perms.some(p => p.categoryId === lesson.categoryId && !p.classId);
            return hasCategoryAccess;
        });
    };

    // Handle lesson change and sync with Taught Sessions
    const handleLessonChange = (classItem: CourseClass, lessonIdStr: string) => {
        const lessonId = lessonIdStr ? parseInt(lessonIdStr) : undefined;
        updateCourseClass({ ...classItem, lessonId });

        if (lessonId) {
             const [startH, startM] = classItem.startTime.split(':').map(Number);
             const [endH, endM] = classItem.endTime.split(':').map(Number);
             const duration = (endH * 60 + endM) - (startH * 60 + startM);

             const existingSession = taughtSessions.find(s => s.courseClassId === classItem.id);

             const sessionData: TaughtSession = {
                 id: existingSession ? existingSession.id : 0, 
                 teacherId: classItem.teacherId,
                 date: classItem.date.toISOString().split('T')[0],
                 duration: duration,
                 group: course?.name || 'Clase',
                 lessonId: lessonId,
                 notes: 'Generado automáticamente desde días de clase',
                 courseClassId: classItem.id
             };

             if (existingSession) {
                 updateTaughtSession(sessionData);
             } else {
                 addTaughtSession(sessionData);
             }
        }
    };

    if (!course) {
        return <div className="p-8 text-center text-lg">Curso no encontrado.</div>;
    }

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedClassIds(filteredClasses.map(c => c.id));
        } else {
            setSelectedClassIds([]);
        }
    };
    
    const handleSelectOne = (id: string) => {
        setSelectedClassIds(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
    };
    
    const handleDelete = () => {
        deleteCourseClasses(selectedClassIds);
        setSelectedClassIds([]);
        setIsDeleteConfirmOpen(false);
    };
    
    const handleStatusChange = (classId: string, newStatus: CourseClass['status']) => {
        const classToUpdate = courseClasses.find(c => c.id === classId);
        if (classToUpdate) {
            // Logic for generating attendance records is now centralized in DataContext.updateCourseClass
            updateCourseClass({ ...classToUpdate, status: newStatus });
        }
    };

    const handleUpdateCheck = () => {
        const idealClasses = generateCourseClasses(course, schedules, holidays, classrooms);
        const currentClassIds = new Set(classesForThisCourse.map(c => c.id));
        const idealClassIds = new Set(idealClasses.map(c => c.id));
        
        const toDelete = classesForThisCourse.filter(c => !idealClassIds.has(c.id));
        const toAdd = idealClasses.filter(c => !currentClassIds.has(c.id));

        if (toDelete.length > 0 || toAdd.length > 0) {
            setClassesToUpdate({ toDelete, toAdd });
            setIsUpdateConfirmOpen(true);
        } else {
            alert('No se encontraron clases para actualizar. El calendario ya está al día.');
        }
    };

    const handleConfirmUpdate = () => {
        const otherCoursesClasses = courseClasses.filter(c => c.courseId !== course.id);
        const idealClassesForThisCourse = generateCourseClasses(course, schedules, holidays, classrooms);
        
        setCourseClasses([...otherCoursesClasses, ...idealClassesForThisCourse]);
        
        setClassesToUpdate({ toDelete: [], toAdd: [] });
        setIsUpdateConfirmOpen(false);
    };

    const handleSaveClass = (newClass: CourseClass) => {
        addCourseClass(newClass);
        setIsFormModalOpen(false);
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


    const handleExport = () => {
        const headers = ["Fecha", "Día", "Inicio", "Fin", "Profesor", "Estado"];
        const rows = filteredClasses.map(c => [
            c.date.toLocaleDateString(),
            ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][c.date.getDay()],
            c.startTime,
            c.endTime,
            teacher?.name,
            c.status
        ].join(','));
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `clases_${course.name.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const courseDurationHours = useMemo(() => {
        if (classesForThisCourse.length === 0) return 0;
        const { startTime, endTime } = classesForThisCourse[0];
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        return ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
    }, [classesForThisCourse]);

    const realizedClasses = filteredClasses.filter(c => c.status === 'Hecha').length;
    const pendingClasses = filteredClasses.filter(c => c.status === 'Pendiente').length;
    
    const totalHours = (filteredClasses.length * courseDurationHours).toFixed(2);
    const realizedHours = (realizedClasses * courseDurationHours).toFixed(2);
    const pendingHours = (pendingClasses * courseDurationHours).toFixed(2);

    const formatDate = (c: CourseClass) => {
        const date = c.date;
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const dayOfWeek = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'][date.getDay()];
        return `${day}/${month}/${year} ${dayOfWeek} ${c.startTime}-${c.endTime}`;
    };

    const statusColors: Record<CourseClass['status'], string> = {
        Pendiente: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-400 dark:border-yellow-700',
        Hecha: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-400 dark:border-green-700',
        Anulada: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-400 dark:border-red-700',
    };

    const isTeacher = authUser?.role === Role.TEACHER;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                        Días de clase : <span className="text-primary-600 dark:text-primary-400">{course.name} - {teacher?.name} ({course.status})</span>
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Listado histórico de todos los días de clase generados por los cursos de la academia.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <CalendarIcon size={24} />
                    <span className="font-semibold">{filteredClasses.length} Resultados</span>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16} />} onClick={goBack}>Volver</Button>
                    {!isTeacher && (
                        <>
                            <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />} onClick={() => setIsFormModalOpen(true)}>Nueva clase manual</Button>
                            <Button variant="secondary" size="sm" leftIcon={<Mail size={16} />} onClick={() => alert('Función no implementada')}>Enviar recordatorio</Button>
                            <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />} onClick={() => setIsDeleteConfirmOpen(true)} disabled={selectedClassIds.length === 0}>Borrar</Button>
                            <Button variant="secondary" size="sm" leftIcon={<Download size={16} />} onClick={handleExport}>Exportar días de clase</Button>
                            <Button variant="secondary" size="sm" leftIcon={<Download size={16} />} onClick={() => alert('Función no implementada')}>Exportar asistencia</Button>
                            <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={16} />} onClick={handleUpdateCheck}>Actualizar clases</Button>
                        </>
                    )}
                    <div className="flex-grow"></div>
                    <div className="relative w-full sm:w-64">
                         <input type="text" placeholder="Buscar" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 pl-4 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 focus:ring-primary-500 focus:border-primary-500" />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 focus:ring-primary-500 focus:border-primary-500">
                        <option value="">Todos los Estados</option>
                        <option value="Hecha">Hecha</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Anulada">Anulada</option>
                    </select>
                    <input type="date" placeholder="Desde" value={dateFromFilter} onChange={e => setDateFromFilter(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm w-full sm:w-auto bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 focus:ring-primary-500 focus:border-primary-500" />
                    <input type="date" placeholder="Hasta" value={dateToFilter} onChange={e => setDateToFilter(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm w-full sm:w-auto bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 focus:ring-primary-500 focus:border-primary-500" />
                </div>
            </div>

            <div className="bg-cyan-50 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 p-4 rounded-lg flex flex-wrap items-center justify-around gap-4 text-sm font-semibold">
                <div>NÚM. CLASES: <span className="font-bold">totales:</span> {filteredClasses.length} <span className="font-bold">realizadas:</span> {realizedClasses} <span className="font-bold">pendientes:</span> {pendingClasses}</div>
                <div>NÚM. HORAS: <span className="font-bold">totales:</span> {totalHours}h. <span className="font-bold">realizadas:</span> {realizedHours}h. <span className="font-bold">pendientes:</span> {pendingHours}h.</div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Mobile View (up to LG) */}
                <div className="lg:hidden divide-y divide-gray-200 dark:divide-slate-700">
                     {filteredClasses.map(c => {
                        const attendanceForThisClass = attendanceRecords.filter(ar => ar.classId === c.id && ar.attended).length;
                        const availableLessons = getAvailableLessons(c.teacherId);

                        return (
                            <div key={c.id} className="group">
                                <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === c.id ? null : c.id)}>
                                     <div className="flex items-center gap-2 mt-1"><input type="checkbox" checked={selectedClassIds.includes(c.id)} onChange={() => handleSelectOne(c.id)} onClick={e => e.stopPropagation()}/><button className="text-gray-400 hover:text-primary-600"><Edit size={14}/></button></div>
                                    <div className="flex-grow">
                                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(c)}</p>
                                    </div>
                                    <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === c.id ? 'rotate-90' : ''}`} />
                                </div>
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === c.id ? 'max-h-[500px]' : ''}`}>
                                     <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-3">
                                        <div className="flex justify-between items-center"><span className="font-semibold">Modalidad:</span> <div><div className="font-semibold text-gray-800 dark:text-gray-200">{course.modality}</div><div className="text-xs text-gray-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: classroom?.color || '#A0AEC0' }}></div>{classroom?.name}</div></div></div>
                                        <div className="flex justify-between"><span className="font-semibold">Profesor/a:</span> <span className="text-blue-500 hover:underline cursor-pointer">{teacher?.name}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">¿Sustitución?:</span> <span>{c.isSubstitution ? <Check size={20} className="text-green-500"/> : <X size={20} className="text-red-500"/>}</span></div>
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
                                        <div className="flex justify-between"><span className="font-semibold">Asistencia:</span> <span>{c.status === 'Hecha' ? (<Link to={`/courses/${course.id}/classes/${c.id}/attendance`} className="flex items-center gap-2 text-blue-500 font-semibold hover:underline"><CalendarIcon size={16}/><span>{attendanceForThisClass}</span></Link>) : (<span className="text-gray-400 italic text-xs">[Clase no realizada]</span>)}</span></div>
                                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-slate-600">
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
                                <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={filteredClasses.length > 0 && selectedClassIds.length === filteredClasses.length}/></th>
                                <th scope="col" className="px-6 py-3">Fecha</th>
                                <th scope="col" className="px-6 py-3">Modalidad</th>
                                <th scope="col" className="px-6 py-3">Profesor/a</th>
                                <th scope="col" className="px-6 py-3">¿Es una sustitución?</th>
                                <th scope="col" className="px-6 py-3">Estado</th>
                                <th scope="col" className="px-6 py-3">Lección Impartida</th>
                                <th scope="col" className="px-6 py-3">Comentario</th>
                                <th scope="col" className="px-6 py-3">Asistencia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClasses.map(c => {
                                const attendanceForThisClass = attendanceRecords.filter(ar => ar.classId === c.id && ar.attended).length;
                                const availableLessons = getAvailableLessons(c.teacherId);

                                return (
                                    <tr key={c.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                        <td className="w-4 p-4"><div className="flex items-center gap-2"><input type="checkbox" checked={selectedClassIds.includes(c.id)} onChange={() => handleSelectOne(c.id)}/><button className="text-gray-400 hover:text-primary-600"><Edit size={14}/></button></div></td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{formatDate(c)}</td>
                                        <td className="px-6 py-4"><div><div className="font-semibold text-gray-800 dark:text-gray-200">{course.modality}</div><div className="text-xs text-gray-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: classroom?.color || '#A0AEC0' }}></div>{classroom?.name}</div></div></td>
                                        <td className="px-6 py-4 text-blue-500 hover:underline cursor-pointer">{teacher?.name}</td>
                                        <td className="px-6 py-4 text-center">{c.isSubstitution ? <Check size={20} className="text-green-500 mx-auto"/> : <X size={20} className="text-red-500 mx-auto"/>}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <select value={c.status} onChange={(e) => handleStatusChange(c.id, e.target.value as CourseClass['status'])} className={`p-1 border rounded-md text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 ${statusColors[c.status]}`} onClick={(e) => e.stopPropagation()}>
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
                                        <td className="px-6 py-4"><div className="flex items-center gap-1"><Button variant="ghost" size="sm" onClick={() => handleOpenCommentModal(c, 'internal')}>Interno</Button>{canEditStudentAreaComments && <Button variant="ghost" size="sm" onClick={() => handleOpenCommentModal(c, 'public')}>Área de alumnos</Button>}<button><Mail size={16} className="text-gray-400"/></button></div></td>
                                        <td className="px-6 py-4">{c.status === 'Hecha' ? (<Link to={`/courses/${course.id}/classes/${c.id}/attendance`} className="flex items-center gap-2 text-blue-500 font-semibold hover:underline"><CalendarIcon size={16}/><span>{attendanceForThisClass}</span></Link>) : (<span className="text-gray-400 italic text-xs">[Clase no realizada]</span>)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Confirmar Borrado"
                message={`¿Estás seguro de que quieres borrar permanentemente ${selectedClassIds.length} clase(s) seleccionada(s)? Esta acción no se puede deshacer.`}
            />
            
            <ConfirmationModal
                isOpen={isUpdateConfirmOpen}
                onClose={() => setIsUpdateConfirmOpen(false)}
                onConfirm={handleConfirmUpdate}
                title="Actualizar Calendario de Clases"
                message={
                    <div>
                        <p className="mb-4">Se van a aplicar los siguientes cambios en el calendario del curso:</p>
                        {classesToUpdate.toDelete.length > 0 && (
                            <>
                                <h4 className="font-semibold text-red-600 dark:text-red-400">Clases a ELIMINAR ({classesToUpdate.toDelete.length}):</h4>
                                <ul className="list-disc list-inside bg-red-100 dark:bg-red-900/50 p-2 rounded max-h-28 overflow-y-auto text-sm">
                                    {classesToUpdate.toDelete.map(c => <li key={c.id}>{c.date.toLocaleDateString()} ({c.startTime})</li>)}
                                </ul>
                            </>
                        )}
                        {classesToUpdate.toAdd.length > 0 && (
                            <>
                                <h4 className="font-semibold text-green-600 dark:text-green-400 mt-3">Clases a AÑADIR ({classesToUpdate.toAdd.length}):</h4>
                                <ul className="list-disc list-inside bg-green-100 dark:bg-green-900/50 p-2 rounded max-h-28 overflow-y-auto text-sm">
                                    {classesToUpdate.toAdd.map(c => <li key={c.id}>{c.date.toLocaleDateString()} ({c.startTime})</li>)}
                                </ul>
                            </>
                        )}
                        <p className="mt-4">¿Deseas continuar con la actualización?</p>
                    </div>
                }
                confirmText="Actualizar"
            />

            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title="Añadir Clase Manual">
                <CourseClassForm 
                    course={course}
                    classData={null}
                    onSave={handleSaveClass}
                    onClose={() => setIsFormModalOpen(false)}
                />
            </Modal>
            
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

export default CourseClassesPage;
