
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useNavigationHistory } from '../../contexts/NavigationHistoryContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import RichTextEditor from '../../components/ui/RichTextEditor';
import { WikiLesson, LessonBlock, BlockType, TextBlockContent, VideoBlockContent, ImageBlockContent, QuizBlockContent, QuizOption, Role } from '../../types';
import { Save, MoveLeft, Plus, Trash2, ArrowUp, ArrowDown, Type, Video, Image as ImageIcon, HelpCircle, CheckCircle, Circle, Eye, GripVertical, Download } from 'lucide-react';
import WikiLessonPreviewModal from '../../components/modals/WikiLessonPreviewModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

// --- Block Editors ---

const TextBlockEditor: React.FC<{ content: TextBlockContent, onChange: (c: TextBlockContent) => void }> = ({ content, onChange }) => (
    <RichTextEditor value={content.html} onChange={(html) => onChange({ html })} rows={6} />
);

const VideoBlockEditor: React.FC<{ content: VideoBlockContent, onChange: (c: VideoBlockContent) => void }> = ({ content, onChange }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL del vídeo (YouTube)</label>
        <input 
            type="text" 
            className="w-full p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600"
            placeholder="https://www.youtube.com/watch?v=..."
            value={content.url}
            onChange={e => onChange({ ...content, url: e.target.value, provider: 'youtube' })}
        />
        {content.url && (
            <div className="aspect-video mt-2 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                {content.url.includes('youtube') || content.url.includes('youtu.be') ? (
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={content.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')} 
                        title="Video Preview"
                        frameBorder="0"
                        allowFullScreen
                    />
                ) : (
                    <span className="text-gray-500">Vista previa no disponible</span>
                )}
            </div>
        )}
    </div>
);

const ImageBlockEditor: React.FC<{ content: ImageBlockContent, onChange: (c: ImageBlockContent) => void }> = ({ content, onChange }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange({ ...content, url: reader.result as string, file });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Imagen</label>
            <div className="flex gap-4 items-start">
                <div className="flex-grow space-y-2">
                    <input 
                        type="text" 
                        className="w-full p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600"
                        placeholder="URL de la imagen..."
                        value={content.url}
                        onChange={e => onChange({ ...content, url: e.target.value })}
                    />
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>o subir archivo:</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                    </div>
                    <input 
                        type="text" 
                        className="w-full p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-sm"
                        placeholder="Pie de foto (opcional)"
                        value={content.caption || ''}
                        onChange={e => onChange({ ...content, caption: e.target.value })}
                    />
                </div>
                {content.url && (
                    <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center overflow-hidden border dark:border-slate-600">
                        <img src={content.url} alt="Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                )}
            </div>
        </div>
    );
};

const QuizBlockEditor: React.FC<{ content: QuizBlockContent, onChange: (c: QuizBlockContent) => void }> = ({ content, onChange }) => {
    const addOption = () => {
        if (content.options.length >= 4) return;
        const newOption: QuizOption = { id: Date.now().toString(), text: '', isCorrect: false };
        onChange({ ...content, options: [...content.options, newOption] });
    };

    const removeOption = (id: string) => {
        if (content.options.length <= 2) return;
        onChange({ ...content, options: content.options.filter(o => o.id !== id) });
    };

    const updateOption = (id: string, text: string) => {
        onChange({ 
            ...content, 
            options: content.options.map(o => o.id === id ? { ...o, text } : o) 
        });
    };

    const setCorrect = (id: string) => {
        onChange({ 
            ...content, 
            options: content.options.map(o => ({ ...o, isCorrect: o.id === id })) 
        });
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pregunta</label>
                <input 
                    type="text" 
                    className="w-full p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 font-medium"
                    placeholder="Escribe la pregunta..."
                    value={content.question}
                    onChange={e => onChange({ ...content, question: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Respuestas (Marca la correcta)</label>
                {content.options.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-2">
                        <button 
                            type="button" 
                            onClick={() => setCorrect(option.id)}
                            className={`p-1 rounded-full ${option.isCorrect ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {option.isCorrect ? <CheckCircle size={20} /> : <Circle size={20} />}
                        </button>
                        <input 
                            type="text" 
                            className={`flex-grow p-2 border rounded-md text-sm ${option.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600'}`}
                            placeholder={`Opción ${index + 1}`}
                            value={option.text}
                            onChange={e => updateOption(option.id, e.target.value)}
                        />
                        <button 
                            type="button" 
                            onClick={() => removeOption(option.id)}
                            disabled={content.options.length <= 2}
                            className="text-gray-400 hover:text-red-500 disabled:opacity-30"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {content.options.length < 4 && (
                    <Button type="button" variant="ghost" size="sm" onClick={addOption} leftIcon={<Plus size={14} />}>Añadir opción</Button>
                )}
            </div>
        </div>
    );
};

// --- Main Page ---

const WikiLessonEditorPage = () => {
    const { lessonId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const { wikiLessons, wikiClasses, wikiPermissions, updateWikiLesson } = useData();
    const { user } = useAuth();

    const classIdParam = searchParams.get('classId');
    const isNew = !lessonId;

    const [title, setTitle] = useState('');
    const [classId, setClassId] = useState(classIdParam ? parseInt(classIdParam) : 0);
    const [isVisible, setIsVisible] = useState(true);
    const [blocks, setBlocks] = useState<LessonBlock[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    
    // State for block deletion modal
    const [blockToDelete, setBlockToDelete] = useState<string | null>(null);
    
    const blocksEndRef = useRef<HTMLDivElement>(null);

    // Filter classes based on permissions for the dropdown
    const availableClasses = useMemo(() => {
        if (user?.role === Role.ADMIN) return wikiClasses;

        const userPermissions = wikiPermissions.filter(p => p.teacherId === user?.id);
        
        return wikiClasses.filter(c => {
            // Check for specific class edit permission
            const classPerm = userPermissions.find(p => p.classId === c.id);
            if (classPerm?.canEdit) return true;

            // Check for category level edit permission (inherited)
            const catPerm = userPermissions.find(p => p.categoryId === c.categoryId && !p.classId);
            if (catPerm?.canEdit) return true;

            return false;
        });
    }, [wikiClasses, wikiPermissions, user]);

    // Redirect if user has no permission to edit any class (and is not Admin)
    useEffect(() => {
        if (user && user.role !== Role.ADMIN && availableClasses.length === 0) {
            navigate('/wiki/home', { replace: true });
        }
    }, [availableClasses, user, navigate]);

    useEffect(() => {
        if (!isNew) {
            const lesson = wikiLessons.find(l => l.id === parseInt(lessonId));
            if (lesson) {
                setTitle(lesson.title);
                setClassId(lesson.classId);
                setIsVisible(lesson.isVisible);
                // If lesson has blocks, load them. If legacy (only content string), create a text block.
                if (lesson.blocks && lesson.blocks.length > 0) {
                    setBlocks(lesson.blocks);
                } else if (lesson.content) {
                    setBlocks([{
                        id: 'legacy-1',
                        type: 'text',
                        order: 0,
                        content: { html: lesson.content }
                    }]);
                }
            }
        }
    }, [lessonId, isNew, wikiLessons]);

    const addBlock = (type: BlockType) => {
        const newBlock: LessonBlock = {
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID to prevent collision on fast clicks
            type,
            order: blocks.length,
            content: getDefaultContent(type)
        };
        setBlocks([...blocks, newBlock]);
        setIsMenuOpen(false);
        
        // Scroll to the new block
        setTimeout(() => {
            blocksEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const getDefaultContent = (type: BlockType): any => {
        switch(type) {
            case 'text': return { html: '' };
            case 'video': return { url: '', provider: 'youtube' };
            case 'image': return { url: '', caption: '' };
            case 'quiz': return { question: '', options: [{id: '1', text: '', isCorrect: true}, {id: '2', text: '', isCorrect: false}] };
        }
    };

    const updateBlock = (id: string, newContent: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content: newContent } : b));
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        // Update order property
        newBlocks.forEach((b, i) => b.order = i);
        setBlocks(newBlocks);
    };

    const confirmDeleteBlock = () => {
        if (blockToDelete) {
            setBlocks(prevBlocks => prevBlocks.filter(b => b.id !== blockToDelete));
            setBlockToDelete(null);
        }
    };

    const handleRemoveBlockClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        setBlockToDelete(id);
    };

    const handleExport = () => {
        const lessonData = {
            title,
            blocks,
            isVisible,
            exportedAt: new Date().toISOString()
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lessonData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleSave = () => {
        if (!title || !classId) {
            alert('Título y Tema son obligatorios');
            return;
        }
        
        const selectedClass = wikiClasses.find(c => c.id === classId);
        if (!selectedClass) return;

        setIsSaving(true);
        
        setTimeout(() => {
             const lessonToSave: WikiLesson = {
                id: isNew ? 0 : parseInt(lessonId!),
                categoryId: selectedClass.categoryId,
                classId: classId,
                title,
                content: '', // Legacy content empty
                blocks, // New blocks structure
                isVisible,
                attachments: [] // Future implementation
            };

            updateWikiLesson(lessonToSave);
            setIsSaving(false);
            setSuccessMsg('Lección guardada correctamente');
            setTimeout(() => setSuccessMsg(null), 3000);

            if (isNew) {
                // Redirect to edit page of the new lesson so subsequent saves don't create duplicates
                navigate(`/wiki/editor/${lessonToSave.id}`, { replace: true });
            }
        }, 500);
    };

    const getBlockIcon = (type: BlockType) => {
        switch(type) {
            case 'text': return <Type size={18} />;
            case 'video': return <Video size={18} />;
            case 'image': return <ImageIcon size={18} />;
            case 'quiz': return <HelpCircle size={18} />;
        }
    }

    const getBlockLabel = (type: BlockType) => {
        switch(type) {
            case 'text': return 'Bloque de Texto';
            case 'video': return 'Bloque de Vídeo';
            case 'image': return 'Bloque de Imagen';
            case 'quiz': return 'Bloque de Quiz';
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center sticky top-0 bg-gray-50 dark:bg-slate-900 py-4 z-20 border-b border-gray-200 dark:border-slate-700">
                 <div className="flex items-center gap-4">
                    <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16}/>} onClick={goBack}>Volver</Button>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {isNew ? 'Crear Lección' : 'Editar Lección'}
                    </h1>
                </div>
                <div className="flex gap-2 items-center">
                    {successMsg && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-fade-in bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-md mr-2">
                            <CheckCircle size={16} />
                            {successMsg}
                        </div>
                    )}
                    <Button variant="secondary" onClick={handleExport} leftIcon={<Download size={16}/>}>Exportar JSON</Button>
                    <Button variant="secondary" leftIcon={<Eye size={16}/>} onClick={() => setIsPreviewOpen(true)}>Vista Previa</Button>
                    <Button onClick={handleSave} leftIcon={<Save size={16}/>} disabled={isSaving}>
                        {isSaving ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </div>

            {/* Metadata Form */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Título de la lección</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Ej. Introducción a la Robótica"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tema (Clase)</label>
                        <select 
                            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600"
                            value={classId}
                            onChange={e => setClassId(parseInt(e.target.value))}
                            disabled={!!classIdParam && !isNew}
                        >
                            <option value={0}>Seleccionar tema...</option>
                            {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {availableClasses.length === 0 && (
                             <p className="text-xs text-red-500 mt-1">No tienes permisos de edición en ningún tema.</p>
                        )}
                    </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                    <input type="checkbox" checked={isVisible} onChange={e => setIsVisible(e.target.checked)} className="h-4 w-4 rounded text-primary-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Visible para profesores/alumnos</span>
                </label>
            </div>

            {/* Blocks Editor */}
            <div className="space-y-6">
                {blocks.map((block, index) => (
                    <div key={block.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 relative">
                        {/* Header with controls - Z-Index 10 to ensure it's clickable above iframe overflows */}
                        <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-2 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 select-none">
                                <GripVertical size={16} className="text-gray-400" />
                                {getBlockIcon(block.type)}
                                <span>{getBlockLabel(block.type)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    type="button" 
                                    onClick={() => moveBlock(index, 'up')} 
                                    disabled={index === 0} 
                                    className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                    title="Mover arriba"
                                >
                                    <ArrowUp size={16}/>
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => moveBlock(index, 'down')} 
                                    disabled={index === blocks.length - 1} 
                                    className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                    title="Mover abajo"
                                >
                                    <ArrowDown size={16}/>
                                </button>
                                <div className="w-px h-4 bg-gray-300 dark:bg-slate-600 mx-1"></div>
                                <button 
                                    type="button" 
                                    onClick={(e) => handleRemoveBlockClick(e, block.id)} 
                                    className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                                    title="Eliminar bloque"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>

                        {/* Content Render */}
                        <div className="p-4">
                            {block.type === 'text' && <TextBlockEditor content={block.content as TextBlockContent} onChange={(c) => updateBlock(block.id, c)} />}
                            {block.type === 'video' && <VideoBlockEditor content={block.content as VideoBlockContent} onChange={(c) => updateBlock(block.id, c)} />}
                            {block.type === 'image' && <ImageBlockEditor content={block.content as ImageBlockContent} onChange={(c) => updateBlock(block.id, c)} />}
                            {block.type === 'quiz' && <QuizBlockEditor content={block.content as QuizBlockContent} onChange={(c) => updateBlock(block.id, c)} />}
                        </div>
                    </div>
                ))}
                <div ref={blocksEndRef} />
            </div>

            {/* Add Block Button */}
            <div className="flex justify-center py-4">
                <div className="relative">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-transform hover:scale-110 focus:outline-none z-10 relative"
                        title="Añadir nuevo bloque"
                    >
                        <Plus size={28} className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-45' : ''}`} />
                    </button>
                    
                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-0" onClick={() => setIsMenuOpen(false)}></div>
                            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200 z-20">
                                <button onClick={() => addBlock('text')} className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-slate-700 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                                    <Type size={18} className="text-gray-500" /> Texto
                                </button>
                                <button onClick={() => addBlock('video')} className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-slate-700 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                                    <Video size={18} className="text-red-500" /> Vídeo (YouTube)
                                </button>
                                <button onClick={() => addBlock('image')} className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-slate-700 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                                    <ImageIcon size={18} className="text-blue-500" /> Imagen
                                </button>
                                <button onClick={() => addBlock('quiz')} className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-slate-700 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                                    <HelpCircle size={18} className="text-purple-500" /> Quiz Básico
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Preview Modal */}
            <WikiLessonPreviewModal 
                isOpen={isPreviewOpen} 
                onClose={() => setIsPreviewOpen(false)} 
                title={title} 
                blocks={blocks} 
            />
            
            {/* Confirmation Modal for Deletion */}
            <ConfirmationModal
                isOpen={!!blockToDelete}
                onClose={() => setBlockToDelete(null)}
                onConfirm={confirmDeleteBlock}
                title="Eliminar Bloque"
                message="¿Estás seguro de que quieres eliminar este bloque de contenido? Esta acción no se puede deshacer."
                confirmText="Eliminar"
            />
        </div>
    );
};

export default WikiLessonEditorPage;
