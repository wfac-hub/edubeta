
import React, { useMemo, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigationHistory } from '../../contexts/NavigationHistoryContext';
import Button from '../../components/ui/Button';
import { MoveLeft, FileText, Plus, Edit, Trash2, Upload } from 'lucide-react';
import { Role } from '../../types';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const WikiClassPage = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const { wikiClasses, wikiCategories, wikiLessons, wikiPermissions, deleteWikiLessons, updateWikiLesson } = useData();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState<number | null>(null);

    const wikiClass = wikiClasses.find(c => c.id === parseInt(classId || '0'));
    const category = wikiCategories.find(c => c.id === wikiClass?.categoryId);

    const canEdit = useMemo(() => {
        if (!wikiClass) return false;
        if (user?.role === Role.ADMIN) return true;
        
        // Check if teacher has edit permission for this category OR this specific class
        const perm = wikiPermissions.find(p => 
            p.teacherId === user?.id && (
                (p.categoryId === wikiClass.categoryId && !p.classId) || // Full category edit
                (p.classId === wikiClass.id) // Specific class edit
            )
        );
        return perm?.canEdit || false;
    }, [user, wikiClass, wikiPermissions]);

    const visibleLessons = useMemo(() => {
        if (!wikiClass) return [];
        return wikiLessons.filter(l => l.classId === wikiClass.id);
    }, [wikiLessons, wikiClass]);

    const handleDeleteClick = (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        e.stopPropagation();
        setLessonToDelete(id);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (lessonToDelete) {
            deleteWikiLessons([lessonToDelete]);
            setLessonToDelete(null);
            setIsDeleteConfirmOpen(false);
        }
    };
    
    const handleImportLesson = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !wikiClass) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                
                // Basic validation
                if (!json.title || !Array.isArray(json.blocks)) {
                    alert("El archivo seleccionado no tiene un formato válido de lección.");
                    return;
                }

                updateWikiLesson({
                    id: 0, // New ID for imported lesson
                    classId: wikiClass.id,
                    categoryId: wikiClass.categoryId,
                    title: `${json.title} (Importada)`,
                    blocks: json.blocks,
                    isVisible: false, // Default to hidden
                    content: '',
                    attachments: []
                });
                
                alert("Lección importada correctamente.");
            } catch (err) {
                console.error(err);
                alert("Error al importar la lección. Comprueba que el archivo es un JSON válido.");
            } finally {
                 // Reset input
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    if (!wikiClass || !category) return <div className="p-8">Tema no encontrado</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Link to="/wiki/home" className="hover:underline">Wiki</Link> <span>/</span> 
                        <Link to={`/wiki/category/${category.id}`} className="hover:underline">{category.name}</Link> <span>/</span>
                        <span>{wikiClass.name}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{wikiClass.name}</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16}/>} onClick={goBack}>Volver</Button>
                    {canEdit && (
                        <>
                            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportLesson} />
                            <Button variant="secondary" size="sm" leftIcon={<Upload size={16}/>} onClick={() => fileInputRef.current?.click()}>Importar JSON</Button>
                            <Button size="sm" leftIcon={<Plus size={16}/>} onClick={() => navigate(`/wiki/editor?classId=${wikiClass.id}`)}>Nueva Lección</Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {visibleLessons.map(lesson => (
                    <div key={lesson.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex justify-between items-center group hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                        <Link to={`/wiki/lesson/${lesson.id}`} className="flex-grow flex items-center gap-4">
                            <div className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                    {lesson.title}
                                </h3>
                                <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                    {lesson.attachments && lesson.attachments.length > 0 && (
                                        <span>📎 {lesson.attachments.length} adjuntos</span>
                                    )}
                                    {!lesson.isVisible && <span className="text-red-500 bg-red-50 dark:bg-red-900/20 px-1 rounded">Oculto</span>}
                                </div>
                            </div>
                        </Link>
                        
                        <div className="flex gap-2 items-center">
                            {canEdit && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                                    <Button variant="ghost" size="sm" onClick={() => navigate(`/wiki/editor/${lesson.id}`)} title="Editar">
                                        <Edit size={16}/>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={(e) => handleDeleteClick(e, lesson.id)} title="Borrar">
                                        <Trash2 size={16}/>
                                    </Button>
                                </div>
                            )}
                            <Link to={`/wiki/lesson/${lesson.id}`}>
                                <Button size="sm" variant="secondary">Ver</Button>
                            </Link>
                        </div>
                    </div>
                ))}
                {visibleLessons.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-700">
                        <p className="text-gray-500">No hay lecciones en este tema aún.</p>
                        {canEdit && <Button variant="ghost" className="mt-4" onClick={() => navigate(`/wiki/editor?classId=${wikiClass.id}`)}>Crear primera lección</Button>}
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Borrar Lección"
                message="¿Estás seguro de que quieres borrar esta lección? Esta acción no se puede deshacer."
                confirmText="Borrar Lección"
            />
        </div>
    );
};

export default WikiClassPage;
