
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CourseClass, Resource, Role } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Download, Trash2, Upload } from 'lucide-react';

interface CommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseClass: CourseClass;
    onSave: (courseClass: CourseClass) => void;
    activeTab: 'internal' | 'public' | 'documents';
}

const fileToB64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const downloadResource = (resource: Resource) => {
    const link = document.createElement('a');
    link.href = `data:${resource.fileType};base64,${resource.fileContent}`;
    link.download = resource.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


const CommentModal: React.FC<CommentModalProps> = ({ isOpen, onClose, courseClass, onSave, activeTab }) => {
    const { resources, addResource, deleteResources, teachers } = useData();
    const { user: authUser } = useAuth();
    const [currentTab, setCurrentTab] = useState(activeTab);
    const [internalComment, setInternalComment] = useState('');
    const [publicComment, setPublicComment] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const classResources = resources.filter(r => r.scope === 'class' && r.scopeId === courseClass.id);

    const internalCommentTemplate = "Contenidos clase:\n\n\nDeberes:\n\n\nObservaciones:\n\n";

    const currentTeacher = useMemo(() => {
        if (authUser?.role === Role.TEACHER) {
            return teachers.find(t => t.id === authUser.id);
        }
        return null;
    }, [authUser, teachers]);

    const canEditStudentAreaComments = useMemo(() => {
        if (!currentTeacher) return true; // Admins, coordinators, etc. can always edit
        return currentTeacher.permissions.canEditStudentAreaComments;
    }, [currentTeacher]);


    useEffect(() => {
        setCurrentTab(activeTab);
    }, [activeTab]);

    useEffect(() => {
        if (courseClass) {
            setInternalComment(courseClass.internalComment || (currentTab === 'internal' && !courseClass.internalComment ? internalCommentTemplate : ''));
            setPublicComment(courseClass.publicComment || '');
        }
    }, [courseClass, currentTab, isOpen]);

    const handleSave = () => {
        onSave({
            ...courseClass,
            internalComment,
            publicComment,
        });
    };
    
    const handleClearComment = () => {
        if(currentTab === 'internal') {
            setInternalComment(internalCommentTemplate);
        } else {
            setPublicComment('');
        }
    };
    
    const handleCopyComment = () => {
        setPublicComment(internalComment);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await addResource(file, 'class', courseClass.id);
        }
    };

    const TabButton: React.FC<{ tab: 'internal' | 'public' | 'documents'; label: string }> = ({ tab, label }) => (
        <button
            type="button"
            onClick={() => setCurrentTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
                currentTab === tab 
                ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
        >
            {label}
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Comentario">
            <div className="flex flex-col h-[60vh]">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <TabButton tab="internal" label="Comentario interno" />
                        {canEditStudentAreaComments && <TabButton tab="public" label="Comentario área de alumnos" />}
                        <TabButton tab="documents" label="Documentos adjuntos" />
                    </nav>
                </div>

                <div className="py-4 flex-grow flex flex-col overflow-y-auto">
                    {currentTab === 'internal' && (
                        <div className="space-y-2 flex-grow flex flex-col">
                            <div className="flex justify-between items-center">
                               <p className="text-sm text-gray-500 dark:text-gray-400">Comentario interno de la clase, visible para coordinadores y profesores.</p>
                               <Button variant="secondary" size="sm" onClick={handleClearComment}>Borrar comentario</Button>
                            </div>
                            <textarea
                                value={internalComment}
                                onChange={(e) => setInternalComment(e.target.value)}
                                className="w-full flex-grow p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                rows={15}
                            />
                        </div>
                    )}
                    {currentTab === 'public' && canEditStudentAreaComments && (
                         <div className="space-y-2 flex-grow flex flex-col">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Comentario público de la clase, visible en el área de alumnos.</p>
                                <div className="flex gap-2">
                                    <Button variant="secondary" size="sm" onClick={handleClearComment}>Borrar comentario</Button>
                                    <Button variant="secondary" size="sm" onClick={handleCopyComment}>Copiar del comentario interno</Button>
                                </div>
                            </div>
                            <textarea
                                value={publicComment}
                                onChange={(e) => setPublicComment(e.target.value)}
                                className="w-full flex-grow p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                 rows={15}
                           />
                        </div>
                    )}
                    {currentTab === 'documents' && (
                        <div className="space-y-4">
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            <Button variant="secondary" leftIcon={<Upload size={16}/>} onClick={() => fileInputRef.current?.click()}>
                                Adjuntar archivo
                            </Button>
                            {classResources.length > 0 ? (
                                <ul className="space-y-2">
                                    {classResources.map(resource => (
                                        <li key={resource.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{resource.name}</span>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => downloadResource(resource)} leftIcon={<Download size={16}/>}>Descargar</Button>
                                                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteResources([resource.id])} leftIcon={<Trash2 size={16}/>}>Borrar</Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">No hay documentos adjuntos para esta clase.</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="secondary" onClick={onClose}>Cerrar</Button>
                    <Button onClick={handleSave}>Guarda el comentario</Button>
                </div>
            </div>
        </Modal>
    );
};

export default CommentModal;
