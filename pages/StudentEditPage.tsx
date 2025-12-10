
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import StudentForm from '../components/forms/StudentForm';
import { Student } from '../types';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';
import { getRandomColor, isSameDayMonth, checkBirthdayVisibility } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import BirthdayIcon from '../components/ui/BirthdayIcon';


const StudentEditPage = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const { students, updateStudent, academyProfile } = useData();
    const { user } = useAuth();

    const isNew = studentId === 'new';
    const student = isNew ? null : students.find(s => s.id === parseInt(studentId || '0'));

    const handleSave = (studentToSave: Student) => {
        updateStudent(studentToSave);
        navigate('/students');
    };

    if (!isNew && !student) {
        return <div className="p-8 text-center">Alumno no encontrado.</div>;
    }

    const initials = student ? `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase() : 'AA';
    const avatarColor = getRandomColor(initials);
    const headerTitle = isNew ? 'Alta de Alumno' : `${student?.firstName} ${student?.lastName}`;
    const subTitle = isNew ? 'Añadir nuevo alumno al centro' : 'Actualizar - Alumnos centro';

    const isBirthday = !isNew && student && checkBirthdayVisibility(user?.role, academyProfile) && isSameDayMonth(student.birthDate);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="relative">
                    {student?.photoUrl ? (
                        <img src={student.photoUrl} alt={`${student.firstName} ${student.lastName}`} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                         <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-2xl ${avatarColor}`}>
                            {initials}
                        </div>
                    )}
                    {isBirthday && <div className="absolute -top-4 -right-2 z-10"><BirthdayIcon size={40} /></div>}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{headerTitle}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{subTitle}</p>
                </div>
            </div>
            
            <StudentForm 
                student={student} 
                onSave={handleSave} 
                onClose={goBack} 
            />
        </div>
    );
};

export default StudentEditPage;
