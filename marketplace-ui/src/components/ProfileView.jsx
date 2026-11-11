import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Package, ShoppingBag, Trash2, MapPin, User } from 'lucide-react';
import { productApi, orderApi, imageApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

const NO_PHOTO =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%2318181b'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2371717a' font-family='sans-serif' font-size='10'>НЕТ ФОТО</text></svg>";

export default function ProfileView({ onBack, onSelectProduct, onProductDeleted }) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('products');
    const [myProducts, setMyProducts] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const fetchProfileData = useCallback(async () => {
        setLoading(true);
        try {
            const [productsRes, ordersRes] = await Promise.allSettled([
                productApi.getMyProducts ? productApi.getMyProducts() : productApi.getAll('', ''),
                orderApi.getMyOrders(),
            ]);

            if (productsRes.status === 'fulfilled') {
                const data = Array.isArray(productsRes.value.data) ? productsRes.value.data : [];
                const userProducts = productApi.getMyProducts
                    ? data
                    : data.filter(
                        (p) =>
                            p.sellerNickName &&
                            user?.nickName &&
                            p.sellerNickName.toLowerCase() === user.nickName.toLowerCase()
                    );
                setMyProducts(userProducts);
            }

            if (ordersRes.status === 'fulfilled') {
                setMyOrders(Array.isArray(ordersRes.value.data) ? ordersRes.value.data : []);
            }
        } finally {
            setLoading(false);
        }
    }, [user?.nickName]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const handleDeleteProduct = async (e, productId) => {
        e.stopPropagation();
        if (!window.confirm('Вы уверены, что хотите удалить это объявление?')) return;

        setDeletingId(productId);
        try {
            await productApi.delete(productId);
            setMyProducts((prev) => prev.filter((item) => item.id !== productId));
            if (onProductDeleted) {
                onProductDeleted(productId);
            }
        } catch {
            alert('Не удалось удалить товар');
        } finally {
            setDeletingId(null);
        }
    };

    const handleOrderClick = async (productId) => {
        if (!productId || !onSelectProduct) return;
        try {
            const res = await productApi.getById(productId);
            onSelectProduct(res.data);
        } catch {
            alert('Информация о товаре недоступна');
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between pb-5 border-b border-zinc-900">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition cursor-pointer"
                >
                    <ArrowLeft size={16} />
                    <span>Назад в каталог</span>
                </button>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-900">
                    <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <User size={13} />
                    </div>
                    <span className="text-sm font-medium text-zinc-200">@{user?.nickName}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 mt-6 pb-4 border-b border-zinc-900">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                        activeTab === 'products'
                            ? 'bg-zinc-200 text-black'
                            : 'bg-zinc-900/60 border border-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                >
                    <Package size={15} />
                    <span>Мои объявления ({myProducts.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                        activeTab === 'orders'
                            ? 'bg-zinc-200 text-black'
                            : 'bg-zinc-900/60 border border-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                >
                    <ShoppingBag size={15} />
                    <span>Купленные товары ({myOrders.length})</span>
                </button>
            </div>

            <div className="mt-6 w-full">
                {loading ? (
                    <div className="text-center py-20 text-sm text-zinc-500">Загрузка данных...</div>
                ) : activeTab === 'products' ? (
                    myProducts.length === 0 ? (
                        <div className="text-center py-20 text-zinc-500 text-sm">
                            У вас пока нет активных объявлений
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {myProducts.map((p) => {
                                const photo = p.previewImageId ? imageApi.getUrl(p.previewImageId) : NO_PHOTO;
                                const isSold = p.sold ?? p.isSold;

                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => onSelectProduct(p)}
                                        className="relative border border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-800 rounded-2xl overflow-hidden p-2.5 transition duration-200 flex flex-col justify-between group cursor-pointer"
                                    >
                                        <div className="aspect-square w-full rounded-xl overflow-hidden bg-black mb-2.5 relative">
                                            <img
                                                src={photo}
                                                alt={p.title}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = NO_PHOTO;
                                                }}
                                                className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300 ease-out"
                                            />
                                            {isSold && (
                                                <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="text-xs font-medium text-zinc-300 bg-zinc-900/90 border border-zinc-800 px-2 py-0.5 rounded-md">
                            Продано
                          </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-baseline justify-between gap-1.5">
                                                <h4 className="text-sm font-medium text-zinc-200 group-hover:text-white truncate">
                                                    {p.title}
                                                </h4>
                                                <span className="text-sm font-semibold text-white whitespace-nowrap">
                          {p.price} BYN
                        </span>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-zinc-400 pt-0.5">
                                                <div className="flex items-center gap-1 truncate">
                                                    <MapPin size={12} className="text-zinc-500 flex-shrink-0" />
                                                    <span className="truncate">{p.city}</span>
                                                </div>

                                                {!isSold && (
                                                    <button
                                                        type="button"
                                                        disabled={deletingId === p.id}
                                                        onClick={(e) => handleDeleteProduct(e, p.id)}
                                                        className="p-1 rounded-md hover:bg-red-950/50 hover:text-red-400 text-zinc-500 transition cursor-pointer flex-shrink-0 ml-1"
                                                        title="Удалить товар"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    myOrders.length === 0 ? (
                        <div className="text-center py-20 text-zinc-500 text-sm">История заказов пуста</div>
                    ) : (
                        <div className="space-y-2.5 w-full">
                            {myOrders.map((order) => {
                                const orderKey = order.orderId || order.id;
                                const title = order.productTitle || order.title || 'Товар';
                                const price = order.price ?? '0';

                                return (
                                    <div
                                        key={orderKey}
                                        onClick={() => handleOrderClick(order.productId)}
                                        className="w-full flex items-center justify-between gap-4 p-3 rounded-xl border border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-800 transition cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-zinc-400">
                                                <ShoppingBag size={18} />
                                            </div>
                                            <div className="truncate">
                                                <h4 className="text-sm font-medium text-white truncate">{title}</h4>
                                                <p className="text-xs text-zinc-500 mt-0.5">
                                                    Заказ #{orderKey}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-sm font-semibold text-white">{price} BYN</div>
                                            <div className="text-xs text-zinc-500 mt-0.5">Оплачено</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}