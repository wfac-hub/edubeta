
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import { User, Role } from '../types';
import { Plus, Trash2, Search, Edit, UserCog, MoreHorizontal, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getRandomColor } from '../utils/helpers';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useAuth } from '../contexts/AuthContext';

const UserManagementPage = () => {
    const { users, deleteUsers, updateUser } = useData();
    const { user: authUser } = useAuth();
    const navigate = useNavigate();
    
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    // Exclude students and, if coordinator, exclude admins
    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            if (u.role === Role.STUDENT) return false;
            
            // Coordinators cannot see Admins
            if (authUser?.role === Role.COORDINATOR && u.role === Role.ADMIN) {
                return false;
            }

            const matchesSearch = 
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (u.lastName && u.lastName.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesRole = roleFilter ? u.role === roleFilter : true;
            const matchesStatus = statusFilter ? u.status === statusFilter : true;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchTerm, roleFilter, statusFilter, authUser]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredUsers.map(u => u.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleDelete = () => {
        deleteUsers(selectedIds);
        setSelectedIds([]);
        setIsDeleteConfirmOpen(false);
    };

    const handleToggleStatus = (user: User) => {
        updateUser({ ...user, status: user.status === 'active' ? 'inactive' : 'active' });
    };

    const getRoleBadgeColor = (role: Role) => {
        switch (role) {
            case Role.ADMIN: return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case Role.COORDINATOR: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case Role.FINANCIAL_MANAGER: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case Role.TEACHER: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const inputClasses = "p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <UserCog className="text-primary-600"/> Roles y usuarios
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Gestión de acceso y permisos de todos los usuarios de la plataforma (excepto alumnos).
                    </p>
                </div>
                <div className="text-sm text-gray-500 font-medium">{filteredUsers.length} Usuarios</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" leftIcon={<Plus size={16}/>} onClick={() => navigate('/center-management/users/new')}>Nuevo Usuario</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16}/>} onClick={() => setIsDeleteConfirmOpen(true)} disabled={selectedIds.length === 0}>Borrar</Button>
                    <div className="flex-grow"></div>
                    <div className="relative w-64">
                        <input type="text" placeholder="Buscar usuario..." className={inputClasses + " w-full pl-8"} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                <div className="flex flex-wrap gap-4">
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className={inputClasses}>
                        <option value="">Todos los roles</option>
                        {authUser?.role === Role.ADMIN && <option value={Role.ADMIN}>Administrador</option>}
                        <option value={Role.COORDINATOR}>Coordinador</option>
                        <option value={Role.FINANCIAL_MANAGER}>Gestor Financiero</option>
                        <option value={Role.TEACHER}>Profesor</option>
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputClasses}>
                        <option value="">Todos los estados</option>
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                {/* Mobile View */}
                <div className="lg:hidden divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredUsers.map(user => {
                         const initials = `${user.name[0]}${user.lastName ? user.lastName[0] : ''}`.toUpperCase();
                         return (
                            <div key={user.id} className={`group ${user.status === 'inactive' ? 'opacity-60 bg-gray-50 dark:bg-slate-900' : ''}`}>
                                <div className="p-4 flex items-center gap-4" onClick={() => setExpandedRow(prev => prev === user.id ? null : user.id)}>
                                    <input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => handleSelectOne(user.id)} onClick={e => e.stopPropagation()} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                    <div className="flex-shrink-0">
                                        {user.avatar && user.avatar.startsWith('http') ? (
                                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getRandomColor(initials)}`}>{initials}</div>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-medium text-gray-900 dark:text-white">{user.name} {user.lastName}</h3>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                    <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === user.id ? 'rotate-90' : ''}`} />
                                </div>
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === user.id ? 'max-h-60' : ''}`}>
                                    <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-3 border-t border-gray-100 dark:border-slate-700">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500">Rol:</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>{user.role}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500">Estado:</span>
                                            <button onClick={() => handleToggleStatus(user)} className={`flex items-center gap-1 px-2 py-1 rounded border ${user.status === 'active' ? 'border-green-500 text-green-600 bg-green-50' : 'border-red-500 text-red-600 bg-red-50'}`}>
                                                {user.status === 'active' ? <Check size={12} /> : <X size={12} />}
                                                {user.status === 'active' ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2">
                                            <Button size="sm" variant="secondary" leftIcon={<Edit size={14}/>} onClick={() => navigate(`/center-management/users/${user.id}/edit`)}>Editar</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Desktop View */}
                <div className="hidden lg:block">
                    <table className="min-w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-slate-700/50 dark:text-gray-400">
                            <tr>
                                <th className="p-4 w-10"><input type="checkbox" onChange={handleSelectAll} checked={filteredUsers.length > 0 && selectedIds.length === filteredUsers.length} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" /></th>
                                <th className="px-6 py-3">Usuario</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Rol</th>
                                <th className="px-6 py-3 text-center">Estado</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredUsers.map(user => {
                                const initials = `${user.name[0]}${user.lastName ? user.lastName[0] : ''}`.toUpperCase();
                                return (
                                    <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-slate-700/30 ${user.status === 'inactive' ? 'opacity-60' : ''}`}>
                                        <td className="p-4"><input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => handleSelectOne(user.id)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.avatar && user.avatar.startsWith('http') ? (
                                                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                                                ) : (
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs ${getRandomColor(initials)}`}>{initials}</div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{user.name} {user.lastName}</p>
                                                    <p className="text-xs text-gray-400">ID: {user.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleToggleStatus(user)}
                                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-200 dark:bg-slate-600'}`}
                                            >
                                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${user.status === 'active' ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" leftIcon={<Edit size={16}/>} onClick={() => navigate(`/center-management/users/${user.id}/edit`)}>Editar</Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Borrar Usuarios"
                message={`¿Estás seguro de que quieres borrar ${selectedIds.length} usuario(s)? Esta acción no se puede deshacer.`}
                confirmText="Borrar"
            />
        </div>
    );
};

export default UserManagementPage;
