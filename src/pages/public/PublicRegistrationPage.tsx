
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Rocket, Check, Calendar, MapPin, UserPlus, LogIn, ChevronLeft, AlertCircle, CreditCard, ArrowRight } from 'lucide-react';
import { Student, LandingCustomField, Course, Classroom, CourseLevel } from '../../types';
import { getRandomColor, calculateAge, sanitizeHTML } from '../../utils/helpers';
import Modal from '../../components/ui/Modal';

// --- COMPONENTS AUXILIARES ---

const inputBaseClass = "w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-blue-500 focus:ring-blue-200 outline-none transition-all placeholder-gray-400 shadow-sm disabled:bg-gray-100 disabled:text-gray-500";
const labelBaseClass = "block text-sm font-bold text-gray-700 mb-1.5";

const StyledCheckbox = ({ checked, onChange, className = "" }: { checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, className?: string }) => (
    <div className={`relative flex items-center justify-center w-6 h-6 shrink-0 ${className}`}>
        <input 
            type="checkbox" 
            checked={checked} 
            onChange={onChange}
            className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded bg-white checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all duration-200 ease-in-out focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
        <Check size={14} strokeWidth={4} className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200 scale-90 peer-checked:scale-100" />
    </div>
);

const StyledRadio = ({ name, checked, onChange, value, className = "" }: { name: string, checked: boolean, onChange: () => void, value?: string, className?: string }) => (
    <div className={`relative flex items-center justify-center w-6 h-6 shrink-0 ${className}`}>
        <input 
            type="radio" 
            name={name}
            value={value}
            checked={checked} 
            onChange={onChange}
            className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded-full bg-white checked:border-blue-600 cursor-pointer transition-all duration-200 ease-in-out focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
        <div className="absolute w-3 h-3 bg-blue-600 rounded-full pointer-events-none opacity-0 peer-checked:opacity-100 transition-all duration-200 scale-0 peer-checked:scale-100"></div>
    </div>
);

const Steps = ({ current, steps, primaryColor }: { current: number, steps: string[], primaryColor: string }) => (
    <div className="flex justify-center mb-12 overflow-x-auto py-4 hide-scrollbar">
        {steps.map((step, idx) => (
            <div key={idx} className="flex items-center min-w-fit">
                <div 
                    className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-colors duration-300 border-2 shadow-sm`}
                    style={{ 
                        backgroundColor: idx + 1 <= current ? primaryColor : 'white', 
                        borderColor: idx + 1 <= current ? primaryColor : '#e2e8f0', 
                        color: idx + 1 <= current ? 'white' : '#94a3b8'
                    }}
                >
                    {idx + 1 < current ? <Check size={16} strokeWidth={3} /> : idx + 1}
                </div>
                <span className={`ml-2 text-sm font-bold hidden sm:block ${idx + 1 <= current ? 'text-gray-800' : 'text-gray-400'}`}>{step}</span>
                {idx < steps.length - 1 && (
                    <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4`} style={{ backgroundColor: idx + 1 < current ? primaryColor : '#e2e8f0' }}></div>
                )}
            </div>
        ))}
    </div>
);

const InputField = ({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string, error?: string }) => (
    <div className="mb-5">
        <label className={labelBaseClass}>{label} {props.required && <span className="text-red-600">*</span>}</label>
        <input {...props} className={`${inputBaseClass} ${error ? 'border-red-500 focus:ring-red-200' : ''}`} />
        {error && <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>}
    </div>
);

const CustomFieldRenderer: React.FC<{ field: LandingCustomField, value: any, onChange: (val: any) => void }> = ({ field, value, onChange }) => {
    const stringValue = value !== undefined && value !== null ? String(value) : '';

    return (
        <div className="mb-5">
            <label className={labelBaseClass}>
                {field.label} {field.required && <span className="text-red-600">*</span>}
            </label>
            {field.description && <div className="text-xs text-gray-500 mb-2 prose prose-sm text-justify" dangerouslySetInnerHTML={{ __html: sanitizeHTML(String(field.description || '')) }} />}
            
            {field.type === 'text' && <input type="text" className={inputBaseClass} value={stringValue} onChange={e => onChange(e.target.value)} required={field.required} />}
            {field.type === 'textarea' && <textarea className={inputBaseClass} rows={3} value={stringValue} onChange={e => onChange(e.target.value)} required={field.required} />}
            {field.type === 'number' && <input type="number" className={inputBaseClass} value={stringValue} onChange={e => onChange(e.target.value)} required={field.required} />}
            {field.type === 'date' && <input type="date" className={inputBaseClass} value={stringValue} onChange={e => onChange(e.target.value)} required={field.required} />}
            {field.type === 'select' && (
                <select className={inputBaseClass} value={stringValue} onChange={e => onChange(e.target.value)} required={field.required}>
                    <option value="">-- Seleccionar --</option>
                    {(field.options ? String(field.options) : '').split(',').map(opt => <option key={opt} value={opt.trim()}>{opt.trim()}</option>)}
                </select>
            )}
            {field.type === 'boolean' && (
                 <div className="flex gap-6 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer group bg-white px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors shadow-sm">
                        <StyledRadio name={`field_${field.id}`} checked={stringValue === 'Si'} onChange={() => onChange('Si')} />
                        <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">Sí</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group bg-white px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors shadow-sm">
                        <StyledRadio name={`field_${field.id}`} checked={stringValue === 'No'} onChange={() => onChange('No')} />
                        <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">No</span>
                    </label>
                </div>
            )}
        </div>
    );
};

const Avatar: React.FC<{ student: Student }> = ({ student }) => {
    const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();
    const color = getRandomColor(initials);
    
    return (
        <div 
            className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-xs ${color}`}
        >
            {initials}
        </div>
    );
};

const PublicRegistrationPage = () => {
    const { slug } = useParams();
    const { landingPages, courses, addEnrollments, updateStudent, students, authorizations, academyProfile, landingCustomFields, classrooms, locations } = useData();
    
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [viewState, setViewState] = useState<'initial_choice' | 'login' | 'form' | 'success'>('initial_choice');
    
    const [loginEmail, setLoginEmail] = useState('');
    const [loginDni, setLoginDni] = useState('');
    const [loginError, setLoginError] = useState('');

    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
    const [legalModalContent, setLegalModalContent] = useState({ title: '', text: '' });

    const [studentData, setStudentData] = useState({
        id: 0, firstName: '', lastName: '', dni: '', birthDate: '',
        email1: '', phone1: '', email2: '', phone2: '', email3: '', phone3: '',
        address: '', postalCode: '', population: '',
        tutorName: '', tutorNif: '', tutor2Name: '', tutor2Nif: '',
        billingNif: '', billingName: '', billingAddress: '', 
        billingPostalCode: '', billingPopulation: '', billingCountry: 'España', billingClientType: 'physical',
        accountHolder: '', bic: '',
        allergies: '', observations: '', photo: null as File | null,
        customFieldValues: {} as Record<string, any>,
        customField4Label: ''
    });
    
    const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
    const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
    
    const [paymentMethodType, setPaymentMethodType] = useState('');
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

    const landing = useMemo(() => landingPages.find(l => l.slug === slug), [landingPages, slug]);
    
    useEffect(() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
    }, []);

    useEffect(() => {
        if (landing) {
            if (landing.studentAccessMode === 'new_only') {
                setViewState('form');
                setStep(1);
            } else if (landing.studentAccessMode === 'existing_only') {
                setViewState('login');
                setStep(0);
            } else {
                setViewState('initial_choice');
                setStep(0);
            }
            setLoading(false);
        }
    }, [landing, loading]);

    const primaryColor = landing?.styles?.primaryColor || '#3b82f6';
    
    const bgStyle = useMemo(() => {
        if (landing?.styles.heroImageUrl) return { backgroundImage: `url(${landing.styles.heroImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
        if (landing?.styles.backgroundColor) return { backgroundColor: landing.styles.backgroundColor };
        return { backgroundColor: '#f8fafc' }; 
    }, [landing]);

    const offeredCourses = useMemo(() => {
        if (!landing) return [];
        let available: Course[] = [];
        if (landing.courseSelectionMode === 'location') {
             if (!selectedLocationId) return [];
             const locationName = locations.find(l => l.id === selectedLocationId)?.name;
             if(!locationName) return [];
             const locationClassroomIds = classrooms.filter(c => c.location === locationName).map(c => c.id);
             available = courses.filter(c => locationClassroomIds.includes(c.classroomId));
        } else if (landing.courseSelectionMode === 'courses') {
             available = courses.filter(c => landing.offeredCourseIds.includes(c.id));
        } else {
             available = courses; // Default logic fallback
        }
        return available.filter(c => c.isActive && c.onlineAllowed);
    }, [landing, courses, selectedLocationId, locations, classrooms]);

    const customFields = useMemo(() => {
        if (!landing) return [];
        return landingCustomFields.filter(f => f.landingId === landing.id && f.isActive).sort((a,b) => a.order - b.order);
    }, [landing, landingCustomFields]);

    const openPrivacyModal = () => {
        if (!landing) return;
        setLegalModalContent({
            title: landing.privacyPolicy.customTitle || 'Política de Privacidad',
            text: landing.privacyPolicy.useAcademyText ? academyProfile.dataProtectionText : landing.privacyPolicy.customText
        });
        setIsLegalModalOpen(true);
    };

    const handleStartNewStudent = () => {
        setViewState('form');
        setStep(1);
        window.scrollTo(0, 0);
    };

    const handleExistingStudentLogin = () => {
        setViewState('login');
        setLoginError('');
        setLoginEmail('');
        setLoginDni('');
    };
    
    const performLogin = () => {
        const found = students.find(s => 
            (s.email1.toLowerCase() === loginEmail.toLowerCase() || (s.dni && s.dni.toLowerCase() === loginDni.toLowerCase())) 
            && s.isActive
        );

        if (found) {
            setStudentData({
                ...studentData,
                id: found.id,
                firstName: found.firstName,
                lastName: found.lastName,
                dni: found.dni,
                birthDate: found.birthDate,
                email1: found.email1,
                phone1: found.phone1,
                address: found.address,
                postalCode: found.postalCode,
                population: found.population,
                allergies: found.allergies || '',
                customFieldValues: found.customFieldValues || {},
                customField4Label: found.customField4Label || ''
            });
            setViewState('form');
            setStep(1); 
        } else {
            setLoginError('No se ha encontrado ningún alumno activo con esos datos.');
        }
    };

    const handleNextStep = () => {
        if (step < 4) {
            setStep(step + 1);
            window.scrollTo(0, 0);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        const tutors = [];
        if (studentData.tutorName) tutors.push({ fullName: studentData.tutorName, nif: studentData.tutorNif });
        if (studentData.tutor2Name) tutors.push({ fullName: studentData.tutor2Name, nif: studentData.tutor2Nif });

        // Save Student Data
        // Construct student object manually to match Student interface and avoid type mismatch
        const studentToSave: Student = {
            id: studentData.id,
            registrationDate: new Date().toISOString().split('T')[0],
            isActive: true,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            dni: studentData.dni,
            photoUrl: '', // Placeholder as handling file upload is outside scope of type fix
            birthDate: studentData.birthDate,
            email1: studentData.email1,
            email2: studentData.email2,
            email3: studentData.email3,
            phone1: studentData.phone1,
            phone2: studentData.phone2,
            phone3: studentData.phone3,
            address: studentData.address,
            postalCode: studentData.postalCode,
            population: studentData.population,
            allergies: studentData.allergies,
            academicData: '',
            isMinor: calculateAge(studentData.birthDate) < 18,
            tutors: tutors,
            communicationLanguage: 'Español',
            observations: studentData.observations,
            paymentConfig: { 
                type: paymentMethodType || 'Transferencia', 
                periodicity: 'Mensual', 
                hasDiscount: false 
            },
            domiciliationData: { 
                chargeDay: academyProfile.defaultChargeDay,
                accountHolder: studentData.accountHolder,
                iban: '', // IBAN not in studentData state
                bic: studentData.bic,
                acceptanceDate: new Date().toISOString().split('T')[0],
                sepaType: 'recurrent'
            },
            billingData: {
                nif: studentData.billingNif,
                clientType: studentData.billingClientType as 'physical' | 'juridical',
                name: studentData.billingName,
                lastName: '',
                address: studentData.billingAddress,
                postalCode: studentData.billingPostalCode,
                population: studentData.billingPopulation,
                country: studentData.billingCountry
            },
            hasSecondPayer: false,
            authorizations: {
                whatsapp: true,
                imageRights: true,
                newsletters: true,
                canLeaveAlone: false
            },
            status: 'Activo',
            stats: { assistance: 0, receipts: 0, invoices: 0, emails: 0, docs: 0, authorizations: 0 },
            customField4Label: studentData.customField4Label,
            customFieldValues: studentData.customFieldValues
        };

        if (studentData.id === 0) {
            updateStudent(studentToSave); // DataContext handles creation if ID is 0
        } else {
            updateStudent(studentToSave);
        }

        // Create Enrollments
        const enrollmentsToAdd = selectedCourseIds.map(courseId => ({
            studentId: studentData.id || 0, // 0 will be handled if creating new, but for mock context simple append works
            courseId,
            enrollmentDate: new Date().toISOString().split('T')[0],
            isActive: true
        }));

        addEnrollments(enrollmentsToAdd);

        setViewState('success');
        window.scrollTo(0, 0);
    };

    if (loading || !landing) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="min-h-screen font-sans text-slate-800" style={bgStyle}>
            <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl min-h-screen sm:min-h-[auto] sm:my-8 sm:rounded-2xl overflow-hidden border border-gray-100">
                
                {/* HEADER */}
                <div className="bg-white p-6 border-b border-gray-100 flex flex-col items-center text-center">
                    {landing.styles.logoUrl || academyProfile.logoBase64 ? (
                         <img src={landing.styles.logoUrl || academyProfile.logoBase64 || ''} alt="Logo" className="h-16 object-contain mb-4" />
                    ) : (
                        <div className="flex items-center gap-2 text-3xl font-bold text-primary-600 mb-4">
                            <Rocket /> EduBeta
                        </div>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{landing.title}</h1>
                    {landing.description && <div className="mt-3 text-gray-500 text-sm max-w-lg prose prose-sm" dangerouslySetInnerHTML={{__html: sanitizeHTML(landing.description)}} />}
                </div>

                {/* CONTENT */}
                <div className="p-6 sm:p-10">
                    
                    {viewState === 'initial_choice' && (
                        <div className="space-y-8 py-8">
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-bold text-gray-800">¿Ya eres alumno del centro?</h2>
                                <p className="text-gray-500">Selecciona una opción para continuar con la inscripción.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <button 
                                    onClick={handleStartNewStudent}
                                    className="flex flex-col items-center p-8 bg-blue-50 hover:bg-blue-100 border-2 border-blue-100 hover:border-blue-300 rounded-xl transition-all group"
                                >
                                    <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                        <UserPlus size={32} className="text-blue-600" />
                                    </div>
                                    <span className="font-bold text-lg text-blue-900">Soy alumno nuevo</span>
                                    <span className="text-sm text-blue-600/80 mt-1">Quiero darme de alta</span>
                                </button>

                                <button 
                                    onClick={handleExistingStudentLogin}
                                    className="flex flex-col items-center p-8 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-100 hover:border-emerald-300 rounded-xl transition-all group"
                                >
                                    <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                        <LogIn className="w-8 h-8 text-emerald-600" />
                                    </div>
                                    <span className="font-bold text-lg text-emerald-900">Ya soy alumno</span>
                                    <span className="text-sm text-emerald-600/80 mt-1">Acceder a mi ficha</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {viewState === 'login' && (
                        <div className="max-w-md mx-auto py-8">
                            <button onClick={() => setViewState('initial_choice')} className="flex items-center text-gray-400 hover:text-gray-600 mb-6 text-sm font-medium transition-colors">
                                <ChevronLeft size={16} className="mr-1"/> Volver
                            </button>
                            
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Acceso Alumnos</h2>
                                <p className="text-gray-500 text-sm mt-2">Introduce tus datos para identificarte.</p>
                            </div>

                            <div className="space-y-5 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <InputField 
                                    label="Correo electrónico" 
                                    type="email" 
                                    value={loginEmail} 
                                    onChange={e => setLoginEmail(e.target.value)} 
                                    placeholder="tu@email.com"
                                />
                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-gray-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold">O</span>
                                    <div className="flex-grow border-t border-gray-200"></div>
                                </div>
                                <InputField 
                                    label="DNI / NIE" 
                                    type="text" 
                                    value={loginDni} 
                                    onChange={e => setLoginDni(e.target.value)} 
                                    placeholder="12345678X"
                                />
                                
                                {loginError && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                                        <AlertCircle size={16} />
                                        {loginError}
                                    </div>
                                )}

                                <button 
                                    onClick={performLogin}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-200 transition-all transform active:scale-95"
                                >
                                    Acceder
                                </button>
                            </div>
                        </div>
                    )}

                    {viewState === 'form' && (
                        <>
                            <Steps 
                                current={step} 
                                steps={[
                                    landing.stepConfig?.step1Title || "Datos", 
                                    landing.stepConfig?.step2Title || "Extra", 
                                    landing.stepConfig?.step3Title || "Cursos", 
                                    landing.stepConfig?.step4Title || "Pago"
                                ]} 
                                primaryColor={primaryColor} 
                            />

                            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                                {/* Step 1: Datos Básicos */}
                                {step === 1 && (
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 mb-6">{landing.studentDataBlockTitle}</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InputField label="Nombre" value={studentData.firstName} onChange={e => setStudentData({...studentData, firstName: e.target.value})} required />
                                            <InputField label="Apellidos" value={studentData.lastName} onChange={e => setStudentData({...studentData, lastName: e.target.value})} required />
                                            {landing.studentFields.birthDateRequired && <InputField label="Fecha de nacimiento" type="date" value={studentData.birthDate} onChange={e => setStudentData({...studentData, birthDate: e.target.value})} required />}
                                            {landing.studentFields.dniRequired && <InputField label="DNI / NIE" value={studentData.dni} onChange={e => setStudentData({...studentData, dni: e.target.value})} required />}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                                            <InputField label="Email" type="email" value={studentData.email1} onChange={e => setStudentData({...studentData, email1: e.target.value})} required />
                                            <InputField label="Teléfono" type="tel" value={studentData.phone1} onChange={e => setStudentData({...studentData, phone1: e.target.value})} required />
                                        </div>
                                        {landing.studentFields.addressRequired && (
                                            <div className="mt-5 space-y-5">
                                                <InputField label="Dirección" value={studentData.address} onChange={e => setStudentData({...studentData, address: e.target.value})} required />
                                                <div className="grid grid-cols-2 gap-6">
                                                    <InputField label="Código Postal" value={studentData.postalCode} onChange={e => setStudentData({...studentData, postalCode: e.target.value})} required />
                                                    <InputField label="Población" value={studentData.population} onChange={e => setStudentData({...studentData, population: e.target.value})} required />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Step 2: Info Adicional */}
                                {step === 2 && (
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 mb-6">{landing.additionalInfoBlock.title}</h2>
                                        {/* Custom Fields */}
                                        {customFields.map(field => (
                                            <CustomFieldRenderer 
                                                key={field.id} 
                                                field={field} 
                                                value={studentData.customFieldValues[`field_${field.id}`]} 
                                                onChange={val => setStudentData({...studentData, customFieldValues: {...studentData.customFieldValues, [`field_${field.id}`]: val}})} 
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Step 3: Cursos */}
                                {step === 3 && (
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 mb-6">{landing.courseSelectionBlockTitle}</h2>
                                        {offeredCourses.length === 0 ? (
                                            <p className="text-gray-500 italic">No hay cursos disponibles para los criterios seleccionados.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {offeredCourses.map(course => (
                                                    <div 
                                                        key={course.id} 
                                                        onClick={() => {
                                                            if (selectedCourseIds.includes(course.id)) {
                                                                setSelectedCourseIds(prev => prev.filter(id => id !== course.id));
                                                            } else {
                                                                if (!landing.allowMultipleCourses) {
                                                                    setSelectedCourseIds([course.id]);
                                                                } else {
                                                                    setSelectedCourseIds(prev => [...prev, course.id]);
                                                                }
                                                            }
                                                        }}
                                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedCourseIds.includes(course.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                                                    >
                                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedCourseIds.includes(course.id) ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'}`}>
                                                            {selectedCourseIds.includes(course.id) && <Check size={14} strokeWidth={4} />}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900">{course.name}</h4>
                                                            <div className="text-sm text-gray-500 flex flex-wrap gap-3 mt-1">
                                                                {landing.showDates && <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(course.startDate).toLocaleDateString()}</span>}
                                                                {landing.showLocation && <span className="flex items-center gap-1"><MapPin size={12}/> Aula {course.classroomId}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Step 4: Pago y Confirmación */}
                                {step === 4 && (
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 mb-6">{landing.paymentBlockTitle}</h2>
                                        
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <CreditCard className="text-blue-500"/> Método de Pago
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {Object.entries(landing.paymentMethods).filter(([_, active]) => active).map(([key, _]) => (
                                                    <label key={key} className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethodType === key ? 'border-blue-500 bg-white shadow-md' : 'border-gray-200 hover:border-blue-300'}`}>
                                                        <input type="radio" name="paymentMethod" value={key} checked={paymentMethodType === key} onChange={() => setPaymentMethodType(key)} className="hidden" />
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethodType === key ? 'border-blue-500' : 'border-gray-300'}`}>
                                                            {paymentMethodType === key && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                                                        </div>
                                                        <span className="font-medium capitalize">{key}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-8">
                                             <label className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                                <StyledCheckbox checked={acceptedPrivacy} onChange={e => setAcceptedPrivacy(e.target.checked)} className="mt-0.5" />
                                                <span className="text-sm text-gray-600 leading-relaxed">
                                                    {landing.privacyPolicy.checkboxText} <button type="button" onClick={openPrivacyModal} className="text-blue-600 underline font-medium hover:text-blue-800">Leer política.</button>
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex justify-between pt-8 mt-8 border-t border-gray-100">
                                    {step > 0 && (
                                        <button onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-lg font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                                            Atrás
                                        </button>
                                    )}
                                    <button 
                                        onClick={handleNextStep} 
                                        className="px-8 py-3 rounded-lg font-bold text-white shadow-lg shadow-blue-200 hover:shadow-xl transform hover:-translate-y-0.5 transition-all ml-auto flex items-center gap-2"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        {step === 4 ? 'Confirmar Inscripción' : 'Siguiente'} <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                    
                    {viewState === 'success' && (
                        <div className="text-center py-16 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
                                <Check size={40} className="text-green-600" strokeWidth={3} />
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">¡Inscripción realizada!</h2>
                            <p className="text-gray-600 max-w-md mx-auto text-lg">
                                Hemos registrado tu inscripción correctamente. Te hemos enviado un correo electrónico con los detalles.
                            </p>
                             <button onClick={() => window.location.reload()} className="mt-10 px-8 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-lg">
                                Volver al inicio
                            </button>
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-medium">{landing.footerText || academyProfile.publicName}</p>
                </div>
            </div>

            <Modal isOpen={isLegalModalOpen} onClose={() => setIsLegalModalOpen(false)} title={legalModalContent.title}>
                 <div className="prose prose-sm max-w-none p-4 text-gray-600" dangerouslySetInnerHTML={{ __html: sanitizeHTML(legalModalContent.text) }} />
                 <div className="p-4 border-t text-right">
                     <button onClick={() => setIsLegalModalOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium">Cerrar</button>
                 </div>
            </Modal>
        </div>
    );
};

export default PublicRegistrationPage;
