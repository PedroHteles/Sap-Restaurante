import React, { createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import {
    getDatabase
} from 'firebase/database'; // ✅ Removido setLogLevel

// 🔐 Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB-t3MrghETDc_svNy8xKcwgSo-NTitQyM",
    authDomain: "react-restaurant-d7120.firebaseapp.com",
    projectId: "react-restaurant-d7120",
    storageBucket: "react-restaurant-d7120.appspot.com",
    messagingSenderId: "809681288779",
    appId: "1:809681288779:web:2436567cc829b7c0a617ce",
    measurementId: "G-C3JCX2X42G"
};

// 🚀 Cria o contexto
const FirebaseContext = createContext(null);

export const appId = firebaseConfig.appId; // ✅ Exportando appId

// 🎯 Provider
export const FirebaseProvider = ({ children }) => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getDatabase(app);

    setPersistence(auth, browserLocalPersistence);

    const value = { app, auth, db };

    return (
        <FirebaseContext.Provider value={value}>
            {children}
        </FirebaseContext.Provider>
    );
};

// 🎯 Hook para usar o contexto
export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error('useFirebase deve ser usado dentro de um FirebaseProvider');
    }
    return context;
};
