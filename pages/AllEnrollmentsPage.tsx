import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import { Download, Search, Check, Cog, Receipt, Presentation, MoreHorizontal } from 'lucide-react';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';
import { Classroom, Teacher } from '../types';

export function AllEnrollmentsPage() {
    const { 
        enrollments, 
        studentMap, 
        courseMap, 
        teacherMap, 
        classroomMap, 
        locations, 
        courseLevels 
    } = useData();
    const { goBack } = useNavigationHistory();

    const [selectedEnrollments, setSelectedEnrollments] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [filters, setFilters] = useState({
        level: '',
        location: '',
        classroom: '',
        teacher: '',
        courseActive: '',
        enrollmentActive: '',
        enrollmentDateFrom: '',
        enrollmentDateTo: '',
        cancellationDateFrom: '',
        cancellationDateTo: '',
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const enrichedEnrollments = useMemo(() => {
        return enrollments.map(enrl => {
            const student = studentMap[enrl.studentId];
            const course = courseMap[enrl.courseId];
            if (!student || !course) return null;

            const teacher = teacherMap[course.teacherId];
            const classroom = classroomMap[course.classroomId];

            return {
                ...enrl,
                studentName: `${student.firstName} ${student.lastName}`,
                studentRegistrationDate: student.registrationDate,
                courseName: course.name,
                levelName: course.level,
                teacherId: teacher?.id,
                classroomId: classroom?.id,
                locationName: classroom?.location,
                receipts: student.stats.receipts,
                courseIsActive: course.isActive,
            };
        }).filter(Boolean);
    }, [enrollments, studentMap, courseMap, teacherMap, classroomMap]);

    const filteredEnrollments = useMemo(() => {
        return enrichedEnrollments.filter(e => {
            if (!e) return false;
            const searchMatch = e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || e.courseName.toLowerCase().includes(searchTerm.toLowerCase());
            
            const levelMatch = filters.level ? e.levelName === filters.level : true;
            const locationMatch = filters.location ? e.locationName === filters.location : true;
            const classroomMatch = filters.classroom ? e.classroomId === parseInt(filters.classroom) : true;
            const teacherMatch = filters.teacher ? e.teacherId === parseInt(filters.teacher) : true;
            const courseActiveMatch = filters.courseActive ? String(e.courseIsActive) === filters.courseActive : true;
            const enrollmentActiveMatch = filters.enrollmentActive ? String(e.isActive) === filters.enrollmentActive : true;

            const enrollmentDate = new Date(e.enrollmentDate);
            const cancellationDate = e.cancellationDate ? new Date(e.cancellationDate) : null;

            const enrollmentDateFromMatch = filters.enrollmentDateFrom ? enrollmentDate >= new Date(filters.enrollmentDateFrom) : true;
            const enrollmentDateToMatch = filters.enrollmentDateTo ? enrollmentDate <= new Date(filters.enrollmentDateTo) : true;
            const cancellationDateFromMatch = filters.cancellationDateFrom ? cancellationDate && cancellationDate >= new Date(filters.cancellationDateFrom) : true;
            const cancellationDateToMatch = filters.cancellationDateTo ? cancellationDate && cancellationDate <= new Date(filters.cancellationDateTo) : true;
            
            return searchMatch && levelMatch && locationMatch && classroomMatch && teacherMatch && courseActiveMatch && enrollmentActiveMatch && enrollmentDateFromMatch && enrollmentDateToMatch && cancellationDateFromMatch && cancellationDateToMatch;
        });
    }, [searchTerm, filters, enrichedEnrollments]);
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedEnrollments(e.target.checked ? filteredEnrollments.map(e => e!.id) : []);
    };

    const handleSelectOne = (id: number) => {
        setSelectedEnrollments(prev => prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '--';
        return new Date(dateString).toLocaleDateString('es-ES');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Todas las inscripciones</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Lista de todas las inscripciones de los alumnos activos.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Presentation size={24} />
                    <span className="font-semibold">{filteredEnrollments.length} Resultados</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={goBack}>Volver</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Download size={16} />}>Exportar a Excel</Button>
                </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    <select name="level" value={filters.level} onChange={handleFilterChange} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"><option value="">Nivel</option>{[...new Set(courseLevels.map(l=>l.name))].map(name => <option key={name} value={name}>{name}</option>)}</select>
                    <select name="location" value={filters.location} onChange={handleFilterChange} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"><option value="">Localización</option>{locations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}</select>
                    <select name="classroom" value={filters.classroom} onChange={handleFilterChange} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"><option value="">Aula</option>{Object.values(classroomMap).map((c: Classroom) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                    <select name="teacher" value={filters.teacher} onChange={handleFilterChange} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"><option value="">Profesor/a</option>{Object.values(teacherMap).map((t: Teacher) => <option key={t.id} value={t.id}>{t.name} {t.lastName}</option>)}</select>
                    <select name="courseActive" value={filters.courseActive} onChange={handleFilterChange} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"><option value="">Curso activo</option><option value="true">Sí</option><option value="false">No</option></select>
                    <select name="enrollmentActive" value={filters.enrollmentActive} onChange={handleFilterChange} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"><option value="">¿Inscripción activa?</option><option value="true">Sí</option><option value="false">No</option></select>
                    
                    <div className="col-span-2 lg:col-span-3 flex items-center gap-2">
                        <label className="text-sm shrink-0">Fecha alta:</label>
                        <input type="date" name="enrollmentDateFrom" value={filters.enrollmentDateFrom} onChange={handleFilterChange} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"/>
                        <input type="date" name="enrollmentDateTo" value={filters.enrollmentDateTo} onChange={handleFilterChange} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"/>
                    </div>
                     <div className="col-span-2 lg:col-span-3 flex items-center gap-2">
                        <label className="text-sm shrink-0">Fecha baja:</label>
                        <input type="date" name="cancellationDateFrom" value={filters.cancellationDateFrom} onChange={handleFilterChange} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"/>
                        <input type="date" name="cancellationDateTo" value={filters.cancellationDateTo} onChange={handleFilterChange} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"/>
                    </div>
                     <div className="col-span-full relative">
                         <input
                            type="text"
                            placeholder="Buscar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-4 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                        />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {/* Mobile View (up to LG) */}
                <div className="lg:hidden divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredEnrollments.map(e => (
                         <div key={e!.id} className="group">
                             <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === e!.id ? null : e!.id)}>
                                <input type="checkbox" checked={selectedEnrollments.includes(e!.id)} onChange={() => handleSelectOne(e!.id)} onClick={evt => evt.stopPropagation()} className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500 mt-1"/>
                                <div className="flex-grow">
                                    <p className="font-medium text-blue-600 dark:text-blue-400">{e!.studentName}</p>
                                    <p className="text-sm text-gray-500">{e!.courseName}</p>
                                </div>
                                <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === e!.id ? 'rotate-90' : ''}`} />
                            </div>
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === e!.id ? 'max-h-[500px]' : ''}`}>
                                <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-2">
                                     <div className="flex justify-between"><span className="font-semibold">Alta alumno:</span> <span>{formatDate(e!.studentRegistrationDate)}</span></div>
                                     <div className="flex justify-between"><span className="font-semibold">Alta curso:</span> <span>{formatDate(e!.enrollmentDate)}</span></div>
                                     <div className="flex justify-between items-center"><span className="font-semibold">Recibos:</span> <div className="flex items-center gap-4"><button className="text-blue-500"><Cog size={16}/></button><div className="flex items-center gap-1 text-blue-500"><Receipt size={16}/><span>{e!.receipts}</span></div></div></div>
                                     <div className="flex justify-between"><span className="font-semibold">¿Inscripción activa?:</span> <span>{e!.isActive && <Check size={20} className="text-green-500" />}</span></div>
                                     <div className="flex justify-between"><span className="font-semibold">Baja curso:</span> <span>{formatDate(e!.cancellationDate)}</span></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Desktop View (from LG) */}
                <div className="hidden lg:block">
                    <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                            <tr>
                                <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={filteredEnrollments.length > 0 && selectedEnrollments.length === filteredEnrollments.length} className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500"/></th>
                                <th scope="col" className="px-6 py-3">Nombre alumno</th>
                                <th scope="col" className="px-6 py-3">Curso</th>
                                <th scope="col" className="px-6 py-3">Alta alumno</th>
                                <th scope="col" className="px-6 py-3">Alta curso</th>
                                <th scope="col" className="px-6 py-3">Recibos</th>
                                <th scope="col" className="px-6 py-3">¿Inscripción activa?</th>
                                <th scope="col" className="px-6 py-3">Baja curso</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>
        </div>
    );
}
