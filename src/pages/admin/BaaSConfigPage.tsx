
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { 
    Database, Save, Server, Key, AlertTriangle, CheckCircle, 
    Copy, XCircle, Code, ShieldCheck, Terminal, ExternalLink, CloudLightning,
    ArrowRightLeft, Loader, RefreshCw, Check, X, Mail, Trash2, Info, Power, AlertCircle, 
    Eye, Table, BarChart3, Search, ChevronRight
} from 'lucide-react';
import { DatabaseProvider, DatabaseConfig } from '../../types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { dataService } from '../../services/dataService';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const TerminalOutput: React.FC<{ logs: string[] }> = ({ logs }) => {
    const endRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="bg-slate-950 text-green-400 font-mono text-xs p-4 rounded-lg h-64 overflow-y-auto border border-slate-800 shadow-inner custom-scrollbar">
            {logs.length === 0 && <span className="text-slate-600 opacity-50">Esperando comandos...</span>}
            {logs.map((log, i) => (
                <div key={i} className="mb-1 break-words whitespace-pre-wrap">
                    <span className="text-blue-500 mr-2">$</span>
                    {log}
                </div>
            ))}
            <div ref={endRef} />
        </div>
    );
};

const BaaSConfigPage = () => {
    const { dbConfig, updateDbConfig, refreshData, isLoading: isGlobalLoading } = useData();
    
    const [config, setConfig] = useState<DatabaseConfig>(() => {
        const initialConfig = { ...dbConfig };
        if (!initialConfig.supabaseConfig?.url || !initialConfig.supabaseConfig?.anonKey || initialConfig.supabaseConfig.url === 'https://xyz.supabase.co') {
            initialConfig.supabaseConfig = {
                url: 'https://ipwtlpbymtozkrnelimo.supabase.co',
                anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwd3RscGJ5bXRvemtybmVsaW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NTkwNzAsImV4cCI6MjA4MDAzNTA3MH0.6ithVSTGdxvZ6B6RBK81dvoRrwTyC-e7zqXGhzg0t9s'
            };
        }
        return initialConfig;
    });

    const [provider, setProvider] = useState<DatabaseProvider>(config.provider);
    const [activeTab, setActiveTab] = useState<'config' | 'schema' | 'explorer' | 'sql' | 'terminal' | 'mailing'>('config');
    
    // States
    const [logs, setLogs] = useState<string[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [connectionFeedback, setConnectionFeedback] = useState<{type: 'success' | 'error', msg: string} | null>(null);
    const [schemaStatus, setSchemaStatus] = useState<{ tableName: string, status: string, remoteCount: number, localCount: number, typeStatus: 'ok' | 'mismatch' | 'unknown', mismatches: string[] }[] | null>(null);
    const [generatedSql, setGeneratedSql] = useState('');
    
    // Explorer State
    const [selectedTableForExplorer, setSelectedTableForExplorer] = useState<string>('users');
    const [explorerData, setExplorerData] = useState<any[]>([]);
    const [isExplorerLoading, setIsExplorerLoading] = useState(false);

    // UI State for Supabase Card Expansion
    const [isSupabaseExpanded, setIsSupabaseExpanded] = useState(config.provider === 'supabase');

    // Loading states for actions
    const [isCheckingSchema, setIsCheckingSchema] = useState(false);
    const [isMigrating, setIsMigrating] = useState(false);
    const [isClearingLocal, setIsClearingLocal] = useState(false);
    const [isClearingRemote, setIsClearingRemote] = useState(false);
    const [isClearingTable, setIsClearingTable] = useState<string | null>(null);

    const [isConfirmRemoteClearOpen, setIsConfirmRemoteClearOpen] = useState(false);
    const [isConfirmLocalClearOpen, setIsConfirmLocalClearOpen] = useState(false);
    const [isConfirmMigrateOpen, setIsConfirmMigrateOpen] = useState(false);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);
    
    useEffect(() => {
        setProvider(dbConfig.provider);
        setIsSupabaseExpanded(dbConfig.provider === 'supabase');
    }, [dbConfig.provider]);
    
    // Initial check if Supabase
    useEffect(() => {
        if (provider === 'supabase') {
            handleCheckSchema(true); // Silent check
        }
    }, [provider]);
    
    // Auto load explorer data when table changes
    useEffect(() => {
        if (activeTab === 'explorer' && selectedTableForExplorer) {
            fetchExplorerData(selectedTableForExplorer);
        }
    }, [activeTab, selectedTableForExplorer]);

    const getSupabaseClientFromForm = (): SupabaseClient | null => {
        if (config.supabaseConfig?.url && config.supabaseConfig?.anonKey) {
            return createClient(config.supabaseConfig.url, config.supabaseConfig.anonKey);
        }
        return null;
    };

    const handleSwitchToLocal = () => {
        setProvider('local');
        setConfig(prev => ({ ...prev, provider: 'local' }));
        updateDbConfig({ ...config, provider: 'local' });
        dataService.loadConfig();
        refreshData();
        addLog(`✅ Modo local activado.`);
        setShowSuccess(true);
    };

    const handleInputChange = (section: 'supabaseConfig', field: string, value: string) => {
        setConfig(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
        setConnectionFeedback(null);
        setTestStatus('idle');
    };

    const handleConnectSupabase = async () => {
        setTestStatus('testing');
        setConnectionFeedback(null);
        addLog(`Conectando con Supabase...`);
        setErrorMsg(null);

        const supabase = getSupabaseClientFromForm();
        if (!supabase) {
            setTestStatus('error');
            const msg = "Faltan credenciales de Supabase.";
            setErrorMsg(msg);
            addLog(`❌ ${msg}`);
            return;
        }

        try {
            const { error } = await supabase.from('users').select('id', { count: 'exact', head: true });
            
            if (error && error.code !== '42P01' && error.code !== 'PGRST116') {
                throw error;
            }

            // Connection Successful
            setTestStatus('success');
            const msg = "Conexión establecida correctamente.";
            setConnectionFeedback({ type: 'success', msg });
            addLog(`✅ ${msg}`);
            
            // Save and Activate
            const newConfig = { ...config, provider: 'supabase' as DatabaseProvider };
            setConfig(newConfig);
            setProvider('supabase');
            updateDbConfig(newConfig);
            dataService.loadConfig();
            refreshData();
            setShowSuccess(true);
            
        } catch (err: any) {
            setTestStatus('error');
            const message = err.message || "Error de conexión.";
            setErrorMsg(message);
            setConnectionFeedback({ type: 'error', msg: message });
            addLog(`❌ Error de conexión: ${message}`);
        }
    };
    
    const handleCheckSchema = async (silent = false) => {
        const supabase = getSupabaseClientFromForm();
        if (!supabase) {
            if (!silent) addLog("❌ Configura la conexión a Supabase primero.");
            return;
        }
        setIsCheckingSchema(true);
        if (!silent) addLog("Analizando esquema remoto...");
        
        try {
            const status = await dataService.checkRemoteSchemaStatus();
            setSchemaStatus(status);
            if (!silent) addLog(`✅ Análisis completado. Se compararon ${status.length} tablas.`);
        } catch (e: any) {
            if (!silent) addLog(`❌ Error en análisis: ${e.message}`);
        } finally {
            setIsCheckingSchema(false);
        }
    };
    
    const fetchExplorerData = async (tableName: string) => {
        setIsExplorerLoading(true);
        try {
            const data = await dataService.getRemoteTableSample(tableName);
            setExplorerData(data);
        } catch(e) {
            console.error(e);
            setExplorerData([]);
        } finally {
            setIsExplorerLoading(false);
        }
    }
    
    const handleGenerateSQL = () => {
        addLog("Generando script SQL...");
        setGeneratedSql(dataService.generateDynamicSQL());
        addLog("✅ Script generado.");
    };

    const handleGenerateDropSQL = () => {
        addLog("Generando script de destrucción...");
        setGeneratedSql(dataService.getDropAllTablesScript());
        addLog("✅ Script generado.");
    };

    const handleMigrateData = async () => {
        setIsConfirmMigrateOpen(false);
        
        const supabase = getSupabaseClientFromForm();
        if (!supabase) {
            addLog("❌ Configura la conexión a Supabase primero.");
            return;
        }

        setIsMigrating(true);
        addLog("🚀 Iniciando proceso de migración...");
        
        try {
             const res = await dataService.migrateLocalToSupabase((msg) => addLog(msg));
             if (res.success) {
                 addLog("✅ Migración completada correctamente.");
                 await handleCheckSchema();
             } else {
                 addLog(`❌ Error en migración: ${res.details}`);
             }
        } catch (e: any) {
             addLog(`❌ Excepción crítica: ${e.message}`);
        } finally {
            setIsMigrating(false);
        }
    };

    const handleClearRemote = async () => {
        setIsConfirmRemoteClearOpen(false);
        setIsClearingRemote(true);
        try {
            await dataService.clearRemoteDatabase((msg) => addLog(msg));
            addLog("✅ Datos remotos eliminados.");
            await handleCheckSchema();
        } catch (e) {
             addLog("❌ Error eliminando datos remotos.");
        } finally {
            setIsClearingRemote(false);
        }
    }

    const handleClearLocal = () => {
        setIsConfirmLocalClearOpen(false);
        setIsClearingLocal(true);
        setTimeout(() => {
             dataService.clearLocalDatabase((msg) => addLog(msg));
             refreshData();
             if (schemaStatus) handleCheckSchema(); 
             setIsClearingLocal(false);
        }, 500);
    }

    const handleClearTable = async (tableName: string, target: 'local' | 'remote') => {
        if (!confirm(`¿Vaciar tabla '${tableName}' en ${target.toUpperCase()}?`)) return;
        
        const actionId = `${target}-${tableName}`;
        setIsClearingTable(actionId);

        try {
            if (target === 'remote') {
                const res = await dataService.clearRemoteTable(tableName);
                if (res.success) {
                    addLog(`✅ Tabla remota '${tableName}' vaciada.`);
                    await handleCheckSchema();
                    if (activeTab === 'explorer' && selectedTableForExplorer === tableName) fetchExplorerData(tableName);
                } else {
                    addLog(`❌ Error vaciando tabla '${tableName}': ${res.message}`);
                }
            } else {
                dataService.clearLocalTable(tableName);
                addLog(`✅ Tabla local '${tableName}' vaciada.`);
                refreshData();
                if (schemaStatus) {
                     setSchemaStatus(prev => prev ? prev.map(s => s.tableName === tableName ? { ...s, localCount: 0 } : s) : null);
                }
            }
        } catch (e: any) {
            addLog(`❌ Error: ${e.message}`);
        } finally {
            setIsClearingTable(null);
        }
    }

    const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: React.ReactNode }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === id ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
            {icon} {label}
        </button>
    );
    
    const syncPercentage = useMemo(() => {
        if (!schemaStatus || schemaStatus.length === 0) return 0;
        const totalTables = schemaStatus.length;
        const syncedTables = schemaStatus.filter(s => s.status === 'exists' && s.remoteCount === s.localCount).length;
        return Math.round((syncedTables / totalTables) * 100);
    }, [schemaStatus]);

    return (
        <div className="max-w-6xl mx-auto pb-24 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <CloudLightning className="text-primary-600" size={32} /> 
                        Configuración BaaS
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-lg">
                        Panel de control de base de datos y sincronización profunda.
                    </p>
                </div>
                {isGlobalLoading && (
                    <span className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full text-sm font-medium animate-pulse border border-blue-200">
                        <Loader className="animate-spin" size={16} /> Cargando datos...
                    </span>
                )}
            </div>

            {/* Summary Dashboard (Visible if Supabase active) */}
            {provider === 'supabase' && schemaStatus && (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Estado de Sincronización</p>
                            <h3 className={`text-2xl font-bold ${syncPercentage === 100 ? 'text-green-600' : 'text-orange-500'}`}>{syncPercentage}%</h3>
                            <p className="text-xs text-gray-400">Tablas sincronizadas</p>
                        </div>
                        <div className={`p-3 rounded-full ${syncPercentage === 100 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                            <RefreshCw size={24} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Total Tablas</p>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{schemaStatus.length}</h3>
                             <p className="text-xs text-gray-400">Detectadas en esquema</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <Table size={24} />
                        </div>
                    </div>
                     <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Registros Remotos</p>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{schemaStatus.reduce((acc, s) => acc + s.remoteCount, 0)}</h3>
                            <p className="text-xs text-gray-400">Total filas en Supabase</p>
                        </div>
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                            <Database size={24} />
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-t-lg border-b border-gray-200 dark:border-slate-700 flex overflow-x-auto">
                <TabButton id="config" label="Conexión BaaS" icon={<Key size={16}/>} />
                <TabButton id="schema" label="Inspector Esquema" icon={<ShieldCheck size={16}/>} />
                <TabButton id="explorer" label="Explorador Datos" icon={<Table size={16}/>} />
                <TabButton id="sql" label="SQL DDL" icon={<Code size={16}/>} />
                <TabButton id="terminal" label="Consola" icon={<Terminal size={16}/>} />
                <TabButton id="mailing" label="Mailing" icon={<Mail size={16}/>} />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-b-lg shadow-sm border border-t-0 border-gray-200 dark:border-slate-700 min-h-[400px]">
                
                {/* CONFIGURATION TAB */}
                {activeTab === 'config' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* TARJETA LOCAL */}
                            <div 
                                onClick={handleSwitchToLocal}
                                className={`cursor-pointer p-6 rounded-xl border-2 text-left transition-all flex flex-col gap-3 relative group ${provider === 'local' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-blue-300'}`}
                            >
                                <Server size={24} className={provider === 'local' ? 'text-blue-600' : 'text-gray-400'} />
                                <div>
                                    <h3 className="font-bold text-lg">Local / Demo</h3>
                                    <p className="text-xs text-gray-500">Datos en memoria.</p>
                                </div>
                                {provider === 'local' && <CheckCircle className="absolute top-4 right-4 text-blue-600" size={20} />}
                                {provider !== 'local' && (
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">Activar</span>
                                    </div>
                                )}
                            </div>

                            {/* TARJETA SUPABASE */}
                            <div className={`col-span-1 md:col-span-2 p-6 rounded-xl border-2 text-left transition-all flex flex-col relative ${provider === 'supabase' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-slate-700'}`}>
                                <div 
                                    className="flex justify-between items-start cursor-pointer"
                                    onClick={() => setIsSupabaseExpanded(!isSupabaseExpanded)}
                                >
                                    <div className="flex gap-4">
                                        <div className={`p-2 rounded-lg h-fit ${provider === 'supabase' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <Database size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Supabase</h3>
                                            <p className="text-xs text-gray-500">PostgreSQL Database & Realtime</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {provider === 'supabase' && <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full"><Check size={12}/> Conectado</span>}
                                        <Button size="sm" variant={isSupabaseExpanded ? "secondary" : "primary"} onClick={(e) => { e.stopPropagation(); setIsSupabaseExpanded(!isSupabaseExpanded); }}>
                                            {isSupabaseExpanded ? 'Ocultar Config' : 'Configurar'}
                                        </Button>
                                    </div>
                                </div>

                                {isSupabaseExpanded && (
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-600 animate-in slide-in-from-top-2 fade-in">
                                        <div className="space-y-4 max-w-2xl">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Project URL</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                                                    value={config.supabaseConfig?.url || ''}
                                                    onChange={e => handleInputChange('supabaseConfig', 'url', e.target.value)}
                                                    placeholder="https://xyz.supabase.co"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Anon Public Key</label>
                                                <input 
                                                    type="password" 
                                                    className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                                                    value={config.supabaseConfig?.anonKey || ''}
                                                    onChange={e => handleInputChange('supabaseConfig', 'anonKey', e.target.value)}
                                                    placeholder="eyJhbGciOiJIUzI1Ni..."
                                                />
                                            </div>
                                            
                                            <div className="flex items-center gap-4 pt-2">
                                                <Button 
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 w-full justify-center" 
                                                    onClick={handleConnectSupabase}
                                                    disabled={testStatus === 'testing'}
                                                    leftIcon={testStatus === 'testing' ? <Loader className="animate-spin" size={16}/> : <Power size={16}/>}
                                                >
                                                    {testStatus === 'testing' ? 'Conectando...' : 'Guardar y Conectar'}
                                                </Button>
                                            </div>

                                            {connectionFeedback && (
                                                <div className={`p-3 rounded-lg flex items-start gap-2 text-sm border ${connectionFeedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                                    {connectionFeedback.type === 'success' ? <CheckCircle className="shrink-0 mt-0.5" size={16}/> : <AlertTriangle className="shrink-0 mt-0.5" size={16}/>}
                                                    <span>{connectionFeedback.msg}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* SCHEMA INSPECTOR TAB */}
                {activeTab === 'schema' && (
                     <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 border rounded-lg border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                                <h3 className="font-bold mb-4 flex items-center gap-2"><ArrowRightLeft size={18}/> Acciones de Sincronización</h3>
                                <div className="flex flex-col gap-3">
                                     <Button onClick={() => handleCheckSchema()} disabled={isCheckingSchema || provider !== 'supabase'} variant="secondary">
                                        {isCheckingSchema ? <><Loader className="animate-spin mr-2" size={16}/> Auditando...</> : <><RefreshCw className="mr-2" size={16}/> Refrescar Auditoría</>}
                                    </Button>
                                    <Button onClick={() => setIsConfirmMigrateOpen(true)} disabled={isMigrating || provider !== 'supabase'}>
                                        {isMigrating ? <><Loader className="animate-spin mr-2" size={16}/> Migrando...</> : <><CloudLightning className="mr-2" size={16}/> Push Local -> Remoto</>}
                                    </Button>
                                    {provider !== 'supabase' && <p className="text-xs text-orange-500">Activa el modo Supabase para sincronizar.</p>}
                                </div>
                            </div>
                            <div className="p-4 border rounded-lg border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-red-700 dark:text-red-400"><AlertTriangle size={18}/> Danger Zone</h3>
                                <div className="flex flex-col gap-3">
                                     <Button onClick={() => setIsConfirmLocalClearOpen(true)} disabled={isClearingLocal} variant="danger" className="bg-red-600 hover:bg-red-700 text-white border-none">
                                        {isClearingLocal ? <><Loader className="animate-spin mr-2" size={16}/> Borrando...</> : <><Trash2 className="mr-2" size={16}/> Vaciar Datos Locales</>}
                                    </Button>
                                    <Button onClick={() => setIsConfirmRemoteClearOpen(true)} disabled={isClearingRemote || provider !== 'supabase'} variant="danger" className="bg-red-600 hover:bg-red-700 text-white border-none">
                                        {isClearingRemote ? <><Loader className="animate-spin mr-2" size={16}/> Borrando...</> : <><Trash2 className="mr-2" size={16}/> Vaciar Supabase (Truncate)</>}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {isCheckingSchema ? (
                            <div className="flex flex-col items-center justify-center py-12 border rounded-lg border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                                <Loader className="animate-spin text-primary-500 mb-2" size={32}/>
                                <p className="text-gray-500 animate-pulse">Realizando auditoría profunda de tablas...</p>
                            </div>
                        ) : schemaStatus ? (
                            <div className="border rounded-lg overflow-hidden dark:border-slate-700 animate-in fade-in">
                                <div className="bg-gray-100 dark:bg-slate-800 p-3 border-b dark:border-slate-700 font-semibold text-sm px-4 flex justify-between items-center">
                                    <span>Detalle por Tabla</span>
                                    <span className="text-xs text-gray-500">{schemaStatus.length} tablas auditadas</span>
                                </div>
                                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 dark:bg-slate-700/50 text-xs uppercase font-medium text-gray-500 sticky top-0 z-10">
                                            <tr>
                                                <th className="p-3 pl-4">Tabla</th>
                                                <th className="p-3 text-center">Estado</th>
                                                <th className="p-3 text-center">Local</th>
                                                <th className="p-3 text-center">Remoto</th>
                                                <th className="p-3 text-center w-32">Sync Status</th>
                                                <th className="p-3 text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                            {schemaStatus.map(s => {
                                                const isSynced = s.localCount === s.remoteCount;
                                                const diff = s.localCount - s.remoteCount;
                                                
                                                return (
                                                    <tr key={s.tableName} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 group">
                                                        <td className="p-3 pl-4 font-mono text-blue-600 dark:text-blue-400 font-medium">{s.tableName}</td>
                                                        <td className="p-3 text-center">
                                                            {s.status === 'exists' 
                                                                ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs"><Check size={12}/> OK</span> 
                                                                : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs"><X size={12}/> Missing</span>
                                                            }
                                                        </td>
                                                        <td className="p-3 text-center font-mono text-gray-700 dark:text-gray-300">{s.localCount}</td>
                                                        <td className="p-3 text-center font-mono text-gray-700 dark:text-gray-300">{s.remoteCount}</td>
                                                        <td className="p-3 text-center">
                                                             <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 relative overflow-hidden">
                                                                <div 
                                                                    className={`h-2.5 rounded-full ${isSynced ? 'bg-green-500' : 'bg-orange-500'}`} 
                                                                    style={{ width: s.remoteCount > 0 ? Math.min(100, (s.localCount / s.remoteCount) * 100) + '%' : '0%' }}
                                                                ></div>
                                                            </div>
                                                            {!isSynced && (
                                                                <span className="text-[10px] text-orange-600 font-medium mt-1 block">
                                                                    {diff > 0 ? `+${diff} local` : `${diff} local`}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                <button 
                                                                    onClick={() => { setSelectedTableForExplorer(s.tableName); setActiveTab('explorer'); }} 
                                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                                                                    title="Explorar Datos"
                                                                >
                                                                    <Eye size={14} />
                                                                </button>
                                                                {provider === 'supabase' && (
                                                                    <button 
                                                                        onClick={() => handleClearTable(s.tableName, 'remote')}
                                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                                                        title="Vaciar Remoto (Truncate)"
                                                                        disabled={s.status !== 'exists' || s.remoteCount === 0 || isClearingTable === `remote-${s.tableName}`}
                                                                    >
                                                                        {isClearingTable === `remote-${s.tableName}` ? <Loader size={14} className="animate-spin"/> : <Trash2 size={14} />}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                                <Database size={48} className="mx-auto mb-2 opacity-20"/>
                                <p>Pulsa "Refrescar Auditoría" para analizar la base de datos.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* DATA EXPLORER TAB */}
                {activeTab === 'explorer' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-4 mb-4">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-bold flex items-center gap-2"><Table size={20}/> Explorador de Datos Remotos</h3>
                                <select 
                                    value={selectedTableForExplorer} 
                                    onChange={(e) => setSelectedTableForExplorer(e.target.value)}
                                    className="p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-sm min-w-[200px]"
                                >
                                    {schemaStatus?.map(s => <option key={s.tableName} value={s.tableName}>{s.tableName}</option>) || <option value="users">users</option>}
                                </select>
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => fetchExplorerData(selectedTableForExplorer)} disabled={isExplorerLoading}>
                                {isExplorerLoading ? <Loader className="animate-spin" size={16}/> : <RefreshCw size={16}/>} Recargar
                            </Button>
                        </div>

                        {explorerData.length > 0 ? (
                            <div className="border rounded-lg overflow-hidden dark:border-slate-700">
                                <div className="max-h-[500px] overflow-auto custom-scrollbar">
                                    <table className="w-full text-xs text-left whitespace-nowrap">
                                        <thead className="bg-gray-100 dark:bg-slate-800 sticky top-0 z-10 text-gray-700 dark:text-gray-300 font-bold">
                                            <tr>
                                                {Object.keys(explorerData[0]).map(key => (
                                                    <th key={key} className="p-3 border-b border-r dark:border-slate-700 last:border-r-0">{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700 font-mono">
                                            {explorerData.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-blue-50 dark:hover:bg-slate-800/50">
                                                    {Object.values(row).map((val: any, i) => (
                                                        <td key={i} className="p-3 border-r dark:border-slate-700 last:border-r-0 max-w-[200px] truncate" title={typeof val === 'object' ? JSON.stringify(val) : String(val)}>
                                                            {typeof val === 'object' ? (val === null ? <span className="text-gray-400">null</span> : <span className="text-purple-600">{JSON.stringify(val)}</span>) : String(val)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-2 bg-gray-50 dark:bg-slate-900 text-xs text-gray-500 border-t dark:border-slate-700">
                                    Mostrando los primeros {explorerData.length} registros.
                                </div>
                            </div>
                        ) : (
                             <div className="text-center py-16 text-gray-400 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-gray-300 dark:border-slate-700">
                                {isExplorerLoading ? (
                                    <div className="flex flex-col items-center"><Loader size={32} className="animate-spin mb-2"/> Cargando datos...</div>
                                ) : (
                                    <><Info size={32} className="mx-auto mb-2"/> No hay datos o no se ha seleccionado una tabla válida.</>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* SQL GENERATOR TAB */}
                {activeTab === 'sql' && (
                    <div className="space-y-6 animate-in fade-in">
                         <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold">Generador DDL Dinámico</h3>
                                <p className="text-sm text-gray-500">Genera el código SQL necesario para recrear tu estructura de datos local en Supabase.</p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleGenerateDropSQL} variant="danger" leftIcon={<Trash2 size={16}/>}>Script Destruir Tablas</Button>
                                <Button onClick={handleGenerateSQL} leftIcon={<Code size={16}/>}>Generar Script</Button>
                            </div>
                        </div>
                        
                        <div className="relative group bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shadow-inner h-[500px]">
                            <div className="absolute top-0 right-0 p-2">
                                <button 
                                    onClick={() => { navigator.clipboard.writeText(generatedSql); addLog("Código SQL copiado."); }}
                                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
                                    title="Copiar"
                                >
                                    <Copy size={16}/>
                                </button>
                            </div>
                            <textarea 
                                className="w-full h-full bg-transparent text-emerald-400 font-mono text-xs p-4 resize-none focus:outline-none custom-scrollbar" 
                                value={generatedSql || "-- Pulsa 'Generar Script' para ver el código SQL..."}
                                readOnly
                            />
                        </div>
                    </div>
                )}

                {/* TERMINAL TAB */}
                {activeTab === 'terminal' && (
                    <div className="animate-in fade-in space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2"><Terminal size={20}/> Consola del Sistema</h3>
                        <TerminalOutput logs={logs} />
                        <div className="flex gap-2">
                             <Button size="sm" variant="secondary" onClick={() => setLogs([])}>Limpiar consola</Button>
                        </div>
                    </div>
                )}
                
                {activeTab === 'mailing' && (
                    <div className="text-center text-gray-500 p-10">
                        <Mail size={48} className="mx-auto mb-4 opacity-30"/>
                        <h3 className="text-lg font-bold">Configuración de Mailing</h3>
                        <p className="mt-2">Esta sección se utilizará para configurar servicios de envío de correo como Mailgun, SendGrid, etc. en futuras versiones.</p>
                    </div>
                )}

            </div>
            
            {/* Modals */}
            <ConfirmationModal
                isOpen={isConfirmMigrateOpen}
                onClose={() => setIsConfirmMigrateOpen(false)}
                onConfirm={handleMigrateData}
                title="Confirmar Migración"
                message="Se subirán todos los datos locales a Supabase. Si existen registros con el mismo ID, se actualizarán. ¿Deseas continuar?"
                confirmText="Sí, Migrar Datos"
            />
            
             <ConfirmationModal
                isOpen={isConfirmLocalClearOpen}
                onClose={() => setIsConfirmLocalClearOpen(false)}
                onConfirm={handleClearLocal}
                title="Vaciar Datos Locales"
                message="Se eliminarán todos los datos almacenados en la memoria local del navegador. Esta acción no se puede deshacer. ¿Estás seguro?"
                confirmText="Sí, Vaciar Todo"
            />
            
             <ConfirmationModal
                isOpen={isConfirmRemoteClearOpen}
                onClose={() => setIsConfirmRemoteClearOpen(false)}
                onConfirm={handleClearRemote}
                title="Vaciar Supabase (TRUNCATE)"
                message="¡PELIGRO! Se eliminarán TODOS los datos de la base de datos remota (Supabase). Esta acción es irreversible. ¿Estás completamente seguro?"
                confirmText="Sí, BORRAR TODO"
            />
        </div>
    );
};

export default BaaSConfigPage;