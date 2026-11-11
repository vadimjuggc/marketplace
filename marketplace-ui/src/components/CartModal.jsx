import { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { orderApi, imageApi } from '../api/endpoints.js';

const NO_PHOTO =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%2318181b'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2371717a' font-family='sans-serif' font-size='10'>НЕТ ФОТО</text></svg>";

export default function CartModal({ isOpen, onClose, onPurchased, onOpenAuth }) {
    const { cart, removeFromCart, clearCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const totalPrice = cart
        .reduce((sum, item) => sum + Number(item.price || 0), 0)
        .toFixed(2);

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            onClose();
            onOpenAuth();
            return;
        }

        setLoading(true);
        setError('');

        try {
            for (const item of cart) {
                await orderApi.create(item.id);
            }
            clearCart();
            onPurchased();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Не удалось оформить часть заказов');
            onPurchased();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg border border-zinc-800 bg-zinc-950 p-6 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                        <ShoppingBag size={20} className="text-white" />
                        <h2 className="text-lg font-bold tracking-tight text-white uppercase">Корзина</h2>
                        <span className="text-xs font-mono text-zinc-500">({cart.length})</span>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-200 text-xs">
                        {error}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-[180px]">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12">
                            <ShoppingBag size={36} className="text-zinc-700 mb-2" />
                            <p className="text-sm">Корзина пуста</p>
                        </div>
                    ) : (
                        cart.map((item) => {
                            const photo = item.previewImageId
                                ? imageApi.getUrl(item.previewImageId)
                                : NO_PHOTO;

                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition"
                                >
                                    <img
                                        src={photo}
                                        alt={item.title}
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = NO_PHOTO;
                                        }}
                                        className="w-14 h-14 object-cover rounded-lg bg-black flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-white truncate">{item.title}</h4>
                                        <p className="text-xs text-zinc-400 font-mono mt-0.5">{item.city}</p>
                                        <p className="text-sm font-bold text-white mt-1">{item.price} BYN</p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-2 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                                        title="Удалить из корзины"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="pt-4 border-t border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Итого к оплате</span>
                            <span className="text-xl font-black text-white">{totalPrice} BYN</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition disabled:opacity-50 cursor-pointer"
                        >
                            <span>{loading ? 'Оформление...' : 'Купить всё'}</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}