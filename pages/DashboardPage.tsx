

import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import { 
    Users, BookOpen, GraduationCap, CalendarDays, UserX, FileClock, Wallet, 
    ShieldAlert, Pencil, ChevronRight, Settings, BarChart2, Rocket 
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

/**
 * Componente que renderiza el logo de la academia.
 * Muestra el logo subido desde el perfil de la academia si existe,
 * en caso contrario, muestra un logo por defecto de "EduBeta".
 */
const EduBetaLogo = () => {
    const { academyProfile } = useData();

    // Si hay un logo personalizado en el perfil de la academia, lo muestra.
    if (academyProfile.logoBase64) {
        return (
            <div className="flex items-center justify-center py-4">
                <img src={academyProfile.logoBase64} alt="Logo Academia" className="max-h-16 object-contain" />
            </div>
        );
    }

    // Logo por defecto si no hay uno personalizado.
    return (
        <div className="flex items-center justify-center py-4 gap-2">
            <Rocket className="text-primary-400" size={40} />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">EduBeta</h1>
        </div>
    );
};

/**
 * Componente reutilizable para mostrar una tarjeta de estadística.
 * Muestra un valor numérico grande, un título y un enlace a otra página.
 * @param {string} title - El título o descripción de la estadística.
 * @param {string} value - El valor numérico de la estadística.
 * @param {string} linkText - El texto para el enlace inferior.
 * @param {string} linkHref - La URL a la que navegará el enlace.
 * @param {boolean} [settings] - Si es `true`, muestra un icono de configuración.
 */
const StatCard = ({ title, value, linkText, linkHref, settings = false }: { title: string; value: string; linkText: string; linkHref: string; settings?: boolean }) => {
    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex flex-col">
            <div className="p-4 flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-4xl font-bold text-gray-900 dark:text-white">{value}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{title}</p>
                    </div>
                    {settings && <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><Settings size={16} /></button>}
                </div>
            </div>
            <Link to={linkHref} className="bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 p-3 text-sm font-medium text-gray-600 dark:text-gray-300 flex justify-between items-center rounded-b-lg">
                <span>{linkText}</span>
                <ChevronRight size={16} />
            </Link>
        </div>
    );
};

/**
 * Componente que renderiza el gráfico del área académica.
 * Muestra una comparación de datos históricos de alumnos (o inscripciones simuladas)
 * entre 2024 y 2025.
 */
const AcademicChart = () => {
    const { studentHistory } = useData();
    const [activeView, setActiveView] = useState<'students' | 'enrollments'>('students');

    // `useMemo` para recalcular los datos del gráfico solo si el historial de alumnos o la vista activa cambian.
    const chartData = useMemo(() => {
        const data2025 = studentHistory.filter(d => d.year === 2025);
        const data2024 = studentHistory.filter(d => d.year === 2024);

        if (activeView === 'enrollments') {
            // Simula datos de inscripciones para la demostración.
            return {
                data2025: data2025.map(d => ({ ...d, count: Math.round(d.count * 1.15) })),
                data2024: data2024.map(d => ({ ...d, count: Math.round(d.count * 1.1) })),
            }
        }
        return { data2025, data2024 };
    }, [studentHistory, activeView]);
    
    const { data2025, data2024 } = chartData;

    // Calcula la media entre los datos de 2024 y 2025.
    const averageData = useMemo(() => {
        if (data2024.length !== data2025.length) return [];
        return data2024.map((d, i) => {
            const count2025 = data2025[i]?.count || 0;
            return { ...d, count: (d.count + count2025) / 2 };
        });
    }, [data2024, data2025]);

    // Determina el valor máximo del eje Y para escalar el gráfico.
    const maxAmount = useMemo(() => {
        const allCounts = [
            ...data2025.map(d => d.count), 
            ...data2024.map(d => d.count)
        ];
        const max = Math.max(...allCounts, 0);
        return Math.ceil(max / 50) * 50; // Redondea hacia arriba al múltiplo de 50 más cercano.
    }, [data2025, data2024]);
    
    // Convierte un array de datos en una cadena de ruta SVG (`path d`).
    const toPath = (data: { month: number, count: number }[]) => {
        if (data.length === 0) return "";
        let path = `M 30 ${180 - (data[0].count / maxAmount * 160)} `;
        data.forEach((d, i) => {
            const x = 30 + (i * (460 / 11));
            const y = 180 - (d.count / maxAmount * 160);
            path += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
        });
        return path;
    };

    const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const yAxisLabels = [...Array(6)].map((_, i) => Math.round((maxAmount / 5) * i));

    return (
    <Card>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Área académica</h3>
            <div className="text-sm border border-gray-300 dark:border-gray-600 rounded-md p-0.5 bg-gray-100 dark:bg-slate-900/50">
                <button onClick={() => setActiveView('students')} className={`px-3 py-1 rounded-md transition-colors ${activeView === 'students' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-white/50'}`}>Alumnos en curso</button>
                <button onClick={() => setActiveView('enrollments')} className={`px-3 py-1 rounded-md transition-colors ${activeView === 'enrollments' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-white/50'}`}>Inscripciones</button>
            </div>
        </div>
        <div className="h-64">
             <svg width="100%" height="100%" viewBox="0 0 500 200">
                {/* Renderiza las líneas y etiquetas del eje Y */}
                {yAxisLabels.map(yVal => {
                    const y = 180 - (yVal / maxAmount * 160);
                    return (
                        <g key={yVal}>
                            <line x1="30" y1={y} x2="490" y2={y} stroke="currentColor" className="text-gray-200 dark:text-slate-700" strokeWidth="1" />
                            <text x="25" y={y} dy="3" textAnchor="end" fontSize="10" className="fill-current text-gray-500 dark:text-gray-400">{yVal}</text>
                        </g>
                    )
                })}
                {/* Renderiza las etiquetas de los meses en el eje X */}
                 {monthLabels.map((month, i) => (
                    <text key={month} x={30 + (i * (460 / 11))} y="195" textAnchor="middle" fontSize="10" className="fill-current text-gray-500 dark:text-gray-400">{month}</text>
                 ))}
                {/* Renderiza las líneas de datos */}
                <path d={toPath(data2024)} fill="none" stroke="#22c55e" strokeWidth="2" />
                <path d={toPath(data2025)} fill="none" stroke="#3b82f6" strokeWidth="2" />
                <path d={toPath(averageData)} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
                {/* Renderiza los puntos de datos para el año 2025 */}
                {data2025.map((d, i) => (
                     <circle key={i} cx={30 + (i * (460 / 11))} cy={180 - (d.count / maxAmount * 160)} r="3" fill="#3b82f6" stroke="white" strokeWidth="1"/>
                ))}
            </svg>
        </div>
         <div className="flex justify-center items-center gap-6 text-sm mt-2">
            <span className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div>2025</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-sm"></div>2024</span>
            <span className="flex items-center gap-2"><svg width="24" height="12"><line x1="0" y1="6" x2="24" y2="6" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" /></svg>Media</span>
        </div>
    </Card>
)};

/**
 * Componente que renderiza el gráfico del área económica.
 * Muestra los recibos cobrados y pendientes por mes.
 * Los datos para otras vistas (Facturas, etc.) se simulan para la demostración.
 */
const EconomicChart = () => {
    const { receipts } = useData();
    const [activeEcoView, setActiveEcoView] = useState<'receipts' | 'invoices' | 'inout' | 'domiciliation'>('receipts');

    // Agrupa los datos de los recibos por mes.
    const monthlyData = useMemo(() => {
        const data: {[key: string]: { cobrado: number; pendiente: number }} = {};
        
        receipts.forEach(r => {
            const date = new Date(r.receiptDate);
            if (date.getFullYear() !== 2025) return; // Para la demo, solo muestra datos de 2025.
            const month = date.toLocaleString('default', { month: 'short' });
            
            if (!data[month]) data[month] = { cobrado: 0, pendiente: 0 };
            
            // Simula datos diferentes para otras vistas.
            let amount = r.amount;
            if (activeEcoView === 'invoices') amount *= 0.8;
            if (activeEcoView === 'inout') amount *= 1.2;
            if (activeEcoView === 'domiciliation') amount *= 0.9;

            if (r.status === 'Cobrado') data[month].cobrado += amount;
            else data[month].pendiente += amount;
        });
        const monthOrder = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        return monthOrder.map(m => ({
            month: m,
            cobrado: data[m]?.cobrado || 0,
            pendiente: data[m]?.pendiente || 0,
            total: (data[m]?.cobrado || 0) + (data[m]?.pendiente || 0)
        }));
    }, [receipts, activeEcoView]);
    
    // Calcula el valor máximo del eje Y.
    const maxAmount = useMemo(() => {
        const max = Math.max(...monthlyData.map(d => d.total), 8000);
        return Math.ceil(max / 2000) * 2000;
    }, [monthlyData]);

    // Genera una cadena de ruta SVG para una línea.
    const toPath = (dataKey: 'cobrado' | 'pendiente' | 'total') => {
        let path = "M 30 180 ";
        monthlyData.forEach((d, i) => {
            const x = 30 + (i * (460 / 11));
            const y = 180 - (d[dataKey] / maxAmount * 160);
            path += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
        });
        return path;
    };
    
    // Genera una cadena de ruta SVG para un área rellena.
    const toAreaPath = (dataKey: 'cobrado' | 'pendiente') => {
        let path = toPath(dataKey);
        path += `L ${30 + (11 * (460/11))} 180 Z`;
        return path;
    };

    const EcoButton: React.FC<{view: 'receipts' | 'invoices' | 'inout' | 'domiciliation', label: string}> = ({view, label}) => (
        <button onClick={() => setActiveEcoView(view)} className={`px-3 py-1 rounded-md transition-colors ${activeEcoView === view ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-white/50'}`}>
            {label}
        </button>
    )

    return (
        <Card>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <h3 className="text-lg font-semibold">Área económica</h3>
                <div className="text-sm border border-gray-300 dark:border-gray-600 rounded-md p-0.5 bg-gray-100 dark:bg-slate-900/50">
                    <EcoButton view="receipts" label="Recibos"/>
                    <EcoButton view="invoices" label="Facturas"/>
                    <EcoButton view="inout" label="Ingresos/Gastos"/>
                    <EcoButton view="domiciliation" label="Domiciliaciones"/>
                </div>
            </div>
            <div className="h-64">
                <svg width="100%" height="100%" viewBox="0 0 500 200">
                    {/* Renderiza las líneas y etiquetas del eje Y */}
                    {[...Array(5)].map((_, i) => {
                        const val = (maxAmount / 4) * i;
                        const y = 180 - (val / maxAmount * 160);
                        return (
                             <g key={val}>
                                <line x1="30" y1={y} x2="490" y2={y} stroke="currentColor" className="text-gray-200 dark:text-slate-700" strokeWidth="1" />
                                <text x="25" y={y} dy="3" textAnchor="end" fontSize="10" className="fill-current text-gray-500 dark:text-gray-400">{val.toLocaleString('de-DE')} €</text>
                            </g>
                        )
                    })}
                    {/* Renderiza las áreas y líneas de datos */}
                    <path d={toAreaPath('cobrado')} fill="rgba(34, 197, 94, 0.2)" />
                    <path d={toPath('cobrado')} fill="none" stroke="#22c55e" strokeWidth="2" />

                    <path d={toAreaPath('pendiente')} fill="rgba(239, 68, 68, 0.2)" />
                    <path d={toPath('pendiente')} fill="none" stroke="#ef4444" strokeWidth="2" />
                    
                    <path d={toPath('total')} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />
                </svg>
            </div>
            <div className="flex justify-center items-center gap-6 text-sm mt-2">
                <span className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-sm"></div>Cobrado</span>
                <span className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm"></div>Pendiente</span>
                <span className="flex items-center gap-2"><svg width="24" height="12"><line x1="0" y1="6" x2="24" y2="6" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" /></svg>Total</span>
            </div>
        </Card>
    );
};

/**
 * La página principal del panel de control (Dashboard).
 * Compone el layout general de la página y calcula las estadísticas principales
 * para pasarlas a las `StatCard`s.
 */
// FIX: Refactoriza el componente de función de flecha a una declaración de función para mejorar la legibilidad y evitar posibles problemas con el herramental de fast-refresh, lo que podría estar causando el error de "expresión no invocable".
export function DashboardPage() {
    const { courses, teachers, enrollments, courseClasses, attendanceRecords, receipts, studentAuthorizations } = useData();
    const navigate = useNavigate();

    // Calcula el número de alumnos activos y de inscripciones activas.
    const activeEnrollments = enrollments.filter(e => e.isActive);
    const activeStudentIds = new Set(activeEnrollments.map(e => e.studentId));
    const activeStudentsCount = activeStudentIds.size;
    const activeEnrollmentsCount = activeEnrollments.length;

    const activeCoursesCount = courses.filter(c => c.isActive).length;
    
    // Calcula el número de clases programadas para la semana actual.
    const classesThisWeek = useMemo(() => {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))); // Lunes
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        return courseClasses.filter(c => {
            const classDate = new Date(c.date);
            return classDate >= startOfWeek && classDate <= endOfWeek;
        }).length;
    }, [courseClasses]);

    // Calcula las faltas de asistencia para el día de hoy.
    const absencesCount = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaysClassesIds = new Set(courseClasses.filter(c => {
            const classDate = new Date(c.date);
            classDate.setHours(0, 0, 0, 0);
            return classDate.getTime() === today.getTime();
        }).map(c => c.id));

        return attendanceRecords.filter(r => !r.attended && todaysClassesIds.has(r.classId)).length;
    }, [courseClasses, attendanceRecords]);
    
    const activeTeachersCount = teachers.filter(t => t.isActive).length;
    
    // Calcula el número de recibos pendientes hasta la fecha de hoy.
    const pendingReceiptsCount = useMemo(() => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        return receipts.filter(r => {
            const receiptDate = new Date(r.receiptDate);
            return r.status === 'Pendiente' && receiptDate <= today;
        }).length;
    }, [receipts]);

    const pendingAuthorizationsCount = studentAuthorizations.filter(sa => !sa.signatureDate).length;
    const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Columna Izquierda: Logo, perfil y notificaciones */}
        <div className="xl:col-span-1 space-y-6">
            <Card>
                <EduBetaLogo />
                <div className="mt-4">
                    <Button variant="secondary" className="w-full" leftIcon={<Pencil size={16}/>} onClick={() => navigate('/profile')}>
                        Editar perfil
                    </Button>
                </div>
            </Card>
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notificaciones</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No hay nuevas notificaciones</p>
            </Card>
        </div>

        {/* Columna Derecha: Tarjetas de estadísticas y gráficos */}
        <div className="xl:col-span-3 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Alumnos / Inscripciones" value={`${activeStudentsCount} / ${activeEnrollmentsCount}`} linkText="Listado de alumnos" linkHref="/students" />
                <StatCard title="Cursos activos" value={activeCoursesCount.toString()} linkText="Listado de cursos" linkHref="/courses" />
                <StatCard title="Clases semana" value={classesThisWeek.toString()} linkText="Listado de clases" linkHref="/center-management/class-days" />
                <StatCard title="Faltas de asistencia" value={absencesCount.toString()} linkText="Listado de asistencias" linkHref="/attendance-calendar" settings />
                <StatCard title="Profesores activos" value={activeTeachersCount.toString()} linkText="Listado de profesores" linkHref="/teachers" />
                <StatCard title="Informes en revisión" value="0" linkText="Listado de informes" linkHref="#" />
                <StatCard title="Recibos pendientes" value={pendingReceiptsCount.toString()} linkText="Listado de recibos" linkHref={`/receipts/all?status=Pendiente&dateTo=${todayStr}`} />
                <StatCard title="Autorizaciones pendientes" value={pendingAuthorizationsCount.toString()} linkText="Listado de autorizaciones" linkHref="/center-management/authorizations" />
            </div>

            <AcademicChart />
            <EconomicChart />
        </div>
    </div>
  );
}
