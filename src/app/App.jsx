import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { setLogLevel } from 'firebase/firestore';

// --- Tailwind CSS (ensure it's set up in your project) ---
// If not, add to your index.html: <script src="https://cdn.tailwindcss.com"></script>

// --- Lucide Icons (example, replace with actual SVG or library) ---
const PlusCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const Trash2Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const Edit3Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// --- Firebase Configuration ---
// These global variables are expected to be provided by the Canvas environment
const firebaseConfig = {
  apiKey: "AIzaSyB-t3MrghETDc_svNy8xKcwgSo-NTitQyM", // Mantenha sua chave de API
  authDomain: "react-restaurant-d7120.firebaseapp.com",
  projectId: "react-restaurant-d7120",
  storageBucket: "react-restaurant-d7120.firebasestorage.app",
  messagingSenderId: "809681288779",
  appId: "1:809681288779:web:2436567cc829b7c0a617ce",
  measurementId: "G-C3JCX2X42G"
};

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Initialize Firebase
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  setLogLevel('debug'); // Optional: for detailed Firestore logs
  setPersistence(auth, browserLocalPersistence);
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

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

// --- Order Status Options ---
const ORDER_STATUSES = ['pendente', 'em preparo', 'pronto para entrega', 'entregue', 'cancelado'];

// --- Helper Functions ---
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp.seconds * 1000).toLocaleString('pt-BR');
};

// --- Components ---

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Fechar modal"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};


// Order Form Component
const OrderForm = ({ userId, onOrderAdded, existingOrder, onOrderUpdated, onCancelEdit }) => {
  const [tableNumber, setTableNumber] = useState('');
  const [orderItems, setOrderItems] = useState([{ menuItemId: '', quantity: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!existingOrder;

  useEffect(() => {
    if (isEditing) {
      setTableNumber(existingOrder.tableNumber || '');
      setOrderItems(
        Array.isArray(existingOrder.orderItems)
          ? existingOrder.orderItems.map(item => ({
              menuItemId: item.menuItemId, // Assumes menuItemId is stored
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
    } else { // menuItemId
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
        console.error("User not authenticated, cannot save order.");
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

    const totalPrice = finalOrderItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);

    const orderData = {
      tableNumber,
      orderItems: finalOrderItems,
      totalPrice,
      status: isEditing ? existingOrder.status : 'pendente',
      userId,
    };

    try {
      const ordersCollectionPath = `artifacts/${appId}/users/${userId}/orders`;
      if (isEditing) {
        const orderRef = doc(db, ordersCollectionPath, existingOrder.id);
        await updateDoc(orderRef, orderData);
        if (onOrderUpdated) onOrderUpdated();
      } else {
        await addDoc(collection(db, ordersCollectionPath), {
          ...orderData,
          createdAt: serverTimestamp(),
        });
        if (onOrderAdded) onOrderAdded();
      }
      if (!isEditing || (isEditing && onCancelEdit)) {
        setTableNumber('');
        setOrderItems([{ menuItemId: '', quantity: 1 }]);
      }
    } catch (err) {
      console.error("Error saving order:", err);
      setError(`Erro ao salvar pedido: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-gray-50 rounded-lg shadow">
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
      <div>
        <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-1">
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
        <legend className="text-lg font-medium text-gray-900 mb-2">Itens do Pedido</legend>
        {orderItems.map((item, index) => {
          const selectedMenuItem = MENU_ITEMS.find(mi => mi.id === item.menuItemId);
          return (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 border border-gray-200 rounded-md">
              <div className="md:col-span-6">
                <label htmlFor={`menuItem-${index}`} className="block text-xs font-medium text-gray-600">
                  Item do Cardápio
                </label>
                <select
                  id={`menuItem-${index}`}
                  value={item.menuItemId}
                  onChange={(e) => handleItemChange(index, 'menuItemId', e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  required
                >
                  <option value="">Selecione um item...</option>
                  {MENU_ITEMS.map(menuItem => (
                    <option key={menuItem.id} value={menuItem.id}>
                      {menuItem.name} ({formatCurrency(menuItem.price)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3">
                <label htmlFor={`quantity-${index}`} className="block text-xs font-medium text-gray-600">
                  Quantidade
                </label>
                <input
                  type="number"
                  id={`quantity-${index}`}
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  min="1"
                  required
                />
              </div>
              <div className="md:col-span-2 flex items-center text-sm text-gray-700 pt-5">
                 {selectedMenuItem && formatCurrency(selectedMenuItem.price * item.quantity)}
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
          <PlusCircleIcon /> <span className="ml-2">Adicionar Item</span>
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
          {isSubmitting ? (isEditing ? 'Salvando...' : 'Adicionando...') : (isEditing ? 'Salvar Alterações' : 'Adicionar Pedido')}
        </button>
      </div>
    </form>
  );
};


// Order Item Component
const OrderItem = ({ order, onUpdateStatus, onDeleteOrder, onEditOrder }) => {
  const [newStatus, setNewStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async () => {
    if (newStatus === order.status) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, newStatus);
    } catch (err) {
      console.error("Error updating status:", err);
      setNewStatus(order.status);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'em preparo': return 'bg-blue-100 text-blue-800';
      case 'pronto para entrega': return 'bg-purple-100 text-purple-800';
      case 'entregue': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-4 transition-shadow hover:shadow-lg">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-3">
        <h3 className="text-xl font-semibold text-indigo-700 mb-2 md:mb-0">
          Mesa: {order.tableNumber}
        </h3>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
          {order.status.toUpperCase()}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-500">ID do Pedido: <span className="font-mono text-xs">{order.id}</span></p>
        <p className="text-sm text-gray-500">Criado em: {formatDate(order.createdAt)}</p>
      </div>

      <div className="mb-4">
        <h4 className="text-md font-medium text-gray-800 mb-1">Itens:</h4>
        <ul className="list-disc list-inside pl-1 space-y-1 text-sm text-gray-700 max-h-32 overflow-y-auto">
          {Array.isArray(order.orderItems) && order.orderItems.map((item, index) => (
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
            {ORDER_STATUSES.map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
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
            <Edit3Icon />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Tem certeza que deseja excluir o pedido da mesa ${order.tableNumber}?`)) {
                onDeleteOrder(order.id);
              }
            }}
            className="p-2 text-red-600 hover:text-red-800 rounded-md hover:bg-red-100 transition-colors"
            aria-label="Excluir pedido"
            disabled={isUpdating}
          >
            <Trash2Icon />
          </button>
        </div>
      </div>
      {isUpdating && <p className="text-sm text-indigo-600 mt-2">Atualizando status...</p>}
    </div>
  );
};


// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    if (!auth) {
      setError("Firebase Auth não foi inicializado.");
      setIsLoading(false);
      setIsAuthReady(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setUserId(currentUser ? currentUser.uid : null);
      setIsAuthReady(true);
      setIsLoading(false);
      if (!currentUser) {
        setOrders([]);
      }
    }, (authError) => {
      console.error("Auth error:", authError);
      setError("Erro na autenticação. Tente novamente.");
      setIsAuthReady(true);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !userId || !db) {
      if (isAuthReady && !userId) setOrders([]);
      return;
    }

    setIsLoading(true);
    const ordersCollectionPath = `artifacts/${appId}/users/${userId}/orders`;
    const q = query(collection(db, ordersCollectionPath), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      setIsLoading(false);
      setError(null);
    }, (firestoreError) => {
      console.error("Error fetching orders:", firestoreError);
      setError(`Erro ao buscar pedidos: ${firestoreError.message}. Verifique as regras do Firestore.`);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthReady, userId]);


  const handleGoogleLogin = async () => {
    if (!auth) {
      setError("Firebase Auth não está pronto.");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      setIsLoading(true);
      await signInWithPopup(auth, provider);
      setError(null);
    } catch (err) {
      console.error("Google login error:", err);
      setError(`Erro ao fazer login com Google: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
    if (!userId || !db) {
        console.error("User not authenticated or DB not initialized for status update.");
        setError("Não é possível atualizar o status: usuário ou banco de dados não disponível.");
        return;
    }
    const orderRef = doc(db, `artifacts/${appId}/users/${userId}/orders`, orderId);
    try {
      await updateDoc(orderRef, { status: newStatus });
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(`Erro ao atualizar status do pedido: ${err.message}`);
      throw err;
    }
  };

  const deleteOrder = async (orderId) => {
    if (!userId || !db) {
        console.error("User not authenticated or DB not initialized for delete operation.");
        setError("Não é possível excluir o pedido: usuário ou banco de dados não disponível.");
        return;
    }
    const orderRef = doc(db, `artifacts/${appId}/users/${userId}/orders`, orderId);
    try {
      await deleteDoc(orderRef);
    } catch (err) {
      console.error("Error deleting order:", err);
      setError(`Erro ao excluir pedido: ${err.message}`);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="mt-4 text-lg text-gray-700">Carregando autenticação...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white">
        <div className="text-center bg-white bg-opacity-20 backdrop-blur-md p-8 md:p-12 rounded-xl shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Teste 1</h1>
          <p className="text-lg md:text-xl mb-8">Acesse para gerenciar os pedidos das mesas.</p>
          {isLoading && (
            <div className="flex justify-center items-center my-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              <p className="ml-3">Processando...</p>
            </div>
          )}
          {error && <p className="text-red-300 bg-red-800 bg-opacity-50 p-3 rounded-md mb-4">{error}</p>}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full max-w-xs flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white transition-transform transform hover:scale-105 disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
            Entrar com Google
          </button>
        </div>
         <footer className="absolute bottom-4 text-center w-full text-indigo-200 text-sm">
            App ID: {appId}
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Teste</h1>
          <div className="flex items-center mt-3 sm:mt-0 space-x-3">
            {user.photoURL && (
              <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border-2 border-indigo-300" />
            )}
            <span className="text-sm hidden md:block">{user.displayName || user.email}</span>
             <button
              onClick={handleLogout}
              disabled={isLoading}
              className="p-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors disabled:opacity-70"
              title="Sair"
            >
              <LogOutIcon />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {error && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-6 shadow">{error}</p>}
        
        <div className="mb-6 text-center sm:text-right">
            <button
                onClick={handleOpenAddOrderModal}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
            >
                <PlusCircleIcon /> <span className="ml-2">Novo Pedido</span>
            </button>
        </div>

        <Modal 
            isOpen={isFormModalOpen} 
            onClose={handleFormModalClose}
            title={editingOrder ? "Editar Pedido" : "Adicionar Novo Pedido"}
        >
            <OrderForm
                key={editingOrder ? editingOrder.id : 'new-order-form'}
                userId={userId}
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
            />
        </Modal>

        {isLoading && !orders.length && (
            <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500 mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Carregando pedidos...</p>
            </div>
        )}

        {!isLoading && !orders.length && (
          <div className="text-center py-10 bg-white shadow-md rounded-lg p-8">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-xl font-medium text-gray-900">Nenhum pedido encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece adicionando um novo pedido para uma mesa.
            </p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-6">
            {orders.map(order => (
              <OrderItem
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
                onDeleteOrder={deleteOrder}
                onEditOrder={handleOpenEditOrderModal}
              />
            ))}
          </div>
        )}
      </main>
      <footer className="text-center py-6 text-sm text-gray-500">
        <p>App ID: <span className="font-mono">{appId}</span></p>
        {user && <p>User ID: <span className="font-mono">{user.uid}</span></p>}
        <p>&copy; {new Date().getFullYear()} Gestão de Pedidos App - Restaurante. </p>
      </footer>
    </div>
  );
}

export default App;

