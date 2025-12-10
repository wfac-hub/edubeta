
import React, { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Resource } from '../types';
import Button from '../components/ui/Button';
// Fix: Import the 'X' icon from lucide-react to resolve the 'Cannot find name' error.
import { MoveLeft, Upload, Trash2, Search, Download, File as FileIcon, FileImage, FileText, FileVideo, FileAudio, Check, Copy, X, MoreHorizontal } from 'lucide-react';

const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <FileImage className="text-blue-500" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <FileAudio className="text-pink-500" />;
    if (mimeType === 'application/pdf') return <FileText className="text-red-500" />;
    if (mimeType.startsWith('text/')) return <FileText className="text-gray-500" />;
    return <FileIcon className="text-gray-400" />;
};

const downloadResource = (resource: Resource) => {
    const link = document.createElement('a');
    link.href = `data:${resource.fileType};base64,${resource.fileContent}`;
    link.download = resource.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


const CourseResourcesPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { courses, resources, addResource, deleteResources, updateResource } = useData();

    const course = useMemo(() => courses.find(c => c.id === parseInt(courseId || '0')), [courses, courseId]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    
    const courseResources = useMemo(() => {
        if (!course) return [];
        return resources.filter(r => r.scope === 'course' && r.scopeId === course.id);
    }, [resources, course]);

    if (!course) {
        return <div className="p-8 text-center">Curso no encontrado.</div>;
    }
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await addResource(file, 'course', course.id);
        }
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedResourceIds(courseResources.map(r => r.id));
        } else {
            setSelectedResourceIds([]);
        }
    };
    
    const handleSelectOne = (id: string) => {
        setSelectedResourceIds(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Recursos del curso: <span className="text-primary-600">{course.name}</span></h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Añade y ordena los recursos documentales que quieres que aparezcan en este curso. Puedes subir archivos y utilizar enlaces a webs externas.
                    <br/>
                    Estos recursos se comparten con alumnos, profesores y coordinadores que estén asociados al curso, en función de la configuración de visibilidad que elijas.
                </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16} />} onClick={() => navigate(-1)}>Volver</Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <Button variant="secondary" size="sm" leftIcon={<Upload size={16} />} onClick={() => fileInputRef.current?.click()}>Alta</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />} disabled={selectedResourceIds.length === 0} onClick={() => deleteResources(selectedResourceIds)}>Borrar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Copy size={16}/>} disabled={selectedResourceIds.length === 0}>Copiar</Button>
                    <div className="flex-grow"></div>
                    <div className="relative w-full sm:w-64">
                         <input type="text" placeholder="Buscar" className="w-full p-2 pl-4 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 focus:ring-primary-500 focus:border-primary-500" />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                 {/* Mobile View */}
                <div className="md:hidden divide-y divide-gray-200 dark:divide-slate-700">
                    {courseResources.map(resource => (
                         <div key={resource.id} className="group">
                             <div className="p-4 flex items-start gap-4" onClick={() => setExpandedRow(prev => prev === resource.id ? null : resource.id)}>
                                <input type="checkbox" checked={selectedResourceIds.includes(resource.id)} onChange={() => handleSelectOne(resource.id)} onClick={e => e.stopPropagation()} className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500 mt-1"/>
                                 <div className="mt-1">{getFileIcon(resource.fileType)}</div>
                                <div className="flex-grow">
                                     <p className="font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); downloadResource(resource)}}>
                                        {resource.name}
                                    </p>
                                </div>
                                <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === resource.id ? 'rotate-90' : ''}`} />
                            </div>
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === resource.id ? 'max-h-[500px]' : ''}`}>
                                <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-3">
                                     <div className="flex justify-between items-center"><span className="font-semibold">Tipo:</span> <span>{resource.fileType}</span></div>
                                     <div className="flex justify-between items-center"><span className="font-semibold">¿Profesores/as?:</span> <input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500" checked={resource.isForTeachers} onChange={(e) => updateResource({...resource, isForTeachers: e.target.checked })} /></div>
                                     <div className="flex justify-between items-center"><span className="font-semibold">¿Alumnos/as?:</span> <input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500" checked={resource.isForStudents} onChange={(e) => updateResource({...resource, isForStudents: e.target.checked })} /></div>
                                     <div className="flex justify-between items-center"><span className="font-semibold">¿Activo?:</span> <span>{resource.isActive ? <Check className="text-green-500" /> : <X className="text-red-500"/>}</span></div>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
                 {/* Desktop View */}
                <div className="hidden md:block">
                    <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                            <tr>
                                <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500" /></th>
                                <th scope="col" className="px-6 py-3">Previsualización del recurso</th>
                                <th scope="col" className="px-6 py-3">Título</th>
                                <th scope="col" className="px-6 py-3">Tipo</th>
                                <th scope="col" className="px-6 py-3">¿Profesores/as?</th>
                                <th scope="col" className="px-6 py-3">¿Alumnos/as?</th>
                                <th scope="col" className="px-6 py-3">¿Activo?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courseResources.map(resource => (
                                <tr key={resource.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                    <td className="w-4 p-4"><input type="checkbox" checked={selectedResourceIds.includes(resource.id)} onChange={() => handleSelectOne(resource.id)} className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500" /></td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => downloadResource(resource)} title="Descargar">{getFileIcon(resource.fileType)}</button>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer" onClick={() => downloadResource(resource)}>{resource.name}</td>
                                    <td className="px-6 py-4">{resource.fileType}</td>
                                    <td className="px-6 py-4">
                                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500" checked={resource.isForTeachers} onChange={(e) => updateResource({...resource, isForTeachers: e.target.checked })} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500" checked={resource.isForStudents} onChange={(e) => updateResource({...resource, isForStudents: e.target.checked })} />
                                    </td>
                                    <td className="px-6 py-4">
                                        {resource.isActive ? <Check className="text-green-500" /> : <X className="text-red-500"/>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {courseResources.length === 0 && <p className="text-center py-8 text-gray-500">No hay recursos para este curso.</p>}
            </div>
        </div>
    );
};

export default CourseResourcesPage;
