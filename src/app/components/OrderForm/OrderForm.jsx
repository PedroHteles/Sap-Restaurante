import React, { useState, useEffect, useCallback } from 'react';
import { Trash2Icon, PlusCircleIcon } from 'lucide-react';
import { ref, push, update, serverTimestamp } from 'firebase/database';
import { appId } from '@/app/contexts/FirebaseContext/FirebaseContext';
import { useFirebase } from '@/app/contexts/FirebaseContext/FirebaseContext';
import { formatCurrency } from '@/core/formatCurrency/formatCurrency';

const OrderForm = ({
    userId,
    onOrderAdded,
    existingOrder,
    onOrderUpdated,
    onCancelEdit

}) => {
    const [tableNumber, setTableNumber] = useState('');
    const [orderItems, setOrderItems] = useState([{ menuItemId: '', quantity: 1 }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const { db } = useFirebase();

    const isEditing = !!existingOrder;

    // --- Menu Items ---
    const MENU_ITEMS = [
        { id: 'p1', name: 'Pizza Margherita', price: 30.00, category: 'Pizza' },
        { id: 'p2', name: 'Pizza Calabresa', price: 35.00, category: 'Pizza' },
        { id: 'p3', name: 'Hambúrguer Clássico', price: 25.00, category: 'Lanche' },
        { id: 'p4', name: 'Batata Frita', price: 15.00, category: 'Acompanhamento' },
        { id: 'b1', name: 'Refrigerante Lata', price: 5.00, category: 'Bebida' },
        { id: 'b2', name: 'Suco Natural', price: 8.00, category: 'Bebida' },
        { id: 's1', name: 'Pudim', price: 10.00, category: 'Sobremesa' },
    ];

    useEffect(() => {
        if (isEditing) {
            setTableNumber(existingOrder.tableNumber || '');
            setOrderItems(
                Array.isArray(existingOrder.orderItems)
                    ? existingOrder.orderItems.map(item => ({
                        menuItemId: item.menuItemId,
                        quantity: item.quantity,
                    }))
                    : [{ menuItemId: '', quantity: 1 }]
            );
        } else {
            setTableNumber('');
            setOrderItems([{ menuItemId: '', quantity: 1 }]);
        }
    }, [existingOrder, isEditing]);

    const handleItemChange = (index, field, value) => {
        const newItems = [...orderItems];
        if (field === 'quantity') {
            newItems[index][field] = parseInt(value, 10) || 1;
        } else {
            newItems[index][field] = value;
        }
        setOrderItems(newItems);
    };

    const addItem = () => {
        setOrderItems([...orderItems, { menuItemId: '', quantity: 1 }]);
    };

    const removeItem = (index) => {
        if (orderItems.length > 1) {
            setOrderItems(orderItems.filter((_, i) => i !== index));
        }
    };

    const calculateTotalPrice = useCallback(() => {
        return orderItems.reduce((total, item) => {
            const menuItem = MENU_ITEMS.find(mi => mi.id === item.menuItemId);
            const price = menuItem ? menuItem.price : 0;
            return total + (item.quantity * price);
        }, 0);
    }, [orderItems]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!tableNumber.trim()) {
            setError('O número da mesa é obrigatório.');
            return;
        }
        if (orderItems.some(item => !item.menuItemId || item.quantity <= 0)) {
            setError('Todos os itens devem ser selecionados e ter quantidade positiva.');
            return;
        }
        if (!userId) {
            setError('Usuário não autenticado. Não é possível salvar o pedido.');
            console.error('User not authenticated, cannot save order.');
            return;
        }

        setIsSubmitting(true);

        const finalOrderItems = orderItems.map(item => {
            const menuItem = MENU_ITEMS.find(mi => mi.id === item.menuItemId);
            return {
                menuItemId: item.menuItemId,
                itemName: menuItem ? menuItem.name : 'Item Desconhecido',
                quantity: item.quantity,
                unitPrice: menuItem ? menuItem.price : 0,
            };
        });

        const totalPrice = finalOrderItems.reduce(
            (total, item) => total + item.quantity * item.unitPrice,
            0
        );

        const orderData = {
            tableNumber,
            orderItems: finalOrderItems,
            totalPrice,
            status: isEditing ? existingOrder.status : 'pendente',
            userId,
            createdAt: serverTimestamp(),
        };

        try {
            const ordersPath = `artifacts/${appId}/users/${userId}/orders`;

            if (isEditing) {
                // Atualizar pedido existente
                const orderRef = ref(db, `${ordersPath}/${existingOrder.id}`);
                await update(orderRef, orderData);
                if (onOrderUpdated) onOrderUpdated();
            } else {
                // Criar novo pedido
                const ordersRef = ref(db, ordersPath);
                await push(ordersRef, orderData);
                if (onOrderAdded) onOrderAdded();
            }

            if (!isEditing || (isEditing && onCancelEdit)) {
                setTableNumber('');
                setOrderItems([{ menuItemId: '', quantity: 1 }]);
            }
        } catch (err) {
            console.error('Error saving order:', err);
            setError(`Erro ao salvar pedido: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 p-4 bg-gray-50 rounded-lg shadow"
        >
            {error && (
                <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>
            )}
            <div>
                <label
                    htmlFor="tableNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Número da Mesa
                </label>
                <input
                    type="text"
                    id="tableNumber"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Ex: Mesa 05"
                    required
                />
            </div>

            <fieldset className="space-y-4">
                <legend className="text-lg font-medium text-gray-900 mb-2">
                    Itens do Pedido
                </legend>
                {orderItems.map((item, index) => {
                    const selectedMenuItem = MENU_ITEMS.find(
                        (mi) => mi.id === item.menuItemId
                    );
                    return (
                        <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 border border-gray-200 rounded-md"
                        >
                            <div className="md:col-span-6">
                                <label
                                    htmlFor={`menuItem-${index}`}
                                    className="block text-xs font-medium text-gray-600"
                                >
                                    Item do Cardápio
                                </label>
                                <select
                                    id={`menuItem-${index}`}
                                    value={item.menuItemId}
                                    onChange={(e) =>
                                        handleItemChange(index, 'menuItemId', e.target.value)
                                    }
                                    className="w-full mt-1 px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    required
                                >
                                    <option value="">Selecione um item...</option>
                                    {MENU_ITEMS.map((menuItem) => (
                                        <option key={menuItem.id} value={menuItem.id}>
                                            {menuItem.name} ({formatCurrency(menuItem.price)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-3">
                                <label
                                    htmlFor={`quantity-${index}`}
                                    className="block text-xs font-medium text-gray-600"
                                >
                                    Quantidade
                                </label>
                                <input
                                    type="number"
                                    id={`quantity-${index}`}
                                    value={item.quantity}
                                    onChange={(e) =>
                                        handleItemChange(index, 'quantity', e.target.value)
                                    }
                                    className="w-full mt-1 px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 flex items-center text-sm text-gray-700 pt-5">
                                {selectedMenuItem &&
                                    formatCurrency(selectedMenuItem.price * item.quantity)}
                            </div>
                            <div className="md:col-span-1 flex items-end">
                                {orderItems.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="p-2 text-red-600 hover:text-red-800 rounded-md hover:bg-red-100 transition-colors"
                                        aria-label="Remover item"
                                    >
                                        <Trash2Icon />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                <button
                    type="button"
                    onClick={addItem}
                    className="mt-2 flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    <PlusCircleIcon />
                    <span className="ml-2">Adicionar Item</span>
                </button>
            </fieldset>

            <div className="text-right text-xl font-semibold text-gray-800">
                Total: {formatCurrency(calculateTotalPrice())}
            </div>

            <div className="flex justify-end space-x-3">
                {isEditing && onCancelEdit && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={isSubmitting}
                    >
                        Cancelar Edição
                    </button>
                )}
                <button
                    type="submit"
                    className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? isEditing
                            ? 'Salvando...'
                            : 'Adicionando...'
                        : isEditing
                            ? 'Salvar Alterações'
                            : 'Adicionar Pedido'}
                </button>
            </div>
        </form>
    );
};

export default OrderForm;
