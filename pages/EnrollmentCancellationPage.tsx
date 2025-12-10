import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';
import Button from '../components/ui/Button';
import { Receipt } from '../types';
import Card from '../components/ui/Card';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const EnrollmentCancellationPage = () => {
    const { enrollmentId } = useParams();
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const { enrollments, students, courses, cancelEnrollment, receipts } = useData();

    const [cancellationTime, setCancellationTime] = useState<'now' | 'schedule'>('now');
    const [cancellationDate, setCancellationDate] = useState(new Date().toISOString().split('T')[0]);
    const [deleteFutureReceipts, setDeleteFutureReceipts] = useState(true);
    
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [receiptsToDelete, setReceiptsToDelete] = useState<Receipt[]>([]);

    const enrollment = useMemo(() => enrollments.find(e => e.id === parseInt(enrollmentId || '0')), [enrollments, enrollmentId]);
    const student = useMemo(() => enrollment ? students.find(s => s.id === enrollment.studentId) : null, [students, enrollment]);
    const course = useMemo(() => enrollment ? courses.find(c => c.id === enrollment.courseId) : null, [courses, enrollment]);

    const handleNext = () => {
        if (!enrollment) return;

        if (deleteFutureReceipts) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const futureReceipts = receipts.filter(r => {
                const isForThisEnrollment = r.studentId === enrollment.studentId && r.courseId === enrollment.courseId;
                if (!isForThisEnrollment) return false;
                
                const receiptDate = new Date(r.receiptDate);
                const isFutureUnpaid = r.status === 'Pendiente' && receiptDate >= today;
                return isFutureUnpaid;
            });
            
            setReceiptsToDelete(futureReceipts);
        } else {
            setReceiptsToDelete([]);
        }
        setIsConfirmModalOpen(true);
    };

    const handleConfirmCancellation = () => {
        if (enrollment) {
            const finalCancellationDate = cancellationTime === 'now' ? new Date().toISOString().split('T')[0] : cancellationDate;
            cancelEnrollment(
                enrollment.id,
                finalCancellationDate,
                deleteFutureReceipts
            );
            setIsConfirmModalOpen(false);
            
            // This ensures that hitting "back" from the next page doesn't bring the user back here.
            goBack(); 
            navigate(`/courses/${enrollment.courseId}/students`, { replace: true });
        }
    };


    if (!enrollment || !student || !course) {
        return <div className="p-8 text-center">Cargando...</div>;
    }

    const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();
    const avatarColor = '#8b5cf6';

    const renderReceiptList = () => {
        if (receiptsToDelete.length > 0) {
            return (
                <>
                    <p>¿Estás seguro de que quieres dar de baja al alumno? Se borrarán los siguientes {receiptsToDelete.length} recibos futuros:</p>
                    <ul className="list-disc list-inside my-2 bg-red-50 dark:bg-red-900/50 p-2 rounded max-h-48 overflow-y-auto custom-scrollbar">
                        {receiptsToDelete.map(r => (
                            <li key={r.id}>
                                {r.concept} - {new Date(r.receiptDate).toLocaleDateString()} ({r.amount.toFixed(2)}€)
                            </li>
                        ))}
                    </ul>
                </>
            );
        }
        return `¿Estás seguro de que quieres dar de baja al alumno del curso?`;
    };

    return (
        <div>
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg">
                <div className="p-4 flex items-center border-b dark:border-slate-700">
                    <div className="w-12 h-12 rounded-full text-white flex items-center justify-center text-xl font-bold" style={{backgroundColor: avatarColor}}>
                        {initials}
                    </div>
                    <div className="ml-4">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{student.lastName}, {student.firstName}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Curso: {course.name} ({enrollment.isActive ? 'Activo' : 'Inactivo'})</p>
                    </div>
                </div>
                <div className="flex">
                    <button className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Configurar
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 border-b-2 border-primary-600">
                        Baja de curso ✔
                    </button>
                </div>
            </div>

            <div className="mt-6">
                 <Card>
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-8 text-gray-800 dark:text-white">Dar de baja a un alumno de un curso</h2>
                        <div className="space-y-8 max-w-lg">
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">¿Cuándo dar de baja?*</h4>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center">
                                        <input type="radio" name="cancellationTime" value="now" checked={cancellationTime === 'now'} onChange={() => setCancellationTime('now')} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"/>
                                        <span className="ml-2">Ahora</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="radio" name="cancellationTime" value="schedule" checked={cancellationTime === 'schedule'} onChange={() => setCancellationTime('schedule')} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"/>
                                        <span className="ml-2">Programar baja</span>
                                    </label>
                                </div>
                                {cancellationTime === 'schedule' && (
                                    <div className="mt-4">
                                        <input 
                                            type="date" 
                                            value={cancellationDate} 
                                            onChange={(e) => setCancellationDate(e.target.value)} 
                                            className="p-2 border rounded-md bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-1">
                                    ¿Borrar los recibos futuros no cobrados? 
                                    <span className="text-blue-500 cursor-pointer" title="Se borrarán todos los recibos PENDIENTES de este curso para este alumno, cuya fecha sea igual o posterior a hoy.">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-question-circle-fill" viewBox="0 0 16 16">
                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-1.057 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247zm2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z"/>
                                        </svg>
                                    </span>
                                </h4>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center">
                                        <input type="radio" name="deleteReceipts" value="yes" checked={deleteFutureReceipts} onChange={() => setDeleteFutureReceipts(true)} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"/>
                                        <span className="ml-2">Sí</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="radio" name="deleteReceipts" value="no" checked={!deleteFutureReceipts} onChange={() => setDeleteFutureReceipts(false)} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"/>
                                        <span className="ml-2">No</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-slate-900/50 flex justify-end gap-4 rounded-b-lg">
                        <Button variant="danger" onClick={goBack}>Cancelar</Button>
                        <Button onClick={handleNext}>Siguiente &gt;</Button>
                    </div>
                </Card>
            </div>
            
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmCancellation}
                title="Confirmar Baja de Alumno"
                message={renderReceiptList()}
                confirmText="Confirmar Baja"
            />
        </div>
    );
};

export default EnrollmentCancellationPage;
