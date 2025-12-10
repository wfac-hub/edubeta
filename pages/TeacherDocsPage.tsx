
import React, { useRef, useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import { Resource } from '../types';
import { Upload, Download, Trash2, File as FileIcon, MoveLeft, MoreHorizontal } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';

const TeacherDocsPage = () => {
    const { teacherId } = useParams();
    const { goBack } = useNavigationHistory();
    const { resources, addResource, deleteResources, teachers } = useData();
    const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const teacher = useMemo(() => teachers.find(t => t.id === parseInt(teacherId || '0')), [teachers, teacherId]);

    const teacherResources = resources.filter(r => r.scope === 'teacher' && r.scopeId === teacher?.id);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && teacher) {
            await addResource(file, 'teacher', teacher.id);
        }
    };
    
    const downloadResource = (resource: Resource) => {
        const link = document.createElement('a');
        link.href = `data:${resource.fileType};base64,${resource.fileContent}`;
        link.download = resource.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedResourceIds(teacherResources.map(r => r.id));
        } else {
            setSelectedResourceIds([]);
        }
    };
    
    const handleSelectOne = (id: string) => {
        setSelectedResourceIds(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
    };
    
    if (!teacher) {
        return <div className="p-8 text-center">Profesor no encontrado.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Documentos de: {teacher.name} {teacher.lastName}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Repositorio de documentos privados para el profesor. Solo visible por administradores y el profesor afectado.
                </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16} />} onClick={goBack}>Volver</Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <Button variant="secondary" size="sm" leftIcon={<Upload size={16} />} onClick={() => fileInputRef.current?.click()}>
                        Subir Documento
                    </Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />} disabled={selectedResourceIds.length === 0} onClick={() => deleteResources(selectedResourceIds)}>
                        Borrar
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {/* Mobile View */}
                <div className="md:hidden divide-y divide-gray-200 dark:divide-slate-700">
                     {teacherResources.map(resource => (
                         <div key={resource.id} className="group">
                             <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === resource.id ? null : resource.id)}>
                                <input type="checkbox" checked={selectedResourceIds.includes(resource.id)} onChange={() => handleSelectOne(resource.id)} onClick={e => e.stopPropagation()} className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 mt-1" />
                                <div className="flex-grow">
                                     <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        <FileIcon size={16} /> {resource.name}
                                    </p>
                                </div>
                                <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === resource.id ? 'rotate-90' : ''}`} />
                            </div>
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === resource.id ? 'max-h-[500px]' : ''}`}>
                                <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-2">
                                     <div className="flex justify-between"><span className="font-semibold">Tipo:</span> <span>{resource.fileType}</span></div>
                                     <div className="flex justify-between"><span className="font-semibold">Fecha Subida:</span> <span>{new Date(resource.createdAt).toLocaleDateString()}</span></div>
                                     <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-slate-600">
                                        <Button variant="ghost" size="sm" onClick={() => downloadResource(resource)}><Download size={16} /></Button>
                                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteResources([resource.id])}><Trash2 size={16} /></Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block">
                    <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                            <tr>
                                <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700" /></th>
                                <th scope="col" className="px-6 py-3">Nombre del Documento</th>
                                <th scope="col" className="px-6 py-3">Tipo de Archivo</th>
                                <th scope="col" className="px-6 py-3">Fecha de Subida</th>
                                <th scope="col" className="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teacherResources.map(resource => (
                                <tr key={resource.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50">
                                    <td className="w-4 p-4"><input type="checkbox" checked={selectedResourceIds.includes(resource.id)} onChange={() => handleSelectOne(resource.id)} className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700" /></td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        <FileIcon size={16} /> {resource.name}
                                    </td>
                                    <td className="px-6 py-4">{resource.fileType}</td>
                                    <td className="px-6 py-4">{new Date(resource.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => downloadResource(resource)}><Download size={16} /></Button>
                                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteResources([resource.id])}><Trash2 size={16} /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {teacherResources.length === 0 && <p className="text-center py-8 text-gray-500">Este profesor no tiene documentos.</p>}
            </div>
        </div>
    );
};

export default TeacherDocsPage;
