
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { Plus, Trash2, Edit, Check, X, MoveLeft, List } from 'lucide-react';
import { LandingCustomField } from '../../types';
import Modal from '../../components/ui/Modal';
import RichTextEditor from '../../components/ui/RichTextEditor';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const LandingPageCustomFieldsPage = () => {
    const { landingId } = useParams();
    const navigate = useNavigate();
    const { landingPages, landingCustomFields, updateLandingCustomField, deleteLandingCustomFields } = useData();
    
    const landing = useMemo(() => landingPages.find(l => l.id === parseInt(landingId || '0')), [landingPages, landingId]);
    
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingField, setEditingField] = useState<LandingCustomField | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fields = useMemo(() => {
        if (!landing) return [];
        return landingCustomFields
            .filter(f => f.landingId === landing.id)
            .filter(f => f.label.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => a.order - b.order);
    }, [landingCustomFields, landing, searchTerm]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(fields.map(f => f.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleOpenModal = (field: LandingCustomField | null) => {
        setEditingField(field);
        setIsModalOpen(true);
    };

    const handleSave = (field: LandingCustomField) => {
        updateLandingCustomField({ ...field, landingId: parseInt(landingId || '0') });
        setIsModalOpen(false);
        setEditingField(null);
    };
    
    const handleDelete = () => {
        deleteLandingCustomFields(selectedIds);
        setSelectedIds([]);
        setIsDeleteConfirmOpen(false);
    };

    if (!landing) return <div>Landing no encontrada</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900 dark:text-white flex items-center gap-2">
                        Campos personalizados de la landing: <span className="underline decoration-blue-500">{landing.title}</span>
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Los campos personalizados se asignarán en el campo "comentario" del alumno que formalice la inscripción.
                    </p>
                </div>
                <span className="font-semibold text-gray-500 dark:text-gray-400">{fields.length} Resultado</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16} />} onClick={() => navigate('/center-management/landing-pages')}>Volver</Button>
                    <Button size="sm" leftIcon={<Plus size={16} />} onClick={() => handleOpenModal(null)}>Alta</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />} disabled={selectedIds.length === 0} onClick={() => setIsDeleteConfirmOpen(true)}>Borrar</Button>
                    
                    <div className="flex-grow"></div>
                    <div className="relative w-64">
                        <input 
                            type="text" 
                            placeholder="Buscar" 
                            className="w-full p-2 pl-8 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 focus:ring-primary-500 focus:border-primary-500" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <table className="min-w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-4 w-10"><input type="checkbox" onChange={handleSelectAll} checked={fields.length > 0 && selectedIds.length === fields.length} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"/></th>
                            <th className="p-4 w-10"></th>
                            <th className="px-6 py-3 font-medium">Etiqueta/Nombre del campo</th>
                            <th className="px-6 py-3 font-medium">Tipo de campo</th>
                            <th className="px-6 py-3 font-medium text-center">¿Obligatorio?</th>
                            <th className="px-6 py-3 font-medium text-center">Items</th>
                            <th className="px-6 py-3 font-medium text-center">¿Activo?</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {fields.map(field => (
                            <tr key={field.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                <td className="p-4"><input type="checkbox" checked={selectedIds.includes(field.id)} onChange={() => handleSelectOne(field.id)} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500" /></td>
                                <td className="p-4">
                                    <button onClick={() => handleOpenModal(field)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800"><Edit size={16}/></button>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{field.label}</td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300 capitalize">{field.type === 'select' ? 'Lista elementos (opción única)' : field.type === 'text' ? 'Texto corto' : field.type}</td>
                                <td className="px-6 py-4 text-center">{field.required ? <Check size={18} className="text-green-600 mx-auto" strokeWidth={3} /> : <X size={18} className="text-red-600 mx-auto" strokeWidth={3} />}</td>
                                <td className="px-6 py-4 text-center text-blue-600 dark:text-blue-400 font-mono text-xs">
                                    {field.type === 'select' && field.options ? (
                                        <div className="flex items-center justify-center gap-1">
                                            <List size={14} /> {field.options.split(',').length}
                                        </div>
                                    ) : '-'}
                                </td>
                                <td className="px-6 py-4 text-center">{field.isActive ? <Check size={18} className="text-green-600 mx-auto" strokeWidth={3} /> : <X size={18} className="text-red-600 mx-auto" strokeWidth={3} />}</td>
                            </tr>
                        ))}
                        {fields.length === 0 && (
                            <tr><td colSpan={7} className="text-center py-8 text-gray-500">No hay campos personalizados configurados.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <ConfirmationModal 
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Borrar Campos"
                message={`¿Estás seguro de borrar ${selectedIds.length} campo(s)?`}
            />

            {isModalOpen && (
                <CustomFieldForm 
                    field={editingField} 
                    landingTitle={landing.title} 
                    onSave={handleSave} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </div>
    );
};

const CustomFieldForm: React.FC<{ field: LandingCustomField | null, landingTitle: string, onSave: (f: LandingCustomField) => void, onClose: () => void }> = ({ field, landingTitle, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<LandingCustomField>>(field || {
        label: '',
        type: 'text',
        required: false,
        order: 0,
        options: '',
        isActive: true,
        description: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };
    
    const handleRichTextChange = (val: string) => {
        setFormData(prev => ({...prev, description: val}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: field?.id || 0, ...formData } as LandingCustomField);
    };

    const inputClasses = "w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500";

    return (
        <Modal isOpen={true} onClose={onClose} title={field ? "Editar Campo" : "Alta de Campo"}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Landing</label>
                    <input disabled value={landingTitle} className="w-full p-2 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md text-gray-600 dark:text-gray-400 cursor-not-allowed" />
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Etiqueta/Nombre del campo</label>
                    <input type="text" name="label" value={formData.label} onChange={handleChange} required className={inputClasses} />
                </div>
                
                <div>
                     <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Descripción o ayuda</label>
                     <RichTextEditor value={formData.description || ''} onChange={handleRichTextChange} rows={3} />
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tipo de campo</label>
                    <select name="type" value={formData.type} onChange={handleChange} className={inputClasses}>
                        <option value="text">Texto corto</option>
                        <option value="textarea">Texto largo</option>
                        <option value="number">Numérico</option>
                        <option value="date">Fecha</option>
                        <option value="select">Lista elementos (opción única)</option>
                        <option value="boolean">Si / No</option>
                    </select>
                </div>
                
                {formData.type === 'select' && (
                     <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Opciones (separadas por comas)</label>
                        <textarea name="options" value={formData.options} onChange={handleChange} rows={2} className={inputClasses} placeholder="Opción 1, Opción 2, Opción 3" />
                    </div>
                )}
                
                <div className="flex gap-8">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">¿Obligatorio?</span>
                        <div className="flex gap-2 ml-2">
                             <label className="flex items-center gap-1 font-normal text-sm"><input type="radio" name="required" checked={formData.required === true} onChange={() => setFormData({...formData, required: true})} className="text-primary-600"/> Sí</label>
                             <label className="flex items-center gap-1 font-normal text-sm"><input type="radio" name="required" checked={formData.required === false} onChange={() => setFormData({...formData, required: false})} className="text-primary-600"/> No</label>
                        </div>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">¿Activo?</span>
                         <div className="flex gap-2 ml-2">
                             <label className="flex items-center gap-1 font-normal text-sm"><input type="radio" name="isActive" checked={formData.isActive === true} onChange={() => setFormData({...formData, isActive: true})} className="text-primary-600"/> Sí</label>
                             <label className="flex items-center gap-1 font-normal text-sm"><input type="radio" name="isActive" checked={formData.isActive === false} onChange={() => setFormData({...formData, isActive: false})} className="text-primary-600"/> No</label>
                        </div>
                    </label>
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Orden</label>
                    <input type="number" name="order" value={formData.order} onChange={handleChange} className="w-24 p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500" />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <Button variant="danger" onClick={onClose} type="button">Cancelar</Button>
                    <Button type="submit">Alta</Button>
                </div>
            </form>
        </Modal>
    );
}

export default LandingPageCustomFieldsPage;
