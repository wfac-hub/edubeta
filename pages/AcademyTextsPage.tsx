import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import RichTextEditor from '../components/ui/RichTextEditor';
import { useData } from '../contexts/DataContext';
import { AcademyProfile } from '../types';
import { CheckCircle } from 'lucide-react';

const AcademyTextsPage = () => {
    const { academyProfile, updateAcademyProfile } = useData();
    const [formData, setFormData] = useState<AcademyProfile>(academyProfile);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setFormData(academyProfile);
    }, [academyProfile]);

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRichTextChange = (field: 'dataProtectionText' | 'termsAndConditionsText', content: string) => {
        setFormData(prev => ({ ...prev, [field]: content }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateAcademyProfile(formData);
        setShowSuccess(true);
        window.scrollTo(0, 0);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Configuración de textos de la academia</h1>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-8">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Título sección protección de datos</label>
                    <input name="dataProtectionTextTitle" value={formData.dataProtectionTextTitle} onChange={handleChange} className="w-full p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700" />
                </div>
                <div>
                     <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Texto de protección de datos</label>
                    <RichTextEditor value={formData.dataProtectionText} onChange={(content) => handleRichTextChange('dataProtectionText', content)} />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Título sección Condiciones</label>
                    <input name="termsAndConditionsTextTitle" value={formData.termsAndConditionsTextTitle} onChange={handleChange} className="w-full p-2 border rounded-md bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700" />
                </div>
                <div>
                     <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Texto de Condiciones de la academia</label>
                    <RichTextEditor value={formData.termsAndConditionsText} onChange={(content) => handleRichTextChange('termsAndConditionsText', content)} />
                </div>

                 <div className="mt-6 flex justify-end items-center gap-4">
                    {showSuccess && <div className="text-green-600 dark:text-green-400 flex items-center gap-2 mr-auto transition-opacity duration-300"><CheckCircle size={20} /><span className="font-semibold">¡Textos actualizados!</span></div>}
                    <Button type="submit">Actualizar</Button>
                 </div>
            </div>
        </form>
    );
};

export default AcademyTextsPage;
