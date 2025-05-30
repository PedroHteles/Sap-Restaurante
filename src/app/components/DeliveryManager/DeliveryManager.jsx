import { useState } from "react";
import { ref, get, update } from "firebase/database";
import { CheckCircle, RefreshCcw } from "lucide-react";
import { appId } from "@/app/contexts/FirebaseContext/FirebaseContext";
import { useFirebase } from "@/app/contexts/FirebaseContext/FirebaseContext";
import { useAuth } from "@/app/contexts/FirebaseProvider/FirebaseProvider";

export default function DeliveryManager({ orders }) {
    const [tableNumber, setTableNumber] = useState("");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const { db } = useFirebase();
    const { user } = useAuth();

    const fetchPendingItems = () => {
        if (!tableNumber) return alert("Informe o número da mesa");

        setLoading(true);

        console.log("entrou", orders.filter((teste) => teste.tableNumber === tableNumber)?.filter((item) => item.delivered !== false))


        const filteredItems = orders.flatMap((order) =>
            order.tableNumber === tableNumber
                ? order.orderItems
                    ?.filter((item) => item.delivered !== true)
                    .map((item) => ({
                        ...item,
                        orderId: order.id,
                    })) || []
                : []
        );
        console.log(filteredItems)

        setItems(filteredItems);
        setLoading(false);
    };

    const markItemAsDelivered = async (orderId, itemId) => {
        try {
            const orderRef = ref(
                db,
                `artifacts/${appId}/users/${user.uid}/orders/${orderId}`
            );

            const snapshot = await get(orderRef);
            if (!snapshot.exists()) {
                alert("Pedido não encontrado.");
                return;
            }

            const orderData = snapshot.val();

            const updatedItems = (orderData.orderItems || []).map((item) =>
                item.menuItemId === itemId ? { ...item, delivered: true } : item
            );

            await update(orderRef, {
                orderItems: updatedItems, // ⚠️ O nome correto é orderItems
                updatedAt: Date.now() // (Opcional) atualizar a data
            });

            setItems((prev) => prev.filter((item) => item.menuItemId !== itemId));
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar item.");
        }
    };


    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">
                Entrega de Itens
            </h2>

            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Número da Mesa"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                    onClick={fetchPendingItems}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    Buscar
                </button>
            </div>

            {items.length === 0 && !loading && (
                <p className="text-gray-500 text-sm">
                    Nenhum item pendente para a mesa {tableNumber}.
                </p>
            )}

            {items.length > 0 && (
                <div className="space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition"
                        >
                            <div>
                                <p className="font-semibold text-gray-800">
                                    {item.quantity}x {item.itemName}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Pedido: {item.orderId}
                                </p>
                            </div>
                            <button
                                onClick={() => markItemAsDelivered(item.orderId, item.menuItemId)}
                                className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Entregue
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {loading && (
                <p className="text-sm text-gray-500 mt-2">Buscando itens...</p>
            )}
        </div>
    );
}
