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
  const [activeTab, setActiveTab] = useState("registrar");


  const handleOpenNovoPedido = (order) => {
    openModal({
      title: order ? 'Editar Pedido' : 'Adicionar Novo Pedido',
      content: (
        <OrderForm
          key={order ? order.id : 'new-order-form'}
          userId={user.uid}
          onOrderAdded={() => { closeModal(false) }}
          existingOrder={order}
          onOrderUpdated={() => { closeModal(false) }}
          onCancelEdit={() => { closeModal(false) }}
        />
      )
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* Tab Selector */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("registrar")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "registrar"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Registrar Pedido
            </button>

            <button
              onClick={() => setActiveTab("acompanhar")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "acompanhar"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Acompanhar Pedidos
            </button>
          </div>
        </div>
      </div>

      <MainContainer>
        {activeTab === "registrar" && (
          <>
            {/* Conteúdo da tela de Acompanhar Pedidos */}
            <div className="p-6 bg-white rounded-md shadow">
              <div className="mb-6 text-center sm:text-right">
                <ButtonNewPedido onClick={() => { handleOpenNovoPedido() }}>
                  Novo Pedido
                </ButtonNewPedido>
              </div>
            </div>
          </>
        )}

        {activeTab === "acompanhar" && (
          <>
            {/* Conteúdo da tela de Registrar Pedido */}
            {error && (
              <p className="text-red-600 bg-red-100 p-3 rounded-md mb-6 shadow">
                {error}
              </p>
            )}

            {!orders.length && (
              <EmptyState
                title="Nenhum pedido encontrado"
                message="Adicione um novo pedido para uma mesa."
              />
            )}

            {orders.length > 0 && (
              <div className="space-y-6">
                {orders.map((order) => (
                  <OrderItem
                    key={order.id}
                    order={order}
                    onEditOrder={(order) => {
                      handleOpenNovoPedido(order);
                    }}
                  />
                ))}
              </div>
            )}
          </>

        )}

        <Footer />
      </MainContainer>
    </div>
  );
}

export default Main;