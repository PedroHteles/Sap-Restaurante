import React, { useState } from 'react';
import { Edit3 as Edit3Icon, Trash2 as Trash2Icon } from 'lucide-react';
import { ref, remove, } from "firebase/database";
import { appId } from '@/app/contexts/FirebaseContext/FirebaseContext';
import { useFirebase } from '@/app/contexts/FirebaseContext/FirebaseContext';
import { useAuth } from '@/app/contexts/FirebaseProvider/FirebaseProvider';
import { formatDate } from '@/core/formatDate/formatDate';
import { formatCurrency } from '@/core/formatCurrency/formatCurrency';

const OrderItem = ({ order, onEditOrder }) => {
    const [newStatus, setNewStatus] = useState(order.status);
    const [isUpdating, setIsUpdating] = useState(false);
    const { db } = useFirebase();
    const { user } = useAuth();
    const userId = user.uid

    // --- Order Status Options ---
    const ORDER_STATUSES = ['pendente', 'em preparo', 'pronto para entrega', 'entregue', 'cancelado'];

    const handleStatusChange = async () => {
        if (newStatus === order.status) return;
        setIsUpdating(true);
        try {
            await onUpdateStatus(order.id, newStatus);
        } catch (err) {
            console.error('Error updating status:', err);
            setNewStatus(order.status);
        } finally {
            setIsUpdating(false);
        }
    };

    const deleteOrder = async (orderId) => {
        if (!userId || !db) {
            console.error("User not authenticated or DB not initialized for delete operation.");
            setError("Não é possível excluir o pedido: usuário ou banco de dados não disponível.");
            return;
        }

        // Usar ref para o caminho correto no Realtime Database
        const orderRef = ref(db, `artifacts/${appId}/users/${userId}/orders/${orderId}`);

        try {
            await remove(orderRef);  // remove para deletar no Realtime Database
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
        const orderRef = doc(db, `artifacts/${appId}/users/${user.uid}/orders`, orderId);
        try {
            await updateDoc(orderRef, { status: newStatus });
        } catch (err) {
            console.error("Error updating order status:", err);
            setError(`Erro ao atualizar status do pedido: ${err.message}`);
            throw err;
        }
    };


    const getStatusColor = (status) => {
        switch (status) {
            case 'pendente':
                return 'bg-yellow-100 text-yellow-800';
            case 'em preparo':
                return 'bg-blue-100 text-blue-800';
            case 'pronto para entrega':
                return 'bg-purple-100 text-purple-800';
            case 'entregue':
                return 'bg-green-100 text-green-800';
            case 'cancelado':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-4 transition-shadow hover:shadow-lg">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-3">
                <h3 className="text-xl font-semibold text-indigo-700 mb-2 md:mb-0">
                    Mesa: {order.tableNumber}
                </h3>
                <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        order.status
                    )}`}
                >
                    {order.status.toUpperCase()}
                </span>
            </div>

            <div className="mb-3">
                <p className="text-sm text-gray-500">
                    ID do Pedido:{' '}
                    <span className="font-mono text-xs">{order.id}</span>
                </p>
                <p className="text-sm text-gray-500">
                    Criado em: {formatDate(order.createdAt)}
                </p>
            </div>

            <div className="mb-4">
                <h4 className="text-md font-medium text-gray-800 mb-1">Itens:</h4>
                <ul className="list-disc list-inside pl-1 space-y-1 text-sm text-gray-700 max-h-32 overflow-y-auto">
                    {Array.isArray(order.orderItems) &&
                        order.orderItems.map((item, index) => (
                            <li key={index}>
                                {item.itemName} - {item.quantity} x {formatCurrency(item.unitPrice)}
                            </li>
                        ))}
                </ul>
            </div>

            <p className="text-lg font-semibold text-gray-800 mb-4">
                Total: {formatCurrency(order.totalPrice)}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex-grow sm:max-w-xs">
                    <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        onBlur={handleStatusChange}
                        disabled={isUpdating}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={() => onEditOrder(order)}
                        className="p-2 text-blue-600 hover:text-blue-800 rounded-md hover:bg-blue-100 transition-colors"
                        aria-label="Editar pedido"
                        disabled={isUpdating}
                    >
                        <Edit3Icon size={18} />
                    </button>
                    <button
                        onClick={() => {
                            if (
                                window.confirm(
                                    `Tem certeza que deseja excluir o pedido da mesa ${order.tableNumber}?`
                                )
                            ) {
                                deleteOrder(order.id);
                            }
                        }}
                        className="p-2 text-red-600 hover:text-red-800 rounded-md hover:bg-red-100 transition-colors"
                        aria-label="Excluir pedido"
                        disabled={isUpdating}
                    >
                        <Trash2Icon size={18} />
                    </button>
                </div>
            </div>

            {isUpdating && (
                <p className="text-sm text-indigo-600 mt-2">Atualizando status...</p>
            )}
        </div>
    );
};

export default OrderItem;
