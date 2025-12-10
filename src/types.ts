

import React from 'react';

/**
 * Define los roles de usuario disponibles en la aplicación.
 */
export enum Role {
  ADMIN = 'Administrador',
  COORDINATOR = 'Coordinador académico',
  TEACHER = 'Profesor',
  STUDENT = 'Alumno',
  FINANCIAL_MANAGER = 'Gestor Financiero',
}

/**
 * Definición granular de permisos para usuarios del sistema.
 */
export interface UserPermissions {
  centerManagement: boolean; // Acceso a configuración del centro
  academicManagement: boolean; // Acceso a cursos, alumnos, clases
  financialManagement: boolean; // Acceso a recibos, facturas, dashboard económico
  reports: boolean; // Acceso a informes
  settings: boolean; // Acceso a configuración global
  users: boolean; // Acceso a gestión de usuarios
}

/**
 * Representa una entrada en el log de actividad de un usuario.
 */
export interface ActivityLog {
  id: string;
  date: string; // ISO Date string
  action: string; // e.g., "Inicio de sesión", "Actualización de perfil"
  details?: string; // e.g., "IP: 88.6.232.25"
  user?: User; // Optional user object for enriched logs
}

/**
 * Representa una cuenta de usuario en el sistema.
 */
export interface User {
  id: number;
  name: string;
  lastName?: string;
  email: string;
  role: Role;
  avatar: string; // URL de la imagen de avatar del usuario
  status: 'active' | 'inactive';
  lastLogin: string; // Cadena de fecha ISO
  permissions?: UserPermissions; // Permisos personalizados
  activityLogs?: ActivityLog[]; // Historial de actividad
  password?: string;
}


/**
 * Representa una etiqueta para clasificar alumnos.
 */
export interface StudentTag {
  id: number;
  name: string;
  color?: string; // Opcional: para mostrar un badge de color en el futuro
}

/**
 * Representa el perfil y los detalles del contrato de un profesor.
 */
export interface Teacher {
  id: number;
  name: string;
  lastName: string;
  nif?: string;
  photoUrl: string; // URL o cadena base64
  birthDate?: string; // Cadena de fecha ISO
  email: string;
  password?: string; // Normalmente no se almacena en el cliente, pero aquí para la estructura de datos simulados
  isActive: boolean;
  platformLanguage: 'Español' | 'Catalán' | 'Inglés';
  phone?: string;
  address?: string;
  postalCode?: string;
  population?: string;
  /** Permisos específicos para el rol de profesor. */
  permissions: {
    canSendEmails: boolean;
    canSendReports: boolean;
    canEditStudentAreaComments: boolean;
    canCreateManualClasses: boolean;
    canManageCourseDocs: boolean;
    canViewStudentList: boolean;
  };
  /** Información contractual del profesor. */
  contract: {
    hours: number;
    isFreelance: boolean;
    signatureFile?: string; // imagen codificada en base64
    socialSecurityNumber?: string;
    startDate?: string; // Cadena de fecha ISO
    endDate?: string; // Cadena de fecha ISO
    iban?: string;
  };
  observations?: string;
}

export interface AlternativePriceConfig {
    active: boolean;
    monthly: { active: boolean; price: number };
    quarterly: { active: boolean; price: number };
    single: { active: boolean; price: number };
    materialPrice: number;
    enrollmentPrice: number;
}

/**
 * Representa un curso ofrecido por la academia.
 */
export interface Course {
    id: number;
    name: string;
    alternativeName?: string;
    description: string;
    level: string; // Corresponde a CourseLevel.name
    duration: string;
    teacherId: number;
    secondaryTeacherId?: number;
    modality: 'Presencial' | 'Online' | 'Híbrido';
    scheduleIds: number[]; // Array de IDs de WeekSchedule
    classroomId: number;
    minCapacity: number;
    maxCapacity: number;
    status: 'Activo' | 'Archivado' | 'Completado';
    startDate: string; // Cadena de fecha ISO
    endDate: string; // Cadena de fecha ISO
    observations?: string;
    onlineAllowed?: boolean;
    onlineLimit?: number;
    allowWaitingList?: boolean; // Nuevo campo
    paymentRequired?: boolean;
    renewalCourseId?: number;
    receiptGeneration?: string;
    /** Campo calculado: número de clases generadas para este curso. */
    classesCount: number;
    /** Campo calculado: número de recursos asociados a este curso. */
    resourcesCount: number;
    isActive: boolean;
    /** Campo calculado: número de alumnos en lista de espera para este curso. */
    standbyStudents?: number;
    
    alternativePrice?: AlternativePriceConfig;
}

/**
 * Representa una persona autorizada para recoger a un alumno menor de edad.
 */
export interface AuthorizedPickup {
  fullName: string;
  nif: string;
}

/**
 * Representa el perfil y los datos relacionados de un alumno.
 */
export interface Student {
  id: number;
  registrationDate: string; // Cadena de fecha ISO
  isActive: boolean;
  firstName: string;
  lastName: string;
  dni: string;
  photoUrl: string; // URL o cadena base64
  birthDate: string; // Cadena de fecha ISO
  email1: string;
  email2?: string;
  email3?: string;
  phone1: string;
  phone2?: string;
  phone3?: string;
  address: string;
  website?: string;
  postalCode: string;
  population: string;
  allergies?: string;
  academicData?: string;
  tags?: string[];
  isMinor: boolean;
  /** Tutores para alumnos menores de edad. */
  tutors: Array<{
    nif: string;
    fullName: string;
  }>;
  communicationLanguage: string;
  observations?: string;
  /** Configuración de cómo se factura al alumno. */
  paymentConfig: {
    type: string;
    periodicity: string;
    hasDiscount: boolean;
  };
  /** Datos de domiciliación bancaria para pagos SEPA. */
  domiciliationData?: {
    chargeDay: number;
    accountHolder: string;
    iban: string;
    bic: string;
    acceptanceDate: string; // Cadena de fecha ISO
    sepaType: 'recurrent' | 'single';
  };
  /** Datos para facturación, si son diferentes a los datos personales del alumno. */
  billingData?: {
    nif: string;
    clientType: 'physical' | 'juridical';
    name: string;
    lastName?: string;
    address: string;
    postalCode: string;
    population: string;
    country: string;
  };
  hasSecondPayer: boolean;
  /** Autorizaciones estándar para el alumno. */
  authorizations: {
    whatsapp: boolean;
    imageRights: boolean;
    newsletters: boolean;
    canLeaveAlone: boolean;
  };
  authorizedPickups?: AuthorizedPickup[];
  /** Campos personalizados definidos en el perfil de la academia. */
  customField1Value?: string;
  customField2Value?: string;
  customField3Value?: string;
  customField4Value?: string;
  customField4Label: string;
  customFieldValues?: Record<string, any>; // Dynamic field values from Landing Pages
  status: 'Activo' | 'Inactivo';
  /** Estadísticas calculadas para el alumno. */
   stats: {
    assistance: number;
    receipts: number;
    invoices: number;
    emails: number;
    docs: number;
    authorizations: number;
  };
}

/**
 * Representa una inscripcióin de un alumno en un curso.
 */
export interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  enrollmentDate: string; // Cadena de fecha ISO
  isActive: boolean;
  cancellationDate?: string; // Cadena de fecha ISO
}

/**
 * Tipo simplificado para crear nuevas inscripciones.
 */
export interface NewEnrollment {
  studentId: number;
  courseId: number;
  enrollmentDate: string;
  isActive: boolean;
  cancellationDate?: string;
}

/**
 * Representa un aula física.
 */
export interface Classroom {
    id: number;
    name: string;
    capacity?: number;
    location: string;
    hasProjector?: boolean;
    color: string; // Color hexadecimal para el calendario
    /** Campo calculado: número de cursos en esta aula. */
    courseCount: number;
    order?: number; // Para ordenar
}

/**
 * Define los posibles estados de retraso de un alumno.
 */
export type LateType = 'No' | '5 minutos tarde' | '10 minutos tarde' | '15 minutos tarde' | '20 minutos tarde' | '25 minutos tarde' | '30 o más minutos tarde';

/**
 * Representa un único registro de asistencia para un alumno en una clase.
 */
export interface AttendanceRecord {
  id: string; // Clave compuesta, ej., `${studentId}-${classId}`
  classId: string;
  studentId: number;
  attended: boolean;
  late: LateType;
  absenceJustified: boolean;
  homeworkDone: boolean;
  comments?: string;
  status: 'Pendiente' | 'Realizado' | 'Anulado'; // NEW: Mode status based on class status
  classInfo?: CourseClass; // Enriched data for views
}

/**
 * Representa la calificación de un alumno para una evaluación específica en un curso.
 */
export interface Grade {
    studentId: number;
    courseId: number;
    evaluation: string;
    score: number;
}

/**
 * Representa una población (ciudad/pueblo).
 */
export interface Population {
  id: number;
  name: string;
  province: string;
  country: string;
  /** Campo calculado: número de alumnos de esta población. */
  studentCount: number;
}

/**
 * Representa una ubicación física donde pueden ocurrir las clases (ej., una escuela específica).
 */
export interface Location {
  id: number;
  name: string;
  population: string;
  isExternal: boolean;
  /** Campo calculado: número de aulas en esta ubicación. */
  classroomCount: number;
}

/**
 * Representa un tramo horario reutilizable dentro de una semana.
 */
export interface WeekSchedule {
  id: number;
  name: string; // ej., "Lu 15:30 - 17:00"
  day: string; // ej., "Lunes"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

/**
 * Define los posibles tipos de días festivos.
 */
export type HolidayDateType = 'specific' | 'recurring' | 'range';

/**
 * Representa una fecha festiva, que puede ser un día específico, un día anual recurrente o un rango de fechas.
 */
export interface HolidayDate {
    type: HolidayDateType;
    day?: number;
    month?: number;
    year?: number;
    startDate?: string; // "YYYY-MM-DD"
    endDate?: string; // "YYYY-MM-DD"
}

/**
 * Representa un día festivo.
 */
export interface Holiday {
  id: number;
  name: string;
  date: HolidayDate;
  location?: string; // Si el festivo es específico de una ubicación
}

/**
 * Representa una agrupación lógica de niveles de curso (ej., "Robótica").
 */
export interface LevelGroup {
  id: number;
  name: string;
  emoji: string;
}

/**
 * Representa un nivel específico dentro de un LevelGroup (ej., "Robótica - Primaria").
 * Contiene información de precios.
 */
export interface CourseLevel {
  id: number;
  groupId: number;
  name: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  singlePrice: number;
  materialPrice: number;
  enrollmentPrice: number;
  reportType: string;
  isActive: boolean;
  order: number;
  allowMonthlyPayment: boolean;
  allowQuarterlyPayment: boolean;
  allowSinglePayment: boolean;
}

/**
 * Representa un elemento de submenú en la navegación de la barra lateral.
 */
export interface SubMenuItem {
  title: string;
  path: string;
  icon?: React.ReactNode;
  roles?: Role[]; // Roles que pueden ver este sub-item
}

/**
 * Representa un elemento principal de navegación de la barra lateral.
 */
export interface SideNavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  roles: Role[]; // Qué roles pueden ver este elemento
  submenu?: SubMenuItem[];
}

/**
 * Representa un único día de clase programado.
 */
export interface CourseClass {
  id: string;
  courseId: number;
  date: Date;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  teacherId: number;
  isSubstitution: boolean;
  status: 'Hecha' | 'Pendiente' | 'Anulada';
  internalComment?: string;
  publicComment?: string;
  lessonId?: number;
  modality?: 'Presencial' | 'Online';
  classroomId?: number;
  attendanceInitialized?: boolean;
}

/**
 * Representa un recurso/documento subido al sistema.
 */
export interface Resource {
  id: string;
  name: string;
  fileName: string;
  fileType: string;
  fileContent: string; // base64
  scope: 'global' | 'course' | 'teacher' | 'student' | 'class';
  scopeId?: number | string;
  isForTeachers: boolean;
  isForStudents: boolean;
  isActive: boolean;
  createdAt: string; // ISO date string
}

/**
 * Perfil de configuración global de la academia.
 */
export interface AcademyProfile {
  id: number; 
  publicName: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  population: string;
  postalCode: string;
  nif?: string;
  sepaCreditorId?: string;
  sepaCreditorName?: string;
  sepaCreditorAddress?: string;
  logoBase64: string | null;
  docLogoBase64: string | null;
  directorSignatureBase64: string | null;
  emailSender: string;
  emailLogoBase64: string | null;
  emailFooterImageBase64: string | null;
  emailFooterText: string;
  studentBirthdayModule: boolean;
  notifyTeachersBirthdays: boolean;
  sendStudentBirthdayEmail: boolean;
  sendBirthdayToAllStudents: 'active_course' | 'all_active';
  birthdayEmailImageBase64: string | null;
  birthdayEmailSubject: string;
  birthdayEmailText: string;
  teacherBirthdayModule: boolean;
  paysRenovationEnrollment: boolean;
  enrollmentReceiptConcept: string;
  materialReceiptConcept: string;
  generateFirstMonthReceipt: boolean;
  generateCurrentMonthWithStartedCourse: boolean;
  generateCurrentQuarterWithStartedCourse: boolean;
  generateUnifiedRemittanceByIban: boolean;
  activateReceiptReturn: boolean;
  defaultPaymentType: string;
  defaultPaymentPeriodicity: string;
  defaultChargeDay: number;
  customField1Enabled: boolean;
  customField1Label: string;
  customField2Enabled: boolean;
  customField2Label: string;
  customField3Enabled: boolean;
  customField3Label: string;
  customField4Enabled: boolean;
  customField4Label: string;
  emailLabel1: string;
  emailLabel2: string;
  emailLabel3: string;
  phoneLabel1: string;
  phoneLabel2: string;
  phoneLabel3: string;
  studentAreaBackground: string | null;
  studentAreaLogo: string | null;
  showReceiptsInStudentArea: boolean;
  showInvoicesInStudentArea: boolean;
  showCourseDocumentsInStudentArea: boolean;
  showCourseTrackingInStudentArea: boolean;
  showClassDaysInStudentArea: boolean;
  defaultSeatsInCourses: number;
  showCourseOccupancy: boolean;
  activateWaitingList: boolean;
  notifyOnWaitingListAvailability: boolean;
  chooseRenovationCourses: boolean;
  renovationLandingPage: string;
  sendSignatureDocsToAllEmails: boolean;
  sendStudentSheet: boolean;
  sendSEPA: boolean;
  sendPickupAuthorization: boolean;
  sendTermsAndConditions: boolean;
  sendDataProtection: boolean;
  studentSheetIncludesAcademicData: boolean;
  studentSheetIncludesPaymentConditions: boolean;
  showOnlyLastActiveCourse: boolean;
  defaultAuthorizations: number[];
  canEditAuthorizationsBeforeSigning: boolean;
  signatureLegalText: string;
  dataProtectionTextTitle: string;
  dataProtectionText: string;
  termsAndConditionsTextTitle: string;
  termsAndConditionsText: string;
}

/**
 * Representa un recibo de pago.
 */
export interface Receipt {
  id: number;
  receiptDate: string; // ISO Date string
  studentId: number;
  courseId: number;
  concept: string;
  amount: number;
  status: 'Cobrado' | 'Pendiente' | 'Devuelto';
  paymentType: string;
  invoiceNeeded: boolean;
  isSent: boolean;
  isInvoiceGenerated: boolean;
  invoiceId?: number;
  isCancelled?: boolean;
  receiptCode?: string;
  internalComment?: string;
  paymentDate?: string; // ISO Date string
  domiciliationDate?: string; // ISO Date string
  pdfSnapshot?: any;
  centerId?: number; // New field for Billing Center association
}

/**
 * Representa una entrada en la lista de espera.
 */
export interface WaitingListEntry {
  id: number;
  studentId: number;
  courseId: number;
  registrationDate: string; // ISO date string
}

/**
 * Grupo de autorizaciones.
 */
export interface AuthorizationGroup {
  id: number;
  name: string;
}

/**
 * Plantilla de autorización.
 */
export interface Authorization {
  id: number;
  groupId: number;
  internalTitle: string;
  targetAudience: 'all' | 'adults' | 'minors';
  differentiateText: boolean;
  documentText: string;
  documentTextMinors?: string;
  showInEnrollment: boolean;
  enrollmentShortDescription: string;
  showInStudentArea: boolean;
  order: number;
  isImageRightsAuth: boolean;
  isCommunicationsAuth: boolean;
}

/**
 * Instancia de una autorización para un alumno.
 */
export interface StudentAuthorization {
  id: string;
  studentId: number;
  authorizationId: number;
  lastSentDate: string; // ISO Date string
  token?: string;
  signatureDate?: string; // ISO Date string
  signerName?: string;
  signerNif?: string;
  signatureSvg?: string;
  postSignToken?: string;
  postSignTokenExpires?: string; // ISO Date string
  courseNamesSnapshot?: string[];
}

/**
 * Entrada para el historial de alumnos.
 */
export interface StudentHistoryEntry {
  id: number; // Add ID for DB persistence
  year: number;
  month: number;
  count: number;
}

/**
 * Configuración fiscal de la academia.
 */
export interface FiscalConfig {
  id: number; // Modified: Made required for consistent usage in DataContext
  companyType: 'Autonomo' | 'Sociedad';
  vatRegime: 'General' | 'Exento' | 'Recargo';
  taxId: string;
  fiscalAddress: string;
  iae: string;
  iban: string;
  activeModels: string[];
  invoiceSeries: string[];
  irpfType?: 'Standard_15' | 'Reduced_7' | 'Modules_1';
}

/**
 * Representa una factura (emitida o recibida).
 */
export interface Invoice {
  id: number;
  type: 'issued' | 'received';
  series: string;
  number: number;
  invoiceCode?: string;
  date: string; // ISO Date string
  dueDate: string; // ISO Date string
  clientId: number; // Can be a Student or BillingClient ID
  concept: string;
  baseAmount: number;
  vatRate: number;
  vatAmount: number;
  irpfRate: number;
  irpfAmount: number;
  totalAmount: number;
  status: 'Pending' | 'Paid';
  paymentDate?: string;
  paymentMethod?: string;
  linkedReceiptIds?: number[];
  pdfSnapshot?: any;
  category?: string;
  lineCount?: number;
  centerId?: number; // New field for Billing Center association
}

/**
 * Representa una entrada en el libro diario de contabilidad.
 */
export interface LedgerEntry {
  id: number;
  date: string; // ISO Date string
  account: string;
  concept: string;
  debit: number;
  credit: number;
}

/**
 * Representa un modelo fiscal presentado.
 */
export interface FiscalModel {
    id: number;
    modelType: string; // e.g., '303'
    period: string; // e.g., '1T'
    year: number;
    status: 'Presented' | 'Pending';
}

// --- WIKI ---
export interface WikiCategory { id: number; name: string; description?: string; image?: string; }
export interface WikiClass { id: number; categoryId: number; name: string; description?: string; image?: string; }
export type BlockType = 'text' | 'video' | 'image' | 'quiz';
export interface TextBlockContent { html: string; }
export interface VideoBlockContent { url: string; provider: 'youtube' | 'vimeo'; }
export interface ImageBlockContent { url: string; caption?: string; file?: File; }
export interface QuizOption { id: string; text: string; isCorrect: boolean; }
export interface QuizBlockContent { question: string; options: QuizOption[]; }
export interface LessonBlock { id: string; type: BlockType; order: number; content: TextBlockContent | VideoBlockContent | ImageBlockContent | QuizBlockContent; }
export interface WikiLesson { id: number; categoryId: number; classId: number; title: string; content: string; isVisible: boolean; blocks?: LessonBlock[]; attachments?: any[]; }
export interface TeacherPermission { id: number; teacherId: number; categoryId?: number; classId?: number; lessonId?: number; canEdit?: boolean; }
export interface TaughtSession { id: number; teacherId: number; date: string; duration: number; group: string; lessonId?: number; notes?: string; courseClassId?: string; }

// --- BILLING ---
export interface BankAccount { id: number; centerId: number; name: string; iban: string; bic: string; suffix: string; bank: string; isDefault: boolean; }
export interface BillingSeries { 
    id: number; 
    centerId: number; 
    year: number; 
    code: string; 
    isRectifying: boolean; 
    invoiceCount: number; 
    budgetCount: number; 
    isActive: boolean; 
    nextNumber?: number; // New field for auto-increment
}
export interface BillingPaymentMethod { id: number; centerId: number; name: string; icon: string; gatewayType: 'None' | 'Redsys' | 'Stripe' | 'Paypal'; isActive: boolean; }
export interface BillingCenter { id: number; name: string; nif: string; email?: string; address?: string; population?: string; postalCode?: string; phone?: string; web?: string; irpfPercent: number; ivaPercent: number; bankAccountCount: number; seriesCount: number; paymentMethodCount: number; isFacturaE: boolean; isActive: boolean; bankAccounts?: BankAccount[]; series?: BillingSeries[]; paymentMethods?: BillingPaymentMethod[]; }
export interface BillingClient { id: number; isCompany: boolean; companyName?: string; firstName: string; lastName?: string; email: string; nif: string; isActive: boolean; altaDate: string; sepaSigned: boolean; commsAllowed: boolean; stats: { emails: number; docs: number; invoices: number; quotes: number; }; }
export interface ProformaInvoice { id: number; series: string; number: string; date: string; client: any; clientId?: number; lineCount: number; total: number; isSent: boolean; linkedReceiptIds?: number[]; }
export interface Quote { id: number; /* ... */ }
export interface DocumentType { id: number; name: string; }
export interface DefaultConcept { id: number; name: string; price: number; }

// --- ADMIN ---
export type DatabaseProvider = 'local' | 'firebase' | 'supabase';
export interface DatabaseConfig { provider: DatabaseProvider; firebaseConfig?: { apiKey: string; authDomain: string; projectId: string; storageBucket: string; messagingSenderId: string; appId: string; }; supabaseConfig?: { url: string; anonKey: string; }; }

// --- FILE MANAGER ---
export type FileType = 'invoice_pdf' | 'receipt_pdf' | 'user_upload' | 'document';
export interface StoredFile {
    id: string; // UUID or string ID
    fileName: string;
    fileUrl: string; // Could be a real URL or a base64 data URI for now
    fileType: FileType;
    relatedTable?: string;
    relatedId?: number | string;
    centerId?: number;
    createdAt: string; // ISO Date
    size?: number; // Optional size in bytes
}

// --- GRADE REPORTS ---
export type ReportStatus = 'No inicializado' | 'En edición' | 'En revisión' | 'Acabado' | 'Enviado';

export interface Report {
    id: number;
    studentId: number;
    courseId: number;
    title: string;
    type: string; // 'Standard', 'Boletín', etc.
    deliveryDate: string; // ISO Date
    status: ReportStatus;
    isGenerated: boolean; // For "Archivo generado" column
}

export interface PredefinedComment {
    id: number;
    text: string;
    teacherId?: number; // If null, global?
    tags: number[]; // Array of tag IDs
    isActive: boolean;
}

export interface CommentTag {
    id: number;
    name: string;
    isActive: boolean;
}

// --- COMMUNICATIONS ---
export interface EmailTemplate {
    id: number;
    name: string; // Nombre interno (e.g. "Aviso Falta")
    subject: string; // Asunto del email
    body: string; // HTML Body
    systemSlug?: string; // "attendance_warning", "payment_reminder", etc. Can't be deleted if present.
    variables: string[]; // List of available vars e.g. ["#{STUDENT_NAME}#", "#{DATE}#"]
}

export interface CommunicationLog {
    id: string;
    date: string; // ISO
    subject: string;
    body: string; // Stores the actual sent body (snapshot)
    senderId: number; // User ID
    recipientEmail: string;
    recipientName: string;
    type: 'Manual' | 'Automático';
    status: 'Sent' | 'Failed';
}

// --- LANDING PAGES ---
export interface LandingCustomField {
    id: number;
    landingId: number;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'date' | 'select' | 'boolean' | 'file';
    required: boolean;
    order: number;
    options?: string; // Comma separated options for select
    isActive: boolean;
    description?: string;
}

export type LandingCourseSelectionMode = 'all' | 'groups' | 'levels' | 'courses' | 'location';

export interface LandingPage {
    id: number;
    title: string;
    slug: string; // e.g. "matricula-2025"
    isActive: boolean;
    isDefault: boolean;
    
    // Configuración General
    description?: string;
    footerText?: string;
    
    // Estilos
    styles: {
        primaryColor: string;
        heroImageUrl?: string;
        logoUrl?: string;
        backgroundColor?: string;
    };
    
    // NEW: Configuration for Step Titles
    stepConfig?: {
        step1Title: string; // Datos básicos
        step2Title: string; // Otros datos
        step3Title: string; // Cursos
        step4Title: string; // Pago
    };
    
    // NEW: Block titles for specific steps (content headers)
    studentDataBlockTitle?: string;
    studentDataBlockDescription?: string; 
    courseSelectionBlockTitle?: string;
    courseSelectionBlockDescription?: string; 
    paymentBlockTitle?: string;
    paymentBlockDescription?: string;

    // Configuración Cursos
    offeredCourseIds: number[];
    courseSelectionMode: LandingCourseSelectionMode;
    selectedGroupIds?: number[];
    selectedLevelIds?: number[];
    bannedLocationIds?: number[]; // IDs de localizaciones a excluir en el selector de localización

    showVacancies: boolean;
    showDates: boolean;
    showPrices: boolean; // material, matricula, cuotas toggles condensed
    showLocation: boolean;
    showTotalClasses: boolean;
    showSchedule: boolean;
    
    allowMultipleCourses: boolean;
    allowReturnToEnroll: boolean;
    
    // Configuración Pasos
    studentFields: {
        dniRequired: boolean;
        birthDateRequired: boolean;
        addressRequired: boolean;
        postalAddressRequired: boolean;
        photoRequired: boolean;
        photoActive: boolean; // New field to toggle photo step
        observationsActive: boolean;
    };
    
    customFieldsBlock: {
        isActive: boolean;
        title: string;
        description: string;
    };
    
    additionalInfoBlock: {
        title: string;
        description: string;
        askMedical: boolean;
        secondTutorRequired: boolean;
        askLeaveAlone: boolean;
        requestTutorIfMinor: boolean;
    };

    // Pagos
    paymentMethods: {
        cash: boolean;
        transfer: boolean;
        domiciliation: boolean;
        card: boolean;
        bizum: boolean;
    };
    askBillingData: boolean;
    
    // Textos Legales
    privacyPolicy: {
        useAcademyText: boolean;
        customTitle: string;
        customText: string;
        checkboxText: string;
    };
    supportText: {
        modalTitle: string;
        content: string;
    };
    
    // Notificaciones
    notifications: {
        notifyEmail: string;
        confirmationSubject: string;
        confirmationBody: string;
        confirmationTemplateId?: number;
        existingStudentSubject: string;
        existingStudentBody: string;
        existingStudentTemplateId?: number;
    };
    
    // Logic
    studentAccessMode: 'all' | 'new_only' | 'existing_only'; // Replaces newStudentsOnly
    authorizationIds: number[]; // IDs de autorizaciones personalizadas
    
    // Stats
    visits: number;
    conversions: number;
}

export {};
