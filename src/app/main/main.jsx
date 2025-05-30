import React, { useState } from 'react';
import OrderForm from '@/app/components/OrderForm/OrderForm';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import MainContainer from '@/app/components/MainContainer/MainContainer';
import OrderItem from '@/app/components/OrderItem/OrderItem';
import ButtonNewPedido from '@/app/components/ButtonNewPedido/ButtonNewPedido';
import EmptyState from '@/app/components/EmptyState/EmptyState';
import { useAuth } from '@/app/contexts/FirebaseProvider/FirebaseProvider';
import { useModal } from '@/app/contexts/ModalProvider/ModalProvider';
import { useOrders } from '@/app/contexts/OrdersProvider/OrdersProvider';
// Main App Component
function Main() {

  const { user } = useAuth();
  const { openModal, closeModal } = useModal();
  const { orders, error } = useOrders();

  const handleOpenNovoPedido = (order) => {
    openModal({
      title: order ? 'Editar Pedido' : 'Adicionar Novo Pedido',
      content: (
        <OrderForm
          key={order ? order.id : 'new-order-form'}
          userId={user.uid}
          onOrderAdded={() => {
            closeModal(false);
            setEditingOrder(null);
          }}
          existingOrder={order}
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
                  handleOpenNovoPedido(order)
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