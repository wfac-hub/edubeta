
import React, { useState } from 'react';
import { TextBlockContent, QuizBlockContent } from '../../types';
import Button from '../ui/Button';
import { Check, X, HelpCircle } from 'lucide-react';

export const TextBlockView: React.FC<{ html: string }> = ({ html }) => (
    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
);

export const VideoBlockView: React.FC<{ url: string }> = ({ url }) => {
    let embedUrl = url;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.split('v=')[1] || url.split('/').pop();
        const cleanVideoId = videoId?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${cleanVideoId}`;
    }

    return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-sm my-4">
            <iframe 
                src={embedUrl} 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                allowFullScreen 
                title="Video Player"
            />
        </div>
    );
};

export const ImageBlockView: React.FC<{ url: string, caption?: string }> = ({ url, caption }) => (
    <div className="my-4 flex flex-col items-center">
        <img src={url} alt={caption || 'Lesson Image'} className="rounded-lg shadow-sm max-h-[500px] object-contain" />
        {caption && <p className="text-sm text-gray-500 mt-2 italic">{caption}</p>}
    </div>
);

export const QuizBlockView: React.FC<{ content: QuizBlockContent }> = ({ content }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = () => {
        if (!selectedOption) return;
        setIsSubmitted(true);
    };

    const correctOptionId = content.options.find(o => o.isCorrect)?.id;
    const isCorrect = selectedOption === correctOptionId;

    return (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 my-6">
            <div className="flex items-center gap-2 mb-4 text-purple-700 dark:text-purple-300">
                <HelpCircle size={24} />
                <h3 className="font-bold text-lg">Quiz Rápido</h3>
            </div>
            <p className="text-gray-800 dark:text-gray-100 font-medium mb-4 text-lg">{content.question}</p>
            
            <div className="space-y-2">
                {content.options.map(option => {
                    let optionClass = "w-full p-3 text-left rounded-md border transition-colors flex justify-between items-center ";
                    if (isSubmitted) {
                        if (option.isCorrect) optionClass += "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/50 dark:text-green-200 ";
                        else if (selectedOption === option.id) optionClass += "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/50 dark:text-red-200 ";
                        else optionClass += "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 opacity-50 ";
                    } else {
                        if (selectedOption === option.id) optionClass += "bg-purple-100 border-purple-500 text-purple-900 dark:bg-purple-900/50 dark:text-purple-100 ";
                        else optionClass += "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 ";
                    }

                    return (
                        <button 
                            key={option.id}
                            onClick={() => !isSubmitted && setSelectedOption(option.id)}
                            disabled={isSubmitted}
                            className={optionClass}
                        >
                            <span>{option.text}</span>
                            {isSubmitted && option.isCorrect && <Check size={20} className="text-green-600" />}
                            {isSubmitted && !option.isCorrect && selectedOption === option.id && <X size={20} className="text-red-600" />}
                        </button>
                    );
                })}
            </div>

            {!isSubmitted && (
                <div className="mt-4 flex justify-end">
                    <Button size="sm" onClick={handleSubmit} disabled={!selectedOption}>Comprobar</Button>
                </div>
            )}
            {isSubmitted && (
                <div className={`mt-4 p-3 rounded-md text-center font-bold ${isCorrect ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'}`}>
                    {isCorrect ? '¡Correcto! 🎉' : 'Incorrecto, inténtalo de nuevo en otra ocasión.'}
                </div>
            )}
        </div>
    );
};
