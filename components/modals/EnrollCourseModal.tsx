
import React, { useState, useMemo } from 'react';
import { Student, Course } from '../../types';
import { useData } from '../../contexts/DataContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Search } from 'lucide-react';

interface EnrollCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    onSave: (selectedCourseIds: number[]) => void;
}

const EnrollCourseModal: React.FC<EnrollCourseModalProps> = ({ isOpen, onClose, student, onSave }) => {
    const { courses, enrollments, teachers } = useData();
    const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const availableCourses = useMemo(() => {
        const studentEnrolledCourseIds = new Set(
            enrollments.filter(e => e.studentId === student.id).map(e => e.courseId)
        );
        return courses.filter(c => 
            !studentEnrolledCourseIds.has(c.id) &&
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [courses, enrollments, student, searchTerm]);

    const handleToggleCourse = (courseId: number) => {
        setSelectedCourseIds(prev =>
            prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
        );
    };

    const handleSave = () => {
        onSave(selectedCourseIds);
        setSelectedCourseIds([]);
        setSearchTerm('');
    };
    
    const getTeacherName = (id: number) => {
        const teacher = teachers.find(t => t.id === id);
        return teacher ? `${teacher.name} ${teacher.lastName}` : 'N/A';
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Alta en cursos de un alumno`}
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b dark:border-slate-700">
                    <h3 className="font-semibold">Alumno: {student.firstName} {student.lastName}</h3>
                     <div className="relative w-full sm:w-64">
                         <input
                            type="text"
                            placeholder="Buscar cursos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-4 pr-10 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2 p-2 bg-gray-50 dark:bg-slate-900/50 rounded">
                    {availableCourses.length > 0 ? availableCourses.map(course => (
                        <label
                            key={course.id}
                            className="flex items-center p-3 rounded-lg cursor-pointer transition-colors bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700"
                        >
                            <input
                                type="checkbox"
                                checked={selectedCourseIds.includes(course.id)}
                                onChange={() => handleToggleCourse(course.id)}
                                className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
                            />
                            <div className="ml-4 flex-grow">
                                <span className="font-medium text-gray-800 dark:text-gray-200">{course.name}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 block">{getTeacherName(course.teacherId)}</span>
                            </div>
                        </label>
                    )) : (
                        <p className="text-center text-gray-500 py-4">No hay más cursos disponibles para este alumno.</p>
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="button" onClick={handleSave} disabled={selectedCourseIds.length === 0}>
                        Inscribir
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default EnrollCourseModal;
