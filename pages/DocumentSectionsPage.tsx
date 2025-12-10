import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import RichTextEditor from '../components/ui/RichTextEditor';
import { useData } from '../contexts/DataContext';
import { AcademyProfile } from '../types';
import { HelpCircle, CheckCircle } from 'lucide-react';
import Tooltip from '../components/ui/Tooltip';

// Helper components for this page
interface RadioFieldProps {
    label: string;
    tooltip?: string;
    name: keyof AcademyProfile;
    value: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RadioField: React.FC<RadioFieldProps> = ({ label, tooltip, name, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
            {tooltip && (
                <Tooltip content={tooltip}>
                    <span className="inline-flex ml-1 cursor-help">
                        <HelpCircle size={14} className="text-gray-400" />
                    </span>
                </Tooltip>
            )}
        </label>
        <div className="flex items-center gap-4">
            <label className="flex items-center text-sm gap-2">
                <input type="radio" name={name as string} value="true" checked={value === true} onChange={onChange} className="h-4 w-4 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500"/>
                Sí
            </label>
            <label className="flex items-center text-sm gap-2">
                <input type="radio" name={name as string} value="false" checked={value === false} onChange={onChange} className="h-4 w-4 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500"/>
                No
            </label>
        </div>
    </div>
);

interface FormFieldProps {
    label: string;
    tooltip?: string;
    children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, tooltip, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
            {tooltip && (
                <Tooltip content={tooltip}>
                    <span className="inline-flex ml-1 cursor-help">
                        <HelpCircle size={14} className="text-gray-400" />
                    </span>
                </Tooltip>
            )}
        </label>
        {children}
    </div>
);


const DocumentSectionsPage = () => {
    const { academyProfile, updateAcademyProfile, authorizations } = useData();
    const [formData, setFormData] = useState<AcademyProfile>(academyProfile);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setFormData(academyProfile);
    }, [academyProfile]);

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value === 'true' }));
    };

    const handleAuthCheckboxChange = (authId: number) => {
        setFormData(prev => {
            const currentAuths = prev.defaultAuthorizations || [];
            const newAuths = currentAuths.includes(authId)
                ? currentAuths.filter(id => id !== authId)
                : [...currentAuths, authId];
            return { ...prev, defaultAuthorizations: newAuths };
        });
    };
    
    const handleRichTextChange = (content: string) => {
        setFormData(prev => ({...prev, signatureLegalText: content}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateAcademyProfile(formData);
        setShowSuccess(true);
        window.scrollTo(0, 0);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Configuración documentos</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Apartados por defecto
                </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                 <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Configuración de los apartados que se cargarán por defecto en el documento de firmas generado al alumno. Independientemente, se podrán enviar los apartados por separado mediante el asistente de envío de firma.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <RadioField 
                        label="Enviar documentos de firma masiva a todos los e-mails del alumno?" 
                        name="sendSignatureDocsToAllEmails" 
                        value={formData.sendSignatureDocsToAllEmails} 
                        onChange={handleChange} 
                        tooltip="Envía el documento para firmar desde la lista de inscritos a un curso a todos los e-mails configurados por los alumnos. Si se desactiva sólo lo enviará al e-mail principal del alumno."
                    />
                    <div/>
                    <RadioField 
                        label="¿Envío de la ficha de alumno?" 
                        name="sendStudentSheet" 
                        value={formData.sendStudentSheet} 
                        onChange={handleChange} 
                        tooltip="Sólo se generará en caso de que el alumno sea menor de edad."
                    />
                    <RadioField 
                        label="¿Envío del SEPA?" 
                        name="sendSEPA" 
                        value={formData.sendSEPA} 
                        onChange={handleChange} 
                        tooltip="La sección se generará únicamente si el alumno tiene cobro de cuotas domiciliado."
                    />
                    <RadioField 
                        label="¿Envío autorización de recogida?" 
                        name="sendPickupAuthorization" 
                        value={formData.sendPickupAuthorization} 
                        onChange={handleChange} 
                        tooltip="Genera la hoja de autorización de recogida con las personas autorizadas en la ficha del alumno."
                    />
                    <RadioField 
                        label="¿Envío de términos y condiciones?" 
                        name="sendTermsAndConditions" 
                        value={formData.sendTermsAndConditions} 
                        onChange={handleChange} 
                        tooltip="Puedes configurar el contenido del apartado en: Config. Documentos > Config. textos."
                    />
                    <RadioField 
                        label="¿Envío de la protección de datos?" 
                        name="sendDataProtection" 
                        value={formData.sendDataProtection} 
                        onChange={handleChange} 
                        tooltip="Puedes configurar el contenido del apartado en: Config. Documentos > Config. textos."
                    />
                    <RadioField label="¿La ficha de alumno incluye los datos académicos?" name="studentSheetIncludesAcademicData" value={formData.studentSheetIncludesAcademicData} onChange={handleChange} />
                    <RadioField label="¿La ficha de alumno incluye las condiciones de pago de los cursos activos?" name="studentSheetIncludesPaymentConditions" value={formData.studentSheetIncludesPaymentConditions} onChange={handleChange} />
                    <RadioField label="¿Sólo aparece el último curso activo inscrito?" name="showOnlyLastActiveCourse" value={formData.showOnlyLastActiveCourse} onChange={handleChange} />
                </div>
                
                <div className="mt-8 pt-6 border-t dark:border-slate-700">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Autorizaciones enviadas por defecto</h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {authorizations.map(auth => (
                            <label key={auth.id} className="flex items-center gap-2 text-sm">
                                <input 
                                    type="checkbox" 
                                    checked={formData.defaultAuthorizations?.includes(auth.id)}
                                    onChange={() => handleAuthCheckboxChange(auth.id)}
                                    className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500"
                                />
                                {auth.internalTitle}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t dark:border-slate-700">
                     <RadioField 
                        label="¿Puede editar las autorizaciones antes de firmar?" 
                        name="canEditAuthorizationsBeforeSigning" 
                        value={formData.canEditAuthorizationsBeforeSigning} 
                        onChange={handleChange} 
                        tooltip="Determina si las personas que firman las autorizaciones pueden modificar los valores. Si envías a firmar el documento a múltiples personas es posible que los valores que escojan cambien según la decisión de quién firme."
                    />
                </div>
                 <div className="mt-8 pt-6 border-t dark:border-slate-700">
                    <FormField label="Texto legal al pie de la aplicación de la firma" tooltip="Aparece en la pantalla donde se firma.">
                        <RichTextEditor value={formData.signatureLegalText} onChange={handleRichTextChange} />
                         <p className="text-xs text-gray-500 mt-2">Al aplicar la firma se generará el documento anteriormente leído y registraremos tu conformidad con respecto a los datos y autorizaciones antes mostradas.<br/>Si hay cualquier dato a modificar, contacta con el centro antes de aplicar la firma.</p>
                    </FormField>
                </div>

                 <div className="mt-8 flex justify-end items-center gap-4">
                     {showSuccess && <div className="text-green-600 dark:text-green-400 flex items-center gap-2 mr-auto transition-opacity duration-300"><CheckCircle size={20} /><span className="font-semibold">¡Actualizado correctamente!</span></div>}
                    <Button type="submit">Actualizar</Button>
                 </div>
            </div>
        </form>
    );
};

export default DocumentSectionsPage;