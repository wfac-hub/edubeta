
import React, { useState, useEffect } from 'react';
import { BillingClient } from '../../types';
import Button from '../ui/Button';

interface BillingClientFormProps {
    client: BillingClient | null;
    onSave: (client: BillingClient) => void;
    onClose: () => void;
}

const BillingClientForm: React.FC<BillingClientFormProps> = ({ client, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<BillingClient>>(client || {
        isCompany: false,
        companyName: '',
        firstName: '',
        lastName: '',
        nif: '',
        email: '',
        isActive: true,
        commsAllowed: false,
        sepaSigned: false,
        altaDate: new Date().toISOString().split('T')[0]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData as BillingClient); }} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Tipo de cliente</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2"><input type="radio" name="isCompany" checked={!formData.isCompany} onChange={() => setFormData(p => ({...p, isCompany: false}))} /> Particular</label>
                    <label className="flex items-center gap-2"><input type="radio" name="isCompany" checked={formData.isCompany} onChange={() => setFormData(p => ({...p, isCompany: true}))} /> Empresa</label>
                </div>
            </div>

            {formData.isCompany ? (
                <div>
                    <label className="block text-sm font-medium mb-1">Nombre Empresa</label>
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                         <label className="block text-sm font-medium mb-1">Nombre</label>
                         <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                         <label className="block text-sm font-medium mb-1">Apellidos</label>
                         <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="block text-sm font-medium mb-1">NIF/CIF</label>
                     <input type="text" name="nif" value={formData.nif} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                <div>
                     <label className="block text-sm font-medium mb-1">Email</label>
                     <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
            </div>
            
             <div>
                 <label className="block text-sm font-medium mb-1">Fecha Alta</label>
                 <input type="date" name="altaDate" value={formData.altaDate} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>

            <div className="space-y-2 pt-2 border-t">
                <label className="flex items-center gap-2"><input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} /> Activo</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="sepaSigned" checked={formData.sepaSigned} onChange={handleChange} /> SEPA Firmado</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="commsAllowed" checked={formData.commsAllowed} onChange={handleChange} /> Permite Comunicaciones</label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={onClose} type="button">Cancelar</Button>
                <Button type="submit">Guardar</Button>
            </div>
        </form>
    );
}

export default BillingClientForm;
