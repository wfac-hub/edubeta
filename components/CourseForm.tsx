
import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { useData } from '../contexts/DataContext';
import { HelpCircle } from 'lucide-react';
import Button from './ui/Button';

interface CourseFormProps {
    course: Course | null;
    onSave: (course: Course) => void;
    onClose: () => void;
}

const FormSection: React.FC<{ title?: string; children: React.ReactNode; description?: string }> = ({ title, description, children }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
        {title && <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">{title}</h3>}
        {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>}
        {children}
    </div>
);

const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
);

const FormField: React.FC<{ label: string; tooltip?: string; children: React.ReactNode; error?: string }> = ({ label, tooltip, children, error }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
            {tooltip && (
                <span title={tooltip} className="inline-flex">
                    <HelpCircle size={14} className="ml-1 text-gray-400 cursor-help" />
                </span>
            )}
        </label>
        {children}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);


const RadioGroup: React.FC<{ name: string; options: {label: string, value: string}[]; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ name, options, value, onChange }) => (
    <div className="flex flex-wrap items-center gap-4 pt-1">
        {options.map(option => (
             <label key={option.value} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={onChange} className="h-4 w-4 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500"/>
                <span className="ml-2">{option.label}</span>
            </label>
        ))}
    </div>
);

const CourseForm: React.FC<CourseFormProps> = ({ course, onSave, onClose }) => {
    
    const { teachers, classrooms, courses: allCourses, levelGroups, courseLevels, academyProfile } = useData();

    const getInitialState = (): Course => ({
        id: 0,
        name: '',
        alternativeName: '',
        description: '',
        level: courseLevels.length > 0 ? courseLevels[0].name : '',
        duration: '',
        teacherId: teachers.length > 0 ? teachers[0].id : 0,
        secondaryTeacherId: undefined,
        modality: 'Presencial',
        scheduleIds: [],
        classroomId: classrooms.length > 0 ? classrooms[0].id : 0,
        minCapacity: 0,
        maxCapacity: academyProfile.defaultSeatsInCourses || 16,
        status: 'Activo',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        observations: '',
        onlineAllowed: false,
        onlineLimit: 0,
        allowWaitingList: false, // Default to false
        paymentRequired: false,
        renewalCourseId: undefined,
        receiptGeneration: 'Cuotas automáticas por curso',
        classesCount: 0, 
        resourcesCount: 0,
        isActive: true,
        standbyStudents: 0,
        alternativePrice: {
            active: false,
            monthly: { active: true, price: 0 },
            quarterly: { active: false, price: 0 },
            single: { active: false, price: 0 },
            materialPrice: 0,
            enrollmentPrice: 0
        }
    });
    
    // Initialize state by merging props with defaults immediately
    const [formData, setFormData] = useState<Course>(() => {
        const defaultState = getInitialState();
        if (course) {
            return {
                ...defaultState,
                ...course,
                alternativePrice: {
                    ...defaultState.alternativePrice,
                    ...(course.alternativePrice || {})
                }
            };
        }
        return defaultState;
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Update state if the 'course' prop changes externally (e.g. re-selection), though mostly handled by key change in parent
    useEffect(() => {
        if (course) {
             // Ensure alternativePrice structure exists if loading an old course record
            const mergedCourse = { 
                ...getInitialState(), 
                ...course,
                alternativePrice: {
                    ...getInitialState().alternativePrice,
                    ...(course.alternativePrice || {})
                }
            };
            setFormData(mergedCourse);
            validate(mergedCourse);
        } 
        // We don't reset to initial state if course becomes null to avoid wiping data during close animation
    }, [course, academyProfile]);

    const validate = (data: Course) => {
        const newErrors: { [key: string]: string } = {};

        if (!data.name.trim()) {
            newErrors.name = 'El nombre del curso es obligatorio.';
        }
        if (data.endDate && data.startDate && new Date(data.endDate) < new Date(data.startDate)) {
            newErrors.endDate = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
        } else {
             newErrors.endDate = '';
        }
        
        if (data.teacherId && data.secondaryTeacherId && data.teacherId === data.secondaryTeacherId) {
            newErrors.secondaryTeacherId = 'El profesor secundario no puede ser el mismo que el principal.';
        } else {
            newErrors.secondaryTeacherId = '';
        }

        // Validate alternative price if active
        if (data.alternativePrice?.active) {
             if (!data.alternativePrice.monthly.active && !data.alternativePrice.quarterly.active && !data.alternativePrice.single.active) {
                 // Ideally warn user, but not strict blocking error for now
             }
        }

        setErrors(prev => ({...prev, ...newErrors}));
        return !Object.values(newErrors).some(e => e);
    };
    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
    
        setFormData(prevData => {
            let processedValue: any = value;
    
            if (type === 'checkbox') {
                processedValue = (e.target as HTMLInputElement).checked;
            } else if (type === 'radio' && (value === 'true' || value === 'false')) {
                processedValue = (value === 'true');
            } else if (['teacherId', 'secondaryTeacherId', 'classroomId', 'maxCapacity', 'minCapacity', 'onlineLimit', 'renewalCourseId'].includes(name)) {
                processedValue = value === '' ? undefined : parseInt(value, 10);
            }
    
            const updatedData = { ...prevData, [name]: processedValue };
            
            if (name === 'isActive') {
                updatedData.status = processedValue ? 'Activo' : 'Archivado';
            }

            validate(updatedData);
            return updatedData;
        });
    };

    const handleAlternativePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            // Fallback to initial structure if somehow undefined during editing
            const altPrice = { ...(prev.alternativePrice || getInitialState().alternativePrice!) };

            if (name === 'alt_active') {
                altPrice.active = checked;
            } else if (name === 'alt_monthly_active') {
                altPrice.monthly = { ...altPrice.monthly, active: checked };
            } else if (name === 'alt_monthly_price') {
                altPrice.monthly = { ...altPrice.monthly, price: parseFloat(value) || 0 };
            } else if (name === 'alt_quarterly_active') {
                altPrice.quarterly = { ...altPrice.quarterly, active: checked };
            } else if (name === 'alt_quarterly_price') {
                altPrice.quarterly = { ...altPrice.quarterly, price: parseFloat(value) || 0 };
            } else if (name === 'alt_single_active') {
                altPrice.single = { ...altPrice.single, active: checked };
            } else if (name === 'alt_single_price') {
                altPrice.single = { ...altPrice.single, price: parseFloat(value) || 0 };
            } else if (name === 'alt_material') {
                altPrice.materialPrice = parseFloat(value) || 0;
            } else if (name === 'alt_enrollment') {
                altPrice.enrollmentPrice = parseFloat(value) || 0;
            }
            
            return { ...prev, alternativePrice: altPrice };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate(formData)) {
            onSave(formData);
        }
    };

    const primaryTeachers = teachers.filter(t => t.id !== formData.secondaryTeacherId);
    const secondaryTeachers = teachers.filter(t => t.id !== formData.teacherId);

    const isFormInvalid = Object.values(errors).some(error => error);
    
    // Safe access to alternativePrice
    const altPrice = formData.alternativePrice || getInitialState().alternativePrice!;

    return (
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
                <FormRow>
                    <FormField label="¿Activo?">
                        <RadioGroup 
                            name="isActive" 
                            options={[{label: 'Sí', value: 'true'}, {label: 'No', value: 'false'}]} 
                            value={String(formData.isActive)}
                            onChange={handleChange}
                        />
                    </FormField>
                </FormRow>
                <FormField label="Nombre del curso" error={errors.name}>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className={`w-full p-2 border rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}/>
                </FormField>
                <FormField label="Nivel curso">
                    <select name="level" value={formData.level} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        {levelGroups.map(group => (
                            <optgroup label={`${group.emoji} ${group.name}`} key={group.id}>
                                {courseLevels.filter(l => l.groupId === group.id).map(level => (
                                    <option key={level.id} value={level.name}>{level.name}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </FormField>
                <FormRow>
                    <FormField label="Profesor/a">
                        <select name="teacherId" value={formData.teacherId} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                           {primaryTeachers.map(t => <option key={t.id} value={t.id}>{t.name} {t.lastName}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Segundo/a profesor/a" error={errors.secondaryTeacherId}>
                         <select name="secondaryTeacherId" value={formData.secondaryTeacherId || ''} onChange={handleChange} className={`w-full p-2 border rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 ${errors.secondaryTeacherId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                            <option value="">-- Sin asignar --</option>
                           {secondaryTeachers.map(t => <option key={t.id} value={t.id}>{t.name} {t.lastName}</option>)}
                        </select>
                    </FormField>
                </FormRow>
                <FormRow>
                    <FormField label="Fecha inicio curso*" error={errors.startDate}>
                        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className={`w-full p-2 border rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 ${errors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}/>
                    </FormField>
                    <FormField label="Fecha fin curso*" error={errors.endDate}>
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className={`w-full p-2 border rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 ${errors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}/>
                    </FormField>
                </FormRow>
                <FormField label="Observaciones del curso" tooltip="Observaciones internas del curso. No se muestran al alumno.">
                    <textarea name="observations" value={formData.observations || ''} onChange={handleChange} rows={3} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300"></textarea>
                </FormField>
            </div>
            
            <FormSection title="Modalidad">
                <FormRow>
                     <FormField label="Modalidad">
                        <RadioGroup 
                            name="modality" 
                            options={[{label: 'Presencial', value: 'Presencial'}, {label: 'Online', value: 'Online'}, {label: 'Híbrido', value: 'Híbrido'}]}
                            value={formData.modality}
                            onChange={handleChange}
                        />
                    </FormField>
                    <FormField label="Aula">
                        <select name="classroomId" value={formData.classroomId} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                            {classrooms.map(c => <option key={c.id} value={c.id}>{c.location} - {c.name}</option>)}
                        </select>
                    </FormField>
                </FormRow>
            </FormSection>

            <FormSection title="Número de plazas" description="Indica el número de plazas para este curso. Se trata de un límite informativo ya que siempre se permitirá inscribir a más alumnos.">
                <FormField label="Número de plazas" tooltip="Número de plazas disponibles">
                    <input type="number" name="maxCapacity" value={formData.maxCapacity} onChange={handleChange} className="w-full md:w-1/4 p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300"/>
                </FormField>
            </FormSection>

            <FormSection title="Inscripción on-line" description="Si activas la inscripción online, este curso aparecerá automáticamente disponible para la inscripción. Puedes configurar el límite de inscripciones para aceptar en online, aunque puedes dejarlo a 0 para utilizar el Número de plazas del curso (indicado arriba). Para los cursos pasados, puedes indicar el curso de renovación que podrás enviar por email directamente a los alumnos inscritos.">
                <FormRow>
                    <FormField label="¿Permite inscripción on-line? (Obligatorio para landings)">
                        <RadioGroup
                            name="onlineAllowed"
                            options={[{label: 'Sí', value: 'true'}, {label: 'No', value: 'false'}]}
                            value={String(formData.onlineAllowed)}
                            onChange={handleChange}
                        />
                    </FormField>
                    <FormField label="Límite de plazas para online" tooltip="Límite de plazas para inscripción online.">
                        <input type="number" name="onlineLimit" value={formData.onlineLimit || 0} onChange={handleChange} className="w-full md:w-1/4 p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300"/>
                    </FormField>
                </FormRow>
                <FormRow>
                    <FormField label="¿Permitir lista de espera?" tooltip="Si se activa, los alumnos podrán inscribirse en lista de espera cuando se agoten las plazas.">
                        <RadioGroup
                            name="allowWaitingList"
                            options={[{label: 'Sí', value: 'true'}, {label: 'No', value: 'false'}]}
                            value={String(formData.allowWaitingList)}
                            onChange={handleChange}
                        />
                    </FormField>
                </FormRow>
                 <FormRow>
                    <FormField label="¿Hay que pagar para inscribirse?" tooltip="¿Es necesario un pago para completar la inscripción?">
                        <RadioGroup
                            name="paymentRequired"
                            options={[{label: 'Sí', value: 'true'}, {label: 'No', value: 'false'}]}
                            value={String(formData.paymentRequired)}
                            onChange={handleChange}
                        />
                    </FormField>
                     <FormField label="Siguiente curso para renovación" tooltip="Curso al que se podrán renovar los alumnos.">
                        <select name="renewalCourseId" value={formData.renewalCourseId || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                            <option value="">-- Seleccionar curso --</option>
                             {allCourses.filter(c => c.id !== course?.id).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </FormField>
                </FormRow>
            </FormSection>
            
             <FormSection title="Precios Alternativos" description="Configura precios específicos para este curso que sobrescriban los precios generales del nivel. Útil para cursos con costes especiales.">
                 <div className="mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <label className="flex items-center gap-2 font-medium text-gray-800 dark:text-white cursor-pointer">
                        <input type="checkbox" name="alt_active" checked={altPrice.active} onChange={handleAlternativePriceChange} className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                        ¿Activar precio alternativo?
                    </label>
                 </div>
                 
                 {altPrice.active && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                             <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                                    <input type="checkbox" name="alt_monthly_active" checked={altPrice.monthly.active} onChange={handleAlternativePriceChange} className="h-4 w-4 rounded text-primary-600"/>
                                    Pago mensual
                                </label>
                                <div className="relative">
                                    <input type="number" name="alt_monthly_price" value={altPrice.monthly.price} onChange={handleAlternativePriceChange} disabled={!altPrice.monthly.active} className="w-full p-2 pr-8 border rounded bg-white dark:bg-slate-800 disabled:bg-gray-100 dark:disabled:bg-gray-700"/>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                                </div>
                             </div>

                              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                                    <input type="checkbox" name="alt_quarterly_active" checked={altPrice.quarterly.active} onChange={handleAlternativePriceChange} className="h-4 w-4 rounded text-primary-600"/>
                                    Pago trimestral
                                </label>
                                <div className="relative">
                                    <input type="number" name="alt_quarterly_price" value={altPrice.quarterly.price} onChange={handleAlternativePriceChange} disabled={!altPrice.quarterly.active} className="w-full p-2 pr-8 border rounded bg-white dark:bg-slate-800 disabled:bg-gray-100 dark:disabled:bg-gray-700"/>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                                </div>
                             </div>
                             
                              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                                    <input type="checkbox" name="alt_single_active" checked={altPrice.single.active} onChange={handleAlternativePriceChange} className="h-4 w-4 rounded text-primary-600"/>
                                    Pago único
                                </label>
                                <div className="relative">
                                    <input type="number" name="alt_single_price" value={altPrice.single.price} onChange={handleAlternativePriceChange} disabled={!altPrice.single.active} className="w-full p-2 pr-8 border rounded bg-white dark:bg-slate-800 disabled:bg-gray-100 dark:disabled:bg-gray-700"/>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                                </div>
                             </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <FormField label="Material">
                                <div className="relative">
                                    <input type="number" name="alt_material" value={altPrice.materialPrice} onChange={handleAlternativePriceChange} className="w-full p-2 pr-8 border rounded bg-white dark:bg-slate-800"/>
                                     <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                                </div>
                            </FormField>
                            <FormField label="Matrícula">
                                <div className="relative">
                                    <input type="number" name="alt_enrollment" value={altPrice.enrollmentPrice} onChange={handleAlternativePriceChange} className="w-full p-2 pr-8 border rounded bg-white dark:bg-slate-800"/>
                                     <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                                </div>
                            </FormField>
                        </div>
                    </div>
                 )}
            </FormSection>
            
            <FormSection title="Recibos y facturación">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    <strong>Cuotas automáticas por curso:</strong> Generación automática de recibos según la configuración de periodicidad del alumno y los precios del nivel.<br/>
                    <strong>Por sesión:</strong> Generación manual de los recibos según clases del curso ya realizadas, por el precio configurado, independientemente de la asistencia.<br/>
                    <strong>Por asistencia:</strong> Generación manual de los recibos según las clases a las que ha asistido el alumno y su precio configurado.<br/>
                    <strong>Facturación agrupada:</strong> Generación manual de la factura a un cliente según las clases del curso programadas, por el precio configurado.
                </p>
                <FormField label="Modalidad generación de recibos">
                    <select name="receiptGeneration" value={formData.receiptGeneration || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        <option>Cuotas automáticas por curso</option>
                        <option>Por sesión</option>
                        <option>Por asistencia</option>
                        <option>Facturación agrupada</option>
                    </select>
                </FormField>
            </FormSection>

            <div className="flex justify-end gap-4 p-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg sticky bottom-0">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={isFormInvalid}>{course ? 'Actualizar' : 'Crear'}</Button>
            </div>
        </form>
    );
}

export default CourseForm;
