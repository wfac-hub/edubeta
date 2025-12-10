import React, { useRef, useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import { Resource } from '../types';
import { Upload, Download, Trash2, File as FileIcon, MoveLeft, Mail, Search, Check, X } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';

const StudentDocsPage = () => {
    const { studentId } = useParams();
    const { goBack } = useNavigationHistory();
    const { resources, addResource, deleteResources, students, updateResource } = useData();
    const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const student = useMemo(() => students.find(s => s.id === parseInt(studentId!)), [students, studentId]);

    const studentResources = resources.filter(r => r.scope === 'student' && r.scopeId === student?.id);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && student) {
            await addResource(file, 'student', student.id);
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
        setSelectedResourceIds(e.target.checked ? studentResources.map(r => r.id) : []);
    };
    
    const handleSelectOne = (id: string) => {
        setSelectedResourceIds(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
    };
    
    if (!student) {
        return <div className="p-8 text-center">Alumno no encontrado.</div>;
    }
    
    const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();
    const avatarColor = '#8b5cf6'; // some color

    return (
        <div className="space-y-6">
            <header className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full text-white flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: avatarColor }}>
                    {initials}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{student.lastName}, {student.firstName}</h1>
                    <p className="text-gray-500 dark:text-gray-400">Repositorio de documentación relacionada con el alumno. Cuelga aquí los documentos que quieras guardar de cada alumno.</p>
                </div>
                <div className="ml-auto flex flex-col items-end">
                    <FileIcon size={32} className="text-gray-400"/>
                    <span className="text-sm text-gray-500">{studentResources.length} Resultados</span>
                </div>
            </header>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16} />} onClick={goBack}>Volver</Button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <Button variant="secondary" size="sm" leftIcon={<Upload size={16} />} onClick={() => fileInputRef.current?.click()}>
                            Alta
                        </Button>
                        <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />} disabled={selectedResourceIds.length === 0} onClick={() => deleteResources(selectedResourceIds)}>
                            Borrar
                        </Button>
                    </div>
                     <div className="relative w-full sm:w-64">
                         <input type="text" placeholder="Buscar" className="w-full p-2 pl-4 pr-10 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500" />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                        <tr>
                            <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} /></th>
                            <th scope="col" className="px-6 py-3">Fecha alta</th>
                            <th scope="col" className="px-6 py-3">Nombre del documento</th>
                            <th scope="col" className="px-6 py-3">Documento</th>
                            <th scope="col" className="px-6 py-3">¿Visible área alumnos?</th>
                            <th scope="col" className="px-6 py-3">Curso</th>
                            <th scope="col" className="px-6 py-3">Enviar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentResources.map(resource => (
                            <tr key={resource.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50">
                                <td className="p-4"><input type="checkbox" checked={selectedResourceIds.includes(resource.id)} onChange={() => handleSelectOne(resource.id)} /></td>
                                <td className="px-6 py-4">{new Date(resource.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    {resource.name}
                                </td>
                                <td className="px-6 py-4">
                                    <Button variant="ghost" size="sm" onClick={() => downloadResource(resource)}><Download size={16} /></Button>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <input type="checkbox" checked={resource.isForStudents} onChange={e => updateResource({...resource, isForStudents: e.target.checked})} />
                                </td>
                                <td className="px-6 py-4 text-gray-400">--</td>
                                <td className="px-6 py-4">
                                    <Button variant="ghost" size="sm"><Mail size={16} /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {studentResources.length === 0 && <div className="text-center py-8 text-gray-500">0 Resultados</div>}
            </div>
             <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                {studentResources.length} Resultados
            </div>
        </div>
    );
};

export default StudentDocsPage;
