
import React, { useState, useRef, useEffect } from 'react';
import { 
    HelpCircle, Receipt, FilePenLine, UserSquare, Percent, 
    ClipboardCheck, Upload, CheckCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useData } from '../contexts/DataContext';
import { AcademyProfile } from '../types';
import { PAYMENT_TYPES, PAYMENT_PERIODICITIES } from '../constants';

// Helper Components for this page
const Card: React.FC<{ children: React.ReactNode, title?: string, icon?: React.ReactNode, className?: string }> = ({ children, title, icon, className }) => (
    <div className={`bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm ${className}`}>
        {title && (
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-2">
                {icon}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            </div>
        )}
        <div className="p-6">{children}</div>
    </div>
);

const CollapsibleSubCard: React.FC<{ children: React.ReactNode, title: string, initiallyOpen?: boolean }> = ({ children, title, initiallyOpen = true }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    return (
        <div className="border border-blue-200/50 dark:border-slate-600 rounded-md overflow-hidden">
            <h3 
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-slate-900/20 rounded-t-md flex justify-between items-center cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>- {title}</span>
            </h3>
            {isOpen && <div className="p-4 space-y-4 bg-white dark:bg-slate-700/50">{children}</div>}
        </div>
    );
};


const FormField: React.FC<{ label: string, tooltip?: string, children: React.ReactNode }> = ({ label, tooltip, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
            {tooltip && <span title={tooltip}><HelpCircle size={14} className="inline ml-1 text-gray-400 cursor-help" /></span>}
        </label>
        {children}
    </div>
);

const BaseInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-700/50"/>
);

const FileUploadField: React.FC<{ 
    label: string, 
    tooltip?: string, 
    value: string | null,
    onChange: (value: string | null, fileName?: string) => void,
    helpText: React.ReactNode,
    acceptedTypes: string[],
    maxSizeKB: number
}> = ({ label, tooltip, value, onChange, helpText, acceptedTypes, maxSizeKB }) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelectClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!acceptedTypes.includes(file.type)) {
            alert(`Tipo de archivo no válido. Aceptados: ${acceptedTypes.map(t => t.split('/')[1]).join(', ')}`);
            return;
        }
        if (file.size > maxSizeKB * 1024) {
            alert(`El archivo es demasiado grande. Tamaño máximo: ${maxSizeKB} KB.`);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            onChange(reader.result as string, file.name);
            setFileName(file.name);
        };
        reader.readAsDataURL(file);
    };

    const handleFileDelete = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            onChange(null);
            setFileName(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="border border-gray-300 dark:border-slate-600 rounded-md p-4 bg-white dark:bg-slate-700/50">
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={acceptedTypes.join(',')}
                className="hidden"
            />
            <FormField label={label} tooltip={tooltip}>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {value ? (
                        <img src={value} alt="logo preview" className="w-48 h-auto max-h-32 object-contain border dark:border-slate-600 p-2 rounded-md bg-white dark:bg-slate-700" />
                    ) : (
                        <div className="w-48 h-24 flex flex-col items-center justify-center border-2 border-dashed dark:border-slate-600 p-2 rounded-md bg-white dark:bg-slate-700 text-gray-500 dark:text-gray-400">
                             <Upload size={32} className="text-gray-400 mb-2" />
                            <span className="text-sm">Subir imagen</span>
                        </div>
                    )}
                    <div className="space-y-2 flex-grow">
                        <div>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" onChange={handleFileDelete} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" /> Borrar fichero
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="secondary" size="sm" onClick={handleFileSelectClick}>Seleccionar archivo</Button>
                            <span className="text-sm text-gray-500 truncate">{fileName || 'Ningún archivo seleccionado'}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{helpText}</div>
                    </div>
                </div>
            </FormField>
        </div>
    );
};

const RadioGroup: React.FC<{ name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, options: { label: string, value: string }[] }> = ({ name, value, onChange, options }) => (
    <div className="flex items-center gap-4 pt-2">
        {options.map(opt => (
            <label key={opt.value} className="flex items-center text-sm gap-2 text-gray-900 dark:text-gray-300">
                <input type="radio" name={name} value={opt.value} checked={value === opt.value} onChange={onChange} className="h-4 w-4 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" />
                {opt.label}
            </label>
        ))}
    </div>
);


const AcademyProfilePage = () => {
    const { academyProfile, updateAcademyProfile, addStoredFile } = useData();
    const [formData, setFormData] = useState<AcademyProfile>(academyProfile);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setFormData(academyProfile);
    }, [academyProfile]);
    
    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (type === 'radio' && (value === 'true' || value === 'false')) {
            setFormData(prev => ({...prev, [name]: value === 'true'}));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };
    
    const handleFileUpdate = (fieldName: keyof AcademyProfile, content: string | null, originalName?: string) => {
        setFormData(prev => ({...prev, [fieldName]: content}));
        
        // Add to file manager automatically
        if (content) {
            // Map field names to friendly names for the file manager
            const fieldMap: Record<string, string> = {
                logoBase64: 'Logo_Academia',
                docLogoBase64: 'Logo_Documentos',
                directorSignatureBase64: 'Firma_Direccion',
                emailLogoBase64: 'Header_Email',
                emailFooterImageBase64: 'Footer_Email',
                birthdayEmailImageBase64: 'Imagen_Cumpleanos',
                studentAreaBackground: 'Fondo_Area_Alumnos',
                studentAreaLogo: 'Logo_Area_Alumnos'
            };

            const namePrefix = fieldMap[fieldName] || fieldName;
            const finalFileName = originalName || `${namePrefix}.png`;
            
            addStoredFile({
                 id: `profile-${fieldName}-${Date.now()}`,
                 fileName: finalFileName,
                 fileUrl: content,
                 fileType: 'user_upload',
                 relatedTable: 'academy_profile',
                 relatedId: 1,
                 centerId: 1,
                 createdAt: new Date().toISOString(),
                 size: Math.round(content.length * 0.75) // Approx size
             });
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateAcademyProfile(formData);
        setShowSuccess(true);
        window.scrollTo(0, 0);
    };

    const imageTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Perfil academia</h1>

            <Card>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FormField label="Nombre público de la academia"><BaseInput name="publicName" value={formData.publicName} onChange={handleChange} /></FormField>
                    <FormField label="URL de la web" tooltip="URL de la web de la academia"><BaseInput name="website" value={formData.website} onChange={handleChange} /></FormField>
                    <FormField label="E-mail de contacto"><BaseInput name="contactEmail" value={formData.contactEmail} onChange={handleChange} /></FormField>
                    <FormField label="Teléfono de contacto"><BaseInput name="contactPhone" value={formData.contactPhone} onChange={handleChange} /></FormField>
                    <FormField label="Dirección" ><textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" /></FormField>
                    <div/>
                    <FormField label="Población"><BaseInput name="population" value={formData.population} onChange={handleChange} /></FormField>
                    <FormField label="Código postal"><BaseInput name="postalCode" value={formData.postalCode} onChange={handleChange} /></FormField>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <FileUploadField
                        label="Logo"
                        tooltip="Logo que aparecerá en los documentos de la academia"
                        value={formData.logoBase64}
                        onChange={(value, name) => handleFileUpdate('logoBase64', value, name)}
                        helpText={<>Tamaño máximo: 800 KB<br/>Tipos de archivo aceptados: .jpg, .png, .jpeg</>}
                        acceptedTypes={['image/jpeg', 'image/png']}
                        maxSizeKB={800}
                    />
                    <FileUploadField
                        label="Logo para los documentos"
                        tooltip="Logo específico para los documentos, si es diferente del principal"
                        value={formData.docLogoBase64}
                        onChange={(value, name) => handleFileUpdate('docLogoBase64', value, name)}
                        helpText={<>Tamaño máximo: 800 KB<br/>Tipos de archivo aceptados: .jpg, .png, .jpeg</>}
                        acceptedTypes={['image/jpeg', 'image/png']}
                        maxSizeKB={800}
                    />
                </div>
                <div className="mt-6">
                     <FileUploadField
                        label="Firma de Dirección"
                        tooltip="Firma que aparecerá en los documentos que requieran firma de dirección"
                        value={formData.directorSignatureBase64}
                        onChange={(value, name) => handleFileUpdate('directorSignatureBase64', value, name)}
                        helpText={<>Tamaño máximo: 800 KB<br/>Tipos de archivo aceptados: .jpg, .png, .jpeg</>}
                        acceptedTypes={['image/jpeg', 'image/png']}
                        maxSizeKB={800}
                    />
                </div>
            </Card>

            <Card title="Configuración recibos" icon={<Receipt size={20} />}>
                <div className="space-y-4">
                    <CollapsibleSubCard title="Matrícula y material">
                        <FormField label="¿Hay que pagar matrícula para renovaciones?">
                            <RadioGroup name="paysRenovationEnrollment" value={String(formData.paysRenovationEnrollment)} onChange={handleChange} options={[{ label: 'Sí', value: 'true' }, { label: 'No', value: 'false' }]} />
                        </FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Concepto recibo matrícula">
                                <BaseInput name="enrollmentReceiptConcept" value={formData.enrollmentReceiptConcept} onChange={handleChange}/>
                            </FormField>
                            <FormField label="Concepto recibo material">
                                <BaseInput name="materialReceiptConcept" value={formData.materialReceiptConcept} onChange={handleChange}/>
                            </FormField>
                        </div>
                    </CollapsibleSubCard>
                    <CollapsibleSubCard title="Parámetros generación automática recibos">
                        <FormField label="¿Generar recibo para el primer mes en inscripciones trimestrales?">
                             <RadioGroup name="generateFirstMonthReceipt" value={String(formData.generateFirstMonthReceipt)} onChange={handleChange} options={[{ label: 'Sí', value: 'true' }, { label: 'No', value: 'false' }]} />
                        </FormField>
                        <FormField label="¿Generar recibo mes actual con curso comenzado (PAGO MENSUAL)?">
                             <RadioGroup name="generateCurrentMonthWithStartedCourse" value={String(formData.generateCurrentMonthWithStartedCourse)} onChange={handleChange} options={[{ label: 'Sí', value: 'true' }, { label: 'No', value: 'false' }]} />
                        </FormField>
                        <FormField label="¿Generar recibo trimestre actual con trimestre en curso (PAGO TRIMESTRAL)?">
                             <RadioGroup name="generateCurrentQuarterWithStartedCourse" value={String(formData.generateCurrentQuarterWithStartedCourse)} onChange={handleChange} options={[{ label: 'Sí', value: 'true' }, { label: 'No', value: 'false' }]} />
                        </FormField>
                    </CollapsibleSubCard>
                     <CollapsibleSubCard title="Domiciliaciones bancarias">
                        <FormField label="¿Generar remesa recibos unificada por IBAN?">
                             <RadioGroup name="generateUnifiedRemittanceByIban" value={String(formData.generateUnifiedRemittanceByIban)} onChange={handleChange} options={[{ label: 'Sí', value: 'true' }, { label: 'No', value: 'false' }]} />
                        </FormField>
                        <FormField label="Nombre del acreedor (para SEPA)">
                           <BaseInput name="sepaCreditorName" value={formData.sepaCreditorName || ''} onChange={handleChange} />
                        </FormField>
                        <FormField label="Dirección de facturación (para SEPA)">
                           <BaseInput name="sepaCreditorAddress" value={formData.sepaCreditorAddress || ''} onChange={handleChange} />
                        </FormField>
                        <FormField label="Día cobro de recibos domiciliados">
                            <BaseInput type="number" name="defaultChargeDay" value={formData.defaultChargeDay} onChange={handleChange} min="1" max="31" />
                        </FormField>
                    </CollapsibleSubCard>
                     <CollapsibleSubCard title="Retorno de recibos">
                        <FormField label="Activar retorno de recibos">
                             <RadioGroup name="activateReceiptReturn" value={String(formData.activateReceiptReturn)} onChange={handleChange} options={[{ label: 'Sí', value: 'true' }, { label: 'No', value: 'false' }]} />
                        </FormField>
                    </CollapsibleSubCard>
                    <CollapsibleSubCard title="Valores por defecto para los alumnos">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Tipo de pago por defecto">
                                <select name="defaultPaymentType" value={formData.defaultPaymentType} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                                    {PAYMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </FormField>
                            <FormField label="Periodicidad de pago por defecto">
                                <select name="defaultPaymentPeriodicity" value={formData.defaultPaymentPeriodicity} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                                    {PAYMENT_PERIODICITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </FormField>
                        </div>
                    </CollapsibleSubCard>
                </div>
            </Card>

             <Card title="Campos personalizados" icon={<FilePenLine size={20} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <FormField label="Campo personalizado 1?"><RadioGroup name="customField1Enabled" value={String(formData.customField1Enabled)} onChange={handleChange} options={[{label:'Sí', value:'true'}, {label:'No', value:'false'}]}/></FormField>
                    <FormField label="Etiqueta campo 1"><BaseInput name="customField1Label" value={formData.customField1Label} onChange={handleChange}/></FormField>
                    <FormField label="Campo personalizado 2?"><RadioGroup name="customField2Enabled" value={String(formData.customField2Enabled)} onChange={handleChange} options={[{label:'Sí', value:'true'}, {label:'No', value:'false'}]}/></FormField>
                    <FormField label="Etiqueta campo 2"><BaseInput name="customField2Label" value={formData.customField2Label} onChange={handleChange}/></FormField>
                    <FormField label="Campo personalizado 3?"><RadioGroup name="customField3Enabled" value={String(formData.customField3Enabled)} onChange={handleChange} options={[{label:'Sí', value:'true'}, {label:'No', value:'false'}]}/></FormField>
                    <FormField label="Etiqueta campo 3"><BaseInput name="customField3Label" value={formData.customField3Label} onChange={handleChange}/></FormField>
                    <FormField label="Campo personalizado 4?"><RadioGroup name="customField4Enabled" value={String(formData.customField4Enabled)} onChange={handleChange} options={[{label:'Sí', value:'true'}, {label:'No', value:'false'}]}/></FormField>
                    <FormField label="Etiqueta campo 4"><BaseInput name="customField4Label" value={formData.customField4Label} onChange={handleChange}/></FormField>
                </div>
                 <h3 className="text-md font-semibold text-gray-800 dark:text-white mt-6 pt-4 border-t dark:border-slate-600">Etiquetas de email y teléfono</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-4">
                    <FormField label="Etiqueta campo E-mail 1"><BaseInput name="emailLabel1" value={formData.emailLabel1} onChange={handleChange}/></FormField>
                    <FormField label="Etiqueta campo teléfono 1"><BaseInput name="phoneLabel1" value={formData.phoneLabel1} onChange={handleChange}/></FormField>
                    <FormField label="Etiqueta campo E-mail 2"><BaseInput name="emailLabel2" value={formData.emailLabel2} onChange={handleChange}/></FormField>
                    <FormField label="Etiqueta campo teléfono 2"><BaseInput name="phoneLabel2" value={formData.phoneLabel2} onChange={handleChange}/></FormField>
                    <FormField label="Etiqueta campo E-mail 3"><BaseInput name="emailLabel3" value={formData.emailLabel3} onChange={handleChange}/></FormField>
                    <FormField label="Etiqueta campo teléfono 3"><BaseInput name="phoneLabel3" value={formData.phoneLabel3} onChange={handleChange}/></FormField>
                 </div>
            </Card>

            <Card title="Área de alumnos" icon={<UserSquare size={20} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FileUploadField label="Imagen fondo área de alumnos" value={formData.studentAreaBackground} onChange={(v, n) => handleFileUpdate('studentAreaBackground', v, n)} acceptedTypes={imageTypes} maxSizeKB={2000} helpText={<>Tamaño máximo: 2 MB<br/>Tipos de archivo aceptados: .jpg, .png, .jpeg, .svg</>} />
                    <FileUploadField label="Logo área de alumnos" value={formData.studentAreaLogo} onChange={(v, n) => handleFileUpdate('studentAreaLogo', v, n)} acceptedTypes={imageTypes} maxSizeKB={800} helpText={<>Tamaño máximo: 800 KB<br/>Tipos de archivo aceptados: .jpg, .png, .jpeg</>} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-4">
                    <FormField label="¿Muestra los recibos por curso?"><RadioGroup name="showReceiptsInStudentArea" value={String(formData.showReceiptsInStudentArea)} onChange={handleChange} options={[{label:'Sí', value:'true'},{label:'No', value:'false'}]}/></FormField>
                    <FormField label="¿Muestra las facturas por curso?"><RadioGroup name="showInvoicesInStudentArea" value={String(formData.showInvoicesInStudentArea)} onChange={handleChange} options={[{label:'Sí', value:'true'},{label:'No', value:'false'}]}/></FormField>
                    <FormField label="¿Muestra los documentos por curso?"><RadioGroup name="showCourseDocumentsInStudentArea" value={String(formData.showCourseDocumentsInStudentArea)} onChange={handleChange} options={[{label:'Sí', value:'true'},{label:'No', value:'false'}]}/></FormField>
                    <FormField label="¿Muestra el seguimiento por curso?"><RadioGroup name="showCourseTrackingInStudentArea" value={String(formData.showCourseTrackingInStudentArea)} onChange={handleChange} options={[{label:'Sí', value:'true'},{label:'No', value:'false'}]}/></FormField>
                    <FormField label="¿Mostrar días de clases en el área de alumnos?"><RadioGroup name="showClassDaysInStudentArea" value={String(formData.showClassDaysInStudentArea)} onChange={handleChange} options={[{label:'Sí', value:'true'},{label:'No', value:'false'}]}/></FormField>
                </div>
            </Card>
            
            <Card title="% Ocupación de cursos" icon={<Percent size={20} />}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <FormField label="Plazas por defecto en cursos"><BaseInput type="number" name="defaultSeatsInCourses" value={formData.defaultSeatsInCourses} onChange={handleChange} /></FormField>
                    <div/>
                    <FormField label="¿Mostrar ocupación de los cursos?"><RadioGroup name="showCourseOccupancy" value={String(formData.showCourseOccupancy)} onChange={handleChange} options={[{label:'Sí', value:'true'},{label:'No', value:'false'}]}/></FormField>
                    <FormField label="¿Activar lista de espera en los cursos?"><RadioGroup name="activateWaitingList" value={String(formData.activateWaitingList)} onChange={handleChange} options={[{label:'Sí', value:'true'},{label:'No', value:'false'}]}/></FormField>
                    <FormField label="Notificar por email un resumen semanal de los alumnos en espera con plaza disponible"><RadioGroup name="notifyOnWaitingListAvailability" value={String(formData.notifyOnWaitingListAvailability)} onChange={handleChange} options={[{label:'Sí', value:'true'},{label:'No', value:'false'}]}/></FormField>
                </div>
            </Card>

             <Card title="Inscripción on-line" icon={<ClipboardCheck size={20} />}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <FormField label="¿Escoger cursos renovación?"><RadioGroup name="chooseRenovationCourses" value={String(formData.chooseRenovationCourses)} onChange={handleChange} options={[{label:'Sí', value:'true'},{label:'No', value:'false'}]}/></FormField>
                    <FormField label="Landing para las renovaciones"><select name="renovationLandingPage" value={formData.renovationLandingPage} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"><option value="">-</option></select></FormField>
                </div>
            </Card>

            <div className="sticky bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 border-t border-gray-200 dark:border-slate-700 flex justify-end items-center gap-4 -mx-4 -mb-10 sm:-mx-6 sm:-mb-6 2xl:-mx-10 2xl:-mb-10 rounded-b-lg">
                {showSuccess && (
                    <div className="text-green-600 dark:text-green-400 flex items-center gap-2 mr-auto transition-opacity duration-300">
                        <CheckCircle size={20} />
                        <span className="font-semibold">¡Perfil actualizado correctamente!</span>
                    </div>
                )}
                <Button variant="secondary" type="button" onClick={() => setFormData(academyProfile)}>Cancelar</Button>
                <Button type="submit">Actualizar</Button>
            </div>
        </form>
    );
};

export default AcademyProfilePage;