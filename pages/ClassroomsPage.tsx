
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Classroom } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ClassroomForm from '../components/forms/ClassroomForm';
import { Plus, Trash2, Pencil, BookOpen, MoreHorizontal, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClassroomsPage = () => {
    const { classrooms, courses, updateClassroom, deleteClassrooms } = useData();
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const showFeedback = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const classroomData = useMemo(() => {
        const courseCounts = courses.reduce((acc, course) => {
            if (course.classroomId) {
                acc[course.classroomId] = (acc[course.classroomId] || 0) + 1;
            }
            return acc;
        }, {} as Record<number, number>);

        return classrooms.map(classroom => ({
            ...classroom,
            courseCount: courseCounts[classroom.id] || 0,
        })).sort((a, b) => (a.order || 999) - (b.order || 999));
    }, [classrooms, courses]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedItems(classroomData.map(c => c.id));
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

    const handleOpenModal = (classroom: Classroom | null) => {
        setEditingClassroom(classroom);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClassroom(null);
    };
    
    const handleSave = (data: Classroom) => {
        updateClassroom(data);
        handleCloseModal();
        setSelectedItems([]);
        showFeedback(data.id === 0 ? 'Aula creada correctamente' : 'Aula actualizada correctamente');
    };

    const handleDelete = () => {
        deleteClassrooms(selectedItems);
        setSelectedItems([]);
        showFeedback('Aulas eliminadas correctamente');
    };
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Aulas</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Las aulas de tu academia. Asocia a cada aula su localización y consulta la lista de cursos que tiene asignados.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />} onClick={() => handleOpenModal(null)}>Alta</Button>
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
                    {classroomData.map(classroom => (
                        <div key={classroom.id} className="group">
                            <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === classroom.id ? null : classroom.id)}>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(classroom.id)}
                                    onChange={() => handleSelectOne(classroom.id)}
                                    onClick={e => e.stopPropagation()}
                                    className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 mt-1"
                                />
                                <div className="w-5 h-5 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: classroom.color }}></div>
                                <div className="flex-grow">
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(classroom); }} className="font-medium text-blue-600 dark:text-blue-400 hover:underline text-left">
                                        {classroom.name}
                                    </button>
                                    <div className="text-sm text-gray-500">{classroom.location}</div>
                                </div>
                                <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === classroom.id ? 'rotate-90' : ''}`} />
                            </div>
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === classroom.id ? 'max-h-[500px]' : ''}`}>
                                <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-2">
                                     <div className="flex justify-between"><span className="font-semibold">Localización:</span> <span>{classroom.location}</span></div>
                                     <div className="flex justify-between"><span className="font-semibold">Cursos:</span> <Link to={`/aux-tables/classrooms/${classroom.id}/courses`} className="flex items-center gap-2 text-blue-500 font-semibold hover:underline">
                                        <BookOpen size={16} />
                                        <span>{classroom.courseCount}</span>
                                    </Link></div>
                                    <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-slate-600">
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(classroom)}><Pencil size={14} /></Button>
                                    </div>
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
                                    checked={selectedItems.length === classroomData.length && classroomData.length > 0}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
                                />
                            </th>
                            <th scope="col" className="px-6 py-3">Color calendario</th>
                            <th scope="col" className="px-6 py-3">Localización</th>
                            <th scope="col" className="px-6 py-3">Nombre aula</th>
                            <th scope="col" className="px-6 py-3">Cursos</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {classroomData.map((classroom) => (
                            <tr key={classroom.id} className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-600/50">
                                <td className="w-4 p-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(classroom.id)}
                                            onChange={() => handleSelectOne(classroom.id)}
                                            className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
                                        />
                                        <button onClick={() => handleOpenModal(classroom)} className="text-gray-400 hover:text-primary-600"><Pencil size={14} /></button>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: classroom.color }}></div>
                                </td>
                                <td className="px-6 py-4">{classroom.location}</td>
                                <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap hover:underline cursor-pointer" onClick={() => handleOpenModal(classroom)}>
                                    {classroom.name}
                                </td>
                                <td className="px-6 py-4">
                                    <Link to={`/aux-tables/classrooms/${classroom.id}/courses`} className="flex items-center gap-2 text-blue-500 font-semibold hover:underline">
                                        <BookOpen size={16} />
                                        <span>{classroom.courseCount}</span>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingClassroom ? 'Editar Aula' : 'Alta de Aula'}
            >
                <ClassroomForm
                    classroom={editingClassroom}
                    onSave={handleSave}
                    onClose={handleCloseModal}
                />
            </Modal>
        </div>
    );
};

export default ClassroomsPage;
