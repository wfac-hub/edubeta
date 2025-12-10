
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { Plus, Trash2, Search, Edit } from 'lucide-react';
import { DefaultConcept } from '../../types';
import Modal from '../../components/ui/Modal';

const ConceptForm: React.FC<{ concept: DefaultConcept | null, onSave: (c: DefaultConcept) => void, onClose: () => void }> = ({ concept, onSave, onClose }) => {
    const [name, setName] = useState(concept?.name || '');
    const [price, setPrice] = useState(concept?.price || 0);
    
    return (
        <form onSubmit={e => { e.preventDefault(); onSave({ id: concept?.id || 0, name, price }); }} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Concepto</label>
                <input type="text" className="w-full p-2 border rounded" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Precio</label>
                <input type="number" step="0.01" className="w-full p-2 border rounded" value={price} onChange={e => setPrice(parseFloat(e.target.value))} required />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={onClose} type="button">Cancelar</Button>
                <Button type="submit">Guardar</Button>
            </div>
        </form>
    )
}

const DefaultConceptsPage = () => {
    const { defaultConcepts, createDefaultConcept, updateDefaultConcept, deleteDefaultConcepts } = useData();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingConcept, setEditingConcept] = useState<DefaultConcept | null>(null);
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredConcepts.map(d => d.id));
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
         if (confirm("¿Borrar conceptos seleccionados?")) {
            deleteDefaultConcepts(selectedIds);
            setSelectedIds([]);
        }
    }
    
    const handleOpenModal = (c: DefaultConcept | null) => {
        setEditingConcept(c);
        setIsModalOpen(true);
    }
    
    const handleSave = (c: DefaultConcept) => {
        if (c.id === 0) createDefaultConcept(c);
        else updateDefaultConcept(c);
        setIsModalOpen(false);
    }

    const inputClasses = "p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500";
    const filteredConcepts = defaultConcepts.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Conceptos por defecto</h1>
                <span className="font-semibold text-gray-500 dark:text-gray-400">{filteredConcepts.length} Resultados</span>
            </div>
             <p className="text-sm text-gray-500 dark:text-gray-400">
                Listado de conceptos por defecto.
                Al dar de alta nuevas líneas de factura se pueden utilizar estos conceptos para rellenar automáticamente las líneas de facturación.
            </p>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <Button variant="secondary" leftIcon={<Plus size={16}/>} onClick={() => handleOpenModal(null)}>Alta</Button>
                        <Button variant="secondary" leftIcon={<Trash2 size={16}/>} disabled={selectedIds.length === 0} onClick={handleDelete}>Borrar</Button>
                    </div>
                    <div className="relative w-64">
                        <input type="text" placeholder="Buscar" className={inputClasses + " w-full pl-4 pr-10"} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <table className="min-w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-4 w-10"><input type="checkbox" onChange={handleSelectAll} checked={filteredConcepts.length > 0 && selectedIds.length === filteredConcepts.length} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-primary-600 focus:ring-primary-500"/></th>
                            <th className="p-4 w-10"></th>
                            <th className="px-6 py-3 font-medium">Concepto</th>
                            <th className="px-6 py-3 font-medium">Precio sin IVA</th>
                            <th className="px-6 py-3 font-medium">Facturas</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                         {filteredConcepts.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="p-4"><input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => handleSelectOne(c.id)} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-primary-600 focus:ring-primary-500"/></td>
                                <td className="p-4 text-center"><button onClick={() => handleOpenModal(c)} className="text-blue-500 hover:text-blue-700"><Edit size={16}/></button></td>
                                <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{c.name}</td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{c.price.toFixed(2)} €</td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">0</td>
                            </tr>
                         ))}
                         {filteredConcepts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">0 Resultados</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingConcept ? "Editar Concepto" : "Nuevo Concepto"}>
                <ConceptForm concept={editingConcept} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default DefaultConceptsPage;
