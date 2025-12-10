
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { MoveLeft, Save, HelpCircle, ChevronDown, Check, Plus, Search, Upload, Trash2, Image as ImageIcon, AlertCircle, List, Eye, Mail } from 'lucide-react';
import { LandingPage, LandingCourseSelectionMode, Course, Classroom, CourseLevel } from '../../types';
import RichTextEditor from '../../components/ui/RichTextEditor';
import Modal from '../../components/ui/Modal';

// --- Internal Component: SearchableMultiSelect (Checkbox Dropdown) ---
interface MultiSelectProps {
    items: { id: number; label: string }[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    placeholder: string;
}

const SearchableMultiSelect: React.FC<MultiSelectProps> = ({ items, selectedIds, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filteredItems = useMemo(() => 
        items.filter(i => i.label.toLowerCase().includes(searchTerm.toLowerCase()))
    , [items, searchTerm]);

    const selectedLabels = useMemo(() => 
        items.filter(i => selectedIds.includes(i.id)).map(i => i.label)
    , [items, selectedIds]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleSelection = (id: number) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(sid => sid !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div 
                className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors hover:border-gray-400"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="truncate pr-2 select-none">
                    {selectedIds.length > 0 
                        ? <span className="font-medium">{selectedLabels.join(', ')}</span>
                        : <span className="text-gray-400">{placeholder}</span>}
                </div>
                <ChevronDown size={16} className={`text-gray-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md shadow-xl max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                        <div className="relative">
                            <input 
                                type="text" 
                                className="w-full p-1.5 pl-7 text-xs border rounded bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white"
                                placeholder="Filtrar opciones..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
                        {filteredItems.map(item => {
                            const isSelected = selectedIds.includes(item.id);
                            return (
                                <div 
                                    key={item.id} 
                                    className={`flex items-center px-3 py-2 text-sm cursor-pointer rounded transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 select-none ${isSelected ? 'bg-blue-50 dark:bg-slate-700/50' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors ${isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-slate-800'}`}>
                                        {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <span className={`text-gray-700 dark:text-gray-200 ${isSelected ? 'font-medium text-primary-900 dark:text-primary-100' : ''}`}>{item.label}</span>
                                </div>
                            )
                        })}
                        {filteredItems.length === 0 && (
                            <div className="p-4 text-center text-xs text-gray-500 italic">No se encontraron resultados</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const CollapsibleSection: React.FC<{ title: string, children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden mb-6">
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
                <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">{title}</h3>
                <ChevronDown size={20} className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-6 animate-in slide-in-from-top-2 fade-in duration-200">{children}</div>}
        </div>
    );
};

const Toggle: React.FC<{ label: string, checked: boolean, onChange: (val: boolean) => void, help?: string }> = ({ label, checked, onChange, help }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <div className="flex items-center gap-1 sm:w-80">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            {help && <span title={help} className="flex items-center cursor-help"><HelpCircle size={14} className="text-gray-400" /></span>}
        </div>
        <div className="flex gap-4 items-center">
            <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" checked={checked} onChange={() => onChange(true)} className="text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600"/>
                <span className="text-sm text-gray-700 dark:text-gray-300">Sí</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" checked={!checked} onChange={() => onChange(false)} className="text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600"/>
                <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
            </label>
        </div>
    </div>
);

const LandingPageEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { landingPages, updateLandingPage, courses, authorizations, levelGroups, courseLevels, locations, landingCustomFields, emailTemplates } = useData();
    
    const isNew = id === 'new';
    const existingLanding = useMemo(() => landingPages.find(l => l.id === parseInt(id || '0')), [landingPages, id]);

    // State for slug validation
    const [slugError, setSlugError] = useState<string | null>(null);
    
    // Modal for Email Preview
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewContent, setPreviewContent] = useState<{subject: string, body: string} | null>(null);

    const [formData, setFormData] = useState<LandingPage>({
        id: 0,
        title: '',
        slug: '',
        isActive: true,
        isDefault: false,
        styles: {
            primaryColor: '#3b82f6',
            logoUrl: '',
            backgroundColor: '#ffffff'
        },
        stepConfig: {
            step1Title: 'Datos alumno',
            step2Title: 'Otros datos',
            step3Title: 'Cursos',
            step4Title: 'Pago'
        },
        studentDataBlockTitle: 'Datos básicos alumno/a',
        studentDataBlockDescription: '',
        courseSelectionBlockTitle: 'Selección de curso',
        courseSelectionBlockDescription: '',
        paymentBlockTitle: 'Resumen y pago',
        paymentBlockDescription: '',
        offeredCourseIds: [],
        courseSelectionMode: 'courses',
        selectedGroupIds: [],
        selectedLevelIds: [],
        bannedLocationIds: [],
        showVacancies: true,
        showDates: true,
        showPrices: true,
        showLocation: true,
        showTotalClasses: true,
        showSchedule: true,
        allowMultipleCourses: false,
        allowReturnToEnroll: false,
        studentAccessMode: 'all',
        studentFields: {
            dniRequired: true,
            birthDateRequired: true,
            addressRequired: true,
            postalAddressRequired: true,
            photoRequired: false,
            photoActive: true,
            observationsActive: false
        },
        customFieldsBlock: {
            isActive: false,
            title: 'Otros datos',
            description: 'Para formalizar tu inscripción necesitamos que rellenes los siguientes datos'
        },
        additionalInfoBlock: {
            title: 'Otra información del alumno/a',
            description: 'En este paso se recoge otra información para los alumnos nuevos, como alergias, si puede salir solo (para el caso de menores), etc.',
            askMedical: false,
            secondTutorRequired: false,
            askLeaveAlone: true,
            requestTutorIfMinor: true,
        },
        paymentMethods: {
            cash: false,
            transfer: false,
            domiciliation: true,
            card: false,
            bizum: false
        },
        askBillingData: false,
        privacyPolicy: {
            useAcademyText: true,
            customTitle: 'Política de privacidad',
            customText: '',
            checkboxText: 'He leído y acepto la política de privacidad'
        },
        supportText: {
            modalTitle: 'Apoyo y ayuda',
            content: ''
        },
        notifications: {
            notifyEmail: 'hola@edubeta.com',
            confirmationSubject: 'Inscripción on-line',
            confirmationBody: '¡Hola #nombre#! Hemos registrado correctamente tu inscripción...',
            existingStudentSubject: 'Inscripción on-line',
            existingStudentBody: 'Gracias por volver a confiar en nosotros...'
        },
        authorizationIds: [],
        visits: 0,
        conversions: 0,
        description: '',
        footerText: ''
    });

    // State for Auth Mode Radio Button UI
    const [authMode, setAuthMode] = useState<'all' | 'select' | 'none'>('select');

    useEffect(() => {
        if (existingLanding) {
            // Ensure nested objects exist
            const safeStepConfig = existingLanding.stepConfig || {
                step1Title: 'Datos alumno',
                step2Title: 'Otros datos',
                step3Title: 'Cursos',
                step4Title: 'Pago'
            };

            setFormData({
                // Default fallbacks for new properties if missing
                courseSelectionMode: 'courses',
                selectedGroupIds: [],
                selectedLevelIds: [],
                bannedLocationIds: [],
                studentAccessMode: 'all',
                studentDataBlockTitle: 'Datos básicos alumno/a',
                courseSelectionBlockTitle: 'Selección de curso',
                paymentBlockTitle: 'Resumen y pago',
                courseSelectionBlockDescription: '', 
                paymentBlockDescription: '',
                studentDataBlockDescription: '',
                ...existingLanding,
                stepConfig: safeStepConfig,
                studentFields: {
                    photoActive: true,
                    ...existingLanding.studentFields
                }
            });
            // Determine initial auth mode
            if (existingLanding.authorizationIds.length === 0) {
                setAuthMode('none');
            } else if (existingLanding.authorizationIds.length === authorizations.length) {
                setAuthMode('all');
            } else {
                setAuthMode('select');
            }
        }
    }, [existingLanding, authorizations]);

    // Update authIds when authMode changes
    useEffect(() => {
        if (authMode === 'all') {
            setFormData(prev => ({ ...prev, authorizationIds: authorizations.map(a => a.id) }));
        } else if (authMode === 'none') {
            setFormData(prev => ({ ...prev, authorizationIds: [] }));
        }
    }, [authMode, authorizations]);


    // Validation function for slug
    const validateSlug = (slug: string) => {
        if (!slug) return null; // Empty slug handled by auto-generation or required field check later
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(slug)) {
            return "El slug solo puede contener letras minúsculas, números y guiones sin espacios.";
        }
        const exists = landingPages.some(l => l.slug === slug && l.id !== formData.id);
        if (exists) {
            return "Este slug ya está en uso por otra landing page.";
        }
        return null;
    };

    const handleChange = (field: keyof LandingPage, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'slug') {
            setSlugError(validateSlug(value));
        }
    };

    const handleDeepChange = (path: string, value: any) => {
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newState;
        });
    };

    const handleSave = () => {
        let finalSlug = formData.slug;
        if (!finalSlug) {
            finalSlug = formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            setFormData(prev => ({ ...prev, slug: finalSlug }));
        }
        const error = validateSlug(finalSlug);
        if (error) {
            setSlugError(error);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        updateLandingPage({ ...formData, slug: finalSlug });
        navigate('/center-management/landing-pages');
    };

    const toggleAuth = (authId: number) => {
        if (authMode === 'all') return;
        const current = formData.authorizationIds;
        const updated = current.includes(authId) 
            ? current.filter(id => id !== authId)
            : [...current, authId];
        handleChange('authorizationIds', updated);
    };

    const handlePreviewEmail = (templateId?: number, subject?: string) => {
        if (!templateId) return alert("Selecciona una plantilla para previsualizar.");
        const template = emailTemplates.find(t => t.id === templateId);
        if (template) {
            // Replace basic dummy variables for preview
            let body = template.body;
            body = body.replace('#nombre#', 'Juan').replace('#{STUDENT_NAME}#', 'Juan Pérez');
            
            setPreviewContent({
                subject: subject || template.subject,
                body: body
            });
            setIsPreviewModalOpen(true);
        }
    };

    const inputClasses = "w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500";
    const labelClasses = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1";

    // Transform data for MultiSelect
    const groupOptions = useMemo(() => levelGroups.map(g => ({ id: g.id, label: g.name })), [levelGroups]);
    const levelOptions = useMemo(() => courseLevels.map(l => ({ id: l.id, label: l.name })), [courseLevels]);
    const courseOptions = useMemo(() => courses.filter(c => c.isActive).map(c => ({ id: c.id, label: c.name })), [courses]);
    const locationOptions = useMemo(() => locations.map(l => ({ id: l.id, label: `${l.name} (${l.population})` })), [locations]);

    const getFieldsCount = (landingId: number) => {
        return landingCustomFields.filter(f => f.landingId === landingId).length;
    }

    const renderCourseDetails = (course: Course, classroom: Classroom | undefined, level: CourseLevel | undefined) => {
        if (!formData) return null;
        const locationObj = locations.find(l => l.name === classroom?.location);
        const locationText = classroom ? `${classroom.location}${locationObj ? ` (${locationObj.population})` : ''}` : '';
        const courseSchedules = []; // Assuming schedules is handled elsewhere or not available in this scope correctly without importing schedules

        let monthlyPrice = level?.monthlyPrice || 0;
        if (course.alternativePrice?.active && course.alternativePrice.monthly.active) {
            monthlyPrice = course.alternativePrice.monthly.price;
        }

        return (
            <div className="flex flex-col gap-1 mt-2 text-gray-600">
                {formData.showDates && <div className="flex items-center gap-2 text-sm"><span className="flex items-center gap-1"><div className="w-3.5 h-3.5 bg-gray-400 rounded-full"/> {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}</span></div>}
                {formData.showLocation && classroom && <div className="text-sm flex items-center gap-1"><div className="w-3.5 h-3.5 bg-gray-400 rounded-full"/> {locationText}</div>}
                {formData.showPrices && (level || course.alternativePrice?.active) && <div className="text-sm mt-1"><p>Cuota mensual: <span className="font-bold text-blue-600">{monthlyPrice.toFixed(2)} €</span></p></div>}
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto pb-24">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-blue-900 dark:text-white">
                    {isNew ? 'Nueva Landing' : `«${formData.title}»`}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Actualizar – Landings de inscripción</p>
            </div>

            <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 flex items-center gap-4">
                <span className="font-bold text-sm text-gray-800 dark:text-white">¿Activa?</span>
                <div className="flex gap-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={formData.isActive} onChange={() => handleChange('isActive', true)} className="text-primary-600 focus:ring-primary-500"/> 
                        <span className="text-gray-700 dark:text-gray-300">Sí</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={!formData.isActive} onChange={() => handleChange('isActive', false)} className="text-primary-600 focus:ring-primary-500"/> 
                        <span className="text-gray-700 dark:text-gray-300">No</span>
                    </label>
                </div>
            </div>

            <CollapsibleSection title="Datos generales">
                <div className="space-y-4">
                    <div>
                        <label className={labelClasses}>Título principal del proceso de inscripción</label>
                        <input type="text" value={formData.title} onChange={e => handleChange('title', e.target.value)} className={inputClasses} placeholder="Ej: Matrícula on-line Curso 2025-2026" />
                    </div>
                    <div>
                        <label className={labelClasses}>Slug (URL amigable)</label>
                        <input 
                            type="text" 
                            value={formData.slug} 
                            onChange={e => handleChange('slug', e.target.value)} 
                            className={`${inputClasses} font-mono text-sm ${slugError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`} 
                            placeholder="ej: matricula-2025" 
                        />
                        {slugError ? (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} /> {slugError}</p>
                        ) : (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">URL final: .../public/register/<strong>{formData.slug || '...'}</strong>. Solo minúsculas, números y guiones.</p>
                        )}
                    </div>
                    <div>
                        <label className={labelClasses}>Firma al pie de página</label>
                        <input type="text" value={formData.footerText || ''} onChange={e => handleChange('footerText', e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                         <label className={labelClasses}>Descripción (opcional)</label>
                         <RichTextEditor value={formData.description || ''} onChange={val => handleChange('description', val)} rows={4} />
                    </div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Paso 1 - Datos básicos">
                 <div className="mb-4">
                     <label className={labelClasses}>Título del paso 1 (Stepper)</label>
                     <input type="text" value={formData.stepConfig?.step1Title} onChange={e => handleDeepChange('stepConfig.step1Title', e.target.value)} className={inputClasses} />
                 </div>
                 <div className="space-y-4 mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-md border border-slate-200 dark:border-slate-700">
                     <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-2">Bloque de datos básicos del alumno</h4>
                     <div>
                         <label className={labelClasses}>Título del bloque (Contenido)</label>
                         <input type="text" value={formData.studentDataBlockTitle} onChange={e => handleChange('studentDataBlockTitle', e.target.value)} className={inputClasses} />
                     </div>
                     <div>
                         <label className={labelClasses}>Descripción (opcional)</label>
                         <RichTextEditor value={formData.studentDataBlockDescription || ''} onChange={val => handleChange('studentDataBlockDescription', val)} rows={2} />
                     </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <Toggle label="¿DNI obligatorio?" checked={formData.studentFields.dniRequired} onChange={val => handleDeepChange('studentFields.dniRequired', val)} />
                    <Toggle label="¿Fecha nacimiento obligatoria?" checked={formData.studentFields.birthDateRequired} onChange={val => handleDeepChange('studentFields.birthDateRequired', val)} />
                    <Toggle label="¿Dirección postal obligatoria?" checked={formData.studentFields.addressRequired} onChange={val => handleDeepChange('studentFields.addressRequired', val)} />
                    <Toggle label="¿Pedir foto?" checked={formData.studentFields.photoActive} onChange={val => handleDeepChange('studentFields.photoActive', val)} />
                    {formData.studentFields.photoActive && <Toggle label="¿Foto obligatoria?" checked={formData.studentFields.photoRequired} onChange={val => handleDeepChange('studentFields.photoRequired', val)} />}
                    <Toggle label="¿Observaciones activas?" checked={formData.studentFields.observationsActive} onChange={val => handleDeepChange('studentFields.observationsActive', val)} />
                </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Paso 2 - Otros datos y autorizaciones">
                 <div className="mb-4">
                     <label className={labelClasses}>Título del paso 2 (Stepper)</label>
                     <input type="text" value={formData.stepConfig?.step2Title} onChange={e => handleDeepChange('stepConfig.step2Title', e.target.value)} className={inputClasses} />
                 </div>
                 <div className="space-y-4 mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-md border border-slate-200 dark:border-slate-700">
                     <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-2">Bloque de otros datos</h4>
                     <div>
                         <label className={labelClasses}>Título del bloque</label>
                         <input type="text" value={formData.additionalInfoBlock.title} onChange={e => handleDeepChange('additionalInfoBlock.title', e.target.value)} className={inputClasses} />
                     </div>
                     <div>
                         <label className={labelClasses}>Descripción (opcional)</label>
                         <RichTextEditor value={formData.additionalInfoBlock.description} onChange={val => handleDeepChange('additionalInfoBlock.description', val)} rows={3} />
                     </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <Toggle label="¿Solicitar datos de tutor si es menor?" checked={formData.additionalInfoBlock.requestTutorIfMinor} onChange={val => handleDeepChange('additionalInfoBlock.requestTutorIfMinor', val)} />
                    <Toggle label="¿Pedir información sobre datos médicos?" checked={formData.additionalInfoBlock.askMedical} onChange={val => handleDeepChange('additionalInfoBlock.askMedical', val)} />
                    <Toggle label="¿Segundo tutor obligatorio?" checked={formData.additionalInfoBlock.secondTutorRequired} onChange={val => handleDeepChange('additionalInfoBlock.secondTutorRequired', val)} />
                    <Toggle label="¿Pedir autorización para salir solo/a?" checked={formData.additionalInfoBlock.askLeaveAlone} onChange={val => handleDeepChange('additionalInfoBlock.askLeaveAlone', val)} />
                </div>
                
                {/* Autorizaciones Config */}
                <div className="mt-6 border-t border-gray-200 dark:border-slate-700 pt-6">
                     <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Selecciona las autorizaciones que se van a poder editar en el proceso de inscripción.</p>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2"><input type="radio" name="auth_mode" checked={authMode === 'all'} onChange={() => setAuthMode('all')} className="text-primary-600"/> Todas las activas</label>
                            <label className="flex items-center gap-2"><input type="radio" name="auth_mode" checked={authMode === 'select'} onChange={() => setAuthMode('select')} className="text-primary-600"/> Escoger de la lista</label>
                            <label className="flex items-center gap-2"><input type="radio" name="auth_mode" checked={authMode === 'none'} onChange={() => setAuthMode('none')} className="text-primary-600"/> Ninguna</label>
                        </div>
                        
                        {(authMode === 'select' || authMode === 'all') && (
                            <div className="pt-2 pl-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                {authorizations.map(auth => (
                                    <label key={auth.id} className={`flex items-center gap-3 p-2 rounded transition-colors ${authMode === 'select' ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800' : 'cursor-default opacity-80'}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={formData.authorizationIds.includes(auth.id)} 
                                            onChange={() => toggleAuth(auth.id)} 
                                            disabled={authMode === 'all'}
                                            className="h-5 w-5 rounded border-gray-300 text-primary-600 disabled:bg-gray-200"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-200">{auth.internalTitle}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Campos Personalizados */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
                     <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-4">Bloque de campos personalizados</h4>
                     <div className="space-y-4 mb-4">
                         <div>
                             <label className={labelClasses}>Título bloque campos personalizados</label>
                             <input type="text" value={formData.customFieldsBlock.title} onChange={e => handleDeepChange('customFieldsBlock.title', e.target.value)} className={inputClasses} />
                         </div>
                         <div>
                             <label className={labelClasses}>Descripción bloque campos personalizados</label>
                             <RichTextEditor value={formData.customFieldsBlock.description} onChange={val => handleDeepChange('customFieldsBlock.description', val)} rows={3} />
                         </div>
                     </div>
                     
                     {!isNew && (
                         <div className="flex justify-end">
                            <Button variant="secondary" leftIcon={<List size={16}/>} onClick={() => navigate(`/center-management/landing-pages/${formData.id}/fields`)}>
                                Gestionar Campos Personalizados ({getFieldsCount(formData.id)})
                            </Button>
                         </div>
                     )}
                     {isNew && <p className="text-xs text-orange-500 italic text-right">Guarda la landing primero para añadir campos personalizados.</p>}
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Paso 3 - Selección curso">
                 <div className="mb-4">
                     <label className={labelClasses}>Título del paso 3 (Stepper)</label>
                     <input type="text" value={formData.stepConfig?.step3Title} onChange={e => handleDeepChange('stepConfig.step3Title', e.target.value)} className={inputClasses} />
                 </div>
                <div className="space-y-4 mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-md border border-slate-200 dark:border-slate-700">
                     <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-2">Bloque de selección de curso</h4>
                     <p className="text-xs text-gray-500 mb-2">En este paso se muestran los cursos disponibles para la inscripción, agrupados por nivel.</p>
                     <div>
                         <label className={labelClasses}>Título</label>
                         <input type="text" value={formData.courseSelectionBlockTitle} onChange={e => handleChange('courseSelectionBlockTitle', e.target.value)} className={inputClasses} />
                     </div>
                      <div>
                         <label className={labelClasses}>Descripción</label>
                         <RichTextEditor value={formData.courseSelectionBlockDescription || ''} onChange={val => handleChange('courseSelectionBlockDescription', val)} rows={2} />
                     </div>
                 </div>
                 
                 <CollapsibleSection title="Oferta de cursos" defaultOpen={true}>
                    <div className="mb-6 border-b border-gray-200 dark:border-slate-700 pb-6">
                         <div className="mb-4">
                             <label className={labelClasses}>¿Quién se puede inscribir?</label>
                             <select 
                                value={formData.studentAccessMode} 
                                onChange={e => handleChange('studentAccessMode', e.target.value)} 
                                className={inputClasses}
                             >
                                 <option value="all">Alumnos nuevos o existentes</option>
                                 <option value="new_only">Sólo alumnos nuevos</option>
                                 <option value="existing_only">Sólo alumnos existentes</option>
                             </select>
                         </div>
                         <div className="mb-4">
                             <label className={labelClasses}>¿A cuántos cursos se puede inscribir?</label>
                             <select value={formData.allowMultipleCourses ? 'multiple' : 'single'} onChange={e => handleChange('allowMultipleCourses', e.target.value === 'multiple')} className={inputClasses}>
                                 <option value="single">Solo a un curso</option>
                                 <option value="multiple">Se puede inscribir a múltiples cursos</option>
                             </select>
                        </div>
                        <Toggle label="¿Mostrar botón de volver a inscribirse?" checked={formData.allowReturnToEnroll} onChange={val => handleChange('allowReturnToEnroll', val)} />
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700 mb-6">
                        <div className="mb-4">
                            <label className={labelClasses}>Modo de selección de cursos</label>
                            <select 
                                value={formData.courseSelectionMode || 'courses'} 
                                onChange={e => handleChange('courseSelectionMode', e.target.value as LandingCourseSelectionMode)} 
                                className={inputClasses}
                            >
                                <option value="all">Todos los cursos</option>
                                <option value="groups">Selección por agrupación de nivel</option>
                                <option value="levels">Seleccionar por nivel</option>
                                <option value="courses">Seleccionar cursos</option>
                                <option value="location">Filtro por localización</option>
                            </select>
                        </div>

                        {formData.courseSelectionMode === 'all' && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded text-sm text-blue-800 dark:text-blue-300">
                                Se ofrecen todos los cursos activos marcados como "Inscripción online".
                            </div>
                        )}

                        {formData.courseSelectionMode === 'groups' && (
                            <div>
                                <label className={labelClasses}>Agrupaciones de nivel para ofrecer</label>
                                <SearchableMultiSelect 
                                    items={groupOptions}
                                    selectedIds={formData.selectedGroupIds || []}
                                    onChange={ids => handleChange('selectedGroupIds', ids)}
                                    placeholder="Buscar agrupaciones..."
                                />
                            </div>
                        )}

                        {formData.courseSelectionMode === 'levels' && (
                             <div>
                                <label className={labelClasses}>Niveles para ofrecer en la landing</label>
                                <SearchableMultiSelect 
                                    items={levelOptions}
                                    selectedIds={formData.selectedLevelIds || []}
                                    onChange={ids => handleChange('selectedLevelIds', ids)}
                                    placeholder="Buscar niveles..."
                                />
                            </div>
                        )}

                        {formData.courseSelectionMode === 'courses' && (
                             <div>
                                <label className={labelClasses}>Cursos para ofrecer en la landing</label>
                                <SearchableMultiSelect 
                                    items={courseOptions}
                                    selectedIds={formData.offeredCourseIds || []}
                                    onChange={ids => handleChange('offeredCourseIds', ids)}
                                    placeholder="Buscar cursos..."
                                />
                            </div>
                        )}

                        {formData.courseSelectionMode === 'location' && (
                             <div className="space-y-4">
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded text-sm text-green-800 dark:text-green-300 space-y-2">
                                    <p>Aparecerá un selector para el usuario de la landing preguntando en qué Centro quiere inscribirse.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Localizaciones vetadas (No aparecerán en el desplegable)</label>
                                    <SearchableMultiSelect 
                                        items={locationOptions}
                                        selectedIds={formData.bannedLocationIds || []}
                                        onChange={ids => handleChange('bannedLocationIds', ids)}
                                        placeholder="Buscar localizaciones para vetar..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
                        <h4 className="font-bold text-lg text-gray-800 dark:text-white mb-4">Información de cursos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                            <Toggle label="¿Ocultar número de plazas disponibles?" checked={!formData.showVacancies} onChange={val => handleChange('showVacancies', !val)} />
                            <Toggle label="¿Ocultar fechas inicio/fin?" checked={!formData.showDates} onChange={val => handleChange('showDates', !val)} />
                            <Toggle label="¿Ocultar precio material?" checked={!formData.showPrices} onChange={val => handleChange('showPrices', !val)} />
                            <Toggle label="¿Ocultar precio matrícula?" checked={!formData.showPrices} onChange={val => handleChange('showPrices', !val)} />
                            <Toggle label="¿Ocultar precio cuotas?" checked={!formData.showPrices} onChange={val => handleChange('showPrices', !val)} />
                            <Toggle label="¿Ocultar localización?" checked={!formData.showLocation} onChange={val => handleChange('showLocation', !val)} />
                            <Toggle label="¿Ocultar total de clases?" checked={!formData.showTotalClasses} onChange={val => handleChange('showTotalClasses', !val)} />
                            <Toggle label="¿Ocultar horario?" checked={!formData.showSchedule} onChange={val => handleChange('showSchedule', !val)} />
                        </div>
                    </div>
                </CollapsibleSection>
            </CollapsibleSection>

            <CollapsibleSection title="Paso 4 - Forma de cobro">
                 <div className="mb-4">
                     <label className={labelClasses}>Título del paso 4 (Stepper)</label>
                     <input type="text" value={formData.stepConfig?.step4Title} onChange={e => handleDeepChange('stepConfig.step4Title', e.target.value)} className={inputClasses} />
                 </div>
                 
                 <div className="space-y-4 mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-md border border-slate-200 dark:border-slate-700">
                     <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-2">Bloque de método de pago</h4>
                     <div>
                         <label className={labelClasses}>Título del bloque</label>
                         <input type="text" value={formData.paymentBlockTitle} onChange={e => handleChange('paymentBlockTitle', e.target.value)} className={inputClasses} />
                     </div>
                      <div>
                         <label className={labelClasses}>Descripción (opcional)</label>
                         <RichTextEditor value={formData.paymentBlockDescription || ''} onChange={val => handleChange('paymentBlockDescription', val)} rows={2} />
                     </div>
                 </div>

                 <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-3">Oferta de formas de pago</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                     <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-800">
                         <input type="checkbox" checked={formData.paymentMethods.cash} onChange={e => handleDeepChange('paymentMethods.cash', e.target.checked)} className="rounded text-primary-600"/> ¿Ofrecer opción pago en efectivo?
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-800">
                         <input type="checkbox" checked={formData.paymentMethods.transfer} onChange={e => handleDeepChange('paymentMethods.transfer', e.target.checked)} className="rounded text-primary-600"/> ¿Ofrecer opción pago por transferencia?
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-800">
                         <input type="checkbox" checked={formData.paymentMethods.domiciliation} onChange={e => handleDeepChange('paymentMethods.domiciliation', e.target.checked)} className="rounded text-primary-600"/> ¿Ofrecer opción pago por domiciliación?
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-800">
                         <input type="checkbox" checked={formData.paymentMethods.card} onChange={e => handleDeepChange('paymentMethods.card', e.target.checked)} className="rounded text-primary-600"/> ¿Ofrecer opción pago por tarjeta?
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-800">
                         <input type="checkbox" checked={formData.paymentMethods.bizum} onChange={e => handleDeepChange('paymentMethods.bizum', e.target.checked)} className="rounded text-primary-600"/> ¿Ofrecer opción pago por Bizum?
                     </label>
                 </div>
                 
                 <Toggle label="¿Pedir datos de facturación?" checked={formData.askBillingData} onChange={val => handleChange('askBillingData', val)} />
            </CollapsibleSection>

             <CollapsibleSection title="Texto de privacidad">
                 <div className="space-y-6">
                     <Toggle label="¿Usar valores de la academia?" checked={formData.privacyPolicy.useAcademyText} onChange={val => handleDeepChange('privacyPolicy.useAcademyText', val)} />
                     <div>
                         <label className={labelClasses}>Título modal privacidad</label>
                         <input type="text" value={formData.privacyPolicy.customTitle} onChange={e => handleDeepChange('privacyPolicy.customTitle', e.target.value)} className={inputClasses} />
                     </div>
                     <div>
                         <label className={labelClasses}>Texto política privacidad</label>
                         <RichTextEditor value={formData.privacyPolicy.customText} onChange={val => handleDeepChange('privacyPolicy.customText', val)} rows={4} />
                     </div>
                     <div>
                         <label className={labelClasses}>Texto legal privacidad bajo checkbox</label>
                         <RichTextEditor value={formData.privacyPolicy.checkboxText} onChange={val => handleDeepChange('privacyPolicy.checkboxText', val)} rows={2} />
                     </div>
                 </div>
            </CollapsibleSection>
            
             <CollapsibleSection title="Texto de soporte">
                 <div className="space-y-6">
                     <div>
                         <label className={labelClasses}>Título modal Soporte</label>
                         <input type="text" value={formData.supportText.modalTitle} onChange={e => handleDeepChange('supportText.modalTitle', e.target.value)} className={inputClasses} />
                     </div>
                     <div>
                         <label className={labelClasses}>Texto soporte</label>
                         <RichTextEditor value={formData.supportText.content} onChange={val => handleDeepChange('supportText.content', val)} rows={4} />
                     </div>
                 </div>
            </CollapsibleSection>

             <CollapsibleSection title="Email de notificación">
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Configura el contenido del e-mail que recibirá el alumno/a cuando formalice la inscripción.</p>
                 <div className="space-y-6">
                     <div>
                         <label className={labelClasses}>E-mails para notificación de nueva inscripción (Copia oculta)</label>
                         <input type="text" value={formData.notifications.notifyEmail} onChange={e => handleDeepChange('notifications.notifyEmail', e.target.value)} className={inputClasses} />
                     </div>
                     <div>
                         <label className={labelClasses}>Asunto e-mail de confirmación alumno</label>
                         <input type="text" value={formData.notifications.confirmationSubject} onChange={e => handleDeepChange('notifications.confirmationSubject', e.target.value)} className={inputClasses} />
                     </div>
                      <div>
                         <label className={labelClasses}>Texto e-mail confirmación alumno</label>
                         <RichTextEditor value={formData.notifications.confirmationBody} onChange={val => handleDeepChange('notifications.confirmationBody', val)} rows={6} />
                     </div>
                     <div className="pt-6 border-t dark:border-slate-700">
                         <label className={labelClasses}>Asunto del e-mail para los alumnos ya existentes</label>
                         <input type="text" value={formData.notifications.existingStudentSubject} onChange={e => handleDeepChange('notifications.existingStudentSubject', e.target.value)} className={inputClasses} />
                     </div>
                      <div>
                         <label className={labelClasses}>Texto e-mail confirmación alumno ya existente</label>
                         <RichTextEditor value={formData.notifications.existingStudentBody} onChange={val => handleDeepChange('notifications.existingStudentBody', val)} rows={6} />
                     </div>
                 </div>
            </CollapsibleSection>

             <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-4 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <Button variant="danger" onClick={() => navigate(-1)} leftIcon={<MoveLeft size={16}/>}>Cancelar</Button>
                    <Button onClick={handleSave} leftIcon={<Save size={16}/>}>Actualizar Landing</Button>
                </div>
            </div>

            <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} title="Vista Previa del Email">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-md border border-gray-200 dark:border-slate-700">
                    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Asunto:</p>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">{previewContent?.subject}</h3>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Cuerpo:</p>
                        <div className="prose prose-sm max-w-none dark:prose-invert p-4 bg-gray-50 dark:bg-slate-900 rounded-md" dangerouslySetInnerHTML={{__html: previewContent?.body || ''}} />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <Button onClick={() => setIsPreviewModalOpen(false)}>Cerrar</Button>
                </div>
            </Modal>
        </div>
    );
};

export default LandingPageEditor;
