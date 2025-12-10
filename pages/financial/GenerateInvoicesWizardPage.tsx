import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { Check, X, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import { Receipt, Student } from '../../types';
import { validateNif } from '../../utils/helpers';

const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ["Configuración de las facturas", "Revisión de los datos", "Generar factura"];
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

const GenerateInvoicesWizardPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { receipts, studentMap, courseMap, billingCenters, generateInvoiceFromReceipt, invoices } = useData();
    const receiptIds = state?.receiptIds as number[] || [];

    // Get active billing center and its series
    const activeCenter = useMemo(() => billingCenters.find(c => c.isActive) || billingCenters[0], [billingCenters]);
    const availableSeries = useMemo(() => {
        // Filter for active series that are NOT rectifying (standard invoices)
        return activeCenter?.series?.filter(s => s.isActive && !s.isRectifying) || [];
    }, [activeCenter]);

    const [step, setStep] = useState(1);
    const [serie, setSerie] = useState('');
    const [emissionDate, setEmissionDate] = useState(new Date().toISOString().split('T')[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedCount, setGeneratedCount] = useState(0);

    // Set default series when availableSeries changes
    useEffect(() => {
        if (availableSeries.length > 0 && !serie) {
            setSerie(availableSeries[0].code);
        } else if (availableSeries.length === 0) {
             setSerie(new Date().getFullYear().toString()); // Fallback
        }
    }, [availableSeries, serie]);

    const receiptsToProcess = useMemo(() => {
        return receiptIds.map(id => receipts.find(r => r.id === id))
            .filter((r): r is Receipt => !!r);
    }, [receiptIds, receipts]);
    
    const [reviewData, setReviewData] = useState<any[]>([]);

    useEffect(() => {
        if (step === 2) {
            const data = receiptsToProcess.map(r => {
                const student = studentMap[r.studentId];
                const course = courseMap[r.courseId];
                const billingNif = student?.billingData?.nif || student?.dni;
                const isDniValid = validateNif(billingNif);
                return {
                    receipt: r,
                    student,
                    course,
                    isDniValid,
                    shouldGenerate: isDniValid && !r.isInvoiceGenerated,
                };
            });
            setReviewData(data);
        }
    }, [step, receiptsToProcess, studentMap, courseMap]);

    const handleToggleGenerate = (receiptId: number) => {
        setReviewData(prev => prev.map(item => 
            item.receipt.id === receiptId ? { ...item, shouldGenerate: !item.shouldGenerate } : item
        ));
    };

    const handleGenerate = async () => {
        setStep(3);
        setIsGenerating(true);
        const receiptsToGenerate = reviewData.filter(item => item.shouldGenerate);
        
        for (const item of receiptsToGenerate) {
            generateInvoiceFromReceipt(item.receipt.id, serie, emissionDate);
            setGeneratedCount(prev => prev + 1);
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        setIsGenerating(false);
    };

    const lastEmittedInvoice = useMemo(() => {
        const invoicesInSeries = invoices.filter(inv => inv.series === serie);
        if (invoicesInSeries.length === 0) return 'Ninguna';
        const lastDate = invoicesInSeries.reduce((latest, inv) => new Date(inv.date) > new Date(latest) ? inv.date : latest, invoicesInSeries[0].date);
        return new Date(lastDate).toLocaleDateString();
    }, [invoices, serie]);

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Nueva factura del recibo</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Asistente para pasar múltiples recibos a factura</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <StepIndicator currentStep={step} />

                {step === 1 && (
                    <div className="max-w-md mx-auto space-y-6">
                        <p className="text-center text-gray-600 dark:text-gray-300 mb-4">Selecciona los parámetros de configuración necesarios para poder crear la/s factura/s.</p>
                        
                        <div className="p-6 border border-gray-200 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700/30">
                            <h3 className="font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-slate-600 pb-2">Serie de facturación</h3>
                            
                            {activeCenter && (
                                <p className="text-xs text-primary-600 dark:text-primary-400 mb-4 font-medium">
                                    Centro: {activeCenter.name}
                                </p>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Serie</label>
                                    <select value={serie} onChange={(e) => setSerie(e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500">
                                        {availableSeries.map(s => <option key={s.id} value={s.code}>{s.code} ({s.year})</option>)}
                                        {availableSeries.length === 0 && <option value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</option>}
                                    </select>
                                    {availableSeries.length === 0 && <p className="text-xs text-orange-500 mt-1">No hay series activas definidas en el centro de facturación.</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Fecha emisión*</label>
                                    <input type="date" value={emissionDate} onChange={(e) => setEmissionDate(e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Última factura emitida: {lastEmittedInvoice}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
                            <Button onClick={() => setStep(2)} disabled={!serie}>Siguiente</Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <div className="mb-6">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1">Facturas que se generarán</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Listado de recibos que se pasaran a factura. Los recibos que contengan errores no van a generar la factura.</p>
                        </div>
                        <div className="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-lg">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-700 dark:text-gray-300">
                                    <tr>
                                        <th className="p-3 text-left font-semibold">Alumno</th>
                                        <th className="p-3 text-left font-semibold">Curso</th>
                                        <th className="p-3 text-left font-semibold">Concepto</th>
                                        <th className="p-3 text-right font-semibold">Importe</th>
                                        <th className="p-3 text-center font-semibold">¿DNI válido?</th>
                                        <th className="p-3 text-center font-semibold">¿Generará fac.?</th>
                                        <th className="p-3 text-center font-semibold">Tipo factura</th>
                                        <th className="p-3 text-left font-semibold">Serie</th>
                                        <th className="p-3 text-left font-semibold">Fecha fac.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-slate-700 text-gray-800 dark:text-gray-200">
                                    {reviewData.map(item => (
                                        <tr key={item.receipt.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                            <td className="p-3 font-medium">{item.student.lastName}, {item.student.firstName}</td>
                                            <td className="p-3">{item.course.name}</td>
                                            <td className="p-3">{item.receipt.concept}</td>
                                            <td className="p-3 text-right font-bold">{item.receipt.amount.toFixed(2)} €</td>
                                            <td className="p-3 text-center">
                                                {!item.isDniValid ? 
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 rounded border border-orange-200 dark:border-orange-800 flex items-center justify-center gap-1">
                                                        <X size={12}/> Sin NIF
                                                    </span> 
                                                    : 
                                                    <Check size={16} className="text-green-500 mx-auto" />
                                                }
                                            </td>
                                            <td className="p-3 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={item.shouldGenerate} 
                                                    onChange={() => handleToggleGenerate(item.receipt.id)} 
                                                    disabled={!item.isDniValid || item.receipt.isInvoiceGenerated} 
                                                    className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                                                />
                                                {item.receipt.isInvoiceGenerated && <span className="block text-xs text-gray-400">Ya generada</span>}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">Completa</span>
                                            </td>
                                            <td className="p-3">{serie}</td>
                                            <td className="p-3">{new Date(emissionDate).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {reviewData.length === 0 && (
                                        <tr><td colSpan={9} className="p-4 text-center text-gray-500">No hay recibos seleccionados.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                         <div className="flex justify-between mt-6">
                            <Button variant="secondary" onClick={() => setStep(1)}>Atrás</Button>
                            <Button onClick={handleGenerate} disabled={!reviewData.some(i => i.shouldGenerate)}>Generar Facturas</Button>
                        </div>
                    </div>
                )}
                
                {step === 3 && (
                     <div className="text-center p-12">
                        {isGenerating ? (
                            <div className="flex flex-col items-center">
                                <Loader className="animate-spin text-primary-600 w-12 h-12 mb-4" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Generando facturas...</h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">Procesando {generatedCount} de {reviewData.filter(i=>i.shouldGenerate).length} facturas.</p>
                            </div>
                        ) : (
                             <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">¡Proceso completado!</h2>
                                <p className="mt-2 text-gray-600 dark:text-gray-300">Se han generado correctamente <strong>{generatedCount}</strong> facturas.</p>
                                <div className="mt-8 flex gap-4">
                                    <Button variant="secondary" onClick={() => navigate('/financial/billing/invoices?type=issued')}>Ver facturas emitidas</Button>
                                    <Button onClick={() => navigate('/receipts/all')}>Volver a recibos</Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerateInvoicesWizardPage;