import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Trash2, Download, Search, Check, X, Mail, FileText, ExternalLink, ClipboardCopy, Send, Eye, Settings } from 'lucide-react';
import { StudentAuthorization, Student } from '../types';
import { getRandomColor, formatDate } from '../utils/helpers';
import Modal from '../components/ui/Modal';

/**
 * Página para visualizar y gestionar TODAS las autorizaciones enviadas a todos los alumnos.
 * Incluye filtros avanzados y acciones masivas.
 * Optimizado para modos día/noche con alto contraste.
 */
function AllAuthorizationsPage() {
    const { studentAuthorizations, students, authorizations, deleteStudentAuthorizations, academyProfile } = useData(); 
    const navigate = useNavigate();
    
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [configModalData, setConfigModalData] = useState<any>(null);
    const [justCopied, setJustCopied] = useState<string | null>(null);
    
    const [filters, setFilters] = useState({
        signatureStatus: 'all', 
        sentFrom: '',
        sentTo: '',
    });

    /**
     * Memoiza la lista de autorizaciones enriquecida con datos de alumno y plantilla.
     * @returns {Array} Una lista completa de todas las autorizaciones del sistema.
     */
    const enrichedAuthorizations = useMemo(() => {
        return studentAuthorizations.map(sa => {
            const student = students.find(s => s.id === sa.studentId);
            const definition = authorizations.find(a => a.id === sa.authorizationId);
            return { ...sa, student, definition };
        })
        .filter(sa => sa.student && sa.definition)
        .sort((a,b) => (b.lastSentDate ? new Date(b.lastSentDate).getTime() : 0) - (a.lastSentDate ? new Date(a.lastSentDate).getTime() : 0));
    }, [studentAuthorizations, students, authorizations]);
    
    /**
     * Filtra las autorizaciones según los criterios de búsqueda y filtros seleccionados.
     * @returns {Array} La lista de autorizaciones filtrada.
     */
    const filteredAuthorizations = useMemo(() => {
        return enrichedAuthorizations.filter(auth => {
            const searchMatch = auth.student!.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                auth.student!.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                auth.definition!.internalTitle.toLowerCase().includes(searchTerm.toLowerCase());

            let signatureMatch = true;
            if (filters.signatureStatus === 'pending') signatureMatch = !auth.signatureDate;
            if (filters.signatureStatus === 'signed') signatureMatch = !!auth.signatureDate;
            
            const sentDate = auth.lastSentDate ? new Date(auth.lastSentDate) : null;
            const sentFromMatch = filters.sentFrom && sentDate ? sentDate >= new Date(filters.sentFrom) : true;
            const sentToMatch = filters.sentTo && sentDate ? sentDate <= new Date(filters.sentTo) : true;

            return searchMatch && signatureMatch && sentFromMatch && sentToMatch;
        });
    }, [enrichedAuthorizations, searchTerm, filters]);
    
    /**
     * Gestiona el cambio en los campos de filtro.
     */
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
    
    /**
     * Gestiona el borrado seguro de autorizaciones, omitiendo las ya firmadas.
     */
    const handleDelete = () => {
        const toDelete = filteredAuthorizations.filter(h => selectedIds.includes(h.id));
        const pendingToDelete = toDelete.filter(h => !h.signatureDate);
        const signedToSkip = toDelete.filter(h => h.signatureDate);

        if (pendingToDelete.length === 0) {
            if (signedToSkip.length > 0) alert("No se pueden borrar autorizaciones ya firmadas.");
            return;
        }
        
        let confirmMessage = `¿Estás seguro de que quieres borrar ${pendingToDelete.length} documento(s) pendiente(s)?`;
        if (signedToSkip.length > 0) {
            confirmMessage += `\n\nSe omitirán ${signedToSkip.length} documento(s) que ya están firmados.`
        }

        if (confirm(confirmMessage)) {
            deleteStudentAuthorizations(pendingToDelete.map(h => h.id));
            setSelectedIds(prev => prev.filter(id => !pendingToDelete.some(h => h.id === id)));
        }
    };

    /**
     * Abre el modal de configuración para un documento específico.
     */
    const handleOpenConfigModal = (auth: any) => {
        const student = auth.student;
        if (!student) return;
        
        const sections = [];
        if (academyProfile.sendStudentSheet) sections.push("Ficha de alumno");
        if (academyProfile.sendPickupAuthorization) sections.push("Ficha de autorización recogida");
        if (academyProfile.sendSEPA && student.paymentConfig.type === 'Domiciliado') sections.push("Documento SEPA");
        if (academyProfile.sendTermsAndConditions) sections.push("Condiciones generales");
        if (academyProfile.sendDataProtection) sections.push("Protección de datos");
        
        setConfigModalData({ sections, auths: [auth.definition.internalTitle] });
        setIsConfigModalOpen(true);
    };

    /**
     * Copia un enlace de firma al portapapeles.
     */
    const handleCopyLink = (token?: string) => {
        if (!token) return;
        const url = `${window.location.origin}/#/sign/${token}`;
        navigator.clipboard.writeText(url);
        setJustCopied(token);
        setTimeout(() => setJustCopied(null), 2000);
    };

    /**
     * Exporta los datos filtrados a un fichero CSV.
     */
    const handleExportToCSV = () => {
        const headers = ["ID Alumno", "Nombre", "Apellidos", "Documento", "Estado", "Fecha Firma", "Email Receptor"];
        const rows = filteredAuthorizations.map(auth => [
            auth.student.id,
            auth.student.firstName,
            auth.student.lastName,
            auth.definition.internalTitle,
            auth.signatureDate ? 'Firmado' : 'Pendiente',
            auth.signatureDate ? formatDate(auth.signatureDate) : '',
            auth.student.email1
        ].join(','));
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "autorizaciones.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const inputClasses = "p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500";


    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Todas las autorizaciones enviadas (alumnos activos)</h1>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant={selectedIds.length > 0 ? "danger" : "secondary"} size="sm" leftIcon={<Trash2 size={16}/>} onClick={handleDelete} disabled={selectedIds.length === 0}>Borrar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Download size={16}/>} onClick={handleExportToCSV}>Exportar a Excel</Button>
                    <div className="flex-grow"></div>
                    <div className="relative">
                        <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={inputClasses + " pr-10"}/>
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    <select name="signatureStatus" value={filters.signatureStatus} onChange={handleFilterChange} className={inputClasses}>
                        <option value="all">Todos</option>
                        <option value="pending">Pendiente firma</option>
                        <option value="signed">Firmado</option>
                    </select>
                    <input type="date" name="sentFrom" value={filters.sentFrom} onChange={handleFilterChange} className={inputClasses} placeholder="Enviado desde"/>
                    <input type="date" name="sentTo" value={filters.sentTo} onChange={handleFilterChange} className={inputClasses} placeholder="Enviado hasta"/>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <table className="min-w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-4"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? filteredAuthorizations.map(h => h.id) : [])} /></th>
                            <th className="px-6 py-3 text-center">Conf.</th>
                            <th className="px-6 py-3">Alumno</th>
                            {/* REMOVED DOCUMENT COLUMN */}
                            <th className="px-6 py-3">Fecha creación</th>
                            <th className="px-6 py-3">Email receptor</th>
                            <th className="px-6 py-3">Nombre y apellidos de quien firma</th>
                            <th className="px-6 py-3">NIF de quien firma</th>
                            <th className="px-6 py-3 text-center">¿Firmado?</th>
                            <th className="px-6 py-3 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {filteredAuthorizations.map(auth => {
                             const initials = `${auth.student.firstName[0]}${auth.student.lastName[0]}`;
                             const avatarColor = getRandomColor(initials);
                            return (
                                <tr key={auth.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4"><input type="checkbox" checked={selectedIds.includes(auth.id)} onChange={() => setSelectedIds(prev => prev.includes(auth.id) ? prev.filter(id => id !== auth.id) : [...prev, auth.id])} /></td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => handleOpenConfigModal(auth)}
                                            className="flex items-center justify-center gap-0.5 text-gray-500 hover:text-primary-600 transition-colors"
                                            title="Ver configuración"
                                        >
                                            <Eye size={16}/>
                                            <Settings size={12} className="-ml-1 -mt-2"/>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${avatarColor}`}>{initials}</div>
                                            <Link to={`/students/${auth.student.id}/authorizations`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">{auth.student.lastName}, {auth.student.firstName}</Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {/* Changed to display only creation date clearly */}
                                        {auth.lastSentDate ? formatDate(auth.lastSentDate) : '--'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{auth.student.email1}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{auth.signerName || '--'}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{auth.signerNif || '--'}</td>
                                    <td className="px-6 py-4 text-center">
                                        {auth.signatureDate ? (
                                            <div className="flex flex-col items-center justify-center">
                                                <Check size={20} className="text-green-500 mb-1"/>
                                                <span className="text-[10px] text-gray-400">{new Date(auth.signatureDate).toLocaleDateString('es-ES')}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center" title="Pendiente de firma">
                                                <X size={20} className="text-red-500 mb-1"/>
                                                <span className="text-[10px] text-red-500">Pendiente</span>
                                            </div>
                                        )}
                                    </td>
                                     <td className="px-6 py-4">
                                        {auth.signatureDate ? (
                                            <div className="flex items-center gap-2">
                                                <Link to={`/authorizations/view/${auth.id}`} className="p-1.5 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400" title="Ver documento">
                                                    <FileText size={16}/>
                                                </Link>
                                                <Button size="sm" variant="secondary" leftIcon={<Mail size={14}/>} onClick={() => alert('Simulación: Email reenviado')}>Reenviar</Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden text-gray-600 dark:text-gray-300">
                                                    <button onClick={() => navigate(`/sign/${auth.token}`)} title="Abrir enlace de firma" className="p-1.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border-r dark:border-gray-600 hover:text-blue-600"><ExternalLink size={16}/></button>
                                                    <button onClick={() => handleCopyLink(auth.token)} title="Copiar enlace" className="p-1.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border-r dark:border-gray-600 hover:text-blue-600">{justCopied === auth.token ? <Check size={16} className="text-green-500"/> : <ClipboardCopy size={16}/>}</button>
                                                    <button title="Enviar Email" className="p-1.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border-r dark:border-gray-600 hover:text-blue-600"><Mail size={16}/></button>
                                                    <button title="Enviar WhatsApp" className="p-1.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-green-600"><Send size={16}/></button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                        {filteredAuthorizations.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-gray-500 dark:text-gray-400">No se encontraron autorizaciones.</td></tr>}
                    </tbody>
                </table>
            </div>
             <Modal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} title="Configuración del documento">
                 {configModalData && (
                    <div className="space-y-4 p-2">
                         <h4 className="font-semibold border-b border-gray-200 dark:border-slate-600 pb-1 text-gray-800 dark:text-gray-200">Apartados generales incluidos:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            {configModalData.sections.map((s:string, i:number) => <li key={i}>{s}</li>)}
                        </ul>
                        {configModalData.auths.length > 0 && (
                            <>
                                <h4 className="font-semibold border-b border-gray-200 dark:border-slate-600 pb-1 mt-4 text-gray-800 dark:text-gray-200">Autorización específica:</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                    {configModalData.auths.map((a:string, i:number) => <li key={i}>{a}</li>)}
                                </ul>
                            </>
                        )}
                    </div>
                 )}
                 <div className="flex justify-end mt-6"><Button variant="secondary" onClick={() => setIsConfigModalOpen(false)}>Cerrar</Button></div>
            </Modal>
        </div>
    )
}
export default AllAuthorizationsPage;