
import React, { useState, useMemo } from 'react';
import Button from '../components/ui/Button';
import { Location, Classroom } from '../types';
import { useData } from '../contexts/DataContext';
import { Eye, Plus, Pencil, Trash2, Check, Building, MoreHorizontal, CheckCircle } from 'lucide-react';
import Modal from '../components/ui/Modal';
import LocationForm from '../components/forms/LocationForm';

const LocationsPage = () => {
    const { locations, populations, classrooms, updateLocation, deleteLocations } = useData();
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isClassroomListModalOpen, setIsClassroomListModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [viewingLocation, setViewingLocation] = useState<Location | null>(null);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const showFeedback = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedItems(locations.map(l => l.id));
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

    const handleOpenFormModal = (location: Location | null) => {
        setEditingLocation(location);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingLocation(null);
    };

    const handleOpenClassroomListModal = (location: Location) => {
        setViewingLocation(location);
        setIsClassroomListModalOpen(true);
    };
    
    const handleSave = (data: Location) => {
        updateLocation(data);
        handleCloseFormModal();
        setSelectedItems([]);
        showFeedback(data.id === 0 ? 'Localización creada correctamente' : 'Localización actualizada correctamente');
    };

    const handleDelete = () => {
        deleteLocations(selectedItems);
        setSelectedItems([]);
        showFeedback('Localizaciones eliminadas correctamente');
    };

    const handleModify = () => {
        if (selectedItems.length === 1) {
            const locationToEdit = locations.find(l => l.id === selectedItems[0]);
            if (locationToEdit) {
                handleOpenFormModal(locationToEdit);
            }
        }
    };

    const locationData = useMemo(() => {
        return locations.map(loc => {
            const linkedClassrooms = classrooms.filter(c => c.location === loc.name).length;
            return { ...loc, classroomCount: linkedClassrooms };
        });
    }, [locations, classrooms]);

    const classroomsInLocation = viewingLocation ? classrooms.filter(c => c.location === viewingLocation.name) : [];
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Localizaciones</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Entra las localizaciones de tu academia. Para cada una define sus aulas, de forma que se les pueda asignar los cursos correspondientes.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<Eye size={16} />}>Consulta</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />} onClick={() => handleOpenFormModal(null)}>Alta</Button>
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

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {/* Mobile View (up to LG) */}
                <div className="lg:hidden divide-y divide-gray-200 dark:divide-slate-700">
                    {locationData.map(location => (
                        <div key={location.id} className="group">
                             <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === location.id ? null : location.id)}>
                                <div className="flex items-center gap-3 mt-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(location.id)}
                                        onChange={() => handleSelectOne(location.id)}
                                        onClick={e => e.stopPropagation()}
                                        className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500"
                                    />
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenFormModal(location); }} className="text-gray-400 hover:text-primary-600"><Pencil size={14} /></button>
                                </div>
                                <div className="flex-grow">
                                     <button onClick={(e) => { e.stopPropagation(); handleOpenFormModal(location); }} className="font-medium text-blue-600 dark:text-blue-400 hover:underline text-left">
                                        {location.name}
                                    </button>
                                </div>
                                 <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === location.id ? 'rotate-90' : ''}`} />
                            </div>
                             <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === location.id ? 'max-h-[500px]' : ''}`}>
                                <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-2">
                                     <div className="flex justify-between"><span className="font-semibold">Población:</span> <span>{location.population}</span></div>
                                     <div className="flex justify-between"><span className="font-semibold">¿Localización externa?:</span> <span>{location.isExternal && <Check size={20} className="text-green-500" />}</span></div>
                                     <div className="flex justify-between"><span className="font-semibold">Aulas:</span>  <button onClick={() => handleOpenClassroomListModal(location)} className="flex items-center gap-2 text-blue-500 font-semibold hover:underline">
                                        <Building size={16} />
                                        <span>{location.classroomCount}</span>
                                    </button></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View (from LG) */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                            <tr>
                                <th scope="col" className="p-4">
                                    <input 
                                        type="checkbox"
                                        checked={selectedItems.length === locations.length && locations.length > 0}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500"
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3">Nombre</th>
                                <th scope="col" className="px-6 py-3">Población</th>
                                <th scope="col" className="px-6 py-3">¿Localización externa?</th>
                                <th scope="col" className="px-6 py-3">Aulas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {locationData.map((location) => (
                                <tr key={location.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50">
                                    <td className="w-4 p-4">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(location.id)}
                                                onChange={() => handleSelectOne(location.id)}
                                                className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500"
                                            />
                                            <button onClick={() => handleOpenFormModal(location)} className="text-gray-400 hover:text-primary-600"><Pencil size={14} /></button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap hover:underline cursor-pointer" onClick={() => handleOpenFormModal(location)}>{location.name}</td>
                                    <td className="px-6 py-4">{location.population}</td>
                                    <td className="px-6 py-4">
                                        {location.isExternal && <Check size={20} className="text-green-500" />}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleOpenClassroomListModal(location)} className="flex items-center gap-2 text-blue-500 font-semibold hover:underline">
                                            <Building size={16} />
                                            <span>{location.classroomCount}</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isFormModalOpen}
                onClose={handleCloseFormModal}
                title={editingLocation ? 'Editar Localización' : 'Nueva Localización'}
            >
                <LocationForm
                    location={editingLocation}
                    onSave={handleSave}
                    onClose={handleCloseFormModal}
                />
            </Modal>

            <Modal
                isOpen={isClassroomListModalOpen}
                onClose={() => setIsClassroomListModalOpen(false)}
                title={`Aulas en ${viewingLocation?.name}`}
            >
                {classroomsInLocation.length > 0 ? (
                    <ul className="space-y-2">
                        {classroomsInLocation.map(c => (
                            <li key={c.id} className="p-2 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200">{c.name}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No hay aulas asignadas a esta localización.</p>
                )}
            </Modal>
        </div>
    );
};

export default LocationsPage;
