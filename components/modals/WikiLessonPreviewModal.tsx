
import React from 'react';
import Modal from '../ui/Modal';
import { LessonBlock, QuizBlockContent } from '../../types';
import { ImageBlockView, QuizBlockView, TextBlockView, VideoBlockView } from '../wiki/WikiBlockViewers';
import Button from '../ui/Button';

interface WikiLessonPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    blocks: LessonBlock[];
}

const WikiLessonPreviewModal: React.FC<WikiLessonPreviewModalProps> = ({ isOpen, onClose, title, blocks }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Vista Previa de Lección">
            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="border-b border-gray-200 dark:border-slate-700 pb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title || 'Sin título'}</h2>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                    {blocks.length > 0 ? (
                        <div className="space-y-6">
                            {blocks.sort((a, b) => a.order - b.order).map((block) => (
                                <div key={block.id}>
                                    {block.type === 'text' && <TextBlockView html={(block.content as any).html} />}
                                    {block.type === 'video' && <VideoBlockView url={(block.content as any).url} />}
                                    {block.type === 'image' && <ImageBlockView url={(block.content as any).url} caption={(block.content as any).caption} />}
                                    {block.type === 'quiz' && <QuizBlockView content={block.content as QuizBlockContent} />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-10">No hay contenido en la lección.</p>
                    )}
                </div>
                
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
                     <Button onClick={onClose}>Cerrar Vista Previa</Button>
                </div>
            </div>
        </Modal>
    );
};

export default WikiLessonPreviewModal;
