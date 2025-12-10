
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { FileText, Filter, Search, Trash2, Download, Eye, Image as ImageIcon, File, RefreshCw } from 'lucide-react';
import { StoredFile } from '../../types';
import StickyScrollWrapper from '../../components/ui/StickyScrollWrapper';

const FileManagerPage = () => {
    const { storedFiles, billingCenters, students, deleteStoredFiles, academyProfile, addStoredFile } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filters, setFilters] = useState({
        type: '',
        centerId: '',
        dateFrom: '',
        dateTo: ''
    });

    // Auto-scan effect to index existing images. 
    // We trigger this on mount and when key data changes to ensure the file list is populated.
    // This acts as a "sync" between the profile/student images and the file manager table.
    useEffect(() => {
        const scanImages = () => {
            // 1. Scan Academy Profile Images
            const profileFields: (keyof typeof academyProfile)[] = [
                'logoBase64', 'docLogoBase64', 'directorSignatureBase64', 
                'emailLogoBase64', 'emailFooterImageBase64', 'birthdayEmailImageBase64', 
                'studentAreaBackground', 'studentAreaLogo'
            ];

            profileFields.forEach(field => {
                const content = academyProfile[field];
                // Check if content exists and is a base64 string
                if (typeof content === 'string' && content.startsWith('data:image')) {
                    const fieldName = String(field);
                    // Check if already indexed in storedFiles
                    const exists = storedFiles.some(f => f.relatedTable === 'academy_profile' && f.fileName.includes(fieldName));
                    
                    if (!exists) {
                        addStoredFile({
                            id: `auto-profile-${fieldName}-${Date.now()}`,
                            fileName: `${fieldName}.png`,
                            fileUrl: content,
                            fileType: 'user_upload',
                            relatedTable: 'academy_profile',
                            relatedId: 1,
                            centerId: 1,
                            createdAt: new Date().toISOString(),
                            size: Math.round(content.length * 0.75)
                        });
                    }
                }
            });

            // 2. Scan Student Photos
            students.forEach(student => {
                if (student.photoUrl && student.photoUrl.startsWith('data:image')) {
                     // Check if already indexed for this specific student
                     const exists = storedFiles.some(f => f.relatedTable === 'students' && String(f.relatedId) === String(student.id));
                     
                     if (!exists) {
                        addStoredFile({
                            id: `auto-student-${student.id}-${Date.now()}`,
                            fileName: `foto_alumno_${student.id}.jpg`,
                            fileUrl: student.photoUrl,
                            fileType: 'user_upload',
                            relatedTable: 'students',
                            relatedId: student.id,
                            centerId: 1,
                            createdAt: new Date().toISOString(),
                            size: Math.round(student.photoUrl.length * 0.75)
                        });
                     }
                }
            });
        };

        // Run scan with a small delay to ensure DataContext is fully hydrated
        const timer = setTimeout(scanImages, 1000);
        return () => clearTimeout(timer);
    // Depend on academyProfile and students length to trigger re-scan if data updates, 
    // but also include storedFiles.length to prevent infinite loops if scan works.
    }, [academyProfile, students.length, storedFiles.length]); 

    const filteredFiles = useMemo(() => {
        return storedFiles.filter(file => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = file.fileName.toLowerCase().includes(searchLower) || 
                                  file.relatedTable?.toLowerCase().includes(searchLower);
            
            const matchesType = filters.type ? file.fileType === filters.type : true;
            const matchesCenter = filters.centerId ? file.centerId?.toString() === filters.centerId : true;
            
            const fileDate = new Date(file.createdAt);
            const matchesDateFrom = filters.dateFrom ? fileDate >= new Date(filters.dateFrom) : true;
            const matchesDateTo = filters.dateTo ? fileDate <= new Date(filters.dateTo) : true;

            return matchesSearch && matchesType && matchesCenter && matchesDateFrom && matchesDateTo;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [storedFiles, searchTerm, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredFiles.map(f => f.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
    };

    const handleDelete = () => {
        if (confirm(`¿Estás seguro de borrar ${selectedIds.length} archivos?`)) {
            deleteStoredFiles(selectedIds);
            setSelectedIds([]);
        }
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'invoice_pdf': return <FileText className="text-red-500" size={18} />;
            case 'receipt_pdf': return <FileText className="text-blue-500" size={18} />;
            case 'user_upload': return <ImageIcon className="text-purple-500" size={18} />;
            default: return <File className="text-gray-500" size={18} />;
        }
    };

    const getEntityName = (file: StoredFile) => {
        if (file.relatedTable === 'students' && file.relatedId) {
             const student = students.find(s => s.id === Number(file.relatedId));
             return student ? `${student.firstName} ${student.lastName}` : `Student #${file.relatedId}`;
        }
        return file.relatedTable || 'N/A';
    }
    
    // Manual refresh button
    const handleManualScan = () => {
        // Force re-scan by triggering the effect via a state update, or simpler: manually call storedFiles logic?
        // For now, we rely on the effect which runs on storedFiles.length change. 
        // But if we want to force check:
        alert("El escaneo de archivos se ejecuta automáticamente en segundo plano.");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <FileText className="text-primary-600" /> Gestor de Archivos
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Repositorio centralizado de todos los archivos generados y subidos al sistema.
                    </p>
                </div>
                <div className="text-gray-500 text-sm font-medium">{filteredFiles.length} Archivos</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16}/>} disabled={selectedIds.length === 0} onClick={handleDelete}>Borrar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={16}/>} onClick={handleManualScan}>Refrescar índice</Button>
                    
                    <div className="flex-grow"></div>
                    <div className="relative w-64">
                        <input 
                            type="text" 
                            placeholder="Buscar archivo..." 
                            className="w-full p-2 pl-8 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 focus:ring-primary-500 focus:border-primary-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-100 dark:border-slate-700">
                    <select name="type" value={filters.type} onChange={handleFilterChange} className="p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-slate-600">
                        <option value="">Todos los tipos</option>
                        <option value="invoice_pdf">Facturas (PDF)</option>
                        <option value="receipt_pdf">Recibos (PDF)</option>
                        <option value="user_upload">Subidas Usuario</option>
                        <option value="document">Documentos</option>
                    </select>
                    <select name="centerId" value={filters.centerId} onChange={handleFilterChange} className="p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-slate-600">
                        <option value="">Todos los centros</option>
                        {billingCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-slate-600" placeholder="Desde"/>
                    <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-slate-600" placeholder="Hasta"/>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <StickyScrollWrapper>
                    <table className="min-w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="p-4 w-10"><input type="checkbox" onChange={handleSelectAll} checked={filteredFiles.length > 0 && selectedIds.length === filteredFiles.length} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"/></th>
                                <th className="px-6 py-3 font-medium">Nombre Archivo</th>
                                <th className="px-6 py-3 font-medium">Tipo</th>
                                <th className="px-6 py-3 font-medium">Entidad Origen</th>
                                <th className="px-6 py-3 font-medium">Centro</th>
                                <th className="px-6 py-3 font-medium">Fecha Creación</th>
                                <th className="px-6 py-3 font-medium text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredFiles.map(file => (
                                <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4"><input type="checkbox" checked={selectedIds.includes(file.id)} onChange={() => handleSelectOne(file.id)} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"/></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getFileIcon(file.fileType)}
                                            <span className="font-medium text-gray-900 dark:text-white truncate max-w-xs" title={file.fileName}>{file.fileName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 capitalize">{String(file.fileType).replace('_', ' ')}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-xs">
                                        <span className="font-mono bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{getEntityName(file)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{billingCenters.find(c => c.id === file.centerId)?.name || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(file.createdAt).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            {/* For base64/local files, we can show a simple preview/download if possible */}
                                            <a href={file.fileUrl} download={file.fileName} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-blue-600 dark:text-blue-400" title="Descargar">
                                                <Download size={16}/>
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredFiles.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        No se encontraron archivos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </StickyScrollWrapper>
            </div>
        </div>
    );
};

export default FileManagerPage;
