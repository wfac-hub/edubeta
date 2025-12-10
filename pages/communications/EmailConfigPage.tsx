
import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { Settings, Save, Image as ImageIcon, Layout, Mail, Cake, CheckCircle } from 'lucide-react';
import RichTextEditor from '../../components/ui/RichTextEditor';
import { useNavigate } from 'react-router-dom';
import { AcademyProfile } from '../../types';

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

const EmailConfigPage = () => {
    const { academyProfile, updateAcademyProfile } = useData();
    const [formData, setFormData] = useState(academyProfile);
    const navigate = useNavigate();
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleSave = () => {
        updateAcademyProfile(formData);
        setSuccessMsg("Configuración guardada correctamente");
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const handleFileChange = (field: keyof typeof formData, e: React.ChangeEvent<HTMLInputElement>) => {
         const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (type === 'radio' && (value === 'true' || value === 'false')) {
            setFormData(prev => ({...prev, [name]: value === 'true'}));
        } else if (name === 'sendBirthdayToAllStudents') {
            setFormData(prev => ({...prev, [name]: value as 'active_course' | 'all_active'}));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };
    
    const handleRemoveFile = (field: keyof AcademyProfile) => {
        setFormData(prev => ({ ...prev, [field]: null }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Settings className="text-primary-600" /> Configuración de Comunicaciones
                </h1>
                <div className="flex items-center gap-4">
                    {successMsg && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-fade-in bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-md">
                            <CheckCircle size={16} />
                            {successMsg}
                        </div>
                    )}
                    <Button onClick={handleSave} leftIcon={<Save size={16}/>}>Guardar Cambios</Button>
                </div>
            </div>
            
            {/* 1. Configuración de Envío */}
            <Card title="Configuración de Envío" icon={<Mail size={20}/>}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email Emisor (From)</label>
                        <input 
                            type="email" 
                            name="emailSender" 
                            value={formData.emailSender} 
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">Dirección que verán los destinatarios. Las respuestas llegarán aquí.</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700 text-sm">
                         <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Estado del Servicio</h4>
                         <div className="space-y-1">
                            <p><strong>Probabilidad Spam:</strong> <span className="text-green-600 font-medium">Baja</span></p>
                            <p><strong>SPF:</strong> <span className="text-green-600 font-medium">Verificado</span></p>
                            <p><strong>DKIM:</strong> <span className="text-green-600 font-medium">Activo</span></p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* 2. Apariencia Global */}
            <Card title="Apariencia Global (Plantilla Base)" icon={<Layout size={20}/>}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Header Logo */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Logo Cabecera (Header)</label>
                            <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors relative group">
                                {formData.emailLogoBase64 ? (
                                    <div className="relative">
                                        <img src={formData.emailLogoBase64} alt="Header" className="max-h-32 mx-auto mb-2 object-contain" />
                                        <button onClick={() => handleRemoveFile('emailLogoBase64')} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Settings size={12}/></button>
                                    </div>
                                ) : (
                                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                )}
                                <input type="file" id="header-upload" className="hidden" accept="image/*" onChange={(e) => handleFileChange('emailLogoBase64', e)} />
                                <label htmlFor="header-upload" className="cursor-pointer text-primary-600 text-sm font-medium hover:underline block">
                                    {formData.emailLogoBase64 ? 'Cambiar imagen' : 'Subir imagen'}
                                </label>
                                <p className="text-xs text-gray-500 mt-1">Recomendado: 600px ancho</p>
                            </div>
                        </div>

                        {/* Footer Image */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Imagen Pie (Footer)</label>
                            <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group relative">
                                {formData.emailFooterImageBase64 ? (
                                     <div className="relative">
                                        <img src={formData.emailFooterImageBase64} alt="Footer" className="max-h-32 mx-auto mb-2 object-contain" />
                                    </div>
                                ) : (
                                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                )}
                                <input type="file" id="footer-upload" className="hidden" accept="image/*" onChange={(e) => handleFileChange('emailFooterImageBase64', e)} />
                                <label htmlFor="footer-upload" className="cursor-pointer text-primary-600 text-sm font-medium hover:underline block">
                                     {formData.emailFooterImageBase64 ? 'Cambiar imagen' : 'Subir imagen'}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Texto Legal (Pie de página)</label>
                        <p className="text-xs text-gray-500 mb-2">Se añade automáticamente al final de todos los correos.</p>
                        <RichTextEditor 
                            value={formData.emailFooterText} 
                            onChange={(val) => setFormData(prev => ({...prev, emailFooterText: val}))} 
                            rows={4} 
                        />
                    </div>
            </Card>

            {/* 3. Automatización Cumpleaños */}
            <Card title="Automatización: Cumpleaños" icon={<Cake size={20}/>}>
                <div className="space-y-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-white">Módulo de Cumpleaños de Alumnos</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Activa el envío automático de felicitaciones.</p>
                            </div>
                            <RadioGroup name="studentBirthdayModule" value={String(formData.studentBirthdayModule)} onChange={handleChange} options={[{label: 'Activado', value: 'true'}, {label: 'Desactivado', value: 'false'}]} />
                        </div>
                    </div>

                    {formData.studentBirthdayModule && (
                        <div className="space-y-6 pl-4 border-l-2 border-gray-200 dark:border-slate-700 ml-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">¿A quién enviar felicitación?</label>
                                <RadioGroup name="sendBirthdayToAllStudents" value={formData.sendBirthdayToAllStudents} onChange={handleChange} options={[{label: 'Solo alumnos con curso activo', value: 'active_course'}, {label: 'Todos los alumnos activos (aunque no tengan curso)', value: 'all_active'}]} />
                            </div>

                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Opciones adicionales</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <input type="checkbox" checked={formData.sendStudentBirthdayEmail} onChange={(e) => setFormData(p => ({...p, sendStudentBirthdayEmail: e.target.checked}))} className="rounded text-primary-600 focus:ring-primary-500"/>
                                        Enviar email al alumno
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <input type="checkbox" checked={formData.notifyTeachersBirthdays} onChange={(e) => setFormData(p => ({...p, notifyTeachersBirthdays: e.target.checked}))} className="rounded text-primary-600 focus:ring-primary-500"/>
                                        Notificar a profesores y coordinadores (Dashboard)
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Imagen Felicitación</label>
                                     <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group relative">
                                        {formData.birthdayEmailImageBase64 ? (
                                            <img src={formData.birthdayEmailImageBase64} alt="Birthday" className="max-h-32 mx-auto mb-2 object-contain" />
                                        ) : (
                                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                        )}
                                        <input type="file" id="birthday-upload" className="hidden" accept="image/*" onChange={(e) => handleFileChange('birthdayEmailImageBase64', e)} />
                                        <label htmlFor="birthday-upload" className="cursor-pointer text-primary-600 text-sm font-medium hover:underline block">
                                            {formData.birthdayEmailImageBase64 ? 'Cambiar imagen' : 'Subir imagen'}
                                        </label>
                                    </div>
                                </div>
                                <div>
                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plantilla de Texto</label>
                                     <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded border border-gray-200 dark:border-slate-700">
                                         <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">El asunto y el cuerpo del mensaje se configuran en la sección de Plantillas.</p>
                                         <Button variant="secondary" size="sm" onClick={() => navigate('/communications/templates')}>Editar Plantilla "Felicitación Cumpleaños"</Button>
                                     </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                         <div className="flex justify-between items-center">
                             <div>
                                <h4 className="font-bold text-gray-800 dark:text-white">Módulo de Cumpleaños de Profesores</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Solo notificación interna.</p>
                             </div>
                             <RadioGroup name="teacherBirthdayModule" value={String(formData.teacherBirthdayModule)} onChange={handleChange} options={[{label: 'Activado', value: 'true'}, {label: 'Desactivado', value: 'false'}]} />
                         </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default EmailConfigPage;
