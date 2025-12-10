

import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';
import Button from '../components/ui/Button';
import { MoveLeft, Trash2, UserPlus } from 'lucide-react';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { NewEnrollment } from '../types';
import { formatDate } from '../utils/helpers';

const CourseWaitingListPage = () => {
    const { courseId } = useParams();
    const { goBack } = useNavigationHistory();
    const { courses, students, waitingList, deleteWaitingListEntries, addEnrollments } = useData();
    
    const [selectedEntryIds, setSelectedEntryIds] = useState<number[]>([]);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isEnrollConfirmOpen, setIsEnrollConfirmOpen] = useState(false);

    const course = useMemo(() => courses.find(c => c.id === parseInt(courseId!)), [courses, courseId]);

    const courseWaitingList = useMemo(() => {
        if (!course) return [];
        return waitingList
            .filter(entry => entry.courseId === course.id)
            .map(entry => ({
                ...entry,
                student: students.find(s => s.id === entry.studentId)
            }))
            .filter(entry => !!entry.student);
    }, [course, waitingList, students]);

    if (!course) {
        return <div className="p-8 text-center">Curso no encontrado.</div>;
    }
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedEntryIds(e.target.checked ? courseWaitingList.map(e => e.id) : []);
    };

    const handleSelectOne = (id: number) => {
        // FIX: Se corrige el error usando la función de estado correcta `setSelectedEntryIds`.
        setSelectedEntryIds(prev => prev.includes(id) ? prev.filter(currentId => currentId !== id) : [...prev, id]);
    };

    const handleDeleteConfirm = () => {
        deleteWaitingListEntries(selectedEntryIds); 
        setSelectedEntryIds([]);
        setIsDeleteConfirmOpen(false);
    };
    
    const handleEnrollConfirm = () => {
        const entriesToEnroll = courseWaitingList.filter(e => selectedEntryIds.includes(e.id));
        const enrollmentsToAdd: NewEnrollment[] = entriesToEnroll.map(entry => ({
            studentId: entry.studentId,
            courseId: entry.courseId,
            enrollmentDate: new Date().toISOString().split('T')[0],
            isActive: true,
        }));
        
        addEnrollments(enrollmentsToAdd);
        deleteWaitingListEntries(selectedEntryIds);
        
        setSelectedEntryIds([]);
        setIsEnrollConfirmOpen(false);
    };
    
    const selectedStudentsNames = courseWaitingList
        .filter(e => selectedEntryIds.includes(e.id))
        .map(e => `${e.student?.lastName}, ${e.student?.firstName}`);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Lista de espera: {course.name}</h1>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16}/>} onClick={goBack}>Volver</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16}/>} disabled={selectedEntryIds.length === 0} onClick={() => setIsDeleteConfirmOpen(true)}>Borrar</Button>
                    <Button variant="primary" size="sm" leftIcon={<UserPlus size={16}/>} disabled={selectedEntryIds.length === 0} onClick={() => setIsEnrollConfirmOpen(true)}>Inscribir en este curso</Button>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                        <tr>
                            <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={courseWaitingList.length > 0 && selectedEntryIds.length === courseWaitingList.length} /></th>
                            <th scope="col" className="px-6 py-3">Alumno</th>
                            <th scope="col" className="px-6 py-3">Fecha alta</th>
                            <th scope="col" className="px-6 py-3">Datos de pago</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courseWaitingList.map(entry => (
                            <tr key={entry.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50">
                                <td className="p-4"><input type="checkbox" checked={selectedEntryIds.includes(entry.id)} onChange={() => handleSelectOne(entry.id)} /></td>
                                <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                    <Link to={`/students/${entry.student!.id}/edit`}>{entry.student!.lastName}, {entry.student!.firstName}</Link>
                                </td>
                                <td className="px-6 py-4">{formatDate(entry.registrationDate)}</td>
                                <td className="px-6 py-4">{entry.student!.paymentConfig.type} - {entry.student!.paymentConfig.periodicity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {courseWaitingList.length === 0 && <p className="text-center py-8 text-gray-500">No hay alumnos en la lista de espera para este curso.</p>}
            </div>
            
            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Confirmar Borrado"
                message={`¿Estás seguro de que quieres borrar a ${selectedEntryIds.length} alumno(s) de la lista de espera?`}
                confirmText="Borrar"
            />
            
            <ConfirmationModal
                isOpen={isEnrollConfirmOpen}
                onClose={() => setIsEnrollConfirmOpen(false)}
                onConfirm={handleEnrollConfirm}
                title="Confirmar Inscripción"
                message={
                    <div>
                        <p>¿Estás seguro de que quieres inscribir a los siguientes {selectedEntryIds.length} alumno(s) en este curso? Serán eliminados de la lista de espera.</p>
                        <ul className="list-disc list-inside my-2 bg-blue-50 dark:bg-blue-900/50 p-2 rounded max-h-40 overflow-y-auto">
                            {selectedStudentsNames.map(name => <li key={name}>{name}</li>)}
                        </ul>
                    </div>
                }
                confirmText="Inscribir"
            />
        </div>
    );
};

export default CourseWaitingListPage;