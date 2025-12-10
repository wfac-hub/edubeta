

import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { Plus, BookOpenCheck, Search, Filter, Calendar } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { TaughtSession, Role } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const WikiSessionsPage = () => {
    const { taughtSessions, wikiLessons, teachers, addTaughtSession } = useData();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Filters state
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        teacherId: '',
        searchTerm: '',
        lessonTerm: ''
    });

    const [newSession, setNewSession] = useState<Partial<TaughtSession>>({
        date: new Date().toISOString().split('T')[0],
        duration: 60,
        group: '',
        notes: ''
    });

    const filteredSessions = useMemo(() => {
        return taughtSessions.filter(session => {
            // Permission filter (Teachers only see their own, Admins see all)
            if (user?.role !== Role.ADMIN && session.teacherId !== user?.id) return false;

            // Teacher filter (for admins)
            if (filters.teacherId && String(session.teacherId) !== filters.teacherId) return false;

            // Date Range filter
            if (filters.startDate && new Date(session.date) < new Date(filters.startDate)) return false;
            if (filters.endDate && new Date(session.date) > new Date(filters.endDate)) return false;

            // Search term (Group/Class name)
            if (filters.searchTerm && !session.group.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;

            // Lesson term
            const lessonTitle = wikiLessons.find(l => l.id === session.lessonId)?.title || '';
            if (filters.lessonTerm && !lessonTitle.toLowerCase().includes(filters.lessonTerm.toLowerCase())) return false;

            return true;
        }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [taughtSessions, user, filters, wikiLessons]);

    const handleSubmit = () => {
        if (!user || !newSession.group || !newSession.lessonId) {
            alert('Completa los campos obligatorios');
            return;
        }
        addTaughtSession({
            id: 0,
            teacherId: user.id,
            date: newSession.date!,
            duration: newSession.duration!,
            group: newSession.group!,
            lessonId: newSession.lessonId,
            notes: newSession.notes
        });
        setIsModalOpen(false);
    };

    const getLessonTitle = (id?: number) => {
        return wikiLessons.find(l => l.id === id)?.title || 'Lección eliminada';
    };

    const getTeacherName = (id: number) => {
        const t = teachers.find(t => t.id === id);
        return t ? `${t.name} ${t.lastName}` : 'Desconocido';
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <BookOpenCheck /> Sesiones Impartidas
                </h1>
                <Button leftIcon={<Plus size={16}/>} onClick={() => setIsModalOpen(true)}>Registrar Sesión</Button>
            </div>

            {/* Filters Panel */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-3 text-gray-500 text-sm font-medium">
                    <Filter size={16} /> Filtros de búsqueda
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <input 
                        type="date" 
                        name="startDate" 
                        value={filters.startDate} 
                        onChange={handleFilterChange} 
                        className="p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600 text-sm" 
                        placeholder="Desde"
                    />
                    <input 
                        type="date" 
                        name="endDate" 
                        value={filters.endDate} 
                        onChange={handleFilterChange} 
                        className="p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600 text-sm" 
                        placeholder="Hasta"
                    />
                    {user?.role === Role.ADMIN && (
                        <select 
                            name="teacherId" 
                            value={filters.teacherId} 
                            onChange={handleFilterChange} 
                            className="p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600 text-sm"
                        >
                            <option value="">Todos los profesores</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name} {t.lastName}</option>)}
                        </select>
                    )}
                    <div className="relative">
                        <input 
                            type="text" 
                            name="searchTerm"
                            placeholder="Buscar por Grupo..." 
                            value={filters.searchTerm} 
                            onChange={handleFilterChange} 
                            className="w-full p-2 pl-8 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600 text-sm"
                        />
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <div className="relative">
                        <input 
                            type="text" 
                            name="lessonTerm"
                            placeholder="Buscar por Lección..." 
                            value={filters.lessonTerm} 
                            onChange={handleFilterChange} 
                            className="w-full p-2 pl-8 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600 text-sm"
                        />
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-slate-700">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-200">
                        <tr>
                            <th className="p-4">Fecha</th>
                            {user?.role === Role.ADMIN && <th className="p-4">Profesor</th>}
                            <th className="p-4">Grupo</th>
                            <th className="p-4">Lección Impartida</th>
                            <th className="p-4">Duración</th>
                            <th className="p-4">Notas</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-700">
                        {filteredSessions.map(session => (
                            <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <span>{new Date(session.date).toLocaleDateString()}</span>
                                        {session.courseClassId && (
                                            <span title="Vinculada al calendario" className="text-primary-500">
                                                <Calendar size={14} />
                                            </span>
                                        )}
                                    </div>
                                </td>
                                {user?.role === Role.ADMIN && <td className="p-4">{getTeacherName(session.teacherId)}</td>}
                                <td className="p-4 font-medium">{session.group}</td>
                                <td className="p-4 text-primary-600">
                                    {session.lessonId ? (
                                        <Link to={`/wiki/lesson/${session.lessonId}`} className="hover:underline font-medium">
                                            {getLessonTitle(session.lessonId)}
                                        </Link>
                                    ) : (
                                        getLessonTitle(session.lessonId)
                                    )}
                                </td>
                                <td className="p-4">{session.duration} min</td>
                                <td className="p-4 text-gray-500 truncate max-w-xs" title={session.notes}>{session.notes}</td>
                            </tr>
                        ))}
                        {filteredSessions.length === 0 && (
                            <tr>
                                <td colSpan={user?.role === Role.ADMIN ? 6 : 5} className="p-8 text-center text-gray-500">No se encontraron sesiones con los filtros actuales.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Sesión Impartida">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha</label>
                            <input type="date" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-gray-600" value={newSession.date} onChange={e => setNewSession({...newSession, date: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Duración (min)</label>
                            <input type="number" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-gray-600" value={newSession.duration} onChange={e => setNewSession({...newSession, duration: parseInt(e.target.value)})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Grupo / Clase</label>
                        <input type="text" placeholder="Ej: Robótica Lunes Tarde" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-gray-600" value={newSession.group} onChange={e => setNewSession({...newSession, group: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Lección Impartida</label>
                        <select className="w-full p-2 border rounded dark:bg-slate-700 dark:border-gray-600" value={newSession.lessonId || ''} onChange={e => setNewSession({...newSession, lessonId: parseInt(e.target.value)})}>
                            <option value="">Seleccionar lección...</option>
                            {wikiLessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Notas / Incidencias</label>
                        <textarea className="w-full p-2 border rounded dark:bg-slate-700 dark:border-gray-600" rows={3} value={newSession.notes} onChange={e => setNewSession({...newSession, notes: e.target.value})}></textarea>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSubmit}>Guardar</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default WikiSessionsPage;
