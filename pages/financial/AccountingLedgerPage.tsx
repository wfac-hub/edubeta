import React from 'react';
import { useData } from '../../contexts/DataContext';
import { LedgerEntry } from '../../types';
import { ScrollText } from 'lucide-react';

const AccountingLedgerPage = () => {
    const { ledgerEntries } = useData();

    // Ordenar por fecha y luego ID para consistencia
    const sortedEntries = [...ledgerEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.id - a.id);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <ScrollText className="text-primary-600 dark:text-primary-400" /> Libro Diario
            </h1>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 font-medium">Fecha</th>
                                <th className="px-6 py-3 font-medium">Asiento</th>
                                <th className="px-6 py-3 font-medium">Cuenta</th>
                                <th className="px-6 py-3 font-medium">Concepto</th>
                                <th className="px-6 py-3 font-medium text-right">Debe</th>
                                <th className="px-6 py-3 font-medium text-right">Haber</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {sortedEntries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{new Date(entry.date).toLocaleDateString('es-ES')}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{entry.id}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-300">{entry.account}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200 max-w-xs truncate">{entry.concept}</td>
                                    <td className="px-6 py-4 text-right font-mono text-gray-700 dark:text-gray-300">{entry.debit > 0 ? `${entry.debit.toFixed(2)} €` : '-'}</td>
                                    <td className="px-6 py-4 text-right font-mono text-red-600 dark:text-red-400">{entry.credit > 0 ? `${entry.credit.toFixed(2)} €` : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AccountingLedgerPage;