import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { Plus, Trash2, Globe, Copy, Edit, Check, X, ExternalLink, Eye, List } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { LandingPage } from '../../types';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const LandingPagesListPage = () => {
    const { landingPages, deleteLandingPages, updateLandingPage, landingCustomFields } = useData();
    const navigate = useNavigate();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const filteredLandings = useMemo(() => {
        return landingPages.filter(l => 
            l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.slug.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [landingPages, searchTerm]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredLandings.map(l => l.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleDelete = () => {
        deleteLandingPages(selectedIds);
        setSelectedIds([]);
        setIsDeleteConfirmOpen(false);
    };

    const handleDuplicate = () => {
        if (selectedIds.length !== 1) return;
        const original = landingPages.find(l => l.id === selectedIds[0]);
        if (original) {
            const copy: LandingPage = {
                ...original,
                id: 0, // New ID
                title: `${original.title} (Copia)`,
                slug: `${original.slug}-copia`,
                isActive: false,
                visits: 0,
                conversions: 0
            };
            updateLandingPage(copy);
            setSelectedIds([]);
        }
    };

    const handleToggleActive = (landing: LandingPage) => {
        updateLandingPage({ ...landing, isActive: !landing.isActive });
    };

    const handleToggleDefault = (landing: LandingPage) => {
        // Set all others to non-default if setting this one to true
        if (!landing.isDefault) {
            landingPages.forEach(l => {
                if (l.id !== landing.id && l.isDefault) {
                    updateLandingPage({ ...l, isDefault: false });
                }
            });
        }
        updateLandingPage({ ...landing, isDefault: !landing.isDefault });
    };

    const handleOpenPublic = (slug: string) => {
        // Funcionalidad deshabilitada temporalmente
        alert("La página de registro público está deshabilitada actualmente.");
    };
    
    const getFieldsCount = (landingId: number) => {
        return landingCustomFields.filter(f => f.landingId === landingId).length;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Landings de inscripción online</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Las landings de inscripción te permiten crear todas las URL de inscripción online que necesites y configurar qué cursos se ofrecen en cada una de ellas.
                    </p>
                </div>
                <span className="font-semibold text-gray-500 dark:text-gray-400">{filteredLandings.length} Resultados</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<Edit size={16} />} disabled={selectedIds.length !== 1} onClick={() => navigate(`/center-management/landing-pages/${selectedIds[0]}/edit`)}>Modificar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Copy size={16} />} disabled={selectedIds.length !== 1} onClick={handleDuplicate}>Duplicar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />} disabled={selectedIds.length === 0} onClick={() => setIsDeleteConfirmOpen(true)}>Borrar</Button>
                    <Button variant="secondary" size="sm" onClick={() => alert("Funcionalidad 'Exportar inscripciones' simulada")}>Exportar inscripciones</Button>
                    
                    <div className="flex-grow"></div>
                    <Link to="/center-management/landing-pages/new">
                        <Button size="sm" leftIcon={<Plus size={16} />} className="bg-green-100 hover:bg-green-200 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900/50">INSCRIPCIÓN ON-LINE ACTIVA</Button>
                    </Link>
                    <div className="relative w-64">
                        <input 
                            type="text" 
                            placeholder="Buscar" 
                            className="w-full p-2 pl-8 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 focus:ring-primary-500 focus:border-primary-500" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <table className="min-w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-4 w-10"><input type="checkbox" onChange={handleSelectAll} checked={filteredLandings.length > 0 && selectedIds.length === filteredLandings.length} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-primary-600 focus:ring-primary-500"/></th>
                            <th className="px-6 py-3 font-medium">Id</th>
                            <th className="px-6 py-3 font-medium">Título</th>
                            <th className="px-6 py-3 font-medium">¿Qué cursos ofrece la landing?</th>
                            <th className="px-6 py-3 font-medium">Campos</th>
                            <th className="px-6 py-3 font-medium text-center">¿Activa?</th>
                            <th className="px-6 py-3 font-medium text-center">¿Por defecto?</th>
                            <th className="px-6 py-3 font-medium">URL</th>
                            <th className="px-6 py-3 font-medium">Inscripciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {filteredLandings.map(landing => (
                            <tr key={landing.id} className={`hover:bg-gray-50 dark:hover:bg-slate-700/30 ${!landing.isActive ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                                <td className="p-4"><input type="checkbox" checked={selectedIds.includes(landing.id)} onChange={() => handleSelectOne(landing.id)} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-primary-600 focus:ring-primary-500" /></td>
                                <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">
                                    <Link to={`/center-management/landing-pages/${landing.id}/edit`} className="hover:underline">{landing.id}</Link>
                                </td>
                                <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">
                                    <Link to={`/center-management/landing-pages/${landing.id}/edit`} className="hover:underline">{landing.title}</Link>
                                </td>
                                <td className="px-6 py-4">
                                    {landing.offeredCourseIds.length > 0 ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs">
                                            <Eye size={12}/> {landing.offeredCourseIds.length} cursos filtrados
                                        </span>
                                    ) : (
                                        <span className="text-red-500 text-xs italic">No hay cursos configurados</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <Link to={`/center-management/landing-pages/${landing.id}/fields`} className="flex items-center text-blue-600 dark:text-blue-400 font-bold hover:underline">
                                        <List size={16} className="mr-1" />
                                        {getFieldsCount(landing.id)}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleToggleActive(landing)}>
                                        {landing.isActive ? <Check size={18} className="text-green-600 mx-auto" strokeWidth={3} /> : <X size={18} className="text-red-600 mx-auto" strokeWidth={3} />}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleToggleDefault(landing)}>
                                         {landing.isDefault ? <Check size={18} className="text-green-600 mx-auto" strokeWidth={3} /> : <X size={18} className="text-red-600 mx-auto" strokeWidth={3} />}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Globe size={16} className="text-blue-500"/>
                                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">ES</span>
                                        <button onClick={() => handleOpenPublic(landing.slug)} className="p-1 border rounded hover:bg-gray-100 dark:hover:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-400" title="Ver página pública">
                                            <ExternalLink size={14} />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                        {landing.visits}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConfirmationModal 
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Borrar Landings"
                message={`¿Estás seguro de borrar ${selectedIds.length} landing(s)?`}
            />
        </div>
    );
};

export default LandingPagesListPage;