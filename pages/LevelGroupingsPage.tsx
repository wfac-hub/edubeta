
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { LevelGroup } from '../types';
import Button from '../components/ui/Button';
import { Plus, Trash2, Pencil, Search, BookOpen, List, MoreHorizontal, CheckCircle } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { Link } from 'react-router-dom';
import LevelGroupForm from '../components/forms/LevelGroupForm';

const LevelGroupingsPage = () => {
    const { levelGroups, courseLevels, updateLevelGroup, deleteLevelGroups } = useData();
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<LevelGroup | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const showFeedback = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedItems(levelGroups.map(g => g.id));
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

    const handleOpenModal = (group: LevelGroup | null) => {
        setEditingGroup(group);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGroup(null);
    };

    const handleSave = (data: LevelGroup) => {
        updateLevelGroup(data);
        handleCloseModal();
        showFeedback(data.id === 0 ? 'Agrupación creada correctamente' : 'Agrupación actualizada correctamente');
    };

    const handleDelete = () => {
        deleteLevelGroups(selectedItems);
        setSelectedItems([]);
        showFeedback('Agrupaciones eliminadas correctamente');
    };
    
    const filteredGroups = useMemo(() => {
        return levelGroups.filter(group =>
            group.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, levelGroups]);

    const getLevelCount = (groupId: number) => {
        return courseLevels.filter(level => level.groupId === groupId).length;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2"><List /> Agrupaciones de niveles</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Las agrupaciones de niveles permiten tener agrupados en conjuntos lógicos que faciliten su presentación, por ejemplo, el programa de inscripciones online.
                    </p>
                </div>
                 <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">{filteredGroups.length} Resultados</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />} onClick={() => handleOpenModal(null)}>Alta</Button>
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
                    {filteredGroups.map(group => (
                         <div key={group.id} className="group">
                             <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === group.id ? null : group.id)}>
                                 <div className="flex items-center gap-3 mt-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(group.id)}
                                        onChange={() => handleSelectOne(group.id)}
                                        onClick={e => e.stopPropagation()}
                                        className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500"
                                    />
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(group); }} className="text-gray-400 hover:text-primary-600"><Pencil size={14} /></button>
                                </div>
                                <div className="flex-grow">
                                     <Link to={`/center-management/level-grouping/${group.id}`} onClick={e => e.stopPropagation()} className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                                        <span>{group.name}</span>
                                        <span>{group.emoji}</span>
                                    </Link>
                                </div>
                                 <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === group.id ? 'rotate-90' : ''}`} />
                            </div>
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === group.id ? 'max-h-[500px]' : ''}`}>
                                <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-2">
                                     <div className="flex justify-between"><span className="font-semibold">Niveles:</span> <Link to={`/center-management/level-grouping/${group.id}`} className="flex items-center gap-2 text-blue-500 font-semibold hover:underline">
                                        <BookOpen size={16}/>
                                        <span>{getLevelCount(group.id)}</span>
                                    </Link></div>
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
                                <th scope="col" className="p-4">
                                    <input 
                                        type="checkbox"
                                        checked={selectedItems.length === filteredGroups.length && filteredGroups.length > 0}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500"
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3">Nombre</th>
                                <th scope="col" className="px-6 py-3">Niveles</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGroups.map((group) => (
                                <tr key={group.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50">
                                    <td className="w-4 p-4">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(group.id)}
                                                onChange={() => handleSelectOne(group.id)}
                                                className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500"
                                            />
                                            <button onClick={() => handleOpenModal(group)} className="text-gray-400 hover:text-primary-600"><Pencil size={14} /></button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                        <Link to={`/center-management/level-grouping/${group.id}`} className="hover:underline flex items-center gap-2">
                                            <span>{group.name}</span>
                                            <span>{group.emoji}</span>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link to={`/center-management/level-grouping/${group.id}`} className="flex items-center gap-2 text-blue-500 font-semibold hover:underline">
                                            <BookOpen size={16}/>
                                            <span>{getLevelCount(group.id)}</span>
                                        </Link>
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
                title={editingGroup ? `Editar Agrupación: ${editingGroup.name}` : 'Nueva Agrupación de Niveles'}
            >
                <LevelGroupForm
                    group={editingGroup}
                    onSave={handleSave}
                    onClose={handleCloseModal}
                />
            </Modal>
        </div>
    );
};

export default LevelGroupingsPage;
