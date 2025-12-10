import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Receipt, Student, Course } from '../types';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';
import Button from '../components/ui/Button';
import { AlertTriangle } from 'lucide-react';
import { PAYMENT_TYPES } from '../constants';

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, required, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            {label}{required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const RadioGroup: React.FC<{ name: string; options: { label: string, value: string }[], value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ name, options, value, onChange }) => (
    <div className="flex items-center gap-x-4 gap-y-2 flex-wrap pt-1">
        {options.map(option => (
            <label key={option.value} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={onChange} />
                <span className="ml-2">{option.label}</span>
            </label>
        ))}
    </div>
);

const ReceiptEditPage = () => {
    const { receiptId } = useParams();
    const { goBack } = useNavigationHistory();
    const { receipts, students, courses, updateReceipt } = useData();

    const [formData, setFormData] = useState<Receipt | null>(null);
    const [student, setStudent] = useState<Student | null>(null);
    const [course, setCourse] = useState<Course | null>(null);

    useEffect(() => {
        const receipt = receipts.find(r => r.id === parseInt(receiptId!));
        if (receipt) {
            setFormData({
                isCancelled: receipt.isCancelled ?? false, 
                receiptCode: receipt.receiptCode || `${new Date(receipt.receiptDate).getFullYear()}/${String(receipt.id).padStart(4,'0')}`, 
                internalComment: receipt.internalComment || '',
                isSent: receipt.isSent ?? false,
                ...receipt 
            });
            setStudent(students.find(s => s.id === receipt.studentId) || null);
            setCourse(courses.find(c => c.id === receipt.courseId) || null);
        }
    }, [receiptId, receipts, students, courses]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (!formData) return;
        const { name, value, type } = e.target;
        
        let processedValue: any = value;
        
        if (type === 'number' || name === 'amount') {
            processedValue = parseFloat(value) || 0;
        } else if (type === 'radio') {
            if (name === 'status') {
                processedValue = value;
            } else {
                 processedValue = value === 'true';
            }
        }

        const updatedFormData = { ...formData, [name]: processedValue };

        if (name === 'status' && value === 'Pendiente') {
            updatedFormData.paymentDate = undefined;
        }
        
        if (name === 'status' && value === 'Cobrado' && !updatedFormData.paymentDate) {
            updatedFormData.paymentDate = new Date().toISOString().split('T')[0];
        }

        setFormData(updatedFormData);
    };
    
    const handleSave = () => {
        if (formData) {
            // Ensure amount is number before saving
            const dataToSave = {
                ...formData,
                amount: Number(formData.amount)
            };
            updateReceipt(dataToSave);
            goBack();
        }
    };

    if (!formData || !student || !course) {
        return <div className="p-8 text-center">Cargando recibo...</div>;
    }

    const isPaid = formData.status === 'Cobrado';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{formData.concept}</h1>
                <p className="text-gray-500 dark:text-gray-400">Actualizar - Recibos</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <div className="space-y-6">
                    <FormField label="¿Enviado?">
                        <RadioGroup name="isSent" value={String(formData.isSent)} onChange={handleChange} options={[{ label: 'Sí', value: 'true' }, { label: 'No', value: 'false' }]} />
                    </FormField>

                    <FormField label="Alumno/curso">
                        <select disabled className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-slate-700/50 cursor-not-allowed">
                            <option>{`${course.name} - ${student.firstName} ${student.lastName}`}</option>
                        </select>
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Fecha recibo">
                            <input type="date" name="receiptDate" value={formData.receiptDate} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-900" />
                        </FormField>
                        <FormField label="Código recibo">
                            <input type="text" name="receiptCode" value={formData.receiptCode || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-900" />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Importe recibo">
                            <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} disabled={isPaid} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-900 disabled:bg-gray-100 dark:disabled:bg-slate-800" />
                            {isPaid && (
                                <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                                    <AlertTriangle size={16} />
                                    <span>No se puede modificar el importe porque el recibo está cobrado.</span>
                                </div>
                            )}
                        </FormField>
                        <FormField label="Concepto" required>
                            <input type="text" name="concept" value={formData.concept} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-900" />
                        </FormField>
                    </div>
                    
                    <FormField label="Tipo de pago">
                        <RadioGroup name="paymentType" value={formData.paymentType} onChange={handleChange} options={PAYMENT_TYPES.map(p => ({ label: p, value: p }))} />
                    </FormField>
                    
                    {formData.paymentType === 'Domiciliado' && (
                        <FormField label="Fecha domiciliación" required>
                            <input type="date" name="domiciliationDate" value={formData.domiciliationDate || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-900" />
                        </FormField>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="¿Cobrado?">
                            <RadioGroup name="status" value={formData.status} onChange={handleChange} options={[{ label: 'Sí', value: 'Cobrado' }, { label: 'No', value: 'Pendiente' }]} />
                        </FormField>
                        {isPaid && (
                             <FormField label="Fecha cobro" required>
                                <input type="date" name="paymentDate" value={formData.paymentDate || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-900" />
                            </FormField>
                        )}
                    </div>
                    
                    <FormField label="¿Cancelado?">
                        <RadioGroup name="isCancelled" value={String(formData.isCancelled)} onChange={handleChange} options={[{ label: 'Sí', value: 'true' }, { label: 'No', value: 'false' }]} />
                    </FormField>
                    
                    <FormField label="Comentario interno">
                        <textarea name="internalComment" value={formData.internalComment || ''} onChange={handleChange} rows={4} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-900" />
                    </FormField>
                </div>
            </div>

            <div className="p-4 bg-gray-100 dark:bg-slate-900/50 flex justify-end gap-4 rounded-b-lg">
                <Button variant="danger" onClick={goBack}>Cancelar</Button>
                <Button onClick={handleSave}>Actualizar</Button>
            </div>
        </div>
    );
};

export default ReceiptEditPage;