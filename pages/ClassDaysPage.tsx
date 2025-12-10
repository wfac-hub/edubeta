
import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import { Mail, Trash2, Download, Search, X, Check, Calendar as CalendarIcon, Edit, Send, MoreHorizontal } from 'lucide-react';
import { CourseClass, Role } from '../types';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import CommentModal from '../components/CommentModal';
import { useAuth } from '../contexts/AuthContext';

// Helper to format date
const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
const formatDayOfWeek = (date: Date) => {
    const day = date.toLocaleDateString('es-ES', { weekday: 'short' });
    return day.charAt(0).toUpperCase() + day.slice(1).replace('.','');
}

const ClassDaysPage = () => {
    const navigate = useNavigate();
    const { 
        courses, teachers, classrooms, courseClasses, locations, courseLevels, 
        deleteCourseClasses, updateCourseClass, attendanceRecords 
    } = useData();
    const { user: authUser } = useAuth();
    
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    
    const [filters, setFilters] = useState({
        level: '',
        courseName: '',
        location: '',
        teacherId: '',
        status: '',
        dateFrom: '2025-11-11', // From image
        dateTo: '2025-11-18', // From image
        isSubstitution: '',
    });
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [commentingClass, setCommentingClass] = useState<CourseClass | null>(null);
    const [activeCommentTab, setActiveCommentTab] = useState<'internal' | 'public' | 'documents'>('internal');
    
    const currentTeacher = useMemo(() => {
        if (authUser?.role === Role.TEACHER) {
            return teachers.find(t => t.id === authUser.id);
        }
        return null;
    }, [authUser, teachers]);

    const canEditStudentAreaComments = useMemo(() => {
        if (!currentTeacher) return true;
        return currentTeacher.permissions.canEditStudentAreaComments;
    }, [currentTeacher]);
    
    const filteredClasses = useMemo(() => {
        return courseClasses.filter(c => {
            const course = courses.find(cr => cr.id === c.courseId);
            if(!course) return false;
            const classroom = classrooms.find(cl => cl.id === (c.classroomId || course?.classroomId));

            // Apply filters
            if (filters.level && course.level !== filters.level) return false;
            if (filters.courseName && !course.name.toLowerCase().includes(filters.courseName.toLowerCase())) return false;
            if (filters.teacherId && String(c.teacherId) !== filters.teacherId) return false;
            if (filters.status && c.status !== filters.status) return false;
            if (filters.dateFrom && new Date(c.date) < new Date(filters.dateFrom)) return false;
            if (filters.dateTo && new Date(c.date) > new Date(filters.dateTo)) return false;
            if (filters.isSubstitution !== '' && String(c.isSubstitution) !== filters.isSubstitution) return false;
            if (filters.location && classroom?.location !== filters.location) return false;
            
            // Apply search term
            const teacher = teachers.find(t => t.id === c.teacherId);
            const searchTermLower = searchTerm.toLowerCase();
            const searchMatch = course.name.toLowerCase().includes(searchTermLower) ||
                                (teacher && `${teacher.name} ${teacher.lastName}`.toLowerCase().includes(searchTermLower));

            return searchMatch;
        }).sort((a,b) => a.date.getTime() - b.date.getTime());
    }, [courseClasses, filters, searchTerm, courses, teachers, classrooms]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedClassIds(e.target.checked ? filteredClasses.map(c => c.id) : []);
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
            updateCourseClass({ ...classToUpdate, status: newStatus });
        }
    };
    
    const handleOpenCommentModal = (classItem: CourseClass, tab: 'internal' | 'public' | 'documents') => {
        setCommentingClass(classItem);
        setActiveCommentTab(tab);
        setIsCommentModalOpen(true);
    };

    const handleSaveComment = (updatedClass: CourseClass) => {
        updateCourseClass(updatedClass);
        setIsCommentModalOpen(false);
        setCommentingClass(null);
    };

    const courseDurationHours = (c: CourseClass) => {
        const [startH, startM] = c.startTime.split(':').map(Number);
        const [endH, endM] = c.endTime.split(':').map(Number);
        return ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
    }

    const summary = useMemo(() => {
        const realized = filteredClasses.filter(c => c.status === 'Hecha');
        const pending = filteredClasses.filter(c => c.status === 'Pendiente');
        const totalHours = filteredClasses.reduce((sum, c) => sum + courseDurationHours(c), 0);
        const realizedHours = realized.reduce((sum, c) => sum + courseDurationHours(c), 0);
        const pendingHours = pending.reduce((sum, c) => sum + courseDurationHours(c), 0);
        return {
            total: filteredClasses.length,
            realized: realized.length,
            pending: pending.length,
            totalHours: totalHours.toFixed(2),
            realizedHours: realizedHours.toFixed(2),
            pendingHours: pendingHours.toFixed(2),
        }
    }, [filteredClasses]);

    const statusColors: Record<CourseClass['status'], string> = {
        Pendiente: 'bg-yellow-200 text-yellow-800',
        Hecha: 'bg-green-200 text-green-800',
        Anulada: 'bg-red-200 text-red-800',
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                 <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Días de clase</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Listado histórico de todos los días de clase generados por los cursos de la academia.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <CalendarIcon size={24} />
                    <span className="font-semibold">{filteredClasses.length} Resultados</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
                 <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<Download size={16} />}>Exportar días de clase</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />} onClick={() => setIsDeleteConfirmOpen(true)} disabled={selectedClassIds.length === 0}>Borrar</Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 items-center text-sm">
                    <select name="level" value={filters.level} onChange={handleFilterChange} className="p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"><option value="">Nivel</option>{[...new Set(courseLevels.map(l => l.name))].map(name => <option key={name} value={name}>{name}</option>)}</select>
                    <input 
                        type="text" 
                        name="courseName" 
                        placeholder="Curso" 
                        value={filters.courseName} 
                        onChange={handleFilterChange} 
                        className="p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-sm"
                    />
                    <select name="location" value={filters.location} onChange={handleFilterChange} className="p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"><option value="">Localización</option>{locations.map(l=><option key={l.id} value={l.name}>{l.name}</option>)}</select>
                    <select name="teacherId" value={filters.teacherId} onChange={handleFilterChange} className="p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"><option value="">Profesor/a</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.name} {t.lastName}</option>)}</select>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"><option value="">Estado</option><option value="Hecha">Hecha</option><option value="Pendiente">Pendiente</option><option value="Anulada">Anulada</option></select>
                    <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="p-2 border rounded-md bg-lime-100 dark:bg-lime-900/50 border-gray-300 dark:border-slate-700"/>
                    <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="p-2 border rounded-md bg-lime-100 dark:bg-lime-900/50 border-gray-300 dark:border-slate-700"/>
                    <select name="isSubstitution" value={filters.isSubstitution} onChange={handleFilterChange} className="p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"><option value="">Sí</option><option value="true">Sí</option><option value="false">No</option></select>
                    <div className="relative col-span-full lg:col-span-2 lg:col-start-7">
                        <input type="text" placeholder="Buscar" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 pl-4 pr-10 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"/>
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>
            
            <div className="bg-cyan-50 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 p-4 rounded-lg flex flex-wrap items-center justify-around gap-4 text-sm font-semibold">
                <div>NÚM. CLASES: <span className="font-bold">totales:</span> {summary.total} <span className="font-bold">realizadas:</span> {summary.realized} <span className="font-bold">pendientes:</span> {summary.pending}</div>
                <div>NÚM. HORAS: <span className="font-bold">totales:</span> {summary.totalHours}h. <span className="font-bold">realizadas:</span> {summary.realizedHours}h. <span className="font-bold">pendientes:</span> {summary.pendingHours}h.</div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {/* Mobile View (up to LG) */}
                <div className="lg:hidden divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredClasses.map(c => {
                        const course = courses.find(cr => cr.id === c.courseId);
                        const teacher = teachers.find(t => t.id === c.teacherId);
                        const classroom = classrooms.find(cl => cl.id === (c.classroomId || course?.classroomId));
                        const attendanceForThisClass = attendanceRecords.filter(ar => ar.classId === c.id && ar.attended).length;
                        return (
                             <div key={c.id} className="group">
                                <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === c.id ? null : c.id)}>
                                    <input type="checkbox" checked={selectedClassIds.includes(c.id)} onChange={() => handleSelectOne(c.id)} onClick={e => e.stopPropagation()} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500 mt-1"/>
                                    <div className="flex-grow">
                                        <div className="font-medium text-gray-900 dark:text-white">{formatDate(c.date)}</div>
                                        <div className="text-xs text-gray-500">{formatDayOfWeek(c.date)} {c.startTime}-{c.endTime}</div>
                                        <div className="text-sm text-blue-500 mt-1">{course?.name} ({course?.status})</div>
                                    </div>
                                     <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === c.id ? 'rotate-90' : ''}`} />
                                </div>
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === c.id ? 'max-h-[500px]' : ''}`}>
                                    <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-3">
                                        <div className="flex justify-between items-center"><span className="font-semibold">Modalidad:</span> <div><div className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><Edit size={12} className="text-blue-500"/> {c.modality || course?.modality}</div><div className="text-xs text-gray-500 flex items-center gap-1 ml-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: classroom?.color || '#A0AEC0' }}></div>{classroom?.name}</div></div></div>
                                        <div className="flex justify-between"><span className="font-semibold">Profesor/a:</span> <span>{teacher?.name} {teacher?.lastName}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">¿Sustitución?:</span> <span>{c.isSubstitution ? <Check size={20} className="text-green-500"/> : <X size={20} className="text-red-500"/>}</span></div>
                                        <div className="flex justify-between items-center"><span className="font-semibold">Estado:</span> 
                                            <div className="flex items-center">
                                                <select value={c.status} onChange={(e) => handleStatusChange(c.id, e.target.value as CourseClass['status'])} className={`p-1 border-0 rounded-md text-xs font-medium appearance-none ${statusColors[c.status]}`} onClick={(e) => e.stopPropagation()}>
                                                    <option value="Hecha">Hecha</option>
                                                    <option value="Pendiente">Pendiente</option>
                                                    <option value="Anulada">Anulada</option>
                                                </select>
                                                <button className="ml-1 text-green-600"><Check size={16}/></button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between"><span className="font-semibold">Comentario:</span> <div className="flex items-center gap-1"><Button variant="ghost" size="sm" onClick={() => handleOpenCommentModal(c, 'internal')}>Interno</Button>{canEditStudentAreaComments && <Button variant="ghost" size="sm" onClick={() => handleOpenCommentModal(c, 'public')}>Área de alumnos</Button>}<button><Send size={16} className="text-gray-400"/></button></div></div>
                                        <div className="flex justify-between"><span className="font-semibold">Asistencia:</span> <span>{c.status === 'Hecha' ? (<Link to={`/courses/${c.courseId}/classes/${c.id}/attendance`} className="flex items-center gap-2 text-blue-500 font-semibold hover:underline"><CalendarIcon size={16}/><span>{attendanceForThisClass}</span></Link>) : (<span className="text-gray-400 italic text-xs">--</span>)}</span></div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                {/* Desktop View (from LG) */}
                <div className="hidden lg:block">
                    <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                            <tr>
                                <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll}/></th>
                                <th scope="col" className="px-6 py-3">Fecha</th>
                                <th scope="col" className="px-6 py-3">Curso</th>
                                <th scope="col" className="px-6 py-3">Modalidad</th>
                                <th scope="col" className="px-6 py-3">Profesor/a</th>
                                <th scope="col" className="px-6 py-3">¿Es una sustitución?</th>
                                <th scope="col" className="px-6 py-3">Estado</th>
                                <th scope="col" className="px-6 py-3">Comentario</th>
                                <th scope="col" className="px-6 py-3">Asistencia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClasses.map(c => {
                                const course = courses.find(cr => cr.id === c.courseId);
                                const teacher = teachers.find(t => t.id === c.teacherId);
                                const classroom = classrooms.find(cl => cl.id === (c.classroomId || course?.classroomId));
                                const attendanceForThisClass = attendanceRecords.filter(ar => ar.classId === c.id && ar.attended).length;
                                return (
                                    <tr key={c.id} className="bg-white dark:bg-gray-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50">
                                        <td className="w-4 p-4"><div className="flex items-center gap-2"><input type="checkbox" checked={selectedClassIds.includes(c.id)} onChange={() => handleSelectOne(c.id)}/><button className="text-gray-400 hover:text-primary-600"><Edit size={14}/></button></div></td>
                                        <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                            <div>{formatDate(c.date)}</div>
                                            <div className="text-xs text-gray-500">{formatDayOfWeek(c.date)} {c.startTime}-{c.endTime}</div>
                                        </td>
                                        <td className="px-6 py-4">{course?.name} ({course?.status})</td>
                                        <td className="px-6 py-4"><div><div className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><Edit size={12} className="text-blue-500"/> {c.modality || course?.modality}</div><div className="text-xs text-gray-500 flex items-center gap-1 ml-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: classroom?.color || '#A0AEC0' }}></div>{classroom?.name}</div></div></td>
                                        <td className="px-6 py-4">{teacher?.name} {teacher?.lastName}</td>
                                        <td className="px-6 py-4 text-center">{c.isSubstitution ? <Check size={20} className="text-green-500 mx-auto"/> : <X size={20} className="text-red-500 mx-auto"/>}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <select value={c.status} onChange={(e) => handleStatusChange(c.id, e.target.value as CourseClass['status'])} className={`p-1 border-0 rounded-md text-xs font-medium appearance-none ${statusColors[c.status]}`} onClick={(e) => e.stopPropagation()}>
                                                    <option value="Hecha">Hecha</option>
                                                    <option value="Pendiente">Pendiente</option>
                                                    <option value="Anulada">Anulada</option>
                                                </select>
                                                <button className="ml-1 text-green-600"><Check size={16}/></button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="flex items-center gap-1"><Button variant="ghost" size="sm" onClick={() => handleOpenCommentModal(c, 'internal')}>Interno</Button>{canEditStudentAreaComments && <Button variant="ghost" size="sm" onClick={() => handleOpenCommentModal(c, 'public')}>Área de alumnos</Button>}<button><Send size={16} className="text-gray-400"/></button></div></td>
                                        <td className="px-6 py-4">{c.status === 'Hecha' ? (<Link to={`/courses/${c.courseId}/classes/${c.id}/attendance`} className="flex items-center gap-2 text-blue-500 font-semibold hover:underline"><CalendarIcon size={16}/><span>{attendanceForThisClass}</span></Link>) : (<span className="text-gray-400 italic text-xs">--</span>)}</td>
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

            {isCommentModalOpen && commentingClass && (
                <CommentModal
                    isOpen={isCommentModalOpen}
                    onClose={() => setIsCommentModalOpen(false)}
                    courseClass={commentingClass}
                    onSave={handleSaveComment}
                    activeTab={activeCommentTab}
                />
            )}
        </div>
    );
};

export default ClassDaysPage;
