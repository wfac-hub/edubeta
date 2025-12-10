import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { FileText, Download, Mail, Plus, Trash2, Search, Edit, Send } from 'lucide-react';
import { Report, ReportStatus } from '../../types';
import StickyScrollWrapper from '../../components/ui/StickyScrollWrapper';
import Modal from '../../components/ui/Modal';
import ReportForm from '../../components/forms/ReportForm';
import { useLocation, useSearchParams } from 'react-router-dom';

const ReportsListPage = () => {
    const { reports, students, courses, courseLevels, locations, teachers, updateReport, deleteReports } = useData();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchParams] = useSearchParams();
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<Report | null>(null);

    const [filters, setFilters] = useState({
        level: '',
        courseId: '',
        location: '',
        teacherId: '',
        type: '',
        status: '',
        dateFrom: '',
        dateTo: '',
    });

    // Load filters from URL params if present
    useEffect(() => {
        const sId = searchParams.get('studentId');
        const cId = searchParams.get('courseId');
        
        if (sId || cId) {
            // We use the general search term for student/course filtering when coming from external links for simplicity in this UI
            // Alternatively, we could add specific filter fields if needed.
            // Here, if a courseId is provided, we set the filter. 
            if (cId) setFilters(prev => ({ ...prev, courseId: cId }));
            
            // If studentId is provided, we can set it in search term to filter by name
            if (sId) {
                const s = students.find(student => student.id === parseInt(sId));
                if (s) setSearchTerm(`${s.lastName}`);
            }
        }
    }, [searchParams, students]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredReports.map(r => r.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const getStudentName = (id: number) => {
        const s = students.find(stud => stud.id === id);
        return s ? `${s.lastName}, ${s.firstName}` : 'Desconocido';
    };

    const getCourseName = (id: number) => {
        return courses.find(c => c.id === id)?.name || 'Curso eliminado';
    };

    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const student = students.find(s => s.id === report.studentId);
            const course = courses.find(c => c.id === report.courseId);
            if (!student || !course) return false;

            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = 
                report.title.toLowerCase().includes(searchLower) ||
                getStudentName(student.id).toLowerCase().includes(searchLower) ||
                course.name.toLowerCase().includes(searchLower);

            const matchesLevel = filters.level ? course.level === filters.level : true;
            const matchesCourse = filters.courseId ? course.id.toString() === filters.courseId : true;
            const matchesTeacher = filters.teacherId ? course.teacherId.toString() === filters.teacherId : true;
            const matchesType = filters.type ? report.type === filters.type : true;
            const matchesStatus = filters.status ? report.status === filters.status : true;
            
            const reportDate = new Date(report.deliveryDate);
            const matchesDateFrom = filters.dateFrom ? reportDate >= new Date(filters.dateFrom) : true;
            const matchesDateTo = filters.dateTo ? reportDate <= new Date(filters.dateTo) : true;

            return matchesSearch && matchesLevel && matchesCourse && matchesTeacher && matchesType && matchesStatus && matchesDateFrom && matchesDateTo;
        });
    }, [reports, students, courses, searchTerm, filters]);

    const getStatusColor = (status: ReportStatus) => {
        switch (status) {
            case 'No inicializado': return 'bg-gray-400';
            case 'En edición': return 'bg-blue-400';
            case 'En revisión': return 'bg-red-400';
            case 'Acabado': return 'bg-yellow-400';
            case 'Enviado': return 'bg-green-400';
            default: return 'bg-gray-400';
        }
    };
    
    // --- Actions ---
    const handleDelete = () => {
        if (confirm(`¿Estás seguro de borrar ${selectedIds.length} informe(s)?`)) {
            deleteReports(selectedIds);
            setSelectedIds([]);
        }
    };
    
    const handleBulkStatusUpdate = (status: ReportStatus) => {
        if (selectedIds.length === 0) return;
        if (confirm(`¿Cambiar estado de ${selectedIds.length} informes a "${status}"?`)) {
            selectedIds.forEach(id => {
                const report = reports.find(r => r.id === id);
                if (report) {
                    updateReport({ ...report, status });
                }
            });
            setSelectedIds([]);
        }
    };

    const handleOpenModal = (report: Report | null) => {
        setEditingReport(report);
        setIsModalOpen(true);
    };

    const handleSaveReport = (report: Report) => {
        updateReport(report);
        setIsModalOpen(false);
    };
    
    const handleExportCSV = () => {
        const headers = ["ID", "Alumno", "Curso", "Título", "Tipo", "Fecha Entrega", "Estado"];
        const rows = filteredReports.map(r => [
            r.id,
            `"${getStudentName(r.studentId)}"`,
            `"${getCourseName(r.courseId)}"`,
            `"${r.title}"`,
            r.type,
            r.deliveryDate,
            r.status
        ].join(','));
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "informes.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


    const inputClasses = "p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <FileText className="text-primary-600" /> Informes
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Listado de informes dados de alta en la academia
                    </p>
                </div>
                <div className="text-gray-500 text-sm font-medium">{filteredReports.length} Resultados</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16} />} disabled={selectedIds.length === 0} onClick={handleDelete}>Borrar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<FileText size={16} />} disabled={selectedIds.length === 0} onClick={() => handleBulkStatusUpdate('Acabado')}>Finaliza informes</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Mail size={16} />} disabled={selectedIds.length === 0} onClick={() => handleBulkStatusUpdate('Enviado')}>Enviar informes</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />} onClick={() => handleOpenModal(null)}>Alta masiva informe manual</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Download size={16} />} onClick={handleExportCSV}>Exportar a Excel</Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    <select name="level" value={filters.level} onChange={handleFilterChange} className={inputClasses}><option value="">Nivel</option>{courseLevels.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}</select>
                    <select name="courseId" value={filters.courseId} onChange={handleFilterChange} className={inputClasses}><option value="">Curso</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                    <select name="location" value={filters.location} onChange={handleFilterChange} className={inputClasses}><option value="">Localización</option>{locations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}</select>
                    <select name="teacherId" value={filters.teacherId} onChange={handleFilterChange} className={inputClasses}><option value="">Profesor/a</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.name} {t.lastName}</option>)}</select>
                    <select name="type" value={filters.type} onChange={handleFilterChange} className={inputClasses}><option value="">Tipo</option><option>Evaluación Trimestral</option><option>Informe Final</option></select>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className={inputClasses}><option value="">Estado</option><option>No inicializado</option><option>En edición</option><option>En revisión</option><option>Acabado</option><option>Enviado</option></select>
                    <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className={inputClasses} placeholder="Desde fecha entrega"/>
                    <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className={inputClasses} placeholder="Hasta fecha entrega"/>
                    
                    <div className="relative col-span-full md:col-span-2">
                         <input
                            type="text"
                            placeholder="Buscar por alumno, curso o título..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-4 pr-10 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <StickyScrollWrapper>
                    <table className="min-w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="p-4 w-10"><input type="checkbox" onChange={handleSelectAll} checked={filteredReports.length > 0 && selectedIds.length === filteredReports.length} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"/></th>
                                <th className="px-6 py-3 font-medium">Alumno - curso</th>
                                <th className="px-6 py-3 font-medium">Título</th>
                                <th className="px-6 py-3 font-medium">Tipo informe</th>
                                <th className="px-6 py-3 font-medium">Fecha entrega</th>
                                <th className="px-6 py-3 font-medium">Estado</th>
                                <th className="px-6 py-3 font-medium text-center">Editar informe</th>
                                <th className="px-6 py-3 font-medium text-center">Acciones</th>
                                <th className="px-6 py-3 font-medium text-center">Archivo generado</th>
                                <th className="px-6 py-3 font-medium text-center">Enviar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredReports.map(report => (
                                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                    <td className="p-4"><input type="checkbox" checked={selectedIds.includes(report.id)} onChange={() => handleSelectOne(report.id)} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"/></td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        <div>{getStudentName(report.studentId)}</div>
                                        <div className="text-xs text-gray-500">{getCourseName(report.courseId)}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{report.title}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{report.type}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(report.deliveryDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-3 h-3 rounded-full ${getStatusColor(report.status)}`}></span>
                                            <span className="text-xs">{report.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(report)}><Edit size={16} className="text-blue-500"/></Button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Button variant="ghost" size="sm">...</Button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {report.isGenerated ? <FileText size={16} className="text-green-500 mx-auto"/> : <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Button variant="ghost" size="sm" onClick={() => alert("Funcionalidad de envío simulada")}><Send size={16} className="text-gray-500 hover:text-primary-600"/></Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredReports.length === 0 && (
                                <tr><td colSpan={10} className="text-center py-8 text-gray-500">No se encontraron informes.</td></tr>
                            )}
                        </tbody>
                    </table>
                </StickyScrollWrapper>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-6 text-xs text-gray-600 dark:text-gray-300 mt-4 px-2">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-400"></span> <strong>No inicializado</strong> El informe ha sido introducido en el sistema pero aún no se ha accedido a modificarlo.</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-400"></span> <strong>En edición</strong> El informe se está redactando.</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-400"></span> <strong>En revisión</strong> El informe tiene el visto bueno del profesor y debe revisarse por administración.</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> <strong>Acabado</strong> El informe está revisado y listo para notificar.</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-400"></span> <strong>Enviado</strong> El informe ha sido enviado al alumno.</div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingReport ? 'Editar Informe' : 'Crear Nuevo Informe'}>
                <ReportForm report={editingReport} onSave={handleSaveReport} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default ReportsListPage;