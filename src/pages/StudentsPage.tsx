
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import {
    Plus, Trash2, Download, Mail, Search,
    Edit, BookOpen, Calendar, Receipt, FileInput, ShieldCheck,
    User, MoreHorizontal, CreditCard, ArrowRightCircle,
    Landmark, Repeat, HandCoins, Smartphone, Gift, HelpCircle, CalendarDays,
    CalendarClock, CircleDollarSign, Hand, Ban, Tag, Settings2, EyeOff, ChevronDown, ChevronUp,
    FileText
} from 'lucide-react';
import { Student, Role } from '../types';
import StickyScrollWrapper from '../components/ui/StickyScrollWrapper';
import { getRandomColor, calculateAge, isSameDayMonth, checkBirthdayVisibility } from '../utils/helpers';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { PAYMENT_TYPES, PAYMENT_PERIODICITIES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import BirthdayIcon from '../components/ui/BirthdayIcon';
import DebtAlertIcon from '../components/ui/DebtAlertIcon';

// Icon helpers
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
   return <div title={type} className="flex items-center justify-center">{icon}</div>;
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
   return <div title={periodicity} className="flex items-center justify-center">{icon}</div>;
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

const StudentsPage = () => {
    const { students, deleteStudents, attendanceRecords, courseClasses, courses, enrollments, courseLevels, studentTags, receipts, studentAuthorizations, reports, academyProfile } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    
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

    const getStudentEnrolledCourses = (studentId: number) => {
         const enrolledCourseIds = enrollments
            .filter(e => e.studentId === studentId && e.isActive)
            .map(e => e.courseId);
         return courses.filter(c => enrolledCourseIds.includes(c.id));
    };

    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            if (!student.isActive) return false;

            // Role Based Filtering
            if (user?.role === Role.TEACHER) {
                const teacherCourseIds = courses
                    .filter(c => c.teacherId === user.id || c.secondaryTeacherId === user.id)
                    .map(c => c.id);
                
                const studentEnrolledIds = enrollments
                    .filter(e => e.studentId === student.id && e.isActive)
                    .map(e => e.courseId);
                
                const hasCommonCourse = studentEnrolledIds.some(id => teacherCourseIds.includes(id));
                if (!hasCommonCourse) return false;
            }
            
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
    }, [students, searchTerm, courses, enrollments, filters, selectedTags, selectedAuths, selectedAdvanced, receipts, user]);


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

    const handleDelete = () => {
        deleteStudents(selectedStudents);
        setSelectedStudents([]);
        setIsDeleteConfirmOpen(false);
    }
    
     const handleExportToCSV = () => {
        const headers = ["ID", "Apellidos", "Nombre", "Edad", "Tipo de pago", "Periodicidad", "Cursos Activos"];
        const rows = filteredStudents.map(s => [
            s.id,
            s.lastName,
            s.firstName,
            calculateAge(s.birthDate),
            s.paymentConfig.type,
            s.paymentConfig.periodicity,
            getStudentEnrolledCourses(s.id).map(c => c.name).join('; ')
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "alumnos_en_curso.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSendWhatsApp = () => {
        if (selectedStudents.length === 1) {
            const student = students.find(s => s.id === selectedStudents[0]);
            if (student && student.phone1) {
                const message = encodeURIComponent(`Hola ${student.firstName}, te contactamos desde el centro.`);
                window.open(`https://wa.me/${student.phone1}?text=${message}`, '_blank');
            } else {
                alert('El alumno seleccionado no tiene un número de teléfono válido.');
            }
        }
    };
    
    const handleSendWhatsAppForStudent = (student: Student) => {
        if (student.phone1) {
             const message = encodeURIComponent(`Hola ${student.firstName}, te contactamos desde el centro.`);
             window.open(`https://wa.me/${student.phone1}?text=${message}`, '_blank');
        }
    }

    const isTeacher = user?.role === Role.TEACHER;
    const canSeeBirthdays = checkBirthdayVisibility(user?.role, academyProfile);

    return (
        <div className="space-y-6">
            {/* Header and Actions */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Alumnos en curso</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestión de alumnos activos.</p>
                </div>
                 <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <User size={24} />
                    <span className="font-semibold">{filteredStudents.length} Resultados</span>
                </div>
            </div>
            
            {/* Component body continues... this is just to recover the file */}
             <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    {!isTeacher && (
                        <>
                            <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />} onClick={() => navigate('/students/new/edit')}>Alta</Button>
                            <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />} disabled={selectedStudents.length === 0} onClick={() => setIsDeleteConfirmOpen(true)}>Borrar</Button>
                            <Button variant="secondary" size="sm" leftIcon={<Download size={16} />} onClick={handleExportToCSV}>Exportar a Excel</Button>
                        </>
                    )}
                    <Button variant="secondary" size="sm" leftIcon={<Mail size={16} />}>Enviar E-mail</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Settings2 size={16} />} onClick={handleSendWhatsApp} disabled={selectedStudents.length !== 1}>Enviar WhatsApp</Button>
                </div>
                
                <div className="flex flex-wrap items-end gap-4 pb-4 border-b border-gray-100 dark:border-slate-700">
                    <select name="level" value={filters.level} onChange={handleFilterChange} className="p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500 min-w-[120px]"><option value="">Nivel</option>{courseLevels.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}</select>
                    <select name="location" value={filters.location} onChange={handleFilterChange} className="p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500 min-w-[120px]"><option value="">Localización</option>{[...new Set(students.map(s => s.population))].map(p => <option key={p} value={p}>{p}</option>)}</select>
                    
                    {!isTeacher && (
                        <>
                            <select name="paymentType" value={filters.paymentType} onChange={handleFilterChange} className="p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500 min-w-[120px]"><option value="">Tipo pago</option>{PAYMENT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}</select>
                            <select name="periodicity" value={filters.periodicity} onChange={handleFilterChange} className="p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500 min-w-[120px]"><option value="">Periodicidad</option>{PAYMENT_PERIODICITIES.map(p => <option key={p} value={p}>{p}</option>)}</select>
                        </>
                    )}
                    
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
                
                {/* More filters components... */}
                 <div className="flex flex-wrap items-center gap-6 text-sm text-blue-600 dark:text-blue-400 font-semibold mt-4">
                    <button onClick={() => toggleFilterSection('tags')} className={`flex items-center gap-1 hover:text-blue-800 dark:hover:text-blue-300 ${expandedFilterSection === 'tags' ? 'underline' : ''}`}><Tag size={16}/>Filtrar por etiquetas</button>
                    <button onClick={() => toggleFilterSection('auths')} className={`flex items-center gap-1 hover:text-blue-800 dark:hover:text-blue-300 ${expandedFilterSection === 'auths' ? 'underline' : ''}`}><ShieldCheck size={16}/>Filtra por autorizaciones</button>
                    {!isTeacher && <button onClick={() => toggleFilterSection('advanced')} className={`flex items-center gap-1 hover:text-blue-800 dark:hover:text-blue-300 ${expandedFilterSection === 'advanced' ? 'underline' : ''}`}><Settings2 size={16}/>Filtros avanzados</button>}
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
                        const totalAttendanceCount = attendanceRecords.filter(ar => {
                             const classInfo = courseClasses.find(c => c.id === ar.classId);
                             // Filter pending classes (future or not done)
                             return ar.studentId === student.id && ar.attended && classInfo?.status !== 'Pendiente';
                        }).length;

                        const receiptCount = receipts.filter(r => r.studentId === student.id).length;
                        const authCount = studentAuthorizations.filter(sa => sa.studentId === student.id).length;
                        const reportsCount = reports.filter(r => r.studentId === student.id).length;

                        return (
                            <div key={student.id} className={`group ${!student.isActive ? 'opacity-70 bg-gray-50 dark:bg-slate-900' : ''}`}>
                                <div 
                                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors" 
                                    onClick={() => setExpandedRow(prev => prev === student.id ? null : student.id)}
                                >
                                    {/* Checkbox & Debt - No Propagation */}
                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedStudents.includes(student.id)} 
                                            onChange={() => handleSelectOne(student.id)} 
                                            className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
                                        />
                                        <DebtAlertIcon studentId={student.id} />
                                    </div>
                                    
                                    {/* Avatar */}
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

                                    {/* Main Info */}
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Link to={`/students/${student.id}/edit`} onClick={e => e.stopPropagation()} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                                 {student.firstName} {student.lastName}
                                            </Link>
                                            {!isTeacher && (
                                                <Link to={`/students/${student.id}/edit`} onClick={e => e.stopPropagation()} className="text-gray-400 hover:text-primary-600">
                                                    <Edit size={16}/>
                                                </Link>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {studentCourses.length > 0 ? studentCourses.map(c => c.name).join(', ') : 'Sin cursos activos'}
                                        </div>
                                    </div>

                                    {/* Chevron */}
                                    {expandedRow === student.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                </div>

                                {/* Expanded Details */}
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden bg-gray-50 dark:bg-slate-700/50 ${expandedRow === student.id ? 'max-h-[500px] opacity-100 border-t dark:border-slate-600' : 'max-h-0 opacity-0'}`}>
                                    <div className="px-4 pb-4 pt-2 text-sm space-y-2">
                                        <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2 mb-2">
                                            <span className="font-semibold text-gray-500">Edad:</span> 
                                            <span>{calculateAge(student.birthDate)} años</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-gray-500">Teléfono:</span> 
                                            <a href={`tel:${student.phone1}`} className="text-blue-600 dark:text-blue-400">{student.phone1}</a>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-gray-500">Email:</span> 
                                            <a href={`mailto:${student.email1}`} className="text-blue-600 dark:text-blue-400 truncate max-w-[200px]">{student.email1}</a>
                                        </div>
                                        
                                        {!isTeacher && (
                                            <>
                                                <div className="grid grid-cols-2 gap-4 pt-2">
                                                    <div>
                                                        <span className="block text-xs font-semibold text-gray-500 uppercase">Pago</span>
                                                        <span className="text-gray-800 dark:text-gray-200">{student.paymentConfig.type}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs font-semibold text-gray-500 uppercase">Periodo</span>
                                                        <span className="text-gray-800 dark:text-gray-200">{student.paymentConfig.periodicity}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-4 gap-2 pt-3 text-center">
                                                    <Link to={`/students/${student.id}/attendance`} className="p-2 bg-white dark:bg-slate-800 rounded border dark:border-slate-600 flex flex-col items-center gap-1 hover:border-blue-500">
                                                        <Calendar size={16} className="text-blue-500"/>
                                                        <span className="text-xs font-bold">{totalAttendanceCount}</span>
                                                    </Link>
                                                    <Link to={`/students/${student.id}/receipts`} className="p-2 bg-white dark:bg-slate-800 rounded border dark:border-slate-600 flex flex-col items-center gap-1 hover:border-blue-500">
                                                        <Receipt size={16} className="text-blue-500"/>
                                                        <span className="text-xs font-bold">{receiptCount}</span>
                                                    </Link>
                                                     <Link to={`/grade-reports/reports?studentId=${student.id}`} className="p-2 bg-white dark:bg-slate-800 rounded border dark:border-slate-600 flex flex-col items-center gap-1 hover:border-blue-500">
                                                        <FileInput size={16} className="text-blue-500"/>
                                                        <span className="text-xs font-bold">{reportsCount}</span>
                                                    </Link>
                                                    <Link to={`/students/${student.id}/authorizations`} className="p-2 bg-white dark:bg-slate-800 rounded border dark:border-slate-600 flex flex-col items-center gap-1 hover:border-blue-500">
                                                        <ShieldCheck size={16} className="text-blue-500"/>
                                                        <span className="text-xs font-bold">{authCount}</span>
                                                    </Link>
                                                </div>
                                            </>
                                        )}

                                        {isTeacher && (
                                            <div className="flex justify-end pt-3">
                                                <button onClick={() => handleSendWhatsAppForStudent(student)} className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
                                                    <Settings2 size={16}/> Contactar por WhatsApp
                                                </button>
                                            </div>
                                        )}
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
                                    {isTeacher ? (
                                        <>
                                            <th scope="col" className="px-2 py-3">Cursos Activos</th>
                                            <th scope="col" className="px-2 py-3">Teléfono 1</th>
                                            <th scope="col" className="px-2 py-3">Teléfono 2</th>
                                            <th scope="col" className="px-2 py-3">Email 1</th>
                                            <th scope="col" className="px-2 py-3 text-center">Acciones</th>
                                        </>
                                    ) : (
                                        <>
                                            {/* Standard Admin/Coordinator Columns */}
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
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => {
                                    const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();
                                    const avatarColor = getRandomColor(initials);
                                    const studentCourses = getStudentEnrolledCourses(student.id);
                                    const studentCourseIds = new Set(studentCourses.map(c => c.id));

                                    // Calculate total attendance count strictly up to today, excluding pending classes
                                    const totalAttendanceCount = attendanceRecords.filter(ar => {
                                        if (ar.studentId !== student.id || !ar.attended) return false;
                                        const classInfo = courseClasses.find(c => c.id === ar.classId);
                                        // ONLY count 'Hecha' (or at least not 'Pendiente')
                                        return classInfo?.status !== 'Pendiente';
                                    }).length;
                                    
                                    const receiptCount = receipts.filter(r => r.studentId === student.id).length;
                                    const authCount = studentAuthorizations.filter(sa => sa.studentId === student.id).length;
                                    // Calculate reports count for this student
                                    const reportsCount = reports.filter(r => r.studentId === student.id).length;
                                    
                                    const isBirthday = canSeeBirthdays && isSameDayMonth(student.birthDate);

                                    return (
                                        <tr key={student.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50">
                                            <td className="w-4 p-4 px-2">
                                                <div className="flex items-center gap-2">
                                                    <input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => handleSelectOne(student.id)} className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"/>
                                                    {!isTeacher && <Link to={`/students/${student.id}/edit`} className="text-gray-400 hover:text-primary-600"><Edit size={14}/></Link>}
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
                                                    
                                                    {isTeacher ? (
                                                        <span className="cursor-default text-gray-800 dark:text-gray-200">{student.firstName} {student.lastName}</span>
                                                    ) : (
                                                        <Link to={`/students/${student.id}/edit`} className="hover:underline">
                                                            <span>{student.firstName} {student.lastName}</span>
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                            {/* ... rest of columns ... */}
                                            <td className="px-2 py-4 text-center">{calculateAge(student.birthDate)}</td>

                                            {isTeacher ? (
                                                <>
                                                    <td className="px-2 py-4">
                                                        <ul className="space-y-1 max-w-xs truncate text-xs">
                                                            {studentCourses.map(c => (
                                                                <li key={c.id}>• {c.name}</li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                    <td className="px-2 py-4 text-xs">{student.phone1}</td>
                                                    <td className="px-2 py-4 text-xs">{student.phone2 || '--'}</td>
                                                    <td className="px-2 py-4 text-xs truncate max-w-[150px]" title={student.email1}>{student.email1}</td>
                                                    <td className="px-2 py-4 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <button onClick={() => handleSendWhatsAppForStudent(student)} title="Whatsapp" className="text-green-500 hover:text-green-600"><Settings2 size={18}/></button>
                                                            <a href={`mailto:${student.email1}`} title="Email" className="text-blue-500 hover:text-blue-600"><Mail size={18}/></a>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
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
                                                    <td className="px-2 py-4 text-center">
                                                         <Link to={`/grade-reports/reports?studentId=${student.id}`} className="flex justify-center items-center gap-1 text-blue-500 hover:underline">
                                                            <FileText size={14}/><span>{reportsCount}</span>
                                                        </Link>
                                                    </td>
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
                                                </>
                                            )}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                      </StickyScrollWrapper>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Confirmar Borrado"
                message={`¿Estás seguro de que quieres borrar ${selectedStudents.length} alumno(s)? Esta acción no se puede deshacer.`}
                confirmText="Borrar"
            />
        </div>
    );
};

export default StudentsPage;
