import { useState, useEffect, useCallback } from 'react';
import { X, MapPin, User, CheckCircle, ChevronLeft, ChevronRight, ShoppingBag, Check } from 'lucide-react';
import { imageApi, orderApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const NO_PHOTO =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'><rect width='100%' height='100%' fill='%2318181b'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2371717a' font-family='sans-serif' font-size='20'>НЕТ ФОТО</text></svg>";

export default function ProductDetailModal({ product, isOpen, onClose, onPurchased, onOpenAuth, onSellerClick }) {
    const { user, isAuthenticated } = useAuth();
    const { addToCart, isInCart } = useCart();
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setActiveImageIndex(0);
        setError('');
    }, [product?.id]);

    const images = product?.imageIds && product.imageIds.length > 0
        ? product.imageIds
        : (product?.previewImageId ? [product.previewImageId] : []);

    const handlePrevImage = useCallback((e) => {
        if (e) e.stopPropagation();
        setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const handleNextImage = useCallback((e) => {
        if (e) e.stopPropagation();
        setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    useEffect(() => {
        if (!isOpen || images.length <= 1) return;

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') handlePrevImage();
            if (e.key === 'ArrowRight') handleNextImage();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, images.length, handlePrevImage, handleNextImage]);

    if (!isOpen || !product) return null;

    const isOwner = Boolean(
        user?.nickName &&
        product.sellerNickName &&
        user.nickName.toLowerCase() === product.sellerNickName.toLowerCase()
    );

    const activeImageId = images[activeImageIndex] || images[0];
    const mainImageUrl = activeImageId ? imageApi.getUrl(activeImageId) : NO_PHOTO;
    const isProductSold = product.sold ?? product.isSold;
    const alreadyInCart = isInCart(product.id);

    const handleSellerClick = () => {
        if (product.sellerNickName && onSellerClick) {
            onClose();
            onSellerClick(product.sellerNickName);
        }
    };

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
            <div className="w-full max-w-3xl border border-zinc-900 bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
                <div className="md:w-1/2 bg-black flex flex-col justify-between p-4 border-b md:border-b-0 md:border-r border-zinc-900">
                    <div className="relative group/gallery w-full flex-1 flex items-center justify-center overflow-hidden min-h-[300px]">
                        <img
                            src={mainImageUrl}
                            alt={product.title}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = NO_PHOTO;
                            }}
                            className="w-full h-full object-contain max-h-[380px] rounded-lg transition-opacity duration-200 select-none"
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={handlePrevImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-zinc-950/70 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-500 hover:bg-zinc-900 transition flex items-center justify-center backdrop-blur-sm opacity-80 group-hover/gallery:opacity-100 cursor-pointer"
                                    title="Предыдущее фото"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-zinc-950/70 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-500 hover:bg-zinc-900 transition flex items-center justify-center backdrop-blur-sm opacity-80 group-hover/gallery:opacity-100 cursor-pointer"
                                    title="Следующее фото"
                                >
                                    <ChevronRight size={18} />
                                </button>

                                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 border border-zinc-800 text-[11px] font-mono text-zinc-400 backdrop-blur-sm">
                                    {activeImageIndex + 1} / {images.length}
                                </div>
                            </>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="flex gap-2 justify-center mt-3 overflow-x-auto py-1">
                            {images.map((id, index) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setActiveImageIndex(index)}
                                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition cursor-pointer flex-shrink-0 ${
                                        activeImageIndex === index
                                            ? 'border-white opacity-100'
                                            : 'border-zinc-900 opacity-40 hover:opacity-80'
                                    }`}
                                >
                                    <img
                                        src={imageApi.getUrl(id)}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                            <span className="text-2xl font-bold text-white">{product.price} BYN</span>
                            <button onClick={onClose} className="text-zinc-400 hover:text-white transition cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="mt-3 p-2 bg-red-950/60 border border-red-800 rounded-lg text-red-200 text-xs">
                                {error}
                            </div>
                        )}

                        <div className="mt-4">
                            <h3 className="text-lg font-semibold text-white tracking-normal">{product.title}</h3>
                            <div className="mt-2.5 flex items-center gap-3 text-xs text-zinc-400">
                                <div className="flex items-center gap-1">
                                    <MapPin size={14} className="text-zinc-500" />
                                    <span>{product.city}</span>
                                </div>
                                <div
                                    onClick={handleSellerClick}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900/80 border border-zinc-800/80 text-zinc-300 hover:text-white hover:border-zinc-700 transition cursor-pointer"
                                    title="Открыть профиль продавца"
                                >
                                    <User size={13} className="text-zinc-400" />
                                    <span>@{product.sellerNickName || 'Продавец'}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-zinc-900 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-normal">
                                {product.description || 'Описание отсутствует'}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-900 space-y-2">
                        {isProductSold ? (
                            <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium text-sm">
                                <CheckCircle size={16} />
                                Товар уже продан
                            </div>
                        ) : isOwner ? (
                            <div className="text-center py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm font-medium">
                                Это ваше объявление
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={alreadyInCart}
                                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition cursor-pointer text-sm ${
                                        alreadyInCart
                                            ? 'bg-zinc-900 border border-zinc-800 text-zinc-400 cursor-default'
                                            : 'border border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-850'
                                    }`}
                                >
                                    {alreadyInCart ? (
                                        <>
                                            <Check size={16} />
                                            <span>В корзине</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingBag size={16} />
                                            <span>В корзину</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleBuy}
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition disabled:opacity-50 cursor-pointer text-sm"
                                >
                                    {loading ? 'Оформление...' : 'Купить сразу'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}