

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Trash2, Download, FileStack, Search, Mail, FileText, ChevronDown, MoreHorizontal, X } from 'lucide-react';
import { Receipt } from '../types';
import { formatDate } from '../utils/helpers';

const AllReceiptsPage = () => {
    const { 
        receipts, 
        updateReceipt, 
        deleteReceipts, 
        studentMap, 
        courseMap,
        invoices,
        generateReceiptPdf,
        courses
    } = useData();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [selectedReceipts, setSelectedReceipts] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    
    const [filters, setFilters] = useState({
        paymentType: '',
        status: searchParams.get('status') || '',
        receiptDateFrom: '',
        receiptDateTo: searchParams.get('dateTo') || '',
        courseId: searchParams.get('courseId') || '',
        courseActive: '', // New filter for Active Courses
    });

    const [facturacionOpen, setFacturacionOpen] = useState(false);
    const facturacionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (facturacionRef.current && !facturacionRef.current.contains(event.target as Node)) {
                setFacturacionOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const enrichedReceipts = useMemo(() => {
        return receipts.map(receipt => {
            const student = studentMap[receipt.studentId];
            const course = courseMap[receipt.courseId];
            const invoice = receipt.invoiceId ? invoices.find(inv => inv.id === receipt.invoiceId) : undefined;
            return { ...receipt, student, course, invoiceCode: invoice?.invoiceCode };
        });
    }, [receipts, studentMap, courseMap, invoices]);

    const filteredReceipts = useMemo(() => {
        return enrichedReceipts.filter(r => {
            if (!r.student || !r.course) return false;

            const searchMatch = r.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                r.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                r.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                r.concept.toLowerCase().includes(searchTerm.toLowerCase());

            const paymentTypeMatch = filters.paymentType ? r.paymentType === filters.paymentType : true;
            const statusMatch = filters.status ? r.status === filters.status : true;
            const courseMatch = filters.courseId ? r.courseId === parseInt(filters.courseId) : true;
            const courseActiveMatch = filters.courseActive ? String(r.course.isActive) === filters.courseActive : true;
            
            const dateFromMatch = filters.receiptDateFrom ? new Date(r.receiptDate) >= new Date(filters.receiptDateFrom) : true;
            const dateToMatch = filters.receiptDateTo ? new Date(r.receiptDate) <= new Date(filters.receiptDateTo) : true;
            
            return searchMatch && paymentTypeMatch && statusMatch && dateFromMatch && dateToMatch && courseMatch && courseActiveMatch;
        }).sort((a, b) => new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime());
    }, [enrichedReceipts, searchTerm, filters]);

    const summary = useMemo(() => {
        const total = filteredReceipts.reduce((sum, r) => sum + r.amount, 0);
        const paid = filteredReceipts.filter(r => r.status === 'Cobrado').reduce((sum, r) => sum + r.amount, 0);
        return { total, paid, pending: total - paid };
    }, [filteredReceipts]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const clearCourseFilter = () => {
        setFilters(prev => ({ ...prev, courseId: '' }));
    }

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedReceipts(e.target.checked ? filteredReceipts.map(r => r.id) : []);
    };

    const handleSelectOne = (id: number) => {
        setSelectedReceipts(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
    };
    
    const handleToggleStatus = (receipt: Receipt) => {
        if (receipt.status === 'Cobrado') {
            updateReceipt({ ...receipt, status: 'Pendiente', paymentDate: undefined });
        } else {
            updateReceipt({ ...receipt, status: 'Cobrado', paymentDate: new Date().toISOString().split('T')[0] });
        }
    };
    
    const handleGenerateInvoicesWizard = () => {
        navigate('/receipts/generate-invoices', { state: { receiptIds: selectedReceipts } });
        setFacturacionOpen(false);
    };
    
    const inputClasses = "p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500";
    
    const activeCourseName = filters.courseId ? courses.find(c => c.id === parseInt(filters.courseId))?.name : null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Todos los recibos</h1>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">{filteredReceipts.length} Resultados</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<Trash2 size={16}/>} disabled={selectedReceipts.length === 0} onClick={() => deleteReceipts(selectedReceipts)}>Borrar</Button>
                    <Button variant="secondary" size="sm" leftIcon={<Download size={16}/>}>Exportar a Excel</Button>
                    <Button variant="secondary" size="sm" leftIcon={<FileStack size={16}/>}>Alta masiva de recibos</Button>
                    <Button variant="secondary" size="sm" rightIcon={<ChevronDown size={16}/>}>Edición...</Button>
                    <Button variant="secondary" size="sm" rightIcon={<ChevronDown size={16}/>}>Envío...</Button>
                    <div className="relative" ref={facturacionRef}>
                        <Button variant="secondary" size="sm" rightIcon={<ChevronDown size={16}/>} onClick={() => setFacturacionOpen(prev => !prev)}>Facturación...</Button>
                        {facturacionOpen && (
                            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-md shadow-lg z-10 w-60">
                                <button
                                    onClick={handleGenerateInvoicesWizard}
                                    disabled={selectedReceipts.length === 0}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Generar factura de la selección
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-grow"></div>
                    <div className="relative col-span-full lg:col-span-2">
                        <input type="text" placeholder="Buscar" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={inputClasses + " w-full pl-4 pr-10"}/>
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                 <div className="flex flex-wrap gap-4 items-center">
                    <select name="paymentType" value={filters.paymentType} onChange={handleFilterChange} className={inputClasses + " min-w-[150px]"}>
                        <option value="">Tipo de pago</option>
                        <option value="Domiciliado">Domiciliado</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Tarjeta">Tarjeta</option>
                    </select>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className={inputClasses + " min-w-[150px]"}>
                        <option value="">Estado</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Cobrado">Cobrado</option>
                        <option value="Devuelto">Devuelto</option>
                    </select>
                    <select name="courseActive" value={filters.courseActive} onChange={handleFilterChange} className={inputClasses + " min-w-[150px]"}>
                        <option value="">¿Curso activo?</option>
                        <option value="true">Sí</option>
                        <option value="false">No</option>
                    </select>
                     <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-900 p-1 rounded border border-gray-200 dark:border-slate-700">
                        <span className="font-medium px-2">Fecha recibo:</span>
                        <input type="date" name="receiptDateFrom" value={filters.receiptDateFrom} onChange={handleFilterChange} className="p-1.5 border rounded text-sm bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600" placeholder="Desde" />
                        <span>-</span>
                        <input type="date" name="receiptDateTo" value={filters.receiptDateTo} onChange={handleFilterChange} className="p-1.5 border rounded text-sm bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600" placeholder="Hasta" />
                    </div>
                </div>
            </div>

            <div className="bg-cyan-100 dark:bg-cyan-900/30 p-3 rounded-lg flex flex-wrap items-center justify-around text-center text-sm font-medium">
                <span className="text-gray-800 dark:text-cyan-200">Total importe recibos: <span className="font-bold">{summary.total.toFixed(2)} €</span></span>
                <span className="text-gray-800 dark:text-cyan-200">Importe cobrado: <span className="font-bold text-green-600 dark:text-green-400">{summary.paid.toFixed(2)} €</span></span>
                <span className="text-gray-800 dark:text-cyan-200">Importe pendiente: <span className="font-bold text-red-600 dark:text-red-400">{summary.pending.toFixed(2)} €</span></span>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {/* Desktop View */}
                <div className="hidden lg:grid lg:grid-cols-[auto_1fr_2fr_2fr_1fr_2fr_1fr_1fr_1fr] gap-x-6 px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-700/50 rounded-t-lg items-center">
                    <input type="checkbox" onChange={handleSelectAll} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-primary-600 focus:ring-primary-500"/>
                    <div>Fecha</div>
                    <div>Alumno/Curso</div>
                    <div>Concepto</div>
                    <div className="text-right">Importe</div>
                    <div className="text-left">¿Cobrado?</div>
                    <div className="text-center">Fichero PDF</div>
                    <div className="text-center">Enviar</div>
                    <div className="text-center">Factura</div>
                </div>
                 <div className="divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredReceipts.map(r => (
                        <div key={r.id}>
                            {/* Mobile View */}
                            <div className="lg:hidden p-4" onClick={() => setExpandedRow(prev => prev === r.id ? null : r.id)}>
                                <div className="flex items-start gap-4">
                                    <input type="checkbox" checked={selectedReceipts.includes(r.id)} onChange={() => handleSelectOne(r.id)} onClick={(e) => e.stopPropagation()} className="h-4 w-4 rounded border text-primary-600 focus:ring-primary-500 mt-1"/>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-blue-600 dark:text-blue-400">{r.student?.lastName}, {r.student?.firstName}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{r.course?.name}</p>
                                            </div>
                                            <p className="font-semibold text-gray-800 dark:text-white">{r.amount.toFixed(2)} €</p>
                                        </div>
                                         <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{r.concept}</p>
                                    </div>
                                    <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === r.id ? 'rotate-90' : ''}`} />
                                </div>
                            </div>
                            <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === r.id ? 'max-h-[500px]' : ''}`}>
                                <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50 text-sm space-y-3">
                                    <div className="flex justify-between"><span className="font-semibold text-gray-500">Fecha:</span> <Link to={`/receipts/${r.id}/edit`} className="font-medium text-blue-600 hover:underline">{formatDate(r.receiptDate)}</Link></div>
                                    <div className="flex justify-between items-start"><span className="font-semibold text-gray-500 mt-1">Cobrado:</span> 
                                         {r.status === 'Cobrado' ? (
                                            <div className="text-right">
                                                <p className="font-semibold text-green-600 dark:text-green-400">Cobrado: {formatDate(r.paymentDate)}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400"><span className="font-bold">Pago:</span> {r.paymentType}</p>
                                                <button onClick={() => handleToggleStatus(r)} className="text-xs text-red-500 dark:text-red-400 hover:underline">Ø Revertir cobro</button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-end">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(r); }}
                                                    className="mb-1 px-2 py-1 rounded border border-green-500 text-green-600 text-xs font-medium hover:bg-green-50 dark:hover:bg-green-900/20 bg-transparent transition-colors"
                                                >
                                                    € Cobrar
                                                </button>
                                                <div className="text-xs text-gray-600 dark:text-gray-400 text-right">
                                                    <p><span className="font-bold text-gray-800 dark:text-gray-200">Pago:</span> {r.paymentType}</p>
                                                    {r.paymentType === 'Domiciliado' && r.domiciliationDate && (
                                                        <p><span className="font-bold text-gray-800 dark:text-gray-200">Domiciliación:</span> {formatDate(r.domiciliationDate)}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center pt-2"><span className="font-semibold text-gray-500">Fichero PDF:</span>
                                        {(r.pdfSnapshot || r.receiptCode) ? (
                                            <div className="text-right">
                                                <Link to={`/receipts/${r.id}/pdf`} className="flex items-center gap-1 text-blue-600 hover:underline">
                                                    <FileText size={16}/>
                                                    <span className="font-medium">{r.receiptCode || r.id}</span>
                                                </Link>
                                                <button onClick={(e) => { e.stopPropagation(); generateReceiptPdf(r.id); }} className="text-xs text-gray-500 hover:underline">Actualizar</button>
                                            </div>
                                        ) : (
                                            <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); generateReceiptPdf(r.id); }}>
                                                <FileText size={14} className="mr-1"/> Generar
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t dark:border-slate-600">
                                        <span className="font-semibold text-gray-500">Acciones:</span>
                                        <div className="flex items-center gap-2">
                                            <button title="Enviar por email" className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600"><Mail size={18} className="text-gray-500"/></button>
                                            {r.isInvoiceGenerated ? (
                                                <Link to={`/receipts/${r.id}/invoices`} title="Ver Factura" className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600"><FileText size={18} className="text-green-600"/></Link>
                                            ) : (
                                                <Button size="sm" variant="secondary" onClick={() => navigate('/receipts/generate-invoices', { state: { receiptIds: [r.id] } })}>Pasar a factura</Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Row */}
                            <div className="hidden lg:grid lg:grid-cols-[auto_1fr_2fr_2fr_1fr_2fr_1fr_1fr_1fr] lg:gap-x-6 lg:items-center px-6 py-4 text-sm">
                                <input type="checkbox" checked={selectedReceipts.includes(r.id)} onChange={() => handleSelectOne(r.id)} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-primary-600 focus:ring-primary-500"/>
                                <Link to={`/receipts/${r.id}/edit`} className="font-semibold text-blue-600 hover:underline">{formatDate(r.receiptDate)}</Link>
                                <div>
                                    <p className="font-bold text-blue-600 dark:text-blue-400 hover:underline">{r.student?.lastName}, {r.student?.firstName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{r.course?.name}</p>
                                </div>
                                <Link to={`/receipts/${r.id}/edit`} className="text-gray-600 dark:text-gray-300 hover:underline">{r.concept}</Link>
                                <div className="text-right font-semibold text-gray-800 dark:text-white">{r.amount.toFixed(2)} €</div>
                                <div className="text-left pl-2">
                                     {r.status === 'Cobrado' ? (
                                        <div>
                                            <p className="font-semibold text-green-600 dark:text-green-400">Cobrado: {formatDate(r.paymentDate)}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400"><span className="font-bold text-gray-700 dark:text-gray-300">Pago:</span> {r.paymentType}</p>
                                            <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(r); }} className="text-xs text-red-500 dark:text-red-400 hover:underline">Ø Revertir cobro</button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-start">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleToggleStatus(r); }}
                                                className="mb-1 px-2 py-0.5 rounded border border-green-500 text-green-600 text-xs font-medium hover:bg-green-50 dark:hover:bg-green-900/20 bg-transparent transition-colors"
                                            >
                                                € Cobrar
                                            </button>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                 <p><span className="font-bold text-gray-800 dark:text-gray-200">Pago:</span> {r.paymentType}</p>
                                                 {r.paymentType === 'Domiciliado' && r.domiciliationDate && (
                                                     <p><span className="font-bold text-gray-800 dark:text-gray-200">Domiciliación:</span> {formatDate(r.domiciliationDate)}</p>
                                                 )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center">
                                    {(r.pdfSnapshot || r.receiptCode) ? (
                                        <>
                                            <Link to={`/receipts/${r.id}/pdf`} className="flex items-center gap-2 text-blue-600 hover:underline justify-center">
                                                <FileText size={18}/>
                                                <span className="text-xs font-semibold">{r.receiptCode || r.id}</span>
                                            </Link>
                                            <button onClick={() => generateReceiptPdf(r.id)} className="text-xs text-gray-500 hover:underline block mx-auto">Actualizar</button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            <span className="flex items-center gap-1 text-gray-400"><FileText size={16} /> --</span>
                                            <Button variant="secondary" size="sm" onClick={() => generateReceiptPdf(r.id)}>
                                                Generar
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <button className="text-gray-500 hover:text-blue-600"><Mail size={18}/></button>
                                </div>
                                <div className="text-center">
                                    {r.isInvoiceGenerated ? (
                                        <Link to={`/receipts/${r.id}/invoices`} className="flex flex-col items-center justify-center gap-0 text-blue-600 dark:text-blue-400 hover:underline">
                                            <FileText size={18} /> 
                                            <span className="text-xs">{r.invoiceCode || `Factura #${r.invoiceId}`}</span>
                                        </Link>
                                    ) : (
                                        <Button size="sm" variant="secondary" onClick={() => navigate('/receipts/generate-invoices', { state: { receiptIds: [r.id] } })}>
                                            Pasar a factura
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};

export default AllReceiptsPage;
