
import React, { useState, useEffect, useRef } from 'react';
import { 
    Bold, Italic, Underline, Strikethrough, Link as LinkIcon, List, ListOrdered, Indent, Outdent, Code, Pilcrow
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    onFocus?: () => void;
    rows?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, onFocus, rows = 8 }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);

    // Syncs the parent's value with the contentEditable div's innerHTML.
    // This is crucial for initial value loading and external updates.
    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
        updateCounts(value);
    }, [value]);

    const updateCounts = (html: string) => {
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent || '';
        setCharCount(text.length);
        setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    };
    
    // This function is the single source of truth for updating the parent component.
    // It's called on user input and after any formatting command.
    const syncContent = () => {
        if (editorRef.current) {
            const newHtml = editorRef.current.innerHTML;
            if (newHtml !== value) {
                onChange(newHtml); // This triggers the useEffect but the condition prevents a loop
                updateCounts(newHtml);
            }
        }
    };
    
    // Generic handler for simple formatting commands.
    const applyFormat = (command: string) => {
        document.execCommand(command, false);
        syncContent();
        editorRef.current?.focus();
    };

    const handleLink = () => {
        editorRef.current?.focus(); // Ensure editor has focus to get selection
        const selection = window.getSelection();
        const selectedText = selection ? selection.toString() : '';

        const url = prompt('Introduce la URL del hipervínculo:', 'https://');
        if (!url) return;

        const text = prompt('Introduce el texto a mostrar:', selectedText);
        if (!text) return;

        // Use insertHTML to create a proper link, replacing selected text if any.
        const linkHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        document.execCommand('insertHTML', false, linkHTML);
        
        syncContent();
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent the editor from losing focus when a toolbar button is clicked.
        e.preventDefault();
    };

    const minHeight = `${(rows * 1.5) + 1}rem`;
    const btnClass = "p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600 active:bg-gray-300 dark:active:bg-slate-500 active:scale-95 transition-all";

    return (
        <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
          <div className="flex items-center flex-wrap gap-1 p-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            <button type="button" onMouseDown={handleMouseDown} onClick={() => applyFormat('bold')} className={btnClass}><Bold size={16}/></button>
            <button type="button" onMouseDown={handleMouseDown} onClick={() => applyFormat('italic')} className={btnClass}><Italic size={16}/></button>
            <button type="button" onMouseDown={handleMouseDown} onClick={() => applyFormat('underline')} className={btnClass}><Underline size={16}/></button>
            <button type="button" onMouseDown={handleMouseDown} onClick={() => applyFormat('strikeThrough')} className={btnClass}><Strikethrough size={16}/></button>
            <div className="w-[1px] h-5 bg-gray-300 dark:bg-slate-600 mx-1"></div>
            <button type="button" onMouseDown={handleMouseDown} onClick={handleLink} className={btnClass}><LinkIcon size={16}/></button>
            <button type="button" onMouseDown={handleMouseDown} onClick={() => applyFormat('insertUnorderedList')} className={btnClass}><List size={16}/></button>
            <button type="button" onMouseDown={handleMouseDown} onClick={() => applyFormat('insertOrderedList')} className={btnClass}><ListOrdered size={16}/></button>
            <div className="w-[1px] h-5 bg-gray-300 dark:bg-slate-600 mx-1"></div>
            <button type="button" onMouseDown={handleMouseDown} onClick={() => applyFormat('indent')} className={btnClass}><Indent size={16}/></button>
            <button type="button" onMouseDown={handleMouseDown} onClick={() => applyFormat('outdent')} className={btnClass}><Outdent size={16}/></button>
            <div className="w-[1px] h-5 bg-gray-300 dark:bg-slate-600 mx-1"></div>
            <button type="button" onMouseDown={handleMouseDown} disabled className="p-1.5 rounded disabled:opacity-50"><Pilcrow size={16}/></button>
            <button type="button" onMouseDown={handleMouseDown} disabled className="p-1.5 rounded disabled:opacity-50"><Code size={16}/></button>
          </div>
          <div
            ref={editorRef}
            contentEditable
            onInput={syncContent}
            onBlur={syncContent}
            onFocus={onFocus}
            style={{ minHeight }}
            className="w-full p-2 bg-transparent border-0 focus:ring-0 focus:outline-none"
          />
           <div className="text-right text-xs p-1 border-t border-gray-300 dark:border-gray-600 text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-b-md">
              Nº PAL./CARS.: {wordCount} / {charCount}
            </div>
        </div>
      );
};

export default RichTextEditor;
