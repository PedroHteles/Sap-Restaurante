import { useAuth } from '@/app/contexts/FirebaseProvider/FirebaseProvider';
import LoginScreen from '@/app/components/LoginScreen/LoginScreen';
import { useFirebase } from '@/app/contexts/FirebaseContext/FirebaseContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const { auth, appId } = useFirebase();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <LoginScreen auth={auth} appId={appId} />;
    }

    return children;
};

export default ProtectedRoute;
