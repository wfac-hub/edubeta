
import React, { useState } from 'react';
import Button from '../components/ui/Button';
import { WeekSchedule } from '../types';
import { useData } from '../contexts/DataContext';
import { Plus, Pencil, Trash2, MoreHorizontal, CheckCircle } from 'lucide-react';
import Modal from '../components/ui/Modal';
import WeekScheduleForm from '../components/forms/WeekScheduleForm';

const WeekSchedulesPage = () => {
    const { schedules, updateSchedule, deleteSchedules } = useData();
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<WeekSchedule | null>(null);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const showFeedback = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedItems(schedules.map(s => s.id));
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

    const handleOpenModal = (schedule: WeekSchedule | null) => {
        setEditingSchedule(schedule);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSchedule(null);
    };

    const handleSave = (data: WeekSchedule) => {
        updateSchedule(data);
        handleCloseModal();
        setSelectedItems([]);
        showFeedback(data.id === 0 ? 'Horario creado correctamente' : 'Horario actualizado correctamente');
    };

    const handleDelete = () => {
        deleteSchedules(selectedItems);
        setSelectedItems([]);
        showFeedback('Horarios eliminados correctamente');
    };

    const handleModify = () => {
        if (selectedItems.length === 1) {
            const scheduleToEdit = schedules.find(s => s.id === selectedItems[0]);
            if (scheduleToEdit) {
                handleOpenModal(scheduleToEdit);
            }
        }
    };
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Horarios de semana</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Hay que entrar todos los horarios que se hacen durante la semana. Estos horarios se utilizarán posteriormente para aplicarlos a los cursos y poder controlar la asistencia.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                 <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />} onClick={() => handleOpenModal(null)}>Alta</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Pencil size={16} />} onClick={handleModify} disabled={selectedItems.length !== 1}>Modificar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />} onClick={handleDelete} disabled={selectedItems.length === 0}>Borrar</Button>
                    {successMsg && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-fade-in bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-md">
                            <CheckCircle size={16} />
                            {successMsg}
                        </div>
                    )}
                    <div className="flex-grow"></div>
                    <select className="p-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-300 focus:ring-primary-500 focus:border-primary-500 min-w-[150px]">
                        <option value="">Día de la semana</option>
                        <option value="lunes">Lunes</option>
                        <option value="martes">Martes</option>
                        <option value="miércoles">Miércoles</option>
                        <option value="jueves">Jueves</option>
                        <option value="viernes">Viernes</option>
                        <option value="sábado">Sábado</option>
                        <option value="domingo">Domingo</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {/* Mobile View (up to LG) */}
                <div className="lg:hidden divide-y divide-gray-200 dark:divide-slate-700">
                    {schedules.map(schedule => (
                        <div key={schedule.id} className="group">
                             <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === schedule.id ? null : schedule.id)}>
                                <div className="flex items-center gap-3 mt-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(schedule.id)}
                                        onChange={() => handleSelectOne(schedule.id)}
                                        onClick={e => e.stopPropagation()}
                                        className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500"
                                    />
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(schedule); }} className="text-gray-400 hover:text-primary-600"><Pencil size={14} /></button>
                                </div>
                                <div className="flex-grow">
                                     <button onClick={(e) => { e.stopPropagation(); handleOpenModal(schedule); }} className="font-medium text-blue-600 dark:text-blue-400 hover:underline text-left">
                                        {schedule.name}
                                    </button>
                                </div>
                                 <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === schedule.id ? 'rotate-90' : ''}`} />
                            </div>
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === schedule.id ? 'max-h-[500px]' : ''}`}>
                                <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-2">
                                     <div className="flex justify-between"><span className="font-semibold">Día de la semana:</span> <span>{schedule.day}</span></div>
                                     <div className="flex justify-between"><span className="font-semibold">Hora entrada:</span> <span>{schedule.startTime}</span></div>
                                     <div className="flex justify-between"><span className="font-semibold">Hora salida:</span> <span>{schedule.endTime}</span></div>
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
                                        checked={selectedItems.length === schedules.length && schedules.length > 0}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500"
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3">Nombre descriptivo</th>
                                <th scope="col" className="px-6 py-3">Día de la semana</th>
                                <th scope="col" className="px-6 py-3">Hora entrada</th>
                                <th scope="col" className="px-6 py-3">Hora salida</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map((schedule) => (
                                <tr key={schedule.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50">
                                    <td className="w-4 p-4">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(schedule.id)}
                                                onChange={() => handleSelectOne(schedule.id)}
                                                className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500"
                                            />
                                            <button onClick={() => handleOpenModal(schedule)} className="text-gray-400 hover:text-primary-600"><Pencil size={14} /></button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap hover:underline cursor-pointer" onClick={() => handleOpenModal(schedule)}>{schedule.name}</td>
                                    <td className="px-6 py-4">{schedule.day}</td>
                                    <td className="px-6 py-4">{schedule.startTime}</td>
                                    <td className="px-6 py-4">{schedule.endTime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

             <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingSchedule ? 'Editar Horario' : 'Nuevo Horario'}
            >
                <WeekScheduleForm
                    schedule={editingSchedule}
                    onSave={handleSave}
                    onClose={handleCloseModal}
                />
            </Modal>
        </div>
    );
};

export default WeekSchedulesPage;
