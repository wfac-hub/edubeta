




import React from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigationHistory } from '../contexts/NavigationHistoryContext';
import DynamicDocument from '../components/documents/DynamicDocument';

const SignedDocumentPreviewPage = () => {
    const { studentAuthId } = useParams();
    const { goBack } = useNavigationHistory();
    const { students, studentAuthorizations, authorizations, academyProfile } = useData();

    const studentAuth = studentAuthorizations.find(sa => sa.id === studentAuthId);
    const student = students.find(s => s.id === studentAuth?.studentId);
    const authorization = authorizations.find(a => a.id === studentAuth?.authorizationId);

    if (!student || !authorization || !studentAuth || !studentAuth.signatureDate) {
      return (
          <div className="p-8 text-center text-lg">
              <p>Documento firmado no encontrado o inválido.</p>
              <Button onClick={goBack} className="mt-4">Volver</Button>
          </div>
      );
    }
    
    const handlePrint = () => {
      window.print();
    }
    
    const SignatureFooter = () => (
        <footer className="mt-16 text-sm break-inside-avoid">
            <div className="grid grid-cols-2 gap-8 items-end">
                <div className="w-full h-24 flex items-center justify-center text-gray-500 [&>svg]:h-full [&>svg]:w-auto [&>svg]:max-w-full [&>svg]:mx-auto">
                    {studentAuth.signatureSvg ? (
                         <div className="h-full w-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: studentAuth.signatureSvg }} />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">FIRMA NO DISPONIBLE</div>
                    )}
                </div>
                <div>
                    <p className="border-b border-dotted border-gray-400 pb-1">Nombre: {studentAuth.signerName}</p>
                    <p className="border-b border-dotted border-gray-400 pb-1 mt-2">DNI: {studentAuth.signerNif}</p>
                    <p className="mt-2 text-xs">Firmado en {academyProfile.population}, {new Date(studentAuth.signatureDate!).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>
        </footer>
    );

    return (
        <div className="bg-gray-100 dark:bg-gray-900 -m-4 sm:-m-8 p-4 sm:p-8 print:bg-white">
            <div className="mb-6 flex flex-wrap gap-4 print:hidden">
                <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={16}/>} onClick={goBack}>Volver</Button>
                <Button size="sm" leftIcon={<Printer size={16}/>} onClick={handlePrint}>Imprimir</Button>
            </div>
            
            <div id="document-container" className="bg-white p-8 sm:p-12 shadow-lg max-w-4xl mx-auto font-sans">
                <DynamicDocument student={student} signatureSection={<SignatureFooter />} studentAuth={studentAuth} />
            </div>
            
            <style>{`
                @page { size: A4; margin: 2cm; }
                @media print {
                    html, body { background-color: #fff !important; }
                    .print\\:hidden { display: none !important; }
                    #root > div > div > main { padding: 0 !important; }
                    .bg-gray-100 { background-color: #fff !important; }
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

export default SignedDocumentPreviewPage;
