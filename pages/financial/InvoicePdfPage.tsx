
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { Printer, ArrowLeft, Rocket } from 'lucide-react';
import { useNavigationHistory } from '../../contexts/NavigationHistoryContext';

const InvoicePdfPage = () => {
    const { invoiceId } = useParams();
    const { goBack } = useNavigationHistory();
    const { invoices } = useData();

    const invoice = useMemo(() => invoices.find(r => r.id === parseInt(invoiceId!)), [invoices, invoiceId]);
    const data = invoice?.pdfSnapshot;

    if (!invoice || !data) {
         return (
            <div className="p-8 text-center">
                <p className="text-gray-800 dark:text-white">Factura no encontrada o sin datos para mostrar.</p>
                <Button onClick={goBack} className="mt-4">Volver</Button>
            </div>
        );
    }

    const handlePrint = () => window.print();
    
    const formatDate = (dateString?: string) => {
        if (!dateString) return '--';
        const date = new Date(dateString);
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 p-4 sm:p-8 print:bg-white print:p-0 min-h-screen flex flex-col items-center">
            <div className="max-w-4xl w-full mb-6 flex gap-4 items-center print:hidden">
                <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={16}/>} onClick={goBack}>Volver</Button>
                <Button size="sm" leftIcon={<Printer size={16}/>} onClick={handlePrint}>Imprimir / Guardar PDF</Button>
            </div>
            
            <div id="invoice-sheet" className="bg-white p-12 shadow-lg max-w-4xl w-full font-sans text-gray-900 print:shadow-none print:p-0 print:max-w-none flex-grow">
                <header className="flex justify-between items-start mb-12">
                     {data.academyLogo ? (
                        <img src={data.academyLogo} alt="Logo de la Academia" className="h-20 object-contain" />
                    ) : (
                        <div className="flex items-center gap-2 font-bold text-3xl text-primary-600">
                            <Rocket/>
                            <span>{data.academyName}</span>
                        </div>
                    )}
                    <div className="text-right">
                        <h1 className="text-3xl font-bold uppercase text-gray-800">Factura</h1>
                        <p className="text-gray-800 font-semibold mt-1">{data.invoiceCode}</p>
                    </div>
                </header>

                <main>
                    <div className="grid grid-cols-2 gap-8 text-sm mb-10">
                        <div>
                            <p className="font-bold text-gray-700 uppercase tracking-wider text-xs mb-1">De:</p>
                            <p className="font-bold text-base text-gray-900">{data.academyName}</p>
                            <p className="text-gray-800">CIF: {data.academyNif}</p>
                            <pre className="font-sans whitespace-pre-wrap mt-1 text-gray-800">{data.academyAddress}</pre>
                        </div>
                         <div className="bg-gray-5 p-4 rounded-md border">
                            <p className="font-bold text-gray-700 uppercase tracking-wider text-xs mb-1">Datos del pagador (Para):</p>
                            <p className="font-bold text-base text-gray-900">{data.clientName}</p>
                            <p className="text-gray-800">{data.clientNif}</p>
                            <p className="text-gray-800 mt-1">{data.clientAddress}</p>
                            <p className="text-gray-800">{data.clientPostalCode} {data.clientPopulation}</p>
                            
                            {data.studentName && data.studentName !== data.clientName && (
                                <div className="mt-3 pt-2 border-t border-gray-300">
                                     <p className="text-xs text-gray-500 uppercase tracking-wider">Alumno/a:</p>
                                     <p className="text-gray-900 font-medium">{data.studentName}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-8 grid grid-cols-3 gap-4 text-sm font-semibold">
                        <div className="bg-gray-50 p-3 rounded-md border">
                            <p className="text-gray-700 text-xs text-gray-800">Fecha factura:</p>
                            <p className="text-gray-900">{formatDate(data.invoiceDate)}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md border">
                            <p className="text-gray-700 text-xs text-gray-800">Número factura:</p>
                            <p className="text-gray-900">{data.invoiceCode}</p>
                        </div>
                         <div className="bg-gray-50 p-3 rounded-md border">
                            <p className="text-gray-700 text-xs text-gray-800">Fecha vencimiento:</p>
                            <p className="text-gray-900">{formatDate(data.dueDate || data.invoiceDate)}</p>
                        </div>
                    </div>
                    
                    <table className="w-full text-sm mt-8">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 font-semibold text-left rounded-l-md text-gray-900">Descripción</th>
                                <th className="p-3 font-semibold text-right text-gray-900">Precio unidad</th>
                                <th className="p-3 font-semibold text-right text-gray-900">Cantidad</th>
                                <th className="p-3 font-semibold text-right rounded-r-md text-gray-900">Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((item: any, index: number) => (
                                <tr key={index} className="border-b">
                                    <td className="p-3 py-4 text-gray-900"><pre className="font-sans whitespace-pre-wrap">{item.description}</pre></td>
                                    <td className="p-3 py-4 text-right text-gray-900">{Number(item.unitPrice).toFixed(2)} €</td>
                                    <td className="p-3 py-4 text-right text-gray-900">{item.quantity}</td>
                                    <td className="p-3 py-4 text-right text-gray-900">{Number(item.totalPrice).toFixed(2)} €</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-8 flex justify-end">
                        <div className="w-full sm:w-1/2 text-sm space-y-2">
                            <div className="flex justify-between py-2">
                                <span className="font-semibold text-gray-800">Base Imponible</span>
                                <span className="text-gray-900">{Number(data.baseAmount).toFixed(2)} €</span>
                            </div>
                             <div className="flex justify-between py-2">
                                <span className="font-semibold text-gray-800">IVA (0%)</span>
                                <span className="text-gray-900">{Number(data.vatAmount).toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between py-3 bg-gray-100 px-3 rounded-md text-base font-bold text-gray-900 border-t-2 border-gray-800">
                                <span>TOTAL</span>
                                <span>{Number(data.totalAmount).toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            
            <style>{`
                @page { size: A4; margin: 1.5cm; }
                @media print {
                    body { background-color: #fff !important; -webkit-print-color-adjust: exact; }
                    .print\\:hidden { display: none !important; }
                    #invoice-sheet { box-shadow: none !important; border: none !important; color: #111827 !important; }
                    pre, p, span, td, th, h1, h2, h3, div { color: #111827 !important; }
                }
            `}</style>
        </div>
    );
};

export default InvoicePdfPage;
