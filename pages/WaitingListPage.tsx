import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';
import { Search, Users } from 'lucide-react';
import { Student, Course, WaitingListEntry } from '../types';

const WaitingListPage = () => {
    const { waitingList, students, courses } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        courseId: '',
        dateFrom: '',
        dateTo: '',
    });

    const enrichedWaitingList = useMemo(() => {
        return waitingList.map(entry => {
            const student = students.find(s => s.id === entry.studentId);
            const course = courses.find(c => c.id === entry.courseId);
            return { ...entry, student, course };
        }).filter(e => e.student && e.course);
    }, [waitingList, students, courses]);

    const filteredWaitingList = useMemo(() => {
        return enrichedWaitingList.filter(entry => {
            if (!entry.student || !entry.course) return false;

            const searchMatch = entry.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                entry.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                entry.course.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            const courseMatch = filters.courseId ? entry.courseId === parseInt(filters.courseId) : true;
            const dateFromMatch = filters.dateFrom ? new Date(entry.registrationDate) >= new Date(filters.dateFrom) : true;
            const dateToMatch = filters.dateTo ? new Date(entry.registrationDate) <= new Date(filters.dateTo) : true;

            return searchMatch && courseMatch && dateFromMatch && dateToMatch;
        });
    }, [enrichedWaitingList, searchTerm, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Alumnos en espera</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Listado de alumnos en espera.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Users size={24} />
                    <span className="font-semibold">{filteredWaitingList.length} Resultados</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <select name="courseId" value={filters.courseId} onChange={handleFilterChange} className="p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700">
                        <option value="">Curso</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700" placeholder="Desde alta" />
                    <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="p-2 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700" placeholder="Hasta alta" />
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-4 pr-10 border rounded-md text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-700"
                        />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                        <tr>
                            <th scope="col" className="p-4"><input type="checkbox" /></th>
                            <th scope="col" className="px-6 py-3">Alumno</th>
                            <th scope="col" className="px-6 py-3">Curso</th>
                            <th scope="col" className="px-6 py-3">Fecha alta</th>
                            <th scope="col" className="px-6 py-3">Datos de pago</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWaitingList.map(({ id, student, course, registrationDate }) => (
                            <tr key={id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50">
                                <td className="p-4"><input type="checkbox" /></td>
                                <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                    <Link to={`/students/${student!.id}/edit`}>{student!.lastName}, {student!.firstName}</Link>
                                </td>
                                <td className="px-6 py-4">{course!.name}</td>
                                <td className="px-6 py-4">{new Date(registrationDate).toLocaleDateString('es-ES')}</td>
                                <td className="px-6 py-4">{student!.paymentConfig.type} - {student!.paymentConfig.periodicity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredWaitingList.length === 0 && <p className="text-center py-8 text-gray-500">No hay alumnos en lista de espera con los filtros seleccionados.</p>}
            </div>
            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                {filteredWaitingList.length} Resultados
            </div>
        </div>
    );
};

export default WaitingListPage;
