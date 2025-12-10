
import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useNavigationHistory } from '../../contexts/NavigationHistoryContext';
import Button from '../../components/ui/Button';
import { MoveLeft, Edit, Download, Trash2 } from 'lucide-react';
import { Role, QuizBlockContent } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { ImageBlockView, QuizBlockView, TextBlockView, VideoBlockView } from '../../components/wiki/WikiBlockViewers';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { sanitizeHTML } from '../../utils/helpers';

// --- Main Page ---

const WikiLessonViewPage = () => {
    const { lessonId } = useParams();
    const { goBack } = useNavigationHistory();
    const navigate = useNavigate();
    const { wikiLessons, wikiClasses, wikiCategories, wikiPermissions, deleteWikiLessons } = useData();
    const { user } = useAuth();

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);

    const lesson = wikiLessons.find(l => l.id === parseInt(lessonId || '0'));
    const wikiClass = wikiClasses.find(c => c.id === lesson?.classId);
    const category = wikiCategories.find(c => c.id === wikiClass?.categoryId);

    const canEdit = useMemo(() => {
        if (!wikiClass) return false;
        if (user?.role === Role.ADMIN) return true;
        
        // Check permission: Category Edit OR Class Edit
        const perm = wikiPermissions.find(p => 
            p.teacherId === user?.id && (
                (p.categoryId === wikiClass.categoryId && !p.classId) || 
                (p.classId === wikiClass.id)
            )
        );
        return perm?.canEdit || false;
    }, [user, wikiClass, wikiPermissions]);

    const handleDelete = () => {
        if(lesson) {
            deleteWikiLessons([lesson.id]);
            goBack();
        }
    }

    if (!lesson || !wikiClass || !category) return <div className="p-8">Lección no encontrada</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Breadcrumbs & Actions */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-4">
                <div className="text-sm text-gray-500">
                    <Link to="/wiki/home" className="hover:underline">Wiki</Link> <span className="mx-1">/</span> 
                    <Link to={`/wiki/category/${category.id}`} className="hover:underline">{category.name}</Link> <span className="mx-1">/</span>
                    <Link to={`/wiki/class/${wikiClass.id}`} className="hover:underline">{wikiClass.name}</Link>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16}/>} onClick={goBack}>Volver</Button>
                    {canEdit && (
                        <>
                            <Button size="sm" leftIcon={<Edit size={16}/>} onClick={() => navigate(`/wiki/editor/${lesson.id}`)}>Editar</Button>
                            <Button size="sm" variant="danger" leftIcon={<Trash2 size={16}/>} onClick={() => setIsDeleteConfirmOpen(true)}>Borrar</Button>
                        </>
                    )}
                </div>
            </div>

            {/* Lesson Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{lesson.title}</h1>
                {!lesson.isVisible && <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Borrador / Oculto</span>}
            </div>

            {/* Content Container */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {lesson.blocks && lesson.blocks.length > 0 ? (
                    // Render Blocks
                    <div className="space-y-6">
                        {lesson.blocks.sort((a,b) => a.order - b.order).map((block) => (
                            <div key={block.id}>
                                {block.type === 'text' && <TextBlockView html={(block.content as any).html} />}
                                {block.type === 'video' && <VideoBlockView url={(block.content as any).url} />}
                                {block.type === 'image' && <ImageBlockView url={(block.content as any).url} caption={(block.content as any).caption} />}
                                {block.type === 'quiz' && <QuizBlockView content={block.content as QuizBlockContent} />}
                            </div>
                        ))}
                    </div>
                ) : (
                    // Legacy Render
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHTML(lesson.content) }} />
                )}
            </div>

            {/* Attachments */}
            {lesson.attachments && lesson.attachments.length > 0 && (
                <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">Recursos adjuntos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {lesson.attachments.map((att, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border rounded-md">
                                <span className="text-sm truncate">Recurso adjunto {i+1}</span>
                                <Button variant="ghost" size="sm"><Download size={16}/></Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

             <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Borrar Lección"
                message="¿Estás seguro de que quieres borrar esta lección? Esta acción no se puede deshacer."
                confirmText="Borrar Lección"
            />
        </div>
    );
};

export default WikiLessonViewPage;
