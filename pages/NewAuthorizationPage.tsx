
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';
import Button from '../components/ui/Button';
import { Check, User } from 'lucide-react';
import { getRandomColor } from '../utils/helpers';

const NewAuthorizationPage = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const { students, academyProfile, authorizations, createStudentAuthorization } = useData();

    const student = useMemo(() => students.find(s => s.id === parseInt(studentId || '0')), [students, studentId]);

    const [step, setStep] = useState(1);
    const [wizardSelections, setWizardSelections] = useState<{
        sections: Record<string, boolean>;
        auths: Record<number, boolean>;
        mainEmail: boolean;
        altEmails: string;
    }>({
        sections: {
            'studentSheet': academyProfile.sendStudentSheet,
            'pickupAuth': academyProfile.sendPickupAuthorization,
            'sepa': academyProfile.sendSEPA,
            'terms': academyProfile.sendTermsAndConditions,
            'dataProtection': academyProfile.sendDataProtection
        },
        auths: {},
        mainEmail: true,
        altEmails: ''
    });

    if (!student) {
        return <div className="p-8 text-center">Alumno no encontrado.</div>;
    }

    const initials = `${student.firstName[0]}${student.lastName[0]}`;
    const avatarColor = getRandomColor(initials);

    const handleWizardToggleSection = (key: string) => {
        setWizardSelections(prev => ({
            ...prev,
            sections: { ...prev.sections, [key]: !prev.sections[key] }
        }));
    };

    const handleWizardToggleAuth = (id: number) => {
        setWizardSelections(prev => ({
            ...prev,
            auths: { ...prev.auths, [id]: !prev.auths[id] }
        }));
    };

    const handleWizardSend = () => {
        // This is a simulation. Ideally we would create a single envelope with multiple auths.
        // For now, we create requests for the selected custom authorizations.
        const selectedAuthIds = Object.keys(wizardSelections.auths)
            .filter(k => wizardSelections.auths[parseInt(k)])
            .map(k => parseInt(k));
        
        if (selectedAuthIds.length === 0 && Object.values(wizardSelections.sections).every(v => !v)) {
            alert("Debes seleccionar al menos un apartado o autorización.");
            return;
        }

        // Simulate creation
        if (selectedAuthIds.length === 0) {
            if (academyProfile.defaultAuthorizations.length > 0) {
                 createStudentAuthorization(student.id, academyProfile.defaultAuthorizations[0]);
            } else if(authorizations.length > 0) {
                 createStudentAuthorization(student.id, authorizations[0].id);
            }
        } else {
            selectedAuthIds.forEach(id => createStudentAuthorization(student.id, id));
        }
        
        setStep(3);
    };

    const Step1Content = () => (
        <div className="space-y-6 p-6 bg-white dark:bg-slate-800 rounded-b-md shadow-sm border border-t-0 border-gray-200 dark:border-slate-700">
            <div className="space-y-3">
                <p className="font-bold text-gray-800 dark:text-white text-sm">Selecciona los apartados que se cargarán en el documento. Por defecto vienen seleccionados lo que se han configurado en la plataforma.</p>
                <div className="space-y-2 ml-1">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={wizardSelections.sections['studentSheet']} onChange={() => handleWizardToggleSection('studentSheet')} className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">¿Envío de la ficha de alumno?</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={wizardSelections.sections['pickupAuth']} onChange={() => handleWizardToggleSection('pickupAuth')} className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">¿Envío autorización de recogida?</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={wizardSelections.sections['sepa']} onChange={() => handleWizardToggleSection('sepa')} className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">¿Envío del SEPA?</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={wizardSelections.sections['terms']} onChange={() => handleWizardToggleSection('terms')} className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">¿Envío de términos y condiciones?</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={wizardSelections.sections['dataProtection']} onChange={() => handleWizardToggleSection('dataProtection')} className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">¿Envío de la protección de datos?</span>
                    </label>
                </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                    <p className="font-bold text-gray-800 dark:text-white text-sm">Autorizaciones personalizadas de la academia:</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Selecciona las que quieres mostrar en el documento. Se marcarán como aceptadas según se haya especificado en la ficha del alumno.</p>
                </div>
                <div className="space-y-3 pl-1">
                    {authorizations.map(auth => (
                        <div key={auth.id} className="flex justify-between items-center">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={!!wizardSelections.auths[auth.id]} 
                                    onChange={() => handleWizardToggleAuth(auth.id)}
                                    className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-gray-700 dark:text-gray-300 text-sm">{auth.internalTitle}</span>
                            </label>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <label className="flex items-center gap-1"><input type="radio" disabled checked={true} className="text-gray-400"/> Sí</label>
                                <label className="flex items-center gap-1"><input type="radio" disabled className="text-gray-400"/> No</label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const Step2Content = () => (
        <div className="space-y-6 p-6 bg-white dark:bg-slate-800 rounded-b-md shadow-sm border border-t-0 border-gray-200 dark:border-slate-700">
            <p className="font-bold text-gray-800 dark:text-white text-sm">Selecciona los correos electrónicos que recibirán el enlace con el acceso para firmar el documento.</p>
            
            <div className="bg-gray-50 dark:bg-slate-700/30 border border-gray-200 dark:border-slate-600 p-4 rounded-lg flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${avatarColor}`}>
                    {initials}
                </div>
                <div className="flex-grow">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{student.lastName}, {student.firstName}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${wizardSelections.mainEmail ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={wizardSelections.mainEmail} 
                                onChange={(e) => setWizardSelections(prev => ({...prev, mainEmail: e.target.checked}))}
                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{student.email1} (E-mail 1)</span>
                        </label>
                    </div>
                </div>
            </div>

            <div>
                <label className="block font-bold text-gray-800 dark:text-white mb-2 text-sm">E-mails de recepción alternativos</label>
                <input 
                    type="text" 
                    placeholder="Puedes introducir emails distintos a los configurados (separados por comas)" 
                    className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-primary-500 focus:border-primary-500 text-sm"
                    value={wizardSelections.altEmails}
                    onChange={(e) => setWizardSelections(prev => ({...prev, altEmails: e.target.value}))}
                />
            </div>
        </div>
    );

    const Step3Content = () => (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-b-md shadow-sm border border-t-0 border-gray-200 dark:border-slate-700">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                <Check size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Documento enviado!</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">El documento se ha generado y enviado correctamente a los destinatarios seleccionados.</p>
            <Button onClick={() => navigate(`/students/${student.id}/authorizations`)}>Volver al listado</Button>
        </div>
    );

    const steps = [
        { id: 1, title: "Configuración del documento" },
        { id: 2, title: "Selección de e-mails" },
        { id: 3, title: "Resultado" }
    ];

    const activeStepStyle = "bg-primary-600 text-white";
    const inactiveStepStyle = "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400";
    const completedStepStyle = "bg-primary-700 text-white";

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-primary-900 dark:text-white mb-1">Enviar documento para firmar: {student.lastName}, {student.firstName}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Asistente de envío de peticiones de firma sobre el documento configurado.</p>
            </div>

            <div className="flex w-full bg-gray-100 dark:bg-slate-900 rounded-t-lg overflow-hidden border border-b-0 border-gray-200 dark:border-slate-700">
                {steps.map((s, idx) => {
                    let style = inactiveStepStyle;
                    if (step === s.id) style = activeStepStyle;
                    else if (step > s.id) style = completedStepStyle;

                    return (
                        <div 
                            key={s.id} 
                            className={`flex-1 py-3 px-4 text-center text-sm font-medium relative flex items-center justify-center gap-2 ${style}`}
                        >
                            <span>{s.title}</span>
                            {step > s.id && <Check size={14} />}
                            
                            {/* Arrow effect */}
                            {idx < steps.length - 1 && (
                                <div className={`absolute right-0 top-0 h-full w-4 z-10 translate-x-1/2 skew-x-[20deg] border-r border-white dark:border-slate-800 ${style}`}></div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div>
                {step === 1 && <Step1Content />}
                {step === 2 && <Step2Content />}
                {step === 3 && <Step3Content />}
            </div>

            {step < 3 && (
                <div className="flex justify-between items-center p-4 bg-blue-100 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 rounded-md">
                    <Button variant="danger" onClick={goBack}>Cancelar</Button>
                    <div className="flex gap-3">
                         <Button variant="secondary" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>&lt; Anterior</Button>
                         {step === 1 && <Button onClick={() => setStep(2)}>Siguiente &gt;</Button>}
                         {step === 2 && <Button onClick={handleWizardSend}>Enviar &gt;</Button>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewAuthorizationPage;
