import React from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { Plus, Copy, Trash2, Search, Clipboard } from 'lucide-react';

const QuotesPage = () => {
    const { quotes } = useData();
    const inputClasses = "p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2"><Clipboard /> Presupuestos</h1>
                <span className="font-semibold text-gray-500 dark:text-gray-400">{quotes.length} Resultados</span>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
                 <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" leftIcon={<Plus size={16}/>}>Alta</Button>
                    <Button variant="secondary" leftIcon={<Copy size={16}/>}>Duplicar</Button>
                    <Button variant="secondary" leftIcon={<Trash2 size={16}/>}>Borrar</Button>
                    <div className="flex-grow"></div>
                    <div className="relative w-64">
                        <input type="text" placeholder="Buscar" className={inputClasses + " w-full pl-4 pr-10"} />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    <select className={inputClasses}><option>Serie</option></select>
                    <input type="date" className={inputClasses} placeholder="Desde" />
                    <input type="date" className={inputClasses} placeholder="Hasta" />
                    <select className={inputClasses}><option>Aceptado</option></select>
                    <select className={inputClasses}><option>Enviado</option></select>
                    <select className={inputClasses}><option>Con factura</option></select>
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
                            <th className="px-6 py-3 font-medium">Líneas</th>
                            <th className="px-6 py-3 font-medium">Total presu.</th>
                            <th className="px-6 py-3 font-medium">Fichero</th>
                            <th className="px-6 py-3 font-medium">Enviar</th>
                            <th className="px-6 py-3 font-medium">¿Aceptado?</th>
                            <th className="px-6 py-3 font-medium">Factura</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quotes.length === 0 && (
                            <tr>
                                <td colSpan={10} className="text-center py-10 text-gray-500 dark:text-gray-400">0 Resultados</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QuotesPage;