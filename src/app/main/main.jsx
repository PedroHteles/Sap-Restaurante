import React, { useState, useEffect } from 'react';
import { ref, query, onValue, orderByChild, } from "firebase/database";
import OrderForm from '@/app/components/OrderForm/OrderForm';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import MainContainer from '@/app/components/MainContainer/MainContainer';
import OrderItem from '@/app/components/OrderItem/OrderItem';
import { useFirebase } from '@/app/contexts/FirebaseContext/FirebaseContext';
import { appId } from '@/app/contexts/FirebaseContext/FirebaseContext';
import ButtonNewPedido from '@/app/components/ButtonNewPedido/ButtonNewPedido';
import EmptyState from '@/app/components/EmptyState/EmptyState';
import { useAuth } from '@/app/contexts/FirebaseProvider/FirebaseProvider';
import { useLoading } from '@/app/contexts/LoadingProvider/LoadingProvider';
import { useModal } from '@/app/contexts/ModalProvider/ModalProvider';
// Main App Component
function Main() {

  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const { db } = useFirebase();
  const { showLoading, hideLoading } = useLoading();
  const { openModal, closeModal } = useModal();


  useEffect(() => {
    if (!user || !db) {
      if (!user) setOrders([]);
      return;
    }

    showLoading();
    setError(null);

    // Path do Realtime Database
    const ordersRef = ref(db, `artifacts/${appId}/users/${user.uid}/orders`);

    // Criar uma query ordenada pelo campo 'createdAt'
    const ordersQuery = query(ordersRef, orderByChild('createdAt'));

    // Escuta em tempo real dos dados
    onValue(ordersQuery, (snapshot) => {
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

      hideLoading();
      setError(null);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setError(`Erro ao buscar pedidos: ${error.message}. Verifique as regras do Realtime Database.`);
      hideLoading();
    });
  }, [user]);



  const handleOpenNovoPedido = () => {
    openModal({
      title: editingOrder ? 'Editar Pedido' : 'Adicionar Novo Pedido',
      content: (
        <OrderForm
          key={editingOrder ? editingOrder.id : 'new-order-form'}
          userId={user.uid}
          onOrderAdded={() => {
            closeModal(false);
          }}
          existingOrder={editingOrder}
          onOrderUpdated={() => {
            closeModal(false);
            setEditingOrder(null);
          }}
          onCancelEdit={() => {
            closeModal(false);
            setEditingOrder(null);
          }}
        />
      )
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <MainContainer>
        {error && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-6 shadow">{error}</p>}
        <div className="mb-6 text-center sm:text-right">
          <ButtonNewPedido onClick={handleOpenNovoPedido}>
            Novo Pedido
          </ButtonNewPedido>
        </div>

        {!orders.length && (
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
                onEditOrder={(order) => {
                  setEditingOrder(order);
                  handleOpenNovoPedido()
                }}
              />
            ))}
          </div>
        )}
        <Footer />
      </MainContainer>
    </div>
  );
}

export default Main;