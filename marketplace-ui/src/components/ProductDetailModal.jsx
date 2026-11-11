import { useState } from 'react';
import { X, MapPin, User, CheckCircle } from 'lucide-react';
import { imageApi, orderApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailModal({ product, isOpen, onClose, onPurchased, onOpenAuth }) {
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !product) return null;

    const isOwner = user?.id === product.seller?.id;
    const imageUrl = product.previewImageId
        ? imageApi.getUrl(product.previewImageId)
        : 'https://placehold.co/600x600/18181b/ffffff?text=No+Photo';

    const handleBuy = async () => {
        if (!isAuthenticated) {
            onClose();
            onOpenAuth();
            return;
        }

        setLoading(true);
        setError('');

        try {
            await orderApi.create(product.id);
            onPurchased();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Не удалось оформить заказ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl border border-zinc-800 bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
                <div className="md:w-1/2 bg-black flex items-center justify-center overflow-hidden">
                    <img src={imageUrl} alt={product.title} className="w-full h-full object-cover max-h-[400px] md:max-h-full" />
                </div>

                <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                            <span className="text-2xl font-black text-white">{product.price} BYN</span>
                            <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="mt-3 p-2 bg-red-950/60 border border-red-800 rounded-lg text-red-200 text-xs">
                                {error}
                            </div>
                        )}

                        <div className="mt-4">
                            <h3 className="text-lg font-bold text-white tracking-tight">{product.title}</h3>
                            <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
                                <div className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    <span>{product.city}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <User size={14} />
                                    <span>{product.seller?.nickName || 'Продавец'}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-zinc-800 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                {product.description}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-800">
                        {product.sold ? (
                            <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium text-sm">
                                <CheckCircle size={16} />
                                Товар уже продан
                            </div>
                        ) : isOwner ? (
                            <div className="text-center py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm font-medium">
                                Это ваше объявление
                            </div>
                        ) : (
                            <button
                                onClick={handleBuy}
                                disabled={loading}
                                className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? 'Оформление...' : 'Купить в 1 клик'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}