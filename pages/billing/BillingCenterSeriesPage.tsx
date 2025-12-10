
import React, { useState } from 'react';
import { BillingCenter, BillingSeries } from '../../types';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { Plus, Trash2, Pencil, Check, X, Scale, CheckCircle } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { Link } from 'react-router-dom';

/**
 * Formulario para crear o editar una serie de facturación.
 */
const SeriesForm: React.FC<{ series: Partial<BillingSeries> | null, onSave: (s: BillingSeries) => void, onClose: () => void }> = ({ series, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<BillingSeries>>(series || { year: new Date().getFullYear(), code: '', isRectifying: false, isActive: true });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        let val: any = value;
        if (type === 'checkbox') val = checked;
        else if (type === 'number' || name === 'year') val = parseInt(value, 10);

        setFormData(prev => ({ ...prev, [name]: val }));
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData as BillingSeries); }} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Año</label>
                <input type="number" name="year" value={formData.year} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600" required />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Código</label>
                <input type="text" name="code" value={formData.code} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600" required />
            </div>
            <div className="flex items-center gap-2">
                <input type="checkbox" name="isRectifying" checked={formData.isRectifying} onChange={handleChange} className="h-4 w-4" />
                <label className="text-sm text-gray-800 dark:text-gray-200">¿Rectificativa?</label>
            </div>
            <div className="flex items-center gap-2">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4" />
                <label className="text-sm text-gray-800 dark:text-gray-200">¿Activa?</label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={onClose} type="button">Cancelar</Button>
                <Button type="submit">Guardar</Button>
            </div>
        </form>
    );
}

/**
 * Componente de subpágina para gestionar las series de facturación de un centro.
 * Estilos optimizados para día/noche.
 */
export default function BillingCenterSeriesPage({ center }: { center: BillingCenter }) {
    const { updateBillingSeries, deleteBillingSeries, invoices } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSeries, setEditingSeries] = useState<BillingSeries | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const showFeedback = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const seriesList = center.series || [];

    /**
     * Guarda los cambios de una serie y cierra el modal.
     */
    const handleSave = (series: BillingSeries) => {
        updateBillingSeries({ ...series, centerId: center.id });
        setIsModalOpen(false);
        setEditingSeries(null);
        showFeedback(series.id === 0 ? 'Serie creada correctamente' : 'Serie actualizada correctamente');
    };

    /**
     * Borra las series seleccionadas.
     */
    const handleDelete = () => {
        if (confirm('¿Borrar series seleccionadas?')) {
            deleteBillingSeries(selectedIds);
            setSelectedIds([]);
            showFeedback('Series eliminadas correctamente');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2"><Scale size={24}/> Series de facturación – {center.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Series que se utilizan para la facturación. Cada año se genera una nueva automáticamente.</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs text-blue-800 dark:text-blue-200 max-w-md">
                    <strong>Acciones automáticas:</strong>
                    <ul className="list-disc pl-4 mt-1">
                        <li>Cada 1 de enero se darán de alta las series necesarias.</li>
                        <li>Cada 1 de febrero se darán de baja las series antiguas.</li>
                    </ul>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <Button size="sm" variant="secondary" leftIcon={<Plus size={16}/>} onClick={() => { setEditingSeries(null); setIsModalOpen(true); }}>Alta</Button>
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
                            <th className="px-6 py-3">Año</th>
                            <th className="px-6 py-3">Código</th>
                            <th className="px-6 py-3 text-center">¿Rectificativa?</th>
                            <th className="px-6 py-3 text-center">Facturas</th>
                            <th className="px-6 py-3 text-center">Presupuestos</th>
                            <th className="px-6 py-3 text-center">¿Activa?</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {seriesList.map(s => {
                            const invoiceCount = invoices.filter(i => i.series === s.code).length;
                            
                            return (
                                <tr key={s.id} className={`hover:bg-gray-50 dark:hover:bg-slate-700/30 ${!s.isActive ? 'bg-red-50 dark:bg-red-900/10' : 'bg-white dark:bg-slate-800'}`}>
                                    <td className="p-4 w-10">
                                         <div className="flex items-center gap-2">
                                            <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => setSelectedIds(prev => prev.includes(s.id) ? prev.filter(id => id!==s.id) : [...prev, s.id])} />
                                            <button onClick={() => { setEditingSeries(s); setIsModalOpen(true); }}><Pencil size={14} className="text-blue-500 hover:text-blue-700"/></button>
                                         </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200">{s.year}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{s.code}</td>
                                    <td className="px-6 py-4 text-center">{s.isRectifying ? <Check size={16} className="mx-auto text-green-500"/> : <X size={16} className="mx-auto text-red-500"/>}</td>
                                    <td className="px-6 py-4 text-center">
                                        <Link to={`/financial/billing/invoices?series=${s.code}`} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                                            {invoiceCount}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-center text-blue-600 dark:text-blue-400 cursor-pointer hover:underline font-semibold">{s.budgetCount}</td>
                                    <td className="px-6 py-4 text-center">{s.isActive ? <Check size={16} className="mx-auto text-green-500"/> : <X size={16} className="mx-auto text-red-500"/>}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSeries ? 'Editar Serie' : 'Nueva Serie'}>
                <SeriesForm series={editingSeries} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};
