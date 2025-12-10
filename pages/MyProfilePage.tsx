
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import { CheckCircle, Save, Upload, Trash2, Camera, HelpCircle, Lock, Bell, User as UserIcon, Monitor, Clock, Activity } from 'lucide-react';
import { User } from '../types';
import { getRandomColor } from '../utils/helpers';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';

const MyProfilePage = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, setUser } = useAuth();
    const { updateUser, users } = useData();
    const { goBack } = useNavigationHistory();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentUser = useMemo(() => users.find(u => u.id === user?.id) || user, [users, user]);

    const [formData, setFormData] = useState<Partial<User>>({});
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [notificationSettings, setNotificationSettings] = useState({
        studentBirthdays: false,
        signedDocuments: false,
        waitingList: true,
        pendingRemittances: false,
    });
    const [platformLanguage, setPlatformLanguage] = useState('Español');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFormData({ ...currentUser });
        }
    }, [currentUser]);

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }
        
        if (currentUser && formData) {
            const updatedUser = { ...currentUser, ...formData } as User;
            updateUser(updatedUser);
            setUser(updatedUser);
            setShowSuccess(true);
            setPassword('');
            setConfirmPassword('');
        }
    };

    if (!currentUser) return <div>Cargando...</div>;

    const initials = `${currentUser.name?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase();
    const avatarColor = getRandomColor(initials);

    const inputClasses = "mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white p-2 border";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

    const userLogs = currentUser.activityLogs || [];
    const connectionLogs = userLogs.filter(log => log.action === 'Inicio de sesión');
    const actionLogs = userLogs.filter(log => log.action !== 'Inicio de sesión');
    
    const lastIp = connectionLogs.length > 0 && connectionLogs[0].details?.startsWith('IP:') 
        ? connectionLogs[0].details.replace('IP: ', '') 
        : '---';

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Configuración</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Summary & Activity */}
                <div className="space-y-6 lg:col-span-1">
                    <Card>
                        <CardContent>
                            <div className="flex justify-center mb-4">
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-lg" />
                                ) : (
                                    <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white ${avatarColor} border-4 border-white dark:border-slate-700 shadow-lg`}>
                                        {initials}
                                    </div>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white">{currentUser.name} {currentUser.lastName}</h2>
                            <p className="text-center text-sm text-primary-600 dark:text-primary-400 mb-4">{currentUser.role}</p>
                            
                            <div className="border-t border-gray-200 dark:border-slate-700 pt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Email</span>
                                    <span className="text-gray-900 dark:text-white truncate ml-4">{currentUser.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Usuario desde</span>
                                    <span className="text-gray-900 dark:text-white">01/01/2025</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                           <CardTitle>Mi actividad</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center text-sm pb-2 border-b border-gray-100 dark:border-slate-700">
                                    <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Monitor size={16} className="text-gray-400"/> Mi dirección IP actual
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">{lastIp}</span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                        <Clock size={14}/> Mis últimas conexiones
                                    </h4>
                                    <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                        {connectionLogs.slice(0, 5).map((log, idx) => (
                                            <div key={log.id} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">{new Date(log.date).toLocaleString()}</span>
                                                {idx === 0 && <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded dark:bg-green-900/30 dark:text-green-400">actual</span>}
                                            </div>
                                        ))}
                                        {connectionLogs.length === 0 && <p className="text-sm text-gray-400 italic">Sin historial reciente.</p>}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                           <CardTitle>Registro de Actividad</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                {actionLogs.length > 0 ? actionLogs.map((log) => (
                                    <div key={log.id} className="flex gap-3 items-start pb-3 border-b border-gray-100 dark:border-slate-700 last:border-0">
                                        <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full text-blue-600 dark:text-blue-400">
                                            <Activity size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{log.action}</p>
                                            <p className="text-xs text-gray-500">{log.details}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{new Date(log.date).toLocaleString()}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-500 italic text-center">No hay actividad registrada.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* Right Column: Edit Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit}>
                         <Card>
                            <CardHeader>
                               <CardTitle>Perfil</CardTitle>
                               <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Administra tu información personal.</p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelClasses}>Nombre</label>
                                        <input type="text" name="name" defaultValue={user?.name} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Email</label>
                                        <input type="email" name="email" defaultValue={user?.email} className={inputClasses} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                             <CardHeader>
                               <CardTitle>Apariencia</CardTitle>
                               <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Personaliza la apariencia de la aplicación.</p>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-md font-medium text-gray-900 dark:text-white">Modo Oscuro</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Actualmente: {theme === 'dark' ? 'Activado' : 'Desactivado'}</p>
                                    </div>
                                    <button
                                        type="button"
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
                        
                        <div className="flex justify-end items-center gap-4 pt-2">
                            {showSuccess && (
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-fade-in">
                                    <CheckCircle size={16} />
                                    <span>Guardado correctamente</span>
                                </div>
                            )}
                            <Button type="submit">Guardar Cambios</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MyProfilePage;
