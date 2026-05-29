import { Navigate, Outlet } from 'react-router-dom';
import { isAdminUser } from '../utils/auth';

const ProtectedRoute = ({ adminOnly = false }) => {
    const user = localStorage.getItem('user');
    const parsedUser = (() => {
        if (!user) return null;

        try {
            return JSON.parse(user);
        } catch {
            return null;
        }
    })();

    if (!parsedUser) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdminUser(parsedUser)) {
        return <Navigate to="/comics" replace />;
    }
    
    return <Outlet />;
};

export default ProtectedRoute;
