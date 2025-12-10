
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { 
    Search, History, FileText, Edit, BookOpen, Calendar, 
    Receipt, FileInput, ShieldCheck, Mail, EyeOff, ArrowRightCircle,
    HelpCircle, Landmark, Repeat, HandCoins, CreditCard, Smartphone, Gift, CalendarDays, CalendarClock, CircleDollarSign, Hand, Ban, Tag, Settings2, MoreHorizontal, ChevronDown, ChevronUp
} from 'lucide-react';
import { Student } from '../types';
import { calculateAge, getRandomColor, isSameDayMonth, checkBirthdayVisibility } from '../utils/helpers';
import StickyScrollWrapper from '../components/ui/StickyScrollWrapper';
import { PAYMENT_TYPES, PAYMENT_PERIODICITIES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import BirthdayIcon from '../components/ui/BirthdayIcon';
import DebtAlertIcon from '../components/ui/DebtAlertIcon';

// Icon helpers (reused from StudentsPage for consistency)
const PaymentTypeIcon = ({ type }: { type: string }) => {
   let icon = <HelpCircle size={18} className="text-gray-500" />;
   switch (type) {
     case 'Domiciliado':
       icon = <Landmark size={18} className="text-indigo-500" />;
       break;
     case 'Transferencia':
       icon = <Repeat size={18} className="text-blue-500" />;
       break;
     case 'Efectivo':
       icon = <HandCoins size={18} className="text-green-500" />;
       break;
     case 'Tarjeta':
     case 'TPV':
       icon = <CreditCard size={18} className="text-orange-500" />;
       break;
     case 'Bizum':
         icon = <Smartphone size={18} className="text-cyan-500" />;
         break;
     case 'Free':
       icon = <Gift size={18} className="text-pink-500" />;
       break;
   }
   return <div className="flex items-center justify-center" title={type}>{icon}</div>;
};

const PaymentPeriodicityIcon = ({ periodicity }: { periodicity: string }) => {
   let icon = <HelpCircle size={18} className="text-gray-500" />;
   switch (periodicity) {
     case 'Mensual':
       icon = <CalendarDays size={18} className="text-sky-500" />;
       break;
     case 'Trimestral':
       icon = <CalendarClock size={18} className="text-teal-500" />;
       break;
     case 'Único':
       icon = <CircleDollarSign size={18} className="text-amber-500" />;
       break;
     case 'Manual':
       icon = <Hand size={18} className="text-slate-500" />;
       break;
     case 'Sin periodicidad':
       icon = <Ban size={18} className="text-red-500" />;
       break;
   }
   return <div className="flex items-center justify-center" title={periodicity}>{icon}</div>;
};

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

const StudentHistoryPage = () => {
    const { students, enrollments, courses, attendanceRecords, courseLevels, studentTags, receipts, studentAuthorizations, academyProfile, courseClasses } = useData();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    
     // Filtros básicos
    const [filters, setFilters] = useState({
        level: '',
        location: '',
        paymentType: '',
        periodicity: '',
        registrationDateFrom: '',
        registrationDateTo: '',
    });

    // Estados para filtros expandibles
    const [expandedFilterSection, setExpandedFilterSection] = useState<'tags' | 'auths' | 'advanced' | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedAuths, setSelectedAuths] = useState<string[]>([]);
    const [selectedAdvanced, setSelectedAdvanced] = useState<string[]>([]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const toggleFilterSection = (section: 'tags' | 'auths' | 'advanced') => {
        setExpandedFilterSection(prev => prev === section ? null : section);
    };

    const handleCheckboxFilterChange = (
        value: string, 
        setter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        setter(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
    };

    /**
     * Devuelve solo los cursos en los que el alumno tiene una inscripción activa.
     */
    const getStudentEnrolledCourses = (studentId: number) => {
         const enrolledCourseIds = enrollments
            .filter(e => e.studentId === studentId && e.isActive)
            .map(e => e.courseId);
         return courses.filter(c => enrolledCourseIds.includes(c.id));
    };

    // Pre-calcular IDs de clases pasadas (Normalizando fechas para Supabase/Local)
    const pastClassIds = useMemo(() => {
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        
        return new Set(
            courseClasses
                .filter(c => new Date(c.date) <= now) // `new Date()` maneja tanto string ISO como Date objects
                .map(c => c.id)
        );
    }, [courseClasses]);

    // Muestra TODOS los alumnos (Activos e Inactivos)
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            // No filtering by isActive here to show history
            
            const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
            const searchMatch = fullName.includes(searchTerm.toLowerCase());
            
            const studentCourses = getStudentEnrolledCourses(student.id);
            const studentLevels = studentCourses.map(c => c.level);
            const levelMatch = filters.level ? studentLevels.includes(filters.level) : true;
            
            const locationMatch = filters.location ? student.population === filters.location : true;
            const paymentTypeMatch = filters.paymentType ? student.paymentConfig.type === filters.paymentType : true;
            const periodicityMatch = filters.periodicity ? student.paymentConfig.periodicity === filters.periodicity : true;
            
            const regDate = new Date(student.registrationDate);
            const dateFromMatch = filters.registrationDateFrom ? regDate >= new Date(filters.registrationDateFrom) : true;
            const dateToMatch = filters.registrationDateTo ? regDate <= new Date(filters.registrationDateTo) : true;

             let tagsMatch = true;
            if (selectedTags.length > 0) {
                tagsMatch = selectedTags.every(tag => student.tags?.includes(tag));
            }

            let authsMatch = true;
            if (selectedAuths.length > 0) {
                if (selectedAuths.includes('whatsapp') && !student.authorizations.whatsapp) authsMatch = false;
                if (selectedAuths.includes('imageRights') && !student.authorizations.imageRights) authsMatch = false;
                if (selectedAuths.includes('canLeaveAlone') && !student.authorizations.canLeaveAlone) authsMatch = false;
            }

            let advancedMatch = true;
            if (selectedAdvanced.length > 0) {
                if (selectedAdvanced.includes('allergies') && !student.allergies) advancedMatch = false;
                if (selectedAdvanced.includes('discount') && !student.paymentConfig.hasDiscount) advancedMatch = false;
                if (selectedAdvanced.includes('pendingReceipts')) {
                    const hasPending = receipts.some(r => r.studentId === student.id && r.status === 'Pendiente');
                    if (!hasPending) advancedMatch = false;
                }
                if (selectedAdvanced.includes('activeEnrollments')) {
                     const hasActive = enrollments.some(e => e.studentId === student.id && e.isActive);
                     if (!hasActive) advancedMatch = false;
                }
                if (selectedAdvanced.includes('multipleEnrollments')) {
                     const activeCount = enrollments.filter(e => e.studentId === student.id && e.isActive).length;
                     if (activeCount < 2) advancedMatch = false;
                }
                 if (selectedAdvanced.includes('secondPayer') && !student.hasSecondPayer) advancedMatch = false;
                 if (selectedAdvanced.includes('newsletter') && !student.authorizations.newsletters) advancedMatch = false;
            }

            return searchMatch && levelMatch && locationMatch && paymentTypeMatch && periodicityMatch && dateFromMatch && dateToMatch && tagsMatch && authsMatch && advancedMatch;
        }).sort((a, b) => {
             // Ordenar por Nombre primero, luego por Apellido
             const nameCompare = a.firstName.localeCompare(b.firstName);
             if (nameCompare !== 0) return nameCompare;
             return a.lastName.localeCompare(b.lastName);
        });
    }, [searchTerm, students, courses, enrollments, filters, selectedTags, selectedAuths, selectedAdvanced, receipts]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedStudents(filteredStudents.map(s => s.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectOne = (id: number) => {
        setSelectedStudents(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    };
    
    const canSeeBirthdays = checkBirthdayVisibility(user?.role, academyProfile);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <History /> Histórico de Alumnos
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Consulta el listado completo de alumnos, incluyendo inactivos.
                    </p>
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-semibold">
                    {filteredStudents.length} Resultados
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                
                <div className="flex flex-wrap items-end gap-4 pb-4 border-b border-gray-100 dark:border-slate-700">
                    <select name="level" value={filters.level} onChange={handleFilterChange} className="p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500 min-w-[120px]"><option value="">Nivel</option>{courseLevels.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}</select>
                    <select name="location" value={filters.location} onChange={handleFilterChange} className="p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500 min-w-[120px]"><option value="">Localización</option>{[...new Set(students.map(s => s.population))].map(p => <option key={p} value={p}>{p}</option>)}</select>
                    <select name="paymentType" value={filters.paymentType} onChange={handleFilterChange} className="p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500 min-w-[120px]"><option value="">Tipo pago</option>{PAYMENT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}</select>
                    <select name="periodicity" value={filters.periodicity} onChange={handleFilterChange} className="p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500 min-w-[120px]"><option value="">Periodicidad</option>{PAYMENT_PERIODICITIES.map(p => <option key={p} value={p}>{p}</option>)}</select>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-900 p-1 rounded border border-gray-200 dark:border-slate-700">
                        <span className="font-medium px-2">Fecha inscripción:</span>
                        <input type="date" name="registrationDateFrom" value={filters.registrationDateFrom} onChange={handleFilterChange} className="p-1.5 border rounded text-sm w-32 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600" placeholder="Desde"/>
                        <span>-</span>
                        <input type="date" name="registrationDateTo" value={filters.registrationDateTo} onChange={handleFilterChange} className="p-1.5 border rounded text-sm w-32 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600" placeholder="Hasta"/>
                    </div>

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

                 <div className="flex flex-wrap items-center gap-6 text-sm text-blue-600 dark:text-blue-400 font-semibold mt-4">
                    <button onClick={() => toggleFilterSection('tags')} className={`flex items-center gap-1 hover:text-blue-800 dark:hover:text-blue-300 ${expandedFilterSection === 'tags' ? 'underline' : ''}`}><Tag size={16}/>Filtrar por etiquetas</button>
                    <button onClick={() => toggleFilterSection('auths')} className={`flex items-center gap-1 hover:text-blue-800 dark:hover:text-blue-300 ${expandedFilterSection === 'auths' ? 'underline' : ''}`}><ShieldCheck size={16}/>Filtra por autorizaciones</button>
                    <button onClick={() => toggleFilterSection('advanced')} className={`flex items-center gap-1 hover:text-blue-800 dark:hover:text-blue-300 ${expandedFilterSection === 'advanced' ? 'underline' : ''}`}><Settings2 size={16}/>Filtros avanzados</button>
                </div>

                {expandedFilterSection === 'tags' && (
                    <div className="mt-3 p-4 bg-gray-50 dark:bg-slate-700/30 rounded-md border border-gray-200 dark:border-slate-600 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        {studentTags.map(tag => (
                            <label key={tag.id} className="flex items-center gap-2 text-gray-700 dark:text-gray-200 cursor-pointer select-none">
                                <input type="checkbox" checked={selectedTags.includes(tag.name)} onChange={() => handleCheckboxFilterChange(tag.name, setSelectedTags)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                                <span style={{ color: tag.color }}>●</span> {tag.name}
                            </label>
                        ))}
                        {studentTags.length === 0 && <p className="text-gray-500 col-span-full italic">No hay etiquetas configuradas.</p>}
                    </div>
                )}

                {expandedFilterSection === 'auths' && (
                    <div className="mt-3 p-4 bg-gray-50 dark:bg-slate-700/30 rounded-md border border-gray-200 dark:border-slate-600 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200 cursor-pointer select-none"><input type="checkbox" checked={selectedAuths.includes('whatsapp')} onChange={() => handleCheckboxFilterChange('whatsapp', setSelectedAuths)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/> Autorización para la inclusión en el grupo de Whatsapp de la Extraescolar</label>
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200 cursor-pointer select-none"><input type="checkbox" checked={selectedAuths.includes('imageRights')} onChange={() => handleCheckboxFilterChange('imageRights', setSelectedAuths)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/> Autorización para el uso de derecho de imagen</label>
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200 cursor-pointer select-none"><input type="checkbox" checked={selectedAuths.includes('canLeaveAlone')} onChange={() => handleCheckboxFilterChange('canLeaveAlone', setSelectedAuths)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/> Autorización para salir solo/a</label>
                    </div>
                )}

                 {expandedFilterSection === 'advanced' && (
                    <div className="mt-3 p-4 bg-gray-50 dark:bg-slate-700/30 rounded-md border border-gray-200 dark:border-slate-600 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200 cursor-pointer select-none"><input type="checkbox" checked={selectedAdvanced.includes('pendingReceipts')} onChange={() => handleCheckboxFilterChange('pendingReceipts', setSelectedAdvanced)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/> Recibos pendientes</label>
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200 cursor-pointer select-none"><input type="checkbox" checked={selectedAdvanced.includes('newsletter')} onChange={() => handleCheckboxFilterChange('newsletter', setSelectedAdvanced)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/> Acepta newsletter comerciales</label>
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200 cursor-pointer select-none"><input type="checkbox" checked={selectedAdvanced.includes('allergies')} onChange={() => handleCheckboxFilterChange('allergies', setSelectedAdvanced)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/> Con Alergias/Enfermedades</label>
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200 cursor-pointer select-none"><input type="checkbox" checked={selectedAdvanced.includes('activeEnrollments')} onChange={() => handleCheckboxFilterChange('activeEnrollments', setSelectedAdvanced)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/> Inscripciones activas</label>
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200 cursor-pointer select-none"><input type="checkbox" checked={selectedAdvanced.includes('multipleEnrollments')} onChange={() => handleCheckboxFilterChange('multipleEnrollments', setSelectedAdvanced)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/> Más de una inscripción activa</label>
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200 cursor-pointer select-none"><input type="checkbox" checked={selectedAdvanced.includes('discount')} onChange={() => handleCheckboxFilterChange('discount', setSelectedAdvanced)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/> Con descuento</label>
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200 cursor-pointer select-none"><input type="checkbox" checked={selectedAdvanced.includes('secondPayer')} onChange={() => handleCheckboxFilterChange('secondPayer', setSelectedAdvanced)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/> Segundo pagador configurado</label>
                    </div>
                )}

            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 w-full">
                {/* Mobile View (Cards) */}
                 <div className="lg:hidden divide-y divide-gray-200 dark:divide-slate-700">
                    <div className="p-4 flex items-center bg-gray-50 dark:bg-slate-700">
                         <input type="checkbox" onChange={handleSelectAll} checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length} className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 mr-4"/>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Alumno</span>
                    </div>
                    {filteredStudents.map(student => {
                        const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();
                        const avatarColor = getRandomColor(initials);
                        const isBirthday = canSeeBirthdays && isSameDayMonth(student.birthDate);
                        const studentCourses = getStudentEnrolledCourses(student.id);
                        
                        // Accurately calculate attendance to today
                        const totalAttendanceCount = attendanceRecords.filter(ar => 
                            ar.studentId === student.id && 
                            ar.attended &&
                            pastClassIds.has(ar.classId)
                        ).length;

                        const receiptCount = receipts.filter(r => r.studentId === student.id).length;
                        const authCount = studentAuthorizations.filter(sa => sa.studentId === student.id).length;

                        return (
                            <div key={student.id} className={`group ${!student.isActive ? 'opacity-70 bg-gray-50 dark:bg-slate-900' : ''}`}>
                                <div 
                                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors" 
                                    onClick={() => setExpandedRow(prev => prev === student.id ? null : student.id)}
                                >
                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedStudents.includes(student.id)} 
                                            onChange={() => handleSelectOne(student.id)} 
                                            className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
                                        />
                                        <DebtAlertIcon studentId={student.id} />
                                    </div>

                                    <div className="relative w-10 h-10 flex-shrink-0">
                                        {student.photoUrl ? (
                                            <img src={student.photoUrl} alt={`${student.firstName} ${student.lastName}`} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs ${avatarColor}`}>
                                                {initials}
                                            </div>
                                        )}
                                        {isBirthday && <div className="absolute -top-3 -left-2 z-10 pointer-events-none"><BirthdayIcon size={30} /></div>}
                                        <StudentStatusIcon student={student} />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Link to={`/students/${student.id}/edit`} onClick={e => e.stopPropagation()} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                                 {student.firstName} {student.lastName}
                                            </Link>
                                            <Link to={`/students/${student.id}/edit`} onClick={e => e.stopPropagation()} className="text-gray-400 hover:text-primary-600"><Edit size={14}/></Link>
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {studentCourses.length > 0 ? studentCourses.map(c => c.name).join(', ') : 'Sin cursos activos'}
                                        </div>
                                    </div>
                                    {expandedRow === student.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                </div>
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden bg-gray-50 dark:bg-slate-700/50 ${expandedRow === student.id ? 'max-h-[500px] opacity-100 border-t dark:border-slate-600' : 'max-h-0 opacity-0'}`}>
                                    <div className="px-4 pb-4 pt-2 text-sm space-y-2">
                                        <div className="flex justify-between"><span className="font-semibold text-gray-500">Edad:</span> <span className="text-gray-800 dark:text-gray-200">{calculateAge(student.birthDate)} años</span></div>
                                        <div className="flex justify-between"><span className="font-semibold text-gray-500">Tipo Pago:</span> <span className="text-gray-800 dark:text-gray-200">{student.paymentConfig.type}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold text-gray-500">Periodicidad:</span> <span className="text-gray-800 dark:text-gray-200">{student.paymentConfig.periodicity}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold text-gray-500">Asistencia:</span> <Link to={`/students/${student.id}/attendance`} className="text-blue-500 hover:underline">{totalAttendanceCount}</Link></div>
                                        <div className="flex justify-between"><span className="font-semibold text-gray-500">Recibos:</span> <Link to={`/students/${student.id}/receipts`} className="text-blue-500 hover:underline">{receiptCount}</Link></div>
                                        <div className="flex justify-between"><span className="font-semibold text-gray-500">Facturas:</span> <span className="text-red-500">{student.stats.invoices}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold text-gray-500">Emails:</span> <span className="text-blue-500">{student.stats.emails}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold text-gray-500">Docs:</span> <Link to={`/students/${student.id}/docs`} className={`hover:underline ${student.stats.docs > 0 ? 'text-blue-500' : 'text-red-500'}`}>{student.stats.docs}</Link></div>
                                        <div className="flex justify-between"><span className="font-semibold text-gray-500">Autorizaciones:</span> <Link to={`/students/${student.id}/authorizations`} className="text-blue-500 hover:underline">{authCount}</Link></div>
                                        {!student.isActive && <div className="text-red-500 font-bold text-center mt-2">ALUMNO INACTIVO</div>}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Desktop View (from LG) */}
                <div className="hidden lg:block w-full">
                    <StickyScrollWrapper>
                        <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                                <tr>
                                    <th scope="col" className="p-4 px-2"><input type="checkbox" onChange={handleSelectAll} checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length} className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"/></th>
                                    <th scope="col" className="px-2 py-3 w-8"></th> {/* Column for Debt Alert Icon */}
                                    <th scope="col" className="px-2 py-3">Nombre completo</th>
                                    <th scope="col" className="px-2 py-3 text-center">Edad</th>
                                    <th scope="col" className="px-2 py-3 text-center">Tipo P.</th>
                                    <th scope="col" className="px-2 py-3 text-center">Modo P.</th>
                                    <th scope="col" className="px-2 py-3 text-center">Cursos</th>
                                    <th scope="col" className="px-2 py-3">Activos</th>
                                    <th scope="col" className="px-2 py-3 text-center">Asist.</th>
                                    <th scope="col" className="px-2 py-3 text-center">Ficha</th>
                                    <th scope="col" className="px-2 py-3 text-center">Recibos</th>
                                    <th scope="col" className="px-2 py-3 text-center">Facturas</th>
                                    <th scope="col" className="px-2 py-3 text-center">Emails</th>
                                    <th scope="col" className="px-2 py-3 text-center">Docs.</th>
                                    <th scope="col" className="px-2 py-3 text-center">Autoriz.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => {
                                    const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();
                                    const avatarColor = getRandomColor(initials);
                                    const studentCourses = getStudentEnrolledCourses(student.id);
                                    const studentCourseIds = new Set(studentCourses.map(c => c.id));

                                    const totalAttendanceCount = attendanceRecords.filter(ar => {
                                        if (ar.studentId !== student.id || !ar.attended) return false;
                                        // Check if class happened in the past or today
                                        if (!pastClassIds.has(ar.classId)) return false;
                                        
                                        // Additionally verify it belongs to enrolled courses (usually handled by filtered view but good for robustness)
                                        const recordCourseId = parseInt(ar.classId.split('-')[0], 10);
                                        return studentCourseIds.has(recordCourseId);
                                    }).length;
                                    
                                    const receiptCount = receipts.filter(r => r.studentId === student.id).length;
                                    const authCount = studentAuthorizations.filter(sa => sa.studentId === student.id).length;
                                    const isBirthday = canSeeBirthdays && isSameDayMonth(student.birthDate);

                                    return (
                                        <tr key={student.id} className={`border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50 ${!student.isActive ? 'bg-gray-100 dark:bg-gray-900 opacity-60' : 'bg-white dark:bg-slate-800'}`}>
                                            <td className="w-4 p-4 px-2">
                                                <div className="flex items-center gap-2">
                                                    <input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => handleSelectOne(student.id)} className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"/>
                                                    <Link to={`/students/${student.id}/edit`} className="text-gray-400 hover:text-primary-600"><Edit size={14}/></Link>
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 text-center">
                                                <DebtAlertIcon studentId={student.id} />
                                            </td>
                                            <td className="px-2 py-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-8 h-8 flex-shrink-0">
                                                        {student.photoUrl ? (
                                                            <img src={student.photoUrl} alt={`${student.firstName} ${student.lastName}`} className="w-8 h-8 rounded-full object-cover" />
                                                        ) : (
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${avatarColor}`}>
                                                                {initials}
                                                            </div>
                                                        )}
                                                        {isBirthday && <div className="absolute -top-4 -left-3 z-10 pointer-events-none"><BirthdayIcon size={30} /></div>}
                                                        <StudentStatusIcon student={student} />
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        <Link to={`/students/${student.id}/edit`} className="hover:underline">
                                                            <span>{student.firstName} {student.lastName}</span>
                                                        </Link>
                                                        {!student.isActive && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 uppercase">Inactivo</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 text-center">{calculateAge(student.birthDate)}</td>
                                            <td className="px-2 py-4"><div className="flex justify-center"><PaymentTypeIcon type={student.paymentConfig.type} /></div></td>
                                            <td className="px-2 py-4"><div className="flex justify-center"><PaymentPeriodicityIcon periodicity={student.paymentConfig.periodicity} /></div></td>
                                            <td className="px-2 py-4 text-center">
                                                <Link to={`/students/${student.id}/courses`} className="flex items-center justify-center gap-2 text-blue-500 font-semibold hover:underline">
                                                    <BookOpen size={16} /><span>{studentCourses.length}</span>
                                                </Link>
                                            </td>
                                            <td className="px-2 py-4">
                                                <ul className="space-y-1 max-w-xs truncate">
                                                    {studentCourses.map(c => (
                                                        <li key={c.id}>
                                                            • <Link to={`/courses/${c.id}/students`} className="hover:underline">{c.name}</Link>
                                                        </li>
                                                    ))}
                                                    {studentCourses.length === 0 && <li className="text-gray-400 italic">Sin cursos</li>}
                                                </ul>
                                            </td>
                                            <td className="px-2 py-4 text-center">
                                                <Link to={`/students/${student.id}/attendance`} className="flex justify-center items-center gap-1 text-blue-500 hover:underline">
                                                    <Calendar size={14}/><span>{totalAttendanceCount}</span>
                                                </Link>
                                            </td>
                                            <td className="px-2 py-4"><div className="flex justify-center"><Link to={`/students/${student.id}/registration-sheet`}><FileText size={16} className="text-blue-500"/></Link></div></td>
                                            <td className="px-2 py-4 text-center">
                                                <Link to={`/students/${student.id}/receipts`} className="flex justify-center items-center gap-1 text-blue-500 hover:underline">
                                                    <Receipt size={14}/><span>{receiptCount}</span>
                                                </Link>
                                            </td>
                                            <td className="px-2 py-4 text-center"><div className="flex justify-center items-center gap-1 text-red-500"><FileText size={14}/><span>{student.stats.invoices}</span></div></td>
                                            <td className="px-2 py-4 text-center"><div className="flex justify-center items-center gap-1 text-blue-500"><Mail size={14}/><span>{student.stats.emails}</span></div></td>
                                            <td className="px-2 py-4 text-center">
                                                <Link to={`/students/${student.id}/docs`} className={`flex justify-center items-center gap-1 hover:underline ${student.stats.docs > 0 ? 'text-blue-500' : 'text-red-500'}`}>
                                                    <FileInput size={14}/><span>{student.stats.docs}</span>
                                                </Link>
                                            </td>
                                            <td className="px-2 py-4 text-center">
                                                <Link to={`/students/${student.id}/authorizations`} className="flex justify-center items-center gap-1 text-blue-500 hover:underline">
                                                    <ShieldCheck size={14}/><span>{authCount}</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </StickyScrollWrapper>
                </div>
            </div>
        </div>
    );
};

export default StudentHistoryPage;
