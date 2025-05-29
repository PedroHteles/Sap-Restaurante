import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { ref, query, onValue, orderByChild, off, } from "firebase/database";
import OrderForm from '@/app/components/OrderForm/OrderForm';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import MainContainer from '@/app/components/MainContainer/MainContainer';
import LoginScreen from '@/app/components/LoginScreen/LoginScreen';
import OrderItem from '@/app/components/OrderItem/OrderItem';
import { formatCurrency } from '@/core/formatCurrency/formatCurrency';
import { formatDate } from '@/core/formatDate/formatDate';
import Modal from '@/app/components/Modal/Modal';
import { useFirebase } from '@/app/contexts/FirebaseContext/FirebaseContext';
import { appId } from '@/app/contexts/FirebaseContext/FirebaseContext';
import ButtonNewPedido from '@/app/components/ButtonNewPedido/ButtonNewPedido';
import EmptyState from '@/app/components/EmptyState/EmptyState';
import { useAuth } from '@/app/contexts/FirebaseProvider/FirebaseProvider';
// Main App Component
function Main() {

  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const { auth, db } = useFirebase();


  useEffect(() => {
    if (!user || !db) {
      if (!user) setOrders([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Path do Realtime Database
    const ordersRef = ref(db, `artifacts/${appId}/users/${user.uid}/orders`);

    // Criar uma query ordenada pelo campo 'createdAt'
    const ordersQuery = query(ordersRef, orderByChild('createdAt'));

    // Escuta em tempo real dos dados
    const unsubscribe = onValue(ordersQuery, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        // Transformar o objeto de ordens em array ordenado pelo createdAt desc
        const ordersArray = Object.entries(data)
          .map(([id, value]) => ({ id, ...value }))
          // Ordena manualmente do mais novo para o mais antigo (desc)
          .sort((a, b) => b.createdAt - a.createdAt);

        setOrders(ordersArray);
      } else {
        setOrders([]);
      }

      setIsLoading(false);
      setError(null);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setError(`Erro ao buscar pedidos: ${error.message}. Verifique as regras do Realtime Database.`);
      setIsLoading(false);
    });

    // Cleanup da escuta
    return () => off(ordersQuery, onValueCallback);

  }, [user]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      setIsLoading(true);
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
      setError(`Erro ao fazer logout: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddOrderModal = () => {
    setEditingOrder(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditOrderModal = (order) => {
    setEditingOrder(order);
    setIsFormModalOpen(true);
  };

  const handleFormModalClose = () => {
    setIsFormModalOpen(false);
    setEditingOrder(null);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!user || !db) {
      console.error("User not authenticated or DB not initialized for status update.");
      setError("Não é possível atualizar o status: usuário ou banco de dados não disponível.");
      return;
    }
    const orderRef = doc(db, `artifacts/${appId}/users/${user.uid}/orders`, orderId);
    try {
      await updateDoc(orderRef, { status: newStatus });
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(`Erro ao atualizar status do pedido: ${err.message}`);
      throw err;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="mt-4 text-lg text-gray-700">Carregando autenticação...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginScreen
        auth={auth}
        appId={appId}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} handleLogout={handleLogout} isLoading={isLoading} />
      <MainContainer>
        {error && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-6 shadow">{error}</p>}
        <div className="mb-6 text-center sm:text-right">
          <ButtonNewPedido onClick={handleOpenAddOrderModal}>
            Novo Pedido
          </ButtonNewPedido>
        </div>
        <Modal
          isOpen={isFormModalOpen}
          onClose={handleFormModalClose}
          title={editingOrder ? "Editar Pedido" : "Adicionar Novo Pedido"}
        >
          <OrderForm
            key={editingOrder ? editingOrder.id : 'new-order-form'}
            userId={user.uid}
            onOrderAdded={() => {
              setIsFormModalOpen(false);
            }}
            existingOrder={editingOrder}
            onOrderUpdated={() => {
              setIsFormModalOpen(false);
              setEditingOrder(null);
            }}
            onCancelEdit={() => {
              setIsFormModalOpen(false);
              setEditingOrder(null);
            }}
            formatCurrency={formatCurrency}
          />
        </Modal>

        {isLoading && !orders.length && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Carregando pedidos...</p>
          </div>
        )}

        {!isLoading && !orders.length && (
          <EmptyState
            title="Nenhum pedido encontrado"
            message="Adicione um novo pedido para uma mesa."
          />
        )}
        {orders.length > 0 && (
          <div className="space-y-6">
            {orders.map(order => (
              <OrderItem
                key={order.id}
                order={order}
                userId={user.uid}
                onUpdateStatus={updateOrderStatus}
                onEditOrder={handleOpenEditOrderModal}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
        <Footer user={user} />
      </MainContainer>
    </div>
  );
}

export default Main;

