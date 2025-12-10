import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { 
    PieChart, Wallet, TrendingUp, TrendingDown, AlertTriangle, 
    Calendar, ArrowUpRight, ArrowDownLeft, Filter, Plus, 
    FileText, DollarSign, AlertCircle, CheckCircle, ChevronRight,
    Landmark, Briefcase, FileWarning, ArrowRight, ChevronLeft, BarChart3,
    FileClock, Banknote, Calculator, Upload
} from 'lucide-react';
// Renombramos la importación para evitar conflictos con el componente local
import BaseCard from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Invoice, FiscalConfig } from '../../types';
import { useNavigate } from 'react-router-dom';

// --- TIPOS Y UTILIDADES ---

type Period = 'month' | 'quarter' | 'year';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};

// --- COMPONENTES UI WIDGETS ---

/**
 * Wrapper local de Card para manejar títulos e iconos de forma consistente en el dashboard.
 * Soluciona el error de tipos donde se pasaban propiedades extra al componente base.
 */
const Card: React.FC<{ children: React.ReactNode; title?: string; icon?: React.ReactNode; className?: string }> = ({ children, title, icon, className }) => (
    <BaseCard className={`flex flex-col ${className || ''}`}>
        {title && (
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-2">
                <div className="text-primary-600 dark:text-primary-400">{icon}</div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            </div>
        )}
        <div className="p-6 flex-grow">{children}</div>
    </BaseCard>
);

/**
 * Tarjeta KPI Principal con comparación
 */
const KpiCard: React.FC<{ 
    title: string; 
    amount: number; 
    prevAmount: number; 
    icon: React.ReactNode; 
    colorClass: string; // clase para el icono bg
    trendColor?: boolean; // si true, verde es subida. si false (gastos), verde es bajada
}> = ({ title, amount, prevAmount, icon, colorClass, trendColor = true }) => {
    const difference = amount - prevAmount;
    const percentage = prevAmount !== 0 ? (difference / prevAmount) * 100 : 0;
    
    // Lógica de color: Si trendColor es true (ingresos), subir es bueno (verde). 
    // Si es false (gastos), subir es malo (rojo).
    const isGood = trendColor ? difference >= 0 : difference <= 0;
    const trendClass = isGood ? 'text-green-600' : 'text-red-600';
    const TrendIcon = difference >= 0 ? TrendingUp : TrendingDown;

    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {formatCurrency(amount)}
                    </h3>
                </div>
                <div className={`p-3 rounded-full ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
                    {icon}
                </div>
            </div>
            <div className="flex items-center text-sm">
                <span className={`flex items-center font-semibold ${trendClass} bg-opacity-10 px-1.5 py-0.5 rounded`}>
                    <TrendIcon size={14} className="mr-1" />
                    {Math.abs(percentage).toFixed(1)}%
                </span>
                <span className="text-gray-400 ml-2 text-xs">vs periodo anterior ({formatCurrency(prevAmount)})</span>
            </div>
        </div>
    );
};

/**
 * Gráfico de Barras Simple (SVG) para Ingresos vs Gastos
 */
const IncomeExpenseChart: React.FC<{ data: { label: string, income: number, expense: number }[] }> = ({ data }) => {
    const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1000);
    const height = 200;
    const width = 100; // %

    return (
        <div className="h-[240px] w-full flex flex-col justify-end">
            <div className="flex-grow flex items-end justify-between gap-2 px-2">
                {data.map((d, i) => {
                    const hInc = (d.income / maxVal) * 100;
                    const hExp = (d.expense / maxVal) * 100;
                    return (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1 group cursor-pointer relative">
                            {/* Tooltip simple */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs p-2 rounded z-10 whitespace-nowrap pointer-events-none transition-opacity">
                                Ing: {formatCurrency(d.income)} <br/> Gas: {formatCurrency(d.expense)}
                            </div>
                            
                            <div className="w-full flex gap-1 items-end justify-center h-full">
                                <div style={{ height: `${hInc}%` }} className="w-3 md:w-6 bg-emerald-500 rounded-t-sm opacity-80 hover:opacity-100 transition-all"></div>
                                <div style={{ height: `${hExp}%` }} className="w-3 md:w-6 bg-rose-500 rounded-t-sm opacity-80 hover:opacity-100 transition-all"></div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate w-full text-center">{d.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * Barra de progreso para categorías
 */
const CategoryBar: React.FC<{ label: string, amount: number, total: number, color: string }> = ({ label, amount, total, color }) => {
    const percentage = total > 0 ? (amount / total) * 100 : 0;
    return (
        <div className="mb-3 group cursor-pointer">
            <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-500 transition-colors">{label}</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(amount)} ({percentage.toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

// --- PÁGINA PRINCIPAL ---

const FinancialDashboardPage = () => {
    const { invoices, fiscalConfig, receipts } = useData();
    const navigate = useNavigate();
    
    // --- ESTADOS ---
    const [period, setPeriod] = useState<Period>('quarter');
    const [currentDate, setCurrentDate] = useState(new Date());

    // --- LÓGICA DE DATOS ---

    // 1. Filtrado por fecha
    const getFilteredInvoices = (dateReference: Date, periodType: Period) => {
        const year = dateReference.getFullYear();
        const month = dateReference.getMonth();
        const quarter = Math.floor(month / 3);

        return invoices.filter(inv => {
            const d = new Date(inv.date);
            if (periodType === 'year') return d.getFullYear() === year;
            if (periodType === 'quarter') return d.getFullYear() === year && Math.floor(d.getMonth() / 3) === quarter;
            return d.getFullYear() === year && d.getMonth() === month;
        });
    };

    // 2. Fechas anteriores para comparación
    const prevDate = new Date(currentDate);
    if (period === 'year') prevDate.setFullYear(prevDate.getFullYear() - 1);
    else if (period === 'quarter') prevDate.setMonth(prevDate.getMonth() - 3);
    else prevDate.setMonth(prevDate.getMonth() - 1);

    // 3. Datos actuales y previos
    const currentInvoices = useMemo(() => getFilteredInvoices(currentDate, period), [invoices, currentDate, period]);
    const prevInvoices = useMemo(() => getFilteredInvoices(prevDate, period), [invoices, prevDate, period]);

    // 4. Cálculo de Métricas
    const metrics = useMemo(() => {
        const calc = (list: Invoice[]) => ({
            income: list.filter(i => i.type === 'issued').reduce((acc, i) => acc + i.baseAmount, 0),
            expenses: list.filter(i => i.type === 'received').reduce((acc, i) => acc + i.baseAmount, 0),
            taxes: list.reduce((acc, i) => acc + (i.type === 'issued' ? i.vatAmount - i.irpfAmount : -(i.vatAmount - i.irpfAmount)), 0)
        });

        const curr = calc(currentInvoices);
        const prev = calc(prevInvoices);

        return {
            curr,
            prev,
            netProfit: curr.income - curr.expenses,
            prevNetProfit: prev.income - prev.expenses,
            projected: curr.income * 1.2 // Mock projection
        };
    }, [currentInvoices, prevInvoices]);

    // 5. Datos para el Gráfico Principal
    const chartData = useMemo(() => {
        const points = [];
        const labels = period === 'year' ? ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] :
                       period === 'quarter' ? ['M1', 'M2', 'M3'] : ['S1', 'S2', 'S3', 'S4'];
        
        const totalInc = metrics.curr.income;
        const totalExp = metrics.curr.expenses;
        
        for(let i=0; i < labels.length; i++) {
            points.push({
                label: labels[i],
                income: (totalInc / labels.length) * (0.8 + Math.random() * 0.4),
                expense: (totalExp / labels.length) * (0.8 + Math.random() * 0.4)
            });
        }
        return points;
    }, [metrics, period]);

    // 6. Gastos por Categoría
    const expensesByCategory = useMemo(() => {
        const expenses = currentInvoices.filter(i => i.type === 'received');
        const categories: Record<string, number> = {};
        expenses.forEach(exp => {
            const cat = exp.category || 'Sin categoría';
            categories[cat] = (categories[cat] || 0) + exp.baseAmount;
        });
        return Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .map(([label, amount], index) => ({
                label, 
                amount, 
                color: ['bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'][index % 4]
            }));
    }, [currentInvoices]);

    // 7. Facturas Pendientes
    const pendingInvoices = useMemo(() => {
        const allPending = invoices.filter(i => i.status === 'Pending');
        return {
            issued: {
                count: allPending.filter(i => i.type === 'issued').length,
                amount: allPending.filter(i => i.type === 'issued').reduce((acc, i) => acc + i.totalAmount, 0)
            },
            received: {
                count: allPending.filter(i => i.type === 'received').length,
                amount: allPending.filter(i => i.type === 'received').reduce((acc, i) => acc + i.totalAmount, 0)
            }
        };
    }, [invoices]);

    // 8. Control de navegación de fechas
    const handleDateNav = (direction: -1 | 1) => {
        const newDate = new Date(currentDate);
        if (period === 'year') newDate.setFullYear(newDate.getFullYear() + direction);
        else if (period === 'quarter') newDate.setMonth(newDate.getMonth() + (direction * 3));
        else newDate.setMonth(newDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const periodLabel = useMemo(() => {
        if (period === 'year') return currentDate.getFullYear();
        if (period === 'month') return currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        const q = Math.floor(currentDate.getMonth() / 3) + 1;
        return `T${q} ${currentDate.getFullYear()}`;
    }, [currentDate, period]);

    return (
        <div className="space-y-6 pb-20">
            {/* HEADER & CONTROLS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <PieChart className="text-primary-600" /> Dashboard Financiero
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Visión global del estado económico de {fiscalConfig.companyType}</p>
                </div>
                
                <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-1">
                    <button onClick={() => handleDateNav(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md text-gray-600 dark:text-gray-300"><ChevronLeft size={16}/></button>
                    <div className="px-4 font-semibold min-w-[120px] text-center capitalize text-gray-800 dark:text-white">{periodLabel}</div>
                    <button onClick={() => handleDateNav(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md text-gray-600 dark:text-gray-300"><ChevronRight size={16}/></button>
                    <div className="w-px h-6 bg-gray-200 dark:bg-slate-600 mx-2"></div>
                    <div className="flex gap-1">
                        {(['month', 'quarter', 'year'] as Period[]).map(p => (
                            <button 
                                key={p} 
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1 text-xs font-medium rounded-md capitalize ${period === p ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                            >
                                {p === 'month' ? 'Mes' : p === 'quarter' ? 'Trim' : 'Año'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 1. KPIS SUPERIORES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard 
                    title="Ingresos" 
                    amount={metrics.curr.income} 
                    prevAmount={metrics.prev.income} 
                    icon={<Wallet size={24} className="text-emerald-600 dark:text-emerald-400"/>} 
                    colorClass="bg-emerald-100 dark:bg-emerald-900"
                    trendColor={true}
                />
                <KpiCard 
                    title="Gastos" 
                    amount={metrics.curr.expenses} 
                    prevAmount={metrics.prev.expenses} 
                    icon={<ArrowDownLeft size={24} className="text-rose-600 dark:text-rose-400"/>} 
                    colorClass="bg-rose-100 dark:bg-rose-900"
                    trendColor={false}
                />
                <KpiCard 
                    title="Beneficio Neto" 
                    amount={metrics.netProfit} 
                    prevAmount={metrics.prevNetProfit} 
                    icon={<Landmark size={24} className="text-blue-600 dark:text-blue-400"/>} 
                    colorClass="bg-blue-100 dark:bg-blue-900"
                />
                 <KpiCard 
                    title="Proyección Final" 
                    amount={metrics.projected} 
                    prevAmount={metrics.curr.income}
                    icon={<TrendingUp size={24} className="text-purple-600 dark:text-purple-400"/>} 
                    colorClass="bg-purple-100 dark:bg-purple-900"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. GRÁFICO PRINCIPAL */}
                <div className="lg:col-span-2">
                    <Card title="Evolución Ingresos vs Gastos" icon={<BarChart3 size={20}/>} className="h-full">
                        <IncomeExpenseChart data={chartData} />
                    </Card>
                </div>

                {/* 3. OBLIGACIONES FISCALES */}
                <div className="lg:col-span-1">
                    <Card title="Obligaciones Fiscales" icon={<Calendar size={20}/>} className="h-full">
                        <div className="space-y-4">
                            {fiscalConfig.activeModels.slice(0, 3).map(model => (
                                <div key={model} className="flex items-center justify-between p-3 border border-gray-100 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900/50">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-800 dark:text-white">Modelo {model}</span>
                                            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full">Pendiente</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vence: 20 {new Date(currentDate.getFullYear(), currentDate.getMonth() + 1).toLocaleString('default', { month: 'long' })}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400"><Upload size={16}/></Button>
                                </div>
                            ))}
                             {fiscalConfig.companyType === 'Autonomo' && (
                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-800 dark:text-blue-300 flex gap-2 items-start">
                                    <Briefcase size={16} className="mt-0.5 shrink-0"/>
                                    <div>
                                        <p className="font-bold">Autónomo</p>
                                        <p className="text-xs">Recuerda guardar el 20% de tus ingresos para el IRPF trimestral.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* 4. FACTURAS PENDIENTES */}
                <Card title="Estado Tesorería" icon={<Banknote size={20}/>}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 uppercase font-bold mb-1">Pendiente Cobro</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(pendingInvoices.issued.amount)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{pendingInvoices.issued.count} facturas</p>
                        </div>
                        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-100 dark:border-rose-800">
                            <p className="text-xs text-rose-700 dark:text-rose-400 uppercase font-bold mb-1">Pendiente Pago</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(pendingInvoices.received.amount)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{pendingInvoices.received.count} facturas</p>
                        </div>
                    </div>
                    {/* 7. PREVISIÓN TESORERÍA SIMPLE */}
                    <div className="mt-6">
                        <h4 className="text-sm font-semibold mb-3 text-gray-800 dark:text-white">Previsión de Liquidez</h4>
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30">Saldo Proyectado</span></div>
                                <div className="text-right"><span className="text-xs font-semibold inline-block text-blue-700 dark:text-blue-300">{formatCurrency(metrics.projected)}</span></div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100 dark:bg-blue-900/30">
                                <div style={{ width: "70%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 5. GASTOS POR CATEGORÍA */}
                <Card title="Desglose de Gastos" icon={<PieChart size={20}/>}>
                    {expensesByCategory.length > 0 ? (
                        <div className="space-y-4">
                            {expensesByCategory.slice(0, 5).map((cat, i) => (
                                <CategoryBar 
                                    key={i} 
                                    label={cat.label} 
                                    amount={cat.amount} 
                                    total={metrics.curr.expenses}
                                    color={cat.color}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                            <Filter size={32} className="mb-2 opacity-20"/>
                            <p className="text-sm">No hay gastos registrados en este periodo.</p>
                        </div>
                    )}
                    <div className="mt-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/financial/billing/invoices?type=received')} rightIcon={<ArrowRight size={14}/>}>Ver detalle</Button>
                    </div>
                </Card>

                 {/* 6. ACCIONES RÁPIDAS & ALERTAS */}
                 <div className="space-y-6">
                     {/* 6. Acciones */}
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => navigate('/financial/billing/invoices?type=issued')} className="p-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm transition-colors flex flex-col items-center justify-center gap-2">
                            <Plus size={24} />
                            <span className="text-xs font-bold">Nueva Factura</span>
                        </button>
                        <button onClick={() => navigate('/financial/receipts')} className="p-4 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm transition-colors flex flex-col items-center justify-center gap-2 text-gray-700 dark:text-gray-200">
                            <FileClock size={24} className="text-blue-500"/>
                            <span className="text-xs font-bold">Generar Recibos</span>
                        </button>
                        <button onClick={() => navigate('/financial/billing/invoices?type=received')} className="p-4 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm transition-colors flex flex-col items-center justify-center gap-2 text-gray-700 dark:text-gray-200">
                            <ArrowDownLeft size={24} className="text-rose-500"/>
                            <span className="text-xs font-bold">Registrar Gasto</span>
                        </button>
                         <button onClick={() => navigate('/financial/ledger')} className="p-4 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm transition-colors flex flex-col items-center justify-center gap-2 text-gray-700 dark:text-gray-200">
                            <FileText size={24} className="text-gray-500"/>
                            <span className="text-xs font-bold">Ver Diario</span>
                        </button>
                    </div>

                    {/* 10. ALERTAS */}
                    <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold mb-3">
                            <AlertTriangle size={18} />
                            <h4>Alertas Pendientes</h4>
                        </div>
                        <ul className="space-y-2">
                            {pendingInvoices.issued.amount > 1000 && (
                                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                                    <span>Impagos elevados ({formatCurrency(pendingInvoices.issued.amount)})</span>
                                </li>
                            )}
                            <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                                <span>3 gastos sin categoría asignada.</span>
                            </li>
                        </ul>
                        <Button size="sm" variant="ghost" className="w-full mt-3 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30">Resolver</Button>
                    </Card>
                 </div>
            </div>

            {/* 9. DOCUMENTOS RECIENTES */}
            <Card title="Documentos Recientes" icon={<FileText size={20}/>}>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50 uppercase">
                            <tr>
                                <th className="px-4 py-2 text-gray-600 dark:text-gray-300">Fecha</th>
                                <th className="px-4 py-2 text-gray-600 dark:text-gray-300">Documento</th>
                                <th className="px-4 py-2 text-gray-600 dark:text-gray-300">Concepto</th>
                                <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300">Importe</th>
                                <th className="px-4 py-2 text-center text-gray-600 dark:text-gray-300">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {invoices.slice(0, 5).map(inv => (
                                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 cursor-pointer" onClick={() => navigate(`/financial/billing/invoices?type=${inv.type}`)}>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(inv.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400">{inv.series}-{inv.number}</td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{inv.concept}</td>
                                    <td className={`px-4 py-3 text-right font-bold ${inv.type === 'issued' ? 'text-green-600' : 'text-red-600'}`}>
                                        {inv.type === 'issued' ? '+' : '-'}{formatCurrency(inv.totalAmount)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs ${inv.status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                                            {inv.status === 'Paid' ? 'Pagado' : 'Pendiente'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default FinancialDashboardPage;