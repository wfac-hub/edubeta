
import React, { useState, useEffect } from 'react';
import { Course, WeekSchedule } from '../types';
import { useData } from '../contexts/DataContext';
import Modal from './ui/Modal';
import Button from './ui/Button';

interface ScheduleSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course;
    onSave: (selectedScheduleIds: number[]) => void;
}

const ScheduleSelectionModal: React.FC<ScheduleSelectionModalProps> = ({ isOpen, onClose, course, onSave }) => {
    const { schedules } = useData();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        if (course) {
            setSelectedIds(course.scheduleIds || []);
        }
    }, [course]);

    const handleToggleSchedule = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(scheduleId => scheduleId !== id) : [...prev, id]
        );
    };

    const handleSave = () => {
        onSave(selectedIds);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Seleccionar Horarios para ${course.name}`}
        >
            <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                    {schedules.map(schedule => (
                        <label
                            key={schedule.id}
                            className="flex items-center p-3 rounded-lg cursor-pointer transition-colors bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(schedule.id)}
                                onChange={() => handleToggleSchedule(schedule.id)}
                                className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="ml-4 font-medium text-gray-800 dark:text-gray-200">{schedule.name}</span>
                            <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">{schedule.day} | {schedule.startTime} - {schedule.endTime}</span>
                        </label>
                    ))}
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="button" onClick={handleSave}>Guardar Horarios</Button>
                </div>
            </div>
        </Modal>
    );
};

export default ScheduleSelectionModal;