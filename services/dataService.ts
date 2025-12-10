
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as MockData from './mockData';
import { DatabaseConfig, DatabaseProvider } from '../types';

// Mapeo de nombres de "tablas" (o keys del contexto) a los datos Mock iniciales
const INITIAL_MOCKS: Record<string, any[]> = {
    users: MockData.MOCK_USERS,
    populations: MockData.MOCK_POPULATIONS,
    locations: MockData.MOCK_LOCATIONS,
    week_schedules: MockData.MOCK_WEEK_SCHEDULES,
    classrooms: MockData.MOCK_CLASSROOMS,
    holidays: MockData.MOCK_HOLIDAYS,
    level_groups: MockData.MOCK_LEVEL_GROUPS,
    course_levels: MockData.MOCK_COURSE_LEVELS,
    teachers: MockData.MOCK_TEACHERS,
    courses: MockData.MOCK_COURSES,
    students: MockData.MOCK_STUDENTS,
    enrollments: MockData.MOCK_ENROLLMENTS,
    receipts: MockData.MOCK_RECEIPTS,
    invoices: MockData.MOCK_INVOICES,
    ledger_entries: MockData.MOCK_LEDGER_ENTRIES,
    attendance_records: MockData.MOCK_ATTENDANCE_RECORDS,
    course_classes: MockData.MOCK_COURSE_CLASSES,
    resources: MockData.MOCK_RESOURCES,
    waiting_list: MockData.MOCK_WAITING_LIST,
    auth_groups: MockData.MOCK_AUTH_GROUPS,
    authorizations: MockData.MOCK_AUTHORIZATIONS,
    student_authorizations: MockData.MOCK_STUDENT_AUTHORIZATIONS,
    student_history: MockData.MOCK_STUDENT_HISTORY,
    student_tags: MockData.MOCK_STUDENT_TAGS,
    billing_centers: MockData.MOCK_BILLING_CENTERS,
    billing_clients: MockData.MOCK_BILLING_CLIENTS,
    proforma_invoices: MockData.MOCK_PROFORMA_INVOICES,
    quotes: MockData.MOCK_QUOTES,
    document_types: MockData.MOCK_DOCUMENT_TYPES,
    default_concepts: MockData.MOCK_DEFAULT_CONCEPTS,
    fiscal_models: MockData.MOCK_FISCAL_MODELS,
    wiki_categories: MockData.MOCK_WIKI_CATEGORIES,
    wiki_classes: MockData.MOCK_WIKI_CLASSES,
    wiki_lessons: MockData.MOCK_WIKI_LESSONS,
    teacher_permissions: MockData.MOCK_WIKI_PERMISSIONS,
    taught_sessions: MockData.MOCK_TAUGHT_SESSIONS,
    landing_pages: MockData.MOCK_LANDING_PAGES,
    landing_custom_fields: MockData.MOCK_LANDING_CUSTOM_FIELDS,
    reports: MockData.MOCK_REPORTS,
    predefined_comments: MockData.MOCK_PREDEFINED_COMMENTS,
    comment_tags: MockData.MOCK_COMMENT_TAGS,
    email_templates: MockData.MOCK_EMAIL_TEMPLATES,
    communication_logs: MockData.MOCK_COMMUNICATION_LOGS,
    activity_logs: MockData.MOCK_ACTIVITY_LOGS,
    academy_profile: [MockData.MOCK_ACADEMY_PROFILE], // Singleton as array
    stored_files: MockData.MOCK_STORED_FILES,
};

// Orden estricto para inserción (Padres primero -> Hijos después)
const INSERTION_ORDER = [
    'users',
    'populations',
    'locations',
    'classrooms',
    'week_schedules',
    'holidays',
    'level_groups',
    'course_levels',
    'teachers',
    'courses',
    'students',
    'enrollments',
    'course_classes',
    'auth_groups',
    'authorizations',
    'student_authorizations',
    'billing_centers',
    'billing_clients',
    'receipts',
    'invoices',
    'attendance_records',
    'resources',
    'waiting_list',
    'student_tags',
    'proforma_invoices',
    'quotes',
    'document_types',
    'default_concepts',
    'fiscal_models',
    'wiki_categories',
    'wiki_classes',
    'wiki_lessons',
    'teacher_permissions',
    'taught_sessions',
    'landing_pages',
    'landing_custom_fields',
    'reports',
    'comment_tags',
    'predefined_comments',
    'email_templates',
    'communication_logs',
    'student_history', 
    'ledger_entries',
    'activity_logs',
    'academy_profile',
    'fiscal_config',
    'stored_files'
];

// Campos calculados o de UI que no deben persistirse en base de datos.
const EXCLUDED_FIELDS = [
    'studentCount', 
    'courseCount', 
    'classesCount', 
    'resourcesCount', 
    'standbyStudents', 
    'classroomCount',
    'studentName',
    'courseName',
    'levelName',
    'locationName',
    'courseIsActive',
    'invoiceCode', 
    'course', // Objeto relación
    'student', // Objeto relación
    'teacher', // Objeto relación
    'classroom', // Objeto relación
    'enrollment', // Objeto relación
    'client', // Objeto relación
    'definition', // Objeto relación
    'invoice', // Objeto relación
    'receptor', // Objeto relación
    'item', // Objeto relación
    'user', // Objeto relación
    'group', // Objeto relación
    'level', // Objeto relación
    'studentRegistrationDate',
    'receipts' // Calculated field
];

const LOCAL_STORAGE_KEY = 'edubeta_local_db';

export class DataService {
    private supabase: SupabaseClient | null = null;
    private config: DatabaseConfig = { provider: 'local' };
    private localStore: Record<string, any[]> = {};

    constructor() {
        this.initializeLocalStore();
        this.loadConfig();
    }

    private initializeLocalStore() {
        // Intentar cargar desde localStorage primero para persistencia
        try {
            const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedData) {
                this.localStore = JSON.parse(storedData);
                // Asegurar que todas las tablas existen aunque vengan del storage (por si hubo updates de esquema)
                Object.keys(INITIAL_MOCKS).forEach(key => {
                    if (!this.localStore[key]) {
                        this.localStore[key] = INITIAL_MOCKS[key];
                    }
                });
            } else {
                this.resetLocalStore();
            }
        } catch (e) {
            console.error("Error loading local DB:", e);
            this.resetLocalStore();
        }
    }

    private resetLocalStore() {
        this.localStore = JSON.parse(JSON.stringify(INITIAL_MOCKS));
        this.saveLocalStore();
    }

    private saveLocalStore() {
        try {
            if (this.config.provider === 'local') {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.localStore));
            }
        } catch (e) {
            console.error("Error saving local DB (posiblemente QuotaExceeded por imágenes):", e);
        }
    }

    public loadConfig() {
        try {
            const stored = localStorage.getItem('dbConfig');
            if (stored) {
                this.config = JSON.parse(stored);
            }

            if (this.config.provider === 'supabase' && this.config.supabaseConfig?.url && this.config.supabaseConfig?.anonKey) {
                this.supabase = createClient(
                    this.config.supabaseConfig.url, 
                    this.config.supabaseConfig.anonKey
                );
            } else {
                this.supabase = null;
            }
        } catch (e) {
            console.error("Error cargando configuración DB:", e);
            this.config.provider = 'local';
        }
    }

    public getProvider(): DatabaseProvider {
        return this.config.provider;
    }

    public getTableNames = () => Object.keys(this.localStore);
    public getLocalDataForTable = (tableName: string) => this.localStore[tableName] || [];

    public async getAll<T>(tableName: string): Promise<T[]> {
        if (this.config.provider === 'supabase' && this.supabase) {
            try {
                const { data, error } = await this.supabase.from(tableName).select('*');
                if (error) {
                    // Ignorar errores de tabla no encontrada durante la fase de configuración inicial
                    if (
                        error.code === '42P01' || 
                        error.message.includes('Could not find the table') || 
                        error.message.includes('relation')
                    ) {
                        return [];
                    }
                    console.error(`Supabase error fetching ${tableName}:`, error.message);
                    return [];
                }
                return data as T[];
            } catch (err) {
                return [];
            }
        }
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = this.localStore[tableName] || [];
                resolve(data as T[]);
            }, 50);
        });
    }

    private cleanItemForSave(item: any): any {
        const cleanItem = { ...item };
        
        // 1. Eliminar campos excluidos explícitamente
        EXCLUDED_FIELDS.forEach(field => delete cleanItem[field]);
        
        // 2. Eliminar campos que son objetos/arrays NO permitidos (relaciones anidadas que Supabase no acepta)
        //    Mantener solo los arrays que sean JSONB válidos definidos en nuestro esquema.
        const allowedJsonFields = [
            'paymentConfig', 'domiciliationData', 'billingData', 'authorizations', 'stats', 
            'customFieldValues', 'alternativePrice', 'date', 'contract', 'permissions', 
            'styles', 'stepConfig', 'studentFields', 'customFieldsBlock', 'additionalInfoBlock', 
            'paymentMethods', 'privacyPolicy', 'supportText', 'notifications', 'blocks',
            'tutors', 'tags', 'authorizedPickups', 'scheduleIds', 'bankAccounts', 'series', 'linkedReceiptIds', 'activeModels', 'invoiceSeries',
            'selectedGroupIds', 'selectedLevelIds', 'bannedLocationIds', 'offeredCourseIds', 'authorizationIds'
        ];

        Object.keys(cleanItem).forEach(key => {
            const value = cleanItem[key];
            
            // Si es un objeto (y no es null, ni fecha), verificamos si es un campo JSON permitido
            if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
                if (!allowedJsonFields.includes(key)) {
                    // Si tiene un 'id' dentro, es muy probable que sea una relación (objeto Course dentro de Enrollment)
                    // Lo borramos porque Supabase espera solo el courseId.
                    delete cleanItem[key]; 
                }
            }
        });
        return cleanItem;
    }

    // Helper to get next ID to avoid sequence desync issues
    private async getNextId(tableName: string): Promise<number> {
        if (!this.supabase) return 1;
        const { data, error } = await this.supabase
            .from(tableName)
            .select('id')
            .order('id', { ascending: false })
            .limit(1)
            .maybeSingle();
        
        if (error) {
             // If table doesn't exist or other error, log it but don't crash.
             return 0; 
        }
        return (data?.id || 0) + 1;
    }

    public async create<T>(tableName: string, item: T): Promise<T | null> {
        if (this.config.provider === 'supabase' && this.supabase) {
            const { id, ...rest } = item as any;
            let payload = (typeof id === 'number' && id <= 0) ? rest : item;
            
            // --- MANUAL ID FIX START ---
            // Check if we are trying to insert without an ID into a table that likely uses numeric IDs
            if (typeof id === 'number' && id <= 0) {
                 try {
                     const nextId = await this.getNextId(tableName);
                     if (nextId > 0) {
                         payload = { ...rest, id: nextId };
                     }
                 } catch (e) {
                     console.warn("Manual ID generation failed, trying sequence", e);
                 }
            }
            // --- MANUAL ID FIX END ---

            const cleanPayload = this.cleanItemForSave(payload);

            const { data, error } = await this.supabase
                .from(tableName)
                .insert([cleanPayload])
                .select()
                .single();

            if (error) {
                console.error(`Error creando en ${tableName}:`, error);
                throw error;
            }
            return data as T;
        }

        return new Promise((resolve) => {
            const currentList = this.localStore[tableName] || [];
            const newItem = { ...item } as any;

            if (typeof newItem.id === 'number' && newItem.id <= 0) {
                const maxId = currentList.reduce((max: number, curr: any) => 
                    typeof curr.id === 'number' ? Math.max(max, curr.id) : max, 0);
                newItem.id = maxId + 1;
            } else if (!newItem.id) {
                newItem.id = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }

            this.localStore[tableName] = [...currentList, newItem];
            this.saveLocalStore();
            resolve(newItem as T);
        });
    }

    public async createMany<T>(tableName: string, items: T[]): Promise<T[]> {
        if (items.length === 0) return [];

        if (this.config.provider === 'supabase' && this.supabase) {
             let startId = 0;
             // Check if items use numeric ID placeholder (0)
             const needsIdGeneration = items.length > 0 && typeof (items[0] as any).id === 'number';

             if (needsIdGeneration) {
                 try {
                     startId = await this.getNextId(tableName);
                 } catch (e) { console.warn("Manual ID gen failed for many", e); }
             }

            const cleanedItems = items.map((item, index) => {
                const { id, ...rest } = item as any;
                let payload = (typeof id === 'number' && id <= 0) ? rest : item;
                
                // Apply manual ID if valid startId found
                if (needsIdGeneration && startId > 0 && (typeof id === 'number' && id <= 0)) {
                    payload = { ...rest, id: startId + index };
                }

                return this.cleanItemForSave(payload);
            });

            // FIX: Use upsert for specific tables like attendance_records to avoid unique constraint violations on duplicate composite keys
            if (tableName === 'attendance_records' || tableName === 'enrollments') {
                const { data, error } = await this.supabase
                    .from(tableName)
                    .upsert(cleanedItems, { onConflict: 'id', ignoreDuplicates: true })
                    .select();

                if (error) {
                    console.error(`Error upserting many in ${tableName}:`, error);
                    throw error;
                }
                return (data as T[]) || [];
            } else {
                // Default insert for others
                const { data, error } = await this.supabase
                    .from(tableName)
                    .insert(cleanedItems)
                    .select();

                if (error) {
                    console.error(`Error creating many in ${tableName}:`, error);
                    throw error;
                }
                return (data as T[]) || [];
            }
        }

        return new Promise((resolve) => {
            const currentList = this.localStore[tableName] || [];
            const newItems: T[] = [];
            
            // Simulación local
            let localMaxId = currentList.reduce((max: number, curr: any) => 
                typeof curr.id === 'number' ? Math.max(max, curr.id) : max, 0);

            items.forEach(item => {
                 const newItem = { ...item } as any;
                 // Simple duplication check for attendance_records in local mode to mimic unique constraint
                 if (tableName === 'attendance_records' && currentList.some((r:any) => r.id === newItem.id)) {
                     return; // Skip duplicate
                 }

                 if (typeof newItem.id === 'number' && newItem.id <= 0) {
                     localMaxId++;
                     newItem.id = localMaxId;
                 } else if (!newItem.id) {
                     newItem.id = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                 }
                 newItems.push(newItem);
            });

            this.localStore[tableName] = [...currentList, ...newItems];
            this.saveLocalStore();
            resolve(newItems);
        });
    }

    public async update<T extends { id: number | string }>(tableName: string, item: T): Promise<T | null> {
        if (this.config.provider === 'supabase' && this.supabase) {
            const { id, ...rest } = item as any;
            const cleanPayload = this.cleanItemForSave(rest);

            // Intenta actualizar. Si no encuentra el registro, puede ser una primera inserción (caso singletons como academy_profile).
            // Usamos maybeSingle para evitar error si no existe.
            const { data, error } = await this.supabase
                .from(tableName)
                .update(cleanPayload)
                .eq('id', id)
                .select()
                .maybeSingle();

            if (!data && !error) {
                // No existe, intentamos insertar (comportamiento Upsert manual para asegurar ID)
                const { data: insertData, error: insertError } = await this.supabase
                    .from(tableName)
                    .insert([{ id, ...cleanPayload }])
                    .select()
                    .single();
                
                if (insertError) {
                    console.error(`Error insertando (fallback update) en ${tableName}:`, insertError);
                    throw insertError;
                }
                return insertData as T;
            }

            if (error) {
                console.error(`Error actualizando en ${tableName}:`, error);
                throw error;
            }
            return data as T;
        }

        return new Promise((resolve) => {
            const currentList = this.localStore[tableName] || [];
            const index = currentList.findIndex((i: any) => i.id === item.id);
            
            if (index !== -1) {
                const updatedList = [...currentList];
                updatedList[index] = { ...updatedList[index], ...item };
                this.localStore[tableName] = updatedList;
                this.saveLocalStore();
                resolve(updatedList[index] as T);
            } else {
                this.create(tableName, item).then(res => resolve(res));
            }
        });
    }

    public async delete(tableName: string, ids: (number | string)[]): Promise<boolean> {
        if (this.config.provider === 'supabase' && this.supabase) {
            const { error } = await this.supabase
                .from(tableName)
                .delete()
                .in('id', ids);

            if (error) return false;
            return true;
        }

        return new Promise((resolve) => {
            const currentList = this.localStore[tableName] || [];
            this.localStore[tableName] = currentList.filter((i: any) => !ids.includes(i.id));
            this.saveLocalStore();
            resolve(true);
        });
    }
    
    // Función auxiliar para ejecutar SQL directo (SOLO MIGRACIONES O ADMIN)
    public async executeRawSql(sql: string): Promise<{ success: boolean, message?: string }> {
         if (this.config.provider !== 'supabase' || !this.supabase) {
             return { success: false, message: "No conectado a Supabase" };
         }
         // Supabase no expone raw SQL en el cliente JS por seguridad.
         // Esta función es un placeholder para indicar que se debe usar el Dashboard de Supabase.
         // O usar una Edge Function si estuviera configurada.
         return { success: false, message: "Ejecuta este SQL en el Editor SQL de tu Dashboard de Supabase." };
    }

    public generateDynamicSQL(): string {
        return MockData.SUPABASE_SCHEMA + '\n\n' + MockData.SUPABASE_RLS_POLICIES;
    }
    
    public getDropAllTablesScript(): string {
        return MockData.DROP_ALL_TABLES_SCRIPT;
    }
    
    private getTypeLabel(value: any): string {
        if (value === null || value === undefined) return 'null';
        if (value instanceof Date) return 'date';
        if (typeof value === 'string') {
            if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
        }
        if (Array.isArray(value)) return 'array';
        return typeof value;
    }

    public async checkRemoteSchemaStatus(): Promise<{ tableName: string, status: 'exists' | 'missing' | 'error', remoteCount: number, localCount: number, typeStatus: 'ok' | 'mismatch' | 'unknown', mismatches: string[] }[]> {
         if (this.config.provider !== 'supabase' || !this.supabase) {
            throw new Error("Supabase no está configurado.");
        }
        const results = [];
        for (const table of INSERTION_ORDER) {
            try {
                const { count, error } = await this.supabase.from(table).select('*', { count: 'exact', head: true });
                const localCount = (this.localStore[table] || []).length;
                if (error) {
                    results.push({ tableName: table, status: 'missing', remoteCount: 0, localCount, typeStatus: 'unknown', mismatches: [] });
                } else {
                    results.push({ tableName: table, status: 'exists', remoteCount: count || 0, localCount, typeStatus: 'ok', mismatches: [] });
                }
            } catch (e) {
                 results.push({ tableName: table, status: 'error', remoteCount: 0, localCount: 0, typeStatus: 'unknown', mismatches: [] });
            }
        }
        return results as any;
    }

    public async clearRemoteDatabase(logCallback?: (msg: string) => void): Promise<{ success: boolean }> {
        if (this.config.provider !== 'supabase' || !this.supabase) return { success: false };
        const deletionOrder = [...INSERTION_ORDER].reverse();
        for (const table of deletionOrder) {
            try {
                await this.supabase.from(table).delete().neq('id', -1); // Delete all
            } catch(e) {}
        }
        return { success: true };
    }

    public async clearRemoteTable(tableName: string): Promise<{ success: boolean; message?: string }> {
         if (this.config.provider !== 'supabase' || !this.supabase) return { success: false };
         const { error } = await this.supabase.from(tableName).delete().neq('id', -1);
         return { success: !error, message: error?.message };
    }
    
    public clearLocalTable(tableName: string): void { 
        this.localStore[tableName] = [];
        this.saveLocalStore();
    }
    
    public clearLocalDatabase(logCallback?: (msg: string) => void): void { 
        Object.keys(this.localStore).forEach(key => this.localStore[key] = []);
        this.saveLocalStore();
    }

    public async migrateLocalToSupabase(logCallback?: (msg: string) => void): Promise<{ success: boolean, details: string }> {
        if (this.config.provider !== 'supabase' || !this.supabase) return { success: false, details: "No Supabase" };
        
        try {
            for (const table of INSERTION_ORDER) {
                const data = this.localStore[table] || INITIAL_MOCKS[table] || [];
                if (data.length === 0) continue;
                
                if(logCallback) logCallback(`Migrando ${table}...`);
                
                // Procesamiento por lotes de 50 para evitar timeouts
                const BATCH_SIZE = 50;
                for (let i = 0; i < data.length; i += BATCH_SIZE) {
                    const batch = data.slice(i, i + BATCH_SIZE);
                    const cleanedBatch = batch.map((item: any, idx: number) => {
                        const clean = this.cleanItemForSave(item);
                        if (!clean.id) clean.id = i + idx + 1; 
                        return clean;
                    });
                    
                    const { error } = await this.supabase.from(table).upsert(cleanedBatch, { onConflict: 'id', ignoreDuplicates: true });
                    if (error) throw error;
                }
            }
            return { success: true, details: "" };
        } catch (e: any) {
            return { success: false, details: e.message };
        }
    }
    
    // New method for deep tracking
    public async getRemoteTableSample(tableName: string, limit: number = 20): Promise<any[]> {
        if (this.config.provider !== 'supabase' || !this.supabase) return [];
        try {
            const { data, error } = await this.supabase.from(tableName).select('*').limit(limit);
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error(`Failed to fetch sample from ${tableName}`, err);
            return [];
        }
    }
}

export const dataService = new DataService();
