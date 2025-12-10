
import React, { useState } from 'react';
import { BillingCenter, BillingPaymentMethod } from '../../types';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { Plus, Trash2, Pencil, CreditCard, Copy, Check, X, CheckCircle } from 'lucide-react';
import Modal from '../../components/ui/Modal';

/**
 * Formulario para crear o editar un método de pago.
 */
const MethodForm: React.FC<{ method: Partial<BillingPaymentMethod> | null, onSave: (m: BillingPaymentMethod) => void, onClose: () => void }> = ({ method, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<BillingPaymentMethod>>(method || { name: '', gatewayType: 'None', isActive: true, icon: 'fa-credit-card' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData(prev => ({ ...prev, [e.target.name]: val }));
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData as BillingPaymentMethod); }} className="space-y-4 text-gray-800 dark:text-gray-200">
            <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600" required />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Tipo de pasarela</label>
                <select name="gatewayType" value={formData.gatewayType} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600">
                    <option value="None">Ninguna (Manual)</option>
                    <option value="Redsys">Redsys (TPV Virtual)</option>
                    <option value="Stripe">Stripe</option>
                    <option value="Paypal">Paypal</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Icono (Clase CSS FontAwesome)</label>
                <input type="text" name="icon" value={formData.icon} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600" />
            </div>
            <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4" />
                <label className="text-sm">¿Activo?</label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={onClose} type="button">Cancelar</Button>
                <Button type="submit">Guardar</Button>
            </div>
        </form>
    );
}

/**
 * Subpágina para gestionar los métodos de pago de un centro.
 * Estilos optimizados para día/noche.
 */
const BillingCenterPaymentMethodsPage: React.FC<{ center: BillingCenter }> = ({ center }) => {
    const { updatePaymentMethod, deletePaymentMethods } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState<BillingPaymentMethod | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const showFeedback = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const methodsList = center.paymentMethods || [];

    /**
     * Guarda los cambios de un método y cierra el modal.
     */
    const handleSave = (method: BillingPaymentMethod) => {
        updatePaymentMethod({ ...method, centerId: center.id });
        setIsModalOpen(false);
        setEditingMethod(null);
        showFeedback(method.id === 0 ? 'Método creado correctamente' : 'Método actualizado correctamente');
    };

    /**
     * Borra los métodos seleccionados.
     */
    const handleDelete = () => {
        if (confirm('¿Borrar métodos seleccionados?')) {
            deletePaymentMethods(selectedIds);
            setSelectedIds([]);
            showFeedback('Métodos eliminados correctamente');
        }
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2"><CreditCard size={24}/> Métodos de pago – {center.name}</h2>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <Button size="sm" variant="secondary" leftIcon={<Plus size={16}/>} onClick={() => { setEditingMethod(null); setIsModalOpen(true); }}>Alta</Button>
                <Button size="sm" variant="secondary" leftIcon={<Copy size={16}/>}>Duplicar</Button>
                <Button size="sm" variant="secondary" leftIcon={<Trash2 size={16}/>} onClick={handleDelete} disabled={selectedIds.length === 0}>Borrar</Button>
                 {successMsg && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-fade-in bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-md ml-2">
                        <CheckCircle size={16} />
                        {successMsg}
                    </div>
                )}
            </div>

            <div className="overflow-x-auto border rounded-lg border-gray-200 dark:border-slate-700">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-slate-700/50 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="p-4 w-10"><input type="checkbox" /></th>
                            <th className="px-6 py-3">Icono</th>
                            <th className="px-6 py-3">Nombre</th>
                            <th className="px-6 py-3">Tipo de pasarela</th>
                            <th className="px-6 py-3">Cobros</th>
                            <th className="px-6 py-3">¿Activo?</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {methodsList.map(m => (
                            <tr key={m.id} className={`hover:bg-gray-50 dark:hover:bg-slate-700/30 ${!m.isActive ? 'bg-red-50 dark:bg-red-900/10' : 'bg-white dark:bg-slate-800'}`}>
                                <td className="p-4 w-10">
                                     <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={selectedIds.includes(m.id)} onChange={() => setSelectedIds(prev => prev.includes(m.id) ? prev.filter(id => id!==m.id) : [...prev, m.id])} />
                                        <button onClick={() => { setEditingMethod(m); setIsModalOpen(true); }}><Pencil size={14} className="text-blue-500 hover:text-blue-700"/></button>
                                     </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-700 dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <CreditCard size={16} />
                                        {m.icon}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{m.name}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{m.gatewayType}</td>
                                <td className="px-6 py-4 text-red-500 font-bold">€ 0</td>
                                <td className="px-6 py-4">{m.isActive ? <Check size={16} className="text-green-500"/> : <X size={16} className="text-red-500"/>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMethod ? 'Editar Método' : 'Nuevo Método'}>
                <MethodForm method={editingMethod} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default BillingCenterPaymentMethodsPage;
