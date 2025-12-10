import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Calculator, FileCheck, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const FiscalModelsPage = () => {
    const { fiscalModels, fiscalConfig } = useData();

    const getModelName = (type: string) => {
        const names: Record<string, string> = {
            '303': 'IVA Trimestral',
            '130': 'IRPF Trimestral (Autónomos)',
            '111': 'Retenciones Trabajadores/Profesionales',
            '115': 'Retenciones Alquileres',
            '349': 'Operaciones Intracomunitarias',
            '390': 'Resumen Anual IVA'
        };
        return names[type] || `Modelo ${type}`;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Calculator className="text-primary-600 dark:text-primary-400" /> Modelos Fiscales
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fiscalConfig.activeModels.map(modelType => {
                    const models = fiscalModels.filter(m => m.modelType === modelType);
                    const lastModel = models[models.length - 1];

                    return (
                        <Card key={modelType} className="relative overflow-hidden p-0">
                            <div className="p-6">
                                <div className="absolute top-4 right-4 text-gray-200 dark:text-slate-700">
                                    <FileCheck size={64} />
                                </div>
                                <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-1">Modelo {modelType}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{getModelName(modelType)}</p>
                                
                                {lastModel ? (
                                    <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded mb-4">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Última presentación</p>
                                        <div className="flex justify-between items-end mt-1">
                                            <span className="font-semibold text-lg text-gray-800 dark:text-white">{lastModel.period} {lastModel.year}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${lastModel.status === 'Presented' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                                                {lastModel.status === 'Presented' ? 'Presentado' : 'Pendiente'}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                                        <AlertCircle size={16} />
                                        <span className="text-sm font-medium">Sin historial</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-200 dark:border-slate-700">
                                <Button className="w-full" variant="secondary">Generar Nuevo</Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default FiscalModelsPage;