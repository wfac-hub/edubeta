
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { 
    Database, Save, Server, Lock, Key, AlertTriangle, CheckCircle, 
    Copy, XCircle, Code, ShieldCheck, Terminal, ExternalLink, CloudLightning,
    ArrowRightLeft, Loader, RefreshCw, Check, X, Play
} from 'lucide-react';
import { DatabaseProvider, DatabaseConfig } from '../../types';
import { createClient } from '@supabase/supabase-js';
import { dataService } from '../../services/dataService';

const TerminalOutput: React.FC<{ logs: string[] }> = ({ logs }) => {
    const endRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="bg-slate-950 text-green-400 font-mono text-xs p-4 rounded-lg h-64 overflow-y-auto border border-slate-800 shadow-inner">
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

const DatabaseConfigPage = () => {
    const { dbConfig, updateDbConfig, refreshData } = useData();
    
    const [config, setConfig] = useState<DatabaseConfig>(() => {
        const initialConfig = { ...dbConfig };
        if (!initialConfig.supabaseConfig?.url && !initialConfig.supabaseConfig?.anonKey) {
            initialConfig.supabaseConfig = {
                url: 'https://xyz.supabase.co',
                anonKey: ''
            };
        }
        return initialConfig;
    });

    const [provider, setProvider] = useState<DatabaseProvider>(config.provider);
    const [activeTab, setActiveTab] = useState<'config' | 'schema' | 'sql' | 'terminal'>('config');
    
    // States
    const [logs, setLogs] = useState<string[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [schemaStatus, setSchemaStatus] = useState<{ tableName: string, status: string, remoteCount: number, localCount: number }[] | null>(null);
    const [generatedSql, setGeneratedSql] = useState('');

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    const handleProviderChange = (newProvider: DatabaseProvider) => {
        setProvider(newProvider);
        setConfig(prev => ({ ...prev, provider: newProvider }));
        setErrorMsg(null);
        setTestStatus('idle');
    };

    const handleInputChange = (section: 'firebaseConfig' | 'supabaseConfig', field: string, value: string) => {
        setConfig(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const validate = (): boolean => {
        if (provider === 'supabase') {
            const sb = config.supabaseConfig;
            if (!sb?.url || !sb?.anonKey) {
                setErrorMsg("Faltan campos obligatorios de Supabase.");
                return false;
            }
        }
        return true;
    };

    const handleTestConnection = async () => {
        if (!validate()) return;
        setTestStatus('testing');
        addLog(`Intentando conectar con ${provider}...`);
        setErrorMsg(null);
        
        if (provider === 'supabase') {
            try {
                const sb = config.supabaseConfig!;
                const supabase = createClient(sb.url, sb.anonKey);
                const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
                
                if (error && error.code !== '42P01' && error.code !== 'PGRST116') {
                     throw error;
                }
                setTestStatus('success');
                addLog(`✅ Conexión establecida correctamente con Supabase.`);
            } catch (err: any) {
                setTestStatus('error');
                setErrorMsg(err.message);
                addLog(`❌ Error de conexión: ${err.message}`);
            }
        } else {
            setTestStatus('success');
            addLog(`✅ Modo local activo.`);
        }
    };

    const handleSave = () => {
        if (!validate()) return;
        updateDbConfig(config);
        setShowSuccess(true);
        dataService.loadConfig();
        refreshData();
        addLog(`Configuración guardada. Proveedor activo: ${config.provider}`);
    };

    const handleCheckSchema = async () => {
        if (provider !== 'supabase') return alert("Solo disponible en modo Supabase");
        addLog("Analizando esquema remoto...");
        try {
            const status = await dataService.checkRemoteSchemaStatus();
            setSchemaStatus(status);
            const missing = status.filter(s => s.status === 'missing').length;
            if (missing > 0) addLog(`⚠️ Se encontraron ${missing} tablas faltantes en Supabase.`);
            else addLog(`✅ Todas las tablas existen en el remoto.`);
        } catch (e: any) {
            addLog(`❌ Error analizando esquema: ${e.message}`);
        }
    };

    const handleGenerateSQL = () => {
        addLog("Generando script SQL basado en modelos locales...");
        const sql = dataService.generateDynamicSQL();
        setGeneratedSql(sql);
        addLog("SQL Generado. Copialo y ejecútalo en el editor SQL de Supabase.");
    };

    const handleMigrateData = async () => {
        if (!confirm("¿Estás seguro? Esto insertará datos masivamente en Supabase.")) return;
        addLog("🚀 Iniciando migración de datos...");
        const res = await dataService.migrateLocalToSupabase((msg) => addLog(msg));
        if (res.success) {
            addLog("✅ Migración completada con éxito.");
            handleCheckSchema(); // Refresh status
        } else {
            addLog(`❌ Error en migración: ${res.details}`);
        }
    };

    const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: React.ReactNode }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === id ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
            {icon} {label}
        </button>
    );

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
                        Panel de control de base de datos y sincronización.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {showSuccess && (
                        <span className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-sm font-medium animate-in fade-in">
                            <CheckCircle size={16} /> Guardado
                        </span>
                    )}
                    <Button onClick={handleSave} leftIcon={<Save size={18}/>} size="lg">
                        Aplicar Cambios
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-t-lg border-b border-gray-200 dark:border-slate-700 flex overflow-x-auto">
                <TabButton id="config" label="Conexión" icon={<Key size={18}/>} />
                {provider === 'supabase' && (
                    <>
                        <TabButton id="schema" label="Estado Tablas" icon={<Database size={18}/>} />
                        <TabButton id="sql" label="Generador SQL" icon={<Code size={18}/>} />
                    </>
                )}
                <TabButton id="terminal" label="Consola" icon={<Terminal size={18}/>} />
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-b-lg shadow-sm border border-gray-200 border-t-0 dark:border-slate-700 min-h-[400px]">
                
                {/* CONFIGURATION TAB */}
                {activeTab === 'config' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <button 
                                onClick={() => handleProviderChange('local')}
                                className={`p-6 rounded-xl border-2 text-left transition-all flex flex-col gap-3 ${provider === 'local' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-blue-300'}`}
                            >
                                <Server size={24} className={provider === 'local' ? 'text-blue-600' : 'text-gray-400'} />
                                <div>
                                    <h3 className="font-bold text-lg">Local / Demo</h3>
                                    <p className="text-xs text-gray-500">Datos en memoria.</p>
                                </div>
                                {provider === 'local' && <CheckCircle className="absolute top-4 right-4 text-blue-600" size={20} />}
                            </button>

                            <button 
                                onClick={() => handleProviderChange('supabase')}
                                className={`p-6 rounded-xl border-2 text-left transition-all flex flex-col gap-3 ${provider === 'supabase' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-emerald-300'}`}
                            >
                                <Database size={24} className={provider === 'supabase' ? 'text-emerald-600' : 'text-gray-400'} />
                                <div>
                                    <h3 className="font-bold text-lg">Supabase</h3>
                                    <p className="text-xs text-gray-500">PostgreSQL Realtime.</p>
                                </div>
                                {provider === 'supabase' && <CheckCircle className="absolute top-4 right-4 text-emerald-600" size={20} />}
                            </button>
                        </div>

                        {provider === 'supabase' && (
                            <div className="max-w-2xl mx-auto space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Project URL</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                                        value={config.supabaseConfig?.url || ''}
                                        onChange={e => handleInputChange('supabaseConfig', 'url', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Anon Public Key</label>
                                    <input 
                                        type="password" 
                                        className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                                        value={config.supabaseConfig?.anonKey || ''}
                                        onChange={e => handleInputChange('supabaseConfig', 'anonKey', e.target.value)}
                                    />
                                </div>
                                <div className="pt-4">
                                    <Button variant="secondary" className="w-full justify-center" onClick={handleTestConnection} disabled={testStatus === 'testing'}>
                                        {testStatus === 'testing' ? 'Conectando...' : 'Probar Conexión'}
                                    </Button>
                                    {errorMsg && <p className="text-red-500 text-sm mt-2 text-center">{errorMsg}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* SCHEMA STATUS TAB */}
                {activeTab === 'schema' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Estado de Sincronización</h3>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={handleCheckSchema} leftIcon={<RefreshCw size={16}/>}>Comprobar Tablas</Button>
                                <Button size="sm" onClick={handleMigrateData} leftIcon={<ArrowRightLeft size={16}/>} disabled={!schemaStatus}>Migrar Datos</Button>
                            </div>
                        </div>

                        {schemaStatus ? (
                            <div className="border rounded-lg overflow-hidden dark:border-slate-700">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-slate-700/50 text-xs uppercase font-medium text-gray-500">
                                        <tr>
                                            <th className="p-3">Tabla</th>
                                            <th className="p-3 text-center">Estado</th>
                                            <th className="p-3 text-center">Reg. Locales</th>
                                            <th className="p-3 text-center">Reg. Remotos</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                        {schemaStatus.map(s => (
                                            <tr key={s.tableName} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                                <td className="p-3 font-mono text-blue-600 dark:text-blue-400">{s.tableName}</td>
                                                <td className="p-3 text-center">
                                                    {s.status === 'exists' 
                                                        ? <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs"><Check size={12}/> Existe</span> 
                                                        : <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs"><X size={12}/> Falta</span>
                                                    }
                                                </td>
                                                <td className="p-3 text-center text-gray-600 dark:text-gray-300">{s.localCount}</td>
                                                <td className="p-3 text-center text-gray-600 dark:text-gray-300">{s.remoteCount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                                <Database size={48} className="mx-auto mb-2 opacity-20"/>
                                <p>Pulsa "Comprobar Tablas" para analizar la base de datos.</p>
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
                            <Button onClick={handleGenerateSQL} leftIcon={<Code size={16}/>}>Generar Script</Button>
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
                                className="w-full h-full bg-transparent text-emerald-400 font-mono text-xs p-4 resize-none focus:outline-none" 
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
                             <Button size="sm" variant="secondary" onClick={() => setLogs([])}>Limpiar</Button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default DatabaseConfigPage;
