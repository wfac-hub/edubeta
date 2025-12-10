

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Teacher } from '../types';
import TeacherForm from '../components/forms/TeacherForm';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';

const TeacherEditPage = () => {
    const { teacherId } = useParams();
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const { teachers, updateTeacher } = useData();

    const isNew = teacherId === 'new';
    const teacher = isNew ? null : teachers.find(t => t.id === parseInt(teacherId || '0'));

    const handleSave = (teacherToSave: Teacher) => {
        updateTeacher(teacherToSave);
        navigate('/teachers');
    };

    if (!isNew && !teacher) {
        return <div className="p-8 text-center">Profesor no encontrado.</div>;
    }
    
    const pageTitle = isNew ? 'Alta de Profesor' : `«${teacher?.name} ${teacher?.lastName}»`;
    const pageSubTitle = isNew ? 'Añadir nuevo profesor al centro' : 'Actualizar - Profesores';
    
    return (
         <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{pageTitle}</h1>
                <p className="text-gray-500 dark:text-gray-400">{pageSubTitle}</p>
            </div>
            <TeacherForm 
                teacher={teacher}
                onSave={handleSave}
                onClose={goBack}
            />
        </div>
    );
};

export default TeacherEditPage;