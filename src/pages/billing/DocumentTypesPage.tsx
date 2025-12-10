
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { Plus, Trash2, Search, Edit } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import SimpleNameForm from '../../components/forms/SimpleNameForm';
import { DocumentType } from '../../types';

const DocumentTypesPage = () => {
    const { documentTypes, createDocumentType, updateDocumentType, deleteDocumentTypes } = useData();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDocType, setEditingDocType] = useState<DocumentType | null>(null);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(documentTypes.map(d => d.id));
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
        if (confirm("¿Borrar tipos seleccionados?")) {
            deleteDocumentTypes(selectedIds);
            setSelectedIds([]);
        }
    };
    
    const handleOpenModal = (dt: DocumentType | null) => {
        setEditingDocType(dt);
        setIsModalOpen(true);
    }
    
    const handleSave = (name: string) => {
        if (editingDocType) {
            updateDocumentType({ ...editingDocType, name });
        } else {
            createDocumentType({ id: 0, name });
        }
        setIsModalOpen(false);
    }

    const inputClasses = "p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500";
    
    const filteredTypes = documentTypes.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tipos de documento</h1>
                <span className="font-semibold text-gray-500 dark:text-gray-400">{filteredTypes.length} Resultados</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <Button variant="secondary" leftIcon={<Plus size={16}/>} onClick={() => handleOpenModal(null)}>Alta</Button>
                        <Button variant="secondary" leftIcon={<Trash2 size={16}/>} disabled={selectedIds.length === 0} onClick={handleDelete}>Borrar</Button>
                    </div>
                    <div className="relative w-64">
                        <input type="text" placeholder="Buscar" className={inputClasses + " w-full pl-4 pr-10"} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <table className="min-w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-4 w-10"><input type="checkbox" onChange={handleSelectAll} checked={filteredTypes.length > 0 && selectedIds.length === filteredTypes.length} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-primary-600 focus:ring-primary-500"/></th>
                            <th className="px-6 py-3 w-20"></th>
                            <th className="px-6 py-3 font-medium">Nombre</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                         {filteredTypes.map(dt => (
                            <tr key={dt.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="p-4"><input type="checkbox" checked={selectedIds.includes(dt.id)} onChange={() => handleSelectOne(dt.id)} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-primary-600 focus:ring-primary-500"/></td>
                                <td className="px-6 py-4 text-center"><button onClick={() => handleOpenModal(dt)} className="text-blue-500 hover:text-blue-700"><Edit size={16}/></button></td>
                                <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{dt.name}</td>
                            </tr>
                         ))}
                        {filteredTypes.length === 0 && (
                            <tr>
                                <td colSpan={3} className="text-center py-10 text-gray-500 dark:text-gray-400">0 Resultados</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDocType ? "Editar Tipo" : "Nuevo Tipo de Documento"}>
                <SimpleNameForm 
                    initialValue={editingDocType?.name || ''} 
                    onSave={handleSave} 
                    onClose={() => setIsModalOpen(false)} 
                    label="Nombre del tipo de documento"
                />
            </Modal>
        </div>
    );
};

export default DocumentTypesPage;
