import React from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { Plus, Trash2, Download, Search, Check, X, Mail, FileText, Clipboard, FileSignature, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const BillingClientsPage = () => {
    const { billingClients } = useData();
    const inputClasses = "p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Clientes</h1>
                <span className="font-semibold text-gray-500 dark:text-gray-400">{billingClients.length} Resultados</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Button leftIcon={<Plus size={16}/>}>Alta</Button>
                    <Button variant="secondary" leftIcon={<Trash2 size={16}/>}>Borrar</Button>
                    <Button variant="secondary" leftIcon={<Download size={16}/>}>Exportar a Excel</Button>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <select className={inputClasses}><option>¿Es segundo pagador?</option></select>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Fecha alta:</span>
                        <input type="date" className={inputClasses} placeholder="Desde" />
                        <span>-</span>
                        <input type="date" className={inputClasses} placeholder="Hasta" />
                    </div>
                    <div className="relative flex-grow">
                        <input type="text" placeholder="Buscar" className={inputClasses + " w-full pl-4 pr-10"} />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <table className="min-w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-primary-600 focus:ring-primary-500"/></th>
                            <th className="px-6 py-3 font-medium">Nombre empresa</th>
                            <th className="px-6 py-3 font-medium">Apellidos</th>
                            <th className="px-6 py-3 font-medium">Nombre</th>
                            <th className="px-6 py-3 font-medium">E-mail</th>
                            <th className="px-6 py-3 font-medium">NIF</th>
                            <th className="px-6 py-3 font-medium">Emails</th>
                            <th className="px-6 py-3 font-medium">Docs.</th>
                            <th className="px-6 py-3 font-medium">Fact.</th>
                            <th className="px-6 py-3 font-medium">Presu.</th>
                            <th className="px-6 py-3 font-medium">Firmar SEPA</th>
                            <th className="px-6 py-3 font-medium">Comunic.</th>
                            <th className="px-6 py-3 font-medium">¿Activo?</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {billingClients.map(client => (
                            <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-primary-600 focus:ring-primary-500"/></td>
                                <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{client.companyName}</td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{client.lastName}</td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{client.firstName}</td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{client.email}</td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{client.nif}</td>
                                <td className="px-6 py-4 text-center"><Link to="#" className="text-blue-600 dark:text-blue-400"><Mail size={16}/></Link></td>
                                <td className="px-6 py-4"><Link to="#" className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"><FileText size={14}/> {client.stats.docs}</Link></td>
                                <td className="px-6 py-4"><Link to="#" className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"><FileText size={14}/> {client.stats.invoices}</Link></td>
                                <td className="px-6 py-4"><Link to="#" className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"><Clipboard size={14}/> {client.stats.quotes}</Link></td>
                                <td className="px-6 py-4 text-center">{client.sepaSigned ? <Check className="text-green-500 mx-auto"/> : <Link to="#" className="text-blue-600 dark:text-blue-400"><FileSignature size={16}/></Link>}</td>
                                <td className="px-6 py-4 text-center">{client.commsAllowed ? <Check className="text-green-500 mx-auto"/> : <X className="text-red-500 mx-auto"/>}</td>
                                <td className="px-6 py-4 text-center">{client.isActive ? <Check className="text-green-500 mx-auto"/> : <X className="text-red-500 mx-auto"/>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BillingClientsPage;