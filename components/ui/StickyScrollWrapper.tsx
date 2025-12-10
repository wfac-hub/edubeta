import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const StickyScrollWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const contentWrapperRef = useRef<HTMLDivElement>(null);
    const scrollbarContainerRef = useRef<HTMLDivElement>(null);
    const scrollbarContentRef = useRef<HTMLDivElement>(null);
    const scrollIntervalRef = useRef<number | null>(null);

    const [isVisible, setIsVisible] = useState(false);
    const isSyncingScroll = useRef(false);

    const checkState = useCallback(() => {
        const contentEl = contentWrapperRef.current;
        const wrapperEl = wrapperRef.current;
        
        if (contentEl && wrapperEl) {
            const isOverflowing = contentEl.scrollWidth > contentEl.clientWidth;
            const rect = wrapperEl.getBoundingClientRect();
            const isInView = rect.top < window.innerHeight && rect.bottom > 50;
            
            setIsVisible(isOverflowing && isInView);

            if (scrollbarContentRef.current) {
                // Using scrollWidth of the container is the most reliable way to get the full
                // width of the content, including any overflow.
                // Adding a generous 16px buffer to prevent edge cases where the last pixels/borders are cut off.
                scrollbarContentRef.current.style.width = `${contentEl.scrollWidth + 16}px`;
            }
        } else {
            setIsVisible(false);
        }
    }, []);

    useEffect(() => {
        const contentEl = contentWrapperRef.current;
        const scrollbarEl = scrollbarContainerRef.current;
        const wrapperEl = wrapperRef.current;

        if (!contentEl || !scrollbarEl || !wrapperEl) return;
        
        const tableEl = contentEl.firstElementChild;
        
        const handleContentScroll = () => {
            if (isSyncingScroll.current) return;
            isSyncingScroll.current = true;
            scrollbarEl.scrollLeft = contentEl.scrollLeft;
            requestAnimationFrame(() => { isSyncingScroll.current = false; });
        };

        const handleScrollbarScroll = () => {
            if (isSyncingScroll.current) return;
            isSyncingScroll.current = true;
            contentEl.scrollLeft = scrollbarEl.scrollLeft;
            requestAnimationFrame(() => { isSyncingScroll.current = false; });
        };

        contentEl.addEventListener('scroll', handleContentScroll, { passive: true });
        scrollbarEl.addEventListener('scroll', handleScrollbarScroll, { passive: true });

        const observer = new IntersectionObserver(() => checkState(), { threshold: [0, 0.1] });
        observer.observe(wrapperEl);

        const resizeObserver = new ResizeObserver(checkState);
        resizeObserver.observe(contentEl);
        if (tableEl) {
            resizeObserver.observe(tableEl);
        }
        
        document.addEventListener('scroll', checkState, { passive: true });
        window.addEventListener('resize', checkState, { passive: true });

        checkState();

        return () => {
            contentEl.removeEventListener('scroll', handleContentScroll);
            scrollbarEl.removeEventListener('scroll', handleScrollbarScroll);
            observer.disconnect();
            resizeObserver.disconnect();
            document.removeEventListener('scroll', checkState);
            window.removeEventListener('resize', checkState);
        };
    }, [checkState]);

    const handleScroll = (direction: number, behavior: 'smooth' | 'auto' = 'smooth') => {
        scrollbarContainerRef.current?.scrollBy({ left: direction * 150, behavior });
    };

    const handleMouseDown = (direction: number) => {
        if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
        handleScroll(direction, 'smooth');
        scrollIntervalRef.current = window.setInterval(() => {
            handleScroll(direction, 'auto');
        }, 100);
    };

    const handleMouseUpOrLeave = () => {
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
        }
    };
    
    return (
        <div ref={wrapperRef}>
            <div ref={contentWrapperRef} className="overflow-x-auto hide-scrollbar">
                {children}
            </div>
            
            <div 
                className={`fixed bottom-0 left-0 right-0 lg:left-72 z-30 flex items-center bg-gray-100/80 dark:bg-slate-900/80 backdrop-blur-sm transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                aria-hidden={!isVisible}
            >
                <button
                    type="button"
                    onMouseDown={() => handleMouseDown(-1)}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    className="p-2 h-5 flex items-center justify-center bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shrink-0"
                    aria-label="Scroll left"
                >
                    <ChevronLeft size={16} className="text-gray-700 dark:text-gray-200" />
                </button>
                <div 
                    ref={scrollbarContainerRef} 
                    className="flex-grow overflow-x-auto sticky-scrollbar h-5"
                >
                    <div ref={scrollbarContentRef} style={{ height: '1px' }}></div>
                </div>
                 <button
                    type="button"
                    onMouseDown={() => handleMouseDown(1)}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    className="p-2 h-5 flex items-center justify-center bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shrink-0"
                    aria-label="Scroll right"
                >
                    <ChevronRight size={16} className="text-gray-700 dark:text-gray-200" />
                </button>
            </div>
        </div>
    );
};

export default StickyScrollWrapper;