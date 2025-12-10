
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';
import Button from '../components/ui/Button';
import { User, Role, UserPermissions } from '../types';
import { MoveLeft, Save, Upload, Camera, Trash2, CheckCircle, Lock, Shield } from 'lucide-react';
import { getRandomColor } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';

/**
 * Etiquetas en castellano para las claves de permisos.
 */
const PERMISSION_LABELS: Record<keyof UserPermissions, string> = {
    centerManagement: 'Gestión del Centro',
    academicManagement: 'Gestión Académica',
    financialManagement: 'Gestión Financiera',
    reports: 'Informes',
    settings: 'Configuración',
    users: 'Usuarios',
};

/**
 * Permisos por defecto para cada rol.
 */
const DEFAULT_PERMISSIONS: Record<Role, UserPermissions> = {
    [Role.ADMIN]: { centerManagement: true, academicManagement: true, financialManagement: true, reports: true, settings: true, users: true },
    [Role.COORDINATOR]: { centerManagement: true, academicManagement: true, financialManagement: false, reports: true, settings: true, users: true },
    [Role.FINANCIAL_MANAGER]: { centerManagement: false, academicManagement: true, financialManagement: true, reports: true, settings: false, users: false },
    [Role.TEACHER]: { centerManagement: false, academicManagement: false, financialManagement: false, reports: false, settings: false, users: false },
    [Role.STUDENT]: { centerManagement: false, academicManagement: false, financialManagement: false, reports: false, settings: false, users: false },
};

/**
 * Página para la creación y edición de usuarios del sistema (roles de gestión).
 * Permite configurar datos personales, de acceso y permisos granulares.
 * Estilos optimizados para día/noche.
 */
function UserEditPage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const { users, updateUser } = useData();
    const { user: authUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isNew = userId === undefined || userId === 'new';
    const existingUser = useMemo(() => users.find(u => u.id === parseInt(userId || '0')), [users, userId]);

    const [formData, setFormData] = useState<Partial<User>>({
        name: '',
        lastName: '',
        email: '',
        role: Role.TEACHER,
        status: 'active',
        avatar: '',
        permissions: DEFAULT_PERMISSIONS[Role.TEACHER]
    });
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (existingUser) {
            setFormData({
                ...existingUser,
                permissions: existingUser.permissions || DEFAULT_PERMISSIONS[existingUser.role]
            });
        }
    }, [existingUser]);

    /**
     * Maneja los cambios en los inputs del formulario, actualizando el estado.
     * Si se cambia el rol, resetea los permisos a los valores por defecto para ese rol.
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'role') {
            setFormData(prev => ({
                ...prev,
                role: value as Role,
                permissions: DEFAULT_PERMISSIONS[value as Role]
            }));
        }
    };
    
    /**
     * Cambia el estado de un permiso específico en el formulario.
     */
    const handlePermissionChange = (key: keyof UserPermissions) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions!,
                [key]: !prev.permissions![key]
            }
        }));
    };

    /**
     * Gestiona la subida de un fichero de imagen para el avatar.
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
             // Validación de tamaño (800 KB)
            if (file.size > 800 * 1024) {
                alert('El archivo es demasiado grande. El tamaño máximo es de 800 KB.');
                return;
            }

            // Validación de formato (JPG, PNG)
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                alert('Formato de archivo no válido. Solo se permiten JPG y PNG.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    /**
     * Envía el formulario para guardar o crear el usuario.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isNew && !password) {
            alert('La contraseña es obligatoria para nuevos usuarios.');
            return;
        }
        if (password && password !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        const userToSave: User = {
            id: existingUser ? existingUser.id : Math.max(0, ...users.map(u => u.id)) + 1,
            name: formData.name!,
            lastName: formData.lastName,
            email: formData.email!,
            role: formData.role!,
            status: formData.status as 'active' | 'inactive',
            avatar: formData.avatar || '',
            lastLogin: existingUser?.lastLogin || new Date().toISOString(),
            permissions: formData.permissions
        };

        updateUser(userToSave);
        navigate('/center-management/users');
    };

    const initials = `${formData.name?.[0] || ''}${formData.lastName?.[0] || ''}`.toUpperCase();
    const avatarColor = getRandomColor(initials);
    const isCoordinatorEditing = authUser?.role === Role.COORDINATOR;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{isNew ? 'Nuevo Usuario' : `Editar: ${formData.name}`}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completa los datos de acceso y perfil del usuario.</p>
                </div>
                <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16} />} onClick={goBack}>Volver</Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                        <h3 className="font-semibold text-lg mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">Datos Personales</h3>
                        
                        <div className="flex items-start gap-6 mb-6">
                            <div className="flex-shrink-0">
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-slate-700" />
                                ) : (
                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white ${avatarColor} border-4 border-gray-100 dark:border-slate-700`}>
                                        {initials}
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow space-y-3">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Sube una foto de perfil. Formatos: JPG, PNG. Max 800KB.</p>
                                <div className="flex gap-2">
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" />
                                    <Button type="button" size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} leftIcon={<Upload size={14}/>}>Subir foto</Button>
                                    {formData.avatar && (
                                        <Button type="button" size="sm" variant="ghost" className="text-red-500" onClick={() => setFormData(prev => ({...prev, avatar: ''}))} leftIcon={<Trash2 size={14}/>}>Eliminar</Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nombre</label>
                                <input name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Apellidos</label>
                                <input name="lastName" value={formData.lastName || ''} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email (Usuario de acceso)</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600" required />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                        <h3 className="font-semibold text-lg mb-4 border-b border-gray-200 dark:border-slate-700 pb-2 flex items-center gap-2">
                            <Shield size={20} className="text-primary-500"/> Permisos y Accesos
                        </h3>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-4 text-sm text-blue-800 dark:text-blue-200">
                            Los permisos se configuran automáticamente según el rol seleccionado, pero puedes personalizarlos manualmente a continuación.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {Object.keys(formData.permissions || {}).map((key) => (
                                <label key={key} className="flex items-center p-3 border border-gray-200 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={(formData.permissions as any)[key]} 
                                        onChange={() => handlePermissionChange(key as keyof UserPermissions)}
                                    />
                                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {PERMISSION_LABELS[key as keyof UserPermissions] || key}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                     <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                        <h3 className="font-semibold text-lg mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">Configuración de Cuenta</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Rol del sistema</label>
                                <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600">
                                    {!isCoordinatorEditing && <option value={Role.ADMIN}>Administrador</option>}
                                    <option value={Role.COORDINATOR}>Coordinador</option>
                                    <option value={Role.FINANCIAL_MANAGER}>Gestor Financiero</option>
                                    <option value={Role.TEACHER}>Profesor</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Estado</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600">
                                    <option value="active">Activo</option>
                                    <option value="inactive">Inactivo</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                        <h3 className="font-semibold text-lg mb-4 border-b border-gray-200 dark:border-slate-700 pb-2 flex items-center gap-2">
                            <Lock size={20} className="text-gray-500"/> Seguridad
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{isNew ? 'Contraseña' : 'Nueva Contraseña'}</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600" placeholder={isNew ? 'Requerido' : 'Opcional'}/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Confirmar Contraseña</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600" />
                            </div>
                            {!isNew && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 italic">Deja los campos vacíos si no deseas cambiar la contraseña actual.</p>
                            )}
                        </div>
                    </div>

                    <div className="sticky top-24">
                         <Button type="submit" className="w-full py-3" leftIcon={<Save size={18}/>}>
                             {isNew ? 'Crear Usuario' : 'Guardar Cambios'}
                         </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default UserEditPage;
