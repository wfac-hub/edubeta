
import React from 'react';
import Button from '../components/ui/Button';
import { Printer, ArrowLeft, Server, Layout, Database, Shield, Code, FileText, FolderTree, Tag, CheckSquare, Layers, Network, Settings, PenTool, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

// Componentes auxiliares para el formato del documento
const SectionTitle: React.FC<{ children: React.ReactNode, icon: React.ReactNode }> = ({ children, icon }) => (
    <div className="flex items-center gap-3 border-b-2 border-gray-200 dark:border-gray-700 pb-2 mb-6 mt-10 break-after-avoid break-inside-avoid page-break-after-avoid">
        <span className="text-primary-600 dark:text-primary-400">{icon}</span>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white uppercase tracking-wider">{children}</h2>
    </div>
);

const SubSectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-3 mt-6 break-after-avoid border-l-4 border-primary-500 pl-3">{children}</h3>
);

const TechItem: React.FC<{ label: string, text: string }> = ({ label, text }) => (
    <li className="mb-2 flex items-start">
        <span className="font-semibold text-gray-700 dark:text-gray-300 w-32 shrink-0">{label}:</span> 
        <span className="text-gray-600 dark:text-gray-400">{text}</span>
    </li>
);

const FolderItem: React.FC<{ name: string, desc: string, indent?: number }> = ({ name, desc, indent = 0 }) => (
    <div className={`flex items-start gap-2 py-1 border-b border-gray-100 dark:border-slate-800 last:border-0 ml-${indent * 4}`}>
        <span className="font-mono text-primary-600 dark:text-primary-400 font-bold text-sm whitespace-nowrap">{name}</span>
        <span className="text-gray-500 dark:text-gray-400 text-sm italic">- {desc}</span>
    </div>
);

/**
 * Página de Documentación Técnica.
 * Renderiza una guía completa de la arquitectura, estructura de carpetas y funcionalidades de la aplicación.
 * Está optimizada con estilos CSS de impresión para que el usuario pueda guardarla como PDF.
 */
const TechnicalDocsPage = () => {
    const navigate = useNavigate();
    const { academyProfile } = useData();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 md:p-8 print:bg-white print:p-0 print:min-h-0">
            {/* Barra de herramientas superior (oculta al imprimir) */}
            <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <Button variant="secondary" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate('/')}>
                    Volver al Dashboard
                </Button>
                <Button leftIcon={<Printer size={16} />} onClick={handlePrint}>
                    Imprimir / Guardar como PDF
                </Button>
            </div>

            {/* Contenedor del Documento */}
            <div className="max-w-5xl mx-auto bg-white dark:bg-slate-800 p-8 md:p-16 shadow-xl rounded-xl print:shadow-none print:p-0 print:max-w-none text-gray-800 dark:text-gray-300 font-sans leading-relaxed">
                
                {/* Portada del Documento */}
                <header className="text-center border-b-4 border-primary-500 pb-12 mb-12 print:pt-10">
                    <div className="flex justify-center mb-6">
                         <div className="p-4 bg-primary-50 dark:bg-slate-700 rounded-full">
                            <Layout size={48} className="text-primary-600 dark:text-primary-400" />
                         </div>
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 uppercase tracking-tight">Documentación Técnica</h1>
                    <p className="text-2xl text-primary-600 dark:text-primary-400 mb-2 font-semibold">{academyProfile.publicName || 'EduBeta System'}</p>
                    <p className="text-gray-500 text-lg">Plataforma Integral de Gestión Educativa (ERP)</p>
                    <p className="text-sm text-gray-400 mt-8 font-mono">Versión del Sistema: 12.0.0 | Generado: {new Date().toLocaleDateString()}</p>
                </header>

                {/* 1. Visión General */}
                <section className="mb-8">
                    <SectionTitle icon={<Layout size={24} />}>1. Arquitectura del Sistema</SectionTitle>
                    <p className="mb-4 text-justify">
                        EduBeta está construida como una <strong>Single Page Application (SPA)</strong> utilizando React 18. Esta arquitectura desacopla completamente el frontend de la lógica de servidor, permitiendo una experiencia de usuario fluida similar a una aplicación de escritorio.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="bg-gray-50 dark:bg-slate-900/50 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="font-bold mb-3 text-primary-700 dark:text-primary-400 border-b border-gray-200 pb-2 flex items-center gap-2">
                                <Code size={18}/> Core Tecnológico
                            </h4>
                            <ul className="list-none space-y-2 text-sm">
                                <TechItem label="Framework" text="React 18.2.0" />
                                <TechItem label="Lenguaje" text="TypeScript 5.x (Seguridad de tipos)" />
                                <TechItem label="Build Tool" text="Vite (HMR & Bundling optimizado)" />
                                <TechItem label="Routing" text="React Router DOM v6" />
                            </ul>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-900/50 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="font-bold mb-3 text-primary-700 dark:text-primary-400 border-b border-gray-200 pb-2 flex items-center gap-2">
                                <Database size={18}/> Gestión de Datos
                            </h4>
                            <ul className="list-none space-y-2 text-sm">
                                <TechItem label="Estado Global" text="React Context API (Nativo)" />
                                <TechItem label="Persistencia" text="LocalStorage / Adaptadores para Firebase/Supabase" />
                                <TechItem label="Mocking" text="Servicio de datos simulados para desarrollo" />
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 2. Estructura de Directorios */}
                <section className="mb-8 break-inside-avoid">
                    <SectionTitle icon={<FolderTree size={24} />}>2. Estructura del Proyecto</SectionTitle>
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">La aplicación sigue una estructura modular basada en dominios funcionales dentro de la carpeta <code>src/pages</code>.</p>
                    
                    <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="space-y-1">
                            <FolderItem name="src/" desc="Raíz del código fuente" />
                            <FolderItem name="components/" desc="Componentes reutilizables (UI Kit, Modales, Formularios)" indent={1} />
                            <FolderItem name="contexts/" desc="Lógica de negocio (AuthContext, DataContext, ThemeContext)" indent={1} />
                            <FolderItem name="pages/" desc="Vistas principales de la aplicación" indent={1} />
                            <FolderItem name="admin/" desc="Gestión técnica (Logs, Base de datos)" indent={2} />
                            <FolderItem name="billing/" desc="Gestión de facturación (Clientes, Series, Facturas)" indent={2} />
                            <FolderItem name="communications/" desc="Módulo de email marketing y plantillas" indent={2} />
                            <FolderItem name="financial/" desc="Dashboard económico, impuestos y contabilidad" indent={2} />
                            <FolderItem name="grade-reports/" desc="Gestión de informes académicos y boletines" indent={2} />
                            <FolderItem name="wiki/" desc="Gestión del conocimiento (LMS interno)" indent={2} />
                            <FolderItem name="services/" desc="Lógica de conexión a datos y Mocks" indent={1} />
                            <FolderItem name="types/" desc="Definiciones de tipos TypeScript (Interfaces)" indent={1} />
                            <FolderItem name="utils/" desc="Funciones auxiliares (Fechas, Formatos, Validaciones)" indent={1} />
                        </div>
                    </div>
                </section>

                {/* 3. Módulos Funcionales */}
                <section className="mb-8">
                    <SectionTitle icon={<Layers size={24} />}>3. Detalle de Módulos Funcionales</SectionTitle>
                    
                    <div className="space-y-8">
                        <div className="break-inside-avoid">
                            <SubSectionTitle>3.1. Gestión Académica (Core)</SubSectionTitle>
                            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Núcleo del sistema para la gestión diaria de alumnos y cursos.</p>
                            <ul className="list-disc list-inside space-y-2 ml-2 text-gray-700 dark:text-gray-300 text-sm">
                                <li><strong>Alumnos (StudentsPage):</strong> CRUD completo. Ficha con datos personales, bancarios, tutores y visualización de alertas (deudas, cumpleaños).</li>
                                <li><strong>Cursos (CoursesPage):</strong> Gestión de oferta formativa. Control de aforo, listas de espera y asignación de horarios.</li>
                                <li><strong>Calendario (AttendanceCalendarPage):</strong> Vista visual de clases. Permite reprogramar sesiones, asignar sustituciones y cambiar la modalidad (Online/Híbrido).</li>
                                <li><strong>Asistencia:</strong> Control de presencia, retrasos, justificaciones y seguimiento de deberes. Envío de avisos automáticos.</li>
                            </ul>
                        </div>

                        <div className="break-inside-avoid">
                            <SubSectionTitle>3.2. Módulo Financiero y Facturación</SubSectionTitle>
                            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Control exhaustivo de la economía del centro.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded border border-blue-100 dark:border-blue-800">
                                    <h5 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Gestión de Recibos</h5>
                                    <ul className="list-disc list-inside text-xs space-y-1">
                                        <li>Generación masiva por inscripción.</li>
                                        <li>Control de estados (Pendiente, Cobrado, Devuelto).</li>
                                        <li>Alertas visuales de deuda en listados de alumnos.</li>
                                        <li>Generación de PDF de recibo.</li>
                                    </ul>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded border border-green-100 dark:border-green-800">
                                    <h5 className="font-bold text-green-800 dark:text-green-300 mb-2">Facturación</h5>
                                    <ul className="list-disc list-inside text-xs space-y-1">
                                        <li>Series de facturación y rectificativas.</li>
                                        <li>Facturas emitidas y recibidas.</li>
                                        <li>Control de modelos fiscales (303, 130, etc.).</li>
                                        <li>Dashboard financiero con KPIs.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="break-inside-avoid">
                            <SubSectionTitle>3.3. Comunicaciones (CRM)</SubSectionTitle>
                            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Sistema integrado para contactar con alumnos y profesores.</p>
                            <ul className="list-disc list-inside space-y-2 ml-2 text-gray-700 dark:text-gray-300 text-sm">
                                <li><strong>Redactor de Email:</strong> Editor de texto enriquecido con inserción de variables dinámicas (Nombre, Cursos, etc.).</li>
                                <li><strong>Filtros de Audiencia:</strong> Segmentación por curso, nivel, aula o estado comercial (Newsletter).</li>
                                <li><strong>Plantillas:</strong> Gestión de plantillas reutilizables y plantillas de sistema (Aviso falta, Cumpleaños).</li>
                                <li><strong>Bandeja de Salida:</strong> Log detallado de todos los envíos realizados por el sistema o usuarios.</li>
                            </ul>
                        </div>

                        <div className="break-inside-avoid">
                            <SubSectionTitle>3.4. Gestión Documental y Firmas</SubSectionTitle>
                            <ul className="list-disc list-inside space-y-2 ml-2 text-gray-700 dark:text-gray-300 text-sm">
                                <li><strong>Generador de Documentos:</strong> Creación dinámica de contratos, fichas y autorizaciones (SEPA, Imágenes) en PDF.</li>
                                <li><strong>Firma Digital:</strong> Componente de firma manuscrita (Canvas) integrado. Generación de tokens únicos para firmas remotas.</li>
                                <li><strong>Autorizaciones:</strong> Seguimiento del estado de firma de documentos por alumno.</li>
                            </ul>
                        </div>

                        <div className="break-inside-avoid">
                            <SubSectionTitle>3.5. Wiki Académica (LMS)</SubSectionTitle>
                            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Repositorio de conocimiento y control de sesiones.</p>
                            <ul className="list-disc list-inside space-y-2 ml-2 text-gray-700 dark:text-gray-300 text-sm">
                                <li><strong>Estructura:</strong> Categorías -> Temas -> Lecciones.</li>
                                <li><strong>Editor de Contenido:</strong> Editor de bloques tipo "Notion" (Texto, Vídeo, Imagen, Quiz).</li>
                                <li><strong>Sesiones Impartidas:</strong> Registro de qué lección se ha impartido en cada clase para control pedagógico.</li>
                                <li><strong>Permisos:</strong> Control granular de qué profesores pueden ver o editar categorías específicas.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 4. Seguridad y Datos */}
                <section className="mb-8 break-inside-avoid">
                    <SectionTitle icon={<Shield size={24} />}>4. Seguridad y Administración</SectionTitle>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <h4 className="font-bold text-gray-800 dark:text-white mb-2">Roles de Usuario (RBAC)</h4>
                            <table className="w-full text-xs border border-gray-200 dark:border-gray-700">
                                <thead className="bg-gray-50 dark:bg-slate-700">
                                    <tr><th className="p-2 text-left">Rol</th><th className="p-2 text-left">Acceso Principal</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                    <tr><td className="p-2 font-semibold">Admin</td><td className="p-2">Control total del sistema.</td></tr>
                                    <tr><td className="p-2 font-semibold">Coordinador</td><td className="p-2">Gestión académica y usuarios (no admins).</td></tr>
                                    <tr><td className="p-2 font-semibold">Gestor Fin.</td><td className="p-2">Facturación, recibos y dashboard económico.</td></tr>
                                    <tr><td className="p-2 font-semibold">Profesor</td><td className="p-2">Sus cursos, asistencia y wiki (lectura).</td></tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div>
                             <h4 className="font-bold text-gray-800 dark:text-white mb-2">Auditoría y Logs</h4>
                             <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                El sistema registra acciones críticas en <code>ActivityLogs</code> accesible desde la Zona Admin.
                             </p>
                             <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400">
                                <li>Inicios de sesión (con IP simulada).</li>
                                <li>Cambios en fichas de alumnos.</li>
                                <li>Generación/Borrado de recibos y facturas.</li>
                                <li>Cambios en configuración global.</li>
                             </ul>
                        </div>
                    </div>
                </section>

                 {/* 5. Relaciones de Datos */}
                 <section className="mb-8 break-inside-avoid">
                    <SectionTitle icon={<Network size={24} />}>5. Modelo de Datos Relacional</SectionTitle>
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Principales relaciones entre entidades gestionadas por el DataContext.</p>
                    
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs">
                        <ul className="space-y-2">
                            <li><strong>Course</strong> (1) &lt;--&gt; (N) <strong>Enrollment</strong> &lt;--&gt; (1) <strong>Student</strong></li>
                            <li><strong>Course</strong> (1) &lt;--&gt; (N) <strong>CourseClass</strong> (Calendario)</li>
                            <li><strong>Student</strong> (1) &lt;--&gt; (N) <strong>Receipt</strong> (Cobros)</li>
                            <li><strong>Receipt</strong> (N) --&gt; (1) <strong>Invoice</strong> (Facturación)</li>
                            <li><strong>Teacher</strong> (1) &lt;--&gt; (N) <strong>Course</strong> (Asignación principal)</li>
                            <li><strong>WikiLesson</strong> (1) &lt;--&gt; (N) <strong>TaughtSession</strong> &lt;--&gt; (1) <strong>CourseClass</strong></li>
                        </ul>
                    </div>
                 </section>
                
                {/* Footer del documento */}
                <footer className="text-center text-xs text-gray-400 mt-16 border-t border-gray-200 dark:border-gray-700 pt-8 break-inside-avoid">
                    <p>Documentación generada dinámicamente por el sistema EduBeta.</p>
                    <p>© {new Date().getFullYear()} {academyProfile.publicName || 'EduBeta'}. Todos los derechos reservados.</p>
                </footer>
            </div>

            {/* Estilos específicos para impresión */}
            <style>{`
                @media print {
                    @page {
                        margin: 1.5cm;
                        size: A4;
                    }
                    body {
                        background-color: white;
                        color: black;
                        -webkit-print-color-adjust: exact;
                    }
                    /* Ocultar elementos no deseados */
                    .print\\:hidden {
                        display: none !important;
                    }
                    aside, header.sticky, nav { 
                        display: none !important; 
                    }
                    /* Ajustes de contenedor */
                    .print\\:shadow-none {
                        box-shadow: none !important;
                        border: none !important;
                    }
                    .print\\:p-0 {
                        padding: 0 !important;
                    }
                    .print\\:max-w-none {
                        max-width: 100% !important;
                    }
                    .print\\:min-h-0 {
                        min-h: 0 !important;
                    }
                    /* Saltos de página */
                    .break-after-avoid {
                        break-after: avoid;
                    }
                    .break-inside-avoid {
                        break-inside: avoid;
                    }
                    .page-break-after-avoid {
                        page-break-after: avoid;
                    }
                    /* Tipografía */
                    h1, h2, h3, h4 {
                        color: #000 !important;
                    }
                    p, li, td, span {
                        color: #333 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default TechnicalDocsPage;
