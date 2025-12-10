
import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { Printer, ArrowLeft, Rocket, RefreshCw, CheckCircle } from 'lucide-react';
import { useNavigationHistory } from '../../contexts/NavigationHistoryContext';
import { Receipt } from '../../types';
import { sanitizeHTML } from '../../utils/helpers';

const ReceiptPdfPage = () => {
    const { receiptId } = useParams();
    const { goBack } = useNavigationHistory();
    const { receipts, students, courses, teachers, academyProfile, updateReceipt, addStoredFile } = useData();
    const [showSuccess, setShowSuccess] = useState(false);

    const receipt = useMemo(() => receipts.find(r => r.id === parseInt(receiptId!)), [receipts, receiptId]);

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    const generatePdfSnapshot = (baseReceipt: Receipt) => {
        const student = students.find(s => s.id === baseReceipt.studentId);
        const course = courses.find(c => c.id === baseReceipt.courseId);
        const teacher = teachers.find(t => t.id === course?.teacherId);

        if (!student || !course || !teacher) return null;

        return {
            generatedAt: new Date().toISOString(),
            studentName: `${student.firstName} ${student.lastName}`,
            studentDni: student.dni,
            courseName: course.name,
            teacherName: `${teacher.name} ${teacher.lastName}`,
            paymentType: baseReceipt.paymentType,
            amount: Number(baseReceipt.amount), // Ensure number
            concept: baseReceipt.concept,
            receiptCode: baseReceipt.receiptCode || `${new Date(baseReceipt.receiptDate).getFullYear()}/${String(baseReceipt.id).padStart(4, '0')}`,
            receiptDate: baseReceipt.receiptDate,
            paymentDate: baseReceipt.paymentDate,
            academyName: academyProfile.publicName,
            academyLogo: academyProfile.docLogoBase64 || academyProfile.logoBase64
        };
    };
    
    const handleUpdate = () => {
        if (receipt) {
            const snapshot = generatePdfSnapshot(receipt);
            if (snapshot) {
                updateReceipt({ ...receipt, pdfSnapshot: snapshot });
                
                // Register file in File Manager
                const fileName = `Recibo_${snapshot.receiptCode.replace('/', '-')}.pdf`;
                addStoredFile({
                     id: `receipt-pdf-${receipt.id}-${Date.now()}`,
                     fileName,
                     fileUrl: '', 
                     fileType: 'receipt_pdf',
                     relatedTable: 'receipts',
                     relatedId: receipt.id,
                     centerId: receipt.centerId || 1,
                     createdAt: new Date().toISOString(),
                 });

                setShowSuccess(true);
            } else {
                alert('No se pudo actualizar el recibo, faltan datos.');
            }
        }
    };
    
    // Si no hay snapshot, no se puede mostrar.
    if (!receipt || !receipt.pdfSnapshot) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-800 dark:text-white">PDF del recibo no encontrado o no generado.</p>
                <Button onClick={goBack} className="mt-4">Volver</Button>
            </div>
        );
    }
    
    const data = receipt.pdfSnapshot; // Usar siempre los datos del snapshot
    const amountValue = Number(data.amount || 0); // Safe cast

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
                <Button size="sm" leftIcon={<Printer size={16}/>} onClick={handlePrint}>Imprimir PDF</Button>
                <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={16}/>} onClick={handleUpdate}>Actualizar</Button>
                {showSuccess && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle size={16} />
                        <span className="text-sm font-medium">¡Recibo actualizado y archivado!</span>
                    </div>
                )}
            </div>
            
            <div id="receipt-sheet" className="bg-white p-12 shadow-lg max-w-4xl w-full font-sans text-gray-800 print:shadow-none print:p-0 print:max-w-none flex-grow">
                <header className="flex justify-between items-start mb-12">
                    {data.academyLogo ? (
                        <img src={data.academyLogo} alt="Logo de la Academia" className="h-14 object-contain" />
                    ) : (
                        <div className="flex items-center gap-2 font-bold text-2xl text-blue-600">
                            <Rocket/>
                            <span>{data.academyName}</span>
                        </div>
                    )}
                </header>

                <main>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-12 text-sm leading-relaxed text-gray-900">
                        <div>
                            <p><strong className="font-semibold text-gray-600">Alumno:</strong> <span className="font-bold">{data.studentName.toUpperCase()}</span></p>
                            <p><strong className="font-semibold text-gray-600">DNI/NIF:</strong> {data.studentDni || 'No especificado'}</p>
                            <p><strong className="font-semibold text-gray-600">Forma pago:</strong> {data.paymentType}</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <p><strong className="font-semibold text-gray-600">Curso:</strong> {data.courseName}</p>
                            <p><strong className="font-semibold text-gray-600">Profesor/a:</strong> {data.teacherName}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-5">
                                <tr>
                                    <th className="p-2 border border-gray-300 text-left font-semibold text-gray-700">Código recibo</th>
                                    <th className="p-2 border border-gray-300 text-left font-semibold text-gray-700">Mes</th>
                                    <th className="p-2 border border-gray-300 text-right font-semibold text-gray-700">Importe</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-2 border border-gray-300 text-gray-800">{data.receiptCode}</td>
                                    <td className="p-2 border border-gray-300 text-gray-800">{new Date(data.receiptDate).toLocaleString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</td>
                                    <td className="p-2 border border-gray-300 text-right text-gray-800">{amountValue.toFixed(2)} €</td>
                                </tr>
                            </tbody>
                        </table>
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-2 border border-gray-300 text-left font-semibold text-gray-700">Fecha creación</th>
                                    <th className="p-2 border border-gray-300 text-left font-semibold text-gray-700">Fecha expedición</th>
                                    <th className="p-2 border border-gray-300 text-left font-semibold text-gray-700">Fecha vencimiento</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-2 border border-gray-300 text-gray-800">{formatDate(data.receiptDate)}</td>
                                    <td className="p-2 border border-gray-300 text-gray-800">{formatDate(new Date().toISOString())}</td>
                                    <td className="p-2 border border-gray-300 text-gray-800">{formatDate(data.receiptDate)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <table className="w-full text-sm mt-8">
                        <thead className="border-b-2 border-gray-700">
                            <tr>
                                <th className="p-2 font-bold uppercase text-left text-gray-800">Concepto</th>
                                <th className="p-2 font-bold uppercase text-right text-gray-800">Importe Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-300">
                                <td className="p-2 py-3 text-gray-800">{data.concept}</td>
                                <td className="p-2 py-3 text-right text-gray-800">{amountValue.toFixed(2)} €</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="mt-4 flex justify-end">
                        <table className="w-full sm:w-1/2 text-sm">
                            <tbody className="bg-gray-100">
                                <tr className="font-bold text-base text-gray-900">
                                    <td className="p-3 text-left uppercase">Totales</td>
                                    <td className="p-3 text-right">{amountValue.toFixed(2)} €</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </main>
                <footer className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
                    <p>Última generación: {data.generatedAt ? new Date(data.generatedAt).toLocaleString('es-ES') : 'N/A'}</p>
                    <p>{data.academyName} - {academyProfile.contactEmail}</p>
                </footer>
            </div>
            
            <style>{`
                @page { size: A4; margin: 1.5cm; }
                @media print {
                    body { background-color: #fff !important; -webkit-print-color-adjust: exact; }
                    .print\\:hidden { display: none !important; }
                    .print\\:p-0 { padding: 0 !important; }
                    .print\\:shadow-none { box-shadow: none !important; border: none !important; }
                     .print\\:max-w-none { max-width: 100% !important; }
                    #receipt-sheet { color: black !important; background-color: white !important; }
                }
            `}</style>
        </div>
    );
};

export default ReceiptPdfPage;
