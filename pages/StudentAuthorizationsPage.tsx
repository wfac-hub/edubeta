
import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';
import Button from '../components/ui/Button';
import { MoveLeft, Check, X, ClipboardCopy, Mail, Send, ExternalLink, FileText, Plus, Eye, Settings, Edit, Trash2, Search, ArrowRight } from 'lucide-react';
import { Student, StudentAuthorization, Authorization } from '../types';
import { getRandomColor, formatDate } from '../utils/helpers';
import Modal from '../components/ui/Modal';

/**
 * Página para gestionar las autorizaciones firmadas y pendientes de un alumno específico.
 */
function StudentAuthorizationsPage() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const { students, studentAuthorizations, authorizations, deleteStudentAuthorizations, academyProfile } = useData();
    const [justCopied, setJustCopied] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    // Modal States
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [configModalData, setConfigModalData] = useState<{title: string, sections: string[], auths: string[]} | null>(null);

    const student = useMemo(() => students.find(s => s.id === parseInt(studentId!)), [students, studentId]);

    const historyData = useMemo(() => {
        if (!student) return [];
        const instances = studentAuthorizations.filter(sa => sa.studentId === student.id);
        const enriched = instances.map(sa => {
            const def = authorizations.find(a => a.id === sa.authorizationId);
            return {
                ...sa,
                definition: def,
                title: def ? def.internalTitle : 'Documento personalizado'
            };
        });
        const filtered = enriched.filter(item => 
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return filtered.sort((a, b) => {
            const dateA = new Date(a.lastSentDate || 0).getTime();
            const dateB = b.lastSentDate ? new Date(b.lastSentDate).getTime() : 0;
            return dateB - dateA;
        });
    }, [student, studentAuthorizations, authorizations, searchTerm]);

    const handleCopyLink = (token?: string) => {
        if (!token) return;
        const url = `${window.location.origin}/#/sign/${token}`;
        navigator.clipboard.writeText(url);
        setJustCopied(token);
        setTimeout(() => setJustCopied(null), 2000);
    };
    
    const handleSendEmail = (student: Student, token?: string) => {
        if (!token) return;
        const url = `${window.location.origin}/#/sign/${token}`;
        const subject = encodeURIComponent("Firma de autorización pendiente");
        const body = encodeURIComponent(`Hola,\n\nPor favor, firma el documento de autorización a través del siguiente enlace:\n\n${url}\n\nGracias.`);
        window.location.href = `mailto:${student.email1}?subject=${subject}&body=${body}`;
    };

    const handleSendWhatsApp = (student: Student, token?: string) => {
        if (!token || !student.phone1) return;
        const url = `${window.location.origin}/#/sign/${token}`;
        const message = encodeURIComponent(`Hola, por favor firma el documento de autorización aquí: ${url}`);
        window.open(`https://wa.me/${student.phone1}?text=${message}`, '_blank');
    };
    
    const handleOpenConfigModal = (auth: any) => {
        if (!student) return;
        const sections = [];
        if (academyProfile.sendStudentSheet) sections.push("Ficha de alumno");
        if (academyProfile.sendPickupAuthorization) sections.push("Ficha de autorización recogida");
        if (academyProfile.sendSEPA && student.paymentConfig.type === 'Domiciliado') sections.push("Documento SEPA");
        if (academyProfile.sendTermsAndConditions) sections.push("Condiciones generales");
        if (academyProfile.sendDataProtection) sections.push("Protección de datos");
        
        const authsList = [auth.title];
        setConfigModalData({ title: auth.title, sections, auths: authsList });
        setIsConfigModalOpen(true);
    };
    
    const handleDelete = () => {
        const toDelete = historyData.filter(h => selectedIds.includes(h.id));
        const pendingToDelete = toDelete.filter(h => !h.signatureDate);
        const signedToSkip = toDelete.filter(h => h.signatureDate);

        if (pendingToDelete.length === 0) {
            if (signedToSkip.length > 0) alert("No se pueden borrar autorizaciones ya firmadas.");
            return;
        }
        
        let confirmMessage = `¿Estás seguro de que quieres borrar ${pendingToDelete.length} documento(s) pendiente(s)?`;
        if (signedToSkip.length > 0) {
            confirmMessage += `\n\nSe omitirán ${signedToSkip.length} documento(s) que ya están firmados por seguridad.`
        }

        if (confirm(confirmMessage)) {
            deleteStudentAuthorizations(pendingToDelete.map(h => h.id));
            setSelectedIds(prev => prev.filter(id => !pendingToDelete.some(h => h.id === id)));
        }
    };

    if (!student) {
        return <div className="p-8 text-center">Alumno no encontrado.</div>;
    }

    const initials = `${student.firstName[0]}${student.lastName[0]}`;
    const avatarColor = getRandomColor(initials);

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-start">
                 <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white ${avatarColor}`}>
                        {initials}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{student.lastName}, {student.firstName}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Documentos firmados del alumno/a</p>
                    </div>
                </div>
                
                 <div className="flex items-center gap-2">
                    <Link to={`/students/${student.id}/edit`} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-gray-300">
                        <Edit size={20}/>
                    </Link>
                    <span className="font-semibold text-gray-500 dark:text-gray-400">{historyData.length} Resultados</span>
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16} />} onClick={goBack}>Volver</Button>
                    <Button variant="secondary" size="sm" onClick={() => navigate(`/students/${student.id}/authorizations/new`)} leftIcon={<Plus size={16}/>}>Nuevo documento</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16}/>} onClick={handleDelete} disabled={selectedIds.length === 0}>Borrar</Button>
                     <div className="flex-grow"></div>
                    <div className="relative w-full sm:w-64">
                        <input type="text" placeholder="Buscar" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 pl-4 pr-10 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500" />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-slate-700/50 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="p-4 w-4"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? historyData.map(h => h.id) : [])} /></th>
                                <th className="px-6 py-3 text-center">Conf.</th>
                                <th className="px-6 py-3">Fecha creación</th>
                                <th className="px-6 py-3">Email receptor</th>
                                <th className="px-6 py-3">Nombre y apellidos de quien firma</th>
                                <th className="px-6 py-3">NIF de quien firma</th>
                                <th className="px-6 py-3 text-center">¿Firmado?</th>
                                <th className="px-6 py-3 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {historyData.map(auth => (
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
                                    {/* Displaying creation date (lastSentDate) */}
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{auth.lastSentDate ? formatDate(auth.lastSentDate) : '--'}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{student.email1}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{auth.signerName || '--'}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{auth.signerNif || '--'}</td>
                                    <td className="px-6 py-4 text-center">
                                        {auth.signatureDate ? (
                                            <div className="flex flex-col items-center justify-center">
                                                <Check size={20} className="text-green-500 mb-1"/>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center" title="Pendiente de firma">
                                                <X size={20} className="text-red-500 mb-1"/>
                                            </div>
                                        )}
                                    </td>
                                     <td className="px-6 py-4">
                                        {auth.signatureDate ? (
                                            <div className="flex items-center gap-2">
                                                <Link to={`/authorizations/view/${auth.id}`} className="p-1.5 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400" title="Ver documento">
                                                    <FileText size={16}/>
                                                </Link>
                                                <Button size="sm" variant="secondary" leftIcon={<Mail size={14}/>} onClick={() => handleSendEmail(student, auth.postSignToken)}>Reenviar</Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden text-gray-600 dark:text-gray-300">
                                                    <button onClick={() => navigate(`/sign/${auth.token}`)} title="Abrir enlace de firma" className="p-1.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border-r dark:border-gray-600 hover:text-blue-600"><ExternalLink size={16}/></button>
                                                    <button onClick={() => handleCopyLink(auth.token)} title="Copiar enlace" className="p-1.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border-r dark:border-gray-600 hover:text-blue-600">{justCopied === auth.token ? <Check size={16} className="text-green-500"/> : <ClipboardCopy size={16}/>}</button>
                                                    <button onClick={() => handleSendEmail(student, auth.token)} title="Enviar Email" className="p-1.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border-r dark:border-gray-600 hover:text-blue-600"><Mail size={16}/></button>
                                                    <button onClick={() => handleSendWhatsApp(student, auth.token)} title="Enviar WhatsApp" className="p-1.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-green-600"><Send size={16}/></button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                             {historyData.length === 0 && (
                                <tr><td colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">No hay documentos generados para este alumno.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Modal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} title={`Configuración: ${configModalData?.title}`}>
                 {configModalData && (
                    <div className="space-y-4 p-2">
                         <h4 className="font-semibold border-b border-gray-200 dark:border-slate-600 pb-1 text-gray-800 dark:text-gray-200">Apartados generales incluidos:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            {configModalData.sections.map((s: string, i: number) => <li key={i}>{s}</li>)}
                        </ul>
                        
                        {configModalData.auths.length > 0 && (
                            <>
                                <h4 className="font-semibold border-b border-gray-200 dark:border-slate-600 pb-1 mt-4 text-gray-800 dark:text-gray-200">Autorización específica de este documento:</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                    {configModalData.auths.map((a: string, i: number) => <li key={i}>{a}</li>)}
                                </ul>
                            </>
                        )}
                    </div>
                 )}
                 <div className="flex justify-end mt-6">
                     <Button variant="secondary" onClick={() => setIsConfigModalOpen(false)}>Cerrar</Button>
                 </div>
            </Modal>
        </div>
    );
}

export default StudentAuthorizationsPage;
