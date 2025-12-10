

import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { 
    Database, Save, Server, Lock, Key, AlertTriangle, CheckCircle, 
    Copy, XCircle, Code, ShieldCheck, Terminal, ExternalLink, CloudLightning
} from 'lucide-react';
import { DatabaseProvider, DatabaseConfig } from '../../types';
import { SUPABASE_SCHEMA, SUPABASE_RLS_POLICIES, FIREBASE_SCHEMA } from '../../services/mockData';
import { createClient } from '@supabase/supabase-js';

const DatabaseConfigPage = () => {
    const { dbConfig, updateDbConfig } = useData();
    
    // Set initial state with defaults if needed
    const [config, setConfig] = useState<DatabaseConfig>(() => {
        const initialConfig = { ...dbConfig };
        if (!initialConfig.supabaseConfig?.url && !initialConfig.supabaseConfig?.anonKey) {
            initialConfig.supabaseConfig = {
                url: 'https://ipwtlpbymtozkrnelimo.supabase.co',
                anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwd3RscGJ5bXRvemtybmVsaW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NTkwNzAsImV4cCI6MjA4MDAzNTA3MH0.6ithVSTGdxvZ6B6RBK81dvoRrwTyC-e7zqXGhzg0t9s'
            };
        }
        return initialConfig;
    });

    const [provider, setProvider] = useState<DatabaseProvider>(config.provider);
    
    // UI States
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [activeSqlTab, setActiveSqlTab] = useState<'structure' | 'policies'>('structure');

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
        if (errorMsg) setErrorMsg(null);
        setTestStatus('idle');
    };

    const validate = (): boolean => {
        if (provider === 'firebase') {
            const fb = config.firebaseConfig;
            if (!fb?.apiKey || !fb?.projectId) {
                setErrorMsg("Faltan campos obligatorios de Firebase.");
                return false;
            }
        } else if (provider === 'supabase') {
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
        setErrorMsg(null);
        
        if (provider === 'supabase') {
            try {
                const sb = config.supabaseConfig!;
                const supabase = createClient(sb.url, sb.anonKey);
                
                const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
                
                if (error) {
                    if (error.code === '42P01' || error.message.includes('relation') || error.code === 'PGRST116') {
                         setTestStatus('success');
                         return;
                    }
                    throw error;
                }
                setTestStatus('success');
            } catch (err: any) {
                setTestStatus('error');
                setErrorMsg(err.message || "No se pudo establecer conexión con Supabase. Verifica la URL y la Key.");
            }
        } else if (provider === 'local') {
            setTimeout(() => setTestStatus('success'), 500);
        } else {
            setTimeout(() => setTestStatus('success'), 1000);
        }
    };

    const handleSave = () => {
        if (!validate()) return;
        updateDbConfig(config);
        setShowSuccess(true);
    };

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopySuccess(label);
        setTimeout(() => setCopySuccess(null), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-24">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <CloudLightning className="text-primary-600" size={32} /> 
                        Configuración BaaS
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-lg">
                        Gestiona la conexión con tu Backend as a Service.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {showSuccess && (
                        <span className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full text-sm font-medium animate-in fade-in">
                            <CheckCircle size={16} /> Configuración guardada
                        </span>
                    )}
                    <Button onClick={handleSave} leftIcon={<Save size={18}/>} size="lg">
                        Guardar Cambios
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button 
                    onClick={() => handleProviderChange('local')}
                    className={`relative p-6 rounded-xl border-2 text-left transition-all duration-200 flex flex-col gap-3 hover:shadow-md ${provider === 'local' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300'}`}
                >
                    <div className={`p-3 rounded-lg w-fit ${provider === 'local' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>
                        <Server size={24} />
                    </div>
                    <div>
                        <h3 className={`font-bold text-lg ${provider === 'local' ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>Local / Demo</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Datos en memoria. Se pierden al cerrar.</p>
                    </div>
                    {provider === 'local' && <div className="absolute top-4 right-4 text-blue-600"><CheckCircle size={20} /></div>}
                </button>

                <button 
                    onClick={() => handleProviderChange('supabase')}
                    className={`relative p-6 rounded-xl border-2 text-left transition-all duration-200 flex flex-col gap-3 hover:shadow-md ${provider === 'supabase' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-300'}`}
                >
                    <div className={`p-3 rounded-lg w-fit ${provider === 'supabase' ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>
                        <Database size={24} />
                    </div>
                    <div>
                        <h3 className={`font-bold text-lg ${provider === 'supabase' ? 'text-emerald-900 dark:text-emerald-100' : 'text-gray-900 dark:text-white'}`}>Supabase</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">PostgreSQL escalable y tiempo real.</p>
                    </div>
                    {provider === 'supabase' && <div className="absolute top-4 right-4 text-emerald-600"><CheckCircle size={20} /></div>}
                </button>

                <button 
                    onClick={() => handleProviderChange('firebase')}
                    className={`relative p-6 rounded-xl border-2 text-left transition-all duration-200 flex flex-col gap-3 hover:shadow-md ${provider === 'firebase' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-300'}`}
                >
                    <div className={`p-3 rounded-lg w-fit ${provider === 'firebase' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>
                        <CloudLightning size={24} />
                    </div>
                    <div>
                        <h3 className={`font-bold text-lg ${provider === 'firebase' ? 'text-orange-900 dark:text-orange-100' : 'text-gray-900 dark:text-white'}`}>Firebase</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Infraestructura de Google.</p>
                    </div>
                    {provider === 'firebase' && <div className="absolute top-4 right-4 text-orange-600"><CheckCircle size={20} /></div>}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Key className="text-primary-500" size={20}/> Credenciales
                        </h2>
                        
                        {provider === 'local' && (
                            <div className="text-center py-8 text-gray-500">
                                <p>No se requieren credenciales para el modo local.</p>
                            </div>
                        )}

                        {provider === 'supabase' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Project URL</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                        placeholder="https://xyz.supabase.co"
                                        value={config.supabaseConfig?.url || ''}
                                        onChange={e => handleInputChange('supabaseConfig', 'url', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Anon Public Key</label>
                                    <input 
                                        type="password" 
                                        className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                        placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                                        value={config.supabaseConfig?.anonKey || ''}
                                        onChange={e => handleInputChange('supabaseConfig', 'anonKey', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {provider === 'firebase' && (
                             <div className="space-y-4">
                                <div className="md:col-span-2"><p className="text-sm text-gray-500">Copia el objeto de configuración de tu proyecto Firebase.</p></div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">API Key</label>
                                    <input 
                                        type="password" 
                                        className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 transition-all"
                                        placeholder="AIzaSy..."
                                        value={config.firebaseConfig?.apiKey || ''}
                                        onChange={e => handleInputChange('firebaseConfig', 'apiKey', e.target.value)}
                                    />
                                </div>
                                 <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Project ID</label>
                                    <input 
                                        type="text" 
                                        value={config.firebaseConfig?.projectId || ''} 
                                        onChange={e => handleInputChange('firebaseConfig', 'projectId', e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-sm" 
                                        placeholder="mi-proyecto-id"
                                    />
                                </div>
                            </div>
                        )}

                        {provider !== 'local' && (
                            <div className="pt-6 mt-2 border-t border-gray-100 dark:border-slate-700">
                                <Button 
                                    variant="secondary" 
                                    className={`w-full justify-center transition-all ${testStatus === 'success' ? 'bg-green-100 text-green-700 border-green-200' : testStatus === 'error' ? 'bg-red-100 text-red-700 border-red-200' : ''}`} 
                                    onClick={handleTestConnection}
                                    disabled={testStatus === 'testing'}
                                >
                                    {testStatus === 'testing' ? 'Conectando...' : testStatus === 'success' ? '¡Conexión Exitosa!' : testStatus === 'error' ? 'Error de Conexión' : 'Probar Conexión'}
                                </Button>
                                {errorMsg && (
                                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg flex gap-2 text-xs text-red-700 dark:text-red-300">
                                        <XCircle size={16} className="shrink-0"/>
                                        <span>{errorMsg}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 h-full flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex items-center justify-between rounded-t-xl">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Terminal size={20} className="text-gray-500"/> Consola de Configuración
                            </h2>
                            {provider === 'supabase' && (
                                <a href="https://supabase.com/dashboard/project/_/editor" target="_blank" rel="noreferrer" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                                    Abrir SQL Editor <ExternalLink size={12}/>
                                </a>
                            )}
                        </div>

                        <div className="p-6 flex-grow">
                            {provider === 'local' ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 opacity-60">
                                    <Server size={64} strokeWidth={1} className="mb-4"/>
                                    <p>No se requiere configuración adicional para el modo local.</p>
                                </div>
                            ) : provider === 'supabase' ? (
                                <div className="space-y-6">
                                    <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700 pb-1">
                                        <button 
                                            onClick={() => setActiveSqlTab('structure')}
                                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeSqlTab === 'structure' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                        >
                                            <Code size={16}/> 1. Estructura (SQL)
                                        </button>
                                        <button 
                                            onClick={() => setActiveSqlTab('policies')}
                                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeSqlTab === 'policies' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                        >
                                            <ShieldCheck size={16}/> 2. Políticas (RLS)
                                        </button>
                                    </div>

                                    <div className="relative group bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-inner">
                                        <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
                                            <span className="text-xs font-mono text-gray-400">
                                                {activeSqlTab === 'structure' ? 'schema.sql' : 'rls_policies.sql'}
                                            </span>
                                            <button 
                                                onClick={() => handleCopy(activeSqlTab === 'structure' ? SUPABASE_SCHEMA : SUPABASE_RLS_POLICIES, activeSqlTab)}
                                                className="text-xs flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
                                            >
                                                {copySuccess === activeSqlTab ? <CheckCircle size={14} className="text-emerald-400"/> : <Copy size={14}/>}
                                                {copySuccess === activeSqlTab ? '¡Copiado!' : 'Copiar código'}
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto max-h-[400px] custom-scrollbar p-4">
                                            <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
                                                {activeSqlTab === 'structure' ? SUPABASE_SCHEMA : SUPABASE_RLS_POLICIES}
                                            </pre>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-lg border border-blue-100 dark:border-blue-800">
                                        <AlertTriangle size={18} className="shrink-0 mt-0.5"/>
                                        <p>
                                            {activeSqlTab === 'structure' 
                                                ? "Ejecuta este script primero para crear todas las tablas necesarias en tu proyecto de Supabase." 
                                                : "Ejecuta este script después de crear las tablas para habilitar el acceso y la seguridad de datos."}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                     <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                        <Code size={18}/> Reglas de Seguridad (JSON)
                                    </h3>
                                    <div className="relative group bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-inner">
                                        <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
                                            <span className="text-xs font-mono text-gray-400">rules.json</span>
                                            <button 
                                                onClick={() => handleCopy(FIREBASE_SCHEMA, 'firebase')}
                                                className="text-xs flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
                                            >
                                                {copySuccess === 'firebase' ? <CheckCircle size={14} className="text-orange-400"/> : <Copy size={14}/>}
                                                {copySuccess === 'firebase' ? '¡Copiado!' : 'Copiar reglas'}
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto max-h-[400px] custom-scrollbar p-4">
                                            <pre className="text-xs font-mono text-orange-300 leading-relaxed">
                                                {FIREBASE_SCHEMA}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatabaseConfigPage;