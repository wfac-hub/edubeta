
import React, { useMemo, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigationHistory } from '../../contexts/NavigationHistoryContext';
import Button from '../../components/ui/Button';
import { MoveLeft, BookOpen, Plus, Trash2, Upload, Image as ImageIcon, Edit, CheckCircle } from 'lucide-react';
import { Role, WikiClass } from '../../types';
import Modal from '../../components/ui/Modal';

const WikiCategoryPage = () => {
    const { categoryId } = useParams();
    const { goBack } = useNavigationHistory();
    const { wikiCategories, wikiClasses, wikiPermissions, updateWikiClass, deleteWikiClasses } = useData();
    const { user } = useAuth();

    // Estados para el modal de creación/edición
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<WikiClass | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const showFeedback = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const category = wikiCategories.find(c => c.id === parseInt(categoryId || '0'));

    const canEditCategory = useMemo(() => {
        if (!category) return false;
        if (user?.role === Role.ADMIN) return true;
        // Check if teacher has permission to EDIT this category
        const perm = wikiPermissions.find(p => 
            p.teacherId === user?.id && 
            p.categoryId === category.id && 
            !p.classId
        );
        return perm?.canEdit || false;
    }, [category, user, wikiPermissions]);

    const visibleClasses = useMemo(() => {
        if (!category) return [];
        const classesInCategory = wikiClasses.filter(c => c.categoryId === category.id);
        
        if (user?.role === Role.ADMIN) return classesInCategory;

        // Check permissions
        const userPermissions = wikiPermissions.filter(p => p.teacherId === user?.id);
        // If they can edit the category, they can see all classes
        const hasCategoryAccess = userPermissions.some(p => p.categoryId === category.id && !p.classId); 
        
        if (hasCategoryAccess) return classesInCategory;

        const allowedClassIds = userPermissions
            .filter(p => p.categoryId === category.id && p.classId)
            .map(p => p.classId);
            
        return classesInCategory.filter(c => allowedClassIds.includes(c.id));
    }, [wikiClasses, category, user, wikiPermissions]);

    const canEditClass = (classId: number) => {
        if (canEditCategory) return true; // Inherit from category
        // Check specific class permission
        const perm = wikiPermissions.find(p => 
            p.teacherId === user?.id && 
            p.classId === classId
        );
        return perm?.canEdit || false;
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveClass = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && category) {
            const isNew = !editingClass;
            updateWikiClass({ 
                id: editingClass ? editingClass.id : 0, 
                categoryId: category.id, 
                name: formData.name, 
                description: formData.description,
                image: formData.image
            });
            setIsModalOpen(false);
            resetForm();
            showFeedback(isNew ? 'Tema creado correctamente' : 'Tema actualizado correctamente');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', image: '' });
        setEditingClass(null);
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (e: React.MouseEvent, wikiClass: WikiClass) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingClass(wikiClass);
        setFormData({ 
            name: wikiClass.name, 
            description: wikiClass.description || '', 
            image: wikiClass.image || '' 
        });
        setIsModalOpen(true);
    };

    const handleDeleteClass = (id: number) => {
        if (confirm('¿Estás seguro de borrar este tema y todas sus lecciones?')) {
            deleteWikiClasses([id]);
            showFeedback('Tema eliminado correctamente');
        }
    };

    if (!category) return <div className="p-8">Categoría no encontrada</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Link to="/wiki/home" className="hover:underline">Wiki</Link> <span>/</span> <span>{category.name}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{category.name}</h1>
                </div>
                <div className="flex gap-2 items-center">
                     {successMsg && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-fade-in bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-md mr-2">
                            <CheckCircle size={16} />
                            {successMsg}
                        </div>
                    )}
                    <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16}/>} onClick={goBack}>Volver</Button>
                    {canEditCategory && (
                        <Button size="sm" leftIcon={<Plus size={16}/>} onClick={openCreateModal}>Nuevo Tema</Button>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                    {visibleClasses.map(wikiClass => {
                        const editable = canEditClass(wikiClass.id);
                        return (
                            <div key={wikiClass.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex justify-between items-center group">
                                <Link to={`/wiki/class/${wikiClass.id}`} className="flex-grow">
                                    <div className="flex items-center gap-3">
                                        {wikiClass.image ? (
                                            <img src={wikiClass.image} alt={wikiClass.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-slate-600" />
                                        ) : (
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg w-12 h-12 flex items-center justify-center">
                                                <BookOpen size={20} />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{wikiClass.name}</h3>
                                            {wikiClass.description && <p className="text-sm text-gray-500 dark:text-gray-400">{wikiClass.description}</p>}
                                        </div>
                                    </div>
                                </Link>
                                {editable && (
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => openEditModal(e, wikiClass)} className="text-gray-400 hover:text-blue-500 p-2" title="Editar tema">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteClass(wikiClass.id)} className="text-gray-400 hover:text-red-500 p-2" title="Borrar tema">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                    {visibleClasses.length === 0 && (
                        <div className="p-8 text-center text-gray-500">No hay temas disponibles en esta categoría.</div>
                    )}
                </div>
            </div>

            {/* Modal de Creación/Edición de Tema */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClass ? "Editar Tema" : "Crear Nuevo Tema"}>
                <form onSubmit={handleSaveClass} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Tema</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-900"
                            placeholder="Ej. Introducción a la Robótica"
                            required
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                        <textarea 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-900"
                            placeholder="Breve descripción de lo que abarca este tema..."
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Imagen del tema (opcional)</label>
                        <div className="flex items-center gap-4">
                            {formData.image ? (
                                <div className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, image: ''})}
                                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md hover:bg-red-600"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center text-gray-400">
                                    <ImageIcon size={20} />
                                </div>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <Button type="button" variant="secondary" size="sm" leftIcon={<Upload size={14} />} onClick={() => fileInputRef.current?.click()}>
                                Subir imagen
                            </Button>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={!formData.name.trim()}>{editingClass ? 'Guardar Cambios' : 'Crear Tema'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default WikiCategoryPage;
