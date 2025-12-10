
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { CourseClass, Role } from '../types';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, GraduationCap, MapPin, User, Users, BookOpen, LayoutGrid } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const CalendarEvent: React.FC<{ 
    classItem: CourseClass; 
    showOccupancy: boolean;
}> = ({ classItem, showOccupancy }) => {
    const navigate = useNavigate();
    const { courses, teachers, classrooms, enrollments } = useData();

    const course = courses.find(c => c.id === classItem.courseId);
    const teacher = teachers.find(t => t.id === classItem.teacherId);
    const classroom = classrooms.find(c => c.id === (classItem.classroomId || course?.classroomId));

    if (!course || !teacher || !classroom) return null;

    const activeEnrollments = enrollments.filter(e => e.courseId === course.id && e.isActive).length;
    const availableSeats = course.maxCapacity - activeEnrollments;
    
    let occupancyColorClass = '';
    if (showOccupancy) {
        if (availableSeats <= 0) occupancyColorClass = 'bg-red-500 dark:bg-red-700 border-red-600 text-white';
        else if (availableSeats <= 3) occupancyColorClass = 'bg-yellow-400 dark:bg-yellow-600 border-yellow-500 text-yellow-900 dark:text-white';
        else occupancyColorClass = 'bg-green-500 dark:bg-green-700 border-green-600 text-white';
    }

    const eventStyle = !showOccupancy ? { backgroundColor: classroom.color, color: 'white', borderLeft: `3px solid ${classroom.color}` } : {};

    const handleClassClick = () => {
        const dateString = classItem.date.toISOString().split('T')[0];
        navigate(`/attendance-calendar?date=${dateString}`);
    };

    return (
        <div 
            className={`group relative p-2 rounded-lg cursor-pointer text-xs leading-tight transition-all duration-200 ${showOccupancy ? occupancyColorClass : 'text-white'}`}
            style={eventStyle}
            onClick={handleClassClick}
        >
            <p className="font-bold truncate">{course.name}</p>
            <p className="truncate">{classItem.startTime} - {classItem.endTime}</p>
            <div className="flex items-center gap-1 opacity-80 mt-1">
                <GraduationCap size={12} />
                <span className="truncate">{teacher.name} {teacher.lastName}</span>
            </div>
            <div className="flex items-center gap-1 opacity-80">
                <MapPin size={12} />
                <span className="truncate">{classroom.name}</span>
            </div>
             <div className="flex items-center gap-1 opacity-80">
                <Users size={12} />
                <span>{activeEnrollments} Alumnos</span>
            </div>
        </div>
    );
};

// ... View components remain similar, but logic needs to adapt to filtered classes

const AgendaView: React.FC<{ classes: CourseClass[], showOccupancy: boolean }> = ({ classes, showOccupancy }) => {
    const groupedByDay = useMemo(() => {
        return classes.reduce((acc, classItem) => {
            const dateStr = classItem.date.toISOString().split('T')[0];
            if (!acc[dateStr]) acc[dateStr] = [];
            acc[dateStr].push(classItem);
            return acc;
        }, {} as Record<string, CourseClass[]>);
    }, [classes]);

    const sortedDays = Object.keys(groupedByDay).sort();

    return (
        <div className="space-y-4 p-4">
            {sortedDays.map(dateStr => {
                const date = new Date(dateStr);
                const dayStr = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
                return (
                    <div key={dateStr}>
                        <div className="flex items-center gap-4">
                            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                                {dayStr.split(',')[1]}
                            </h3>
                            <span className="text-sm px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">{dayStr.split(',')[0]}</span>
                        </div>
                        <div className="mt-3 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 ml-2 pl-6">
                             {groupedByDay[dateStr].sort((a,b) => a.startTime.localeCompare(b.startTime)).map(classItem => (
                                <div key={classItem.id} className="grid grid-cols-[100px_1fr] gap-4 items-start relative">
                                    <div className="absolute -left-[34px] top-3 w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-gray-50 dark:border-gray-900"></div>
                                    <span className="text-sm text-gray-500 font-medium pt-2">{classItem.startTime} - {classItem.endTime}</span>
                                    <CalendarEvent classItem={classItem} showOccupancy={showOccupancy} />
                                </div>
                             ))}
                        </div>
                    </div>
                )
            })}
             {sortedDays.length === 0 && <p className="text-center py-10 text-gray-500">No hay clases que coincidan con los filtros.</p>}
        </div>
    )
};

const MonthView: React.FC<{ classes: CourseClass[], currentDate: Date, showOccupancy: boolean }> = ({ classes, currentDate, showOccupancy }) => {
    const { daysInMonth, firstDayOfMonth } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        return {
            daysInMonth: new Date(year, month + 1, 0).getDate(),
            firstDayOfMonth: (new Date(year, month, 1).getDay() + 6) % 7 // Monday is 0
        };
    }, [currentDate]);

    const blanks = Array(firstDayOfMonth).fill(null);
    const daysArr = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const classesByDay = useMemo(() => {
        return classes.reduce((acc, classItem) => {
            const day = classItem.date.getUTCDate();
            if (!acc[day]) acc[day] = [];
            acc[day].push(classItem);
            return acc;
        }, {} as Record<number, CourseClass[]>);
    }, [classes]);

    return (
        <div className="grid grid-cols-7 border-t border-l dark:border-gray-700">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                <div key={day} className="text-center font-semibold p-2 border-r border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">{day}</div>
            ))}
            {blanks.map((_, i) => <div key={`blank-${i}`} className="border-r border-b dark:border-gray-700 min-h-[120px]"></div>)}
            {daysArr.map(day => (
                <div key={day} className="border-r border-b dark:border-gray-700 min-h-[120px] p-1 relative">
                    <span className="font-semibold text-sm">{day}</span>
                    <div className="space-y-1 mt-1">
                        {classesByDay[day]?.map(c => <CalendarEvent key={c.id} classItem={c} showOccupancy={showOccupancy} />)}
                    </div>
                </div>
            ))}
        </div>
    );
};

const DayWeekView: React.FC<{ classes: CourseClass[], currentDate: Date, view: 'week' | 'day', showOccupancy: boolean }> = ({ classes, currentDate, view, showOccupancy }) => {
    const daysOfWeek = useMemo(() => {
        if (view === 'day') return [currentDate];
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        startOfWeek.setDate(diff);
        return Array.from({length: 5}, (_, i) => new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i));
    }, [currentDate, view]);

    const classesByDay = useMemo(() => {
        return classes.reduce((acc, classItem) => {
            const dateStr = classItem.date.toISOString().split('T')[0];
            if (!acc[dateStr]) acc[dateStr] = [];
            acc[dateStr].push(classItem);
            return acc;
        }, {} as Record<string, CourseClass[]>);
    }, [classes]);
    
    const timeToPercent = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        const totalMinutes = h * 60 + m;
        return ((totalMinutes - (8*60)) / (14*60)) * 100; // 8am to 10pm = 14 hours
    }

    return (
        <div className="flex border-t dark:border-gray-700">
            <div className="w-16 flex-shrink-0 text-xs text-center">
                {Array.from({length: 15}, (_, i) => 8 + i).map(h => <div key={h} className="h-16 flex items-start justify-center pt-1 border-b dark:border-gray-700">{h}:00</div>)}
            </div>
            <div className="flex-grow grid" style={{gridTemplateColumns: `repeat(${daysOfWeek.length}, 1fr)`}}>
                {daysOfWeek.map(day => (
                    <div key={day.toISOString()} className="border-l dark:border-gray-700 relative">
                        <div className="text-center font-semibold p-2 border-b dark:border-gray-700 sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
                            {day.toLocaleDateString('es-ES', {weekday: 'short'})} {day.getDate()}
                        </div>
                        {Array.from({length: 15}, (_, i) => <div key={i} className="h-16 border-b dark:border-gray-700"></div>)}
                        {(classesByDay[day.toISOString().split('T')[0]] || []).map(classItem => {
                            const top = timeToPercent(classItem.startTime);
                            const height = timeToPercent(classItem.endTime) - top;
                            return (
                                <div key={classItem.id} className="absolute w-full px-1" style={{ top: `${top}%`, height: `${height}%` }}>
                                    <CalendarEvent classItem={classItem} showOccupancy={showOccupancy} />
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

const ByClassroomView: React.FC<{
    classrooms: any[];
    classes: CourseClass[];
    currentDate: Date;
    showOccupancy: boolean;
}> = ({ classrooms, classes, currentDate, showOccupancy }) => {
    const { courses } = useData(); 

    return (
        <div className="p-4 space-y-8">
            {classrooms.map(classroom => {
                const classroomClasses = classes.filter(c => {
                    const effectiveClassroomId = c.classroomId || courses.find(co => co.id === c.courseId)?.classroomId;
                    return effectiveClassroomId === classroom.id;
                });

                return (
                    <div key={classroom.id}>
                        <h3 className="text-lg font-bold text-white p-3 rounded-t-md" style={{backgroundColor: classroom.color}}>
                            {classroom.location} - {classroom.name}
                        </h3>
                        <DayWeekView
                            classes={classroomClasses}
                            currentDate={currentDate}
                            view={'week'}
                            showOccupancy={showOccupancy}
                        />
                    </div>
                )
            })}
        </div>
    );
};


const ClassroomSchedulePage = () => {
    const { courseClasses, classrooms, courseLevels, teachers, courses } = useData();
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'agenda' | 'month' | 'week' | 'day'>('month');
    
    const [scheduleViewMode, setScheduleViewMode] = useState<'main' | 'byClassroom'>('main');
    const [classroomFilterMode, setClassroomFilterMode] = useState<'all' | 'filtered'>('all');
    const [levelFilterMode, setLevelFilterMode] = useState<'all' | 'filtered'>('all');
    const [teacherFilterMode, setTeacherFilterMode] = useState<'all' | 'filtered'>('all');

    const [selectedClassroomIds, setSelectedClassroomIds] = useState<number[]>([]);
    const [selectedLevelIds, setSelectedLevelIds] = useState<number[]>([]);
    const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([]);
    const [showOccupancy, setShowOccupancy] = useState(false);

    // Special handling for teacher role
    const isTeacher = user?.role === Role.TEACHER;
    
    useEffect(() => {
        if (isTeacher && user?.id) {
            setTeacherFilterMode('filtered');
            setSelectedTeacherIds([user.id]);
        }
    }, [isTeacher, user?.id]);

    const filteredClasses = useMemo(() => {
        const courseLevelMap = new Map(courses.map(c => [c.id, c.level]));
        const courseLevelsByName = new Map(courseLevels.map(l => [l.name, l.id]));
        const selectedLevelNameIds = selectedLevelIds.map(id => courseLevels.find(l => l.id === id)?.name);

        return courseClasses.filter(c => {
            const classDate = new Date(c.date);
            classDate.setUTCHours(0,0,0,0);
            
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();

            if (scheduleViewMode === 'main' && view === 'month' && (classDate.getMonth() !== currentMonth || classDate.getFullYear() !== currentYear)) return false;

            if (classroomFilterMode === 'filtered' && selectedClassroomIds.length > 0) {
                 const classroomId = c.classroomId || courses.find(course => course.id === c.courseId)?.classroomId;
                 if (!selectedClassroomIds.includes(classroomId || 0)) return false;
            }
            
            // Teacher Role Restriction
            if (isTeacher) {
                 if (c.teacherId !== user?.id) return false;
            } else {
                 if (teacherFilterMode === 'filtered' && selectedTeacherIds.length > 0 && !selectedTeacherIds.includes(c.teacherId)) return false;
            }

            if (levelFilterMode === 'filtered' && selectedLevelNameIds.length > 0) {
                const levelName = courseLevelMap.get(c.courseId);
                if (!levelName || !selectedLevelNameIds.includes(levelName)) return false;
            }
            
            return true;
        });
    }, [courseClasses, view, currentDate, classroomFilterMode, selectedClassroomIds, levelFilterMode, selectedLevelIds, teacherFilterMode, selectedTeacherIds, courses, courseLevels, scheduleViewMode, isTeacher, user]);
    
    const handleDateChange = (amount: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (scheduleViewMode === 'byClassroom' || view === 'week') newDate.setDate(newDate.getDate() + (amount * 7));
            else if (view === 'month' || view === 'agenda') newDate.setMonth(newDate.getMonth() + amount);
            else if (view === 'day') newDate.setDate(newDate.getDate() + amount);
            return newDate;
        });
    };
    
    const handleBulkSelect = (type: 'classrooms' | 'levels', action: 'all' | 'none' | 'invert') => {
        const source = type === 'classrooms' ? classrooms : courseLevels;
        const setSelected = type === 'classrooms' ? setSelectedClassroomIds : setSelectedLevelIds;

        if (action === 'all') setSelected(source.map(item => item.id));
        else if (action === 'none') setSelected([]);
        else if (action === 'invert') {
            const allIds = source.map(item => item.id);
            setSelected(prev => allIds.filter(id => !prev.includes(id)));
        }
    };

    const dateTitle = useMemo(() => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric' };
        if (view === 'month' || view === 'agenda') options.month = 'long';
        if (view === 'day') { options.weekday = 'long'; options.day = 'numeric'; options.month = 'long'; }
        
        let title = currentDate.toLocaleDateString('es-ES', options);
        
        if (view === 'week' || scheduleViewMode === 'byClassroom') {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1));
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 4);
            options.month = 'long';
            title = `${startOfWeek.getDate()} – ${endOfWeek.getDate()} ${currentDate.toLocaleDateString('es-ES', options)}`;
        }
        return title;
    }, [currentDate, view, scheduleViewMode]);
    
    const classroomsToDisplayInByClassroomView = useMemo(() => {
        return classroomFilterMode === 'all' ? classrooms : classrooms.filter(c => selectedClassroomIds.includes(c.id));
    }, [classroomFilterMode, selectedClassroomIds, classrooms]);

    const viewTranslations: { [key in 'month' | 'week' | 'day' | 'agenda']: string } = {
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
        agenda: 'Agenda',
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-150px)]">
            <aside className="w-full lg:w-72 flex-shrink-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-y-auto custom-scrollbar">
                <div className="space-y-6 text-sm">
                   {/* Aulas Filter */}
                    <div>
                        <h3 className="font-semibold mb-2 text-base">Aulas</h3>
                        <div className="flex gap-4 text-xs"><label><input type="radio" name="classroomFilter" value="all" checked={classroomFilterMode === 'all'} onChange={() => setClassroomFilterMode('all')} className="mr-1 h-4 w-4 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500"/> Todas</label><label><input type="radio" name="classroomFilter" value="filtered" checked={classroomFilterMode === 'filtered'} onChange={() => setClassroomFilterMode('filtered')} className="mr-1 h-4 w-4 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500"/> Filtradas</label></div>
                        {classroomFilterMode === 'filtered' && (<div className="mt-2 pl-2 space-y-1"><div className="text-xs text-blue-500 space-x-2"><button type="button" onClick={() => handleBulkSelect('classrooms', 'all')} className="hover:underline">Todos/as</button><span>-</span><button type="button" onClick={() => handleBulkSelect('classrooms', 'none')} className="hover:underline">Ninguno/a</button><span>-</span><button type="button" onClick={() => handleBulkSelect('classrooms', 'invert')} className="hover:underline">inversa</button></div>{classrooms.map(c => (<div key={c.id}><label className="flex items-center"><input type="checkbox" className="mr-2 h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" checked={selectedClassroomIds.includes(c.id)} onChange={() => setSelectedClassroomIds(p => p.includes(c.id) ? p.filter(id => id !== c.id) : [...p, c.id])}/> <span className="w-3 h-3 rounded-full inline-block mr-2" style={{backgroundColor: c.color}}></span>{c.name}</label></div>))}</div>)}
                    </div>
                     {/* Niveles Filter */}
                    <div>
                        <h3 className="font-semibold mb-2 text-base">Niveles</h3>
                        <div className="flex gap-4 text-xs"><label><input type="radio" name="levelFilter" value="all" checked={levelFilterMode === 'all'} onChange={() => setLevelFilterMode('all')} className="mr-1 h-4 w-4 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500"/> Todos/as</label><label><input type="radio" name="levelFilter" value="filtered" checked={levelFilterMode === 'filtered'} onChange={() => setLevelFilterMode('filtered')} className="mr-1 h-4 w-4 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500"/> Filtrados</label></div>
                        {levelFilterMode === 'filtered' && (<div className="mt-2 pl-2 space-y-1"><div className="text-xs text-blue-500 space-x-2"><button type="button" onClick={() => handleBulkSelect('levels', 'all')} className="hover:underline">Todos/as</button><span>-</span><button type="button" onClick={() => handleBulkSelect('levels', 'none')} className="hover:underline">Ninguno/a</button><span>-</span><button type="button" onClick={() => handleBulkSelect('levels', 'invert')} className="hover:underline">inversa</button></div>{courseLevels.map(l => (<div key={l.id}><label className="flex items-center"><input type="checkbox" className="mr-2 h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" checked={selectedLevelIds.includes(l.id)} onChange={() => setSelectedLevelIds(p => p.includes(l.id) ? p.filter(id => id !== l.id) : [...p, l.id])}/> {l.name}</label></div>))}</div>)}
                    </div>
                    
                    {/* Profesores Filter (Hidden for Teachers) */}
                    {!isTeacher && (
                        <div>
                            <h3 className="font-semibold mb-2 text-base">Profesores</h3>
                            <div className="flex gap-4 text-xs"><label><input type="radio" name="teacherFilter" value="all" checked={teacherFilterMode === 'all'} onChange={() => setTeacherFilterMode('all')} className="mr-1 h-4 w-4 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500"/> Todos/as</label><label><input type="radio" name="teacherFilter" value="filtered" checked={teacherFilterMode === 'filtered'} onChange={() => setTeacherFilterMode('filtered')} className="mr-1 h-4 w-4 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500"/> Filtrados</label></div>
                            {teacherFilterMode === 'filtered' && (<div className="mt-2 pl-2 space-y-1">{teachers.map(t => (<div key={t.id}><label className="flex items-center"><input type="checkbox" className="mr-2 h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" checked={selectedTeacherIds.includes(t.id)} onChange={() => setSelectedTeacherIds(p => p.includes(t.id) ? p.filter(id => id !== t.id) : [...p, t.id])}/> {t.name} {t.lastName}</label></div>))}</div>)}
                        </div>
                    )}
                    {isTeacher && (
                         <div>
                            <h3 className="font-semibold mb-2 text-base text-gray-400">Profesores</h3>
                            <div className="text-xs text-gray-500 italic pl-2">Filtrado por mi perfil</div>
                        </div>
                    )}

                    <div className="pt-4 border-t dark:border-gray-600"><label className="flex items-center"><input type="checkbox" className="mr-2 h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-600 focus:ring-primary-500" checked={showOccupancy} onChange={e => setShowOccupancy(e.target.checked)}/> Mostrar la ocupación de los cursos</label></div>
                    <div className="pt-4 border-t dark:border-gray-600">
                        <Button variant="secondary" className="w-full" leftIcon={<LayoutGrid size={16}/>} onClick={() => setScheduleViewMode(prev => prev === 'main' ? 'byClassroom' : 'main')}>
                            {scheduleViewMode === 'main' ? 'Vista por aulas' : 'Cuadro aulas'}
                        </Button>
                    </div>
                </div>
            </aside>

            <main className="flex-grow flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <header className="flex items-center justify-between p-4 border-b dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleDateChange(-1)} leftIcon={<ChevronLeft />} />
                        <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>Hoy</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDateChange(1)} rightIcon={<ChevronRight />} />
                    </div>
                    <h2 className="text-xl font-bold capitalize">{dateTitle}</h2>
                    {scheduleViewMode === 'main' ? (
                         <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                            {(['month', 'week', 'day', 'agenda'] as const).map(v => (
                                <Button key={v} variant={view === v ? 'primary' : 'ghost'} size="sm" onClick={() => setView(v)} className="capitalize w-20 justify-center">{viewTranslations[v]}</Button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                            <Button variant="primary" size="sm" className="w-20 justify-center">Semana</Button>
                        </div>
                    )}
                </header>
                <div className="flex-grow overflow-auto custom-scrollbar">
                    <div className="min-w-[1024px]">
                        {scheduleViewMode === 'main' ? (
                            <>
                                {view === 'agenda' && <AgendaView classes={filteredClasses} showOccupancy={showOccupancy} />}
                                {view === 'month' && <MonthView classes={filteredClasses} currentDate={currentDate} showOccupancy={showOccupancy} />}
                                {(view === 'week' || view === 'day') && <DayWeekView classes={filteredClasses} currentDate={currentDate} view={view} showOccupancy={showOccupancy} />}
                            </>
                        ) : (
                            <ByClassroomView classes={filteredClasses} classrooms={classroomsToDisplayInByClassroomView} currentDate={currentDate} showOccupancy={showOccupancy} />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClassroomSchedulePage;
