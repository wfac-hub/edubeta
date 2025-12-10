
import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Student, Course, StudentAuthorization } from '../../types';
import { Rocket } from 'lucide-react';
import { sanitizeHTML } from '../../utils/helpers';

const LogoHeader: React.FC = () => {
    const { academyProfile } = useData();
    return (
        <header className="text-center mb-12 print:mb-8">
            {academyProfile.docLogoBase64 || academyProfile.logoBase64 ? (
                <img src={academyProfile.docLogoBase64 || academyProfile.logoBase64 || ''} alt="Logo" className="mx-auto h-20 object-contain mb-4"/>
            ) : (
                <div className="flex justify-center items-center gap-2 text-3xl font-bold text-gray-800 mb-2">
                    <Rocket className="text-primary-500" />
                    <span>{academyProfile.publicName}</span>
                </div>
            )}
        </header>
    );
};

const SheetSection: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className = '' }) => (
  <div className={`mb-10 print:mb-6 break-inside-avoid ${className}`}>
    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b-2 border-gray-700 pb-1 mb-4">{title}</h2>
    {children}
  </div>
);

export interface DynamicDocumentProps {
    student: Student;
    signatureSection?: React.ReactNode;
    studentAuth?: StudentAuthorization;
}

const DynamicDocument: React.FC<DynamicDocumentProps> = ({ student, signatureSection, studentAuth }) => {
    const { academyProfile, courses, enrollments, authorizations } = useData();

    // Logic to determine which courses to show:
    // 1. If studentAuth has a snapshot (it was signed), use that.
    // 2. If not, calculate live active courses from enrollments.
    const displayedCoursesList = React.useMemo(() => {
        if (studentAuth && studentAuth.courseNamesSnapshot && studentAuth.courseNamesSnapshot.length > 0) {
            return studentAuth.courseNamesSnapshot;
        }
        
        return enrollments
            .filter(e => e.studentId === student?.id && e.isActive)
            .map(e => courses.find(c => c.id === e.courseId))
            .filter((c): c is Course => c !== undefined)
            .map(c => c.name);
    }, [student, studentAuth, enrollments, courses]);


    const replacePlaceholders = (text: string) => {
        if (!text) return '';
        return text
            .replace(/#{ACADEMY_NAME}#/g, academyProfile.publicName || '')
            .replace(/#{ACADEMY_EMAIL}#/g, academyProfile.contactEmail || '')
            .replace(/#{ACADEMY_SEPA_CREDITOR_NAME}#/g, academyProfile.sepaCreditorName || '')
            .replace(/#{ACADEMY_ADDRESS}#/g, `${academyProfile.address}, ${academyProfile.postalCode} ${academyProfile.population}` || '')
            .replace(/#{ACADEMY_NIF}#/g, academyProfile.nif || '')
            .replace(/#{STUDENT_FULL_NAME}#/g, `${student.firstName} ${student.lastName}` || '')
            .replace(/#{TUTOR_1_FULL_NAME}#/g, student.tutors?.[0]?.fullName || '')
            .replace(/#{TUTOR_1_NIF}#/g, student.tutors?.[0]?.nif || '');
    };

    // Logic to determine which authorizations to render
    // If studentAuth is provided (specific document view/sign), show THAT specific auth.
    // If not (generic preview), show default auths.
    const authsToRender = React.useMemo(() => {
        if (studentAuth) {
             const specificAuth = authorizations.find(a => a.id === studentAuth.authorizationId);
             return specificAuth ? [specificAuth] : [];
        } else {
             return authorizations.filter(auth => academyProfile.defaultAuthorizations?.includes(auth.id));
        }
    }, [studentAuth, authorizations, academyProfile]);
    
    const SectionWrapper: React.FC<{children: React.ReactNode, isLast?: boolean}> = ({ children, isLast }) => (
        <div className={`mb-16 ${!isLast ? "break-after-page" : ""}`}>
            {children}
            {signatureSection && (
                 <div className="break-before-avoid">
                    {signatureSection}
                </div>
            )}
        </div>
    );

    const allSections = [
        { condition: academyProfile.sendStudentSheet, content: (
            <>
                <LogoHeader />
                <h1 className="text-xl font-bold uppercase tracking-widest text-gray-700 text-center mb-12">Hoja de Matrícula</h1>
                <main>
                    <SheetSection title="Datos Alumno/a">
                        <div className="space-y-2 text-sm">
                            <p><span className="font-semibold">Nombre:</span> {`${student.firstName} ${student.lastName}`}</p>
                            <p><span className="font-semibold">Fecha de nacimiento:</span> {student.birthDate ? new Date(student.birthDate).toLocaleDateString('es-ES') : ''}</p>
                            <p><span className="font-semibold">DNI:</span> {student.dni}</p>
                            <p><span className="font-semibold">Dirección:</span> {`${student.address}, ${student.postalCode} ${student.population}`}</p>
                            {student.tutors?.[0]?.fullName && <p><span className="font-semibold">Tutor/a 1:</span> {student.tutors[0].fullName} ({student.tutors[0].nif})</p>}
                            {student.tutors?.[1]?.fullName && <p><span className="font-semibold">Tutor/a 2:</span> {student.tutors[1].fullName} ({student.tutors[1].nif})</p>}
                            <p><span className="font-semibold">Teléfono 1:</span> {student.phone1}</p>
                            <p><span className="font-semibold">E-mail 1:</span> {student.email1}</p>
                            {student.allergies && <p><span className="font-semibold">Enfermedades - alergias:</span> {student.allergies}</p>}
                        </div>
                    </SheetSection>
                    
                    {academyProfile.studentSheetIncludesPaymentConditions && (
                        <SheetSection title="Configuración de Pagos">
                            <div className="space-y-2 text-sm">
                                <p><span className="font-semibold">Tipo de pago:</span> {student.paymentConfig.type}</p>
                                <p><span className="font-semibold">Periodicidad de pago:</span> {student.paymentConfig.periodicity}</p>
                                <p><span className="font-semibold">Titular cuenta:</span> {student.domiciliationData?.accountHolder}</p>
                                <p><span className="font-semibold">IBAN:</span> {student.domiciliationData?.iban}</p>
                                <p><span className="font-semibold">BIC:</span> {student.domiciliationData?.bic}</p>
                            </div>
                        </SheetSection>
                    )}

                    <SheetSection title="Cursos Activos">
                        <div className="text-sm">
                            <ul className="list-disc list-inside space-y-1">
                                {displayedCoursesList.map((name, idx) => <li key={idx}>{name}</li>)}
                                {displayedCoursesList.length === 0 && <li className="text-gray-500">No está inscrito en cursos activos.</li>}
                            </ul>
                        </div>
                    </SheetSection>
                </main>
            </>
        )},
        { condition: academyProfile.sendPickupAuthorization, content: (
            <>
                <LogoHeader />
                <h1 className="text-xl font-bold uppercase tracking-widest text-gray-700 text-center mb-12">Autorización de Recogida</h1>
                <main>
                    {student.authorizations.canLeaveAlone ? (
                        <p className="text-center text-lg text-gray-900">El alumno/a <strong>PUEDE</strong> irse solo/a.</p>
                    ) : (
                        <div>
                            <p className="text-gray-900">El alumno/a <strong>NO puede</strong> irse solo/a. Personas autorizadas a recoger al alumno:</p>
                            <table className="w-full mt-4 text-sm text-left">
                                <thead className="border-b-2 border-gray-700"><tr className="text-gray-900"><th className="py-2">Nombre y apellidos - Parentesco</th><th className="py-2">DNI / NIF</th></tr></thead>
                                <tbody>
                                    {student.authorizedPickups?.filter(p => p.fullName).map((p, i) => (
                                        <tr key={i} className="border-b border-gray-300 text-gray-900"><td className="py-2">{p.fullName}</td><td className="py-2">{p.nif}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </>
        )},
        { condition: academyProfile.sendSEPA && student.paymentConfig.type === 'Domiciliado', content: (
             <>
                <LogoHeader />
                <h1 className="text-xl font-bold uppercase tracking-widest text-gray-700 text-center mb-12">Orden de domiciliación endeudamiento recurrente SEPA</h1>
                <main>
                    <div className="text-xs space-y-3 text-justify">
                        <p>Referencia de la orden de domiciliación: <span className="font-mono">MANDATO-REF-{student.id}</span></p>
                        <p>Identificador del acreedor: <span className="font-mono">{academyProfile.sepaCreditorId}</span></p>
                        <p>Nombre del acreedor: {academyProfile.sepaCreditorName}</p>
                        <p>Dirección: {academyProfile.sepaCreditorAddress}</p>
                        <p>País: España</p>
                        <p className="mt-4">Mediante la firma de esta orden de domiciliación, el deudor autoriza (A) al acreedor a enviar instrucciones a la entidad del deudor para cargar su cuenta y (B) a la entidad para efectuar los cargos en su cuidado siguiendo las instrucciones del acreedor. Como parte de sus derechos, el deudor está legitimado en el reembolso por su entidad en los términos y condiciones del contrato suscrito con la misma. La solicitud de reembolso debe efectuarse dentro de las ocho semanas que siguen a la fecha de cargo en cuenta. Puede obtener información adicional sobre sus derechos en su entidad financiera.</p>
                    </div>
                    <div className="mt-8 space-y-2 text-sm">
                        <p><span className="font-semibold">Nombre del deudor/a:</span> {student.domiciliationData?.accountHolder}</p>
                        <p><span className="font-semibold">Dirección del deudor/a:</span> {student.address}</p>
                        <p><span className="font-semibold">Código postal - Población:</span> {`${student.postalCode} - ${student.population}`}</p>
                        <p><span className="font-semibold">País del deudor/a:</span> España</p>
                        <p><span className="font-semibold">Swift BIC:</span> {student.domiciliationData?.bic}</p>
                        <p><span className="font-semibold">Número de cuenta - IBAN:</span> {student.domiciliationData?.iban}</p>
                    </div>
                    <div className="mt-6 flex justify-between text-sm">
                        <label className="flex items-center"><input type="checkbox" checked={student.domiciliationData?.sepaType === 'recurrent'} readOnly className="mr-2"/> Pago recurrente</label>
                        <label className="flex items-center"><input type="checkbox" checked={student.domiciliationData?.sepaType === 'single'} readOnly className="mr-2"/> Pago único</label>
                    </div>
                </main>
            </>
        )},
        { condition: academyProfile.sendTermsAndConditions, content: (
            <>
                <LogoHeader />
                <h1 className="text-xl font-bold uppercase tracking-widest text-gray-700 text-center mb-12">{academyProfile.termsAndConditionsTextTitle}</h1>
                <main>
                    <div className="text-xs space-y-2 text-justify prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHTML(replacePlaceholders(academyProfile.termsAndConditionsText)) }}></div>
                </main>
            </>
        )},
        { condition: academyProfile.sendDataProtection, content: (
             <>
                <LogoHeader />
                <h1 className="text-xl font-bold uppercase tracking-widest text-gray-700 text-center mb-12">{academyProfile.dataProtectionTextTitle}</h1>
                <main>
                    <div className="text-xs space-y-2 text-justify prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHTML(replacePlaceholders(academyProfile.dataProtectionText)) }}></div>
                </main>
            </>
        )},
        ...authsToRender.map(auth => ({
            condition: true,
            content: (
                 <>
                    <LogoHeader />
                    <h1 className="text-xl font-bold uppercase tracking-widest text-gray-700 text-center mb-12">{auth.internalTitle}</h1>
                    <main>
                         <div className="text-xs space-y-2 text-justify prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHTML(replacePlaceholders(auth.documentText)) }}></div>
                    </main>
                </>
            )
        }))
    ];

    const visibleSections = allSections.filter(s => s.condition);

    return (
        <div className="text-gray-900">
            {visibleSections.map((section, index) => (
                <SectionWrapper key={index} isLast={index === visibleSections.length - 1}>
                    {section.content}
                </SectionWrapper>
            ))}
        </div>
    );
};

export default DynamicDocument;
