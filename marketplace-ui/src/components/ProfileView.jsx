import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Trash2 } from 'lucide-react';
import { orderApi, productApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

export default function ProfileView({ onBack }) {
    const { user } = useAuth();
    const [tab, setTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [myProducts, setMyProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            if (tab === 'orders') {
                const res = await orderApi.getMyOrders();
                setOrders(res.data);
            } else {
                const res = await productApi.getAll();
                const mine = res.data.filter((p) => p.seller?.id === user?.id);
                setMyProducts(mine);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [tab]);

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Удалить этот товар?')) return;
        try {
            await productApi.delete(id);
            loadData();
        } catch (e) {
            alert('Ошибка при удалении');
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">Личный кабинет</h1>
                    <p className="text-zinc-400 text-sm mt-1">@{user?.nickName} • {user?.email}</p>
                </div>
                <button
                    onClick={onBack}
                    className="border border-zinc-800 px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:border-zinc-600 transition cursor-pointer"
                >
                    Вернуться в каталог
                </button>
            </div>

            <div className="flex gap-4 mt-6 border-b border-zinc-800">
                <button
                    onClick={() => setTab('orders')}
                    className={`flex items-center gap-2 pb-3 px-2 text-sm font-medium transition border-b-2 -mb-[2px] cursor-pointer ${
                        tab === 'orders' ? 'border-white text-white' : 'border-transparent text-zinc-400 hover:text-white'
                    }`}
                >
                    <ShoppingBag size={16} />
                    Мои покупки ({orders.length})
                </button>
                <button
                    onClick={() => setTab('products')}
                    className={`flex items-center gap-2 pb-3 px-2 text-sm font-medium transition border-b-2 -mb-[2px] cursor-pointer ${
                        tab === 'products' ? 'border-white text-white' : 'border-transparent text-zinc-400 hover:text-white'
                    }`}
                >
                    <Package size={16} />
                    Мои объявления ({myProducts.length})
                </button>
            </div>

            <div className="mt-6">
                {loading ? (
                    <div className="text-center py-12 text-zinc-500 font-mono text-sm">Загрузка данных...</div>
                ) : tab === 'orders' ? (
                    orders.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500 text-sm">У вас пока нет покупок</div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((ord) => (
                                <div key={ord.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-white">{ord.product?.title || 'Товар'}</div>
                                        <div className="text-xs text-zinc-400 mt-1">Заказ #{ord.id} • {new Date(ord.createdAt).toLocaleString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-white">{ord.price} BYN</div>
                                        <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 mt-1 inline-block">
                      {ord.status}
                    </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    myProducts.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500 text-sm">Вы ещё ничего не выставили на продажу</div>
                    ) : (
                        <div className="space-y-3">
                            {myProducts.map((p) => (
                                <div key={p.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-white flex items-center gap-3">
                                            {p.title}
                                            {p.sold && (
                                                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          Продано
                        </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-zinc-400 mt-1">{p.city} • {p.price} BYN</div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteProduct(p.id)}
                                        className="p-2 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}