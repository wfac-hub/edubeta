
import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { 
    User, Role, Course, Student, Classroom, Population, Location, WeekSchedule, Holiday, 
    LevelGroup, CourseLevel, Enrollment, AttendanceRecord, CourseClass, Resource, 
    Teacher, AcademyProfile, Receipt, WaitingListEntry, AuthorizationGroup, Authorization, 
    StudentAuthorization, StudentHistoryEntry, StudentTag, FiscalConfig, Invoice, 
    LedgerEntry, FiscalModel, WikiCategory, WikiClass, WikiLesson, TeacherPermission, 
    TaughtSession, BillingCenter, BillingClient, ProformaInvoice, Quote, 
    DocumentType, DefaultConcept, BankAccount, BillingSeries, BillingPaymentMethod,
    NewEnrollment, ActivityLog, DatabaseConfig, Report, PredefinedComment, CommentTag,
    EmailTemplate, CommunicationLog, LandingPage, LandingCustomField, StoredFile
} from '../types';
import * as MockData from '../services/mockData';
import { generateCourseClasses } from '../utils/calendar';
import { isSameDayMonth } from '../utils/helpers';
import { dataService } from '../services/dataService';

interface DataContextType {
    users: User[];
    populations: Population[];
    locations: Location[];
    schedules: WeekSchedule[];
    classrooms: Classroom[];
    holidays: Holiday[];
    levelGroups: LevelGroup[];
    courseLevels: CourseLevel[];
    teachers: Teacher[];
    courses: Course[];
    students: Student[];
    enrollments: Enrollment[];
    receipts: Receipt[];
    invoices: Invoice[];
    ledgerEntries: LedgerEntry[];
    attendanceRecords: AttendanceRecord[];
    courseClasses: CourseClass[];
    academyProfile: AcademyProfile;
    resources: Resource[];
    waitingList: WaitingListEntry[];
    authGroups: AuthorizationGroup[];
    authorizations: Authorization[];
    studentAuthorizations: StudentAuthorization[];
    studentHistory: StudentHistoryEntry[];
    studentTags: StudentTag[];
    billingCenters: BillingCenter[];
    billingClients: BillingClient[];
    proformaInvoices: ProformaInvoice[];
    quotes: Quote[];
    documentTypes: DocumentType[];
    defaultConcepts: DefaultConcept[];
    fiscalModels: FiscalModel[];
    fiscalConfig: FiscalConfig;
    wikiCategories: WikiCategory[];
    wikiClasses: WikiClass[];
    wikiLessons: WikiLesson[];
    wikiPermissions: TeacherPermission[];
    taughtSessions: TaughtSession[];
    activityLogs: ActivityLog[];
    dbConfig: DatabaseConfig;
    reports: Report[];
    predefinedComments: PredefinedComment[];
    commentTags: CommentTag[];
    emailTemplates: EmailTemplate[];
    communicationLogs: CommunicationLog[];
    landingPages: LandingPage[];
    landingCustomFields: LandingCustomField[];
    storedFiles: StoredFile[];

    studentMap: Record<number, Student>;
    courseMap: Record<number, Course>;
    teacherMap: Record<number, Teacher>;
    classroomMap: Record<number, Classroom>;
    teacherStatsMap: Record<number, { coursesCount: number, hoursCount: number, docsCount: number }>;
    todayBirthdays: Student[];

    isLoading: boolean;
    refreshData: () => Promise<void>;
    updateDbConfig: (config: DatabaseConfig) => void;

    updateUser: (user: User) => void;
    deleteUsers: (ids: number[]) => void;
    logActivity: (action: string, details?: string) => void;
    setCurrentUserForLog: (userId: number | null) => void;
    updatePopulation: (population: Population) => void;
    deletePopulations: (ids: number[]) => void;
    updateLocation: (location: Location) => void;
    deleteLocations: (ids: number[]) => void;
    updateSchedule: (schedule: WeekSchedule) => void;
    deleteSchedules: (ids: number[]) => void;
    updateClassroom: (classroom: Classroom) => void;
    deleteClassrooms: (ids: number[]) => void;
    updateHoliday: (holiday: Holiday) => void;
    deleteHolidays: (ids: number[]) => void;
    updateLevelGroup: (group: LevelGroup) => void;
    deleteLevelGroups: (ids: number[]) => void;
    updateCourseLevel: (level: CourseLevel) => void;
    deleteCourseLevels: (ids: number[]) => void;
    moveCourseLevel: (id: number, direction: 'up' | 'down') => void;
    updateTeacher: (teacher: Teacher) => void;
    deleteTeachers: (ids: number[]) => void;
    updateCourse: (course: Course) => void;
    deleteCourses: (ids: number[]) => void;
    updateStudent: (student: Student) => void;
    deleteStudents: (ids: number[]) => void;
    addEnrollments: (enrollments: NewEnrollment[]) => void;
    cancelEnrollment: (id: number, date: string, deleteFutureReceipts: boolean) => void;
    deleteEnrollments: (ids: number[]) => void;
    updateReceipt: (receipt: Receipt) => void;
    deleteReceipts: (ids: number[]) => void;
    generateReceiptPdf: (id: number) => void;
    generateInvoiceFromReceipt: (receiptId: number, series: string, date: string) => void;
    updateInvoice: (invoice: Invoice) => void;
    deleteInvoices: (ids: number[]) => void;
    rectifyInvoice: (id: number, series: string, date: string, isProvisional: boolean) => void;
    updateAcademyProfile: (profile: AcademyProfile) => void;
    addResource: (file: File, scope: string, scopeId?: number | string) => Promise<void>;
    updateResource: (resource: Resource) => void;
    deleteResources: (ids: string[]) => void;
    updateAuthGroup: (group: AuthorizationGroup) => void;
    deleteAuthGroups: (ids: number[]) => void;
    updateAuthorization: (auth: Authorization) => void;
    deleteAuthorizations: (ids: number[]) => void;
    createStudentAuthorization: (studentId: number, authId: number) => string;
    deleteStudentAuthorizations: (ids: string[]) => void;
    sendAuthorizationRequest: (studentAuthId: string) => void;
    signAuthorization: (token: string, signerName: string, signerNif: string, signatureSvg: string) => string | null;
    deleteWaitingListEntries: (ids: number[]) => void;
    updateStudentTag: (tag: StudentTag) => void;
    deleteStudentTags: (ids: number[]) => void;
    updateBillingCenter: (center: BillingCenter) => void;
    deleteBillingCenters: (ids: number[]) => void;
    updateBankAccount: (account: BankAccount) => void;
    deleteBankAccounts: (ids: number[]) => void;
    updateBillingSeries: (series: BillingSeries) => void;
    deleteBillingSeries: (ids: number[]) => void;
    updatePaymentMethod: (method: BillingPaymentMethod) => void;
    deletePaymentMethods: (ids: number[]) => void;
    updateFiscalConfig: (config: FiscalConfig) => void;
    updateWikiCategory: (category: WikiCategory) => void;
    deleteWikiCategories: (ids: number[]) => void;
    updateWikiClass: (wikiClass: WikiClass) => void;
    deleteWikiClasses: (ids: number[]) => void;
    updateWikiLesson: (lesson: WikiLesson) => void;
    deleteWikiLessons: (ids: number[]) => void;
    updateWikiPermission: (permission: TeacherPermission) => void;
    deleteWikiPermissions: (ids: number[]) => void;
    addTaughtSession: (session: TaughtSession) => void;
    updateTaughtSession: (session: TaughtSession) => void;
    addCourseClass: (courseClass: CourseClass) => void;
    updateCourseClass: (courseClass: CourseClass) => void;
    deleteCourseClasses: (ids: string[]) => void;
    setCourseClasses: (classes: CourseClass[]) => void;
    updateAttendanceRecord: (record: AttendanceRecord) => void;
    addAttendanceRecords: (records: AttendanceRecord[]) => Promise<void>;
    updateAttendanceRecords: (records: AttendanceRecord[]) => Promise<void>;
    deleteAttendanceRecords: (ids: string[]) => void;
    updateReport: (report: Report) => void;
    deleteReports: (ids: number[]) => void;
    updatePredefinedComment: (comment: PredefinedComment) => void;
    deletePredefinedComments: (ids: number[]) => void;
    updateCommentTag: (tag: CommentTag) => void;
    deleteCommentTags: (ids: number[]) => void;
    updateEmailTemplate: (template: EmailTemplate) => void;
    deleteEmailTemplates: (ids: number[]) => void;
    sendEmail: (templateId: number, recipients: {email: string, name: string}[], variableData?: any) => void;
    createBillingClient: (client: BillingClient) => void;
    updateBillingClient: (client: BillingClient) => void;
    deleteBillingClients: (ids: number[]) => void;
    createDocumentType: (docType: DocumentType) => void;
    updateDocumentType: (docType: DocumentType) => void;
    deleteDocumentTypes: (ids: number[]) => void;
    createDefaultConcept: (concept: DefaultConcept) => void;
    updateDefaultConcept: (concept: DefaultConcept) => void;
    deleteDefaultConcepts: (ids: number[]) => void;
    updateLandingPage: (landing: LandingPage) => void;
    deleteLandingPages: (ids: number[]) => void;
    updateLandingCustomField: (field: LandingCustomField) => void;
    deleteLandingCustomFields: (ids: number[]) => void;
    updateBillingSeriesState: (series: BillingSeries) => void;
    addStoredFile: (file: StoredFile) => void;
    deleteStoredFiles: (ids: string[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [dbConfig, setDbConfig] = useState<DatabaseConfig>(() => {
        const stored = localStorage.getItem('dbConfig');
        return stored ? JSON.parse(stored) : { provider: 'local' };
    });

    const [isLoading, setIsLoading] = useState(true);

    // --- STATE DEFINITIONS ---
    const [users, setUsers] = useState<User[]>([]);
    const [populations, setPopulations] = useState<Population[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [schedules, setSchedules] = useState<WeekSchedule[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [levelGroups, setLevelGroups] = useState<LevelGroup[]>([]);
    const [courseLevels, setCourseLevels] = useState<CourseLevel[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [courseClasses, setCourseClasses] = useState<CourseClass[]>([]);
    const [academyProfile, setAcademyProfile] = useState<AcademyProfile>(MockData.MOCK_ACADEMY_PROFILE);
    const [resources, setResources] = useState<Resource[]>([]);
    const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([]);
    const [authGroups, setAuthGroups] = useState<AuthorizationGroup[]>([]);
    const [authorizations, setAuthorizations] = useState<Authorization[]>([]);
    const [studentAuthorizations, setStudentAuthorizations] = useState<StudentAuthorization[]>([]);
    const [studentHistory, setStudentHistory] = useState<StudentHistoryEntry[]>([]);
    const [studentTags, setStudentTags] = useState<StudentTag[]>([]);
    const [billingCenters, setBillingCenters] = useState<BillingCenter[]>([]);
    const [billingClients, setBillingClients] = useState<BillingClient[]>([]);
    const [proformaInvoices, setProformaInvoices] = useState<ProformaInvoice[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [defaultConcepts, setDefaultConcepts] = useState<DefaultConcept[]>([]);
    const [fiscalModels, setFiscalModels] = useState<FiscalModel[]>([]);
    const [fiscalConfig, setFiscalConfig] = useState<FiscalConfig>(MockData.MOCK_FISCAL_CONFIG);
    const [wikiCategories, setWikiCategories] = useState<WikiCategory[]>([]);
    const [wikiClasses, setWikiClasses] = useState<WikiClass[]>([]);
    const [wikiLessons, setWikiLessons] = useState<WikiLesson[]>([]);
    const [wikiPermissions, setWikiPermissions] = useState<TeacherPermission[]>([]);
    const [taughtSessions, setTaughtSessions] = useState<TaughtSession[]>([]);
    const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
    const [landingCustomFields, setLandingCustomFields] = useState<LandingCustomField[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [predefinedComments, setPredefinedComments] = useState<PredefinedComment[]>([]);
    const [commentTags, setCommentTags] = useState<CommentTag[]>([]);
    const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
    const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
    const [currentUserId, setCurrentUserId] = useState<number | null>(1);

    const refreshData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Split requests into batches to avoid tuple limit in Promise.all
            const results1 = await Promise.all([
                dataService.getAll<User>('users'),
                dataService.getAll<Population>('populations'),
                dataService.getAll<Location>('locations'),
                dataService.getAll<WeekSchedule>('week_schedules'),
                dataService.getAll<Classroom>('classrooms'),
                dataService.getAll<Holiday>('holidays'),
                dataService.getAll<LevelGroup>('level_groups'),
                dataService.getAll<CourseLevel>('course_levels'),
                dataService.getAll<Teacher>('teachers'),
                dataService.getAll<Course>('courses'),
            ]);

            const results2 = await Promise.all([
                dataService.getAll<Student>('students'),
                dataService.getAll<Enrollment>('enrollments'),
                dataService.getAll<Receipt>('receipts'),
                dataService.getAll<Invoice>('invoices'),
                dataService.getAll<AttendanceRecord>('attendance_records'),
                dataService.getAll<CourseClass>('course_classes'),
                dataService.getAll<Resource>('resources'),
                dataService.getAll<WaitingListEntry>('waiting_list'),
                dataService.getAll<AuthorizationGroup>('auth_groups'),
                dataService.getAll<Authorization>('authorizations'),
            ]);

            const results3 = await Promise.all([
                dataService.getAll<StudentAuthorization>('student_authorizations'),
                dataService.getAll<LandingPage>('landing_pages'),
                dataService.getAll<EmailTemplate>('email_templates'),
                dataService.getAll<BillingClient>('billing_clients'),
                dataService.getAll<BillingCenter>('billing_centers'),
                dataService.getAll<DocumentType>('document_types'),
                dataService.getAll<DefaultConcept>('default_concepts'),
                dataService.getAll<BankAccount>('bank_accounts'),
                dataService.getAll<BillingSeries>('billing_series'),
                dataService.getAll<BillingPaymentMethod>('billing_payment_methods'),
            ]);

            const results4 = await Promise.all([
                dataService.getAll<WikiCategory>('wiki_categories'),
                dataService.getAll<WikiClass>('wiki_classes'),
                dataService.getAll<WikiLesson>('wiki_lessons'),
                dataService.getAll<TeacherPermission>('teacher_permissions'),
                dataService.getAll<TaughtSession>('taught_sessions'),
                dataService.getAll<LandingCustomField>('landing_custom_fields'),
                dataService.getAll<Report>('reports'),
                dataService.getAll<PredefinedComment>('predefined_comments'),
                dataService.getAll<CommentTag>('comment_tags'),
                dataService.getAll<CommunicationLog>('communication_logs'),
            ]);

            const results5 = await Promise.all([
                dataService.getAll<ActivityLog>('activity_logs'),
                dataService.getAll<AcademyProfile>('academy_profile'),
                dataService.getAll<FiscalConfig>('fiscal_config'),
                dataService.getAll<ProformaInvoice>('proforma_invoices'),
                dataService.getAll<Quote>('quotes'),
                dataService.getAll<FiscalModel>('fiscal_models'),
                dataService.getAll<LedgerEntry>('ledger_entries'),
                dataService.getAll<StudentHistoryEntry>('student_history'),
                dataService.getAll<StudentTag>('student_tags'),
                dataService.getAll<StoredFile>('stored_files')
            ]);

            const [
                _users, _populations, _locations, _schedules, _classrooms, _holidays,
                _levelGroups, _courseLevels, _teachers, _courses
            ] = results1;

            const [
                _students, _enrollments, _receipts, _invoices, _attendance, _courseClasses,
                _resources, _waitingList, _authGroups, _auths
            ] = results2;

            const [
                _studentAuths, _landingPages, _emailTemplates, _billingClients, _billingCenters,
                _docTypes, _concepts, _bankAccounts, _billingSeries, _paymentMethods
            ] = results3;

            const [
                _wikiCats, _wikiClasses, _wikiLessons, _wikiPermissions, _taughtSessions,
                _landingCustomFields, _reports, _predefinedComments, _commentTags, _communicationLogs
            ] = results4;

            const [
                _activityLogs, _academyProfiles, _fiscalConfig, _proformaInvoices, _quotes, _fiscalModels,
                _ledgerEntries, _studentHistory, _studentTags, _storedFiles
            ] = results5;

            setUsers(_users);
            setPopulations(_populations);
            setLocations(_locations);
            setSchedules(_schedules);
            setClassrooms(_classrooms);
            setHolidays(_holidays);
            setLevelGroups(_levelGroups);
            setCourseLevels(_courseLevels);
            setTeachers(_teachers);
            setStudents(_students);
            setEnrollments(_enrollments);
            setReceipts(_receipts);
            setInvoices(_invoices);
            setAttendanceRecords(_attendance);
            
            // Convert DB dates (strings) back to Date objects for calendar logic
            const processedCourseClasses = _courseClasses.map(c => ({
                ...c,
                date: new Date(c.date)
            }));
            setCourseClasses(processedCourseClasses);

            setResources(_resources);
            setWaitingList(_waitingList);

            // Enriquecer cursos con contadores calculados
            const enrichedCourses = _courses.map(course => ({
                ...course,
                classesCount: processedCourseClasses.filter(c => c.courseId === course.id).length,
                resourcesCount: _resources.filter(r => r.scope === 'course' && Number(r.scopeId) === course.id).length,
                standbyStudents: _waitingList.filter(w => w.courseId === course.id).length
            }));
            setCourses(enrichedCourses);

            setAuthGroups(_authGroups);
            setAuthorizations(_auths);
            setStudentAuthorizations(_studentAuths);
            setLandingPages(_landingPages);
            setEmailTemplates(_emailTemplates);
            setBillingClients(_billingClients);
            setDocumentTypes(_docTypes);
            setDefaultConcepts(_concepts);
            setStudentHistory(_studentHistory);
            setStudentTags(_studentTags);
            
            // Hydrate Billing Centers with sub-items for easy access in UI (Backward compatibility)
            const hydratedCenters = _billingCenters.map(center => ({
                ...center,
                bankAccounts: _bankAccounts.filter(a => a.centerId === center.id),
                series: _billingSeries.filter(s => s.centerId === center.id),
                paymentMethods: _paymentMethods.filter(m => m.centerId === center.id)
            }));
            setBillingCenters(hydratedCenters);

            // Set other states
            setWikiCategories(_wikiCats);
            setWikiClasses(_wikiClasses);
            setWikiLessons(_wikiLessons);
            setWikiPermissions(_wikiPermissions);
            setTaughtSessions(_taughtSessions);
            setLandingCustomFields(_landingCustomFields);
            setReports(_reports);
            setPredefinedComments(_predefinedComments);
            setCommentTags(_commentTags);
            setCommunicationLogs(_communicationLogs);
            setActivityLogs(_activityLogs);
            setStoredFiles(_storedFiles);
            
            if (_academyProfiles && _academyProfiles.length > 0) {
                setAcademyProfile(_academyProfiles[0]);
            }
             if (_fiscalConfig && _fiscalConfig.length > 0) {
                setFiscalConfig(_fiscalConfig[0]);
            }
            setProformaInvoices(_proformaInvoices);
            setQuotes(_quotes);
            setFiscalModels(_fiscalModels);
            setLedgerEntries(_ledgerEntries);

        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        dataService.loadConfig();
        refreshData();
    }, [refreshData]);

    const studentMap = useMemo(() => Object.fromEntries(students.map(s => [s.id, s])), [students]);
    const courseMap = useMemo(() => Object.fromEntries(courses.map(c => [c.id, c])), [courses]);
    const teacherMap = useMemo(() => Object.fromEntries(teachers.map(t => [t.id, t])), [teachers]);
    const classroomMap = useMemo(() => Object.fromEntries(classrooms.map(c => [c.id, c])), [classrooms]);
    
    const teacherStatsMap = useMemo(() => {
        const stats: Record<number, { coursesCount: number, hoursCount: number, docsCount: number }> = {};
        teachers.forEach(t => {
            stats[t.id] = {
                coursesCount: courses.filter(c => c.teacherId === t.id).length,
                hoursCount: courseClasses.filter(c => c.teacherId === t.id && c.status === 'Hecha').reduce((acc, curr) => {
                    const [h1, m1] = curr.startTime.split(':').map(Number);
                    const [h2, m2] = curr.endTime.split(':').map(Number);
                    return acc + ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
                }, 0),
                docsCount: resources.filter(r => r.scope === 'teacher' && r.scopeId === t.id).length
            };
        });
        return stats;
    }, [teachers, courses, courseClasses, resources]);
    
    const todayBirthdays = useMemo(() => {
        if (!academyProfile.studentBirthdayModule) return [];
        return students.filter(s => s.isActive && isSameDayMonth(s.birthDate));
    }, [students, academyProfile.studentBirthdayModule]);

    const updateItem = useCallback(async <T extends { id: number | string }>(
        setter: React.Dispatch<React.SetStateAction<T[]>> | null, 
        item: T,
        tableName: string,
        transform?: (item: T) => T
    ) => {
        // Optimistic Update (if setter is available and IS A FUNCTION)
        if (setter && typeof setter === 'function') {
             setter(prev => {
                const index = prev.findIndex(i => i.id === item.id);
                if (index >= 0) {
                    const newArr = [...prev];
                    newArr[index] = item;
                    return newArr;
                }
                 if (typeof item.id === 'number' && item.id === 0) {
                    return [...prev, item]; 
                }
                return [...prev, item];
            });
        }

        const isNew = (typeof item.id === 'number' && item.id <= 0) || !item.id;
        const savedItem = isNew ? await dataService.create(tableName, item) : await dataService.update(tableName, item);

        // Fix ID synchronization for Supabase or local refresh
        if (savedItem) {
             if (setter && typeof setter === 'function' && dataService.getProvider() === 'supabase') {
                const processedItem = transform ? transform(savedItem) : savedItem;
                setter(prev => prev.map(i => {
                    if (i.id === item.id && !isNew) return processedItem;
                    if (isNew && i === item) return processedItem;
                    return i;
                }));
            } else if (isNew && setter && typeof setter === 'function' && dataService.getProvider() === 'local') {
                setter(prev => prev.map(i => i === item ? savedItem! : i));
            }
        }
    }, []);

    // NEW: Helper for Singleton Objects (like academyProfile, fiscalConfig)
    const updateSingleton = useCallback(async <T extends { id: number | string }>(
        setter: React.Dispatch<React.SetStateAction<T>>,
        item: T,
        tableName: string
    ) => {
        // Optimistic Update
        setter(item);

        // Is it a new record? (ID <= 0 or missing)
        // For singletons in this app, usually they exist (id=1), but this covers edge cases.
        const isNew = (typeof item.id === 'number' && item.id <= 0) || !item.id;
        
        const savedItem = isNew 
            ? await dataService.create(tableName, item) 
            : await dataService.update(tableName, item);

        if (savedItem) {
            // Update state with confirmed data from DB
            setter(savedItem);
        }
    }, []);

    const createManyItems = useCallback(async <T extends { id: number | string }>(
        setter: React.Dispatch<React.SetStateAction<T[]>>, 
        items: T[],
        tableName: string
    ) => {
        if (typeof setter === 'function') {
            setter(prev => [...prev, ...items]);
        }
        await dataService.createMany(tableName, items);
    }, []);

    const deleteItems = useCallback(async <T extends { id: number | string }>(
        setter: React.Dispatch<React.SetStateAction<T[]>>, 
        ids: (number | string)[],
        tableName: string
    ) => {
        if (typeof setter === 'function') {
            setter(prev => prev.filter(i => !ids.includes(i.id)));
        }
        await dataService.delete(tableName, ids);
    }, []);

    const setCurrentUserForLog = useCallback((userId: number | null) => setCurrentUserId(userId), []);

    const logActivity = useCallback((action: string, details?: string) => {
        const userId = currentUserId || 1; 
        const newLog: ActivityLog = {
            id: `log-${Date.now()}`,
            date: new Date().toISOString(),
            action,
            details,
            user: users.find(u => u.id === userId)
        };
        setActivityLogs(prev => [newLog, ...prev]);
    }, [currentUserId, users]);

    const updateDbConfig = useCallback((config: DatabaseConfig) => {
        setDbConfig(config);
        localStorage.setItem('dbConfig', JSON.stringify(config));
        dataService.loadConfig(); 
        refreshData(); 
        logActivity('Cambio configuración DB', `Proveedor: ${config.provider}`);
    }, [logActivity, refreshData]);

    const updatePopulation = useCallback((p: Population) => { updateItem(setPopulations, p, 'populations'); }, [updateItem]);
    const deletePopulations = useCallback((ids: number[]) => { deleteItems(setPopulations, ids, 'populations'); }, [deleteItems]);
    const updateUser = useCallback((u: User) => { updateItem(setUsers, u, 'users'); }, [updateItem]);
    const deleteUsers = useCallback((ids: number[]) => { deleteItems(setUsers, ids, 'users'); }, [deleteItems]);
    
    const updateLocation = (l: Location) => updateItem(setLocations, l, 'locations');
    const deleteLocations = (ids: number[]) => deleteItems(setLocations, ids, 'locations');
    const updateSchedule = (s: WeekSchedule) => updateItem(setSchedules, s, 'week_schedules');
    const deleteSchedules = (ids: number[]) => deleteItems(setSchedules, ids, 'week_schedules');
    const updateClassroom = (c: Classroom) => updateItem(setClassrooms, c, 'classrooms');
    const deleteClassrooms = (ids: number[]) => deleteItems(setClassrooms, ids, 'classrooms');
    const updateHoliday = (h: Holiday) => updateItem(setHolidays, h, 'holidays');
    const deleteHolidays = (ids: number[]) => deleteItems(setHolidays, ids, 'holidays');
    
    const updateCourse = useCallback((course: Course) => {
        const updatedCourse = { ...course, classesCount: generateCourseClasses(course, schedules, holidays, classrooms).length };
        updateItem(setCourses, updatedCourse, 'courses');
    }, [updateItem, schedules, holidays, classrooms]);

    const deleteCourses = (ids: number[]) => deleteItems(setCourses, ids, 'courses');
    
    const addAttendanceRecords = useCallback(async (records: AttendanceRecord[]) => {
        await createManyItems(setAttendanceRecords, records, 'attendance_records');
    }, [createManyItems]);

    const updateAttendanceRecords = useCallback(async (records: AttendanceRecord[]) => {
        setAttendanceRecords(prev => {
            const updatesMap = new Map(records.map(r => [r.id, r]));
            return prev.map(r => updatesMap.get(r.id) || r);
        });
        for (const record of records) {
             await dataService.update('attendance_records', record);
        }
    }, []);

    const deleteAttendanceRecords = useCallback((ids: string[]) => {
        deleteItems(setAttendanceRecords, ids as any, 'attendance_records');
    }, [deleteItems]);

    const addEnrollments = async (enrollmentsData: NewEnrollment[]) => {
        // 1. Guardar inscripciones
        const enrollmentsToCreate = enrollmentsData.map(e => ({ ...e, id: 0 }));
        await createManyItems(setEnrollments, enrollmentsToCreate as any, 'enrollments');
        
        // 2. Preparar registros de asistencia
        const newRecords: AttendanceRecord[] = [];

        enrollmentsData.forEach(enrollment => {
            const enrollmentDateStr = enrollment.enrollmentDate; // YYYY-MM-DD string

             const classes = courseClasses.filter(c => 
                c.courseId === enrollment.courseId
            );
            
            classes.forEach(c => {
                // Use string comparison for date matching to avoid timezone issues
                const classDateStr = c.date.toISOString().split('T')[0];
                const recordId = `${enrollment.studentId}-${c.id}`;

                // FIX: Only generate attendance records for classes ON or AFTER enrollment date
                // This prevents "ghost" attendance records for classes before the student joined.
                if (classDateStr >= enrollmentDateStr) {
                     // Only create if it doesn't exist locally
                    if (!attendanceRecords.some(ar => ar.id === recordId)) {
                         
                         // Determine status based on Class status
                         let status: 'Pendiente' | 'Realizado' | 'Anulado' = 'Pendiente';
                         if (c.status === 'Hecha') status = 'Realizado';
                         else if (c.status === 'Anulada') status = 'Anulado';

                         newRecords.push({
                            id: recordId,
                            classId: c.id,
                            studentId: enrollment.studentId,
                            attended: false, 
                            late: 'No',
                            absenceJustified: false,
                            homeworkDone: false,
                            comments: '',
                            status: status
                        });
                    }
                }
            });
        });
        
        if (newRecords.length > 0) {
            await addAttendanceRecords(newRecords);
        }
    };

    const cancelEnrollment = (id: number, date: string, deleteFutureReceipts: boolean) => {
        const e = enrollments.find(en => en.id === id);
        if (e) updateItem(setEnrollments, { ...e, isActive: false, cancellationDate: date }, 'enrollments');
    };
    const deleteEnrollments = (ids: number[]) => deleteItems(setEnrollments, ids, 'enrollments');
    const updateReceipt = (r: Receipt) => updateItem(setReceipts, r, 'receipts');
    const deleteReceipts = (ids: number[]) => deleteItems(setReceipts, ids, 'receipts');
    const updateInvoice = (i: Invoice) => updateItem(setInvoices, i, 'invoices');
    const deleteInvoices = (ids: number[]) => deleteItems(setInvoices, ids, 'invoices');
    const updateLevelGroup = (g: LevelGroup) => updateItem(setLevelGroups, g, 'level_groups');
    const deleteLevelGroups = (ids: number[]) => deleteItems(setLevelGroups, ids, 'level_groups');
    const updateCourseLevel = (l: CourseLevel) => updateItem(setCourseLevels, l, 'course_levels');
    const deleteCourseLevels = (ids: number[]) => deleteItems(setCourseLevels, ids, 'course_levels');
    const moveCourseLevel = (id: number, dir: 'up' | 'down') => {}; 
    const updateTeacher = (t: Teacher) => updateItem(setTeachers, t, 'teachers');
    const deleteTeachers = (ids: number[]) => deleteItems(setTeachers, ids, 'teachers');
    const updateStudent = (s: Student) => updateItem(setStudents, s, 'students');
    const deleteStudents = (ids: number[]) => deleteItems(setStudents, ids, 'students');
    
    const generateReceiptPdf = (id: number) => {
         const receipt = receipts.find(r => r.id === id);
         if (receipt && !receipt.pdfSnapshot) {
             const student = students.find(s => s.id === receipt.studentId);
             const course = courses.find(c => c.id === receipt.courseId);
             const teacher = teachers.find(t => t.id === course?.teacherId);
             
             if (student && course && teacher) {
                const snapshot = {
                    generatedAt: new Date().toISOString(),
                    studentName: `${student.firstName} ${student.lastName}`,
                    studentDni: student.dni,
                    courseName: course.name,
                    teacherName: `${teacher.name} ${teacher.lastName}`,
                    paymentType: receipt.paymentType,
                    amount: Number(receipt.amount),
                    concept: receipt.concept,
                    receiptCode: receipt.receiptCode || `${new Date(receipt.receiptDate).getFullYear()}/${String(receipt.id).padStart(4, '0')}`,
                    receiptDate: receipt.receiptDate,
                    paymentDate: receipt.paymentDate,
                    academyName: academyProfile.publicName,
                    academyLogo: academyProfile.docLogoBase64 || academyProfile.logoBase64
                };
                updateReceipt({ ...receipt, pdfSnapshot: snapshot });
             }
         }
    };

    const generateInvoiceFromReceipt = (receiptId: number, series: string, date: string) => {
        const receipt = receipts.find(r => r.id === receiptId);
        if (!receipt) return;
        
        // Find series definition to handle auto-increment
        const currentSeries = billingCenters
            .flatMap(c => c.series || [])
            .find(s => s.code === series);
        
        // Use nextNumber from series if available, otherwise calculate max + 1
        const nextNum = currentSeries?.nextNumber || (Math.max(0, ...invoices.filter(i => i.series === series).map(i => i.number)) + 1);

        const newInvoice: Invoice = {
            id: 0, 
            type: 'issued',
            series: series,
            number: Number(nextNum),
            invoiceCode: `${series}-${String(nextNum).padStart(4, '0')}`,
            date: date,
            dueDate: date, 
            clientId: receipt.studentId,
            concept: receipt.concept,
            baseAmount: receipt.amount,
            vatRate: 0, 
            vatAmount: 0,
            irpfRate: 0,
            irpfAmount: 0,
            totalAmount: receipt.amount,
            status: 'Pending',
            linkedReceiptIds: [receipt.id],
            centerId: receipt.centerId || 1
        };
        
        updateInvoice(newInvoice);
        updateReceipt({ ...receipt, isInvoiceGenerated: true, invoiceId: newInvoice.id });
        
        // Increment sequence
        if (currentSeries) {
            updateBillingSeriesState({...currentSeries, nextNumber: Number(nextNum) + 1, invoiceCount: (currentSeries.invoiceCount || 0) + 1});
        }
    };

    const rectifyInvoice = (id: number, series: string, date: string, isProvisional: boolean) => {};
    
    const updateAcademyProfile = (p: AcademyProfile) => {
         const profileToSave = { ...p, id: p.id || 1 };
         // Use updateSingleton for AcademyProfile to prevent 'prev.findIndex' error
         updateSingleton(setAcademyProfile, profileToSave, 'academy_profile');
    };
    
    const addResource = async (file: File, scope: string, scopeId?: number | string) => {
        try {
            // 1. Convert File to Base64
            const toBase64 = (file: File): Promise<string> => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                        const result = reader.result as string;
                        // Remove the data URL prefix (e.g., "data:image/png;base64,") to store just the base64 data
                        const base64 = result.split(',')[1]; 
                        resolve(base64);
                    };
                    reader.onerror = error => reject(error);
                });
            };

            const base64Content = await toBase64(file);

            // 2. Create Resource Object
            // Important: Generate a string ID because the DB schema uses TEXT for 'id' in resources
            const newResource: Resource = {
                id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
                name: file.name,
                fileName: file.name,
                fileType: file.type,
                fileContent: base64Content,
                scope: scope as any,
                scopeId: scopeId ? String(scopeId) : undefined,
                isForTeachers: true,
                isForStudents: false,
                isActive: true,
                createdAt: new Date().toISOString()
            };

            // 3. Save via DataService
            await updateItem(setResources, newResource, 'resources');

            // 4. Also add to File Manager (StoredFiles) for visibility in Admin panel
            const newStoredFile: StoredFile = {
                 id: `file-${Date.now()}`,
                 fileName: file.name,
                 fileUrl: `data:${file.type};base64,${base64Content}`, // Store full data URL for preview if possible
                 fileType: 'document',
                 relatedTable: 'resources',
                 relatedId: newResource.id,
                 centerId: 1,
                 createdAt: new Date().toISOString(),
                 size: file.size
            };
            await updateItem(setStoredFiles, newStoredFile, 'stored_files');

        } catch (error) {
            console.error("Error adding resource:", error);
            alert("Error al subir el recurso");
        }
    };

    const updateResource = (r: Resource) => updateItem(setResources, r, 'resources');
    const deleteResources = (ids: string[]) => deleteItems(setResources, ids as any, 'resources');
    
    // File Manager
    const addStoredFile = (file: StoredFile) => updateItem(setStoredFiles, file, 'stored_files');
    const deleteStoredFiles = (ids: string[]) => deleteItems(setStoredFiles, ids as any, 'stored_files');

    const updateAuthGroup = (g: AuthorizationGroup) => updateItem(setAuthGroups, g, 'auth_groups');
    const deleteAuthGroups = (ids: number[]) => deleteItems(setAuthGroups, ids, 'auth_groups');
    const updateAuthorization = (a: Authorization) => updateItem(setAuthorizations, a, 'authorizations');
    const deleteAuthorizations = (ids: number[]) => deleteItems(setAuthorizations, ids, 'authorizations');
    const createStudentAuthorization = (sid: number, aid: number) => "token";
    const deleteStudentAuthorizations = (ids: string[]) => deleteItems(setStudentAuthorizations, ids as any, 'student_authorizations');
    const sendAuthorizationRequest = () => {};
    const signAuthorization = () => "token";
    const deleteWaitingListEntries = (ids: number[]) => deleteItems(setWaitingList, ids, 'waiting_list');
    const updateStudentTag = (t: StudentTag) => updateItem(setStudentTags, t, 'student_tags');
    const deleteStudentTags = (ids: number[]) => deleteItems(setStudentTags, ids, 'student_tags');
    
    const updateBillingCenter = (c: BillingCenter) => updateItem(setBillingCenters, c, 'billing_centers');
    const deleteBillingCenters = (ids: number[]) => deleteItems(setBillingCenters, ids, 'billing_centers');
    
    // Special handling for nested/related items (Bank Accounts, Series, PaymentMethods)
    // In Supabase mode, these are separate tables. We handle them via dataService directly or updateItem with null setter if not tracked in main state.
    const updateBankAccount = (a: BankAccount) => updateItem(null, a, 'bank_accounts').then(refreshData); 
    const deleteBankAccounts = (ids: number[]) => dataService.delete('bank_accounts', ids).then(refreshData);
    const updateBillingSeries = (s: BillingSeries) => updateItem(null, s, 'billing_series').then(refreshData);
    const deleteBillingSeries = (ids: number[]) => dataService.delete('billing_series', ids).then(refreshData);
    const updatePaymentMethod = (m: BillingPaymentMethod) => updateItem(null, m, 'billing_payment_methods').then(refreshData); 
    const deletePaymentMethods = (ids: number[]) => dataService.delete('billing_payment_methods', ids).then(refreshData);
    
    const updateFiscalConfig = (c: FiscalConfig) => { 
        const configToSave = { ...c, id: c.id || 1 };
        // Use updateSingleton for FiscalConfig as well
        updateSingleton(setFiscalConfig, configToSave, 'fiscal_config');
    };
    
    const updateWikiCategory = (c: WikiCategory) => updateItem(setWikiCategories, c, 'wiki_categories');
    const deleteWikiCategories = (ids: number[]) => deleteItems(setWikiCategories, ids, 'wiki_categories');
    const updateWikiClass = (c: WikiClass) => updateItem(setWikiClasses, c, 'wiki_classes');
    const deleteWikiClasses = (ids: number[]) => deleteItems(setWikiClasses, ids, 'wiki_classes');
    const updateWikiLesson = (l: WikiLesson) => updateItem(setWikiLessons, l, 'wiki_lessons');
    const deleteWikiLessons = (ids: number[]) => deleteItems(setWikiLessons, ids, 'wiki_lessons');
    const updateWikiPermission = (p: TeacherPermission) => updateItem(setWikiPermissions, p, 'teacher_permissions');
    const deleteWikiPermissions = (ids: number[]) => deleteItems(setWikiPermissions, ids, 'teacher_permissions');
    const addTaughtSession = (s: TaughtSession) => updateItem(setTaughtSessions, {...s, id: 0}, 'taught_sessions');
    const updateTaughtSession = (s: TaughtSession) => updateItem(setTaughtSessions, s, 'taught_sessions');
    
    const courseClassTransform = (c: any): CourseClass => ({ ...c, date: new Date(c.date) });

    const addCourseClass = (c: CourseClass) => updateItem(setCourseClasses, c as any, 'course_classes', courseClassTransform);
    
    const updateCourseClass = async (c: CourseClass) => {
        // 1. Update the class itself (save to DB/State)
        await updateItem(setCourseClasses, c as any, 'course_classes', courseClassTransform);

        // 2. Determine Status for Attendance Records
        let newRecordStatus: 'Pendiente' | 'Realizado' | 'Anulado' = 'Pendiente';
        if (c.status === 'Hecha') newRecordStatus = 'Realizado';
        else if (c.status === 'Anulada') newRecordStatus = 'Anulado';
        else newRecordStatus = 'Pendiente';

        // 3. Fetch and Update EXISTING Records
        const currentRecords = attendanceRecords.filter(r => r.classId === c.id);
        if (currentRecords.length > 0) {
            const updates = currentRecords.map(r => ({ 
                ...r, 
                status: newRecordStatus,
                // If transition to Realizado (Hecha) for the first time, ensure attended is true if it was pending default
                // But we keep user changes if they exist. Here we simply set status.
                // If specifically transitioning 'Pendiente' -> 'Hecha' (via UI action), we might want to set attended=true
            }));
            await updateAttendanceRecords(updates);
        }

        // 4. Automatic Attendance Initialization (If Hecha and records missing)
        if (c.status === 'Hecha') {
            const existingStudentIds = new Set(currentRecords.map(r => r.studentId));
            const classDateStr = c.date.toISOString().split('T')[0];

            // Find currently active enrollments valid for this class date
            const newRecordsToCreate: AttendanceRecord[] = [];
            
            enrollments.forEach(e => {
                 if (e.courseId === c.courseId && e.isActive && !existingStudentIds.has(e.studentId)) {
                     // Check date validity
                     const enrollmentDateStr = e.enrollmentDate;
                     if (classDateStr >= enrollmentDateStr) {
                          // Create record
                          newRecordsToCreate.push({
                                id: `${e.studentId}-${c.id}`,
                                classId: c.id,
                                studentId: e.studentId,
                                attended: true, // Auto-set to true on first 'Hecha'
                                late: 'No',
                                absenceJustified: false,
                                homeworkDone: false,
                                comments: '',
                                status: 'Realizado'
                          });
                     }
                 }
            });

            if (newRecordsToCreate.length > 0) {
                await addAttendanceRecords(newRecordsToCreate);
            }
            
            // 5. Mark class as initialized if not already
            if (!c.attendanceInitialized) {
                 // Update ALL records to 'attended=true' if first time?
                 // The prompt says: "When... changed... from pending to done... automatically marks attendance of all students as attended."
                 // This implies even existing "Pending" records should become "Attended: True".
                 
                 if (currentRecords.length > 0) {
                     const updates = currentRecords.map(r => ({
                         ...r,
                         attended: true,
                         status: 'Realizado' as const
                     }));
                     await updateAttendanceRecords(updates);
                 }

                 await updateItem(setCourseClasses, { ...c, attendanceInitialized: true } as any, 'course_classes', courseClassTransform);
            }
        }
    };
    
    const deleteCourseClasses = (ids: string[]) => deleteItems(setCourseClasses, ids as any, 'course_classes');
    const setCourseClassesFn = (classes: CourseClass[]) => setCourseClasses(classes);
    
    const updateAttendanceRecord = (r: AttendanceRecord) => updateItem(setAttendanceRecords, r as any, 'attendance_records');
    const updateReport = (r: Report) => updateItem(setReports, r, 'reports');
    const deleteReports = (ids: number[]) => deleteItems(setReports, ids, 'reports');
    const updatePredefinedComment = (c: PredefinedComment) => updateItem(setPredefinedComments, c, 'predefined_comments');
    const deletePredefinedComments = (ids: number[]) => deleteItems(setPredefinedComments, ids, 'predefined_comments');
    const updateCommentTag = (t: CommentTag) => updateItem(setCommentTags, t, 'comment_tags');
    const deleteCommentTags = (ids: number[]) => deleteItems(setCommentTags, ids, 'comment_tags');
    const updateEmailTemplate = (t: EmailTemplate) => updateItem(setEmailTemplates, t, 'email_templates');
    const deleteEmailTemplates = (ids: number[]) => deleteItems(setEmailTemplates, ids, 'email_templates');
    const sendEmail = () => {};
    const updateLandingPage = (l: LandingPage) => updateItem(setLandingPages, l, 'landing_pages');
    const deleteLandingPages = (ids: number[]) => deleteItems(setLandingPages, ids, 'landing_pages');
    const updateLandingCustomField = (f: LandingCustomField) => updateItem(setLandingCustomFields, f, 'landing_custom_fields');
    const deleteLandingCustomFields = (ids: number[]) => deleteItems(setLandingCustomFields, ids, 'landing_custom_fields');
    
    const createBillingClient = (c: BillingClient) => updateItem(setBillingClients, {...c, id: 0}, 'billing_clients');
    const updateBillingClient = (c: BillingClient) => updateItem(setBillingClients, c, 'billing_clients');
    const deleteBillingClients = (ids: number[]) => deleteItems(setBillingClients, ids, 'billing_clients');
    const createDocumentType = (d: DocumentType) => updateItem(setDocumentTypes, {...d, id: 0}, 'document_types');
    const updateDocumentType = (d: DocumentType) => updateItem(setDocumentTypes, d, 'document_types');
    const deleteDocumentTypes = (ids: number[]) => deleteItems(setDocumentTypes, ids, 'document_types');
    const createDefaultConcept = (c: DefaultConcept) => updateItem(setDefaultConcepts, {...c, id: 0}, 'default_concepts');
    const updateDefaultConcept = (c: DefaultConcept) => updateItem(setDefaultConcepts, c, 'default_concepts');
    const deleteDefaultConcepts = (ids: number[]) => deleteItems(setDefaultConcepts, ids, 'default_concepts');

    // Explicit method for updating series state (e.g. next number increment) without a direct setter dependency in UI components
    const updateBillingSeriesState = (s: BillingSeries) => {
        updateItem(null, s, 'billing_series').then(refreshData);
    }

    const value = useMemo(() => ({
        users, populations, locations, schedules, classrooms, holidays, levelGroups, courseLevels, teachers, courses, students, enrollments, receipts, invoices, ledgerEntries, attendanceRecords, courseClasses, academyProfile, resources, waitingList, authGroups, authorizations, studentAuthorizations, studentHistory, studentTags, billingCenters, billingClients, proformaInvoices, quotes, documentTypes, defaultConcepts, fiscalModels, fiscalConfig, wikiCategories, wikiClasses, wikiLessons, wikiPermissions, taughtSessions, activityLogs, dbConfig, reports, predefinedComments, commentTags, emailTemplates, communicationLogs, landingPages, landingCustomFields, storedFiles,
        studentMap, courseMap, teacherMap, classroomMap, teacherStatsMap, todayBirthdays,
        isLoading, refreshData, updateDbConfig,
        updateUser, deleteUsers, logActivity, setCurrentUserForLog, updatePopulation, deletePopulations, updateLocation, deleteLocations, updateSchedule, deleteSchedules, updateClassroom, deleteClassrooms, updateHoliday, deleteHolidays, updateLevelGroup, deleteLevelGroups, updateCourseLevel, deleteCourseLevels, moveCourseLevel, updateTeacher, deleteTeachers, updateCourse, deleteCourses, updateStudent, deleteStudents, addEnrollments, cancelEnrollment, deleteEnrollments, updateReceipt, deleteReceipts, generateReceiptPdf, generateInvoiceFromReceipt, updateInvoice, deleteInvoices, rectifyInvoice, updateAcademyProfile, addResource, updateResource, deleteResources, updateAuthGroup, deleteAuthGroups, updateAuthorization, deleteAuthorizations, createStudentAuthorization, deleteStudentAuthorizations, sendAuthorizationRequest, signAuthorization, deleteWaitingListEntries, updateStudentTag, deleteStudentTags, updateBillingCenter, deleteBillingCenters, updateBankAccount, deleteBankAccounts, updateBillingSeries, deleteBillingSeries, updatePaymentMethod, deletePaymentMethods, updateFiscalConfig, updateWikiCategory, deleteWikiCategories, updateWikiClass, deleteWikiClasses, updateWikiLesson, deleteWikiLessons, updateWikiPermission, deleteWikiPermissions, addTaughtSession, updateTaughtSession, addCourseClass, updateCourseClass, deleteCourseClasses, setCourseClasses: setCourseClassesFn, updateAttendanceRecord, addAttendanceRecords, updateAttendanceRecords, deleteAttendanceRecords, updateReport, deleteReports, updatePredefinedComment, deletePredefinedComments, updateCommentTag, deleteCommentTags, updateEmailTemplate, deleteEmailTemplates, sendEmail, updateLandingPage, deleteLandingPages, updateLandingCustomField, deleteLandingCustomFields, createBillingClient, updateBillingClient, deleteBillingClients, createDocumentType, updateDocumentType, deleteDocumentTypes, createDefaultConcept, updateDefaultConcept, deleteDefaultConcepts, updateBillingSeriesState, addStoredFile, deleteStoredFiles
    }), [
        users, populations, locations, schedules, classrooms, holidays, levelGroups, courseLevels, teachers, courses, students, enrollments, receipts, invoices, ledgerEntries, attendanceRecords, courseClasses, academyProfile, resources, waitingList, authGroups, authorizations, studentAuthorizations, studentHistory, studentTags, billingCenters, billingClients, proformaInvoices, quotes, documentTypes, defaultConcepts, fiscalModels, fiscalConfig, wikiCategories, wikiClasses, wikiLessons, wikiPermissions, taughtSessions, activityLogs, dbConfig, reports, predefinedComments, commentTags, emailTemplates, communicationLogs, landingPages, landingCustomFields, storedFiles,
        studentMap, courseMap, teacherMap, classroomMap, teacherStatsMap, todayBirthdays,
        isLoading, refreshData, updateDbConfig,
        updateUser, deleteUsers, logActivity, setCurrentUserForLog, updatePopulation, deletePopulations, updateLocation, deleteLocations, updateSchedule, deleteSchedules, updateClassroom, deleteClassrooms, updateHoliday, deleteHolidays, updateLevelGroup, deleteLevelGroups, updateCourseLevel, deleteCourseLevels, moveCourseLevel, updateTeacher, deleteTeachers, updateCourse, deleteCourses, updateStudent, deleteStudents, addEnrollments, cancelEnrollment, deleteEnrollments, updateReceipt, deleteReceipts, generateReceiptPdf, generateInvoiceFromReceipt, updateInvoice, deleteInvoices, rectifyInvoice, updateAcademyProfile, addResource, updateResource, deleteResources, updateAuthGroup, deleteAuthGroups, updateAuthorization, deleteAuthorizations, createStudentAuthorization, deleteStudentAuthorizations, sendAuthorizationRequest, signAuthorization, deleteWaitingListEntries, updateStudentTag, deleteStudentTags, updateBillingCenter, deleteBillingCenters, updateBankAccount, deleteBankAccounts, updateBillingSeries, deleteBillingSeries, updatePaymentMethod, deletePaymentMethods, updateFiscalConfig, updateWikiCategory, deleteWikiCategories, updateWikiClass, deleteWikiClasses, updateWikiLesson, deleteWikiLessons, updateWikiPermission, deleteWikiPermissions, addTaughtSession, updateTaughtSession, addCourseClass, updateCourseClass, deleteCourseClasses, setCourseClasses: setCourseClassesFn, updateAttendanceRecord, addAttendanceRecords, updateAttendanceRecords, deleteAttendanceRecords, updateReport, deleteReports, updatePredefinedComment, deletePredefinedComments, updateCommentTag, deleteCommentTags, updateEmailTemplate, deleteEmailTemplates, sendEmail, updateLandingPage, deleteLandingPages, updateLandingCustomField, deleteLandingCustomFields, createBillingClient, updateBillingClient, deleteBillingClients, createDocumentType, updateDocumentType, deleteDocumentTypes, createDefaultConcept, updateDefaultConcept, deleteDefaultConcepts, updateBillingSeriesState, addStoredFile, deleteStoredFiles
    ]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
