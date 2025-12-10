
import React, { useState, useEffect } from 'react';
import Card, { CardContent } from '../components/ui/Card';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import { CheckCircle } from 'lucide-react';

const SettingsPage = () => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    const handleSave = () => {
        // Simulate save action for this simplified settings page
        setShowSuccess(true);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Configuración</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Perfil</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Administra tu información personal.</p>
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                                <input type="text" defaultValue={user?.name} className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input type="email" defaultValue={user?.email} className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                            </div>
                            <div className="flex justify-end items-center gap-4 pt-2">
                                {showSuccess && (
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-fade-in">
                                        <CheckCircle size={16} />
                                        <span>Guardado correctamente</span>
                                    </div>
                                )}
                                <Button onClick={handleSave}>Guardar Cambios</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700 my-8"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Apariencia</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Personaliza la apariencia de la aplicación.</p>
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-md font-medium text-gray-900 dark:text-white">Modo Oscuro</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Actualmente: {theme === 'dark' ? 'Activado' : 'Desactivado'}</p>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className={`${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800`}
                                >
                                    <span
                                        className={`${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                    />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
