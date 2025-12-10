
import React, { useState } from 'react';
import Button from '../components/ui/Button';
import { Holiday } from '../types';
import { useData } from '../contexts/DataContext';
import { Eye, Plus, Pencil, Trash2, MoreHorizontal, CheckCircle } from 'lucide-react';
import Modal from '../components/ui/Modal';
import HolidayForm from '../components/forms/HolidayForm';

const formatDate = (date: Holiday['date']): string => {
    switch (date.type) {
        case 'specific':
            return `${date.day}/${date.month}/${date.year}`;
        case 'recurring':
            return `Cada ${date.day}/${date.month}`;
        case 'range':
            return `Del ${date.startDate} al ${date.endDate}`;
        default:
            return 'Fecha no válida';
    }
}

const HolidaysPage = () => {
    const { holidays, locations, updateHoliday, deleteHolidays } = useData();
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const showFeedback = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedItems(holidays.map(h => h.id));
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

    const handleOpenModal = (holiday: Holiday | null) => {
        setEditingHoliday(holiday);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingHoliday(null);
    };

    const handleSave = (data: Holiday) => {
        updateHoliday(data);
        handleCloseModal();
        setSelectedItems([]);
        showFeedback(data.id === 0 ? 'Día festivo creado correctamente' : 'Día festivo actualizado correctamente');
    };

    const handleDelete = () => {
        deleteHolidays(selectedItems);
        setSelectedItems([]);
        showFeedback('Días festivos eliminados correctamente');
    };

    const handleModify = () => {
        if (selectedItems.length === 1) {
            const holidayToEdit = holidays.find(h => h.id === selectedItems[0]);
            if (holidayToEdit) {
                handleOpenModal(holidayToEdit);
            }
        }
    };
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Días festivos</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Entra los días en los que la academia está cerrada. Esta información la utilizará el programa para calcular las asistencias, etc.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<Eye size={16} />}>Consulta</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />} onClick={() => handleOpenModal(null)}>Alta</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Pencil size={16} />} onClick={handleModify} disabled={selectedItems.length !== 1}>Modificar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />} onClick={handleDelete} disabled={selectedItems.length === 0}>Borrar</Button>
                    {successMsg && (
                        <div className="ml-auto flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-fade-in bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-md">
                            <CheckCircle size={16} />
                            {successMsg}
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {/* Mobile View (up to LG) */}
                <div className="lg:hidden divide-y divide-gray-200 dark:divide-slate-700">
                    {holidays.map(holiday => (
                        <div key={holiday.id} className="group">
                             <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === holiday.id ? null : holiday.id)}>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(holiday.id)}
                                    onChange={() => handleSelectOne(holiday.id)}
                                    onClick={e => e.stopPropagation()}
                                    className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 mt-1"
                                />
                                <div className="flex-grow">
                                     <button onClick={(e) => { e.stopPropagation(); handleOpenModal(holiday); }} className="font-medium text-blue-600 dark:text-blue-400 hover:underline text-left">
                                        {holiday.name}
                                    </button>
                                </div>
                                 <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === holiday.id ? 'rotate-90' : ''}`} />
                            </div>
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === holiday.id ? 'max-h-[500px]' : ''}`}>
                                <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-2">
                                     <div className="flex justify-between"><span className="font-semibold">Fecha:</span> <span>{formatDate(holiday.date)}</span></div>
                                     <div className="flex justify-between"><span className="font-semibold">Festivo en:</span> <span>{holiday.location || 'General'}</span></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Desktop View (from LG) */}
                <table className="hidden lg:table min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                        <tr>
                            <th scope="col" className="p-4">
                                <input 
                                    type="checkbox"
                                    checked={selectedItems.length === holidays.length && holidays.length > 0}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500"
                                />
                            </th>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Fecha</th>
                            <th scope="col" className="px-6 py-3">Solo festivo en</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {holidays.map((holiday) => (
                            <tr key={holiday.id} className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-600/50">
                                <td className="w-4 p-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(holiday.id)}
                                            onChange={() => handleSelectOne(holiday.id)}
                                            className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500"
                                        />
                                        <button onClick={() => handleOpenModal(holiday)} className="text-gray-400 hover:text-primary-600"><Pencil size={14} /></button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap hover:underline cursor-pointer" onClick={() => handleOpenModal(holiday)}>{holiday.name}</td>
                                <td className="px-6 py-4">{formatDate(holiday.date)}</td>
                                <td className="px-6 py-4">{holiday.location || ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingHoliday ? 'Editar Día Festivo' : 'Nuevo Día Festivo'}
            >
                <HolidayForm
                    holiday={editingHoliday}
                    onSave={handleSave}
                    onClose={handleCloseModal}
                />
            </Modal>
        </div>
    );
};

export default HolidaysPage;
