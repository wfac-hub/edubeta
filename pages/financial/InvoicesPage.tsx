
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { FilePlus, Download, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Invoice } from '../../types';

const InvoicesPage = () => {
    const { invoices, deleteInvoices } = useData();
    const [activeTab, setActiveTab] = useState<'issued' | 'received'>('issued');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInvoices = useMemo(() => {
        return invoices
            .filter(inv => inv.type === activeTab)
            .filter(inv => inv.concept.toLowerCase().includes(searchTerm.toLowerCase()) || inv.series.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [invoices, activeTab, searchTerm]);

    const columns: Column<Invoice>[] = [
        { header: 'Número', accessor: (inv) => `${inv.series}-${inv.number}` },
        { header: 'Fecha', accessor: (inv) => new Date(inv.date).toLocaleDateString() },
        { header: 'Concepto', accessor: 'concept' },
        { header: 'Base', accessor: (inv) => `${inv.baseAmount.toFixed(2)} €` },
        { header: 'IVA', accessor: (inv) => `${inv.vatAmount.toFixed(2)} € (${inv.vatRate}%)` },
        { header: 'Total', accessor: (inv) => <span className="font-bold">{inv.totalAmount.toFixed(2)} €</span> },
        { header: 'Estado', accessor: (inv) => (
            <span className={`px-2 py-1 rounded text-xs ${inv.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {inv.status === 'Paid' ? 'Cobrada/Pagada' : 'Pendiente'}
            </span>
        )}
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Facturas</h1>
                <div className="flex gap-2">
                    <Button variant="secondary" leftIcon={<Download size={16} />}>Exportar</Button>
                    <Button leftIcon={<FilePlus size={16} />}>Nueva Factura</Button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <button 
                        onClick={() => setActiveTab('issued')}
                        className={`flex items-center gap-2 pb-2 px-4 border-b-2 transition-colors ${activeTab === 'issued' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        <ArrowUpRight size={18} /> Emitidas (Ingresos)
                    </button>
                    <button 
                        onClick={() => setActiveTab('received')}
                        className={`flex items-center gap-2 pb-2 px-4 border-b-2 transition-colors ${activeTab === 'received' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        <ArrowDownLeft size={18} /> Recibidas (Gastos)
                    </button>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <input 
                        type="text" 
                        placeholder="Buscar factura..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 border rounded bg-gray-50 dark:bg-slate-900 dark:border-gray-600 w-64"
                    />
                    <div className="text-sm text-gray-500">
                        Total: <span className="font-bold text-gray-900 dark:text-white">
                            {filteredInvoices.reduce((sum, i) => sum + i.totalAmount, 0).toFixed(2)} €
                        </span>
                    </div>
                </div>

                <Table columns={columns} data={filteredInvoices} />
            </div>
        </div>
    );
};

export default InvoicesPage;
