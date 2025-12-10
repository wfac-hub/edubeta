import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { Teacher } from '../types';
import Button from '../components/ui/Button';
import { PlusCircle, Edit, Trash, Mail, MessageSquare, FileText, Bell, Search, Check, X, Calendar, Folder, MoreHorizontal } from 'lucide-react';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const getRandomColor = (char: string) => {
    let hash = 0;
    for (let i = 0; i < char.length; i++) {
        hash = char.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316'];
    const index = Math.abs(hash % colors.length);
    return colors[index];
};


const TeachersPage = () => {
    const { teachers, deleteTeachers, updateTeacher, teacherStatsMap } = useData();
    const navigate = useNavigate();

    const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [togglingTeacher, setTogglingTeacher] = useState<Teacher | null>(null);

    const filteredTeachers = useMemo(() => {
        return teachers.filter(teacher =>
            `${teacher.name} ${teacher.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [teachers, searchTerm]);
    
    const handleToggleActive = (teacher: Teacher) => {
        setTogglingTeacher(teacher);
    };

    const confirmToggleActive = () => {
        if (togglingTeacher) {
            updateTeacher({ ...togglingTeacher, isActive: !togglingTeacher.isActive });
            setTogglingTeacher(null);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedTeacherIds(filteredTeachers.map(t => t.id));
        } else {
            setSelectedTeacherIds([]);
        }
    };

    const handleSelectOne = (id: number) => {
        setSelectedTeacherIds(prev => prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]);
    };

    const handleModify = () => {
        if (selectedTeacherIds.length === 1) {
            navigate(`/teachers/${selectedTeacherIds[0]}/edit`);
        }
    };
    
    const handleDelete = () => {
        deleteTeachers(selectedTeacherIds);
        setSelectedTeacherIds([]);
    }

    const handleTogglePermission = (teacher: Teacher, permission: keyof Teacher['permissions']) => {
        const updatedTeacher = {
            ...teacher,
            permissions: {
                ...teacher.permissions,
                [permission]: !teacher.permissions[permission]
            }
        };
        updateTeacher(updatedTeacher);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Profesores</h1>
                 <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">{filteredTeachers.length} Resultados</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<PlusCircle size={16} />} onClick={() => navigate('/teachers/new/edit')}>Alta</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Edit size={16} />} disabled={selectedTeacherIds.length !== 1} onClick={handleModify}>Modificar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash size={16} />} disabled={selectedTeacherIds.length === 0} onClick={handleDelete}>Borrar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Bell size={16} />}>Nueva notificación</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Mail size={16} />}>Enviar E-mail</Button>
                    <Button variant="secondary" size="sm" leftIcon={<FileText size={16} />}>Informe horas</Button>
                    <Button variant="secondary" size="sm" leftIcon={<MessageSquare size={16} />}>Enviar WhatsApp</Button>
                    <div className="flex-grow"></div>
                     <div className="relative w-full sm:w-64">
                         <input type="text" placeholder="Buscar" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 pl-4 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 focus:ring-primary-500 focus:border-primary-500" />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {/* Mobile View (up to LG) */}
                 <div className="lg:hidden divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredTeachers.map(teacher => {
                        const initials = `${teacher.name[0]}${teacher.lastName[0]}`;
                        const stats = teacherStatsMap[teacher.id] || { coursesCount: 0, hoursCount: 0, docsCount: 0 };

                        return (
                            <div key={teacher.id} className={`group ${!teacher.isActive ? 'bg-red-50 dark:bg-red-900/20 opacity-70' : ''}`}>
                                <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === teacher.id ? null : teacher.id)}>
                                     <input type="checkbox" checked={selectedTeacherIds.includes(teacher.id)} onChange={() => handleSelectOne(teacher.id)} onClick={e => e.stopPropagation()} className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 mt-1"/>
                                    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-sm" style={{backgroundColor: getRandomColor(initials)}}>{initials}</div>
                                    <div className="flex-grow">
                                        <Link to={`/teachers/${teacher.id}/edit`} onClick={e => e.stopPropagation()} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">{teacher.name} {teacher.lastName}</Link>
                                        <div className="text-sm text-gray-500">{teacher.email}</div>
                                    </div>
                                    <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === teacher.id ? 'rotate-90' : ''}`} />
                                </div>
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === teacher.id ? 'max-h-[500px]' : ''}`}>
                                    <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span className="font-semibold">Activo:</span>
                                            <button onClick={(e) => { e.stopPropagation(); handleToggleActive(teacher); }}>
                                                {teacher.isActive ? <Check className="text-green-500" /> : <X className="text-red-500"/>}
                                            </button>
                                        </div>
                                        <div className="flex justify-between"><span className="font-semibold">Cursos:</span> <Link to={`/teachers/${teacher.id}/courses`} className="flex items-center gap-1 text-blue-500 hover:underline"><Calendar size={14}/><span>{stats.coursesCount}</span></Link></div>
                                        <div className="flex justify-between"><span className="font-semibold">Horas:</span> <Link to={`/teachers/${teacher.id}/hours`} className="flex items-center gap-1 text-blue-500 hover:underline"><Calendar size={14}/><span>{stats.hoursCount.toFixed(2)}</span></Link></div>
                                        <div className="flex justify-between"><span className="font-semibold">Docs:</span> <Link to={`/teachers/${teacher.id}/docs`} className="flex items-center gap-1 text-blue-500 hover:underline"><Folder size={14}/><span>{stats.docsCount}</span></Link></div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                {/* Desktop View (from LG) */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                            <tr>
                                <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" /></th>
                                <th scope="col" className="px-6 py-3">Nombre Completo</th>
                                <th scope="col" className="px-6 py-3">Email profesor</th>
                                <th scope="col" className="px-6 py-3">¿Activo?</th>
                                <th scope="col" className="px-6 py-3">Cursos</th>
                                <th scope="col" className="px-6 py-3">Horas</th>
                                <th scope="col" className="px-6 py-3">Docs</th>
                                <th scope="col" className="px-6 py-3"></th>
                                <th scope="col" className="px-6 py-3">¿Emails?</th>
                                <th scope="col" className="px-6 py-3">¿Informes?</th>
                                <th scope="col" className="px-6 py-3">¿Comentario?</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredTeachers.map(teacher => {
                                const initials = `${teacher.name[0]}${teacher.lastName[0]}`;
                                const stats = teacherStatsMap[teacher.id] || { coursesCount: 0, hoursCount: 0, docsCount: 0 };

                                return (
                                    <tr key={teacher.id} className={`hover:bg-gray-50 dark:hover:bg-slate-600/50 ${!teacher.isActive ? 'bg-red-50 dark:bg-red-900/20 opacity-70' : 'bg-white dark:bg-slate-800'}`}>
                                        <td className="w-4 p-4">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" checked={selectedTeacherIds.includes(teacher.id)} onChange={() => handleSelectOne(teacher.id)} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" />
                                                <button onClick={() => navigate(`/teachers/${teacher.id}/edit`)} className="text-gray-400 hover:text-primary-600"><Edit size={14} /></button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/teachers/${teacher.id}/edit`} className="flex items-center gap-3 group">
                                                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-sm" style={{backgroundColor: getRandomColor(initials)}}>
                                                    {initials}
                                                </div>
                                                <span className="font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap group-hover:underline">{teacher.name} {teacher.lastName}</span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">{teacher.email}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleToggleActive(teacher)}>
                                                {teacher.isActive ? <Check className="text-green-500" /> : <X className="text-red-500"/>}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/teachers/${teacher.id}/courses`} className="flex items-center gap-1 text-blue-500 hover:underline"><Calendar size={14}/><span>{stats.coursesCount}</span></Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/teachers/${teacher.id}/hours`} className="flex items-center gap-1 text-blue-500 hover:underline"><Calendar size={14}/><span>{stats.hoursCount.toFixed(2)}</span></Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/teachers/${teacher.id}/docs`} className="flex items-center gap-1 text-blue-500 hover:underline"><Folder size={14}/><span>{stats.docsCount}</span></Link>
                                        </td>
                                        <td className="px-6 py-4"><Button variant="secondary" size="sm" onClick={() => navigate(`/teachers/${teacher.id}/change-password`)}>Cambia contraseña</Button></td>
                                        <td className="px-6 py-4 text-center cursor-pointer" onClick={() => handleTogglePermission(teacher, 'canSendEmails')}>
                                            {teacher.permissions.canSendEmails ? <Check className="text-green-500" /> : <X className="text-red-500"/>}
                                        </td>
                                        <td className="px-6 py-4 text-center cursor-pointer" onClick={() => handleTogglePermission(teacher, 'canSendReports')}>
                                            {teacher.permissions.canSendReports ? <Check className="text-green-500" /> : <X className="text-red-500"/>}
                                        </td>
                                        <td className="px-6 py-4 text-center cursor-pointer" onClick={() => handleTogglePermission(teacher, 'canEditStudentAreaComments')}>
                                            {teacher.permissions.canEditStudentAreaComments ? <Check className="text-green-500" /> : <X className="text-red-500"/>}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <ConfirmationModal
                isOpen={!!togglingTeacher}
                onClose={() => setTogglingTeacher(null)}
                onConfirm={confirmToggleActive}
                title="Confirmar cambio de estado"
                message={`¿Estás seguro de que quieres ${togglingTeacher?.isActive ? 'desactivar' : 'activar'} a ${togglingTeacher?.name} ${togglingTeacher?.lastName}?`}
            />
        </div>
    );
};

export default TeachersPage;
