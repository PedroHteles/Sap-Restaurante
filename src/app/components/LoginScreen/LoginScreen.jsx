import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function LoginScreen({ auth, appId }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGoogleLogin = async () => {
        if (!auth) {
            setError('Firebase Auth não está pronto.');
            return;
        }
        const provider = new GoogleAuthProvider();
        try {
            setIsLoading(true);
            await signInWithPopup(auth, provider);
            setError(null);
        } catch (err) {
            console.error('Google login error:', err);
            setError(`Erro ao fazer login com Google: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white">
            <div className="text-center bg-white bg-opacity-20 backdrop-blur-md p-8 md:p-12 rounded-xl shadow-2xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Teste 1</h1>
                <p className="text-lg md:text-xl mb-8">
                    Acesse para gerenciar os pedidos das mesas.
                </p>

                {isLoading && (
                    <div className="flex justify-center items-center my-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        <p className="ml-3">Processando...</p>
                    </div>
                )}

                {error && (
                    <p className="text-red-300 bg-red-800 bg-opacity-50 p-3 rounded-md mb-4">
                        {error}
                    </p>
                )}

                <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full max-w-xs flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white transition-transform transform hover:scale-105 disabled:opacity-50"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fab"
                        data-icon="google"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 488 512"
                    >
                        <path
                            fill="currentColor"
                            d="M488 261.8C488 403.3 391.1 504 248 504C110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                        />
                    </svg>
                    Entrar com Google
                </button>
            </div>

            <footer className="absolute bottom-4 text-center w-full text-indigo-200 text-sm">
                App ID: {appId}
            </footer>
        </div>
    );
}
