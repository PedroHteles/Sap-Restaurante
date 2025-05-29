import { LogOutIcon } from 'lucide-react';

export default function Header({ user, handleLogout, isLoading }) {
    console.log(user)
    return (
        <header className="bg-indigo-700 text-white shadow-md">
            <div className="flex justify-between items-center px-4 py-3">
                <h1 className="text-xl font-bold">Gestão</h1>
                <div className="flex items-center space-x-3">
                    <span className="text-sm">{user.displayName || user.email}</span>
                    <button
                        onClick={handleLogout}
                        disabled={isLoading}
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
