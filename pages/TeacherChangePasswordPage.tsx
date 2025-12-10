import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';

const TeacherChangePasswordPage = () => {
    const { teacherId } = useParams();
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const { teachers } = useData();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const teacher = useMemo(() => teachers.find(t => t.id === parseInt(teacherId || '0')), [teachers, teacherId]);

    if (!teacher) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-semibold">Profesor no encontrado</h2>
                <Link to="/teachers" className="text-blue-500 hover:underline mt-4 inline-block">Volver a la lista de profesores</Link>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        setError('');
        alert(`Contraseña para ${teacher.name} ${teacher.lastName} actualizada con éxito (simulación).`);
        navigate('/teachers');
    };

    const inputClasses = "mt-1 w-full p-2 border rounded-md shadow-sm sm:text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500";
    const readOnlyInputClasses = "mt-1 w-full p-2 border rounded-md shadow-sm sm:text-sm bg-gray-100 dark:bg-slate-900/50 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700";

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Cambio de contraseña</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Usa este formulario para cambiar la contraseña del profesor.
            </p>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                        <input type="text" value={teacher.name} readOnly className={readOnlyInputClasses}/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellidos</label>
                        <input type="text" value={teacher.lastName} readOnly className={readOnlyInputClasses}/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email profesor</label>
                    <input type="email" value={teacher.email} readOnly className={readOnlyInputClasses}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClasses}/>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Repite la contraseña</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClasses}/>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 p-3 rounded-md text-sm mt-1 md:mt-7">
                        Usa al menos 8 caractéres y mezcla mayúsculas, minúsculas y algún dígito para que sea difícil de adivinar.
                    </div>
                </div>
                 {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <Button type="button" variant="secondary" onClick={goBack}>Cancelar</Button>
                    <Button type="submit">Actualizar</Button>
                </div>
            </form>
        </div>
    );
};

export default TeacherChangePasswordPage;