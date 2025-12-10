import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import Button from '../components/ui/Button';
import { ROLES } from '../constants';
import { Rocket } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: Role) => {
    login(role);
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <div className="text-center">
            <div className="flex justify-center items-center mb-4">
                <Rocket className="text-primary-600 dark:text-primary-400" size={48} />
            </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Bienvenido a EduBeta</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Seleccione un rol para iniciar sesión (simulación)
          </p>
        </div>
        <div className="space-y-4">
            {ROLES.map((role) => (
                <Button 
                    key={role}
                    onClick={() => handleLogin(role)}
                    variant="secondary"
                    className="w-full"
                >
                    Ingresar como {role}
                </Button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;