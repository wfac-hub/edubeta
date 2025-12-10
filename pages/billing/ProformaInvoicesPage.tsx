

import React from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { Plus, Download, Search, FileText, Link as LinkIcon } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { Link } from 'react-router-dom';

const ProformaInvoicesPage = () => {
    const { proformaInvoices, billingClients, students } = useData();
    const inputClasses = "p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500";

    const getReceptorName = (clientId: number) => {
        const client = billingClients.find(c => c.id === clientId) || students.find(s => s.id === clientId);
        if (!client) return 'N/A';
        if ('companyName' in client && client.companyName) return client.companyName;
        if ('firstName' in client) return `${client.firstName} ${client.lastName}`;
        return 'Desconocido';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2"><FileText /> Facturas provisionales</h1>
                <span className="font-semibold text-gray-500 dark:text-gray-400">{proformaInvoices.length} Resultados</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Button leftIcon={<Plus size={16}/>}>Nueva factura</Button>
                    <Button variant="secondary">Guardar definitiva</Button>
                    <Button variant="secondary" leftIcon={<Download size={16}/>}>Exportar</Button>
                    <Button variant="secondary">Acciones</Button>
                    <Button variant="secondary">Enviar</Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    <select className={inputClasses}><option>Serie</option></select>
                    <select className={inputClasses}><option>Periodo de fechas</option></select>
                    <select className={inputClasses}><option>Forma pago</option></select>
                    <select className={inputClasses}><option>Fecha vencim.</option></select>
                    <select className={inputClasses}><option>Localización</option></select>
                    <div className="relative col-span-2 lg:col-span-1">
                        <input type="text" placeholder="Buscar" className={inputClasses + " w-full pl-4 pr-10"} />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

             <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <table className="min-w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-slate-700/50">
                         <tr>
                            <th className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-primary-600 focus:ring-primary-500" /></th>
                            <th className="px-6 py-3 font-medium">Número</th>
                            <th className="px-6 py-3 font-medium">Fecha</th>
                            <th className="px-6 py-3 font-medium">Receptor</th>
                            <th className="px-6 py-3 font-medium text-center">Líneas</th>
                            <th className="px-6 py-3 font-medium">Total factura</th>
                            <th className="px-6 py-3 font-medium text-center">Tipo</th>
                            <th className="px-6 py-3 font-medium text-center">Fichero</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {proformaInvoices.map(proforma => (
                            <tr key={proforma.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-primary-600 focus:ring-primary-500" /></td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{proforma.number}</td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{formatDate(proforma.date)}</td>
                                <td className="px-6 py-4">
                                    <span className="font-medium text-blue-600 dark:text-blue-400">{proforma.client?.firstName ? `${proforma.client.firstName} ${proforma.client.lastName}` : proforma.client?.companyName}</span>
                                </td>
                                <td className="px-6 py-4 text-center">{proforma.lineCount}</td>
                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{proforma.total.toFixed(2)} €</td>
                                <td className="px-6 py-4 text-center">
                                    {proforma.linkedReceiptIds ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                            <LinkIcon size={12} /> Rectificativa Prov.
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                            Borrador
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Link to="#" className="text-gray-400 hover:text-blue-500">
                                        <FileText size={18} className="mx-auto"/>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {proformaInvoices.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center py-10 text-gray-500 dark:text-gray-400">No hay facturas provisionales.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProformaInvoicesPage;
