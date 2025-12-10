import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import { Printer, ArrowLeft, Rocket } from 'lucide-react';
import { Course, Student } from '../types';

const StudentRegistrationSheetPage = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { students, courses, enrollments } = useData();

    const student = students.find(s => s.id === parseInt(studentId || '0'));
    
    const studentCourses = enrollments
      .filter(e => e.studentId === student?.id && e.isActive)
      .map(e => courses.find(c => c.id === e.courseId))
      .filter((c): c is Course => c !== undefined);

    if (!student) {
      return (
          <div className="p-8 text-center text-lg">
              <p>Alumno no encontrado.</p>
              <Button onClick={() => navigate(-1)} className="mt-4">Volver</Button>
          </div>
      );
    }
    
    const handlePrint = () => {
      window.print();
    }

    const SheetSection = ({ title, children }: { title: string, children?: React.ReactNode }) => (
      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b-2 border-gray-700 pb-1 mb-4">{title}</h2>
        <div className="grid grid-cols-3 gap-x-8 gap-y-2 text-sm">{children}</div>
      </div>
    );

    const SheetField = ({ label, value, colSpan = 1 }: { label: string, value: React.ReactNode, colSpan?: number }) => (
      <div style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}>
        <span className="font-semibold text-gray-600">{label}:</span>
        <span className="ml-2 text-gray-800">{value || 'N/A'}</span>
      </div>
    );

    return (
      <div className="bg-gray-100 dark:bg-gray-900 p-4 sm:p-8 print:bg-white">
        <div className="mb-6 flex gap-4 print:hidden">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={16}/>} onClick={() => navigate(-1)}>Volver</Button>
          <Button size="sm" leftIcon={<Printer size={16}/>} onClick={handlePrint}>Guardar PDF</Button>
        </div>
        
        <div id="registration-sheet" className="bg-white p-8 sm:p-12 shadow-lg max-w-4xl mx-auto font-sans">
          <header className="text-center mb-12">
            <div className="flex justify-center items-center gap-2 text-3xl font-bold text-gray-800 mb-2">
              <Rocket className="text-primary-500" />
              <span>EduBeta</span>
            </div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-gray-700">Hoja de Matrícula</h1>
          </header>

          <main>
            <SheetSection title="Datos Alumno/a">
              <SheetField label="Nombre" value={`${student.firstName} ${student.lastName}`} colSpan={2} />
              <SheetField label="Fecha de nacimiento" value={new Date(student.birthDate).toLocaleDateString('es-ES')} />
              <SheetField label="DNI" value={student.dni} />
              <SheetField label="Dirección" value={student.address} colSpan={2} />
              <SheetField label="CP" value={student.postalCode} />
              <SheetField label="Población" value={student.population} colSpan={2} />
              {student.tutors?.[0]?.fullName && <SheetField label="Tutor/a 1" value={student.tutors[0].fullName} colSpan={3} />}
              {student.tutors?.[1]?.fullName && <SheetField label="Tutor/a 2" value={student.tutors[1].fullName} colSpan={3} />}
              <SheetField label="Teléfono 1" value={student.phone1} />
              {student.phone2 && <SheetField label="Teléfono 2" value={student.phone2} />}
              <SheetField label="E-mail 1" value={student.email1} colSpan={2}/>
              {student.allergies && <SheetField label="Enfermedades - alergias" value={student.allergies} colSpan={3} />}
            </SheetSection>
            
            <SheetSection title="Configuración de Pagos">
              <SheetField label="Pago de material / matrícula" value={student.paymentConfig.type} />
              <SheetField label="Periodicidad de pago" value={student.paymentConfig.periodicity} />
              <SheetField label="Titular cuenta" value={student.domiciliationData?.accountHolder} colSpan={2}/>
              <SheetField label="IBAN" value={student.domiciliationData?.iban} colSpan={2}/>
              <SheetField label="BIC" value={student.domiciliationData?.bic} />
            </SheetSection>

            <SheetSection title="Cursos Activos">
              <div className="col-span-3">
                <ul className="list-disc list-inside space-y-1">
                  {studentCourses.map(course => (
                    <li key={course.id} className="text-sm text-gray-800">{course.name}</li>
                  ))}
                  {studentCourses.length === 0 && <li className="text-sm text-gray-500">No está inscrito en cursos activos.</li>}
                </ul>
              </div>
            </SheetSection>
          </main>
        </div>
        
        <style>{`
          @page {
            size: A4 landscape;
            margin: 1.5cm;
          }
          @media print {
            body {
              background-color: #fff !important;
            }
            #root > div > div > main {
              padding: 0 !important;
            }
            #registration-sheet {
              box-shadow: none !important;
              margin: 0 !important;
              max-width: 100% !important;
              padding: 0 !important;
              border: none !important;
            }
          }
        `}</style>
      </div>
    );
  }

  export default StudentRegistrationSheetPage;
