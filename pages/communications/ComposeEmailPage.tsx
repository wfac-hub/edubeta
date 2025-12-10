
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { Send, Users, FileText, Eye, Search, Info, ChevronDown, ChevronUp, Plus, BookOpen, ClipboardCopy } from 'lucide-react';
import RichTextEditor from '../../components/ui/RichTextEditor';
import { Student, Course, Enrollment } from '../../types';

const AVAILABLE_VARIABLES = [
    { label: 'Nombre Destinatario', value: '#{NAME}#', desc: 'Nombre completo' },
    { label: 'Cursos Activos', value: '#{COURSE_NAMES}#', desc: 'Lista de cursos (Ej: Piano, Solfeo)' },
    { label: 'Email Destinatario', value: '#{EMAIL}#', desc: 'Email principal' },
    { label: 'Nombre Academia', value: '#{ACADEMY_NAME}#', desc: 'Nombre del centro' },
];

const ComposeEmailPage = () => {
    const { students, teachers, courses, courseLevels, classrooms, enrollments, emailTemplates, sendEmail, academyProfile } = useData();
    const navigate = useNavigate();
    
    // Section Visibility State
    const [isRecipientsExpanded, setIsRecipientsExpanded] = useState(true);
    const [isVariablesExpanded, setIsVariablesExpanded] = useState(false);

    // Active field tracking
    const [activeField, setActiveField] = useState<'subject' | 'body' | null>(null);

    // Selection State
    const [audience, setAudience] = useState<'students' | 'teachers'>('students');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filters
    const [filterLevel, setFilterLevel] = useState('');
    const [filterCourse, setFilterCourse] = useState('');
    const [filterClassroom, setFilterClassroom] = useState('');
    const [isCommercial, setIsCommercial] = useState(false);
    
    // Content State
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

    // 1. Filter Recipients Logic
    const availableRecipients = useMemo(() => {
        let recipients = [];

        if (audience === 'teachers') {
            recipients = teachers.map(t => ({
                id: t.id,
                name: `${t.name} ${t.lastName}`,
                email: t.email,
                subtext: 'Profesor',
                raw: t
            }));
        } else {
            // Filter Students
            let filteredStudents = students;

            // 1. Commercial / Newsletter Filter
            if (isCommercial) {
                filteredStudents = filteredStudents.filter(s => s.authorizations.newsletters);
            }

            // 2. Level, Course & Classroom Filters
            if (filterLevel || filterCourse || filterClassroom) {
                // Find IDs of students enrolled in matching courses
                const validStudentIds = new Set<number>();
                
                enrollments.forEach(enrollment => {
                    if (!enrollment.isActive) return;
                    
                    const course = courses.find(c => c.id === enrollment.courseId);
                    if (!course) return;

                    const matchesLevel = filterLevel ? course.level === filterLevel : true;
                    const matchesCourse = filterCourse ? course.id.toString() === filterCourse : true;
                    const matchesClassroom = filterClassroom ? course.classroomId.toString() === filterClassroom : true;

                    if (matchesLevel && matchesCourse && matchesClassroom) {
                        validStudentIds.add(enrollment.studentId);
                    }
                });

                filteredStudents = filteredStudents.filter(s => validStudentIds.has(s.id));
            }

            recipients = filteredStudents.map(s => ({
                id: s.id,
                name: `${s.firstName} ${s.lastName}`,
                email: s.email1,
                subtext: filterCourse ? courses.find(c => c.id.toString() === filterCourse)?.name : 'Alumno',
                raw: s
            }));
        }

        // 3. Text Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            recipients = recipients.filter(r => 
                r.name.toLowerCase().includes(lowerTerm) || 
                r.email.toLowerCase().includes(lowerTerm)
            );
        }

        return recipients;
    }, [audience, students, teachers, enrollments, courses, filterLevel, filterCourse, filterClassroom, isCommercial, searchTerm]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? availableRecipients.map(r => r.id) : []);
    };

    const handleSelectOne = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleTemplateLoad = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const tId = parseInt(e.target.value);
        setSelectedTemplateId(e.target.value);
        const template = emailTemplates.find(t => t.id === tId);
        if (template) {
            setSubject(template.subject);
            setBody(template.body);
        }
    };

    const insertVariable = (variable: string) => {
        if (activeField === 'subject') {
            setSubject(prev => prev + (prev.length > 0 && !prev.endsWith(' ') ? ' ' : '') + variable);
        } else if (activeField === 'body') {
            setBody(prev => prev + " " + variable); 
        } else {
            alert('Por favor, selecciona el campo Asunto o el Cuerpo del mensaje antes de insertar una variable.');
        }
    };

    // Logic to resolve dynamic content for the preview
    const getProcessedContent = (text: string) => {
        if (!text) return '';
        
        // Use the first selected recipient for the preview
        const recipientId = selectedIds.length > 0 ? selectedIds[0] : availableRecipients[0]?.id;
        const recipientData = availableRecipients.find(r => r.id === recipientId);
        
        if (!recipientData) return text; // No preview data available

        let processed = text;
        
        // Basic replacements
        processed = processed.replace(/#{NAME}#/g, recipientData.name);
        processed = processed.replace(/#{EMAIL}#/g, recipientData.email);
        processed = processed.replace(/#{ACADEMY_NAME}#/g, academyProfile.publicName);

        // Course List Replacement
        if (processed.includes('#{COURSE_NAMES}#')) {
            let courseNames = "Sin cursos";
            if (audience === 'students') {
                const studentCourses = enrollments
                    .filter(e => e.studentId === recipientData.id && e.isActive)
                    .map(e => courses.find(c => c.id === e.courseId)?.name)
                    .filter(Boolean) as string[];
                
                if (studentCourses.length > 0) {
                    courseNames = studentCourses.join(', ');
                }
            }
            processed = processed.replace(/#{COURSE_NAMES}#/g, courseNames);
        }
        // Legacy support
        processed = processed.replace(/#{STUDENT_NAME}#/g, recipientData.name);

        return processed;
    };

    const handleSend = () => {
        const recipients = availableRecipients
            .filter(r => selectedIds.includes(r.id))
            .map(r => ({ email: r.email, name: r.name }));

        if (recipients.length === 0) return alert("Selecciona al menos un destinatario");
        if (!subject) return alert("El asunto es obligatorio");
        
        sendEmail(0, recipients, { 
            isManual: true, 
            manualSubject: subject, 
            manualBody: body 
        });
        
        navigate('/communications/outbox');
    };

    const inputClasses = "w-full p-3 text-base border rounded-lg bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow";

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-24 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <Send className="text-primary-600 w-8 h-8"/> Redactar Comunicado
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Envío de emails masivos a alumnos y profesores.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                     <Button variant="secondary" onClick={() => navigate(-1)} className="flex-1 md:flex-none justify-center py-3">Cancelar</Button>
                     <Button onClick={handleSend} disabled={selectedIds.length === 0 || !subject} leftIcon={<Send size={18}/>} className="flex-1 md:flex-none justify-center py-3 shadow-lg shadow-primary-500/20">
                        Enviar ({selectedIds.length})
                    </Button>
                </div>
            </div>

            {/* 1. RECIPIENTS SECTION (ROW 1) */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
                <div 
                    className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center cursor-pointer bg-gray-50 dark:bg-slate-900/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => setIsRecipientsExpanded(!isRecipientsExpanded)}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                            <Users size={24}/>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white">1. Destinatarios</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold text-primary-600 dark:text-primary-400">{selectedIds.length}</span> seleccionados de {availableRecipients.length} disponibles
                            </p>
                        </div>
                    </div>
                    {isRecipientsExpanded ? <ChevronUp size={24} className="text-gray-400"/> : <ChevronDown size={24} className="text-gray-400"/>}
                </div>

                {isRecipientsExpanded && (
                    <div className="p-4 md:p-6 animate-in slide-in-from-top-2 fade-in duration-200">
                        {/* Filters */}
                        <div className="space-y-6 mb-6">
                            {/* Audience Switch */}
                            <div className="flex bg-gray-100 dark:bg-slate-700 rounded-xl p-1.5">
                                <button 
                                    onClick={() => { setAudience('students'); setFilterLevel(''); setFilterCourse(''); setFilterClassroom(''); }} 
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${audience === 'students' ? 'bg-white dark:bg-slate-600 text-primary-700 dark:text-primary-400 shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                                >
                                    Alumnos
                                </button>
                                <button 
                                    onClick={() => { setAudience('teachers'); setFilterLevel(''); setFilterCourse(''); setFilterClassroom(''); setIsCommercial(false); }} 
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${audience === 'teachers' ? 'bg-white dark:bg-slate-600 text-primary-700 dark:text-primary-400 shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                                >
                                    Profesores
                                </button>
                            </div>

                             {/* Conditional Filters */}
                            {audience === 'students' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className={inputClasses}>
                                        <option value="">Todos los Niveles</option>
                                        {[...new Set(courseLevels.map(l => l.name))].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                    <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className={inputClasses}>
                                        <option value="">Todos los Cursos</option>
                                        {courses.filter(c => !filterLevel || c.level === filterLevel).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <select value={filterClassroom} onChange={(e) => setFilterClassroom(e.target.value)} className={inputClasses}>
                                        <option value="">Todas las Aulas</option>
                                        {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    
                                    <label className="md:col-span-3 flex items-start gap-3 p-3 border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 rounded-lg cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={isCommercial} 
                                            onChange={(e) => setIsCommercial(e.target.checked)} 
                                            className="mt-1 h-5 w-5 text-amber-600 focus:ring-amber-500 rounded border-gray-300"
                                        />
                                        <div className="text-sm text-amber-900 dark:text-amber-200">
                                            <strong className="block">Solo Newsletter / Comercial</strong>
                                            <span>Enviar únicamente a alumnos que hayan aceptado recibir comunicaciones comerciales.</span>
                                        </div>
                                    </label>
                                </div>
                            )}

                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Buscar destinatario por nombre o email..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`${inputClasses} pl-10`}
                                />
                                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        {/* Recipient List */}
                        <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 flex flex-col max-h-[400px]">
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
                                 <label className="flex items-center text-sm text-gray-700 dark:text-gray-300 font-bold cursor-pointer select-none gap-[10px]">
                                    <input type="checkbox" className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-gray-300" onChange={handleSelectAll} checked={selectedIds.length === availableRecipients.length && availableRecipients.length > 0} />
                                    Seleccionar todos
                                </label>
                                <span className="text-xs font-bold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-1 rounded-md">
                                    {selectedIds.length} / {availableRecipients.length}
                                </span>
                            </div>
                            <div className="overflow-y-auto custom-scrollbar p-2 space-y-1">
                                {availableRecipients.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">No se encontraron destinatarios con los filtros actuales.</div>
                                ) : (
                                    availableRecipients.map(r => (
                                        <label key={r.id} className={`flex items-center p-3 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer rounded-lg transition-colors select-none gap-[10px] ${selectedIds.includes(r.id) ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'border border-transparent'}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.includes(r.id)} 
                                                onChange={() => handleSelectOne(r.id)}
                                                className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-gray-300 shrink-0"
                                            />
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{r.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="truncate">{r.email}</span>
                                                    {r.subtext && <span className="bg-gray-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide">{r.subtext}</span>}
                                                </div>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                        
                        {selectedIds.length > 0 && (
                            <div className="mt-4 flex justify-center">
                                <Button variant="secondary" size="sm" onClick={() => setIsRecipientsExpanded(false)} rightIcon={<ChevronUp size={16}/>}>
                                    Ocultar lista y continuar
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 2. CONTENT SECTION (ROW 2) */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex items-center gap-4">
                     <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                        <FileText size={24}/>
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">2. Contenido del mensaje</h2>
                </div>
                
                <div className="p-4 md:p-6 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-grow">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Asunto del correo</label>
                            <input 
                                type="text" 
                                placeholder="Escribe un asunto atractivo..." 
                                value={subject}
                                onFocus={() => setActiveField('subject')}
                                onChange={e => setSubject(e.target.value)}
                                className={inputClasses}
                            />
                        </div>
                        <div className="w-full md:w-72">
                             <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Cargar plantilla</label>
                            <select className={inputClasses} value={selectedTemplateId} onChange={handleTemplateLoad}>
                                <option value="">-- Seleccionar --</option>
                                {emailTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* VARIABLES PANEL */}
                    <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <div 
                            className="p-3 bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center cursor-pointer"
                            onClick={() => setIsVariablesExpanded(!isVariablesExpanded)}
                        >
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
                                <Info size={12}/> Referencias dinámicas disponibles
                            </p>
                            {isVariablesExpanded ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
                        </div>
                        
                        {isVariablesExpanded && (
                            <div className="p-4 bg-white dark:bg-slate-800 animate-in fade-in slide-in-from-top-1">
                                <div className="flex flex-wrap gap-3">
                                    {AVAILABLE_VARIABLES.map(v => (
                                        <div key={v.value} className="flex items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-1 pr-3 shadow-sm">
                                            <div className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-mono text-gray-600 dark:text-gray-300 mr-2">
                                                {v.value}
                                            </div>
                                            <div className="flex flex-col mr-3">
                                                <span className="text-xs font-medium text-gray-900 dark:text-white">{v.label}</span>
                                                <span className="text-[10px] text-gray-500 dark:text-gray-500">{v.desc}</span>
                                            </div>
                                            <div className="border-l pl-2 border-gray-200 dark:border-slate-600">
                                                <button onClick={() => insertVariable(v.value)} className="text-[10px] text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-2 py-1 rounded transition-colors flex items-center gap-1" title={`Pegar en ${activeField === 'subject' ? 'Asunto' : 'Cuerpo'}`}>
                                                    <ClipboardCopy size={10}/> Pegar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                         <div className="flex justify-between items-center mb-2">
                             <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Cuerpo del mensaje</label>
                             <span className="text-xs text-gray-500 flex items-center gap-1"><Info size={12}/> Usa las herramientas de formato</span>
                         </div>
                        <div className="border rounded-lg border-gray-300 dark:border-slate-600 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 transition-shadow">
                            <RichTextEditor value={body} onChange={setBody} onFocus={() => setActiveField('body')} rows={12} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. PREVIEW SECTION (ROW 3) */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                 <div className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex items-center gap-4">
                     <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                        <Eye size={24}/>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">3. Vista Previa</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Previsualización para: <span className="font-medium text-gray-700 dark:text-gray-300">{selectedIds.length > 0 ? availableRecipients.find(r=>r.id === selectedIds[0])?.name : 'Ningún destinatario seleccionado'}</span>
                        </p>
                    </div>
                </div>
                
                <div className="p-4 md:p-10 bg-gray-100 dark:bg-slate-900 flex justify-center">
                     <div className="bg-white w-full shadow-lg border border-gray-200 mx-auto rounded-md overflow-hidden flex flex-col max-w-[700px]">
                        {/* Header Image */}
                        {academyProfile.emailLogoBase64 ? (
                            <div className="w-full border-b border-gray-100 bg-gray-50">
                                <img src={academyProfile.emailLogoBase64} alt="Header" className="w-full h-auto object-contain max-h-40 mx-auto" />
                            </div>
                        ) : (
                             <div className="w-full h-24 bg-gray-200 flex items-center justify-center text-gray-400 text-sm border-b border-gray-100">
                                 [ Logo Cabecera ]
                             </div>
                        )}
                        
                        {/* Body */}
                        <div className="p-8 md:p-12 text-gray-800 font-sans flex-grow bg-white min-h-[300px]">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900 pb-4 border-b border-gray-100">
                                {getProcessedContent(subject) || <span className="text-gray-300 italic font-normal">Asunto del correo...</span>}
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: getProcessedContent(body) || '<p class="text-gray-400 italic">Escribe tu mensaje...</p>' }} />
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 border-t border-gray-200 p-8 mt-auto">
                             {academyProfile.emailFooterImageBase64 && (
                                <img src={academyProfile.emailFooterImageBase64} alt="Footer" className="w-full h-auto object-contain max-h-32 mb-6 mx-auto" />
                            )}
                            <div className="text-xs text-gray-500 text-center leading-relaxed max-w-2xl mx-auto space-y-2" dangerouslySetInnerHTML={{ __html: academyProfile.emailFooterText || '<p>Texto legal del pie de página...</p>' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end">
                 <Button onClick={handleSend} disabled={selectedIds.length === 0 || !subject} leftIcon={<Send size={20}/>} className="w-full md:w-auto py-4 text-lg shadow-xl shadow-primary-600/20">
                        Enviar Comunicado a {selectedIds.length} destinatarios
                </Button>
            </div>

        </div>
    );
};

export default ComposeEmailPage;
