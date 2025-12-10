import React, { useState, useEffect } from 'react';
import { CourseLevel } from '../../types';
import Button from '../ui/Button';

interface CourseLevelFormProps {
    level: CourseLevel | null;
    groupId: number;
    onSave: (level: CourseLevel) => void;
    onClose: () => void;
}

const FormSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg">
        <h3 className="text-md font-semibold text-gray-800 dark:text-white px-6 py-3 border-b border-gray-200 dark:border-slate-700">
            {title}
        </h3>
        <div className="p-6 space-y-4">{children}</div>
    </div>
);

const PriceField: React.FC<{
    label: string;
    priceName: keyof CourseLevel;
    allowName: keyof CourseLevel;
    formData: Omit<CourseLevel, 'id'>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, priceName, allowName, formData, handleChange }) => (
    <div className="flex items-center gap-4">
        <label htmlFor={allowName as string} className="flex items-center text-sm font-medium w-40">
            <input
                type="checkbox"
                name={allowName as string}
                id={allowName as string}
                checked={formData[allowName] as boolean}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2">{label}</span>
        </label>
        <div className="relative flex-grow">
            <input
                type="number"
                step="0.01"
                name={priceName as string}
                id={priceName as string}
                value={formData[priceName] as number}
                onChange={handleChange}
                disabled={!formData[allowName]}
                className="w-full p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-slate-800"
            />
             <span className="absolute inset-y-0 right-3 flex items-center text-gray-500">€</span>
        </div>
    </div>
);


const CourseLevelForm: React.FC<CourseLevelFormProps> = ({ level, groupId, onSave, onClose }) => {
    const getInitialState = (): Omit<CourseLevel, 'id'> => ({
        groupId: groupId,
        name: '',
        monthlyPrice: 0,
        quarterlyPrice: 0,
        singlePrice: 0,
        materialPrice: 0,
        enrollmentPrice: 0,
        reportType: 'Informe',
        isActive: true,
        order: 10,
        allowMonthlyPayment: true,
        allowQuarterlyPayment: false,
        allowSinglePayment: false,
    });
    
    const [formData, setFormData] = useState<Omit<CourseLevel, 'id'>>(level || getInitialState());

    useEffect(() => {
        if (level) {
            // Ensure all properties are present, falling back to defaults if not
            setFormData({ ...getInitialState(), ...level });
        } else {
            setFormData(getInitialState());
        }
    }, [level, groupId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (type === 'checkbox') {
             if (name.startsWith('allow')) {
                const priceField = name.replace('allow', '').replace('Payment', 'Price').toLowerCase() as keyof Omit<CourseLevel, 'id'>;
                setFormData(prev => ({
                    ...prev,
                    [name]: checked,
                    [priceField]: checked ? prev[priceField] : 0,
                }));
            } else {
                 setFormData(prev => ({ ...prev, [name]: checked }));
            }
        } else {
            const isNumeric = ['monthlyPrice', 'quarterlyPrice', 'singlePrice', 'materialPrice', 'enrollmentPrice', 'order'].includes(name);
            setFormData(prev => ({ 
                ...prev, 
                [name]: isNumeric ? parseFloat(value) || 0 : value 
            }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const levelToSave: CourseLevel = {
            id: level?.id || 0,
            ...formData,
        };
        onSave(levelToSave);
    };

    const inputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 focus:ring-primary-500 focus:border-primary-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="max-h-[65vh] overflow-y-auto pr-4 -mr-4 space-y-6 custom-scrollbar">
                <FormSection title="Datos Generales">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputClasses}/>
                        </div>
                        <div>
                            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo Informe</label>
                            <input type="text" name="reportType" id="reportType" value={formData.reportType} onChange={handleChange} className={inputClasses}/>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div>
                            <label htmlFor="order" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Orden</label>
                            <input type="number" name="order" id="order" value={formData.order} onChange={handleChange} className={inputClasses}/>
                        </div>
                        <div className="flex items-center mt-6">
                            <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500"/>
                            <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">¿Activo?</label>
                        </div>
                    </div>
                </FormSection>

                <FormSection title="Precios">
                    <div className="space-y-4">
                        <PriceField label="Pago mensual" priceName="monthlyPrice" allowName="allowMonthlyPayment" formData={formData} handleChange={handleChange} />
                        <PriceField label="Pago trimestral" priceName="quarterlyPrice" allowName="allowQuarterlyPayment" formData={formData} handleChange={handleChange} />
                        <PriceField label="Pago único" priceName="singlePrice" allowName="allowSinglePayment" formData={formData} handleChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-slate-700">
                        <div>
                            <label htmlFor="materialPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Material</label>
                            <div className="relative">
                                <input type="number" step="0.01" name="materialPrice" id="materialPrice" value={formData.materialPrice} onChange={handleChange} className={`${inputClasses} pr-8`}/>
                                <span className="absolute inset-y-0 right-3 flex items-center text-gray-500">€</span>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="enrollmentPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Matrícula</label>
                            <div className="relative">
                                <input type="number" step="0.01" name="enrollmentPrice" id="enrollmentPrice" value={formData.enrollmentPrice} onChange={handleChange} className={`${inputClasses} pr-8`}/>
                                <span className="absolute inset-y-0 right-3 flex items-center text-gray-500">€</span>
                            </div>
                        </div>
                    </div>
                </FormSection>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-slate-700 -mx-6 -mb-6 px-6 pb-4 bg-gray-50 dark:bg-slate-800 rounded-b-lg sticky bottom-0">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit">{level ? 'Actualizar' : 'Crear Nivel'}</Button>
            </div>
        </form>
    );
};

export default CourseLevelForm;