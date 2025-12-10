
import React, { useState, useEffect, useRef } from 'react';
import { Student, AuthorizedPickup } from '../../types';
import { useData } from '../../contexts/DataContext';
import Button from '../ui/Button';
import { Upload, Trash2, HelpCircle, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { PAYMENT_TYPES, PAYMENT_PERIODICITIES } from '../../constants';
import { validateNif } from '../../utils/helpers';

interface StudentFormProps {
    student: Student | null;
    onSave: (student: Student) => void;
    onClose: () => void;
}

type ValidationStatus = 'idle' | 'valid' | 'invalid';
interface ValidationState {
    dni: ValidationStatus;
    tutor0nif: ValidationStatus;
    tutor1nif: ValidationStatus;
    iban: ValidationStatus;
    pickup0nif: ValidationStatus;
    pickup1nif: ValidationStatus;
    pickup2nif: ValidationStatus;
}

const getRandomColor = (char: string) => {
    let hash = 0;
    for (let i = 0; i < char.length; i++) {
        hash = char.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
    const index = Math.abs(hash % colors.length);
    return colors[index];
};


const FormSection: React.FC<{ title: string; children: React.ReactNode; collapsible?: boolean }> = ({ title, children, collapsible }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700" onClick={() => collapsible && setIsOpen(!isOpen)}>
                {title}
            </h3>
            {isOpen && <div className="p-6 space-y-4">{children}</div>}
        </div>
    );
};

const CollapsibleSubSection: React.FC<{ title: string, children: React.ReactNode, initiallyOpen?: boolean }> = ({ title, children, initiallyOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-md">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full text-left p-3 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 flex justify-between items-center rounded-t-md">
                <h4 className="font-semibold text-gray-700 dark:text-gray-200">{title}</h4>
                <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-4 space-y-4 bg-white dark:bg-slate-800 rounded-b-md">{children}</div>}
        </div>
    )
}


const FormRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 ${className}`}>{children}</div>
);

const FormField: React.FC<{ label: string; children: React.ReactNode; fullWidth?: boolean }> = ({ label, children, fullWidth }) => (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {children}
    </div>
);

const BaseInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 focus:ring-primary-500 focus:border-primary-500"/>
);

const StudentForm: React.FC<StudentFormProps> = ({ student, onSave, onClose }) => {
    const { populations, academyProfile } = useData();

    const getInitialState = (): Student => ({
        id: 0,
        registrationDate: new Date().toISOString().split('T')[0],
        isActive: true,
        firstName: '',
        lastName: '',
        dni: '',
        photoUrl: '',
        birthDate: '',
        email1: '',
        phone1: '',
        address: '',
        postalCode: '',
        population: '',
        isMinor: true,
        tutors: [{ nif: '', fullName: '' }, { nif: '', fullName: '' }],
        communicationLanguage: 'Español',
        paymentConfig: { 
            type: academyProfile.defaultPaymentType,
            periodicity: academyProfile.defaultPaymentPeriodicity,
            hasDiscount: false 
        },
        domiciliationData: { chargeDay: academyProfile.defaultChargeDay, accountHolder: '', iban: '', bic: '', acceptanceDate: '', sepaType: 'recurrent' },
        hasSecondPayer: false,
        authorizations: { whatsapp: true, imageRights: true, newsletters: true, canLeaveAlone: false },
        authorizedPickups: [{ nif: '', fullName: '' }, { nif: '', fullName: '' }, { nif: '', fullName: '' }],
        status: 'Activo',
        stats: { assistance: 0, receipts: 0, invoices: 0, emails: 0, docs: 0, authorizations: 0 },
        customField4Label: '',
    });
    
    const [formData, setFormData] = useState<Student>(student || getInitialState());
    
    const [validationStatus, setValidationStatus] = useState<ValidationState>({
        dni: 'idle', tutor0nif: 'idle', tutor1nif: 'idle', iban: 'idle',
        pickup0nif: 'idle', pickup1nif: 'idle', pickup2nif: 'idle'
    });
    
    const photoInputRef = useRef<HTMLInputElement>(null);
    
    const validateIban = (iban: string) => {
        const ibanUpper = iban.toUpperCase().replace(/\s/g, '');
        if (!/^[A-Z]{2}[0-9]{22}$/.test(ibanUpper)) return false;
        
        const rearranged = ibanUpper.substring(4) + ibanUpper.substring(0, 4);
        const numeric = Array.from(rearranged).map(char => char.charCodeAt(0) - (char >= 'A' ? 55 : 48)).join('');
        
        try {
            return BigInt(numeric) % 97n === 1n;
        } catch (e) {
            return false;
        }
    };
    
    const getBicFromIban = (iban: string) => {
        if (!iban.startsWith('ES') || iban.length < 12) return '';
        const bankCode = iban.substring(4, 8);
        const bicMap: { [key: string]: string } = { '2100': 'CAIXESBBXXX', '0049': 'BSCHESMMXXX', '0182': 'BBVAESMMXXX', '0030': 'BOSPESMMXXX', '1465': 'INGDESMMXXX', '0081': 'BADEESMMXXX', '0128': 'BKBKESMMXXX', '0130': 'BCOEESMMXXX', '0075': 'POPUESMMXXX', '0238': 'PSTESMMXXX' };
        return bicMap[bankCode] || '';
    }

    const handleValidation = (field: keyof ValidationState, value: string) => {
        let isValid = false;
        if (String(field).includes('nif') || String(field).includes('dni')) {
            isValid = validateNif(value);
        } else if (field === 'iban') {
            isValid = validateIban(value);
            if (isValid) {
                const bic = getBicFromIban(value);
                if (bic) {
                    setFormData(prev => ({ ...prev, domiciliationData: { ...prev.domiciliationData!, bic } }));
                }
            }
        }
        setValidationStatus(prev => ({ ...prev, [field]: isValid ? 'valid' : 'invalid' }));
    };

    const resetValidation = (field: keyof ValidationState) => {
        if (validationStatus[field] !== 'idle') {
            setValidationStatus(prev => ({ ...prev, [field]: 'idle' }));
        }
    };
    
    const ValidationFeedback: React.FC<{status: ValidationStatus}> = ({status}) => {
        if (status === 'valid') return <span className="text-xs text-green-600 flex items-center gap-1 mt-1"><CheckCircle size={14} /> Válido</span>;
        if (status === 'invalid') return <span className="text-xs text-red-600 flex items-center gap-1 mt-1"><XCircle size={14} /> Inválido</span>;
        return null;
    }

    useEffect(() => {
        setFormData(student || getInitialState());
    }, [student, academyProfile]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        const keys = name.split('.');
        if (keys.length > 1) {
            if(name === 'domiciliationData.iban') resetValidation('iban');

            setFormData(prev => {
                const newState = JSON.parse(JSON.stringify(prev));
                let current: any = newState;
                for (let i = 0; i < keys.length - 1; i++) {
                     if (current[keys[i]] === undefined || current[keys[i]] === null) { current[keys[i]] = {}; }
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
                return newState;
            });
        } else {
             if(name === 'dni') resetValidation('dni');
             setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleTutorChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if(name === 'nif') resetValidation(`tutor${index}nif` as keyof ValidationState);
        setFormData(prev => {
            const newTutors = [...prev.tutors];
            if(!newTutors[index]) newTutors[index] = {nif: '', fullName: ''};
            (newTutors[index] as any)[name] = value;
            return { ...prev, tutors: newTutors };
        });
    };
    
    const handleAuthorizedPickupChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'nif') resetValidation(`pickup${index}nif` as keyof ValidationState);
        setFormData(prev => {
            const newPickups = [...(prev.authorizedPickups || [])];
            if (!newPickups[index]) newPickups[index] = { fullName: '', nif: '' };
            (newPickups[index] as any)[name] = value;
            return { ...prev, authorizedPickups: newPickups };
        });
    };

    const handleBooleanRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            let current: any = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                if (current[keys[i]] === undefined || current[keys[i]] === null) { current[keys[i]] = {}; }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value === 'true';
            return newState;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSizeKB = 800;

        if (!acceptedTypes.includes(file.type)) {
            alert(`Tipo de archivo no válido. Solo se aceptan: JPG, PNG, GIF.`);
            return;
        }

        if (file.size > maxSizeKB * 1024) {
            alert(`El archivo es demasiado grande. El tamaño máximo es de ${maxSizeKB} KB.`);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleSelectFileClick = () => {
        photoInputRef.current?.click();
    };

    const handleDeletePhoto = () => {
        setFormData(prev => ({ ...prev, photoUrl: '' }));
        if(photoInputRef.current) {
            photoInputRef.current.value = '';
        }
    };
    
    const initials = `${formData.firstName?.[0] || ''}${formData.lastName?.[0] || ''}`.toUpperCase();
    const avatarColor = getRandomColor(initials);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center">
                <FormRow className="items-center">
                    <FormField label="Fecha alta"><BaseInput type="date" name="registrationDate" value={formData.registrationDate} onChange={handleChange} /></FormField>
                    <FormField label="¿Activo?"><div className="flex gap-4 pt-2"><label><input type="radio" name="isActive" value="true" checked={formData.isActive === true} onChange={handleBooleanRadioChange}/> Sí</label><label><input type="radio" name="isActive" value="false" checked={formData.isActive === false} onChange={handleBooleanRadioChange}/> No</label></div></FormField>
                </FormRow>
            </div>

            <FormSection title="Datos básicos">
                <FormRow><FormField label="Nombre"><BaseInput name="firstName" value={formData.firstName} onChange={handleChange} /></FormField><FormField label="Apellidos"><BaseInput name="lastName" value={formData.lastName} onChange={handleChange} /></FormField></FormRow>
                <FormRow>
                    <FormField label="DNI">
                        <BaseInput name="dni" value={formData.dni} onChange={handleChange} onBlur={(e) => handleValidation('dni', e.target.value)} />
                        <ValidationFeedback status={validationStatus.dni} />
                    </FormField>
                    <FormField label="Fecha nacimiento"><BaseInput type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} /></FormField>
                </FormRow>
                <FormRow>
                    <FormField label="Foto" fullWidth>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                ref={photoInputRef}
                                onChange={handlePhotoChange}
                                accept="image/png, image/jpeg, image/gif"
                                className="hidden"
                            />
                            {formData.photoUrl ? (
                                <img src={formData.photoUrl} alt="Foto del alumno" className="w-16 h-16 rounded-full object-cover" />
                            ) : (
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-2xl ${avatarColor}`}>
                                    {initials}
                                </div>
                            )}
                            <div className="flex flex-col gap-2">
                                <Button type="button" variant="secondary" size="sm" onClick={handleSelectFileClick}>
                                    Seleccionar archivo
                                </Button>
                                {formData.photoUrl && (
                                    <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={handleDeletePhoto} leftIcon={<Trash2 size={14} />}>
                                        Borrar foto
                                    </Button>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Tamaño máximo: 800 KB. Tipos aceptados: JPG, PNG, GIF.</p>
                    </FormField>
                </FormRow>
                <FormRow><FormField label={academyProfile.emailLabel1 || 'E-mail 1'}><BaseInput type="email" name="email1" value={formData.email1} onChange={handleChange} /></FormField><FormField label={academyProfile.phoneLabel1 || 'Teléfono 1'}><BaseInput type="tel" name="phone1" value={formData.phone1} onChange={handleChange} /></FormField></FormRow>
                <FormRow><FormField label={academyProfile.emailLabel2 || 'E-mail 2'}><BaseInput type="email" name="email2" value={formData.email2 || ''} onChange={handleChange} /></FormField><FormField label={academyProfile.phoneLabel2 || 'Teléfono 2'}><BaseInput type="tel" name="phone2" value={formData.phone2 || ''} onChange={handleChange} /></FormField></FormRow>
                <FormRow><FormField label={academyProfile.emailLabel3 || 'E-mail 3'}><BaseInput type="email" name="email3" value={formData.email3 || ''} onChange={handleChange} /></FormField><FormField label={academyProfile.phoneLabel3 || 'Teléfono 3'}><BaseInput type="tel" name="phone3" value={formData.phone3 || ''} onChange={handleChange} /></FormField></FormRow>
                <FormRow><FormField label="Dirección"><textarea name="address" value={formData.address} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"/></FormField><FormField label="Web"><BaseInput name="website" value={formData.website || ''} onChange={handleChange} /></FormField></FormRow>
                <FormRow>
                    <FormField label="Código postal"><BaseInput name="postalCode" value={formData.postalCode} onChange={handleChange} /></FormField>
                    <FormField label="Población"><select name="population" value={formData.population} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"><option value="">-- Seleccionar --</option>{populations.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select></FormField>
                </FormRow>
            </FormSection>

            <FormSection title="Datos adicionales">
                <FormField label="Alergias / Enfermedades" fullWidth><textarea name="allergies" value={formData.allergies || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"/></FormField>
                <FormField label="Datos académicos" fullWidth><textarea name="academicData" value={formData.academicData || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"/></FormField>
                <FormField label="Etiquetas"><label className="flex items-center"><input type="checkbox" /> Tiene hermanos</label></FormField>
                <FormField label="¿Menor de edad?"><div className="flex gap-4 pt-2"><label><input type="radio" name="isMinor" value="true" checked={formData.isMinor === true} onChange={handleBooleanRadioChange}/> Sí</label><label><input type="radio" name="isMinor" value="false" checked={formData.isMinor === false} onChange={handleBooleanRadioChange}/> No</label></div></FormField>
                {formData.isMinor && <>
                    <FormRow>
                        <FormField label="NIF del tutor/a">
                            <BaseInput name="nif" value={formData.tutors?.[0]?.nif || ''} onChange={(e) => handleTutorChange(0, e)} onBlur={(e) => handleValidation('tutor0nif', e.target.value)} />
                            <ValidationFeedback status={validationStatus.tutor0nif} />
                        </FormField>
                        <FormField label="Nombre completo del tutor/a"><BaseInput name="fullName" value={formData.tutors?.[0]?.fullName || ''} onChange={(e) => handleTutorChange(0, e)}/></FormField>
                    </FormRow>
                    <FormRow>
                        <FormField label="NIF del tutor/a #2">
                            <BaseInput name="nif" value={formData.tutors?.[1]?.nif || ''} onChange={(e) => handleTutorChange(1, e)} onBlur={(e) => handleValidation('tutor1nif', e.target.value)} />
                            <ValidationFeedback status={validationStatus.tutor1nif} />
                        </FormField>
                        <FormField label="Nombre completo del tutor/a #2"><BaseInput name="fullName" value={formData.tutors?.[1]?.fullName || ''} onChange={(e) => handleTutorChange(1, e)}/></FormField>
                    </FormRow>
                </>}
                <FormField label="Idioma de comunicaciones"><select name="communicationLanguage" value={formData.communicationLanguage} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"><option>Español</option><option>Catalán</option><option>Inglés</option></select></FormField>
                
                {academyProfile.customField1Enabled && (
                    <FormField label={academyProfile.customField1Label || 'Campo personalizado 1'} fullWidth>
                        <BaseInput name="customField1Value" value={formData.customField1Value || ''} onChange={handleChange} />
                    </FormField>
                )}
                 {academyProfile.customField2Enabled && (
                    <FormField label={academyProfile.customField2Label || 'Campo personalizado 2'} fullWidth>
                        <BaseInput name="customField2Value" value={formData.customField2Value || ''} onChange={handleChange} />
                    </FormField>
                )}
                 {academyProfile.customField3Enabled && (
                    <FormField label={academyProfile.customField3Label || 'Campo personalizado 3'} fullWidth>
                        <BaseInput name="customField3Value" value={formData.customField3Value || ''} onChange={handleChange} />
                    </FormField>
                )}
                 {academyProfile.customField4Enabled && (
                    <FormField label={academyProfile.customField4Label || 'Campo personalizado 4'} fullWidth>
                        <BaseInput name="customField4Value" value={formData.customField4Value || ''} onChange={handleChange} />
                    </FormField>
                )}
            </FormSection>

            <FormSection title="Observaciones"><FormField label="Observaciones" fullWidth><textarea name="observations" value={formData.observations || ''} onChange={handleChange} rows={4} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"/></FormField></FormSection>
            
            <FormSection title="Configuración de cobro">
                <FormField label="Tipo de pago"><div className="flex flex-wrap gap-4">{PAYMENT_TYPES.map(type => <label key={type} className="flex items-center gap-2"><input type="radio" name="paymentConfig.type" value={type} checked={formData.paymentConfig.type === type} onChange={handleChange}/> {type}</label>)}</div></FormField>
                <FormField label="Periodicidad pago"><div className="flex flex-wrap gap-4">{PAYMENT_PERIODICITIES.map(p => <label key={p} className="flex items-center gap-2"><input type="radio" name="paymentConfig.periodicity" value={p} checked={formData.paymentConfig.periodicity === p} onChange={handleChange}/> {p}</label>)}</div></FormField>
                <FormField label="¿Tiene descuento?"><div className="flex gap-4"><label><input type="radio" name="paymentConfig.hasDiscount" value="true" checked={formData.paymentConfig.hasDiscount === true} onChange={handleBooleanRadioChange}/> Sí</label><label><input type="radio" name="paymentConfig.hasDiscount" value="false" checked={formData.paymentConfig.hasDiscount === false} onChange={handleBooleanRadioChange}/> No</label></div></FormField>
                
                <div className="md:col-span-2 pt-4 mt-4 border-t border-gray-200 dark:border-slate-700">
                    <CollapsibleSubSection title="Datos de Facturación" initiallyOpen={true}>
                        <FormField label="Tipo de cliente">
                            <div className="flex gap-4 pt-2">
                                <label><input type="radio" name="billingData.clientType" value="physical" checked={formData.billingData?.clientType === 'physical'} onChange={handleChange} /> Persona física</label>
                                <label><input type="radio" name="billingData.clientType" value="juridical" checked={formData.billingData?.clientType === 'juridical'} onChange={handleChange} /> Persona jurídica</label>
                            </div>
                        </FormField>
                        <FormRow>
                             <FormField label="NIF">
                                <BaseInput name="billingData.nif" value={formData.billingData?.nif || ''} onChange={handleChange} />
                            </FormField>
                        </FormRow>
                        <FormRow>
                            <FormField label={formData.billingData?.clientType === 'juridical' ? 'Razón Social' : 'Nombre'}>
                                <BaseInput name="billingData.name" value={formData.billingData?.name || ''} onChange={handleChange} />
                            </FormField>
                            {formData.billingData?.clientType === 'physical' && (
                                <FormField label="Apellidos">
                                    <BaseInput name="billingData.lastName" value={formData.billingData?.lastName || ''} onChange={handleChange} />
                                </FormField>
                            )}
                        </FormRow>
                        <FormRow>
                             <FormField label="Dirección" fullWidth>
                                <BaseInput name="billingData.address" value={formData.billingData?.address || ''} onChange={handleChange} />
                            </FormField>
                        </FormRow>
                         <FormRow>
                             <FormField label="Código Postal">
                                <BaseInput name="billingData.postalCode" value={formData.billingData?.postalCode || ''} onChange={handleChange} />
                            </FormField>
                              <FormField label="Población">
                                <BaseInput name="billingData.population" value={formData.billingData?.population || ''} onChange={handleChange} />
                            </FormField>
                        </FormRow>
                    </CollapsibleSubSection>
                </div>

                {formData.paymentConfig.type === 'Domiciliado' && (
                    <div className="md:col-span-2 pt-4 mt-4 border-t border-gray-200 dark:border-slate-700">
                        <CollapsibleSubSection title="Datos domiciliación" initiallyOpen>
                            <FormRow><FormField label="Día cobro"><BaseInput name="domiciliationData.chargeDay" value={formData.domiciliationData?.chargeDay || ''} onChange={handleChange}/></FormField><FormField label="Titular cuenta"><BaseInput name="domiciliationData.accountHolder" value={formData.domiciliationData?.accountHolder || ''} onChange={handleChange}/></FormField></FormRow>
                            <FormRow>
                                <FormField label="IBAN">
                                    <BaseInput name="domiciliationData.iban" value={formData.domiciliationData?.iban || ''} onChange={handleChange} onBlur={e => handleValidation('iban', e.target.value)}/>
                                    <ValidationFeedback status={validationStatus.iban} />
                                </FormField>
                                <FormField label="BIC"><BaseInput name="domiciliationData.bic" value={formData.domiciliationData?.bic || ''} onChange={handleChange}/></FormField>
                            </FormRow>
                            <FormRow>
                                <FormField label="Fecha aceptación mandato"><BaseInput type="date" name="domiciliationData.acceptanceDate" value={formData.domiciliationData?.acceptanceDate || ''} onChange={handleChange}/></FormField>
                                <FormField label="Tipo de pago en el SEPA"><div className="flex gap-4 pt-2"><label><input type="radio" name="domiciliationData.sepaType" value="recurrent" checked={formData.domiciliationData?.sepaType === 'recurrent'} onChange={handleChange}/> Pago recurrente</label><label><input type="radio" name="domiciliationData.sepaType" value="single" checked={formData.domiciliationData?.sepaType === 'single'} onChange={handleChange}/> Pago único</label></div></FormField>
                            </FormRow>
                        </CollapsibleSubSection>
                    </div>
                )}
            </FormSection>

            <FormSection title="Autorizaciones">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                        <label className="text-sm text-gray-700 dark:text-gray-300">Autorización para la inclusión en el grupo de Whatsapp de la Extraescolar</label>
                        <div className="flex gap-4 justify-self-start md:justify-self-end"><label><input type="radio" name="authorizations.whatsapp" value="true" checked={formData.authorizations.whatsapp} onChange={handleBooleanRadioChange} /> Sí</label><label><input type="radio" name="authorizations.whatsapp" value="false" checked={!formData.authorizations.whatsapp} onChange={handleBooleanRadioChange} /> No</label></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                        <label className="text-sm text-gray-700 dark:text-gray-300">Autorización para el uso de derecho de imagen</label>
                        <div className="flex gap-4 justify-self-start md:justify-self-end"><label><input type="radio" name="authorizations.imageRights" value="true" checked={formData.authorizations.imageRights} onChange={handleBooleanRadioChange} /> Sí</label><label><input type="radio" name="authorizations.imageRights" value="false" checked={!formData.authorizations.imageRights} onChange={handleBooleanRadioChange} /> No</label></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                        <label className="text-sm text-gray-700 dark:text-gray-300">¿Acepta recibir newsletters comerciales por e-mail?</label>
                        <div className="flex gap-4 justify-self-start md:justify-self-end"><label><input type="radio" name="authorizations.newsletters" value="true" checked={formData.authorizations.newsletters} onChange={handleBooleanRadioChange} /> Sí</label><label><input type="radio" name="authorizations.newsletters" value="false" checked={!formData.authorizations.newsletters} onChange={handleBooleanRadioChange} /> No</label></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                        <label className="text-sm text-gray-700 dark:text-gray-300">¿Tiene autorización para salir solo/a?</label>
                        <div className="flex gap-4 justify-self-start md:justify-self-end"><label><input type="radio" name="authorizations.canLeaveAlone" value="true" checked={formData.authorizations.canLeaveAlone} onChange={handleBooleanRadioChange} /> Sí</label><label><input type="radio" name="authorizations.canLeaveAlone" value="false" checked={!formData.authorizations.canLeaveAlone} onChange={handleBooleanRadioChange} /> No</label></div>
                    </div>
                </div>
            </FormSection>

            {formData.authorizations.canLeaveAlone === false && (
                <FormSection title="Personas autorizadas para recoger al alumno">
                    {[0, 1, 2].map(index => (
                        <FormRow key={index} className="border-t border-gray-200 dark:border-gray-700 pt-4 first:border-t-0 first:pt-0">
                            <FormField label={`Nombre completo - parentesco #${index + 1}`}>
                                <BaseInput name="fullName" value={formData.authorizedPickups?.[index]?.fullName || ''} onChange={(e) => handleAuthorizedPickupChange(index, e)} />
                            </FormField>
                            <FormField label="NIF">
                                <BaseInput name="nif" value={formData.authorizedPickups?.[index]?.nif || ''} onChange={(e) => handleAuthorizedPickupChange(index, e)} onBlur={e => handleValidation(`pickup${index}nif` as keyof ValidationState, e.target.value)} />
                                <ValidationFeedback status={validationStatus[`pickup${index}nif` as keyof ValidationState]} />
                            </FormField>
                        </FormRow>
                    ))}
                </FormSection>
            )}

            <div className="flex justify-end gap-4 p-4 bg-gray-100 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 rounded-b-lg">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit">{student ? 'Actualizar' : 'Crear Alumno'}</Button>
            </div>
        </form>
    );
};

export default StudentForm;
