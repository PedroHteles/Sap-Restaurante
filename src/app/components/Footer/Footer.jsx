import { appId } from "@/app/contexts/FirebaseContext/FirebaseContext";

export default function Footer({ user }) {
    return (
        <footer className="text-center py-6 text-sm text-gray-500">
            <p>
                App ID: <span className="font-mono">{appId}</span>
            </p>
            {user && (
                <p>
                    User ID: <span className="font-mono">{user.uid}</span>
                </p>
            )}
            <p>&copy; {new Date().getFullYear()} Gestão de Pedidos App - Restaurante.</p>
        </footer>
    );
}
