
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { Plus, Download, ChevronDown, Search, Edit, Send, FileText, User, Receipt, CheckCircle, Mail, ArrowUpRight, ArrowDownLeft, X as XIcon } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Invoice, BillingClient, Student } from '../../types';
import { formatDate } from '../../utils/helpers';

const InvoicesListPage = () => {
    const { invoices, billingClients, students, updateInvoice } = useData();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const typeParam = searchParams.get('type') as 'issued' | 'received' | null;
    const seriesParam = searchParams.get('series');

    const [activeTab, setActiveTab] = useState<'issued' | 'received'>(typeParam || 'issued');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (typeParam && typeParam !== activeTab) {
            setActiveTab(typeParam);
        }
    }, [typeParam, activeTab]);

    const getReceptorName = (inv: Invoice, receptor?: Student | BillingClient) => {
        if (!receptor) {
            // Special fallback for invoices linked to receipts - likely a student by ID
            if (inv.linkedReceiptIds && inv.linkedReceiptIds.length > 0) {
                 const student = students.find(s => s.id === inv.clientId);
                 if (student) return `${student.firstName} ${student.lastName}`;
            }
            return 'N/A';
        }
        
        // Use `isCompany` to correctly identify company clients
        if ('isCompany' in receptor && receptor.isCompany) {
            return receptor.companyName || 'Cliente sin nombre';
        }
        // Handle Students and individual clients
        return `${receptor.firstName} ${receptor.lastName || ''}`.trim();
    };

    const enrichedInvoices = useMemo(() => {
        return invoices.map(inv => {
            let receptor: BillingClient | Student | undefined;
            
            // Prioritize Student lookup if it's linked to a receipt or known student context
            if (inv.linkedReceiptIds && inv.linkedReceiptIds.length > 0) {
                receptor = students.find(s => s.id === inv.clientId);
            } else {
                 // Try billing clients first, then students (fallback)
                 receptor = billingClients.find(c => c.id === inv.clientId);
                 if (!receptor) {
                    receptor = students.find(s => s.id === inv.clientId);
                 }
            }

            return { ...inv, receptor };
        });
    }, [invoices, billingClients, students]);

    const filteredInvoices = useMemo(() => {
        return enrichedInvoices.filter(inv => {
            if (inv.type !== activeTab) return false;
            
            // Filter by series if param exists
            if (seriesParam && inv.series !== seriesParam) return false;

            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = 
                inv.invoiceCode?.toLowerCase().includes(searchLower) || 
                inv.concept.toLowerCase().includes(searchLower) ||
                (getReceptorName(inv, inv.receptor).toLowerCase().includes(searchLower));

            return matchesSearch;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [enrichedInvoices, activeTab, seriesParam, searchTerm]);

    const summary = useMemo(() => {
        const total = filteredInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
        const paid = filteredInvoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + inv.totalAmount, 0);
        return { total, paid, pending: total - paid };
    }, [filteredInvoices]);
    
    const pageTitle = activeTab === 'issued' ? 'Facturas Emitidas' : 'Facturas Recibidas';
    const pageIcon = activeTab === 'issued' ? <ArrowUpRight /> : <ArrowDownLeft />;

    const handleTabClick = (tab: 'issued' | 'received') => {
        // Preserve other params if needed, or clear them
        // If changing type, probably makes sense to clear series filter unless verified
        const newParams = new URLSearchParams(searchParams);
        newParams.set('type', tab);
        if (seriesParam) newParams.delete('series'); // Clear series filter on tab change to avoid empty results confusion
        navigate(`/financial/billing/invoices?${newParams.toString()}`);
    };
    
    const handleClearSeriesFilter = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('series');
        navigate(`/financial/billing/invoices?${newParams.toString()}`);
    };
    
    const handleTogglePaidStatus = (invoice: Invoice) => {
        if (invoice.status === 'Paid') {
            updateInvoice({ ...invoice, status: 'Pending', paymentDate: undefined });
        } else {
            updateInvoice({ 
                ...invoice, 
                status: 'Paid', 
                paymentDate: new Date().toISOString().split('T')[0],
                paymentMethod: invoice.paymentMethod || 'Transferencia'
            });
        }
    };

    const inputClasses = "p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">{pageIcon} {pageTitle}</h1>
                <span className="font-semibold text-gray-500 dark:text-gray-400">{filteredInvoices.length} Resultados</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Button leftIcon={<Plus size={16}/>}>Nueva factura</Button>
                    <Button variant="secondary" leftIcon={<Download size={16}/>}>Exportar</Button>
                    
                    {seriesParam && (
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-md text-sm border border-blue-200 dark:border-blue-800">
                            <span>Filtrado por serie: <strong>{seriesParam}</strong></span>
                            <button onClick={handleClearSeriesFilter} className="hover:text-blue-900 dark:hover:text-white"><XIcon size={14}/></button>
                        </div>
                    )}

                    <div className="flex-grow"></div>
                    <div className="relative w-64">
                        <input 
                            type="text" 
                            placeholder="Buscar" 
                            className={inputClasses + " w-full pl-4 pr-10"}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                
                <div className="border-b border-gray-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <button
                            onClick={() => handleTabClick('issued')}
                            className={`whitespace-nowrap flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'issued' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'}`}
                        >
                            <ArrowUpRight size={16} /> Facturas Emitidas
                        </button>
                        <button
                            onClick={() => handleTabClick('received')}
                            className={`whitespace-nowrap flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'received' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'}`}
                        >
                            <ArrowDownLeft size={16} /> Facturas Recibidas
                        </button>
                    </nav>
                </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-lg flex flex-wrap justify-around text-center text-sm font-medium">
                <p>Total importe facturas: <span className="font-bold">{summary.total.toFixed(2)} €</span></p>
                <p>Importe cobrado: <span className="font-bold text-green-600 dark:text-green-400">{summary.paid.toFixed(2)} €</span></p>
                <p>Importe pendiente: <span className="font-bold text-red-600 dark:text-red-400">{summary.pending.toFixed(2)} €</span></p>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <table className="min-w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-primary-600 focus:ring-primary-500"/></th>
                            <th className="px-6 py-3 font-medium">Número</th>
                            <th className="px-6 py-3 font-medium">Fecha</th>
                            <th className="px-6 py-3 font-medium">Receptor</th>
                            <th className="px-6 py-3 font-medium">Líneas</th>
                            <th className="px-6 py-3 font-medium">Total factura</th>
                            <th className="px-6 py-3 font-medium">Fichero</th>
                            <th className="px-6 py-3 font-medium">Enviar</th>
                            <th className="px-6 py-3 font-medium">¿Cobrada?</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {filteredInvoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-primary-600 focus:ring-primary-500"/></td>
                                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{inv.invoiceCode}</td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{formatDate(inv.date)}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-blue-600 dark:text-blue-400">{getReceptorName(inv, inv.receptor)}</p>
                                    </td>
                                    <td className="px-6 py-4"><Link to="#" className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"><Receipt size={14}/> {inv.linkedReceiptIds?.length || 1}</Link></td>
                                    <td className="px-6 py-4 font-bold text-lg text-gray-900 dark:text-white">{inv.totalAmount.toFixed(2)} €</td>
                                    <td className="px-6 py-4 text-center">
                                        <Link to={`/invoices/${inv.id}/pdf`} className="text-blue-600 dark:text-blue-400 hover:underline flex flex-col items-center">
                                            <FileText size={18}/><span>{inv.invoiceCode}</span>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-center"><Link to="#" className="text-blue-600 dark:text-blue-400"><Send size={18}/></Link></td>
                                    <td className="px-6 py-4">
                                        {inv.status === 'Paid' ? (
                                            <div>
                                                <p className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle size={14}/> Cobrada: {formatDate(inv.paymentDate)}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Pago: {inv.paymentMethod}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <button onClick={() => handleTogglePaidStatus(inv)} className="text-xs text-red-500 hover:underline">Ø Revertir</button>
                                                </div>
                                            </div>
                                        ) : (
                                             <div>
                                                <p className="font-semibold text-red-500 dark:text-red-400">Pendiente</p>
                                                <Button size="sm" onClick={() => handleTogglePaidStatus(inv)} className="mt-1">€ Cobrar</Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )
                        )}
                         {filteredInvoices.length === 0 && (
                            <tr>
                                <td colSpan={9} className="text-center py-10 text-gray-500 dark:text-gray-400">No hay facturas para mostrar.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvoicesListPage;
