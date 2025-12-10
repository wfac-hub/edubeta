
import React, { useMemo, useState, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Library, ArrowRight, Plus, Trash2, Upload, Image as ImageIcon, Edit, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Role, WikiCategory } from '../../types';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const WikiHomePage = () => {
    const { wikiCategories, wikiPermissions, updateWikiCategory, deleteWikiCategories } = useData();
    const { user } = useAuth();

    // Estados para el modal de creación/edición
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<WikiCategory | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: ''
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estados para borrado
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

    const showFeedback = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const visibleCategories = useMemo(() => {
        if (user?.role === Role.ADMIN) return wikiCategories;
        
        // Filter by permissions for teachers
        const allowedCategoryIds = wikiPermissions
            .filter(p => p.teacherId === user?.id && (p.categoryId || p.classId || p.lessonId))
            .map(p => p.categoryId);
            
        return wikiCategories.filter(c => allowedCategoryIds.includes(c.id));
    }, [wikiCategories, wikiPermissions, user]);

    const canEditCategory = (categoryId: number) => {
        if (user?.role === Role.ADMIN) return true;
        // Check if teacher has specific edit permission for this category (classId undefined/null)
        const perm = wikiPermissions.find(p => 
            p.teacherId === user?.id && 
            p.categoryId === categoryId && 
            !p.classId
        );
        return perm?.canEdit || false;
    };

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

    const handleSaveCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name.trim()) {
            const isNew = !editingCategory;
            updateWikiCategory({ 
                id: editingCategory ? editingCategory.id : 0, 
                name: formData.name, 
                description: formData.description,
                image: formData.image
            });
            setIsModalOpen(false);
            resetForm();
            showFeedback(isNew ? 'Categoría creada correctamente' : 'Categoría actualizada correctamente');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', image: '' });
        setEditingCategory(null);
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (e: React.MouseEvent, category: WikiCategory) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            image: category.image || ''
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (e: React.MouseEvent, id: number) => {
        e.preventDefault(); // Evitar navegación del Link
        e.stopPropagation();
        setCategoryToDelete(id);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (categoryToDelete) {
            deleteWikiCategories([categoryToDelete]);
            setCategoryToDelete(null);
            setIsDeleteConfirmOpen(false);
            showFeedback('Categoría eliminada correctamente');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Library /> Wiki Académica
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Biblioteca de contenidos y recursos pedagógicos.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                     {successMsg && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-fade-in bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-md">
                            <CheckCircle size={16} />
                            {successMsg}
                        </div>
                    )}
                    {user?.role === Role.ADMIN && (
                        <Button leftIcon={<Plus size={16}/>} onClick={openCreateModal}>Nueva Categoría</Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleCategories.map(category => (
                    <Link to={`/wiki/category/${category.id}`} key={category.id} className="group block h-full">
                        <Card className="h-full hover:shadow-md transition-shadow border-l-4 border-primary-500 flex flex-col overflow-hidden">
                            {category.image && (
                                <div className="h-32 w-full overflow-hidden rounded-t-md mb-4 -mt-6 -mx-6 relative">
                                    <img src={category.image} alt={category.name} className="w-full h-full object-cover absolute inset-0" style={{ width: 'calc(100% + 48px)' }} />
                                </div>
                            )}
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                    {category.name}
                                </h3>
                                {/* Show actions if Admin OR Teacher has specific edit permission */}
                                {(user?.role === Role.ADMIN || canEditCategory(category.id)) && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => openEditModal(e, category)}
                                            className="text-gray-400 hover:text-blue-500 p-1"
                                            title="Editar categoría"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        {user?.role === Role.ADMIN && (
                                            <button 
                                                onClick={(e) => handleDeleteClick(e, category.id)} 
                                                className="text-gray-400 hover:text-red-500 p-1"
                                                title="Borrar categoría"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 line-clamp-3 flex-grow">
                                {category.description || 'Sin descripción.'}
                            </p>
                            <div className="mt-4 flex justify-end">
                                <span className="text-primary-500 text-sm flex items-center gap-1 font-medium">
                                    Ver temas <ArrowRight size={14} />
                                </span>
                            </div>
                        </Card>
                    </Link>
                ))}
                {visibleCategories.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-300 dark:border-slate-700">
                        No tienes acceso a ninguna categoría o no existen categorías aún.
                    </div>
                )}
            </div>

            {/* Modal Crear/Editar Categoría */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? "Editar Categoría" : "Nueva Categoría"}>
                <form onSubmit={handleSaveCategory} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Categoría</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-900"
                            placeholder="Ej. Robótica, Programación..."
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
                            placeholder="Descripción breve de los contenidos..."
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Imagen de portada (opcional)</label>
                        <div className="flex items-center gap-4">
                            {formData.image ? (
                                <div className="relative w-32 h-20 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
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
                                <div className="w-32 h-20 bg-gray-100 dark:bg-slate-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center text-gray-400">
                                    <ImageIcon size={24} />
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
                        <Button type="submit" disabled={!formData.name.trim()}>{editingCategory ? 'Guardar Cambios' : 'Crear'}</Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Confirmar Borrado */}
            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Borrar Categoría"
                message="¿Estás seguro de que quieres borrar esta categoría? Se eliminarán también todos los temas y lecciones contenidos en ella."
                confirmText="Borrar Categoría"
            />
        </div>
    );
};

export default WikiHomePage;
