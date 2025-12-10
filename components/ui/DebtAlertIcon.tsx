
import React, { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types';
import { useNavigate } from 'react-router-dom';

interface DebtAlertIconProps {
    studentId?: number;
    courseId?: number;
    size?: number;
}

const DebtAlertIcon: React.FC<DebtAlertIconProps> = ({ studentId, courseId, size = 20 }) => {
    const { user } = useAuth();
    const { receipts } = useData();
    const navigate = useNavigate();

    const canView = user?.role === Role.ADMIN || user?.role === Role.COORDINATOR || user?.role === Role.FINANCIAL_MANAGER;

    const hasDebt = useMemo(() => {
        if (!canView) return false;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return receipts.some(r => {
            // Normalizar fecha del recibo a medianoche para comparar solo días
            const rDate = new Date(r.receiptDate);
            rDate.setHours(0, 0, 0, 0);

            // Es deuda si está Pendiente y la fecha es hoy o anterior
            const isPending = r.status === 'Pendiente' && rDate.getTime() <= today.getTime();
            
            if (!isPending) return false;

            if (studentId !== undefined) return r.studentId === studentId;
            if (courseId !== undefined) return r.courseId === courseId;
            
            return false;
        });
    }, [receipts, studentId, courseId, canView]);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        
        const todayStr = new Date().toISOString().split('T')[0];
        
        if (courseId) {
            navigate(`/receipts/all?courseId=${courseId}&status=Pendiente&dateTo=${todayStr}`);
        } else if (studentId) {
            navigate(`/students/${studentId}/receipts?status=Pendiente&dateTo=${todayStr}`);
        }
    };

    if (!hasDebt) return null;

    return (
        <button 
            onClick={handleClick}
            className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors z-20 relative p-1"
            title="Tiene recibos pendientes de cobro vencidos. Click para ver."
            type="button"
        >
            <AlertTriangle size={size} strokeWidth={2.5} fill="currentColor" className="text-amber-500 dark:text-amber-400 opacity-20 absolute" />
            <AlertTriangle size={size} strokeWidth={2.5} />
        </button>
    );
};

export default DebtAlertIcon;
