import React, { useState, useEffect, useRef } from 'react';
import { Teacher } from '../../types';
import { useData } from '../../contexts/DataContext';
import Button from '../ui/Button';
import { HelpCircle, Camera } from 'lucide-react';

interface TeacherFormProps {
    teacher: Teacher | null;
    onSave: (teacher: Teacher) => void;
    onClose: () => void;
}

const initialTeacherState: Omit<Teacher, 'id'> = {
    name: '',
    lastName: '',
    email: '',
    photoUrl: '',
    isActive: true,
    platformLanguage: 'Español',
    permissions: {
        canSendEmails: false,
        canSendReports: false,
        canEditStudentAreaComments: false,
        canCreateManualClasses: false,
        canManageCourseDocs: false,
        canViewStudentList: false,
    },
    contract: {
        hours: 0,
        isFreelance: false,
    }
};

const FormSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">
            {title}
        </h3>
        <div className="p-6 space-y-4">{children}</div>
    </div>
);

const FormRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 ${className}`}>{children}</div>
);

const FormField: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
    <div className={className}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {children}
    </div>
);

const RadioGroup: React.FC<{ name: string; options: { label: string, value: string }[], value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ name, options, value, onChange }) => (
    <div className="flex items-center gap-4 pt-1">
        {options.map(option => (
            <label key={option.value} className="flex items-center text-sm">
                <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={onChange} className="h-4 w-4 rounded-full border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" />
                <span className="ml-2">{option.label}</span>
            </label>
        ))}
    </div>
);

const BaseInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 focus:ring-primary-500 focus:border-primary-500" />
);

const TeacherForm: React.FC<TeacherFormProps> = ({ teacher, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<Teacher, 'id'>>(teacher || initialTeacherState);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if(teacher) {
            setFormData(teacher);
        } else {
            setFormData(initialTeacherState);
        }
    }, [teacher]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        const keys = name.split('.');
        if (keys.length > 1) { // Nested property
            setFormData(prev => {
                const newState = JSON.parse(JSON.stringify(prev));
                let current: any = newState;
                for (let i = 0; i < keys.length - 1; i++) {
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = type === 'checkbox' ? checked : (type === 'radio' ? value === 'true' : value);
                return newState;
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (type === 'radio' ? value === 'true' : value) }));
        }
    };
    
     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'photoUrl' | 'contract.signatureFile') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                 if (fieldName === 'photoUrl') {
                    setFormData(prev => ({ ...prev, photoUrl: base64String }));
                } else {
                     setFormData(prev => ({ ...prev, contract: {...prev.contract, signatureFile: base64String } }));
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { ...teacherData } = formData as any;
        const teacherToSave: Teacher = {
            id: teacher?.id || 0,
            ...teacherData,
        };
        onSave(teacherToSave);
    };

    const initials = `${formData.name[0] || ''}${formData.lastName[0] || ''}`.toUpperCase();
    const avatarColor = `#${(Math.abs(formData.name.charCodeAt(0) * formData.lastName.charCodeAt(0) || 1) % 16777215).toString(16).padStart(6, '0')}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection title="Actualizar - Profesores">
                 <FormRow>
                    <FormField label="Nombre"><BaseInput name="name" value={formData.name} onChange={handleChange} /></FormField>
                    <FormField label="Apellidos"><BaseInput name="lastName" value={formData.lastName} onChange={handleChange} /></FormField>
                    <FormField label="NIF"><BaseInput name="nif" value={formData.nif || ''} onChange={handleChange} /></FormField>
                </FormRow>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Foto</label>
                        <div className="flex items-center gap-4">
                             <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-2xl" style={{backgroundColor: avatarColor}}>
                                {initials}
                            </div>
                            <div className="flex flex-col gap-2">
                                <input type="file" ref={photoInputRef} onChange={(e) => handleFileChange(e, 'photoUrl')} accept=".jpg,.jpeg,.png" className="hidden"/>
                                <div>
                                    <Button type="button" size="sm" variant="secondary" onClick={() => photoInputRef.current?.click()}>Seleccionar archivo</Button>
                                    <Button type="button" size="sm" variant="ghost" className="text-red-500" onClick={() => setFormData(prev => ({...prev, photoUrl: ''}))}>Borrar fichero</Button>
                                </div>
                                <Button type="button" size="sm" variant="secondary" leftIcon={<Camera size={14} />}>Toma una foto</Button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Tamaño máximo: 800 KB<br/>Tipos de archivo aceptados: .jpg, .png, .jpeg</p>
                    </div>
                    <FormField label="Fecha de nacimiento"><BaseInput type="date" name="birthDate" value={formData.birthDate || ''} onChange={handleChange} /></FormField>
                </div>
            </FormSection>

            <FormSection title="Configuración de acceso">
                <FormRow>
                    <FormField label="Email profesor"><BaseInput type="email" name="email" value={formData.email} onChange={handleChange} /></FormField>
                    <FormField label="Contraseña"><div className="flex items-center gap-2"><BaseInput type="password" value="********" readOnly /><Button type="button" size="sm" variant="secondary">cambiarla</Button></div></FormField>
                </FormRow>
                 <FormRow>
                    <FormField label="¿Activo?"><RadioGroup name="isActive" value={String(formData.isActive)} onChange={handleChange} options={[{label: 'Sí', value: 'true'}, {label: 'No', value: 'false'}]} /></FormField>
                    <FormField label="Idioma plataforma"><select name="platformLanguage" value={formData.platformLanguage} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"><option>Español</option></select></FormField>
                </FormRow>
            </FormSection>

            <FormSection title="Contacto">
                <FormRow>
                    <FormField label="Teléfono de contacto"><BaseInput name="phone" value={formData.phone || ''} onChange={handleChange} /></FormField>
                </FormRow>
                <FormRow>
                    <FormField label="Dirección" className="md:col-span-3"><textarea name="address" value={formData.address || ''} onChange={handleChange} rows={3} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" /></FormField>
                </FormRow>
                <FormRow>
                    <FormField label="CP"><BaseInput name="postalCode" value={formData.postalCode || ''} onChange={handleChange} /></FormField>
                    <FormField label="Población"><BaseInput name="population" value={formData.population || ''} onChange={handleChange} /></FormField>
                </FormRow>
            </FormSection>

            <FormSection title="Permisos del profesor/a">
                <div className="space-y-3">
                    <div className="flex justify-between items-center"><p>¿Puede enviar e-mails a los alumnos?</p><RadioGroup name="permissions.canSendEmails" value={String(formData.permissions.canSendEmails)} onChange={handleChange} options={[{label: 'Sí', value: 'true'}, {label: 'No', value: 'false'}]} /></div>
                    <div className="flex justify-between items-center"><p>¿Puede enviar informes a los alumnos?</p><RadioGroup name="permissions.canSendReports" value={String(formData.permissions.canSendReports)} onChange={handleChange} options={[{label: 'Sí', value: 'true'}, {label: 'No', value: 'false'}]} /></div>
                    <div className="flex justify-between items-center"><p>¿Puede editar el comentario de área de alumnos de un día de clase?</p><RadioGroup name="permissions.canEditStudentAreaComments" value={String(formData.permissions.canEditStudentAreaComments)} onChange={handleChange} options={[{label: 'Sí', value: 'true'}, {label: 'No', value: 'false'}]} /></div>
                    <div className="flex justify-between items-center"><p>¿Puede dar de alta días de clase manuales?</p><RadioGroup name="permissions.canCreateManualClasses" value={String(formData.permissions.canCreateManualClasses)} onChange={handleChange} options={[{label: 'Sí', value: 'true'}, {label: 'No', value: 'false'}]} /></div>
                    <div className="flex justify-between items-center"><p>¿Puede gestionar los documentos de curso?</p><RadioGroup name="permissions.canManageCourseDocs" value={String(formData.permissions.canManageCourseDocs)} onChange={handleChange} options={[{label: 'Sí', value: 'true'}, {label: 'No', value: 'false'}]} /></div>
                    <div className="flex justify-between items-center"><p>¿Puede consultar la lista de sus alumnos?</p><RadioGroup name="permissions.canViewStudentList" value={String(formData.permissions.canViewStudentList)} onChange={handleChange} options={[{label: 'Sí', value: 'true'}, {label: 'No', value: 'false'}]} /></div>
                </div>
            </FormSection>

            <FormSection title="Contrato">
                <FormRow>
                    <FormField label="Horas según contrato"><BaseInput type="number" name="contract.hours" value={formData.contract.hours} onChange={handleChange} /></FormField>
                    <FormField label="¿Es autónomo/a?"><RadioGroup name="contract.isFreelance" value={String(formData.contract.isFreelance)} onChange={handleChange} options={[{label: 'Sí', value: 'true'}, {label: 'No', value: 'false'}]} /></FormField>
                </FormRow>
                <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Archivo de firma</label>
                    <div className="flex items-center gap-2">
                        <input type="file" ref={signatureInputRef} onChange={(e) => handleFileChange(e, 'contract.signatureFile')} accept=".jpg,.jpeg,.png" className="hidden"/>
                        <Button type="button" size="sm" variant="secondary" onClick={() => signatureInputRef.current?.click()}>Seleccionar archivo</Button>
                        <Button type="button" size="sm" variant="secondary">Generar firma</Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Tamaño máximo: 800 KB<br/>Tipos de archivo aceptados: .jpg, .png, .jpeg</p>
                </div>
                 <FormRow>
                    <FormField label="Num. Seguridad Social"><BaseInput name="contract.socialSecurityNumber" value={formData.contract.socialSecurityNumber || ''} onChange={handleChange} /></FormField>
                </FormRow>
                 <FormRow>
                    <FormField label="Fecha inicio contrato"><BaseInput type="date" name="contract.startDate" value={formData.contract.startDate || ''} onChange={handleChange} /></FormField>
                    <FormField label="Fecha finalización contrato"><BaseInput type="date" name="contract.endDate" value={formData.contract.endDate || ''} onChange={handleChange} /></FormField>
                </FormRow>
                 <FormRow>
                    <FormField label="IBAN"><BaseInput name="contract.iban" value={formData.contract.iban || ''} onChange={handleChange} /></FormField>
                </FormRow>
            </FormSection>

            <FormSection title="Comentarios/observaciones">
                <textarea name="observations" value={formData.observations || ''} onChange={handleChange} rows={4} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
            </FormSection>

            <div className="flex justify-end gap-4 p-4 bg-gray-100 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg sticky bottom-0">
                <Button type="button" variant="danger" onClick={onClose}>Cancelar</Button>
                <Button type="submit">Actualizar</Button>
            </div>
        </form>
    );
}

export default TeacherForm;
