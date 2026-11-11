import { useState, useEffect } from 'react';
import { X, User, Calendar, Package, MapPin } from 'lucide-react';
import { userApi, imageApi } from '../api/endpoints';

const NO_PHOTO =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%2318181b'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2371717a' font-family='sans-serif' font-size='10'>НЕТ ФОТО</text></svg>";

export default function SellerModal({ nickName, isOpen, onClose, onSelectProduct }) {
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen || !nickName) return;

        setLoading(true);
        setError('');

        userApi
            .getByNickname(nickName)
            .then((res) => setSeller(res.data))
            .catch((err) => setError(err.response?.data?.message || 'Не удалось загрузить данные продавца'))
            .finally(() => setLoading(false));
    }, [isOpen, nickName]);

    if (!isOpen) return null;

    const formattedDate = seller?.registeredAt
        ? new Date(seller.registeredAt).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
        })
        : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl border border-zinc-900 bg-zinc-950 p-6 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                            <User size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-white">@{nickName}</h2>
                            <span className="text-xs text-zinc-500">Профиль продавца</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-sm text-zinc-500">Загрузка информации...</div>
                ) : error ? (
                    <div className="py-20 text-center text-sm text-red-400">{error}</div>
                ) : (
                    <div className="flex-1 overflow-y-auto py-4 space-y-6">
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-900 text-xs text-zinc-400">
                            <Calendar size={14} className="text-zinc-500 flex-shrink-0" />
                            <span>
                {formattedDate ? `На Stash с ${formattedDate}` : 'Продавец площадки Stash'}
              </span>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Package size={15} className="text-zinc-400" />
                                <h3 className="text-sm font-medium text-white">
                                    Товары в продаже ({seller?.products?.length || 0})
                                </h3>
                            </div>

                            {!seller?.products || seller.products.length === 0 ? (
                                <div className="text-center py-12 text-sm text-zinc-500">
                                    У продавца нет активных объявлений
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {seller.products.map((p) => {
                                        const photo = p.previewImageId ? imageApi.getUrl(p.previewImageId) : NO_PHOTO;
                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => onSelectProduct(p)}
                                                className="group border border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-800 rounded-xl overflow-hidden p-2.5 transition cursor-pointer flex flex-col justify-between"
                                            >
                                                <div className="aspect-square w-full rounded-lg overflow-hidden bg-black mb-2 relative">
                                                    <img
                                                        src={photo}
                                                        alt={p.title}
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.src = NO_PHOTO;
                                                        }}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                                    />
                                                </div>

                                                <div>
                                                    <div className="flex items-baseline justify-between gap-1">
                                                        <h4 className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                                                            {p.title}
                                                        </h4>
                                                        <span className="text-xs font-semibold text-white whitespace-nowrap">
                              {p.price} BYN
                            </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-1">
                                                        <MapPin size={11} />
                                                        <span className="truncate">{p.city}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}