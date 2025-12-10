




import React, { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import { Printer, CheckCircle } from 'lucide-react';
import SignaturePad, { SignaturePadRef } from '../components/ui/SignaturePad';
import Modal from '../components/ui/Modal';
import DynamicDocument from '../components/documents/DynamicDocument';

const SignDocumentPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { students, authorizations, studentAuthorizations, academyProfile, signAuthorization } = useData();
    const signaturePadRef = useRef<SignaturePadRef>(null);

    const [signerName, setSignerName] = useState('');
    const [signerNif, setSignerNif] = useState('');
    const [isSigningModalOpen, setIsSigningModalOpen] = useState(false);
    const [step, setStep] = useState<'loading' | 'viewing' | 'success' | 'error'>('loading');
    const [error, setError] = useState('');

    const { student, authorization, studentAuth } = useMemo(() => {
        if (!token) return { student: null, authorization: null, studentAuth: null };
        
        const sa = studentAuthorizations.find(s => s.token === token);
        if (!sa) return { student: null, authorization: null, studentAuth: null };

        const stud = students.find(s => s.id === sa.studentId);
        const authDef = authorizations.find(a => a.id === sa.authorizationId);
        
        return { student: stud, authorization: authDef, studentAuth: sa };
    }, [token, studentAuthorizations, students, authorizations]);

    React.useEffect(() => {
        if (student && authorization && studentAuth) {
            setStep('viewing');
        } else if (token) {
            // Check if it was already signed and is now a post-sign token, but this page shouldn't handle that.
            const alreadySigned = studentAuthorizations.some(sa => sa.token === undefined && sa.postSignToken === token);
            if (!alreadySigned) {
                 setError('El enlace de firma no es válido o ha expirado.');
                 setStep('error');
            }
        }
    }, [student, authorization, studentAuth, token]);

    const handlePrint = () => window.print();

    const handleSignAndSave = () => {
        if (!signerName.trim() || !signerNif.trim() || signaturePadRef.current?.isEmpty()) {
            alert('Por favor, completa tu nombre, DNI y firma.');
            return;
        }
        if (token) {
            const signatureSvg = signaturePadRef.current.getSignatureSvg();
            const postSignToken = signAuthorization(token, signerName, signerNif, signatureSvg);
            if (postSignToken) {
                navigate(`/signed/${postSignToken}`, { replace: true });
            } else {
                 setStep('success'); // Fallback if no postSignToken is returned
            }
            setIsSigningModalOpen(false);
        }
    };

    const renderContent = () => {
        if (step === 'loading') return <div className="p-12 text-center dark:text-gray-200">Cargando documento...</div>;
        if (step === 'error') return <div className="p-12 text-center text-red-600 dark:text-red-400">{error}</div>;
        if (step === 'success') {
            return (
                <div className="p-12 text-center">
                    <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold dark:text-white">¡Documento Firmado!</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Gracias. Tu firma ha sido registrada correctamente.</p>
                </div>
            );
        }

        if (step === 'viewing' && student && studentAuth) {
            return (
                <div id="document-container" className="bg-white p-8 sm:p-12 shadow-lg max-w-4xl mx-auto font-sans">
                    <DynamicDocument student={student} studentAuth={studentAuth} />
                    <footer className="mt-12 text-sm text-center break-before-avoid print:hidden">
                        <p className="text-gray-600">{academyProfile.signatureLegalText}</p>
                        <div className="mt-8 flex justify-center gap-4">
                            <Button variant="secondary" leftIcon={<Printer size={16}/>} onClick={handlePrint}>Imprimir</Button>
                            <Button onClick={() => setIsSigningModalOpen(true)}>Firma</Button>
                        </div>
                    </footer>
                </div>
            );
        }
        return null;
    }

    return (
        <div className="bg-gray-100 dark:bg-slate-900 min-h-screen p-4 sm:p-8 transition-colors duration-200">
            {renderContent()}
            
            <Modal isOpen={isSigningModalOpen} onClose={() => setIsSigningModalOpen(false)} title="Aplicar firma">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Para acabar de cumplimentar el documento, debes informarnos del Nombre y el DNI/NIE de la persona que aplicará la firma. Los valores quedarán rellenados automáticamente allí donde el documento lo requiera.
                    </p>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nombre completo</label>
                        <input 
                            value={signerName} 
                            onChange={e => setSignerName(e.target.value)} 
                            className="w-full p-2 border rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">DNI</label>
                        <input 
                            value={signerNif} 
                            onChange={e => setSignerNif(e.target.value)} 
                            className="w-full p-2 border rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Aplica tu firma</label>
                        <div className="border border-gray-300 dark:border-slate-600 rounded-md overflow-hidden">
                            <SignaturePad ref={signaturePadRef} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Firma dentro del recuadro blanco.</p>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-slate-700">
                        <Button variant="danger" onClick={() => signaturePadRef.current?.clear()}>Limpiar</Button>
                        <Button onClick={handleSignAndSave}>Firmar y guardar</Button>
                    </div>
                </div>
            </Modal>

             <style>{`
                @page { size: A4; margin: 2cm; }
                @media print {
                    html, body { background-color: #fff !important; }
                    .print\\:hidden { display: none !important; }
                    #root > div { padding: 0 !important; }
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

export default SignDocumentPage;
