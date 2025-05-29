import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { useFirebase } from '@/app/contexts/FirebaseContext/FirebaseContext';

// 🔥 Cria o contexto
const AuthContext = createContext(null);

// 🚀 Provider
export const AuthProvider = ({ children }) => {
    const { auth, db } = useFirebase();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // 🔍 Busca no Realtime Database se o usuário é admin
                    const userRef = ref(db, `users/${firebaseUser.uid}`);
                    const snapshot = await get(userRef);

                    const isAdmin = snapshot.exists() ? snapshot.val().isAdmin : false;

                    setUser({
                        uid: firebaseUser.uid,
                        name: firebaseUser.displayName,
                        email: firebaseUser.email,
                        photoURL: firebaseUser.photoURL,
                        isAdmin: true,
                    });

                } catch (error) {
                    console.error('Erro ao buscar dados do usuário:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [auth, db]);

    const logout = () => signOut(auth);

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 🎯 Hook para usar o contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
