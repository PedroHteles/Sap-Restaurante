import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/contexts/FirebaseProvider/FirebaseProvider';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user || !user.isAdmin) {
        return <Navigate to="/" />;
    }

    return children;
};

export default AdminRoute;
