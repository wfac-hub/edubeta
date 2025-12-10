
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NavigationHistoryProvider } from './contexts/NavigationHistoryContext';

// Pages Import
import { DashboardPage } from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import UserEditPage from './pages/UserEditPage';
import CoursesPage from './pages/CoursesPage';
import StudentsPage from './pages/StudentsPage';
import ClassroomsPage from './pages/ClassroomsPage';
import LocationsPage from './pages/LocationsPage';
import PopulationsPage from './pages/PopulationsPage';
import WeekSchedulesPage from './pages/WeekSchedulesPage';
import HolidaysPage from './pages/HolidaysPage';
import TeacherEditPage from './pages/TeacherEditPage';
import TeachersPage from './pages/TeachersPage';
import TeacherCoursesPage from './pages/TeacherCoursesPage';
import TeacherHoursPage from './pages/TeacherHoursPage';
import TeacherDocsPage from './pages/TeacherDocsPage';
import TeacherChangePasswordPage from './pages/TeacherChangePasswordPage';
import StudentEditPage from './pages/StudentEditPage';
import StudentHistoryPage from './pages/StudentHistoryPage';
import StudentCoursesPage from './pages/StudentCoursesPage';
import StudentDocsPage from './pages/StudentDocsPage';
import StudentReceiptsPage from './pages/StudentReceiptsPage';
import StudentAuthorizationsPage from './pages/StudentAuthorizationsPage';
import StudentRegistrationSheetPage from './pages/StudentRegistrationSheetPage';
import StudentAttendanceSummaryPage from './pages/StudentAttendanceSummaryPage';
import CourseHistoryPage from './pages/CourseHistoryPage';
import CourseStudentsPage from './pages/CourseStudentsPage';
import CourseClassesPage from './pages/CourseClassesPage';
import CourseResourcesPage from './pages/CourseResourcesPage';
import CourseWaitingListPage from './pages/CourseWaitingListPage';
import RescheduleClassPage from './pages/RescheduleClassPage';
import AttendanceCalendarPage from './pages/AttendanceCalendarPage';
import AttendancePage from './pages/AttendancePage';
import ClassroomCoursesPage from './pages/ClassroomCoursesPage';
import ClassroomSchedulePage from './pages/ClassroomSchedulePage';
import LevelGroupingsPage from './pages/LevelGroupingsPage';
import CourseLevelsPage from './pages/CourseLevelsPage';
import AuthorizationGroupsPage from './pages/AuthorizationGroupsPage';
import GroupAuthorizationsPage from './pages/GroupAuthorizationsPage';
import AuthorizationEditPage from './pages/AuthorizationEditPage';
import AllAuthorizationsPage from './pages/AllAuthorizationsPage';
import SignDocumentPage from './pages/SignDocumentPage';
import PostSignRedirectPage from './pages/PostSignRedirectPage';
import SignedDocumentPreviewPage from './pages/SignedDocumentPreviewPage';
import NewAuthorizationPage from './pages/NewAuthorizationPage';
import DocumentSectionsPage from './pages/DocumentSectionsPage';
import AcademyTextsPage from './pages/AcademyTextsPage';
import AcademyProfilePage from './pages/AcademyProfilePage';
import DocumentPreviewPage from './pages/DocumentPreviewPage';
import FinancialDashboardPage from './pages/financial/FinancialDashboardPage';
import InvoicesListPage from './pages/billing/InvoicesListPage';
import InvoicePdfPage from './pages/financial/InvoicePdfPage';
import InvoicePaymentsPage from './pages/financial/InvoicePaymentsPage';
import GenerateInvoicesWizardPage from './pages/financial/GenerateInvoicesWizardPage';
import GeneratedInvoicesPage from './pages/financial/GeneratedInvoicesPage';
import ProformaInvoicesPage from './pages/billing/ProformaInvoicesPage';
import QuotesPage from './pages/billing/QuotesPage';
import FiscalModelsPage from './pages/financial/FiscalModelsPage';
import FiscalConfigPage from './pages/financial/FiscalConfigPage';
import AccountingLedgerPage from './pages/financial/AccountingLedgerPage';
import BillingCentersPage from './pages/billing/BillingCentersPage';
import BillingCenterEditPage from './pages/billing/BillingCenterEditPage';
import BillingClientsPage from './pages/billing/BillingClientsPage';
import DocumentTypesPage from './pages/billing/DocumentTypesPage';
import DefaultConceptsPage from './pages/billing/DefaultConceptsPage';
import AllReceiptsPage from './pages/AllReceiptsPage';
import ReceiptEditPage from './pages/ReceiptEditPage';
import ReceiptPdfPage from './pages/receipts/ReceiptPdfPage';
import EnrollmentCancellationPage from './pages/EnrollmentCancellationPage';
import { AllEnrollmentsPage } from './pages/AllEnrollmentsPage';
import WikiHomePage from './pages/wiki/WikiHomePage';
import WikiCategoryPage from './pages/wiki/WikiCategoryPage';
import WikiClassPage from './pages/wiki/WikiClassPage';
import WikiLessonViewPage from './pages/wiki/WikiLessonViewPage';
import WikiLessonEditorPage from './pages/wiki/WikiLessonEditorPage';
import WikiPermissionsPage from './pages/wiki/WikiPermissionsPage';
import WikiSessionsPage from './pages/wiki/WikiSessionsPage';
import ComposeEmailPage from './pages/communications/ComposeEmailPage';
import SentEmailsPage from './pages/communications/SentEmailsPage';
import EmailTemplatesPage from './pages/communications/EmailTemplatesPage';
import EmailConfigPage from './pages/communications/EmailConfigPage';
import AdminLogsPage from './pages/AdminLogsPage';
import BaaSConfigPage from './pages/admin/BaaSConfigPage';
import FileManagerPage from './pages/admin/FileManagerPage';
import TechnicalDocsPage from './pages/TechnicalDocsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import MyProfilePage from './pages/MyProfilePage';
import LandingPagesListPage from './pages/center/LandingPagesListPage';
import LandingPageEditor from './pages/center/LandingPageEditor';
import LandingPageCustomFieldsPage from './pages/center/LandingPageCustomFieldsPage';
import StudentTagsPage from './pages/StudentTagsPage';
import PredefinedCommentsPage from './pages/grade-reports/PredefinedCommentsPage';
import CommentTagsPage from './pages/grade-reports/CommentTagsPage';
import ReportsListPage from './pages/grade-reports/ReportsListPage';
import ResourcesPage from './pages/ResourcesPage';
import SignableDocumentsPage from './pages/SignableDocumentsPage';
import CourseEnrollmentPage from './pages/CourseEnrollmentPage';
import WaitingListPage from './pages/WaitingListPage';
import LevelCoursesPage from './pages/LevelCoursesPage';
import ClassDaysPage from './pages/ClassDaysPage';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <DataProvider>
          <NavigationHistoryProvider>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/sign/:token" element={<SignDocumentPage />} />
                <Route path="/signed/:token" element={<PostSignRedirectPage />} />

                <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                
                {/* Center Management */}
                <Route path="/center-management/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
                <Route path="/center-management/users/new" element={<ProtectedRoute><UserEditPage /></ProtectedRoute>} />
                <Route path="/center-management/users/:userId/edit" element={<ProtectedRoute><UserEditPage /></ProtectedRoute>} />
                <Route path="/center-management/profile" element={<ProtectedRoute><AcademyProfilePage /></ProtectedRoute>} />
                <Route path="/center-management/waiting-list" element={<ProtectedRoute><WaitingListPage /></ProtectedRoute>} />
                <Route path="/center-management/student-history" element={<ProtectedRoute><StudentHistoryPage /></ProtectedRoute>} />
                <Route path="/center-management/course-history" element={<ProtectedRoute><CourseHistoryPage /></ProtectedRoute>} />
                <Route path="/center-management/level-grouping" element={<ProtectedRoute><LevelGroupingsPage /></ProtectedRoute>} />
                <Route path="/center-management/level-grouping/:groupId" element={<ProtectedRoute><CourseLevelsPage /></ProtectedRoute>} />
                <Route path="/center-management/course-levels/:levelId/courses" element={<ProtectedRoute><LevelCoursesPage /></ProtectedRoute>} />
                <Route path="/center-management/class-days" element={<ProtectedRoute><ClassDaysPage /></ProtectedRoute>} />
                <Route path="/center-management/authorizations" element={<ProtectedRoute><AuthorizationGroupsPage /></ProtectedRoute>} />
                <Route path="/center-management/tags" element={<ProtectedRoute><StudentTagsPage /></ProtectedRoute>} />
                <Route path="/center-management/general-resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
                <Route path="/center-management/landing-pages" element={<ProtectedRoute><LandingPagesListPage /></ProtectedRoute>} />
                <Route path="/center-management/landing-pages/new" element={<ProtectedRoute><LandingPageEditor /></ProtectedRoute>} />
                <Route path="/center-management/landing-pages/:id/edit" element={<ProtectedRoute><LandingPageEditor /></ProtectedRoute>} />
                <Route path="/center-management/landing-pages/:landingId/fields" element={<ProtectedRoute><LandingPageCustomFieldsPage /></ProtectedRoute>} />

                {/* Academic */}
                <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
                <Route path="/students/:studentId/edit" element={<ProtectedRoute><StudentEditPage /></ProtectedRoute>} />
                <Route path="/students/:studentId/courses" element={<ProtectedRoute><StudentCoursesPage /></ProtectedRoute>} />
                <Route path="/students/:studentId/attendance" element={<ProtectedRoute><StudentAttendanceSummaryPage /></ProtectedRoute>} />
                <Route path="/students/:studentId/receipts" element={<ProtectedRoute><StudentReceiptsPage /></ProtectedRoute>} />
                <Route path="/students/:studentId/authorizations" element={<ProtectedRoute><StudentAuthorizationsPage /></ProtectedRoute>} />
                <Route path="/students/:studentId/authorizations/new" element={<ProtectedRoute><NewAuthorizationPage /></ProtectedRoute>} />
                <Route path="/students/:studentId/docs" element={<ProtectedRoute><StudentDocsPage /></ProtectedRoute>} />
                <Route path="/students/:studentId/registration-sheet" element={<ProtectedRoute><StudentRegistrationSheetPage /></ProtectedRoute>} />
                
                <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
                <Route path="/courses/all-enrollments" element={<ProtectedRoute><AllEnrollmentsPage /></ProtectedRoute>} />
                <Route path="/courses/:courseId/students" element={<ProtectedRoute><CourseStudentsPage /></ProtectedRoute>} />
                <Route path="/courses/:courseId/classes" element={<ProtectedRoute><CourseClassesPage /></ProtectedRoute>} />
                <Route path="/courses/:courseId/classes/:classId/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
                <Route path="/courses/:courseId/classes/:classId/reschedule" element={<ProtectedRoute><RescheduleClassPage /></ProtectedRoute>} />
                <Route path="/courses/:courseId/resources" element={<ProtectedRoute><CourseResourcesPage /></ProtectedRoute>} />
                <Route path="/courses/:courseId/waiting-list" element={<ProtectedRoute><CourseWaitingListPage /></ProtectedRoute>} />
                <Route path="/courses/:courseId/enroll" element={<ProtectedRoute><CourseEnrollmentPage /></ProtectedRoute>} />

                <Route path="/attendance-calendar" element={<ProtectedRoute><AttendanceCalendarPage /></ProtectedRoute>} />
                <Route path="/classroom-schedule" element={<ProtectedRoute><ClassroomSchedulePage /></ProtectedRoute>} />
                
                <Route path="/teachers" element={<ProtectedRoute><TeachersPage /></ProtectedRoute>} />
                <Route path="/teachers/:teacherId/edit" element={<ProtectedRoute><TeacherEditPage /></ProtectedRoute>} />
                <Route path="/teachers/:teacherId/courses" element={<ProtectedRoute><TeacherCoursesPage /></ProtectedRoute>} />
                <Route path="/teachers/:teacherId/hours" element={<ProtectedRoute><TeacherHoursPage /></ProtectedRoute>} />
                <Route path="/teachers/:teacherId/docs" element={<ProtectedRoute><TeacherDocsPage /></ProtectedRoute>} />
                <Route path="/teachers/:teacherId/change-password" element={<ProtectedRoute><TeacherChangePasswordPage /></ProtectedRoute>} />

                {/* Financial */}
                <Route path="/financial/dashboard" element={<ProtectedRoute><FinancialDashboardPage /></ProtectedRoute>} />
                <Route path="/financial/receipts" element={<ProtectedRoute><AllReceiptsPage /></ProtectedRoute>} />
                <Route path="/receipts/all" element={<ProtectedRoute><AllReceiptsPage /></ProtectedRoute>} />
                <Route path="/receipts/:receiptId/edit" element={<ProtectedRoute><ReceiptEditPage /></ProtectedRoute>} />
                <Route path="/receipts/:receiptId/pdf" element={<ProtectedRoute><ReceiptPdfPage /></ProtectedRoute>} />
                <Route path="/receipts/:receiptId/invoices" element={<ProtectedRoute><GeneratedInvoicesPage /></ProtectedRoute>} />
                <Route path="/receipts/generate-invoices" element={<ProtectedRoute><GenerateInvoicesWizardPage /></ProtectedRoute>} />
                <Route path="/enrollments/:enrollmentId/cancel" element={<ProtectedRoute><EnrollmentCancellationPage /></ProtectedRoute>} />

                <Route path="/financial/billing/invoices" element={<ProtectedRoute><InvoicesListPage /></ProtectedRoute>} />
                <Route path="/invoices/:invoiceId/pdf" element={<ProtectedRoute><InvoicePdfPage /></ProtectedRoute>} />
                <Route path="/invoices/:invoiceId/payments" element={<ProtectedRoute><InvoicePaymentsPage /></ProtectedRoute>} />
                <Route path="/financial/billing/proformas" element={<ProtectedRoute><ProformaInvoicesPage /></ProtectedRoute>} />
                <Route path="/financial/billing/quotes" element={<ProtectedRoute><QuotesPage /></ProtectedRoute>} />
                <Route path="/financial/billing/clients" element={<ProtectedRoute><BillingClientsPage /></ProtectedRoute>} />
                <Route path="/financial/billing/doc-types" element={<ProtectedRoute><DocumentTypesPage /></ProtectedRoute>} />
                <Route path="/financial/billing/concepts" element={<ProtectedRoute><DefaultConceptsPage /></ProtectedRoute>} />
                <Route path="/financial/models" element={<ProtectedRoute><FiscalModelsPage /></ProtectedRoute>} />
                <Route path="/financial/ledger" element={<ProtectedRoute><AccountingLedgerPage /></ProtectedRoute>} />
                <Route path="/financial/billing/centers" element={<ProtectedRoute><BillingCentersPage /></ProtectedRoute>} />
                <Route path="/financial/billing/centers/new" element={<ProtectedRoute><BillingCenterEditPage /></ProtectedRoute>} />
                <Route path="/financial/billing/centers/:centerId" element={<ProtectedRoute><BillingCenterEditPage /></ProtectedRoute>} />
                <Route path="/financial/billing/centers/:centerId/accounts" element={<ProtectedRoute><BillingCenterEditPage /></ProtectedRoute>} />
                <Route path="/financial/billing/centers/:centerId/series" element={<ProtectedRoute><BillingCenterEditPage /></ProtectedRoute>} />
                <Route path="/financial/billing/centers/:centerId/methods" element={<ProtectedRoute><BillingCenterEditPage /></ProtectedRoute>} />
                <Route path="/financial/config" element={<ProtectedRoute><FiscalConfigPage /></ProtectedRoute>} />

                {/* Wiki */}
                <Route path="/wiki" element={<Navigate to="/wiki/home" replace />} />
                <Route path="/wiki/home" element={<ProtectedRoute><WikiHomePage /></ProtectedRoute>} />
                <Route path="/wiki/category/:categoryId" element={<ProtectedRoute><WikiCategoryPage /></ProtectedRoute>} />
                <Route path="/wiki/class/:classId" element={<ProtectedRoute><WikiClassPage /></ProtectedRoute>} />
                <Route path="/wiki/lesson/:lessonId" element={<ProtectedRoute><WikiLessonViewPage /></ProtectedRoute>} />
                <Route path="/wiki/editor" element={<ProtectedRoute><WikiLessonEditorPage /></ProtectedRoute>} />
                <Route path="/wiki/editor/:lessonId" element={<ProtectedRoute><WikiLessonEditorPage /></ProtectedRoute>} />
                <Route path="/wiki/sessions" element={<ProtectedRoute><WikiSessionsPage /></ProtectedRoute>} />
                <Route path="/wiki/permissions" element={<ProtectedRoute><WikiPermissionsPage /></ProtectedRoute>} />

                {/* Communications */}
                <Route path="/communications/send" element={<ProtectedRoute><ComposeEmailPage /></ProtectedRoute>} />
                <Route path="/communications/outbox" element={<ProtectedRoute><SentEmailsPage /></ProtectedRoute>} />
                <Route path="/communications/templates" element={<ProtectedRoute><EmailTemplatesPage /></ProtectedRoute>} />
                <Route path="/communications/config" element={<ProtectedRoute><EmailConfigPage /></ProtectedRoute>} />

                {/* Aux Tables & Admin */}
                <Route path="/aux-tables/populations" element={<ProtectedRoute><PopulationsPage /></ProtectedRoute>} />
                <Route path="/aux-tables/locations" element={<ProtectedRoute><LocationsPage /></ProtectedRoute>} />
                <Route path="/aux-tables/classrooms" element={<ProtectedRoute><ClassroomsPage /></ProtectedRoute>} />
                <Route path="/aux-tables/classrooms/:classroomId/courses" element={<ProtectedRoute><ClassroomCoursesPage /></ProtectedRoute>} />
                <Route path="/aux-tables/week-schedules" element={<ProtectedRoute><WeekSchedulesPage /></ProtectedRoute>} />
                <Route path="/aux-tables/holidays" element={<ProtectedRoute><HolidaysPage /></ProtectedRoute>} />
                
                <Route path="/doc-config/preview" element={<ProtectedRoute><DocumentPreviewPage /></ProtectedRoute>} />
                <Route path="/doc-config/sections" element={<ProtectedRoute><DocumentSectionsPage /></ProtectedRoute>} />
                <Route path="/doc-config/texts" element={<ProtectedRoute><AcademyTextsPage /></ProtectedRoute>} />
                <Route path="/doc-config/auth-groups" element={<ProtectedRoute><AuthorizationGroupsPage /></ProtectedRoute>} />
                <Route path="/doc-config/auth-groups/:groupId" element={<ProtectedRoute><GroupAuthorizationsPage /></ProtectedRoute>} />
                <Route path="/doc-config/authorizations/:authId/edit" element={<ProtectedRoute><AuthorizationEditPage /></ProtectedRoute>} />
                <Route path="/doc-config/authorizations/new/:groupId" element={<ProtectedRoute><AuthorizationEditPage /></ProtectedRoute>} />
                <Route path="/authorizations/view/:studentAuthId" element={<ProtectedRoute><SignedDocumentPreviewPage /></ProtectedRoute>} />
                <Route path="/center-management/signable-docs" element={<ProtectedRoute><SignableDocumentsPage /></ProtectedRoute>} />
                <Route path="/center-management/all-authorizations" element={<ProtectedRoute><AllAuthorizationsPage /></ProtectedRoute>} />

                <Route path="/grade-reports/reports" element={<ProtectedRoute><ReportsListPage /></ProtectedRoute>} />
                <Route path="/grade-reports/predefined-comments" element={<ProtectedRoute><PredefinedCommentsPage /></ProtectedRoute>} />
                <Route path="/grade-reports/comment-tags" element={<ProtectedRoute><CommentTagsPage /></ProtectedRoute>} />

                <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
                <Route path="/admin/logs" element={<ProtectedRoute><AdminLogsPage /></ProtectedRoute>} />
                <Route path="/admin/database" element={<ProtectedRoute><BaaSConfigPage /></ProtectedRoute>} />
                <Route path="/admin/file-manager" element={<ProtectedRoute><FileManagerPage /></ProtectedRoute>} />
                <Route path="/technical-docs" element={<ProtectedRoute><TechnicalDocsPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </AuthProvider>
          </NavigationHistoryProvider>
        </DataProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;