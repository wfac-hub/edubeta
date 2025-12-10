
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { ActivityLog, Role } from '../types';
import Button from '../components/ui/Button';
import { Search, Download, ShieldAlert, Activity, Clock, User } from 'lucide-react';
import StickyScrollWrapper from '../components/ui/StickyScrollWrapper';

const AdminLogsPage = () => {
    const { users, activityLogs } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    
    const [filters, setFilters] = useState({
        userId: '',
        role: '',
        dateFrom: '',
        dateTo: '',
    });

    // Agregar y aplanar los logs de todos los usuarios y los logs globales
    const enrichedLogs = useMemo(() => {
        let allLogs: (ActivityLog & { user?: any })[] = [];
        
        // 1. Incorporar logs desde el array global activityLogs (si existen y tienen userId implícito o explícito)
        if (activityLogs && activityLogs.length > 0) {
             allLogs = activityLogs.map(log => {
                 const userOwner = users.find(u => u.activityLogs?.some(l => l.id === log.id));
                 // If no user found via activityLogs relation, we might need logic to infer from action context, but for now we use what we have.
                 // Many actions log to the user object directly in DataContext, so we prioritize finding the user who owns the log.
                 return { ...log, user: userOwner };
             });
        } else {
            // Fallback: Iterar usuarios si el log global está vacío (legacy compatibility)
            users.forEach(u => {
                if (u.activityLogs && Array.isArray(u.activityLogs)) {
                    u.activityLogs.forEach(log => {
                        // Evitar duplicados si ya los procesamos
                        if (!allLogs.some(al => al.id === log.id)) {
                            allLogs.push({ ...log, user: u });
                        }
                    });
                }
            });
        }
        
        // Ordenar por fecha descendente
        return allLogs.sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
        });
    }, [users, activityLogs]);

    const filteredLogs = useMemo(() => {
        return enrichedLogs.filter(log => {
            const actionStr = (log.action ? String(log.action) : '').toLowerCase();
            const detailsStr = (log.details ? String(log.details) : '').toLowerCase();
            const userNameStr = log.user ? `${log.user.name || ''} ${log.user.lastName || ''}`.toLowerCase() : '';
            const searchLower = searchTerm.toLowerCase();

            const searchMatch = 
                actionStr.includes(searchLower) ||
                detailsStr.includes(searchLower) ||
                userNameStr.includes(searchLower);

            const userMatch = filters.userId ? log.user?.id === parseInt(filters.userId) : true;
            const roleMatch = filters.role ? log.user?.role === filters.role : true;
            
            if (!log.date) return false;
            const logDate = new Date(log.date);
            const dateFromMatch = filters.dateFrom ? logDate >= new Date(filters.dateFrom) : true;
            const dateToMatch = filters.dateTo ? logDate <= new Date(filters.dateTo + 'T23:59:59') : true;

            return searchMatch && userMatch && roleMatch && dateFromMatch && dateToMatch;
        });
    }, [enrichedLogs, searchTerm, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleExport = () => {
        const headers = ["Fecha", "Hora", "Usuario", "Rol", "Acción", "Detalles", "IP"];
        const rows = filteredLogs.map(log => {
            const dateObj = log.date ? new Date(log.date) : new Date();
            const detailsStr = log.details ? String(log.details) : '';
            const ipMatch = detailsStr.match(/IP: (\d+\.\d+\.\d+\.\d+)/);
            const ip = ipMatch ? ipMatch[1] : '-';
            const cleanDetails = detailsStr.replace(/"/g, '""').replace(/IP: \d+\.\d+\.\d+\.\d+/, '').trim();
            const userName = log.user ? `${log.user.name || ''} ${log.user.lastName || ''}`.trim() : 'Sistema';
            
            return [
                dateObj.toLocaleDateString(),
                dateObj.toLocaleTimeString(),
                `"${userName}"`,
                log.user?.role || 'System',
                `"${log.action || ''}"`,
                `"${cleanDetails}"`,
                ip
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `logs_sistema_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getActionColor = (action: string) => {
        const lower = action.toLowerCase();
        if (lower.includes('borrar') || lower.includes('eliminar') || lower.includes('cancelar')) return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
        if (lower.includes('crear') || lower.includes('alta') || lower.includes('inscribir')) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
        if (lower.includes('actualizar') || lower.includes('editar') || lower.includes('modificar')) return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
        if (lower.includes('inicio de sesión')) return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
        return 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    };

    const inputClasses = "p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500";

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <ShieldAlert className="text-primary-600" /> Logs del Sistema
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Auditoría completa de acciones. Rastrea cambios en inscripciones, clases y datos sensibles.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700">
                    <Activity size={16} />
                    <span className="font-semibold">{filteredLogs.length} Registros</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
                <div className="flex flex-wrap items-center gap-4 justify-between">
                     <div className="relative w-full md:w-96">
                        <input 
                            type="text" 
                            placeholder="Buscar en detalles, usuario o acción..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className={inputClasses + " w-full pl-10"}
                        />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <Button variant="secondary" leftIcon={<Download size={16}/>} onClick={handleExport}>Exportar CSV</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <select name="userId" value={filters.userId} onChange={handleFilterChange} className={inputClasses}>
                        <option value="">Todos los usuarios</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name} {u.lastName}</option>)}
                    </select>
                    <select name="role" value={filters.role} onChange={handleFilterChange} className={inputClasses}>
                        <option value="">Todos los roles</option>
                        {Object.values(Role).map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                    <div className="flex items-center gap-2 col-span-2">
                        <div className="flex items-center gap-2 w-full bg-gray-50 dark:bg-slate-900 p-1 rounded border border-gray-200 dark:border-slate-700">
                            <span className="text-xs text-gray-500 pl-2">Fecha:</span>
                            <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="bg-transparent border-none text-sm w-full focus:ring-0 text-gray-700 dark:text-gray-300" />
                            <span className="text-gray-400">-</span>
                            <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="bg-transparent border-none text-sm w-full focus:ring-0 text-gray-700 dark:text-gray-300" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <StickyScrollWrapper>
                    <table className="min-w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-slate-700/50 border-b dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3 font-medium w-48">Fecha / Hora</th>
                                <th className="px-6 py-3 font-medium w-64">Usuario</th>
                                <th className="px-6 py-3 font-medium w-48">Acción</th>
                                <th className="px-6 py-3 font-medium">Detalles del cambio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredLogs.map((log) => {
                                const actionStr = String(log.action || '');
                                const detailsStr = String(log.details || '');
                                const logDate = log.date ? new Date(log.date) : new Date();

                                return (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap align-top">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                <Clock size={14} className="text-gray-400"/>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{logDate.toLocaleDateString()}</p>
                                                    <p className="text-xs text-gray-500">{logDate.toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            {log.user ? (
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xs shrink-0">
                                                        {log.user.name ? log.user.name[0].toUpperCase() : <User size={14}/>}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white text-sm">{log.user.name} {log.user.lastName}</p>
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400 border border-gray-200 dark:border-slate-600 mt-1">
                                                            {log.user.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic flex items-center gap-1"><User size={14}/> Sistema / Eliminado</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getActionColor(actionStr)}`}>
                                                {actionStr}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words max-w-3xl leading-relaxed">
                                                {detailsStr || <span className="text-gray-400 italic">Sin detalles adicionales</span>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        No se encontraron registros que coincidan con los filtros.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </StickyScrollWrapper>
            </div>
        </div>
    );
};

export default AdminLogsPage;
