
import React, { useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Receipt, Student } from '../../types';
import { useData } from '../../contexts/DataContext';
import { formatDate } from '../../utils/helpers';

interface PendingReceiptsModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId?: number;
    courseId?: number;
}

const PendingReceiptsModal: React.FC<PendingReceiptsModalProps> = ({ isOpen, onClose, studentId, courseId }) => {
    const { receipts, students, courses } = useData();

    const pendingReceipts = useMemo(() => {
        // Normalize "today" to midnight to ensure strict date comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return receipts.filter(r => {
            // Normalize receipt date to midnight
            const rDate = new Date(r.receiptDate);
            rDate.setHours(0, 0, 0, 0);

            // Check if status is pending AND date is today or in the past
            const isPending = r.status === 'Pendiente' && rDate.getTime() <= today.getTime();
            
            if (!isPending) return false;

            if (studentId) {
                return r.studentId === studentId;
            }
            if (courseId) {
                return r.courseId === courseId;
            }
            return false;
        });
    }, [receipts, studentId, courseId]);

    // If showing for a course, group by student
    const groupedByStudent = useMemo(() => {
        if (studentId) return null;
        
        const groups: Record<number, Receipt[]> = {};
        pendingReceipts.forEach(r => {
            if (!groups[r.studentId]) groups[r.studentId] = [];
            groups[r.studentId].push(r);
        });
        return groups;
    }, [pendingReceipts, studentId]);

    const totalAmount = pendingReceipts.reduce((sum, r) => sum + r.amount, 0);

    const title = studentId 
        ? `Recibos pendientes: ${students.find(s => s.id === studentId)?.firstName || ''}`
        : `Recibos pendientes: ${courses.find(c => c.id === courseId)?.name || ''}`;

    const ReceiptList = ({ list }: { list: Receipt[] }) => (
        <ul className="space-y-2">
            {list.map(r => (
                <li key={r.id} className="flex justify-between items-center text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-800/50">
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{r.concept}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(r.receiptDate)}</span>
                    </div>
                    <span className="font-bold text-red-600 dark:text-red-400">{r.amount.toFixed(2)} €</span>
                </li>
            ))}
        </ul>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
                {pendingReceipts.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No hay recibos pendientes a fecha de hoy.</p>
                )}

                {/* Single Student View */}
                {studentId && pendingReceipts.length > 0 && (
                    <ReceiptList list={pendingReceipts} />
                )}

                {/* Course View (Grouped) */}
                {courseId && groupedByStudent && (
                    <div className="space-y-4">
                        {Object.entries(groupedByStudent).map(([sId, list]) => {
                            const receiptList = list as Receipt[];
                            const student = students.find(s => s.id === parseInt(sId));
                            const studentTotal = receiptList.reduce((sum, r) => sum + r.amount, 0);
                            return (
                                <div key={sId} className="border dark:border-slate-700 rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-2 border-b dark:border-slate-700 pb-2">
                                        <h4 className="font-bold text-gray-800 dark:text-white">{student?.lastName}, {student?.firstName}</h4>
                                        <span className="text-sm font-bold text-red-600">{studentTotal.toFixed(2)} €</span>
                                    </div>
                                    <ReceiptList list={receiptList} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                 <div className="text-sm">
                    Total pendiente: <span className="text-lg font-bold text-red-600 dark:text-red-400">{totalAmount.toFixed(2)} €</span>
                 </div>
                <Button variant="secondary" onClick={onClose}>Cerrar</Button>
            </div>
        </Modal>
    );
};

export default PendingReceiptsModal;
