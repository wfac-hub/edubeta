
import React, { useState, useMemo } from 'react';
import Button from '../components/ui/Button';
import { Course, Role, Student } from '../types';
import { useData } from '../contexts/DataContext';
import { Plus, Pencil, Copy, Trash2, BookUser, Search, Presentation, Calendar, Users, UserPlus, Monitor, Building as BuildingIcon, Check, BarChart2, Eye, Folder, MoreHorizontal, X } from 'lucide-react';
import Modal from '../components/ui/Modal';
import CourseForm from '../components/CourseForm';
import ScheduleSelectionModal from '../components/ScheduleSelectionModal';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import StudentTrackingModal from '../components/StudentTrackingModal';
import StickyScrollWrapper from '../components/ui/StickyScrollWrapper';
import DebtAlertIcon from '../components/ui/DebtAlertIcon';

const FilterSelect: React.FC<{ label: string; options: { value: string; label: string }[] }> = ({ label, options }) => (
    <div className="flex-1 min-w-[150px]">
        <select className="w-full p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500">
            <option value="">{label}</option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);


const CourseHistoryPage = () => {
    const { courses, teachers, classrooms, enrollments, updateCourse, deleteCourses, students } = useData();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [courseForSchedule, setCourseForSchedule] = useState<Course | null>(null);

    const [showDeletionModal, setShowDeletionModal] = useState<'info' | 'confirm' | ''>('');
    const [deletableCourses, setDeletableCourses] = useState<Course[]>([]);
    const [undeletableCoursesInfo, setUndeletableCoursesInfo] = useState<{ course: Course, students: Student[] }[]>([]);

    const [togglingCourse, setTogglingCourse] = useState<Course | null>(null);
    const [trackingCourse, setTrackingCourse] = useState<Course | null>(null);

    const handleToggleActive = (course: Course) => {
        setTogglingCourse(course);
    };

    const confirmToggleActive = () => {
        if (togglingCourse) {
            updateCourse({ ...togglingCourse, isActive: !togglingCourse.isActive });
            setTogglingCourse(null);
        }
    };

    const handleDeleteClick = () => {
        const coursesToAnalyze = courses.filter(c => selectedCourses.includes(c.id));
        const deletable: Course[] = [];
        const undeletable: { course: Course; students: Student[] }[] = [];

        coursesToAnalyze.forEach(course => {
            const activeEnrollments = enrollments.filter(e => e.courseId === course.id && e.isActive);
            if (activeEnrollments.length > 0) {
                const activeStudents = activeEnrollments
                    .map(e => students.find(s => s.id === e.studentId))
                    .filter((s): s is Student => s !== undefined);
                undeletable.push({ course, students: activeStudents });
            } else {
                deletable.push(course);
            }
        });

        if (undeletable.length > 0) {
            setUndeletableCoursesInfo(undeletable);
            setShowDeletionModal('info');
        } else if (deletable.length > 0) {
            setDeletableCourses(deletable);
            setShowDeletionModal('confirm');
        }
    };

    const confirmDeletion = () => {
        deleteCourses(deletableCourses.map(c => c.id));
        setShowDeletionModal('');
        setDeletableCourses([]);
        setSelectedCourses([]);
    };

    const closeModals = () => {
        setShowDeletionModal('');
        setDeletableCourses([]);
        setUndeletableCoursesInfo([]);
    };

    const handleOpenFormModal = (course: Course | null) => {
        setEditingCourse(course);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingCourse(null);
    };

    const handleSaveCourse = (courseToSave: Course) => {
        updateCourse(courseToSave);
        handleCloseFormModal();
    };

    const openScheduleModal = (course: Course) => {
        setCourseForSchedule(course);
        setIsScheduleModalOpen(true);
    };

    const handleSaveSchedules = (updatedScheduleIds: number[]) => {
        if (courseForSchedule) {
            updateCourse({ ...courseForSchedule, scheduleIds: updatedScheduleIds });
        }
        setIsScheduleModalOpen(false);
        setCourseForSchedule(null);
    };

    const getTeacherName = (teacherId: number) => teachers.find(t => t.id === teacherId)?.name || 'N/A';
    const getClassroom = (classroomId: number) => classrooms.find(c => c.id === classroomId);
    
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            // Allow showing active and inactive courses here for history
            // But user might want to search across all.
            
            const nameMatch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
            const teacherMatch = getTeacherName(course.teacherId).toLowerCase().includes(searchTerm.toLowerCase());
            
            return nameMatch || teacherMatch;
        });
    }, [searchTerm, courses, teachers]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedCourses(filteredCourses.map(c => c.id));
        } else {
            setSelectedCourses([]);
        }
    };

    const handleSelectOne = (id: number) => {
        if (selectedCourses.includes(id)) {
            setSelectedCourses(selectedCourses.filter(courseId => courseId !== id));
        } else {
            setSelectedCourses([...selectedCourses, id]);
        }
    };

    const handleModify = () => {
        if (selectedCourses.length === 1) {
            const courseToEdit = courses.find(c => c.id === selectedCourses[0]);
            if (courseToEdit) {
                handleOpenFormModal(courseToEdit);
            }
        }
    };

    const handleDuplicate = () => {
        if (selectedCourses.length === 1) {
            const courseToDuplicate = courses.find(c => c.id === selectedCourses[0]);
            if (courseToDuplicate) {
                const newCourse: Course = {
                    ...courseToDuplicate,
                    id: 0, // This signals creation in the data context
                    name: `Copia de ${courseToDuplicate.name}`,
                    status: 'Activo',
                    isActive: true,
                };
                handleOpenFormModal(newCourse);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Histórico Cursos</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Consulta el histórico completo de cursos (activos e inactivos).
                    </p>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Presentation size={24} />
                    <span className="font-semibold">{filteredCourses.length} Resultados</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />} onClick={() => handleOpenFormModal(null)}>Alta</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Pencil size={16} />} onClick={handleModify} disabled={selectedCourses.length !== 1}>Modificar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Copy size={16} />} onClick={handleDuplicate} disabled={selectedCourses.length !== 1}>Duplicar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />} onClick={handleDeleteClick} disabled={selectedCourses.length === 0}>Borrar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<BookUser size={16} />} onClick={() => navigate('/courses/all-enrollments')}>Todas las inscripciones</Button>
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
                <div className="flex flex-wrap items-center gap-2">
                    <FilterSelect label="Nivel" options={[{value: 'inicial', label: 'Inicial'}, {value: 'avanzado', label: 'Avanzado'}]} />
                    <FilterSelect label="Localización" options={[{value: 'alcaniz', label: 'Alcañiz'}, {value: 'andorra', label: 'Andorra'}]} />
                    <FilterSelect label="Aula" options={classrooms.map(c => ({ value: c.id.toString(), label: c.name }))} />
                    <FilterSelect label="Profesor/a" options={teachers.map(t => ({ value: t.id.toString(), label: `${t.name} ${t.lastName}` }))} />
                    <FilterSelect label="Recibos y facturación" options={[]} />
                    <div className="flex-1 min-w-[150px] flex items-center gap-1 text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Fecha inicio:</span>
                        <input type="date" placeholder="Desde" className="p-2 border rounded-md text-sm w-full bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                     <div className="flex-1 min-w-[150px] flex items-center gap-1 text-sm">
                        <input type="date" placeholder="Hasta" className="p-2 border rounded-md text-sm w-full bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <select className="w-full p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500">
                            <option value="">Inscripción on-line?</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <input type="checkbox" id="show-config" className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700" />
                        <label htmlFor="show-config">Muestra config. inscripciones</label>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {/* Mobile View */}
                <div className="lg:hidden divide-y divide-gray-200 dark:divide-slate-700">
                    <div className="p-4 flex items-center bg-gray-50 dark:bg-slate-700">
                        <input type="checkbox"
                            checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
                            onChange={handleSelectAll}
                            className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 mr-4"
                        />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Curso</span>
                    </div>
                    {filteredCourses.map((course) => {
                        const classroom = getClassroom(course.classroomId);
                        const activeEnrollments = enrollments.filter(e => e.courseId === course.id && e.isActive).length;
                        return (
                            <div key={course.id} className={`group ${!course.isActive ? 'bg-gray-100 dark:bg-slate-900 opacity-70' : ''}`}>
                                <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === course.id ? null : course.id)}>
                                    <div className="flex items-center gap-2 mt-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedCourses.includes(course.id)}
                                            onChange={() => handleSelectOne(course.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
                                        />
                                        <DebtAlertIcon courseId={course.id} />
                                    </div>
                                    <div className="flex-grow">
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenFormModal(course); }} className="font-medium text-blue-600 dark:text-blue-400 hover:underline text-left">
                                            {course.name}
                                        </button>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {getTeacherName(course.teacherId)}
                                        </div>
                                    </div>
                                    <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === course.id ? 'rotate-90' : ''}`} />
                                </div>
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === course.id ? 'max-h-[500px]' : ''}`}>
                                    <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-2 border-t dark:border-slate-700">
                                        <div className="flex justify-between">
                                            <span className="font-semibold">Alumnos:</span>
                                            <span className="flex items-center gap-3">
                                                <Link to={`/courses/${course.id}/students`} className="flex items-center gap-1 text-blue-500 hover:underline" title="Alumnos inscritos">
                                                    <Users size={16} />
                                                    <span className="font-semibold">{activeEnrollments}</span>
                                                </Link>
                                                 <Link to={`/courses/${course.id}/waiting-list`} className="flex items-center gap-1 text-red-500 hover:underline" title="Alumnos en espera">
                                                    <UserPlus size={16} />
                                                    <span className="font-semibold">{course.standbyStudents || 0}</span>
                                                </Link>
                                            </span>
                                        </div>
                                        <div className="flex justify-between"><span className="font-semibold">Profesor/a:</span> <span>{getTeacherName(course.teacherId)}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">Modalidad:</span> <span>{course.modality}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">Aula:</span> <span>{classroom?.name} ({classroom?.location})</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">Horarios:</span> <span>{course.scheduleIds.length}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">Clases:</span> <Link to={`/courses/${course.id}/classes`} className="text-blue-500 hover:underline">{course.classesCount}</Link></div>
                                        <div className="flex justify-between"><span className="font-semibold">Fecha Inicio:</span> <span>{new Date(course.startDate).toLocaleDateString()}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">Fecha Fin:</span> <span>{new Date(course.endDate).toLocaleDateString()}</span></div>
                                        <div className="flex justify-between items-center"><span className="font-semibold">Activo:</span>
                                            <button onClick={(e) => { e.stopPropagation(); handleToggleActive(course); }}>
                                                {course.isActive ? <Check size={20} className="text-green-500" /> : <X size={20} className="text-red-500" />}
                                            </button>
                                        </div>
                                        <div className="flex justify-between"><span className="font-semibold">Seguimiento:</span> <button onClick={(e) => { e.stopPropagation(); setTrackingCourse(course);}} className="text-blue-500 flex items-center gap-1"><BarChart2 size={16} /><Eye size={16} /></button></div>
                                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-slate-600">
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenFormModal(course)}><Pencil size={14} /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => openScheduleModal(course)}><Monitor size={14} /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => navigate(`/courses/${course.id}/resources`)}><Folder size={14} /></Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block">
                    <StickyScrollWrapper>
                        <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                                <tr>
                                    <th scope="col" className="p-4">
                                        <input type="checkbox"
                                            checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
                                            onChange={handleSelectAll}
                                            className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
                                        />
                                    </th>
                                    <th scope="col" className="px-2 py-3 w-8"></th> {/* Debt Icon Column */}
                                    <th scope="col" className="px-6 py-3">Curso</th>
                                    <th scope="col" className="px-6 py-3">Alumnos</th>
                                    <th scope="col" className="px-6 py-3">Profesor/a</th>
                                    <th scope="col" className="px-6 py-3">Modalidad</th>
                                    <th scope="col" className="px-6 py-3">Aula</th>
                                    <th scope="col" className="px-6 py-3">Horarios</th>
                                    <th scope="col" className="px-6 py-3">Clases</th>
                                    <th scope="col" className="px-6 py-3">Recur.</th>
                                    <th scope="col" className="px-6 py-3">Fecha inicio curso</th>
                                    <th scope="col" className="px-6 py-3">Fecha fin curso</th>
                                    <th scope="col" className="px-6 py-3">¿Activo?</th>
                                    <th scope="col" className="px-6 py-3 whitespace-nowrap">Seguimiento</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCourses.map((course) => {
                                    const classroom = getClassroom(course.classroomId);
                                    const activeEnrollments = enrollments.filter(e => e.courseId === course.id && e.isActive).length;
                                    const inactiveEnrollments = enrollments.filter(e => e.courseId === course.id && !e.isActive).length;
                                    const availableSeats = course.maxCapacity - activeEnrollments;

                                    let seatColorClass = 'bg-green-500';
                                    if (availableSeats <= 0) seatColorClass = 'bg-red-500';
                                    else if (availableSeats <= 2) seatColorClass = 'bg-yellow-500';

                                    return (
                                        <tr key={course.id} className={`border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50 ${!course.isActive ? 'bg-gray-100 dark:bg-slate-900 opacity-60' : 'bg-white dark:bg-slate-800'}`}>
                                            <td className="w-4 p-4">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCourses.includes(course.id)}
                                                        onChange={() => handleSelectOne(course.id)}
                                                        className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
                                                    />
                                                    <button onClick={() => handleOpenFormModal(course)} className="text-gray-400 hover:text-primary-600"><Pencil size={14} /></button>
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 text-center">
                                                <DebtAlertIcon courseId={course.id} />
                                            </td>
                                            <th scope="row" className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                                <button onClick={() => handleOpenFormModal(course)} className="hover:underline text-left">
                                                    {course.name}
                                                </button>
                                            </th>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Link to={`/courses/${course.id}/students`} className="flex items-center gap-1 text-blue-500 hover:underline" title="Alumnos inscritos">
                                                        <Users size={16} />
                                                        <span className="font-semibold">{activeEnrollments}{inactiveEnrollments > 0 ? `/${inactiveEnrollments}` : ''}</span>
                                                    </Link>
                                                    <span className="relative group" title="Plazas disponibles">
                                                        <div className={`w-3 h-3 rounded-full ${seatColorClass}`}></div>
                                                        <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                            {availableSeats > 0 ? `${availableSeats} plazas disponibles` : 'Completo'}
                                                        </div>
                                                    </span>
                                                    <Link to={`/courses/${course.id}/waiting-list`} className="flex items-center gap-1 text-red-500 hover:underline" title="Alumnos en espera">
                                                        <UserPlus size={16} />
                                                        <span className="font-semibold">{course.standbyStudents || 0}</span>
                                                    </Link>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><span className="font-semibold text-gray-700 dark:text-gray-200">• {getTeacherName(course.teacherId)}</span></td>
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
                                            <td className="px-6 py-4">
                                                <Button variant="ghost" size="sm" onClick={() => openScheduleModal(course)}>
                                                    <div className="flex items-center gap-1"><Monitor size={16} /><span>{course.scheduleIds.length}</span></div>
                                                </Button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link to={`/courses/${course.id}/classes`} className="flex items-center gap-1 text-blue-500 hover:underline">
                                                    <BuildingIcon size={16} />
                                                    <span>{course.classesCount}</span>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link to={`/courses/${course.id}/resources`} className="flex items-center gap-1 text-blue-500 hover:underline">
                                                    <Folder size={16} />
                                                    <span>{course.resourcesCount}</span>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">{new Date(course.startDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">{new Date(course.endDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => handleToggleActive(course)}>
                                                    {course.isActive ? <Check size={20} className="text-green-500" /> : <X size={20} className="text-red-500" />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4"><button onClick={() => setTrackingCourse(course)} className="text-blue-500 flex items-center gap-1 hover:text-blue-700 dark:hover:text-blue-300"><BarChart2 size={16} /><Eye size={16} /></button></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </StickyScrollWrapper>
                </div>
            </div>

            <Modal
                isOpen={isFormModalOpen}
                onClose={handleCloseFormModal}
                title={editingCourse ? `Editar Curso: ${editingCourse.name}` : 'Alta de Nuevo Curso'}
            >
                <CourseForm
                    course={editingCourse}
                    onSave={handleSaveCourse}
                    onClose={handleCloseFormModal}
                />
            </Modal>

            {isScheduleModalOpen && courseForSchedule && (
                <ScheduleSelectionModal
                    isOpen={isScheduleModalOpen}
                    onClose={() => setIsScheduleModalOpen(false)}
                    course={courseForSchedule}
                    onSave={handleSaveSchedules}
                />
            )}

            <Modal
                isOpen={showDeletionModal === 'info'}
                onClose={closeModals}
                title="Cursos con Alumnos Activos"
            >
                <p className="text-gray-700 dark:text-gray-300">Los siguientes cursos no se pueden borrar porque tienen alumnos activos inscritos:</p>
                <ul className="list-disc pl-5 mt-4 space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {undeletableCoursesInfo.map(({ course, students: courseStudents }) => (
                        <li key={course.id}>
                            <strong className="text-gray-800 dark:text-gray-100">{course.name}</strong>
                            <ul className="list-circle pl-5 text-sm text-gray-600 dark:text-gray-400">
                                {courseStudents.map(s => <li key={s.id}>{s.firstName} {s.lastName}</li>)}
                            </ul>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-end mt-6">
                    <Button onClick={closeModals}>Entendido</Button>
                </div>
            </Modal>

            <ConfirmationModal
                isOpen={showDeletionModal === 'confirm'}
                onClose={closeModals}
                onConfirm={confirmDeletion}
                title="Confirmar Borrado de Cursos"
                message={
                    <div>
                        <p>¿Estás seguro de que quieres borrar los siguientes {deletableCourses.length} cursos? Esta acción no se puede deshacer.</p>
                        <ul className="list-disc pl-5 mt-2 text-sm max-h-60 overflow-y-auto custom-scrollbar pr-2">
                            {deletableCourses.map(c => <li key={c.id}>{c.name}</li>)}
                        </ul>
                    </div>
                }
                confirmText={`Borrar ${deletableCourses.length} Curso(s)`}
            />

            <ConfirmationModal
                isOpen={!!togglingCourse}
                onClose={() => setTogglingCourse(null)}
                onConfirm={confirmToggleActive}
                title="Confirmar cambio de estado"
                message={`¿Estás seguro de que quieres ${togglingCourse?.isActive ? 'desactivar' : 'activar'} el curso "${togglingCourse?.name}"?`}
            />

            {trackingCourse && (
                <StudentTrackingModal
                    course={trackingCourse}
                    onClose={() => setTrackingCourse(null)}
                />
            )}
        </div>
    );
};

export default CourseHistoryPage;
