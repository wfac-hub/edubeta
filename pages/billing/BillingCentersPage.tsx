import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { Plus, Trash2, Edit, Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BillingCenter } from '../../types';

const BillingCentersPage = () => {
    const { billingCenters, updateBillingCenter, deleteBillingCenters } = useData();
    const navigate = useNavigate();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(billingCenters.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleDelete = () => {
        if (confirm('¿Estás seguro de que quieres borrar los centros seleccionados?')) {
            deleteBillingCenters(selectedIds);
            setSelectedIds([]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Centros de facturación</h1>
                <span className="font-semibold text-gray-500 dark:text-gray-400">{billingCenters.length} Resultados</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex gap-2">
                    <Button leftIcon={<Plus size={16} />} onClick={() => navigate('/financial/billing/centers/new')}>Alta</Button>
                    <Button variant="secondary" leftIcon={<Trash2 size={16} />} disabled={selectedIds.length === 0} onClick={handleDelete}>Borrar</Button>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <table className="min-w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-4 w-10"><input type="checkbox" onChange={handleSelectAll} checked={billingCenters.length > 0 && selectedIds.length === billingCenters.length} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"/></th>
                            <th className="px-6 py-3 font-medium">Nombre</th>
                            <th className="px-6 py-3 font-medium">NIF/CIF</th>
                            <th className="px-6 py-3 font-medium text-center">Cuentas</th>
                            <th className="px-6 py-3 font-medium text-center">Series</th>
                            <th className="px-6 py-3 font-medium text-center">Métodos de pago</th>
                            <th className="px-6 py-3 font-medium text-center">¿Factura-E?</th>
                            <th className="px-6 py-3 font-medium text-center">¿Activo?</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {billingCenters.map(center => (
                            <tr key={center.id} className={`hover:bg-gray-50 dark:hover:bg-slate-700/30 ${!center.isActive ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                                <td className="p-4 w-10">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={selectedIds.includes(center.id)} onChange={() => handleSelectOne(center.id)} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500" />
                                        <Link to={`/financial/billing/centers/${center.id}`} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></Link>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    <Link to={`/financial/billing/centers/${center.id}`} className="hover:underline">{center.name}</Link>
                                </td>
                                <td className="px-6 py-4">{center.nif}</td>
                                <td className="px-6 py-4 text-center">
                                    <Link to={`/financial/billing/centers/${center.id}/accounts`} className="text-blue-600 hover:underline font-semibold">{center.bankAccounts?.length || 0}</Link>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Link to={`/financial/billing/centers/${center.id}/series`} className="text-blue-600 hover:underline font-semibold">{center.series?.length || 0}</Link>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Link to={`/financial/billing/centers/${center.id}/methods`} className="text-blue-600 hover:underline font-semibold">{center.paymentMethods?.length || 0}</Link>
                                </td>
                                <td className="px-6 py-4 text-center">{center.isFacturaE ? <Check size={16} className="mx-auto text-green-500" /> : <X size={16} className="mx-auto text-red-500" />}</td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => updateBillingCenter({...center, isActive: !center.isActive})}>
                                        {center.isActive ? <Check size={16} className="mx-auto text-green-500" /> : <X size={16} className="mx-auto text-red-500" />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {billingCenters.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center py-8 text-gray-500">No hay centros de facturación definidos.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BillingCentersPage;