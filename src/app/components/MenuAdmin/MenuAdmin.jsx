import React, { useEffect, useState } from 'react';
import { ref, push, set, get, remove, update } from 'firebase/database';
import { db } from './firebaseConfig'; // importa sua configuração do Firebase

const MenuAdmin = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [form, setForm] = useState({ name: '', price: '', category: '' });
    const [editingId, setEditingId] = useState(null);

    // Carregar os itens do banco
    useEffect(() => {
        const fetchMenu = async () => {
            const menuRef = ref(db, 'menu');
            const snapshot = await get(menuRef);
            const data = snapshot.val();

            if (data) {
                const items = Object.entries(data).map(([id, value]) => ({
                    id,
                    ...value,
                }));
                setMenuItems(items);
            } else {
                setMenuItems([]);
            }
        };

        fetchMenu();
    }, []);

    // Adicionar ou atualizar
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.price || !form.category) {
            alert('Preencha todos os campos');
            return;
        }

        if (editingId) {
            const itemRef = ref(db, `menu/${editingId}`);
            await update(itemRef, {
                name: form.name,
                price: parseFloat(form.price),
                category: form.category,
            });
        } else {
            const menuRef = ref(db, 'menu');
            await push(menuRef, {
                name: form.name,
                price: parseFloat(form.price),
                category: form.category,
            });
        }

        setForm({ name: '', price: '', category: '' });
        setEditingId(null);
        window.location.reload(); // recarregar para atualizar a lista
    };

    // Deletar
    const handleDelete = async (id) => {
        const confirm = window.confirm('Tem certeza que deseja excluir?');
        if (confirm) {
            const itemRef = ref(db, `menu/${id}`);
            await remove(itemRef);
            window.location.reload();
        }
    };

    // Editar
    const handleEdit = (item) => {
        setForm({
            name: item.name,
            price: item.price,
            category: item.category,
        });
        setEditingId(item.id);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header user={user} handleLogout={handleLogout} isLoading={isLoading} />
            <MainContainer>
                <div style={{ padding: 20 }}>
                    <h2>Gerenciar Menu</h2>

                    <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
                        <input
                            placeholder="Nome"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        <input
                            placeholder="Preço"
                            type="number"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                        />
                        <input
                            placeholder="Categoria"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                        />
                        <button type="submit">{editingId ? 'Atualizar' : 'Adicionar'}</button>
                    </form>

                    <table border="1" cellPadding="10">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Preço</th>
                                <th>Categoria</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menuItems.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>R$ {item.price.toFixed(2)}</td>
                                    <td>{item.category}</td>
                                    <td>
                                        <button onClick={() => handleEdit(item)}>Editar</button>
                                        <button onClick={() => handleDelete(item.id)}>Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div >
                <Footer user={user} />
            </MainContainer>
        </div>

    );
};

export default MenuAdmin;
