
import React, { useState } from 'react';
import { BillingCenter, BankAccount } from '../../types';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { Plus, Trash2, Pencil, Landmark, CheckCircle } from 'lucide-react';
import Modal from '../../components/ui/Modal';

/**
 * Formulario para crear o editar una cuenta bancaria.
 */
const AccountForm: React.FC<{ account: Partial<BankAccount> | null, onSave: (a: BankAccount) => void, onClose: () => void }> = ({ account, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<BankAccount>>(account || { name: '', iban: '', bic: '', suffix: '', bank: '', isDefault: false });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData(prev => ({ ...prev, [e.target.name]: val }));
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData as BankAccount); }} className="space-y-4 text-gray-800 dark:text-gray-200">
            <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600" required />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">IBAN</label>
                <input type="text" name="iban" value={formData.iban} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">BIC</label>
                    <input type="text" name="bic" value={formData.bic} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Sufijo</label>
                    <input type="text" name="suffix" value={formData.suffix} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600" />
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium mb-1">Banco</label>
                <input type="text" name="bank" value={formData.bank} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600" />
            </div>
            <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} className="h-4 w-4" />
                <label className="text-sm">Cuenta por defecto</label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={onClose} type="button">Cancelar</Button>
                <Button type="submit">Guardar</Button>
            </div>
        </form>
    );
}

/**
 * Subpágina para gestionar las cuentas bancarias de un centro de facturación.
 * Estilos optimizados para día/noche.
 */
const BillingCenterAccountsPage: React.FC<{ center: BillingCenter }> = ({ center }) => {
    const { updateBankAccount, deleteBankAccounts } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const showFeedback = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const accountsList = center.bankAccounts || [];

    /**
     * Guarda una cuenta nueva o actualizada.
     */
    const handleSave = (account: BankAccount) => {
        updateBankAccount({ ...account, centerId: center.id });
        setIsModalOpen(false);
        setEditingAccount(null);
        showFeedback(account.id === 0 ? 'Cuenta creada correctamente' : 'Cuenta actualizada correctamente');
    };

    /**
     * Borra las cuentas seleccionadas.
     */
    const handleDelete = () => {
        if (confirm('¿Borrar cuentas seleccionadas?')) {
            deleteBankAccounts(selectedIds);
            setSelectedIds([]);
            showFeedback('Cuentas eliminadas correctamente');
        }
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2"><Landmark size={24}/> Cuentas bancarias – {center.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cuentas bancarias utilizadas para las domiciliaciones de recibos.</p>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <Button size="sm" variant="secondary" leftIcon={<Plus size={16}/>} onClick={() => { setEditingAccount(null); setIsModalOpen(true); }}>Alta</Button>
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
                            <th className="px-6 py-3">Nombre</th>
                            <th className="px-6 py-3">IBAN</th>
                            <th className="px-6 py-3">BIC</th>
                            <th className="px-6 py-3">Remesas recibos</th>
                            <th className="px-6 py-3">Remesas facturas</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {accountsList.map(acc => (
                            <tr key={acc.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 bg-white dark:bg-slate-800">
                                <td className="p-4 w-10">
                                     <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={selectedIds.includes(acc.id)} onChange={() => setSelectedIds(prev => prev.includes(acc.id) ? prev.filter(id => id!==acc.id) : [...prev, acc.id])} />
                                        <button onClick={() => { setEditingAccount(acc); setIsModalOpen(true); }}><Pencil size={14} className="text-blue-500 hover:text-blue-700"/></button>
                                     </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 uppercase">{acc.name}</td>
                                <td className="px-6 py-4 font-mono text-gray-800 dark:text-gray-200">{acc.iban}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{acc.bic}</td>
                                <td className="px-6 py-4"><span className="text-blue-500 cursor-pointer hover:underline font-semibold">0</span></td>
                                <td className="px-6 py-4"><span className="text-red-500 cursor-pointer hover:underline font-semibold">0</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}>
                <AccountForm account={editingAccount} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default BillingCenterAccountsPage;
