import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';
import { Authorization } from '../types';
import Button from '../components/ui/Button';
import RichTextEditor from '../components/ui/RichTextEditor';

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-md border border-gray-200 dark:border-slate-700">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {children}
    </div>
);

const RadioGroup: React.FC<{ name: string; value: any; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; options: { label: string, value: any }[] }> = ({ name, value, onChange, options }) => (
    <div className="flex items-center gap-4 pt-1">
        {options.map(opt => (
            <label key={opt.value} className="flex items-center text-sm gap-2">
                <input type="radio" name={name} value={opt.value} checked={value === opt.value} onChange={onChange} className="h-4 w-4 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" />
                {opt.label}
            </label>
        ))}
    </div>
);

const AuthorizationEditPage = () => {
    const { authId, groupId } = useParams();
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const { authorizations, authGroups, updateAuthorization, academyProfile } = useData();

    const isNew = !authId;

    const getInitialState = (): Omit<Authorization, 'id'> => ({
        groupId: parseInt(groupId || '0'),
        internalTitle: '',
        targetAudience: 'all',
        differentiateText: false,
        documentText: '',
        showInEnrollment: true,
        enrollmentShortDescription: '',
        showInStudentArea: false,
        order: 10,
        isImageRightsAuth: false,
        isCommunicationsAuth: false,
    });

    const [formData, setFormData] = useState<Omit<Authorization, 'id'>>(getInitialState());

    useEffect(() => {
        if (!isNew) {
            const auth = authorizations.find(a => a.id === parseInt(authId));
            if (auth) {
                setFormData(auth);
            }
        }
    }, [authId, authorizations, isNew]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (type === 'radio') {
            if (['differentiateText', 'showInEnrollment', 'showInStudentArea'].includes(name)) {
                setFormData(prev => ({...prev, [name]: value === 'true'}));
            } else {
                 setFormData(prev => ({...prev, [name]: value}));
            }
        } else if (type === 'checkbox') {
             setFormData(prev => ({...prev, [name]: checked}));
        }
         else {
            const numValue = ['groupId', 'order'].includes(name) ? parseInt(value) : value;
            setFormData(prev => ({ ...prev, [name]: numValue }));
        }
    };
    
    const handleRichTextChange = (field: 'documentText' | 'documentTextMinors' | 'enrollmentShortDescription', content: string) => {
        setFormData(prev => ({...prev, [field]: content}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave: Authorization = {
            id: isNew ? 0 : parseInt(authId!),
            ...formData,
        };
        updateAuthorization(dataToSave);
        goBack();
    };

    const pageTitle = isNew ? 'Alta - Autorizaciones' : `Actualizar - ${formData.internalTitle}`;

    const PlaceholderHelp = () => (
         <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 space-y-1">
            <p>Puedes usar las siguientes variables que se reemplazarán automáticamente:</p>
            <div className="grid grid-cols-2 gap-x-4">
                <div><code className="bg-gray-200 dark:bg-slate-700 p-0.5 rounded">{'#{ACADEMY_NAME}#'}</code>: {academyProfile.publicName}</div>
                <div><code className="bg-gray-200 dark:bg-slate-700 p-0.5 rounded">{'#{ACADEMY_EMAIL}#'}</code>: {academyProfile.contactEmail}</div>
                <div><code className="bg-gray-200 dark:bg-slate-700 p-0.5 rounded">{'#{ACADEMY_SEPA_CREDITOR_NAME}#'}</code>: {academyProfile.sepaCreditorName}</div>
                <div><code className="bg-gray-200 dark:bg-slate-700 p-0.5 rounded">{'#{ACADEMY_ADDRESS}#'}</code>: {`${academyProfile.address}, ...`}</div>
                <div><code className="bg-gray-200 dark:bg-slate-700 p-0.5 rounded">{'#{ACADEMY_NIF}#'}</code>: {academyProfile.nif}</div>
            </div>
             <p className="mt-1">Y variables del alumno como: <code className="bg-gray-200 dark:bg-slate-700 p-0.5 rounded">{'#{STUDENT_FULL_NAME}#'}</code>, <code className="bg-gray-200 dark:bg-slate-700 p-0.5 rounded">{'#{TUTOR_1_FULL_NAME}#'}</code>, <code className="bg-gray-200 dark:bg-slate-700 p-0.5 rounded">{'#{TUTOR_1_NIF}#'}</code>, etc.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{pageTitle}</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-6">
                    <FormField label="Grupo">
                        <select name="groupId" value={formData.groupId} onChange={handleChange} className="w-full p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700">
                            {authGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Título interno">
                        <input name="internalTitle" value={formData.internalTitle} onChange={handleChange} className="w-full p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"/>
                    </FormField>

                    <FormSection title="Textos">
                        <FormField label="¿A quién va dirigida la autorización?">
                            <RadioGroup name="targetAudience" value={formData.targetAudience} onChange={handleChange} options={[{label: 'Todos', value: 'all'}, {label: 'Mayores de edad', value: 'adults'}, {label: 'Menores de edad', value: 'minors'}]} />
                        </FormField>
                        <FormField label="¿Diferenciar texto mayores/menores?">
                            <RadioGroup name="differentiateText" value={String(formData.differentiateText)} onChange={handleChange} options={[{label: 'Sí', value: 'true'}, {label: 'No', value: 'false'}]} />
                        </FormField>
                        <FormField label="Texto para los documentos">
                            <PlaceholderHelp />
                            <RichTextEditor value={formData.documentText} onChange={content => handleRichTextChange('documentText', content)} />
                        </FormField>
                        {formData.differentiateText && (
                             <FormField label="Texto para los documentos (menores)">
                                <PlaceholderHelp />
                                <RichTextEditor value={formData.documentTextMinors || ''} onChange={content => handleRichTextChange('documentTextMinors', content)} />
                            </FormField>
                        )}
                    </FormSection>

                    <FormSection title="Inscripción">
                        <FormField label="¿Aparece en el proceso de inscripción?">
                             <RadioGroup name="showInEnrollment" value={String(formData.showInEnrollment)} onChange={handleChange} options={[{label: 'Sí', value: 'true'}, {label: 'No', value: 'false'}]} />
                        </FormField>
                        {formData.showInEnrollment && (
                            <FormField label="Descripción corta para la inscripción">
                                <PlaceholderHelp />
                                <RichTextEditor value={formData.enrollmentShortDescription} onChange={content => handleRichTextChange('enrollmentShortDescription', content)} />
                            </FormField>
                        )}
                    </FormSection>
                    
                     <FormSection title="Área de alumnos">
                        <FormField label="¿Aparece y se puede modificar desde el área de alumnos?">
                            <RadioGroup name="showInStudentArea" value={String(formData.showInStudentArea)} onChange={handleChange} options={[{label: 'Sí', value: 'true'}, {label: 'No', value: 'false'}]} />
                        </FormField>
                    </FormSection>

                    <FormSection title="Vinculaciones">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Si vinculas esta autorización con los permisos de la ficha del alumno, cuando un alumno la acepte, el permiso correspondiente de su ficha se activará automáticamente.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-2"><input type="checkbox" name="isImageRightsAuth" checked={formData.isImageRightsAuth} onChange={handleChange} /> ¿Es la autorización de derechos de imagen?</label>
                            <label className="flex items-center gap-2"><input type="checkbox" name="isCommunicationsAuth" checked={formData.isCommunicationsAuth} onChange={handleChange} /> ¿Es la autorización de comunicaciones?</label>
                        </div>
                    </FormSection>
                    
                    <FormField label="Orden">
                        <input type="number" name="order" value={formData.order} onChange={handleChange} className="w-40 p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"/>
                    </FormField>
                </div>
                
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="secondary" onClick={goBack}>Cancelar</Button>
                    <Button type="submit">{isNew ? 'Crear' : 'Actualizar'}</Button>
                </div>
            </form>
        </div>
    );
};

export default AuthorizationEditPage;