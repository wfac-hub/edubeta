
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { FileText, Plus, Trash2, Edit, Lock, HelpCircle } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import RichTextEditor from '../../components/ui/RichTextEditor';
import { EmailTemplate } from '../../types';

const EmailTemplatesPage = () => {
    const { emailTemplates, updateEmailTemplate, deleteEmailTemplates } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Partial<EmailTemplate>>({});
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleOpenModal = (template?: EmailTemplate) => {
        if (template) {
            setEditingTemplate(template);
        } else {
            setEditingTemplate({
                name: '',
                subject: '',
                body: '',
                variables: []
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const templateToSave = {
            id: editingTemplate.id || 0,
            name: editingTemplate.name || '',
            subject: editingTemplate.subject || '',
            body: editingTemplate.body || '',
            systemSlug: editingTemplate.systemSlug,
            variables: editingTemplate.variables || []
        };
        updateEmailTemplate(templateToSave);
        setIsModalOpen(false);
    };

    const handleDelete = (id: number) => {
        const template = emailTemplates.find(t => t.id === id);
        if (template?.systemSlug) {
            alert("No se pueden borrar plantillas de sistema.");
            return;
        }
        if (confirm("¿Estás seguro de borrar esta plantilla?")) {
            deleteEmailTemplates([id]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <FileText className="text-primary-600" /> Plantillas de Email
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configura los textos para envíos automáticos y manuales.</p>
                </div>
                <Button leftIcon={<Plus size={16}/>} onClick={() => handleOpenModal()}>Nueva Plantilla</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {emailTemplates.map(template => (
                    <div key={template.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-md ${template.systemSlug ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'}`}>
                                    {template.systemSlug ? <Lock size={20}/> : <FileText size={20}/>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{template.name}</h3>
                                    {template.systemSlug && <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">Sistema</span>}
                                </div>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Asunto:</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{template.subject}</p>
                        </div>

                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                             <Button size="sm" variant="ghost" onClick={() => handleOpenModal(template)} leftIcon={<Edit size={14}/>}>Editar</Button>
                             {!template.systemSlug && (
                                 <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(template.id)} leftIcon={<Trash2 size={14}/>}>Borrar</Button>
                             )}
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTemplate.id ? "Editar Plantilla" : "Nueva Plantilla"}>
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre interno</label>
                            <input 
                                type="text" 
                                value={editingTemplate.name} 
                                onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                                className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600"
                                required
                                disabled={!!editingTemplate.systemSlug}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asunto del email</label>
                            <input 
                                type="text" 
                                value={editingTemplate.subject} 
                                onChange={e => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                                className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cuerpo del mensaje</label>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                <HelpCircle size={12}/> Variables disponibles: {editingTemplate.variables?.join(', ') || '#{STUDENT_NAME}#'}
                            </div>
                        </div>
                        <RichTextEditor value={editingTemplate.body || ''} onChange={val => setEditingTemplate({...editingTemplate, body: val})} rows={10} />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit">Guardar Plantilla</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default EmailTemplatesPage;
