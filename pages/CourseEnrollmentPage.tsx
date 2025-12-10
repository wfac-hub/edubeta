
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';
import { Student, NewEnrollment } from '../types';
import Button from '../components/ui/Button';
import { X, ArrowRight, Check } from 'lucide-react';

const getRandomColor = (char: string) => {
    let hash = 0;
    if (!char) return 'bg-gray-500';
    for (let i = 0; i < char.length; i++) {
        hash = char.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316'];
    const index = Math.abs(hash % colors.length);
    return colors[index];
};

const Avatar: React.FC<{ student: Student }> = ({ student }) => {
    const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();
    const color = getRandomColor(initials);
    
    return (
        <div 
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-xs"
            style={{ backgroundColor: color }}
        >
            {initials}
        </div>
    );
};

const CourseEnrollmentPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const { courses, students, enrollments, courseLevels, addEnrollments } = useData();
    
    const [step, setStep] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

    const course = useMemo(() => courses.find(c => c.id === parseInt(courseId!)), [courses, courseId]);
    const courseLevel = useMemo(() => courseLevels.find(cl => cl.name === course?.level), [courseLevels, course]);
    
    const alreadyEnrolledStudents = useMemo(() => {
        if (!course) return [];
        const enrolledIds = new Set(enrollments.filter(e => e.courseId === course.id).map(e => e.studentId));
        return students.filter(s => enrolledIds.has(s.id));
    }, [enrollments, students, course]);

    const availableStudents = useMemo(() => {
        const enrolledIds = new Set(alreadyEnrolledStudents.map(s => s.id));
        const filtered = students.filter(s => !enrolledIds.has(s.id));

        if (!searchTerm) {
            return []; // Don't show anyone until a search is made
        }
        
        return filtered.filter(s => 
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [students, alreadyEnrolledStudents, searchTerm]);
    
    const selectedStudents = useMemo(() => {
        return students.filter(s => selectedStudentIds.includes(s.id));
    }, [students, selectedStudentIds]);

    const handleSelectStudent = (studentId: number) => {
        if (!selectedStudentIds.includes(studentId)) {
            setSelectedStudentIds(prev => [...prev, studentId]);
        }
    };
    
    const handleDeselectStudent = (studentId: number) => {
        setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
    };

    const handleEnroll = () => {
        if (!course) return;

        const enrollmentsToAdd: NewEnrollment[] = selectedStudentIds.map(studentId => ({
            studentId: studentId,
            courseId: course.id,
            enrollmentDate: new Date().toISOString().split('T')[0],
            isActive: true,
        }));
        
        addEnrollments(enrollmentsToAdd);
        navigate(`/courses/${course.id}/students`);
    };

    if (!course) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Cargando datos del curso...</p>
            </div>
        );
    }
    
    const availableSpots = course.maxCapacity - alreadyEnrolledStudents.length;

    return (
        <div className="bg-gray-100 dark:bg-slate-900 -m-4 md:-m-6 2xl:-m-10 p-4 md:p-6 2xl:p-10 min-h-screen">
            <div className="max-w-6xl mx-auto bg-white dark:bg-slate-800 shadow-lg rounded-lg">
                <div className="p-6 border-b dark:border-slate-700">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Alta de alumnos en el curso</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Inscribe a uno o más de un alumno al curso seleccionado.</p>
                </div>

                <div className="p-6">
                    <div className="flex items-center mb-6">
                        <div className={`flex items-center ${step === 1 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold ${step === 1 ? 'border-primary-600 dark:border-primary-400' : 'border-gray-300 dark:border-slate-600'}`}>1</div>
                            <span className="ml-2">Selección de alumnos</span>
                        </div>
                        <div className={`flex-grow border-t-2 mx-4 ${step > 1 ? 'border-primary-600 dark:border-primary-400' : 'border-gray-300 dark:border-slate-600'}`}></div>
                        <div className={`flex items-center ${step === 2 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold ${step === 2 ? 'border-primary-600 dark:border-primary-400' : 'border-gray-300 dark:border-slate-600'}`}><Check size={16}/></div>
                            <span className="ml-2">Inscripción</span>
                        </div>
                    </div>
                
                    <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-md border border-blue-200 dark:border-blue-800 mb-6 text-sm">
                        <p className="font-bold text-blue-800 dark:text-blue-300">Curso: {course.name}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-blue-700 dark:text-blue-400">
                            <span><strong>Tarifas:</strong> Cuota mensual: {courseLevel?.monthlyPrice.toFixed(2)} €</span>
                            <span className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${availableSpots > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <strong>Plazas disponibles:</strong> {availableSpots}
                            </span>
                        </div>
                    </div>
                
                    {step === 1 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Selecciona a los alumnos del centro a dar de alta en el curso</h3>
                                <div className="p-4 border rounded-md bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-700">
                                    <label htmlFor="student-search" className="font-medium text-sm text-gray-700 dark:text-gray-300">Filtrar por nombre:</label>
                                    <div className="relative mt-1">
                                        <input
                                            id="student-search"
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"><X size={16} /></button>}
                                    </div>
                                    <div className="mt-4 text-sm bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-3 rounded-md">
                                        <p>Busca a los alumnos que quieras inscribir al curso utilizando el filtro. Puedes encontrarlos por su nombre o apellidos.</p>
                                    </div>
                                    <div className="mt-4 max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {availableStudents.map(s => (
                                            <div key={s.id} onClick={() => handleSelectStudent(s.id)} className="p-2 border border-gray-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3">
                                                <Avatar student={s} />
                                                <span className="text-gray-800 dark:text-slate-200">{s.lastName}, {s.firstName}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-700 rounded-md">
                                    <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Alumnos seleccionados</h3>
                                    <div className="min-h-[6rem] max-h-40 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                                        {selectedStudents.length > 0 ? selectedStudents.map(s => (
                                            <div key={s.id} className="p-2 border border-gray-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 flex items-center justify-between">
                                                <span className="text-gray-800 dark:text-slate-200">{s.lastName}, {s.firstName}</span>
                                                <button onClick={() => handleDeselectStudent(s.id)}><X size={14} className="text-red-500" /></button>
                                            </div>
                                        )) : <p className="text-sm text-gray-500 dark:text-gray-400 text-center pt-4">Busca a alumnos usando el filtro. En el siguiente paso quedaran inscritos al curso.</p>}
                                    </div>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md">
                                    <h3 className="font-semibold mb-2 text-green-800 dark:text-green-200">Alumnos ya inscritos</h3>
                                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {alreadyEnrolledStudents.map(s => (
                                            <div key={s.id} className="p-2 rounded-md bg-green-100 dark:bg-green-800/50 text-green-900 dark:text-green-100 flex items-center gap-3">
                                                <Avatar student={s} />
                                                <span>{s.lastName}, {s.firstName}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Finalizar inscripción</h3>
                            <p className="mb-2 text-gray-700 dark:text-gray-300">Se va a inscribir a los siguientes {selectedStudentIds.length} alumnos:</p>
                            <ul className="list-disc list-inside bg-gray-100 dark:bg-slate-700 p-4 rounded-md mb-4 text-gray-800 dark:text-slate-200">
                                {selectedStudents.map(s => <li key={s.id}>{s.lastName}, {s.firstName}</li>)}
                            </ul>
                            <p className="text-sm text-green-700 dark:text-green-400">Se crearán los recibos correspondientes en el apartado de recibos.</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-between items-center p-4 bg-gray-100 dark:bg-slate-900/50 border-t dark:border-slate-700 rounded-b-lg">
                    <Button type="button" onClick={goBack} variant="danger">Cancelar</Button>
                    {step === 1 ? (
                        <Button onClick={() => setStep(2)} disabled={selectedStudentIds.length === 0} rightIcon={<ArrowRight size={16}/>}>
                            Inscribir alumnos
                        </Button>
                    ) : (
                         <Button onClick={handleEnroll}>
                            Confirmar Inscripción
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseEnrollmentPage;
