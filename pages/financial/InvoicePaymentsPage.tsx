
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { ArrowLeft, Trash2, Search, Euro, Calendar, Trash, Edit } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const InvoicePaymentsPage = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const { invoices, updateInvoice, receipts, updateReceipt } = useData();
    const [searchTerm, setSearchTerm] = useState('');

    const invoice = useMemo(() => invoices.find(i => i.id === parseInt(invoiceId || '0')), [invoices, invoiceId]);

    if (!invoice) return <div>Factura no encontrada</div>;

    // Calculate payments based on Linked Receipts or Direct Invoice Status
    const payments = useMemo(() => {
        const list = [];

        // 1. Payments from Linked Receipts
        if (invoice.linkedReceiptIds && invoice.linkedReceiptIds.length > 0) {
             invoice.linkedReceiptIds.forEach(rId => {
                const r = receipts.find(rec => rec.id === rId);
                if (r && r.status === 'Cobrado') {
                    list.push({
                        uniqueId: `receipt-${r.id}`,
                        source: 'receipt', // Tag source to know what to update on delete
                        id: r.id,
                        date: r.paymentDate || r.receiptDate,
                        amount: r.amount,
                        method: r.paymentType,
                        comment: r.receiptCode ? `Recibo ${r.receiptCode}` : `Recibo del ${new Date(r.receiptDate).toLocaleDateString()}`
                    });
                }
             });
        } 
        // 2. Direct Invoice Payment (Only if not using receipts to avoid duplication, or if explicitly paid on top)
        else if (invoice.status === 'Paid') {
            list.push({
                uniqueId: `invoice-${invoice.id}`,
                source: 'invoice',
                id: invoice.id,
                date: invoice.paymentDate || invoice.date,
                amount: invoice.totalAmount,
                method: invoice.paymentMethod || 'Domiciliado',
                comment: 'Cobro directo factura'
            });
        }

        // Filter by search term
        return list.filter(p => 
            p.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.method.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [invoice, receipts, searchTerm]);

    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
    const pending = invoice.totalAmount - totalPaid;

    const handleDeletePayment = (payment: any) => {
        if (payment.source === 'receipt') {
             const r = receipts.find(x => x.id === payment.id);
             if (r) {
                 // Revert receipt to Pending
                 updateReceipt({ ...r, status: 'Pendiente', paymentDate: undefined });
             }
        } else {
             // Revert invoice to Pending
             updateInvoice({
                ...invoice,
                status: 'Pending',
                paymentDate: undefined,
                paymentMethod: undefined
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        Cobros de la factura: <span className="underline">{invoice.invoiceCode}</span>
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Listado del registro de cobros de una factura.<br/>
                        Esta funcionalidad te permite fragmentar los pagos de la factura.
                    </p>
                </div>
                <Euro size={48} className="text-gray-300 dark:text-gray-600" />
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>Volver</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />}>Borrar</Button>
                </div>
                <div className="relative w-64">
                    <input 
                        type="text" 
                        placeholder="Buscar" 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 pl-4 pr-10 border rounded-md text-sm bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                    />
                    <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* Summary Bar */}
            <div className="bg-cyan-50 dark:bg-cyan-900/30 p-4 rounded-lg border-l-4 border-cyan-500 flex gap-8 text-sm">
                <div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Total de la factura: </span>
                    <span className="font-bold text-green-600 dark:text-green-400">{invoice.totalAmount.toFixed(2)} €</span>
                </div>
                <div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Importe pendiente de cobrar: </span>
                    <span className={`font-bold ${pending > 0.01 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>{pending.toFixed(2)} €</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-slate-700/50 text-xs uppercase font-semibold text-gray-700 dark:text-gray-300">
                        <tr>
                            <th className="p-4 w-10"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500" /></th>
                            <th className="px-6 py-3 cursor-pointer hover:text-primary-600">Fecha cobrado ^</th>
                            <th className="px-6 py-3">Importe</th>
                            <th className="px-6 py-3">Forma pago</th>
                            <th className="px-6 py-3">Comentario</th>
                            <th className="px-6 py-3">Borrar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {payments.map(payment => (
                            <tr key={payment.uniqueId} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500" /></td>
                                <td className="px-6 py-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                                    <Calendar size={14} />
                                    {formatDate(payment.date)}
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{payment.amount.toFixed(2)} €</td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{payment.method}</td>
                                <td className="px-6 py-4 text-gray-400 italic flex items-center gap-1">
                                    {payment.comment} <span className="cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1 ml-2"><Edit size={12}/></span>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleDeletePayment(payment)} className="p-1 border border-red-200 dark:border-red-800 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                                        <Trash size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {payments.length === 0 && (
                             <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">No hay cobros registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                {payments.length} Resultado
            </div>
        </div>
    );
};

export default InvoicePaymentsPage;
