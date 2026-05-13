import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import routes from '../../routes';
import { Loader2 } from 'lucide-react';

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { verifyUser } = useAuth(); // We'll add this to AuthContext

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            // Verify user and redirect
            verifyUser().then(() => {
                navigate(routes.dashboard, { replace: true, state: { message: 'Successfully logged in with social account!' } });
            });
        } else {
            navigate(routes.auth.login, { replace: true });
        }
    }, [searchParams, navigate, verifyUser]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
            <Loader2 className="animate-spin text-cyan-400 mb-4" size={40} />
            <p className="text-gray-400 font-medium">Finalizing your login...</p>
        </div>
    );
};

export default AuthSuccess;
