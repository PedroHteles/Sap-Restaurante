import React, { createContext, useContext, useEffect, useState } from 'react';
import { ref, onValue, query, orderByChild, remove, update } from 'firebase/database';
import { useAuth } from '@/app/contexts/FirebaseProvider/FirebaseProvider';
import { useLoading } from '@/app/contexts/LoadingProvider/LoadingProvider';
import { useFirebase } from '@/app/contexts/FirebaseContext/FirebaseContext';
import { appId } from '@/app/contexts/FirebaseContext/FirebaseContext';

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
    const { db } = useFirebase();
    const { user } = useAuth();
    const { showLoading, hideLoading } = useLoading();

    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user || !db) {
            setOrders([]);
            return;
        }

        showLoading();
        setError(null);

        const ordersRef = ref(db, `artifacts/${appId}/users/${user.uid}/orders`);
        const ordersQuery = query(ordersRef, orderByChild('createdAt'));

        const unsubscribe = onValue(ordersQuery, (snapshot) => {
            const data = snapshot.val();
            console.log(data)

            if (data) {
                const ordersArray = Object.entries(data)
                    .map(([id, value]) => ({ id, ...value }))
                    .sort((a, b) => b.createdAt - a.createdAt);

                console.log(ordersArray)
                setOrders(ordersArray);
            } else {
                setOrders([]);
            }

            setError(null);
            hideLoading();
        }, (error) => {
            console.error("Error fetching orders:", error);
            setError(`Erro ao buscar pedidos: ${error.message}`);
            hideLoading();
        });

        return () => unsubscribe();
    }, [user, db, appId]);


    const deleteOrder = async (orderId) => {
        if (!user?.uid || !db) {
            console.error("User not authenticated or DB not initialized for delete operation.");
            setError("Não é possível excluir o pedido: usuário ou banco de dados não disponível.");
            return;
        }

        const orderRef = ref(db, `artifacts/${appId}/users/${user.uid}/orders/${orderId}`);

        try {
            await remove(orderRef);
        } catch (err) {
            console.error("Error deleting order:", err);
            setError(`Erro ao excluir pedido: ${err.message}`);
        }
    };


    const onUpdateStatus = async (orderId, newStatus) => {
        if (!user || !db) {
            console.error("User not authenticated or DB not initialized for status update.");
            setError("Não é possível atualizar o status: usuário ou banco de dados não disponível.");
            return;
        }

        const orderPath = `artifacts/${appId}/users/${user.uid}/orders/${orderId}`;
        const orderRef = ref(db, orderPath);

        try {
            await update(orderRef, {
                status: newStatus,
                updatedAt: Date.now(), // ou serverTimestamp() se quiser consistência de servidor
            });
        } catch (err) {
            console.error("Error updating order status:", err);
            setError(`Erro ao atualizar status do pedido: ${err.message}`);
            throw err;
        }
    };




    return (
        <OrdersContext.Provider value={{ orders, error, deleteOrder, onUpdateStatus }}>
            {children}
        </OrdersContext.Provider>
    );
};




export const useOrders = () => {
    const context = useContext(OrdersContext);
    if (!context) {
        throw new Error('useOrders deve ser usado dentro de um OrdersProvider');
    }
    return context;
};
