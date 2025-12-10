
/**
 * Este archivo sirve como un repositorio central para las constantes de toda la aplicación.
 * Incluye elementos de navegación, definiciones de roles y otros datos estáticos
 * que se utilizan en múltiples componentes.
 */

import React from 'react';
import { Role, SideNavItem } from './types';
import { 
  Home, CalendarCheck, User, Presentation, LayoutGrid, GraduationCap, Send, 
  Building2, UserSquare, Wallet, Scale, CreditCard, FileText, Settings, Cog, Folder,
  File, MessageSquare, Tag, MapPin, Map, Calendar, DoorOpen, CalendarOff, Eye,
  Settings2, PenLine, PenSquare, ShieldCheck, History, Users, Archive, Layers,
  CalendarDays, CheckSquare, UserCog, Globe, CircleUserRound, ClipboardList, Landmark,
  Receipt, Building, FileClock, Clipboard, FileType, Tags, School, Book,
  PieChart, FileSpreadsheet, Calculator, ScrollText, Library, BookOpenCheck, Lock,
  ArrowUpRight, ArrowDownLeft, ShieldAlert, Database, Mail, Inbox, Files
} from 'lucide-react';

/**
 * Un array de todos los roles de usuario disponibles, derivado del enum `Role`.
 * Útil para poblar menús desplegables de selección de roles o para iterar sobre los roles.
 */
export const ROLES = Object.values(Role);

/**
 * Un array de tipos de pago estandarizados, usados para mantener la consistencia en formularios y visualización de datos.
 */
export const PAYMENT_TYPES = ['Free', 'Efectivo', 'Transferencia', 'Domiciliado', 'Tarjeta', 'TPV', 'Bizum', 'Por definir'];

/**
 * Un array de periodicidades de pago estandarizadas.
 */
export const PAYMENT_PERIODICITIES = ['Mensual', 'Trimestral', 'Único', 'Manual', 'Por definir', 'Sin periodicidad'];

/**
 * Define la estructura del menú de navegación de la barra lateral.
 * Cada objeto representa un enlace de navegación principal o un grupo colapsable con un submenú.
 * - `title`: El texto que se muestra para el elemento de navegación.
 * - `path`: La ruta URL para el enlace.
 * - `icon`: Un componente de React (de lucide-react) para mostrar junto al título.
 * - `roles`: Un array de enums `Role` que especifica qué roles de usuario pueden ver este elemento.
 * - `submenu`: Un array opcional de sub-elementos para crear una navegación anidada.
 */
export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: 'Inicio',
    path: '/dashboard',
    icon: <Home size={20} />,
    roles: [Role.ADMIN, Role.COORDINATOR, Role.TEACHER, Role.FINANCIAL_MANAGER], 
  },
  {
    title: 'Calendario asistencia',
    path: '/attendance-calendar',
    icon: <CalendarCheck size={20} />,
    roles: [Role.ADMIN, Role.COORDINATOR, Role.TEACHER],
  },
  {
    title: 'Alumnos en curso',
    path: '/students',
    icon: <User size={20} />,
    roles: [Role.ADMIN, Role.COORDINATOR, Role.TEACHER, Role.FINANCIAL_MANAGER],
  },
  {
    title: 'Cursos activos',
    path: '/courses',
    icon: <Presentation size={20} />,
    roles: [Role.ADMIN, Role.COORDINATOR, Role.TEACHER, Role.FINANCIAL_MANAGER],
  },
  {
    title: 'Wiki Académica',
    path: '/wiki',
    icon: <Library size={20} />,
    roles: [Role.ADMIN, Role.COORDINATOR, Role.TEACHER],
    submenu: [
        { title: 'Biblioteca de Contenidos', path: '/wiki/home', icon: <Book size={16}/>, roles: [Role.ADMIN, Role.COORDINATOR, Role.TEACHER] },
        { title: 'Editor de Lecciones', path: '/wiki/editor', icon: <PenLine size={16}/>, roles: [Role.ADMIN, Role.COORDINATOR, Role.TEACHER] }, 
        { title: 'Sesiones Impartidas', path: '/wiki/sessions', icon: <BookOpenCheck size={16}/>, roles: [Role.ADMIN, Role.COORDINATOR, Role.TEACHER] },
        { title: 'Permisos Profesores', path: '/wiki/permissions', icon: <Lock size={16}/>, roles: [Role.ADMIN, Role.COORDINATOR] },
    ]
  },
  {
    title: 'Cuadro aulas',
    path: '/classroom-schedule',
    icon: <LayoutGrid size={20} />,
    roles: [Role.ADMIN, Role.COORDINATOR, Role.TEACHER],
  },
  {
    title: 'Profesores',
    path: '/teachers',
    icon: <GraduationCap size={20} />,
    roles: [Role.ADMIN, Role.COORDINATOR],
  },
  {
    title: 'Gestoría Financiera',
    path: '/financial',
    icon: <Landmark size={20} />,
    roles: [Role.ADMIN, Role.FINANCIAL_MANAGER],
    submenu: [
        { title: 'Dashboard Contable', path: '/financial/dashboard', icon: <PieChart size={16}/> },
        { title: 'Recibos y Cobros', path: '/financial/receipts', icon: <Receipt size={16}/> },
        { title: 'Facturas Emitidas', path: '/financial/billing/invoices?type=issued', icon: <ArrowUpRight size={16}/> },
        { title: 'Facturas Recibidas', path: '/financial/billing/invoices?type=received', icon: <ArrowDownLeft size={16}/> },
        { title: 'Fact. provisionales', path: '/financial/billing/proformas', icon: <FileClock size={16}/> },
        { title: 'Presupuestos', path: '/financial/billing/quotes', icon: <Clipboard size={16}/> },
        { title: 'Clientes', path: '/financial/billing/clients', icon: <Users size={16}/> },
        { title: 'Tipo de documentos', path: '/financial/billing/doc-types', icon: <FileType size={16}/> },
        { title: 'Conceptos facturación', path: '/financial/billing/concepts', icon: <Tags size={16}/> },
        { title: 'Modelos Fiscales', path: '/financial/models', icon: <Calculator size={16}/> },
        { title: 'Libro Diario', path: '/financial/ledger', icon: <ScrollText size={16}/> },
        { title: 'Centros fac.', path: '/financial/billing/centers', icon: <Building size={16}/> },
        { title: 'Configuración Fiscal', path: '/financial/config', icon: <Settings size={16}/> },
    ]
  },
  {
    title: 'Comunicaciones',
    path: '/communications',
    icon: <Mail size={20} />,
    roles: [Role.ADMIN, Role.COORDINATOR],
    submenu: [
      { title: 'Redactar/Enviar', path: '/communications/send', icon: <Send size={16}/> },
      { title: 'Bandeja de salida', path: '/communications/outbox', icon: <Inbox size={16}/> },
      { title: 'Plantillas', path: '/communications/templates', icon: <FileText size={16}/> },
      { title: 'Configuración', path: '/communications/config', icon: <Settings size={16}/> },
    ]
  },
  {
    title: 'Gestión Centro',
    path: '/center-management',
    icon: <Building2 size={20} />,
    roles: [Role.ADMIN, Role.COORDINATOR], // FINANCIAL_MANAGER removed
    submenu: [
      { title: 'Perfil academia', path: '/center-management/profile', icon: <School size={16}/> }, 
      { title: 'Roles y usuarios', path: '/center-management/users', icon: <UserCog size={16}/> }, 
      { title: 'Histórico Alumnos', path: '/center-management/student-history', icon: <History size={16}/> }, 
      { title: 'Alumnos en espera', path: '/center-management/waiting-list', icon: <Users size={16}/> },
      { title: 'Histórico Cursos', path: '/center-management/course-history', icon: <Archive size={16}/> },
      { title: 'Agrupación niveles', path: '/center-management/level-grouping', icon: <Layers size={16}/> },
      { title: 'Días clase', path: '/center-management/class-days', icon: <CalendarDays size={16}/> },
      { title: 'Autorizaciones alumnos', path: '/center-management/authorizations', icon: <CheckSquare size={16}/> },
      { title: 'Etiquetas', path: '/center-management/tags', icon: <Tag size={16}/> },
      { title: 'Recursos generales', path: '/center-management/general-resources', icon: <Folder size={16}/> },
      { title: 'Landings inscripción', path: '/center-management/landing-pages', icon: <Globe size={16}/> },
    ]
  },
  {
    title: 'Gestión área alumnos',
    path: '/student-area',
    icon: <UserSquare size={20} />,
    roles: [Role.ADMIN, Role.COORDINATOR],
    submenu: [
        { title: 'Usuarios alumnos', path: '/student-area/users', icon: <CircleUserRound size={16}/> },
        { title: 'Registro accesos', path: '/student-area/access-log', icon: <ClipboardList size={16}/> },
    ]
  },
  {
    title: 'Informes de notas',
    path: '/grade-reports',
    icon: <FileText size={20} />,
    roles: [Role.ADMIN, Role.COORDINATOR, Role.TEACHER],
    submenu: [
        { title: 'Informes', path: '/grade-reports/reports', icon: <FileText size={16}/> },
        { title: 'Comentarios predef.', path: '/grade-reports/predefined-comments', icon: <MessageSquare size={16}/> },
        { title: 'Etiq. Coment. Predef', path: '/grade-reports/comment-tags', icon: <Tag size={16}/> },
    ]
  },
  {
    title: 'Tablas auxiliares',
    path: '/aux-tables',
    icon: <Settings size={20} />,
    roles: [Role.ADMIN],
    submenu: [
        { title: 'Poblaciones', path: '/aux-tables/populations', icon: <MapPin size={16}/> },
        { title: 'Localizaciones', path: '/aux-tables/locations', icon: <Map size={16}/> },
        { title: 'Horarios semana', path: '/aux-tables/week-schedules', icon: <Calendar size={16}/> },
        { title: 'Aulas', path: '/aux-tables/classrooms', icon: <DoorOpen size={16}/> },
        { title: 'Días festivos', path: '/aux-tables/holidays', icon: <CalendarOff size={16}/> },
    ]
  },
  {
    title: 'Config. Documentos',
    path: '/doc-config',
    icon: <Cog size={20} />,
    roles: [Role.ADMIN],
    submenu: [
      { title: 'Previsualización', path: '/doc-config/preview', icon: <Eye size={16}/> },
      { title: 'Config. apartados', path: '/doc-config/sections', icon: <Settings2 size={16}/> },
      { title: 'Config. textos', path: '/doc-config/texts', icon: <PenLine size={16}/> },
      { title: 'Grupos Autoriz.', path: '/doc-config/auth-groups', icon: <ShieldCheck size={16}/> },
    ]
  },
   {
    title: 'Recursos',
    path: '/resources',
    icon: <Folder size={20} />,
    roles: [Role.ADMIN, Role.COORDINATOR, Role.TEACHER], // Everyone except financial manager
  },
  {
    title: 'Zona Admin',
    path: '/admin',
    icon: <ShieldAlert size={20} />,
    roles: [Role.ADMIN],
    submenu: [
        { title: 'Logs del sistema', path: '/admin/logs', icon: <FileClock size={16}/> },
        { title: 'Gestor de Archivos', path: '/admin/file-manager', icon: <Files size={16}/> },
        { title: 'Doc. Técnica', path: '/technical-docs', icon: <Book size={16}/> },
        { title: 'BaaS', path: '/admin/database', icon: <Database size={16}/> },
    ]
  },
];