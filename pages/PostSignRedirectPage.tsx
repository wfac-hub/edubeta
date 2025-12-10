
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import { Printer, Clock } from 'lucide-react';
import DynamicDocument from '../components/documents/DynamicDocument';

const PostSignRedirectPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { students, studentAuthorizations, academyProfile } = useData();

    const { student, studentAuth } = useMemo(() => {
        if (!token) return { student: null, studentAuth: null };
        
        const sa = studentAuthorizations.find(s => s.postSignToken === token);
        if (!sa) return { student: null, studentAuth: null };

        const stud = students.find(s => s.id === sa.studentId);
        
        // Check expiry
        if (sa.postSignTokenExpires && new Date(sa.postSignTokenExpires) < new Date()) {
            return { student: null, studentAuth: 'expired' as any };
        }
        
        return { student: stud, studentAuth: sa };
    }, [token, studentAuthorizations, students]);

    const handlePrint = () => window.print();
    
    const SignatureFooter = () => {
        if (!studentAuth || typeof studentAuth === 'string') return null;
        return (
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
    }
    
    if (!student || !studentAuth) {
        return (
            <div className="bg-gray-100 min-h-screen p-4 sm:p-8 flex items-center justify-center">
                <div className="text-center p-12 bg-white shadow-lg rounded-lg">
                    <Clock className="text-red-500 w-16 h-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">Enlace inválido o expirado</h2>
                    <p className="mt-2 text-gray-600">Este enlace para ver el documento firmado solo era válido durante una hora.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 sm:p-8 print:bg-white">
            <div className="mb-6 flex flex-wrap gap-4 print:hidden items-center">
              <Button size="sm" leftIcon={<Printer size={16}/>} onClick={handlePrint}>Imprimir / Guardar PDF</Button>
              <Button variant="danger" size="sm" onClick={() => navigate('/')}>
                Volver a inicio (ELIMINAR EN PRODUCCIÓN)
              </Button>
              <div className="text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-md flex items-center gap-2">
                <Clock size={16}/>
                Este enlace caducará en menos de una hora. Guarda una copia si la necesitas.
              </div>
            </div>
            
            <div id="document-container" className="bg-white p-8 sm:p-12 shadow-lg max-w-4xl mx-auto font-sans">
                <DynamicDocument student={student} signatureSection={<SignatureFooter />} />
            </div>
            
            <style>{`
                @page { size: A4; margin: 2cm; }
                @media print {
                    html, body { background-color: #fff !important; }
                    .print\\:hidden { display: none !important; }
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

export default PostSignRedirectPage;
