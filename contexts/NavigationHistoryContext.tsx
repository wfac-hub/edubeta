import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useLocation, useNavigate, Location } from 'react-router-dom';

interface NavigationHistoryContextType {
    goBack: () => void;
}

const NavigationHistoryContext = createContext<NavigationHistoryContextType | undefined>(undefined);

const locationToPath = (location: Location) => location.pathname + location.search;

export const NavigationHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [history, setHistory] = useState<string[]>([locationToPath(location)]);

    useEffect(() => {
        const currentPath = locationToPath(location);
        const lastPath = history[history.length - 1];
        
        // This effect runs after navigation. If the current location is different from the last in our stack,
        // it means a forward navigation happened.
        if (currentPath !== lastPath) {
             setHistory(prevHistory => [...prevHistory, currentPath]);
        }
    }, [location]);

    const goBack = useCallback(() => {
        // Our history stack includes the current page, so we need at least 2 entries to go back.
        if (history.length > 1) {
            // Get the previous path
            const previousPath = history[history.length - 2];
            
            // Update our internal history stack to reflect the "back" action.
            setHistory(prevHistory => prevHistory.slice(0, -1));

            // Navigate to the previous path using replace to not add a new entry.
            navigate(previousPath, { replace: true });
        } else {
            // Fallback if there's no history to go back to.
            navigate('/', { replace: true });
        }
    }, [history, navigate]);

    return (
        <NavigationHistoryContext.Provider value={{ goBack }}>
            {children}
        </NavigationHistoryContext.Provider>
    );
};

export const useNavigationHistory = () => {
    const context = useContext(NavigationHistoryContext);
    if (!context) {
        throw new Error('useNavigationHistory must be used within a NavigationHistoryProvider');
    }
    return context;
};
