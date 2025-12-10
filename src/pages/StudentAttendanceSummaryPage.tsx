
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Student, AttendanceRecord, LateType, CourseClass } from '../types';
import Button from '../components/ui/Button';
import { MoveLeft, Search, Check, X, Mail, MessageSquare, Calendar, BookOpen, AlertCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import CommentModal from '../components/CommentModal';

/**
 * Página que muestra el resumen de asistencias de un alumno específico.
 * Filtra estrictamente para mostrar solo clases que han sido marcadas como 'Hecha' y
 * que ocurren dentro del periodo de inscripción del alumno.
 */
export function StudentAttendanceSummaryPage() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { 
        students, 
        courses,
        courseClasses, 
        attendanceRecords, 
        updateAttendanceRecord,
        updateCourseClass,
        enrollments
    } = useData();

    const student = useMemo(() => students.find(s => s.id === parseInt(studentId || '0')), [students, studentId]);

    const [filters, setFilters] = useState(() => {
        const params = new URLSearchParams(location.search);
        const courseIdFromQuery = params.get('courseId');
        return {
            courseId: courseIdFromQuery || '',
            dateFrom: '',
            dateTo: '',
            attended: '',
        };
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [commentingClass, setCommentingClass] = useState<CourseClass | null>(null);

    /**
     * Obtiene y ordena todos los registros de asistencia del alumno.
     * Reglas de negocio aplicadas:
     * 1. La clase debe existir y tener estado 'Hecha'.
     * 2. La fecha de la clase debe ser igual o posterior a la fecha de inscripción.
     * 3. Si hay fecha de baja, la fecha de la clase debe ser igual o anterior a ella.
     */
    const studentAttendanceRecords = useMemo(() => {
        if (!student) return [];
        
        // 1. Obtener todas las inscripciones de este alumno
        const studentEnrollments = enrollments.filter(e => e.studentId === student.id);

        return attendanceRecords
            .filter(ar => ar.studentId === student.id)
            .map(ar => {
                const classInfo = courseClasses.find(c => c.id === ar.classId);
                return { ...ar, classInfo };
            })
            .filter(ar => {
                // A. Validación básica: debe tener información de clase
                if (!ar.classInfo) return false;

                // B. FILTRO ESTRICTO: Solo mostrar registros cuyo estado sea 'Realizado'
                // Esto cumple el requisito: "solo deben mostrarse las asistencias cuyo modo sea realizado"
                if (ar.status !== 'Realizado') return false;

                // C. Encontrar la inscripción correspondiente a este curso
                const enrollment = studentEnrollments.find(e => e.courseId === ar.classInfo!.courseId);
                
                // Si no hay inscripción asociada (datos huérfanos), no mostramos el registro
                if (!enrollment) return false;

                // D. VALIDACIÓN DE FECHAS (Normalización a media noche para comparar solo fechas)
                const classDate = new Date(ar.classInfo.date);
                classDate.setHours(0, 0, 0, 0);
                
                const enrollmentDate = new Date(enrollment.enrollmentDate);
                enrollmentDate.setHours(0, 0, 0, 0);

                // D.1 Si la clase es ANTERIOR a la fecha de inscripción, NO mostrar.
                // Cumple el requisito: "desde su fecha de alta en ese curso"
                if (classDate.getTime() < enrollmentDate.getTime()) return false;

                // D.2 Si hay fecha de baja (cancellationDate) y la clase es POSTERIOR, NO mostrar.
                if (enrollment.cancellationDate) {
                    const cancellationDate = new Date(enrollment.cancellationDate);
                    cancellationDate.setHours(0, 0, 0, 0);
                    if (classDate.getTime() > cancellationDate.getTime()) return false;
                }

                return true;
            }) 
            .sort((a, b) => b.classInfo!.date.getTime() - a.classInfo!.date.getTime());
    }, [attendanceRecords, student, courses, courseClasses, enrollments]);

    /**
     * Filtra los registros de asistencia válidos según los criterios de búsqueda de la UI.
     */
    const filteredRecords = useMemo(() => {
        return studentAttendanceRecords.filter(record => {
            const course = courses.find(c => c.id === record.classInfo?.courseId);
            if (!course) return false;

            const searchMatch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
            const courseFilterMatch = filters.courseId ? course.id === parseInt(filters.courseId) : true;
            
            // Filtro de fechas UI
            let dateFromMatch = true;
            let dateToMatch = true;
            if (filters.dateFrom) {
                const fDate = new Date(filters.dateFrom);
                fDate.setHours(0,0,0,0);
                const rDate = new Date(record.classInfo!.date);
                rDate.setHours(0,0,0,0);
                dateFromMatch = rDate.getTime() >= fDate.getTime();
            }
            if (filters.dateTo) {
                const tDate = new Date(filters.dateTo);
                tDate.setHours(0,0,0,0);
                const rDate = new Date(record.classInfo!.date);
                rDate.setHours(0,0,0,0);
                dateToMatch = rDate.getTime() <= tDate.getTime();
            }

            const attendedMatch = filters.attended ? String(record.attended) === filters.attended : true;

            return searchMatch && courseFilterMatch && dateFromMatch && dateToMatch && attendedMatch;
        });
    }, [studentAttendanceRecords, filters, searchTerm, courses]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleAttendanceChange = (recordId: string, field: keyof Omit<AttendanceRecord, 'id' | 'classId' | 'studentId'>, value: any) => {
        const recordToUpdate = attendanceRecords.find(ar => ar.id === recordId);
        if (recordToUpdate) {
            const newRecord = { ...recordToUpdate, [field]: value };

            if (field === 'attended') {
                if (value === false) { // Pasó a ausente
                    newRecord.homeworkDone = false;
                    newRecord.late = 'No';
                    newRecord.absenceJustified = true; // Por defecto justificada al marcar falta manual
                } else { // Pasó a presente
                    newRecord.absenceJustified = false;
                }
            }
            updateAttendanceRecord(newRecord);
        }
    };
    
    const handleOpenCommentModal = (classItem: CourseClass) => {
        setCommentingClass(classItem);
        setIsCommentModalOpen(true);
    };

    const handleSaveComment = (updatedClass: CourseClass) => {
        updateCourseClass(updatedClass);
        setIsCommentModalOpen(false);
        setCommentingClass(null);
    };

    if (!student) {
        return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Alumno no encontrado.</div>;
    }

    const lateOptions: LateType[] = ['No', '5 minutos tarde', '10 minutos tarde', '15 minutos tarde', '20 minutos tarde', '25 minutos tarde', '30 o más minutos tarde'];
    
    const inputClasses = "w-full p-2.5 border rounded-md text-sm transition-colors bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400 dark:placeholder-gray-500";
    const labelClasses = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider";

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 p-2 rounded-lg">
                            <Calendar size={24} />
                        </span>
                        {student.lastName}, {student.firstName}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-14">
                        Histórico detallado de asistencia y comportamiento en clase (Solo clases realizadas).
                    </p>
                </div>
                <div className="flex items-center gap-3 self-end md:self-auto">
                     <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{filteredRecords.length} Registros</span>
                    </div>
                    <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16} />} onClick={() => navigate(-1)}>Volver</Button>
                </div>
            </div>

            {/* Filters Card */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    
                    <div>
                        <label className={labelClasses}>Curso</label>
                        <select name="courseId" value={filters.courseId} onChange={handleFilterChange} className={inputClasses}>
                            <option value="">Todos los cursos</option>
                            {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={labelClasses}>Rango de Fechas</label>
                        <div className="flex gap-2">
                            <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className={inputClasses} placeholder="Desde"/>
                            <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className={inputClasses} placeholder="Hasta"/>
                        </div>
                    </div>

                    <div>
                         <label className={labelClasses}>Estado Asistencia</label>
                         <select name="attended" value={filters.attended} onChange={handleFilterChange} className={inputClasses}>
                            <option value="">Todos</option>
                            <option value="true">Asistió (Presente)</option>
                            <option value="false">Faltó (Ausente)</option>
                        </select>
                    </div>

                    <div>
                        <label className={labelClasses}>Buscar</label>
                        <div className="relative">
                            <input type="text" placeholder="Nombre del curso..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`${inputClasses} pl-10`} />
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                
                {/* Mobile List View */}
                <div className="md:hidden divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredRecords.map(record => {
                        const course = courses.find(c => c.id === record.classInfo?.courseId);
                        if (!course || !record.classInfo) return null;

                        const isExpanded = expandedRow === record.id;
                        const statusColor = record.attended 
                            ? 'border-l-4 border-l-green-500' 
                            : 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/10';

                        return (
                            <div key={record.id} className={`group ${statusColor}`}>
                                <div className="p-4" onClick={() => setExpandedRow(isExpanded ? null : record.id)}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{record.classInfo.date.toLocaleDateString()}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 flex items-center gap-1">
                                                <BookOpen size={14}/> {course.name}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${record.attended ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                                                {record.attended ? 'Presente' : 'Ausente'}
                                            </span>
                                            {record.late !== 'No' && <span className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1"><Clock size={12}/> Retraso</span>}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={`overflow-hidden transition-all duration-300 bg-gray-50 dark:bg-slate-700/30 ${isExpanded ? 'max-h-[1000px] opacity-100 border-t border-gray-200 dark:border-slate-700' : 'max-h-0 opacity-0'}`}>
                                    <div className="p-4 space-y-4">
                                        {/* Mobile Actions */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Asistencia</label>
                                                <button 
                                                    onClick={() => handleAttendanceChange(record.id, 'attended', !record.attended)}
                                                    className={`w-full py-2 px-3 rounded-md text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${record.attended ? 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200' : 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300'}`}
                                                >
                                                    {record.attended ? <><Check size={16}/> Marcar Falta</> : <><X size={16}/> Marcar Asistencia</>}
                                                </button>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Deberes</label>
                                                <button 
                                                    onClick={() => handleAttendanceChange(record.id, 'homeworkDone', !record.homeworkDone)}
                                                    disabled={!record.attended}
                                                    className={`w-full py-2 px-3 rounded-md text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${!record.attended ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-slate-900 border-gray-200' : record.homeworkDone ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600'}`}
                                                >
                                                    {record.homeworkDone ? <><Check size={16}/> Hechos</> : 'No hechos'}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Retraso</label>
                                            <select 
                                                value={record.late} 
                                                onChange={e => handleAttendanceChange(record.id, 'late', e.target.value as LateType)} 
                                                disabled={!record.attended}
                                                className="w-full p-2 border rounded-md text-sm bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white disabled:opacity-50"
                                            >
                                                {lateOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </div>

                                        {!record.attended && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Justificación</label>
                                                <select 
                                                    value={String(record.absenceJustified)} 
                                                    onChange={e => handleAttendanceChange(record.id, 'absenceJustified', e.target.value === 'true')}
                                                    className="w-full p-2 border rounded-md text-sm bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                                                >
                                                    <option value="true">Justificada</option>
                                                    <option value="false">No justificada</option>
                                                </select>
                                            </div>
                                        )}
                                        
                                        <div className="pt-2 border-t border-gray-200 dark:border-slate-600 flex justify-end gap-2">
                                             <button onClick={() => handleOpenCommentModal(record.classInfo!)} className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline flex items-center gap-1">
                                                <MessageSquare size={16}/> Comentarios
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-200 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4 border-b dark:border-slate-600">Fecha / Curso</th>
                                <th className="px-6 py-4 border-b dark:border-slate-600 text-center">Asistencia</th>
                                <th className="px-6 py-4 border-b dark:border-slate-600">Estado (Retraso/Justif.)</th>
                                <th className="px-6 py-4 border-b dark:border-slate-600 text-center">Avisos</th>
                                <th className="px-6 py-4 border-b dark:border-slate-600 text-center">Deberes</th>
                                <th className="px-6 py-4 border-b dark:border-slate-600 text-center">Notas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredRecords.map(record => {
                                const course = courses.find(c => c.id === record.classInfo?.courseId);
                                if (!course || !record.classInfo) return null;
                                
                                // Determine Row Styles based on state
                                const rowClass = !record.attended 
                                    ? 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20' 
                                    : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50';

                                return (
                                    <tr key={record.id} className={`transition-colors duration-150 ${rowClass}`}>
                                        
                                        {/* Date & Course */}
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white">{record.classInfo.date.toLocaleDateString()}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{course.name}</div>
                                        </td>

                                        {/* Attendance Toggle */}
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleAttendanceChange(record.id, 'attended', !record.attended)}
                                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 shadow-sm ${record.attended ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400 hover:bg-green-200' : 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 hover:bg-red-200'}`}
                                                title={record.attended ? "Presente" : "Ausente"}
                                            >
                                                {record.attended ? <Check size={18} strokeWidth={3}/> : <X size={18} strokeWidth={3}/>}
                                            </button>
                                        </td>

                                        {/* Status Selectors */}
                                        <td className="px-6 py-4">
                                            {record.attended ? (
                                                 <div className="relative w-full">
                                                    <select 
                                                        value={record.late} 
                                                        onChange={e => handleAttendanceChange(record.id, 'late', e.target.value as LateType)}
                                                        className={`appearance-none w-full py-1.5 pl-3 pr-8 rounded text-xs font-medium border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1
                                                            ${record.late !== 'No' 
                                                                ? 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-300 focus:ring-orange-400' 
                                                                : 'bg-white border-gray-200 text-gray-600 dark:bg-slate-900 dark:border-slate-600 dark:text-gray-300 hover:border-gray-300 focus:ring-gray-400'}
                                                        `}
                                                    >
                                                        {lateOptions.map(opt => <option key={opt} value={opt}>{opt === 'No' ? 'Sin retraso' : opt}</option>)}
                                                    </select>
                                                    <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${record.late !== 'No' ? 'text-orange-500' : 'text-gray-400'}`} />
                                                </div>
                                            ) : (
                                                <div className="relative w-full">
                                                    <select 
                                                        value={String(record.absenceJustified)} 
                                                        onChange={e => handleAttendanceChange(record.id, 'absenceJustified', e.target.value === 'true')} 
                                                        className={`appearance-none w-full py-1.5 pl-3 pr-8 rounded text-xs font-medium border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1
                                                            ${record.absenceJustified
                                                                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300 focus:ring-green-400'
                                                                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 focus:ring-red-400'
                                                            }
                                                        `}
                                                    >
                                                        <option value="true">Justificada</option>
                                                        <option value="false">No justificada</option>
                                                    </select>
                                                    <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${record.absenceJustified ? 'text-green-500' : 'text-red-500'}`} />
                                                </div>
                                            )}
                                        </td>

                                        {/* Notifications Actions */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                {( (record.attended && record.late !== 'No') || (!record.attended && !record.absenceJustified) ) ? (
                                                    <>
                                                        <button className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-slate-600 text-blue-600 dark:text-blue-400 transition-colors" title="Enviar Email"><Mail size={16} /></button>
                                                        <button className="p-1.5 rounded hover:bg-green-100 dark:hover:bg-slate-600 text-green-600 dark:text-green-400 transition-colors" title="Enviar WhatsApp"><MessageSquare size={16} /></button>
                                                    </>
                                                ) : <span className="text-gray-300 dark:text-gray-700 text-xs">-</span>}
                                            </div>
                                        </td>

                                        {/* Homework Toggle */}
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleAttendanceChange(record.id, 'homeworkDone', !record.homeworkDone)} 
                                                disabled={!record.attended}
                                                className={`transition-opacity duration-200 ${!record.attended ? 'opacity-20 cursor-not-allowed' : 'opacity-100 hover:scale-110'}`}
                                                title={record.homeworkDone ? "Deberes Hechos" : "Deberes Incompletos"}
                                            >
                                                {record.homeworkDone 
                                                    ? <Check size={20} className="text-green-500 dark:text-green-400"/> 
                                                    : <AlertCircle size={20} className="text-gray-300 dark:text-gray-600"/>}
                                            </button>
                                        </td>

                                        {/* Comments */}
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors"
                                                onClick={() => handleOpenCommentModal(record.classInfo!)}
                                                title="Ver/Editar Comentarios"
                                            >
                                                <MessageSquare size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {filteredRecords.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        No se encontraron registros con los filtros actuales.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isCommentModalOpen && commentingClass && (
                <CommentModal
                    isOpen={isCommentModalOpen}
                    onClose={() => setIsCommentModalOpen(false)}
                    courseClass={commentingClass}
                    onSave={handleSaveComment}
                    activeTab="public"
                />
            )}
        </div>
    );
}

export default StudentAttendanceSummaryPage;