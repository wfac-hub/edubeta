
// @ts-nocheck
import { 
    User, Role, ActivityLog, Population, Location, WeekSchedule, Classroom, Holiday, 
    LevelGroup, CourseLevel, Teacher, Course, Student, Enrollment, Receipt, Invoice, 
    LedgerEntry, AttendanceRecord, CourseClass, AcademyProfile, Resource, WaitingListEntry, 
    AuthorizationGroup, Authorization, StudentAuthorization, StudentHistoryEntry, StudentTag, 
    BillingCenter, BillingClient, ProformaInvoice, Quote, DocumentType, DefaultConcept, 
    FiscalModel, FiscalConfig, WikiCategory, WikiClass, WikiLesson, TeacherPermission, 
    TaughtSession, LandingPage, LandingCustomField, Report, PredefinedComment, CommentTag, 
    EmailTemplate, CommunicationLog, BankAccount, BillingSeries, BillingPaymentMethod,
    StoredFile
} from '../types';

// --- GENERADORES DE DATOS ALEATORIOS ---
const FIRST_NAMES = ['Hugo', 'Mateo', 'Martin', 'Lucas', 'Leo', 'Daniel', 'Alejandro', 'Manuel', 'Pablo', 'Alvaro', 'Lucia', 'Sofia', 'Martina', 'Maria', 'Julia', 'Paula', 'Valeria', 'Emma', 'Daniela', 'Carla', 'Juan', 'Pedro', 'Ana', 'Isabel', 'Laura', 'David', 'Sergio', 'Javier', 'Carlos', 'Miguel'];
const LAST_NAMES = ['Garcia', 'Rodriguez', 'Gonzalez', 'Fernandez', 'Lopez', 'Martinez', 'Sanchez', 'Perez', 'Gomez', 'Martin', 'Jimenez', 'Ruiz', 'Hernandez', 'Diaz', 'Moreno', 'Muñoz', 'Alvarez', 'Romero', 'Alonso', 'Gutierrez', 'Navarro', 'Torres', 'Dominguez', 'Vazquez', 'Ramos', 'Gil', 'Ramirez', 'Serrano', 'Blanco', 'Molina'];
const CITIES = ['Madrid', 'Móstoles', 'Alcalá de Henares', 'Fuenlabrada', 'Leganés', 'Getafe', 'Alcorcón', 'Torrejón de Ardoz', 'Parla', 'Alcobendas'];

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const generateNIF = () => {
    const num = getRandomInt(10000000, 99999999);
    const letters = "TRWAGMYFPDXBNJZSQVHLCKE";
    return `${num}${letters[num % 23]}`;
};

const generateIBAN = () => {
    return `ES${getRandomInt(10, 99)} ${getRandomInt(1000, 9999)} ${getRandomInt(1000, 9999)} ${getRandomInt(10, 99)} ${getRandomInt(1000000000, 9999999999)}`;
};

// --- CONFIGURACIÓN DE FECHAS ---
const TODAY = new Date();
const CURRENT_YEAR = TODAY.getMonth() < 7 ? TODAY.getFullYear() - 1 : TODAY.getFullYear();
const COURSE_START_DATE = `${CURRENT_YEAR}-10-01`;
const COURSE_END_DATE = `${CURRENT_YEAR + 1}-06-30`;

// --- MOCKS EXISTENTES (Se mantienen para modo local) ---
export const MOCK_USERS: User[] = [
    { id: 1, name: 'Admin', email: 'admin@edubeta.com', role: Role.ADMIN, avatar: 'https://i.pravatar.cc/150?u=admin', status: 'active', lastLogin: new Date().toISOString(), permissions: { centerManagement: true, academicManagement: true, financialManagement: true, reports: true, settings: true, users: true } },
    { id: 2, name: 'Marta', lastName: 'Coordinadora', email: 'coord@edubeta.com', role: Role.COORDINATOR, avatar: 'https://i.pravatar.cc/150?u=coord', status: 'active', lastLogin: new Date().toISOString(), permissions: { centerManagement: true, academicManagement: true, financialManagement: false, reports: true, settings: true, users: true } },
    { id: 3, name: 'Carlos', lastName: 'Profesor', email: 'carlos@edubeta.com', role: Role.TEACHER, avatar: 'https://i.pravatar.cc/150?u=teacher1', status: 'active', lastLogin: new Date().toISOString(), permissions: { centerManagement: false, academicManagement: false, financialManagement: false, reports: false, settings: false, users: false } },
    { id: 4, name: 'Laura', lastName: 'Financiera', email: 'finance@edubeta.com', role: Role.FINANCIAL_MANAGER, avatar: 'https://i.pravatar.cc/150?u=finance', status: 'active', lastLogin: new Date().toISOString(), permissions: { centerManagement: false, academicManagement: true, financialManagement: true, reports: true, settings: false, users: false } },
    { id: 5, name: 'Elena', lastName: 'Maestra', email: 'elena@edubeta.com', role: Role.TEACHER, avatar: 'https://i.pravatar.cc/150?u=teacher2', status: 'active', lastLogin: new Date().toISOString(), permissions: { centerManagement: false, academicManagement: false, financialManagement: false, reports: false, settings: false, users: false } },
    { id: 6, name: 'Sergio', lastName: 'Docente', email: 'sergio@edubeta.com', role: Role.TEACHER, avatar: 'https://i.pravatar.cc/150?u=teacher3', status: 'active', lastLogin: new Date().toISOString(), permissions: { centerManagement: false, academicManagement: false, financialManagement: false, reports: false, settings: false, users: false } },
];

export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
    { id: 'log-1', date: new Date().toISOString(), action: 'Inicio de sesión', details: 'IP: 192.168.1.1' }
];

export const MOCK_POPULATIONS: Population[] = CITIES.map((city, idx) => ({
    id: idx + 1, name: city, province: 'Madrid', country: 'España', studentCount: 0 
}));

export const MOCK_LOCATIONS: Location[] = [
    { id: 1, name: 'Sede Principal', population: 'Madrid', isExternal: false, classroomCount: 3 },
    { id: 2, name: 'Anexo Norte', population: 'Alcobendas', isExternal: false, classroomCount: 2 },
];

export const MOCK_CLASSROOMS: Classroom[] = [
    { id: 1, name: 'Aula 1 (Piano)', location: 'Sede Principal', color: '#3b82f6', courseCount: 0, capacity: 15 },
    { id: 2, name: 'Aula 2 (Teoría)', location: 'Sede Principal', color: '#10b981', courseCount: 0, capacity: 25 },
    { id: 3, name: 'Aula 3 (Grupal)', location: 'Sede Principal', color: '#f97316', courseCount: 0, capacity: 10 },
    { id: 4, name: 'Aula Norte A', location: 'Anexo Norte', color: '#a855f7', courseCount: 0, capacity: 20 },
    { id: 5, name: 'Aula Norte B', location: 'Anexo Norte', color: '#ef4444', courseCount: 0, capacity: 20 },
];

export const MOCK_WEEK_SCHEDULES: WeekSchedule[] = [
    { id: 1, name: 'Lunes y Miércoles 16:00', day: 'Lunes', startTime: '16:00', endTime: '17:30' },
    { id: 2, name: 'Lunes y Miércoles 17:30', day: 'Lunes', startTime: '17:30', endTime: '19:00' },
    { id: 3, name: 'Martes y Jueves 16:00', day: 'Martes', startTime: '16:00', endTime: '17:30' },
    { id: 4, name: 'Martes y Jueves 17:30', day: 'Martes', startTime: '17:30', endTime: '19:00' },
    { id: 5, name: 'Viernes Intensivo', day: 'Viernes', startTime: '16:00', endTime: '19:00' },
    { id: 6, name: 'Lu-Mi 16:00 (Mi)', day: 'Miércoles', startTime: '16:00', endTime: '17:30' },
    { id: 7, name: 'Lu-Mi 17:30 (Mi)', day: 'Miércoles', startTime: '17:30', endTime: '19:00' },
    { id: 8, name: 'Ma-Ju 16:00 (Ju)', day: 'Jueves', startTime: '16:00', endTime: '17:30' },
    { id: 9, name: 'Ma-Ju 17:30 (Ju)', day: 'Jueves', startTime: '17:30', endTime: '19:00' },
];

export const MOCK_HOLIDAYS: Holiday[] = [
    { id: 1, name: 'Navidad', date: { type: 'range', startDate: `${CURRENT_YEAR}-12-23`, endDate: `${CURRENT_YEAR + 1}-01-07` } },
    { id: 2, name: 'Semana Santa', date: { type: 'range', startDate: `${CURRENT_YEAR + 1}-04-14`, endDate: `${CURRENT_YEAR + 1}-04-20` } },
    { id: 3, name: 'Día del trabajador', date: { type: 'specific', day: 1, month: 5, year: CURRENT_YEAR + 1 } },
];

export const MOCK_LEVEL_GROUPS: LevelGroup[] = [
    { id: 1, name: 'Música y Movimiento', emoji: '🎵' },
    { id: 2, name: 'Instrumento', emoji: '🎻' },
    { id: 3, name: 'Lenguaje Musical', emoji: '🎼' },
];

export const MOCK_COURSE_LEVELS: CourseLevel[] = [
    { id: 1, groupId: 1, name: 'Iniciación Musical', monthlyPrice: 45, quarterlyPrice: 120, singlePrice: 15, materialPrice: 30, enrollmentPrice: 20, reportType: 'Boletín', isActive: true, order: 1, allowMonthlyPayment: true, allowQuarterlyPayment: true, allowSinglePayment: false },
    { id: 2, groupId: 2, name: 'Instrumento Básico', monthlyPrice: 75, quarterlyPrice: 210, singlePrice: 25, materialPrice: 40, enrollmentPrice: 30, reportType: 'Standard', isActive: true, order: 2, allowMonthlyPayment: true, allowQuarterlyPayment: true, allowSinglePayment: true },
    { id: 3, groupId: 2, name: 'Instrumento Avanzado', monthlyPrice: 90, quarterlyPrice: 250, singlePrice: 30, materialPrice: 40, enrollmentPrice: 30, reportType: 'Standard', isActive: true, order: 3, allowMonthlyPayment: true, allowQuarterlyPayment: true, allowSinglePayment: true },
    { id: 4, groupId: 3, name: 'Lenguaje Musical Grado 1', monthlyPrice: 50, quarterlyPrice: 140, singlePrice: 20, materialPrice: 25, enrollmentPrice: 20, reportType: 'Standard', isActive: true, order: 4, allowMonthlyPayment: true, allowQuarterlyPayment: true, allowSinglePayment: false },
];

export const MOCK_TEACHERS: Teacher[] = [
    { id: 3, name: 'Carlos', lastName: 'García', email: 'carlos@edubeta.com', nif: generateNIF(), photoUrl: 'https://i.pravatar.cc/150?u=3', birthDate: '1985-05-20', isActive: true, platformLanguage: 'Español', phone: '600123456', address: 'Calle Mayor 1', postalCode: '28001', population: 'Madrid', permissions: { canSendEmails: true, canSendReports: true, canEditStudentAreaComments: true, canCreateManualClasses: false, canManageCourseDocs: true, canViewStudentList: true }, contract: { hours: 20, isFreelance: false, socialSecurityNumber: '281234567890', startDate: '2020-09-01', iban: generateIBAN() }, observations: 'Piano y Lenguaje Musical' },
    { id: 5, name: 'Elena', lastName: 'Maestra', email: 'elena@edubeta.com', nif: generateNIF(), photoUrl: 'https://i.pravatar.cc/150?u=5', birthDate: '1990-11-15', isActive: true, platformLanguage: 'Español', phone: '600654321', address: 'Avda Libertad 2', postalCode: '28002', population: 'Madrid', permissions: { canSendEmails: false, canSendReports: true, canEditStudentAreaComments: false, canCreateManualClasses: false, canManageCourseDocs: false, canViewStudentList: true }, contract: { hours: 15, isFreelance: true, startDate: '2021-01-10', iban: generateIBAN() }, observations: 'Violín y Orquesta' },
    { id: 6, name: 'Sergio', lastName: 'Docente', email: 'sergio@edubeta.com', nif: generateNIF(), photoUrl: 'https://i.pravatar.cc/150?u=6', birthDate: '1982-03-25', isActive: true, platformLanguage: 'Español', phone: '600987654', address: 'Plaza España 3', postalCode: '28003', population: 'Madrid', permissions: { canSendEmails: true, canSendReports: true, canEditStudentAreaComments: true, canCreateManualClasses: true, canManageCourseDocs: true, canViewStudentList: true }, contract: { hours: 25, isFreelance: false, socialSecurityNumber: '289876543210', startDate: '2019-09-01', iban: generateIBAN() }, observations: 'Guitarra y Combo' },
];

// --- CURSOS ---
const courseDefinitions = [
    { name: 'Piano Iniciación A', level: 'Iniciación Musical', teacher: 3, classroom: 1, schedules: [1, 6] },
    { name: 'Piano Iniciación B', level: 'Iniciación Musical', teacher: 3, classroom: 1, schedules: [2, 7] },
    { name: 'Violín Básico', level: 'Instrumento Básico', teacher: 5, classroom: 3, schedules: [3, 8] },
    { name: 'Orquesta Infantil', level: 'Instrumento Básico', teacher: 5, classroom: 4, schedules: [5] },
    { name: 'Guitarra Rock', level: 'Instrumento Avanzado', teacher: 6, classroom: 5, schedules: [4, 9] },
    { name: 'Lenguaje Musical I', level: 'Lenguaje Musical Grado 1', teacher: 3, classroom: 2, schedules: [1, 6] },
    { name: 'Lenguaje Musical II', level: 'Lenguaje Musical Grado 1', teacher: 3, classroom: 2, schedules: [2, 7] },
    { name: 'Combo Jazz', level: 'Instrumento Avanzado', teacher: 6, classroom: 5, schedules: [5] },
];

export const MOCK_COURSES: Course[] = courseDefinitions.map((def, idx) => ({
    id: idx + 1,
    name: def.name,
    alternativeName: '',
    description: `Curso de ${def.name} para el curso ${CURRENT_YEAR}/${CURRENT_YEAR+1}`,
    level: def.level,
    duration: '9 meses',
    teacherId: def.teacher,
    modality: 'Presencial',
    scheduleIds: def.schedules,
    classroomId: def.classroom,
    minCapacity: 4,
    maxCapacity: 12,
    status: 'Activo',
    startDate: COURSE_START_DATE,
    endDate: COURSE_END_DATE,
    isActive: true,
    classesCount: 0,
    resourcesCount: 0,
    standbyStudents: 0,
    onlineAllowed: true,
    onlineLimit: 2,
    allowWaitingList: true,
    paymentRequired: true
}));

// --- ALUMNOS ---
const STUDENTS_COUNT = 100;
const generatedStudents: Student[] = [];

for (let i = 1; i <= STUDENTS_COUNT; i++) {
    const firstName = getRandomItem(FIRST_NAMES);
    const lastName = getRandomItem(LAST_NAMES) + ' ' + getRandomItem(LAST_NAMES);
    const isMinor = Math.random() > 0.3;
    const birthYear = isMinor ? getRandomInt(CURRENT_YEAR - 16, CURRENT_YEAR - 5) : getRandomInt(1980, CURRENT_YEAR - 19);
    const city = getRandomItem(CITIES);
    
    generatedStudents.push({
        id: i,
        registrationDate: getRandomDate(new Date(`${CURRENT_YEAR}-09-01`), new Date()).toISOString(),
        isActive: true,
        firstName,
        lastName,
        dni: generateNIF(),
        photoUrl: `https://i.pravatar.cc/150?u=${i + 100}`,
        birthDate: `${birthYear}-${String(getRandomInt(1, 12)).padStart(2,'0')}-${String(getRandomInt(1, 28)).padStart(2,'0')}`,
        email1: `${firstName.toLowerCase()}.${lastName.split(' ')[0].toLowerCase()}@email.com`,
        phone1: `6${getRandomInt(10000000, 99999999)}`,
        address: `Calle ${getRandomItem(['Mayor', 'Real', 'Sol', 'Luna', 'Estrella'])}, ${getRandomInt(1, 100)}`,
        postalCode: `280${getRandomInt(10, 99)}`,
        population: city,
        isMinor,
        tutors: isMinor ? [{ nif: generateNIF(), fullName: `Padre/Madre de ${firstName}` }] : [],
        communicationLanguage: 'Español',
        paymentConfig: { 
            type: Math.random() > 0.2 ? 'Domiciliado' : 'Transferencia', 
            periodicity: 'Mensual', 
            hasDiscount: Math.random() > 0.9 
        },
        domiciliationData: { 
            chargeDay: 5, 
            accountHolder: isMinor ? `Tutor de ${firstName}` : `${firstName} ${lastName}`, 
            iban: generateIBAN(), 
            bic: 'CAIXESBBXXX', 
            acceptanceDate: '2024-09-01', 
            sepaType: 'recurrent' 
        },
        hasSecondPayer: false,
        authorizations: { whatsapp: true, imageRights: Math.random() > 0.2, newsletters: true, canLeaveAlone: !isMinor },
        status: 'Activo',
        stats: { assistance: 0, receipts: 0, invoices: 0, emails: 0, docs: 0, authorizations: 0 },
        customField4Label: ''
    });
}
export const MOCK_STUDENTS = generatedStudents;

// --- INSCRIPCIONES Y CLASES ---
const generatedEnrollments: Enrollment[] = [];
const generatedCourseClasses: CourseClass[] = [];
const generatedReceipts: Receipt[] = [];
const generatedInvoices: Invoice[] = [];
const generatedAttendance: AttendanceRecord[] = [];

let enrollmentIdCounter = 1;
let receiptIdCounter = 1;
let invoiceIdCounter = 1;

// 1. Generar Días de Clase
MOCK_COURSES.forEach(course => {
    const schedules = MOCK_WEEK_SCHEDULES.filter(s => course.scheduleIds.includes(s.id));
    const startDate = new Date(COURSE_START_DATE);
    const endDate = new Date(COURSE_END_DATE);
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay(); 
        const dayMap: Record<string, number> = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 0 };
        
        schedules.forEach(sch => {
            if (dayMap[sch.day] === dayOfWeek) {
                const classDate = new Date(currentDate);
                if (classDate.getMonth() === 11 && classDate.getDate() > 23) return; 
                
                const classId = `${course.id}-${classDate.toISOString().split('T')[0]}`;
                const isDone = classDate < TODAY;
                generatedCourseClasses.push({
                    id: classId,
                    courseId: course.id,
                    date: classDate,
                    startTime: sch.startTime,
                    endTime: sch.endTime,
                    teacherId: course.teacherId,
                    isSubstitution: false,
                    status: isDone ? 'Hecha' : 'Pendiente',
                    attendanceInitialized: isDone
                });
            }
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    course.classesCount = generatedCourseClasses.filter(c => c.courseId === course.id).length;
});

export const MOCK_COURSE_CLASSES = generatedCourseClasses;

// 2. Inscribir alumnos
MOCK_STUDENTS.forEach(student => {
    const numCourses = Math.random() > 0.8 ? 2 : 1;
    const enrolledCourses: Course[] = [];
    
    for(let i=0; i<numCourses; i++) {
        let course = getRandomItem(MOCK_COURSES);
        while(enrolledCourses.includes(course)) course = getRandomItem(MOCK_COURSES);
        enrolledCourses.push(course);
        
        generatedEnrollments.push({
            id: enrollmentIdCounter++,
            studentId: student.id,
            courseId: course.id,
            enrollmentDate: COURSE_START_DATE,
            isActive: true
        });

        const start = new Date(COURSE_START_DATE);
        const end = new Date();
        let loopDate = new Date(start);
        const level = MOCK_COURSE_LEVELS.find(l => l.name === course.level);
        const amount = level ? level.monthlyPrice : 50;

        while(loopDate <= end) {
            const receiptId = receiptIdCounter++;
            const isPaid = loopDate.getMonth() < end.getMonth(); 
            const receiptDateStr = loopDate.toISOString().split('T')[0];
            
            generatedReceipts.push({
                id: receiptId,
                receiptDate: receiptDateStr,
                studentId: student.id,
                courseId: course.id,
                concept: `Mensualidad ${loopDate.toLocaleString('es-ES', { month: 'long' })} - ${course.name}`,
                amount: amount,
                status: isPaid ? 'Cobrado' : 'Pendiente',
                paymentType: student.paymentConfig.type,
                invoiceNeeded: true,
                isSent: isPaid,
                isInvoiceGenerated: isPaid,
                invoiceId: isPaid ? invoiceIdCounter : undefined,
                paymentDate: isPaid ? receiptDateStr : undefined,
                domiciliationDate: student.paymentConfig.type === 'Domiciliado' ? receiptDateStr : undefined,
                centerId: 1
            });

            if (isPaid) {
                generatedInvoices.push({
                    id: invoiceIdCounter++,
                    type: 'issued',
                    series: '2024',
                    number: invoiceIdCounter,
                    invoiceCode: `2024-${String(invoiceIdCounter).padStart(4, '0')}`,
                    date: receiptDateStr,
                    dueDate: receiptDateStr,
                    clientId: student.id,
                    concept: `Mensualidad ${loopDate.toLocaleString('es-ES', { month: 'long' })}`,
                    baseAmount: amount,
                    vatRate: 0,
                    vatAmount: 0,
                    irpfRate: 0,
                    irpfAmount: 0,
                    totalAmount: amount,
                    status: 'Paid',
                    paymentDate: receiptDateStr,
                    paymentMethod: student.paymentConfig.type,
                    linkedReceiptIds: [receiptId],
                    centerId: 1
                });
            }
            loopDate.setMonth(loopDate.getMonth() + 1);
        }

        const recentClasses = generatedCourseClasses.filter(c => 
            c.courseId === course.id && 
            c.date < TODAY && 
            c.date > new Date(TODAY.getTime() - 30 * 24 * 60 * 60 * 1000)
        );

        recentClasses.forEach(c => {
            const attended = Math.random() > 0.1; 
            const isDone = c.status === 'Hecha';
            generatedAttendance.push({
                id: `${student.id}-${c.id}`,
                classId: c.id,
                studentId: student.id,
                attended: attended,
                // Use string literal types compatible with the updated interface
                status: isDone ? 'Realizado' : (c.status === 'Anulada' ? 'Anulado' : 'Pendiente'),
                late: attended && Math.random() > 0.9 ? '5 minutos tarde' : 'No',
                absenceJustified: !attended && Math.random() > 0.5,
                homeworkDone: attended && Math.random() > 0.2,
                comments: ''
            });
        });
    }
});

export const MOCK_ENROLLMENTS = generatedEnrollments;
export const MOCK_RECEIPTS = generatedReceipts;
export const MOCK_INVOICES = generatedInvoices;
export const MOCK_ATTENDANCE_RECORDS = generatedAttendance;

export const MOCK_LEDGER_ENTRIES: LedgerEntry[] = [
  { id: 1, date: '2024-01-15', account: '430000', concept: 'Factura F-2024-001', debit: 120.50, credit: 0 },
  { id: 2, date: '2024-01-15', account: '705000', concept: 'Ingresos por servicios', debit: 0, credit: 100.00 },
  { id: 3, date: '2024-01-15', account: '477000', concept: 'IVA Repercutido', debit: 0, credit: 20.50 },
];

// --- OTROS MOCKS ---
export const MOCK_ACADEMY_PROFILE: AcademyProfile = {
  id: 1,
  publicName: 'EduBeta Academy',
  website: 'www.edubeta.com',
  contactEmail: 'contacto@edubeta.com',
  contactPhone: '912345678',
  address: 'Calle de la Innovación, 42',
  population: 'Madrid',
  postalCode: '28080',
  nif: 'B12345678',
  sepaCreditorId: 'ES98765B12345678',
  sepaCreditorName: 'EDUBETA ACADEMY SL',
  sepaCreditorAddress: 'Calle de la Innovación, 42, 28080 Madrid',
  logoBase64: null,
  docLogoBase64: null,
  directorSignatureBase64: null,
  emailSender: 'no-reply@edubeta.com',
  emailLogoBase64: null,
  emailFooterImageBase64: null,
  emailFooterText: 'Este es un email automático. Por favor, no respondas a este correo.',
  studentBirthdayModule: true,
  notifyTeachersBirthdays: true,
  sendStudentBirthdayEmail: true,
  sendBirthdayToAllStudents: 'active_course',
  birthdayEmailImageBase64: null,
  birthdayEmailSubject: '¡Feliz Cumpleaños!',
  birthdayEmailText: '¡Todo el equipo de EduBeta te desea un feliz día!',
  teacherBirthdayModule: true,
  paysRenovationEnrollment: false,
  enrollmentReceiptConcept: 'Matrícula',
  materialReceiptConcept: 'Material',
  generateFirstMonthReceipt: true,
  generateCurrentMonthWithStartedCourse: true,
  generateCurrentQuarterWithStartedCourse: false,
  generateUnifiedRemittanceByIban: true,
  activateReceiptReturn: false,
  defaultPaymentType: 'Domiciliado',
  defaultPaymentPeriodicity: 'Mensual',
  defaultChargeDay: 5,
  customField1Enabled: true,
  customField1Label: 'Colegio',
  customField2Enabled: false,
  customField2Label: '',
  customField3Enabled: false,
  customField3Label: '',
  customField4Enabled: false,
  customField4Label: '',
  emailLabel1: 'Email Principal',
  emailLabel2: 'Email Secundario',
  emailLabel3: 'Otro Email',
  phoneLabel1: 'Teléfono Principal',
  phoneLabel2: 'Teléfono Secundario',
  phoneLabel3: 'Otro Teléfono',
  studentAreaBackground: null,
  studentAreaLogo: null,
  showReceiptsInStudentArea: true,
  showInvoicesInStudentArea: true,
  showCourseDocumentsInStudentArea: true,
  showCourseTrackingInStudentArea: true,
  showClassDaysInStudentArea: true,
  defaultSeatsInCourses: 12,
  showCourseOccupancy: true,
  activateWaitingList: true,
  notifyOnWaitingListAvailability: true,
  chooseRenovationCourses: false,
  renovationLandingPage: '',
  sendSignatureDocsToAllEmails: false,
  sendStudentSheet: true,
  sendSEPA: true,
  sendPickupAuthorization: true,
  sendTermsAndConditions: true,
  sendDataProtection: true,
  studentSheetIncludesAcademicData: false,
  studentSheetIncludesPaymentConditions: true,
  showOnlyLastActiveCourse: false,
  defaultAuthorizations: [1],
  canEditAuthorizationsBeforeSigning: false,
  signatureLegalText: 'La firma de este documento implica la aceptación de todas las condiciones.',
  dataProtectionTextTitle: 'PROTECCIÓN DE DATOS',
  dataProtectionText: 'Texto largo sobre protección de datos...',
  termsAndConditionsTextTitle: 'TÉRMINOS Y CONDICIONES',
  termsAndConditionsText: 'Texto largo sobre términos y condiciones...'
};

export const MOCK_RESOURCES: Resource[] = [
    { id: 'res-1', name: 'Libro de estilo', fileName: 'libro_estilo.pdf', fileType: 'application/pdf', fileContent: '', scope: 'global', isForStudents: true, isForTeachers: true, isActive: true, createdAt: '2024-01-01T10:00:00Z' },
    { id: 'res-2', name: 'Guía de Mates P1', fileName: 'guia_p1.pdf', fileType: 'application/pdf', fileContent: '', scope: 'course', scopeId: 1, isForStudents: true, isForTeachers: true, isActive: true, createdAt: '2024-09-10T10:00:00Z' },
];

export const MOCK_WAITING_LIST: WaitingListEntry[] = [];

export const MOCK_AUTH_GROUPS: AuthorizationGroup[] = [
    { id: 1, name: 'Autorizaciones Generales' },
    { id: 2, name: 'Excursiones' }
];

export const MOCK_AUTHORIZATIONS: Authorization[] = [
    { id: 1, groupId: 1, internalTitle: 'Derechos de imagen', targetAudience: 'all', differentiateText: false, documentText: 'Autorizo al centro a usar mi imagen...', showInEnrollment: true, enrollmentShortDescription: 'Acepto el uso de mi imagen', showInStudentArea: true, order: 1, isImageRightsAuth: true, isCommunicationsAuth: false },
    { id: 2, groupId: 1, internalTitle: 'Comunicaciones comerciales', targetAudience: 'all', differentiateText: false, documentText: 'Autorizo al centro a enviarme comunicaciones...', showInEnrollment: true, enrollmentShortDescription: 'Acepto recibir emails', showInStudentArea: true, order: 2, isImageRightsAuth: false, isCommunicationsAuth: true }
];

export const MOCK_STUDENT_AUTHORIZATIONS: StudentAuthorization[] = [
    { id: 'sa-1', studentId: 1, authorizationId: 1, lastSentDate: '2024-09-01', signatureDate: '2024-09-02', signerName: 'Ana López', signerNif: '22222222B' }
];

export const MOCK_STUDENT_HISTORY: StudentHistoryEntry[] = [
    { id: 1, year: 2024, month: 9, count: 20 },
    { id: 2, year: 2024, month: 10, count: 95 },
    { id: 3, year: 2025, month: 1, count: 100 }
];

export const MOCK_STUDENT_TAGS: StudentTag[] = [
    { id: 1, name: 'VIP', color: '#ef4444' },
    { id: 2, name: 'Beca', color: '#3b82f6' }
];

export const MOCK_BILLING_CENTERS: BillingCenter[] = [
    { 
        id: 1, 
        name: 'Sede Principal', 
        nif: 'B12345678', 
        irpfPercent: 15, 
        ivaPercent: 21, 
        bankAccountCount: 1, 
        seriesCount: 2, 
        paymentMethodCount: 2, 
        isFacturaE: false, 
        isActive: true, 
        bankAccounts: [], 
        series: [], 
        paymentMethods: [] 
    }
];

export const MOCK_BANK_ACCOUNTS: BankAccount[] = [];
export const MOCK_BILLING_SERIES: BillingSeries[] = [];
export const MOCK_BILLING_PAYMENT_METHODS: BillingPaymentMethod[] = [];

export const MOCK_BILLING_CLIENTS: BillingClient[] = [
    { id: 99, isCompany: true, companyName: 'Oficina Suministros SL', firstName: 'Gerente', lastName: '', email: 'compras@suministros.com', nif: 'B87654321', isActive: true, altaDate: '2024-01-01', sepaSigned: false, commsAllowed: true, stats: { emails: 0, docs: 0, invoices: 1, quotes: 0 } }
];

export const MOCK_PROFORMA_INVOICES: ProformaInvoice[] = [];
export const MOCK_QUOTES: Quote[] = [];
export const MOCK_DOCUMENT_TYPES: DocumentType[] = [];
export const MOCK_DEFAULT_CONCEPTS: DefaultConcept[] = [];
export const MOCK_FISCAL_MODELS: FiscalModel[] = [
    { id: 1, modelType: '303', period: '3T', year: 2024, status: 'Presented' }
];

export const MOCK_FISCAL_CONFIG: FiscalConfig = {
  id: 1,
  companyType: 'Sociedad',
  vatRegime: 'General',
  taxId: 'B12345678',
  fiscalAddress: 'Calle de la Innovación, 42',
  iae: '933.9',
  iban: generateIBAN(),
  activeModels: ['303', '111'],
  invoiceSeries: ['2024', '2025']
};

export const MOCK_WIKI_CATEGORIES: WikiCategory[] = [ { id: 1, name: 'Robótica', description: 'Todo sobre robótica' } ];
export const MOCK_WIKI_CLASSES: WikiClass[] = [ { id: 1, categoryId: 1, name: 'Introducción a Lego Mindstorms' } ];
export const MOCK_WIKI_LESSONS: WikiLesson[] = [ { id: 1, categoryId: 1, classId: 1, title: 'Tu primer robot', content: 'Contenido HTML', isVisible: true, blocks:[] } ];
export const MOCK_WIKI_PERMISSIONS: TeacherPermission[] = [ { id: 1, teacherId: 3, categoryId: 1, canEdit: true } ];
export const MOCK_TAUGHT_SESSIONS: TaughtSession[] = [];
export const MOCK_LANDING_PAGES: LandingPage[] = [];
export const MOCK_LANDING_CUSTOM_FIELDS: LandingCustomField[] = [];
export const MOCK_REPORTS: Report[] = [];
export const MOCK_PREDEFINED_COMMENTS: PredefinedComment[] = [];
export const MOCK_COMMENT_TAGS: CommentTag[] = [];
export const MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [];
export const MOCK_COMMUNICATION_LOGS: CommunicationLog[] = [];
export const MOCK_STORED_FILES: StoredFile[] = [];

export const SUPABASE_SCHEMA = `
-- Create Tables
CREATE TABLE IF NOT EXISTS "users" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" TEXT,
  "lastName" TEXT,
  "email" TEXT,
  "role" TEXT,
  "avatar" TEXT,
  "status" TEXT,
  "lastLogin" TIMESTAMPTZ,
  "permissions" JSONB,
  "activityLogs" JSONB,
  "password" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "academy_profile" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "publicName" TEXT,
  "website" TEXT,
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "address" TEXT,
  "population" TEXT,
  "postalCode" TEXT,
  "nif" TEXT,
  "sepaCreditorId" TEXT,
  "sepaCreditorName" TEXT,
  "sepaCreditorAddress" TEXT,
  "logoBase64" TEXT,
  "docLogoBase64" TEXT,
  "directorSignatureBase64" TEXT,
  "emailSender" TEXT,
  "emailLogoBase64" TEXT,
  "emailFooterImageBase64" TEXT,
  "emailFooterText" TEXT,
  "studentBirthdayModule" BOOLEAN,
  "notifyTeachersBirthdays" BOOLEAN,
  "sendStudentBirthdayEmail" BOOLEAN,
  "sendBirthdayToAllStudents" TEXT,
  "birthdayEmailImageBase64" TEXT,
  "birthdayEmailSubject" TEXT,
  "birthdayEmailText" TEXT,
  "teacherBirthdayModule" BOOLEAN,
  "paysRenovationEnrollment" BOOLEAN,
  "enrollmentReceiptConcept" TEXT,
  "materialReceiptConcept" TEXT,
  "generateFirstMonthReceipt" BOOLEAN,
  "generateCurrentMonthWithStartedCourse" BOOLEAN,
  "generateCurrentQuarterWithStartedCourse" BOOLEAN,
  "generateUnifiedRemittanceByIban" BOOLEAN,
  "activateReceiptReturn" BOOLEAN,
  "defaultPaymentType" TEXT,
  "defaultPaymentPeriodicity" TEXT,
  "defaultChargeDay" NUMERIC,
  "customField1Enabled" BOOLEAN,
  "customField1Label" TEXT,
  "customField2Enabled" BOOLEAN,
  "customField2Label" TEXT,
  "customField3Enabled" BOOLEAN,
  "customField3Label" TEXT,
  "customField4Enabled" BOOLEAN,
  "customField4Label" TEXT,
  "emailLabel1" TEXT,
  "emailLabel2" TEXT,
  "emailLabel3" TEXT,
  "phoneLabel1" TEXT,
  "phoneLabel2" TEXT,
  "phoneLabel3" TEXT,
  "studentAreaBackground" TEXT,
  "studentAreaLogo" TEXT,
  "showReceiptsInStudentArea" BOOLEAN,
  "showInvoicesInStudentArea" BOOLEAN,
  "showCourseDocumentsInStudentArea" BOOLEAN,
  "showCourseTrackingInStudentArea" BOOLEAN,
  "showClassDaysInStudentArea" BOOLEAN,
  "defaultSeatsInCourses" NUMERIC,
  "showCourseOccupancy" BOOLEAN,
  "activateWaitingList" BOOLEAN,
  "notifyOnWaitingListAvailability" BOOLEAN,
  "chooseRenovationCourses" BOOLEAN,
  "renovationLandingPage" TEXT,
  "sendSignatureDocsToAllEmails" BOOLEAN,
  "sendStudentSheet" BOOLEAN,
  "sendSEPA" BOOLEAN,
  "sendPickupAuthorization" BOOLEAN,
  "sendTermsAndConditions" BOOLEAN,
  "sendDataProtection" BOOLEAN,
  "studentSheetIncludesAcademicData" BOOLEAN,
  "studentSheetIncludesPaymentConditions" BOOLEAN,
  "showOnlyLastActiveCourse" BOOLEAN,
  "defaultAuthorizations" JSONB,
  "canEditAuthorizationsBeforeSigning" BOOLEAN,
  "signatureLegalText" TEXT,
  "dataProtectionTextTitle" TEXT,
  "dataProtectionText" TEXT,
  "termsAndConditionsTextTitle" TEXT,
  "termsAndConditionsText" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "populations" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" TEXT,
  "province" TEXT,
  "country" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "locations" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" TEXT,
  "population" TEXT,
  "isExternal" BOOLEAN,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "classrooms" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" TEXT,
  "location" TEXT,
  "capacity" NUMERIC,
  "hasProjector" BOOLEAN,
  "color" TEXT,
  "order" NUMERIC,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "week_schedules" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" TEXT,
  "day" TEXT,
  "startTime" TEXT,
  "endTime" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "holidays" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" TEXT,
  "date" JSONB,
  "location" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "level_groups" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" TEXT,
  "emoji" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "course_levels" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "groupId" BIGINT REFERENCES "level_groups"("id"),
  "name" TEXT,
  "monthlyPrice" NUMERIC,
  "quarterlyPrice" NUMERIC,
  "singlePrice" NUMERIC,
  "materialPrice" NUMERIC,
  "enrollmentPrice" NUMERIC,
  "reportType" TEXT,
  "isActive" BOOLEAN,
  "order" NUMERIC,
  "allowMonthlyPayment" BOOLEAN,
  "allowQuarterlyPayment" BOOLEAN,
  "allowSinglePayment" BOOLEAN,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "teachers" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" TEXT,
  "lastName" TEXT,
  "nif" TEXT,
  "photoUrl" TEXT,
  "birthDate" TEXT,
  "email" TEXT,
  "isActive" BOOLEAN,
  "platformLanguage" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "postalCode" TEXT,
  "population" TEXT,
  "permissions" JSONB,
  "contract" JSONB,
  "observations" TEXT,
  "password" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "courses" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" TEXT,
  "alternativeName" TEXT,
  "description" TEXT,
  "level" TEXT,
  "duration" TEXT,
  "teacherId" BIGINT REFERENCES "teachers"("id"),
  "secondaryTeacherId" BIGINT REFERENCES "teachers"("id"),
  "modality" TEXT,
  "scheduleIds" JSONB,
  "classroomId" BIGINT REFERENCES "classrooms"("id"),
  "minCapacity" NUMERIC,
  "maxCapacity" NUMERIC,
  "status" TEXT,
  "startDate" TEXT,
  "endDate" TEXT,
  "observations" TEXT,
  "onlineAllowed" BOOLEAN,
  "onlineLimit" NUMERIC,
  "allowWaitingList" BOOLEAN,
  "paymentRequired" BOOLEAN,
  "renewalCourseId" BIGINT, 
  "receiptGeneration" TEXT,
  "isActive" BOOLEAN,
  "alternativePrice" JSONB,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "students" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "registrationDate" TEXT,
  "isActive" BOOLEAN,
  "firstName" TEXT,
  "lastName" TEXT,
  "dni" TEXT,
  "photoUrl" TEXT,
  "birthDate" TEXT,
  "email1" TEXT,
  "email2" TEXT,
  "email3" TEXT,
  "phone1" TEXT,
  "phone2" TEXT,
  "phone3" TEXT,
  "address" TEXT,
  "website" TEXT,
  "postalCode" TEXT,
  "population" TEXT,
  "allergies" TEXT,
  "academicData" TEXT,
  "tags" JSONB,
  "isMinor" BOOLEAN,
  "tutors" JSONB,
  "communicationLanguage" TEXT,
  "observations" TEXT,
  "paymentConfig" JSONB,
  "domiciliationData" JSONB,
  "billingData" JSONB,
  "hasSecondPayer" BOOLEAN,
  "authorizations" JSONB,
  "authorizedPickups" JSONB,
  "customField1Value" TEXT,
  "customField2Value" TEXT,
  "customField3Value" TEXT,
  "customField4Value" TEXT,
  "customField4Label" TEXT,
  "customFieldValues" JSONB,
  "status" TEXT,
  "stats" JSONB,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "enrollments" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "studentId" BIGINT REFERENCES "students"("id"),
  "courseId" BIGINT REFERENCES "courses"("id"),
  "enrollmentDate" TEXT,
  "isActive" BOOLEAN,
  "cancellationDate" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "receipts" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "receiptDate" TEXT,
  "studentId" BIGINT REFERENCES "students"("id"),
  "courseId" BIGINT REFERENCES "courses"("id"),
  "concept" TEXT,
  "amount" NUMERIC,
  "status" TEXT,
  "paymentType" TEXT,
  "invoiceNeeded" BOOLEAN,
  "isSent" BOOLEAN,
  "isInvoiceGenerated" BOOLEAN,
  "invoiceId" BIGINT,
  "isCancelled" BOOLEAN,
  "receiptCode" TEXT,
  "internalComment" TEXT,
  "paymentDate" TEXT,
  "domiciliationDate" TEXT,
  "pdfSnapshot" JSONB,
  "centerId" BIGINT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "invoices" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "type" TEXT,
  "series" TEXT,
  "number" NUMERIC,
  "invoiceCode" TEXT,
  "date" TEXT,
  "dueDate" TEXT,
  "clientId" BIGINT,
  "concept" TEXT,
  "baseAmount" NUMERIC,
  "vatRate" NUMERIC,
  "vatAmount" NUMERIC,
  "irpfRate" NUMERIC,
  "irpfAmount" NUMERIC,
  "totalAmount" NUMERIC,
  "status" TEXT,
  "paymentDate" TEXT,
  "paymentMethod" TEXT,
  "linkedReceiptIds" JSONB,
  "pdfSnapshot" JSONB,
  "category" TEXT,
  "lineCount" NUMERIC,
  "centerId" BIGINT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "course_classes" (
  "id" TEXT PRIMARY KEY,
  "courseId" BIGINT REFERENCES "courses"("id"),
  "date" TIMESTAMPTZ,
  "startTime" TEXT,
  "endTime" TEXT,
  "teacherId" BIGINT REFERENCES "teachers"("id"),
  "isSubstitution" BOOLEAN,
  "status" TEXT,
  "internalComment" TEXT,
  "publicComment" TEXT,
  "lessonId" BIGINT,
  "modality" TEXT,
  "classroomId" BIGINT REFERENCES "classrooms"("id"),
  "attendanceInitialized" BOOLEAN,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "attendance_records" (
  "id" TEXT PRIMARY KEY,
  "classId" TEXT REFERENCES "course_classes"("id"),
  "studentId" BIGINT REFERENCES "students"("id"),
  "attended" BOOLEAN,
  "late" TEXT,
  "absenceJustified" BOOLEAN,
  "homeworkDone" BOOLEAN,
  "comments" TEXT,
  "status" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "resources" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "fileName" TEXT,
  "fileType" TEXT,
  "fileContent" TEXT,
  "scope" TEXT,
  "scopeId" TEXT,
  "isForTeachers" BOOLEAN,
  "isForStudents" BOOLEAN,
  "isActive" BOOLEAN,
  "createdAt" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "waiting_list" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "studentId" BIGINT REFERENCES "students"("id"),
  "courseId" BIGINT REFERENCES "courses"("id"),
  "registrationDate" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "auth_groups" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "authorizations" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "groupId" BIGINT REFERENCES "auth_groups"("id"),
  "internalTitle" TEXT,
  "targetAudience" TEXT,
  "differentiateText" BOOLEAN,
  "documentText" TEXT,
  "documentTextMinors" TEXT,
  "showInEnrollment" BOOLEAN,
  "enrollmentShortDescription" TEXT,
  "showInStudentArea" BOOLEAN,
  "order" NUMERIC,
  "isImageRightsAuth" BOOLEAN,
  "isCommunicationsAuth" BOOLEAN,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "student_authorizations" (
  "id" TEXT PRIMARY KEY,
  "studentId" BIGINT REFERENCES "students"("id"),
  "authorizationId" BIGINT REFERENCES "authorizations"("id"),
  "lastSentDate" TEXT,
  "token" TEXT,
  "signatureDate" TEXT,
  "signerName" TEXT,
  "signerNif" TEXT,
  "signatureSvg" TEXT,
  "postSignToken" TEXT,
  "postSignTokenExpires" TEXT,
  "courseNamesSnapshot" JSONB,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "student_history" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "year" NUMERIC,
  "month" NUMERIC,
  "count" NUMERIC,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "student_tags" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" TEXT,
  "color" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "billing_centers" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" TEXT,
  "nif" TEXT,
  "email" TEXT,
  "address" TEXT,
  "population" TEXT,
  "postalCode" TEXT,
  "phone" TEXT,
  "web" TEXT,
  "irpfPercent" NUMERIC,
  "ivaPercent" NUMERIC,
  "bankAccountCount" NUMERIC,
  "seriesCount" NUMERIC,
  "paymentMethodCount" NUMERIC,
  "isFacturaE" BOOLEAN,
  "isActive" BOOLEAN,
  "bankAccounts" JSONB,
  "series" JSONB,
  "paymentMethods" JSONB,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "billing_clients" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "isCompany" BOOLEAN,
  "companyName" TEXT,
  "firstName" TEXT,
  "lastName" TEXT,
  "email" TEXT,
  "nif" TEXT,
  "isActive" BOOLEAN,
  "altaDate" TEXT,
  "sepaSigned" BOOLEAN,
  "commsAllowed" BOOLEAN,
  "stats" JSONB,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "proforma_invoices" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "series" TEXT,
  "number" TEXT,
  "date" TEXT,
  "client" JSONB,
  "clientId" BIGINT,
  "lineCount" NUMERIC,
  "total" NUMERIC,
  "isSent" BOOLEAN,
  "linkedReceiptIds" JSONB,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "quotes" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "document_types" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "default_concepts" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" TEXT,
  "price" NUMERIC,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "fiscal_models" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "modelType" TEXT,
  "period" TEXT,
  "year" NUMERIC,
  "status" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "wiki_categories" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" TEXT,
  "description" TEXT,
  "image" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "wiki_classes" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "categoryId" BIGINT REFERENCES "wiki_categories"("id"),
  "name" TEXT,
  "description" TEXT,
  "image" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "wiki_lessons" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "categoryId" BIGINT REFERENCES "wiki_categories"("id"),
  "classId" BIGINT REFERENCES "wiki_classes"("id"),
  "title" TEXT,
  "content" TEXT,
  "isVisible" BOOLEAN,
  "blocks" JSONB,
  "attachments" JSONB,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "teacher_permissions" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "teacherId" BIGINT REFERENCES "teachers"("id"),
  "categoryId" BIGINT REFERENCES "wiki_categories"("id"),
  "classId" BIGINT REFERENCES "wiki_classes"("id"),
  "lessonId" BIGINT REFERENCES "wiki_lessons"("id"),
  "canEdit" BOOLEAN,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "taught_sessions" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "teacherId" BIGINT REFERENCES "teachers"("id"),
  "date" TEXT,
  "duration" NUMERIC,
  "group" TEXT,
  "lessonId" BIGINT REFERENCES "wiki_lessons"("id"),
  "notes" TEXT,
  "courseClassId" TEXT REFERENCES "course_classes"("id"),
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "landing_pages" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "title" TEXT,
  "slug" TEXT,
  "isActive" BOOLEAN,
  "isDefault" BOOLEAN,
  "description" TEXT,
  "footerText" TEXT,
  "styles" JSONB,
  "stepConfig" JSONB,
  "studentDataBlockTitle" TEXT,
  "studentDataBlockDescription" TEXT,
  "courseSelectionBlockTitle" TEXT,
  "courseSelectionBlockDescription" TEXT,
  "paymentBlockTitle" TEXT,
  "paymentBlockDescription" TEXT,
  "offeredCourseIds" JSONB,
  "courseSelectionMode" TEXT,
  "selectedGroupIds" JSONB,
  "selectedLevelIds" JSONB,
  "bannedLocationIds" JSONB,
  "showVacancies" BOOLEAN,
  "showDates" BOOLEAN,
  "showPrices" BOOLEAN,
  "showLocation" BOOLEAN,
  "showTotalClasses" BOOLEAN,
  "showSchedule" BOOLEAN,
  "allowMultipleCourses" BOOLEAN,
  "allowReturnToEnroll" BOOLEAN,
  "studentFields" JSONB,
  "customFieldsBlock" JSONB,
  "additionalInfoBlock" JSONB,
  "paymentMethods" JSONB,
  "askBillingData" BOOLEAN,
  "privacyPolicy" JSONB,
  "supportText" JSONB,
  "notifications" JSONB,
  "studentAccessMode" TEXT,
  "authorizationIds" JSONB,
  "visits" NUMERIC,
  "conversions" NUMERIC,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "landing_custom_fields" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "landingId" BIGINT REFERENCES "landing_pages"("id"),
  "label" TEXT,
  "type" TEXT,
  "required" BOOLEAN,
  "order" NUMERIC,
  "options" TEXT,
  "isActive" BOOLEAN,
  "description" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "reports" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "studentId" BIGINT REFERENCES "students"("id"),
  "courseId" BIGINT REFERENCES "courses"("id"),
  "title" TEXT,
  "type" TEXT,
  "deliveryDate" TEXT,
  "status" TEXT,
  "isGenerated" BOOLEAN,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "predefined_comments" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "text" TEXT,
  "teacherId" BIGINT REFERENCES "teachers"("id"),
  "tags" JSONB,
  "isActive" BOOLEAN,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "comment_tags" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" TEXT,
  "isActive" BOOLEAN,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "email_templates" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" TEXT,
  "subject" TEXT,
  "body" TEXT,
  "systemSlug" TEXT,
  "variables" JSONB,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "communication_logs" (
  "id" TEXT PRIMARY KEY,
  "date" TEXT,
  "subject" TEXT,
  "body" TEXT,
  "senderId" BIGINT,
  "recipientEmail" TEXT,
  "recipientName" TEXT,
  "type" TEXT,
  "status" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ledger_entries" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "date" TEXT,
  "account" TEXT,
  "concept" TEXT,
  "debit" NUMERIC,
  "credit" NUMERIC,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "activity_logs" (
  "id" TEXT PRIMARY KEY,
  "date" TEXT,
  "action" TEXT,
  "details" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "fiscal_config" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "companyType" TEXT,
  "vatRegime" TEXT,
  "taxId" TEXT,
  "fiscalAddress" TEXT,
  "iae" TEXT,
  "iban" TEXT,
  "activeModels" JSONB,
  "invoiceSeries" JSONB,
  "irpfType" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "bank_accounts" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "centerId" BIGINT REFERENCES "billing_centers"("id"),
  "name" TEXT,
  "iban" TEXT,
  "bic" TEXT,
  "suffix" TEXT,
  "bank" TEXT,
  "isDefault" BOOLEAN,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "billing_series" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "centerId" BIGINT REFERENCES "billing_centers"("id"),
  "year" NUMERIC,
  "code" TEXT,
  "isRectifying" BOOLEAN,
  "invoiceCount" NUMERIC,
  "budgetCount" NUMERIC,
  "isActive" BOOLEAN,
  "nextNumber" BIGINT DEFAULT 1,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "billing_payment_methods" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "centerId" BIGINT REFERENCES "billing_centers"("id"),
  "name" TEXT,
  "icon" TEXT,
  "gatewayType" TEXT,
  "isActive" BOOLEAN,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "stored_files" (
  "id" TEXT PRIMARY KEY,
  "fileName" TEXT,
  "fileUrl" TEXT,
  "fileType" TEXT,
  "relatedTable" TEXT,
  "relatedId" TEXT,
  "centerId" BIGINT,
  "createdAt" TEXT,
  "size" NUMERIC
);

-- SAFE COLUMN ADDITIONS (IDEMPOTENT)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password" TEXT;
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "password" TEXT;
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "alternativePrice" JSONB;
ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "customField4Label" TEXT;
ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "customFieldValues" JSONB;
ALTER TABLE "receipts" ADD COLUMN IF NOT EXISTS "centerId" BIGINT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "centerId" BIGINT;
ALTER TABLE "billing_series" ADD COLUMN IF NOT EXISTS "nextNumber" BIGINT DEFAULT 1;
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "studentAccessMode" TEXT;
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "courseSelectionMode" TEXT;
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "selectedGroupIds" JSONB;
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "selectedLevelIds" JSONB;
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "bannedLocationIds" JSONB;
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "studentDataBlockTitle" TEXT;
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "studentDataBlockDescription" TEXT;
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "courseSelectionBlockTitle" TEXT;
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "courseSelectionBlockDescription" TEXT;
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "paymentBlockTitle" TEXT;
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "paymentBlockDescription" TEXT;
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "authorizationIds" JSONB;
ALTER TABLE "academy_profile" ADD COLUMN IF NOT EXISTS "sendSignatureDocsToAllEmails" BOOLEAN;
ALTER TABLE "academy_profile" ADD COLUMN IF NOT EXISTS "signatureLegalText" TEXT;
ALTER TABLE "academy_profile" ADD COLUMN IF NOT EXISTS "dataProtectionTextTitle" TEXT;
ALTER TABLE "academy_profile" ADD COLUMN IF NOT EXISTS "dataProtectionText" TEXT;
ALTER TABLE "academy_profile" ADD COLUMN IF NOT EXISTS "termsAndConditionsTextTitle" TEXT;
ALTER TABLE "academy_profile" ADD COLUMN IF NOT EXISTS "termsAndConditionsText" TEXT;
ALTER TABLE "course_classes" ADD COLUMN IF NOT EXISTS "attendanceInitialized" BOOLEAN;
ALTER TABLE "attendance_records" ADD COLUMN IF NOT EXISTS "status" TEXT;

-- REPAIR STUDENT HISTORY TABLE
ALTER TABLE "student_history" ADD COLUMN IF NOT EXISTS "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY;

-- ATTENDANCE FIX: UNIQUE INDEX TO PREVENT DUPLICATES AND ENABLE UPSERT
ALTER TABLE "attendance_records" ADD COLUMN IF NOT EXISTS "id" TEXT PRIMARY KEY; 
CREATE UNIQUE INDEX IF NOT EXISTS "attendance_student_class_unique" ON "attendance_records" ("studentId", "classId");

-- SYNC SEQUENCES (Important for fixing duplicate key errors after migration)
SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id),0) + 1, false) FROM users;
SELECT setval(pg_get_serial_sequence('students', 'id'), coalesce(max(id),0) + 1, false) FROM students;
SELECT setval(pg_get_serial_sequence('enrollments', 'id'), coalesce(max(id),0) + 1, false) FROM enrollments;
SELECT setval(pg_get_serial_sequence('receipts', 'id'), coalesce(max(id),0) + 1, false) FROM receipts;
SELECT setval(pg_get_serial_sequence('invoices', 'id'), coalesce(max(id),0) + 1, false) FROM invoices;
SELECT setval(pg_get_serial_sequence('courses', 'id'), coalesce(max(id),0) + 1, false) FROM courses;
SELECT setval(pg_get_serial_sequence('teachers', 'id'), coalesce(max(id),0) + 1, false) FROM teachers;
SELECT setval(pg_get_serial_sequence('classrooms', 'id'), coalesce(max(id),0) + 1, false) FROM classrooms;
SELECT setval(pg_get_serial_sequence('week_schedules', 'id'), coalesce(max(id),0) + 1, false) FROM week_schedules;
SELECT setval(pg_get_serial_sequence('holidays', 'id'), coalesce(max(id),0) + 1, false) FROM holidays;
`;

export const SUPABASE_RLS_POLICIES = `
-- Enable RLS for all tables
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', table_name);
    EXECUTE format('CREATE POLICY "Enable read access for all users" ON %I FOR SELECT USING (true);', table_name);
    EXECUTE format('CREATE POLICY "Enable insert for all users" ON %I FOR INSERT WITH CHECK (true);', table_name);
    EXECUTE format('CREATE POLICY "Enable update for all users" ON %I FOR UPDATE USING (true);', table_name);
    EXECUTE format('CREATE POLICY "Enable delete for all users" ON %I FOR DELETE USING (true);', table_name);
  END LOOP;
END;
$$;
`;

export const FIREBASE_SCHEMA = `{
  "rules": {
    ".read": true,
    ".write": true
  }
}`;

export const DROP_ALL_TABLES_SCRIPT = `
DO $$ 
DECLARE 
    r RECORD; 
BEGIN 
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP 
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE'; 
    END LOOP; 
END $$;
`;