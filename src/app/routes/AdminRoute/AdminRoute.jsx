import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/contexts/FirebaseProvider/FirebaseProvider';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <p>Carregando...</p>;

    if (!user || !user.isAdmin) {
        // 🔒 Se não é admin, redireciona
        return <Navigate to="/" />;
    }

    // ✅ Se for admin, renderiza os filhos
    return children;
};

export default AdminRoute;
