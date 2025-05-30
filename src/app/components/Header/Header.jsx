import { LogOutIcon } from 'lucide-react';
import { useAuth } from '@/app/contexts/FirebaseProvider/FirebaseProvider';
import { useFirebase } from '@/app/contexts/FirebaseContext/FirebaseContext';
import { useLoading } from '@/app/contexts/LoadingProvider/LoadingProvider';
import { signOut } from 'firebase/auth';

export default function Header() {
    const { user } = useAuth();
    const { auth, db } = useFirebase();
    const { showLoading, hideLoading } = useLoading();

    const handleLogout = async () => {
        if (!auth) return;
        try {
            showLoading();
            await signOut(auth);
        } catch (err) {
            console.error("Logout error:", err);
            setError(`Erro ao fazer logout: ${err.message}`);
        } finally {
            hideLoading();
        }
    };

    return (
        <header className="bg-indigo-700 text-white shadow-md">
            <div className="flex justify-between items-center px-4 py-3">
                <h1 className="text-xl font-bold">Gestão</h1>
                <div className="flex items-center space-x-3">
                    <span className="text-sm">{user.displayName || user.email}</span>
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-70"
                        title="Sair"
                    >
                        <LogOutIcon size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}
