
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import StickyScrollWrapper from '../../components/ui/StickyScrollWrapper';
import { Search, Mail, CheckCircle, XCircle, Filter } from 'lucide-react';
import { CommunicationLog } from '../../types';

const SentEmailsPage = () => {
    const { communicationLogs, users } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const filteredLogs = useMemo(() => {
        return communicationLogs.filter(log => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = 
                log.subject.toLowerCase().includes(searchLower) || 
                log.recipientName.toLowerCase().includes(searchLower) ||
                log.recipientEmail.toLowerCase().includes(searchLower);
            
            const matchesType = filterType === 'all' || log.type === filterType;
            
            return matchesSearch && matchesType;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [communicationLogs, searchTerm, filterType]);

    const getSenderName = (id: number) => {
        if (id === 0) return 'Sistema';
        const user = users.find(u => u.id === id);
        return user ? `${user.name} ${user.lastName}` : 'Usuario desconocido';
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Mail className="text-primary-600" /> Bandeja de Salida
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Historial de todos los correos enviados desde la plataforma.</p>
                </div>
                <div className="text-gray-500 text-sm font-medium">{filteredLogs.length} Envíos</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-wrap gap-4 justify-between items-center">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500"/>
                    <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        className="p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-sm"
                    >
                        <option value="all">Todos los tipos</option>
                        <option value="Manual">Manual</option>
                        <option value="Automático">Automático</option>
                    </select>
                </div>
                <div className="relative w-full md:w-64">
                    <input 
                        type="text" 
                        placeholder="Buscar por asunto, destinatario..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 pl-8 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-sm"
                    />
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <StickyScrollWrapper>
                    <table className="min-w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-700/50 border-b dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3 font-medium w-32">Estado</th>
                                <th className="px-6 py-3 font-medium w-40">Fecha</th>
                                <th className="px-6 py-3 font-medium">Asunto</th>
                                <th className="px-6 py-3 font-medium">Destinatario</th>
                                <th className="px-6 py-3 font-medium">Remitente</th>
                                <th className="px-6 py-3 font-medium w-24">Tipo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        {log.status === 'Sent' ? (
                                            <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                                <CheckCircle size={12}/> Enviado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                                                <XCircle size={12}/> Fallido
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {new Date(log.date).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white truncate max-w-xs" title={log.subject}>
                                        {log.subject}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-900 dark:text-gray-200">{log.recipientName}</div>
                                        <div className="text-xs text-gray-500">{log.recipientEmail}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        {getSenderName(log.senderId)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-2 py-0.5 rounded border ${log.type === 'Manual' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300' : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300'}`}>
                                            {log.type}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-500">No hay correos enviados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </StickyScrollWrapper>
            </div>
        </div>
    );
};

export default SentEmailsPage;
