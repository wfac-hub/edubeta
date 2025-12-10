
import React, { useState, useEffect } from 'react';
import { BillingCenter } from '../../types';
import Button from '../ui/Button';
import { Save } from 'lucide-react';

interface BillingCenterFormProps {
    center: Partial<BillingCenter>;
    onSave: (center: BillingCenter) => void;
}

const BillingCenterForm: React.FC<BillingCenterFormProps> = ({ center, onSave }) => {
    const [formData, setFormData] = useState<Partial<BillingCenter>>({});

    useEffect(() => {
        // Ensure we strip out nested arrays for the form to prevent confusion, 
        // though the main issue is dataService not stripping them before DB insert.
        // We also handle this here to be safe.
        const { bankAccounts, series, paymentMethods, ...cleanCenter } = center;
        setFormData(cleanCenter);
    }, [center]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let val: any = value;
        if (type === 'number') val = parseFloat(value);
        if (type === 'checkbox') val = (e.target as HTMLInputElement).checked;
        
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // We make sure to not include nested arrays to avoid issues with Supabase insertion logic for parent table
        // However, we cast it to BillingCenter type for TS satisfaction
        const { bankAccounts, series, paymentMethods, ...cleanData } = formData as BillingCenter;
        onSave(cleanData as BillingCenter);
    };

    const inputClasses = "mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white p-2 border";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className={labelClasses}>Nombre interno*</label>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className={inputClasses} />
                </div>
                
                <div>
                    <label className={labelClasses}>NIF/CIF*</label>
                    <input type="text" name="nif" value={formData.nif || ''} onChange={handleChange} required className={inputClasses} />
                </div>
                
                <div>
                    <label className={labelClasses}>Email</label>
                    <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className={inputClasses} />
                </div>

                <div className="md:col-span-2">
                    <label className={labelClasses}>Dirección</label>
                    <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className={inputClasses} />
                </div>

                <div>
                    <label className={labelClasses}>Población</label>
                    <input type="text" name="population" value={formData.population || ''} onChange={handleChange} className={inputClasses} />
                </div>

                <div>
                    <label className={labelClasses}>Código Postal</label>
                    <input type="text" name="postalCode" value={formData.postalCode || ''} onChange={handleChange} className={inputClasses} />
                </div>

                <div>
                    <label className={labelClasses}>Teléfono</label>
                    <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className={inputClasses} />
                </div>

                <div>
                    <label className={labelClasses}>Web</label>
                    <input type="url" name="web" value={formData.web || ''} onChange={handleChange} className={inputClasses} />
                </div>

                 <div>
                    <label className={labelClasses}>% IRPF</label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                        <input type="number" name="irpfPercent" value={formData.irpfPercent || 0} onChange={handleChange} className={inputClasses} />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                    </div>
                </div>

                 <div>
                    <label className={labelClasses}>% IVA por defecto</label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                        <input type="number" name="ivaPercent" value={formData.ivaPercent || 0} onChange={handleChange} className={inputClasses} />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center">
                    <input
                        id="isFacturaE"
                        name="isFacturaE"
                        type="checkbox"
                        checked={formData.isFacturaE || false}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="isFacturaE" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                        Activar Factura-E
                    </label>
                </div>
                
                 <div className="flex items-center">
                    <input
                        id="isActive"
                        name="isActive"
                        type="checkbox"
                        checked={formData.isActive !== false}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                        Centro activo
                    </label>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-slate-700">
                <Button type="submit" leftIcon={<Save size={16} />}>Guardar cambios</Button>
            </div>
        </form>
    );
};

export default BillingCenterForm;
