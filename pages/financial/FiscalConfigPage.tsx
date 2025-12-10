import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { Settings, Save, Building, ShieldCheck, CheckCircle } from 'lucide-react';
import { FiscalConfig } from '../../types';

const FiscalConfigPage = () => {
    const { fiscalConfig, updateFiscalConfig } = useData();
    const [formData, setFormData] = useState<FiscalConfig>(fiscalConfig);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleModelToggle = (model: string) => {
        setFormData(prev => {
            const active = prev.activeModels.includes(model)
                ? prev.activeModels.filter(m => m !== model)
                : [...prev.activeModels, model];
            return { ...prev, activeModels: active };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateFiscalConfig(formData);
        setShowSuccess(true);
    };

    const inputBaseClasses = "w-full p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Settings className="text-primary-600 dark:text-primary-400" /> Configuración Fiscal
                </h1>
                <div className="flex items-center gap-4">
                    {showSuccess && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-fade-in bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-md">
                            <CheckCircle size={16} />
                            <span>Guardado correctamente</span>
                        </div>
                    )}
                    <Button type="submit" leftIcon={<Save size={16} />}>Guardar Configuración</Button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-white"><Building size={20} className="text-gray-500"/> Datos Fiscales Básicos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClasses}>Tipo de Empresa</label>
                        <select name="companyType" value={formData.companyType} onChange={handleChange} className={inputBaseClasses}>
                            <option value="Autonomo">Autónomo / Persona Física</option>
                            <option value="Sociedad">Sociedad (S.L., S.A., etc.)</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClasses}>NIF / CIF</label>
                        <input type="text" name="taxId" value={formData.taxId} onChange={handleChange} className={inputBaseClasses} />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClasses}>Dirección Fiscal</label>
                        <input type="text" name="fiscalAddress" value={formData.fiscalAddress} onChange={handleChange} className={inputBaseClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Epígrafe IAE</label>
                        <input type="text" name="iae" value={formData.iae} onChange={handleChange} className={inputBaseClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Cuenta Bancaria (IBAN)</label>
                        <input type="text" name="iban" value={formData.iban} onChange={handleChange} className={inputBaseClasses} />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-white"><ShieldCheck size={20} className="text-gray-500"/> Régimen Fiscal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClasses}>Régimen de IVA</label>
                        <select name="vatRegime" value={formData.vatRegime} onChange={handleChange} className={inputBaseClasses}>
                            <option value="General">Régimen General</option>
                            <option value="Exento">Exento de IVA (Formación reglada)</option>
                            <option value="Recargo">Recargo de Equivalencia</option>
                        </select>
                    </div>
                    
                    {formData.companyType === 'Autonomo' && (
                        <div>
                            <label className={labelClasses}>Tipo de IRPF (Retención)</label>
                            <select name="irpfType" value={formData.irpfType} onChange={handleChange} className={inputBaseClasses}>
                                <option value="Standard_15">General (15%)</option>
                                <option value="Reduced_7">Nuevos Autónomos (7%)</option>
                                <option value="Modules_1">Módulos (1%)</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Modelos Fiscales Activos</label>
                    <div className="flex flex-wrap gap-4">
                        {['303', '130', '111', '115', '349', '390', '190'].map(model => (
                            <label key={model} className="flex items-center space-x-2 cursor-pointer bg-gray-50 dark:bg-slate-700/50 px-3 py-2 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300">
                                <input 
                                    type="checkbox" 
                                    checked={formData.activeModels.includes(model)} 
                                    onChange={() => handleModelToggle(model)}
                                    className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                                />
                                <span>Modelo {model}</span>
                            </label>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Selecciona los modelos que estás obligado a presentar. El sistema generará alertas basadas en esta selección.</p>
                </div>
            </div>
        </form>
    );
};

export default FiscalConfigPage;