import React, { useState } from 'react';
import { Edit3 as Edit3Icon, Trash2 as Trash2Icon } from 'lucide-react';
import { formatDate } from '@/core/formatDate/formatDate';
import { formatCurrency } from '@/core/formatCurrency/formatCurrency';
import { useOrders } from '@/app/contexts/OrdersProvider/OrdersProvider';
import { Edit3, Trash2, ChevronDown, CheckCircle, XCircle, Info, ShoppingCart, Clock, Tag, Hash, CalendarDays, DollarSign, ListFilter } from 'lucide-react';

const OrderItem = ({ order, onEditOrder }) => {
    const [newStatus, setNewStatus] = useState(order.status);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const { deleteOrder, onUpdateStatus } = useOrders();


    const getStatusStyles = (status) => {
        // As classes de cor são do seu código original, adaptadas para o novo layout
        // Adicionei ícones para manter a melhoria visual
        switch (status) {
            case 'pendente': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-400', icon: <Clock size={14} /> };
            case 'em preparo': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-400', icon: <ShoppingCart size={14} /> };
            case 'pronto para entrega': return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-400', icon: <CheckCircle size={14} /> };
            case 'entregue': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-400', icon: <CheckCircle size={14} /> };
            case 'cancelado': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400', icon: <XCircle size={14} /> };
            default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-400', icon: <Info size={14} /> };
        }
    };

    const currentStatusStyles = getStatusStyles(order.status); // Estilo baseado no status atual do pedido
    const newStatusStyles = getStatusStyles(newStatus); // Estilo para o select, baseado no newStatus local

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


    return (
        <div className={`bg-white rounded-xl shadow-lg p-4 mb-4 border-l-4 ${currentStatusStyles.border} transition-all duration-300 ease-in-out hover:shadow-xl`}>

            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-indigo-700">
                    <Tag size={20} className="inline mr-2 opacity-70" />
                    Mesa: {order.tableNumber}
                </h3>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center ${currentStatusStyles.bg} ${currentStatusStyles.text}`}>
                    {currentStatusStyles.icon}
                    <span className="ml-1.5">{order.status?.toUpperCase()}</span>
                </span>
            </div>

            {/* Order Items Summary */}
            <div className="mb-3">
                <p className="text-sm text-gray-500 mb-1">
                    <ListFilter size={14} className="inline mr-1 opacity-60" />
                    {order.orderItems?.length || 0} item(ns)
                </p>
                {Array.isArray(order.orderItems) && order.orderItems.length > 0 && (
                    <ul className="text-xs text-gray-600 list-inside space-y-0.5 pl-2">
                        {order.orderItems.slice(0, 2).map((item, index) => (
                            <li key={index} className="truncate flex items-center gap-1">
                                <span>
                                    {item.quantity}x {item.itemName}
                                </span>
                                {item.delivered ? (
                                    <span className="text-green-600 font-medium">✅</span>
                                ) : (
                                    <span className="text-yellow-600 font-medium">⏳</span>
                                )}
                            </li>
                        ))}
                        {order.orderItems.length > 2 && (
                            <li
                                className="text-indigo-600 text-xs cursor-pointer hover:underline"
                                onClick={() => setShowDetails(!showDetails)}
                            >
                                {showDetails ? 'Mostrar menos' : `Ver mais ${order.orderItems.length - 2} itens...`}
                            </li>
                        )}
                    </ul>
                )}
            </div>

            {/* Total */}
            <p className="text-md font-semibold text-gray-800 mb-4 text-right">
                <DollarSign size={16} className="inline mr-1 opacity-70" />
                Total: {formatCurrency(order.totalPrice)}
            </p>

            {/* Details Expanded */}
            {showDetails && (
                <div className="bg-gray-50 p-3 rounded-md mb-4 animate-fadeIn">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Detalhes do Pedido:</h4>
                    <p className="text-xs text-gray-600 mb-1">
                        <Hash size={12} className="inline mr-1 opacity-60" />
                        ID: <span className="font-mono">{order.id}</span>
                    </p>
                    <p className="text-xs text-gray-600 mb-1">
                        <CalendarDays size={12} className="inline mr-1 opacity-60" />
                        Criado em: {formatDate(order.createdAt)}
                    </p>
                    <h5 className="text-xs font-semibold text-gray-700 mt-2 mb-1">Todos os Itens:</h5>
                    {Array.isArray(order.orderItems) && (
                        <ul className="list-disc list-inside pl-2 space-y-0.5 text-xs text-gray-600 max-h-28 overflow-y-auto">
                            {order.orderItems.map((item, index) => (
                                <li key={index} className="flex items-center gap-1">
                                    <span>
                                        {item.itemName} - {item.quantity} x {formatCurrency(item.unitPrice)}
                                    </span>
                                    {item.delivered ? (
                                        <span className="text-green-600 font-medium">✅</span>
                                    ) : (
                                        <span className="text-yellow-600 font-medium">⏳</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-grow sm:max-w-xs w-full">
                    <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        onBlur={handleStatusChange}
                        disabled={isUpdating}
                        className={`w-full pl-3 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${isUpdating ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'
                            } ${newStatusStyles.text} ${newStatusStyles.bg.replace('100', '200')}`}
                    >
                        {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status} className={`${getStatusStyles(status).bg.replace('100', '50')} ${getStatusStyles(status).text}`}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>

                <div className="flex space-x-2 shrink-0">
                    <button
                        onClick={() => onEditOrder(order)}
                        className="p-2.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:hover:bg-transparent"
                        aria-label="Editar pedido"
                        disabled={isUpdating}
                    >
                        <Edit3 size={20} />
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm(`Tem certeza que deseja excluir o pedido da mesa ${order.tableNumber}?`)) {
                                deleteOrder(order.id);
                            }
                        }}
                        className="p-2.5 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 disabled:hover:bg-transparent"
                        aria-label="Excluir pedido"
                        disabled={isUpdating}
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {isUpdating && (
                <p className="text-xs text-indigo-600 mt-2 flex items-center">
                    <svg className="animate-spin mr-1.5 h-3 w-3 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Atualizando status...
                </p>
            )}
        </div>
    );
};

export default OrderItem;
