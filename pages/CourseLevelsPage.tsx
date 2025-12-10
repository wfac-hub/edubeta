
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { CourseLevel } from '../types';
import Button from '../components/ui/Button';
import { Plus, Trash2, Pencil, Search, BookOpen, Check, X, ArrowUp, ArrowDown, Copy, Eye, MoveLeft, List, MoreHorizontal, CheckCircle } from 'lucide-react';
import Modal from '../components/ui/Modal';
import CourseLevelForm from '../components/forms/CourseLevelForm';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const CourseLevelsPage = () => {
    const { groupId } = useParams();
    const { goBack } = useNavigationHistory();
    const { levelGroups, courseLevels, courses, updateCourseLevel, deleteCourseLevels, moveCourseLevel } = useData();

    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLevel, setEditingLevel] = useState<CourseLevel | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [togglingLevel, setTogglingLevel] = useState<CourseLevel | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const showFeedback = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const group = useMemo(() => levelGroups.find(g => g.id === parseInt(groupId || '0')), [levelGroups, groupId]);
    
    const levelsInGroup = useMemo(() => {
        return courseLevels
            .filter(level => level.groupId === group?.id)
            .filter(level => level.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => a.order - b.order);
    }, [courseLevels, group, searchTerm]);

    if (!group) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-semibold">Agrupación no encontrada</h2>
                <Link to="/center-management/level-grouping" className="text-blue-500 hover:underline mt-4 inline-block">Volver a la lista</Link>
            </div>
        );
    }
    
    const getCourseCount = (levelName: string) => {
        return courses.filter(c => c.level === levelName).length;
    };

    const handleToggleActive = (level: CourseLevel) => {
        setTogglingLevel(level);
    };

    const confirmToggleActive = () => {
        if (togglingLevel) {
            updateCourseLevel({ ...togglingLevel, isActive: !togglingLevel.isActive });
            setTogglingLevel(null);
            showFeedback(`Nivel ${!togglingLevel.isActive ? 'activado' : 'desactivado'} correctamente`);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedItems(levelsInGroup.map(l => l.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectOne = (id: number) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };
    
    const handleOpenModal = (level: CourseLevel | null) => {
        setEditingLevel(level);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingLevel(null);
    };

    const handleSave = (data: CourseLevel) => {
        updateCourseLevel(data);
        handleCloseModal();
        showFeedback(data.id === 0 ? 'Nivel creado correctamente' : 'Nivel actualizado correctamente');
    };

    const handleDelete = () => {
        deleteCourseLevels(selectedItems);
        setSelectedItems([]);
        showFeedback('Niveles eliminados correctamente');
    };

    const handleModify = () => {
        if (selectedItems.length === 1) {
            const levelToEdit = levelsInGroup.find(l => l.id === selectedItems[0]);
            if (levelToEdit) handleOpenModal(levelToEdit);
        }
    };

    const handleDuplicate = () => {
        if (selectedItems.length === 1) {
            const levelToDuplicate = levelsInGroup.find(l => l.id === selectedItems[0]);
            if (levelToDuplicate) {
                const newLevel: CourseLevel = {
                    ...levelToDuplicate,
                    id: 0, // Signal for creation
                    name: `Copia de ${levelToDuplicate.name}`,
                    order: Math.max(...levelsInGroup.map(l => l.order)) + 10,
                };
                handleOpenModal(newLevel);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                       <List /> Niveles - {group.name} {group.emoji}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Los niveles son tipologías de cursos que definen sus características principales, como los precios.
                    </p>
                </div>
                 <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">{levelsInGroup.length} Resultados</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16} />} onClick={goBack}>Volver</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Eye size={16} />}>Consulta</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />} onClick={() => handleOpenModal(null)}>Alta</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Pencil size={16} />} onClick={handleModify} disabled={selectedItems.length !== 1}>Modificar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Copy size={16} />} onClick={handleDuplicate} disabled={selectedItems.length !== 1}>Duplicar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />} onClick={handleDelete} disabled={selectedItems.length === 0}>Borrar</Button>
                    {successMsg && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-fade-in bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-md">
                            <CheckCircle size={16} />
                            {successMsg}
                        </div>
                    )}
                    <div className="flex-grow"></div>
                     <div className="relative w-full sm:w-64">
                         <input
                            type="text"
                            placeholder="Buscar"
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-4 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {/* Mobile View (up to LG) */}
                <div className="lg:hidden divide-y divide-gray-200 dark:divide-slate-700">
                    {levelsInGroup.map((level, index) => (
                         <div key={level.id} className={`group ${!level.isActive ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                             <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === level.id ? null : level.id)}>
                                 <div className="flex items-center gap-3 mt-1">
                                    <input type="checkbox" checked={selectedItems.includes(level.id)} onChange={() => handleSelectOne(level.id)} onClick={e => e.stopPropagation()} className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500" />
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(level); }} className="text-gray-400 hover:text-primary-600"><Pencil size={14} /></button>
                                </div>
                                <div className="flex-grow">
                                     <button onClick={(e) => { e.stopPropagation(); handleOpenModal(level); }} className="font-medium text-blue-600 dark:text-blue-400 hover:underline text-left">
                                        {level.name}
                                    </button>
                                </div>
                                 <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === level.id ? 'rotate-90' : ''}`} />
                            </div>
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === level.id ? 'max-h-[500px]' : ''}`}>
                                <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-2">
                                     <div className="flex justify-between"><span className="font-semibold">P. Mensual:</span> <span>{level.monthlyPrice.toFixed(2)} €</span></div>
                                     <div className="flex justify-between"><span className="font-semibold">P. Trimestral:</span> <span>{level.quarterlyPrice.toFixed(2)} €</span></div>
                                     <div className="flex justify-between"><span className="font-semibold">P. Único:</span> <span>{level.singlePrice.toFixed(2)} €</span></div>
                                     <div className="flex justify-between"><span className="font-semibold">P. Material:</span> <span>{level.materialPrice.toFixed(2)} €</span></div>
                                     <div className="flex justify-between"><span className="font-semibold">P. Matrícula:</span> <span>{level.enrollmentPrice.toFixed(2)} €</span></div>
                                     <div className="flex justify-between"><span className="font-semibold">Cursos:</span> 
                                        <Link to={`/center-management/course-levels/${level.id}/courses`} onClick={e => e.stopPropagation()} className="flex items-center gap-2 text-blue-500 font-semibold hover:underline">
                                            <BookOpen size={16}/>
                                            <span>{getCourseCount(level.name)}</span>
                                        </Link>
                                     </div>
                                     <div className="flex justify-between"><span className="font-semibold">Activo:</span> <button onClick={(e) => { e.stopPropagation(); handleToggleActive(level);}}>{level.isActive ? <Check size={20} className="text-green-500"/> : <X size={20} className="text-red-500"/>}</button></div>
                                     <div className="flex justify-between">
                                        <span className="font-semibold">Orden:</span> 
                                        <div className="flex items-center gap-1">
                                            <span>{level.order}</span>
                                            <div className="flex flex-col">
                                                <button onClick={(e) => { e.stopPropagation(); moveCourseLevel(level.id, 'up'); }} disabled={index === 0} className="disabled:opacity-20"><ArrowUp size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); moveCourseLevel(level.id, 'down'); }} disabled={index === levelsInGroup.length - 1} className="disabled:opacity-20"><ArrowDown size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Desktop View (from LG) */}
                <div className="hidden lg:block">
                    <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                            <tr>
                                <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={selectedItems.length === levelsInGroup.length && levelsInGroup.length > 0} className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500" /></th>
                                <th scope="col" className="px-6 py-3">Nombre</th>
                                <th scope="col" className="px-6 py-3">Precio pago mensual</th>
                                <th scope="col" className="px-6 py-3">Precio pago trimestral</th>
                                <th scope="col" className="px-6 py-3">Precio pago único</th>
                                <th scope="col" className="px-6 py-3">Precio material</th>
                                <th scope="col" className="px-6 py-3">Precio matrícula</th>
                                <th scope="col" className="px-6 py-3">Cursos</th>
                                <th scope="col" className="px-6 py-3">¿Activo?</th>
                                <th scope="col" className="px-6 py-3">Orden</th>
                            </tr>
                        </thead>
                        <tbody>
                            {levelsInGroup.map((level, index) => (
                                <tr key={level.id} className={`border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50 ${!level.isActive ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-slate-800'}`}>
                                    <td className="w-4 p-4">
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" checked={selectedItems.includes(level.id)} onChange={() => handleSelectOne(level.id)} className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500" />
                                            <button onClick={() => handleOpenModal(level)} className="text-gray-400 hover:text-primary-600"><Pencil size={14} /></button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap hover:underline cursor-pointer" onClick={() => handleOpenModal(level)}>{level.name}</td>
                                    <td className="px-6 py-4">{level.monthlyPrice.toFixed(2)} €</td>
                                    <td className="px-6 py-4">{level.quarterlyPrice.toFixed(2)} €</td>
                                    <td className="px-6 py-4">{level.singlePrice.toFixed(2)} €</td>
                                    <td className="px-6 py-4">{level.materialPrice.toFixed(2)} €</td>
                                    <td className="px-6 py-4">{level.enrollmentPrice.toFixed(2)} €</td>
                                    <td className="px-6 py-4">
                                        <Link to={`/center-management/course-levels/${level.id}/courses`} className="flex items-center gap-2 text-blue-500 font-semibold hover:underline">
                                            <BookOpen size={16}/>
                                            <span>{getCourseCount(level.name)}</span>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleToggleActive(level)}>
                                            {level.isActive ? <Check size={20} className="text-green-500"/> : <X size={20} className="text-red-500"/>}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <span>{level.order}</span>
                                            <div className="flex flex-col -my-1">
                                                <button onClick={() => moveCourseLevel(level.id, 'up')} disabled={index === 0} className="disabled:opacity-20 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-sm p-0.5"><ArrowUp size={14} /></button>
                                                <button onClick={() => moveCourseLevel(level.id, 'down')} disabled={index === levelsInGroup.length - 1} className="disabled:opacity-20 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-sm p-0.5"><ArrowDown size={14} /></button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingLevel ? `Editar Nivel: ${editingLevel.name}` : `Nuevo Nivel para ${group.name}`}
            >
                <CourseLevelForm
                    level={editingLevel}
                    groupId={group.id}
                    onSave={handleSave}
                    onClose={handleCloseModal}
                />
            </Modal>

            <ConfirmationModal
                isOpen={!!togglingLevel}
                onClose={() => setTogglingLevel(null)}
                onConfirm={confirmToggleActive}
                title="Confirmar cambio de estado"
                message={`¿Estás seguro de que quieres ${togglingLevel?.isActive ? 'desactivar' : 'activar'} el nivel "${togglingLevel?.name}"?`}
            />
        </div>
    );
};

export default CourseLevelsPage;
