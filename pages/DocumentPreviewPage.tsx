




import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import { Printer, ArrowLeft } from 'lucide-react';
import { Student } from '../types';
import DynamicDocument from '../components/documents/DynamicDocument';

const DocumentPreviewPage = () => {
    const navigate = useNavigate();
    const { students, academyProfile } = useData();

    const student: Student | undefined = students[0];

    if (!student || Object.keys(student).length === 0) {
      return (
          <div className="p-8 text-center text-lg">
              <p>No hay alumnos para generar una previsualización.</p>
              <Button onClick={() => navigate(-1)} className="mt-4">Volver</Button>
          </div>
      );
    }
    
    const handlePrint = () => {
      window.print();
    }

    const SignatureFooterPlaceholder: React.FC<{ name?: string, nif?: string }> = ({ name, nif }) => {
        const today = new Date();
        const signatureDate = `Firmado en ${academyProfile.population}, ${today.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
        
        return (
            <footer className="mt-16 text-sm break-inside-avoid">
                <div className="grid grid-cols-2 gap-8 items-end">
                    <div className="w-full h-24 bg-gray-200 flex items-center justify-center text-gray-500">SE SUSTITUIRÁ POR LA FIRMA</div>
                    <div>
                        <p className="border-b border-dotted border-gray-400 pb-1">Nombre: {name || `${student.firstName} ${student.lastName}`}</p>
                        <p className="border-b border-dotted border-gray-400 pb-1 mt-2">DNI: {nif || student.dni}</p>
                        <p className="mt-2 text-xs">{signatureDate}</p>
                    </div>
                </div>
            </footer>
        );
    };

    return (
      <div className="bg-gray-100 dark:bg-gray-900 -m-4 sm:-m-8 p-4 sm:p-8 print:bg-white">
        <div className="mb-6 flex flex-wrap gap-4 print:hidden">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={16}/>} onClick={() => navigate(-1)}>Volver</Button>
          <Button size="sm" leftIcon={<Printer size={16}/>} onClick={handlePrint}>Imprimir</Button>
        </div>
        
        <div id="document-container" className="bg-white p-8 sm:p-12 shadow-lg max-w-4xl mx-auto font-sans text-gray-900">
            <DynamicDocument 
                student={student} 
                signatureSection={<SignatureFooterPlaceholder name={student.tutors?.[0]?.fullName} nif={student.tutors?.[0]?.nif} />}
                studentAuth={undefined}
            />
        </div>
        
        <style>{`
          @page {
            size: A4;
            margin: 2cm;
          }
          @media print {
            html, body {
              background-color: #fff !important;
              font-family: sans-serif;
            }
            #root > div > div > main {
              padding: 0 !important;
            }
            #document-container {
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
  };

  export default DocumentPreviewPage;
