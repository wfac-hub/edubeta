
import React, { useMemo } from 'react';
import { useParams, useNavigate, useLocation, NavLink, Outlet } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';
import { MoveLeft, Save } from 'lucide-react';
import BillingCenterForm from '../../components/forms/BillingCenterForm';
import BillingCenterSeriesPage from './BillingCenterSeriesPage';
import BillingCenterAccountsPage from './BillingCenterAccountsPage';
import BillingCenterPaymentMethodsPage from './BillingCenterPaymentMethodsPage';

const BillingCenterEditPage = () => {
    const { centerId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { billingCenters, updateBillingCenter } = useData();

    const isNew = centerId === 'new';
    const center = useMemo(() => 
        isNew 
        ? { id: 0, name: '', nif: '', irpfPercent: 0, ivaPercent: 21, isFacturaE: false, isActive: true, bankAccountCount: 0, seriesCount: 0, paymentMethodCount: 0 } 
        : billingCenters.find(c => c.id === parseInt(centerId || '0')), 
    [billingCenters, centerId, isNew]);

    if (!center && !isNew) return <div>Centro no encontrado</div>;

    // Determine active tab based on current path if using sub-routes, or state
    const currentPath = location.pathname;
    
    const renderContent = () => {
        if (currentPath.endsWith('/series')) return <BillingCenterSeriesPage center={center!} />;
        if (currentPath.endsWith('/accounts')) return <BillingCenterAccountsPage center={center!} />;
        if (currentPath.endsWith('/methods')) return <BillingCenterPaymentMethodsPage center={center!} />;
        return <BillingCenterForm center={center!} onSave={(updated) => { updateBillingCenter(updated); navigate('/financial/billing/centers'); }} />;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {isNew ? 'Alta de centro de facturación' : `Editar: ${center?.name}`}
                </h1>
                <Button variant="secondary" size="sm" leftIcon={<MoveLeft size={16} />} onClick={() => navigate('/financial/billing/centers')}>
                    Volver
                </Button>
            </div>

            {/* Tabs */}
            {!isNew && (
                <div className="border-b border-gray-200 dark:border-slate-700 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <NavLink 
                            to={`/financial/billing/centers/${centerId}`}
                            end
                            className={({ isActive }) => 
                                `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${isActive 
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`
                            }
                        >
                            Datos generales
                        </NavLink>
                         <NavLink 
                            to={`/financial/billing/centers/${centerId}/accounts`}
                            className={({ isActive }) => 
                                `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${isActive 
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`
                            }
                        >
                            Cuentas bancarias
                        </NavLink>
                        <NavLink 
                            to={`/financial/billing/centers/${centerId}/series`}
                            className={({ isActive }) => 
                                `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${isActive 
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`
                            }
                        >
                            Series de facturación
                        </NavLink>
                        <NavLink 
                            to={`/financial/billing/centers/${centerId}/methods`}
                            className={({ isActive }) => 
                                `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${isActive 
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`
                            }
                        >
                            Métodos de pago
                        </NavLink>
                    </nav>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                {renderContent()}
            </div>
        </div>
    );
};

export default BillingCenterEditPage;
