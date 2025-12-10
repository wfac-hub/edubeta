
import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useNavigationHistory } from '../../contexts/NavigationHistoryContext';
import Button from '../../components/ui/Button';
import { MoveLeft, Edit, FileText, Send, Mail, Check, X, Eye } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { Invoice, Student, BillingClient, ProformaInvoice } from '../../types';
import Modal from '../../components/ui/Modal';

const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ["Configurar rectificación", "Resultado"];
    return (
        <nav className="flex items-center justify-center space-x-4 mb-8">
            {steps.map((title, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                    <React.Fragment key={stepNumber}>
                        <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                ${isActive ? 'bg-primary-600 text-white border-2 border-primary-600' : 
                                 isCompleted ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 border-2 border-primary-600 dark:border-primary-400' :
                                 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-2 border-gray-300 dark:border-slate-600'}`}>
                                {isCompleted ? <Check size={16} /> : stepNumber}
                            </div>
                            <span className={`ml-3 font-medium ${isActive ? 'text-primary-600 dark:text-primary-400' : isCompleted ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>{title}</span>
                        </div>
                        {stepNumber < steps.length && <div className="flex-1 h-0.5 bg-gray-200 dark:bg-slate-700"></div>}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

const RectifyInvoiceModal: React.FC<{ 
    isOpen: boolean, 
    onClose: () => void, 
    invoice: Invoice | null 
}> = ({ isOpen, onClose, invoice }) => {
    const { rectifyInvoice, billingCenters } = useData();
    
    // Get active billing center and its series
    const activeCenter = useMemo(() => billingCenters.find(c => c.isActive) || billingCenters[0], [billingCenters]);
    const rectificationSeriesList = useMemo(() => {
        // Filter for active series that ARE rectifying
        return activeCenter?.series?.filter(s => s.isActive && s.isRectifying) || [];
    }, [activeCenter]);

    const [step, setStep] = useState(1);
    const [type, setType] = useState<'definitiva' | 'provisional'>('definitiva');
    const [series, setSeries] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Set default series
    React.useEffect(() => {
        if (rectificationSeriesList.length > 0 && !series) {
            setSeries(rectificationSeriesList[0].code);
        } else if (rectificationSeriesList.length === 0 && !series) {
            setSeries('R-' + new Date().getFullYear()); // Fallback
        }
    }, [rectificationSeriesList, series]);

    const handleRectify = () => {
        if (invoice) {
            rectifyInvoice(invoice.id, series, date, type === 'provisional');
            setStep(2);
        }
    };
    
    const handleClose = () => {
        setStep(1);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Alta de factura rectificativa">
            <div className="p-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Asistente de alta de una factura rectificativa.</p>
                <StepIndicator currentStep={step} />
                
                {step === 1 && (
                    <div className="space-y-8">
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Determina los parámetros para generar la factura rectificativa:</p>
                            
                            <div className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-md border border-gray-200 dark:border-slate-600 mb-6">
                                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-slate-600 pb-2 mb-3">Tipo de factura que se generará</h4>
                                <div className="space-y-3">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input type="radio" name="rectifyType" checked={type === 'definitiva'} onChange={() => setType('definitiva')} className="mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-slate-500 dark:bg-slate-800" />
                                        <div>
                                            <span className="block font-medium text-sm text-gray-800 dark:text-gray-200">Definitiva</span>
                                            <span className="block text-xs text-blue-600 dark:text-blue-400 mt-1">Se generará con un número consecutivo a la anterior factura y una vez emitida ya no se podran modificar los importes.</span>
                                        </div>
                                    </label>
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input type="radio" name="rectifyType" checked={type === 'provisional'} onChange={() => setType('provisional')} className="mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-slate-500 dark:bg-slate-800" />
                                        <div>
                                            <span className="block font-medium text-sm text-gray-800 dark:text-gray-200">Provisional</span>
                                            <span className="block text-xs text-blue-600 dark:text-blue-400 mt-1">No se le asignará un número y se podrá modificar hasta que se decida convertirla en <span className="font-bold">definitiva</span>.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-md border border-gray-200 dark:border-slate-600">
                                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-slate-600 pb-2 mb-3">Serie de facturación</h4>
                                
                                {activeCenter && (
                                    <p className="text-xs text-primary-600 dark:text-primary-400 mb-3 font-medium">
                                        Centro: {activeCenter.name}
                                    </p>
                                )}

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Serie rectificativa</label>
                                        <select value={series} onChange={(e) => setSeries(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500">
                                            {rectificationSeriesList.map(s => <option key={s.id} value={s.code}>{s.code} ({s.year})</option>)}
                                            {rectificationSeriesList.length === 0 && <option value={`R-${new Date().getFullYear()}`}>R-{new Date().getFullYear()}</option>}
                                        </select>
                                        {rectificationSeriesList.length === 0 && <p className="text-xs text-orange-500 mt-1">No hay series rectificativas activas.</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Fecha emisión*</label>
                                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
                            <Button variant="danger" onClick={handleClose}>Cancelar</Button>
                            <Button onClick={handleRectify}>Siguiente &gt;</Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                            <Check size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¡Factura rectificativa creada!</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Se ha generado correctamente la factura rectificativa.</p>
                        <Button onClick={handleClose}>Finalizar</Button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

type EnrichedInvoiceItem = 
    | (Invoice & { docType: 'invoice', receptor?: Student | BillingClient })
    | (ProformaInvoice & { docType: 'proforma', receptor?: Student | BillingClient });

const GeneratedInvoicesPage = () => {
    const { receiptId } = useParams();
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const { receipts, invoices, proformaInvoices, students, billingClients, updateInvoice, updateReceipt } = useData();

    const receipt = useMemo(() => receipts.find(r => r.id === parseInt(receiptId!)), [receipts, receiptId]);
    
    const [isRectifyModalOpen, setIsRectifyModalOpen] = useState(false);
    const [invoiceToRectify, setInvoiceToRectify] = useState<Invoice | null>(null);

    const combinedInvoices = useMemo(() => {
        if (!receipt) return [];
        
        // Final Invoices
        const finalInvoices = invoices
            .filter(inv => inv.linkedReceiptIds?.includes(receipt.id))
            .map(inv => {
                let receptor: Student | BillingClient | undefined;
                
                // Since we know this comes from a receipt, prioritize Student lookup
                if (inv.clientId) {
                     receptor = students.find(s => s.id === inv.clientId);
                     // Fallback to BillingClient if student not found (edge case for non-student receipts)
                     if (!receptor) {
                        receptor = billingClients.find(c => c.id === inv.clientId);
                     }
                }
                
                return { ...inv, receptor, docType: 'invoice' as const };
            });

        // Proforma Invoices (Drafts)
        const drafts = proformaInvoices
             .filter(p => p.linkedReceiptIds?.includes(receipt.id))
             .map(p => ({...p, receptor: p.client, docType: 'proforma' as const}));

        return [...finalInvoices, ...drafts]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Most recent first
    }, [receipt, invoices, proformaInvoices, students, billingClients]);

    const handleRectifyClick = (inv: Invoice) => {
        setInvoiceToRectify(inv);
        setIsRectifyModalOpen(true);
    };

    if (!receipt) {
        return <div className="p-8 text-center">Recibo no encontrado.</div>;
    }

    const getReceptorName = (receptor?: Student | BillingClient) => {
        if (!receptor) return 'N/A';
        if ('isCompany' in receptor && (receptor as BillingClient).isCompany) {
            return (receptor as BillingClient).companyName || 'Cliente sin nombre';
        }
        return `${(receptor as Student).firstName} ${(receptor as Student).lastName || ''}`.trim();
    };
    
    const getReceptorIdentifier = (receptor?: Student | BillingClient) => {
        if (!receptor) return 'N/A';
        if ('dni' in receptor) return (receptor as Student).dni;
        return (receptor as BillingClient).nif;
    }
    
    const getReceptorEmail = (receptor?: Student | BillingClient) => {
        if (!receptor) return 'N/A';
        if ('email1' in receptor) return (receptor as Student).email1;
        return (receptor as BillingClient).email;
    }
    
    const handleTogglePaidStatus = (inv: Invoice) => {
        const isPaid = inv.status === 'Paid' || (receipt && receipt.status === 'Cobrado');
        
        if (isPaid) {
            // Revert
            updateInvoice({ ...inv, status: 'Pending', paymentDate: undefined });
            if (receipt && receipt.status === 'Cobrado') {
                 updateReceipt({ ...receipt, status: 'Pendiente', paymentDate: undefined });
            }
        } else {
            // Pay
            const today = new Date().toISOString().split('T')[0];
            updateInvoice({ 
                ...inv, 
                status: 'Paid', 
                paymentDate: today, 
                paymentMethod: inv.paymentMethod || 'Domiciliado' 
            });
            if (receipt && receipt.status === 'Pendiente') {
                 updateReceipt({ ...receipt, status: 'Cobrado', paymentDate: today });
            }
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Factura generada del recibo: {receipt.receiptCode || receipt.id}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{receipt.concept}</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16}/>} onClick={goBack}>Volver</Button>
                    {combinedInvoices.length > 0 && (
                         <Button 
                            variant="secondary" 
                            size="sm" 
                            leftIcon={<Edit size={16}/>} 
                            onClick={() => {
                                // Only allow rectifying real invoices
                                const firstRealInvoice = combinedInvoices.find(i => i.docType === 'invoice');
                                if (firstRealInvoice) handleRectifyClick(firstRealInvoice as unknown as Invoice);
                            }}
                            disabled={!combinedInvoices.some(i => i.docType === 'invoice')}
                        >
                            Rectificar
                        </Button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <table className="min-w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-primary-600 focus:ring-primary-500"/></th>
                            <th className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300">Número</th>
                            <th className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300">Fecha</th>
                            <th className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300">Receptor</th>
                            <th className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300 text-center">Líneas</th>
                            <th className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300">Total factura</th>
                            <th className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300 text-center">Fichero</th>
                            <th className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300 text-center">Enviar</th>
                            <th className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300 text-right">¿Cobrada?</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {combinedInvoices.map(item => {
                            const isProforma = item.docType === 'proforma';
                            const totalAmount = isProforma ? Number((item as unknown as ProformaInvoice).total) : Number((item as unknown as Invoice).totalAmount);
                            const invoiceCode = isProforma ? (item as unknown as ProformaInvoice).number : (item as unknown as Invoice).invoiceCode;
                            
                            // Logic for real invoices
                            const isPaid = !isProforma && ((item as unknown as Invoice).status === 'Paid' || receipt.status === 'Cobrado');
                            const paymentDate = !isProforma ? (item as unknown as Invoice).paymentDate || receipt.paymentDate || item.date : null;
                            const paymentMethod = !isProforma ? (item as unknown as Invoice).paymentMethod || receipt.paymentType : null;
                            
                            const isRectification = totalAmount < 0;

                            return (
                                <tr key={`${item.docType}-${item.id}`} className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 ${isRectification ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                                    <td className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-primary-600 focus:ring-primary-500"/></td>
                                    <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">
                                        {isProforma ? (
                                             <span className="text-gray-600 dark:text-gray-400">{invoiceCode}</span>
                                        ) : (
                                            <Link to={`/invoices/${item.id}/pdf`}>{invoiceCode}</Link>
                                        )}
                                        
                                        {isProforma && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 px-1.5 py-0.5 rounded">Borrador</span>}
                                        {isRectification && <span className="ml-2 text-xs bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 px-1.5 py-0.5 rounded">Rectificativa</span>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{formatDate(item.date)}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{getReceptorName(item.receptor)}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{getReceptorIdentifier(item.receptor)}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">({getReceptorEmail(item.receptor)})</p>
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">{item.lineCount || 1}</td>
                                    <td className={`px-6 py-4 font-bold ${totalAmount < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>{totalAmount.toFixed(2)} €</td>
                                    <td className="px-6 py-4 text-center">
                                        {!isProforma ? (
                                            <Link to={`/invoices/${item.id}/pdf`} className="flex flex-col items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
                                                <FileText size={16}/> <span className="text-xs">{invoiceCode}</span>
                                            </Link>
                                        ) : (
                                             <span className="text-gray-400 flex flex-col items-center"><FileText size={16}/> <span className="text-xs">Draft</span></span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center"><Button variant="ghost" size="sm"><Mail size={16} className="text-gray-500 dark:text-gray-400"/></Button></td>
                                    <td className="px-6 py-4 text-right">
                                        {isProforma ? (
                                            <span className="text-xs text-gray-400 italic">Borrador</span>
                                        ) : isPaid ? (
                                            <div className="flex flex-col items-end gap-1">
                                                <p className="font-semibold text-green-600 dark:text-green-400 text-sm">
                                                    Cobrada: {formatDate(paymentDate as string)}
                                                </p>
                                                {/* Show receipt source if available */}
                                                {(receipt && receipt.status === 'Cobrado') && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">(Vía Recibo)</p>
                                                )}
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="font-bold text-gray-700 dark:text-gray-300">Pago:</span> {paymentMethod}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                     <button 
                                                        onClick={() => navigate(`/invoices/${item.id}/payments`)}
                                                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                     >
                                                        <Eye size={14} />
                                                        1 cobro
                                                    </button>
                                                    <button 
                                                        onClick={() => handleTogglePaidStatus(item as unknown as Invoice)}
                                                        className="p-1 text-red-600 border border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        title="Revertir cobro"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                             <div className="flex flex-col items-end gap-1">
                                                <p className="font-semibold text-red-500 dark:text-red-400 mb-1">Cobrada: No</p>
                                                 <button
                                                    onClick={() => handleTogglePaidStatus(item as unknown as Invoice)}
                                                    className="px-2 py-1 text-xs font-medium text-green-600 border border-green-600 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                                >
                                                    € Cobrar
                                                </button>
                                                 <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="font-bold text-gray-700 dark:text-gray-300">Pago:</span> {paymentMethod}
                                                </p>
                                             </div>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                 {combinedInvoices.length === 0 && <p className="text-center py-8 text-gray-500 dark:text-gray-400">No hay facturas para este recibo.</p>}
            </div>

            <RectifyInvoiceModal 
                isOpen={isRectifyModalOpen} 
                onClose={() => setIsRectifyModalOpen(false)} 
                invoice={invoiceToRectify} 
            />
        </div>
    );
};

export default GeneratedInvoicesPage;
