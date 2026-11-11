import { MapPin, User } from 'lucide-react';
import { imageApi } from '../api/endpoints';

const NO_PHOTO =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><rect width='100%' height='100%' fill='%2318181b'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2371717a' font-family='sans-serif' font-size='14'>НЕТ ФОТО</text></svg>";

export default function ProductCard({ product, onClick, onSellerClick }) {
    const photo = product.previewImageId
        ? imageApi.getUrl(product.previewImageId)
        : NO_PHOTO;

    const isSold = product.sold ?? product.isSold;

    const handleSellerBadgeClick = (e) => {
        if (product.sellerNickName && onSellerClick) {
            e.stopPropagation();
            onSellerClick(product.sellerNickName);
        }
    };

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col justify-between border border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-800 rounded-2xl overflow-hidden p-3 transition duration-200 cursor-pointer"
        >
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-black mb-3 relative">
                <img
                    src={photo}
                    alt={product.title}
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = NO_PHOTO;
                    }}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300 ease-out"
                />

                {isSold && (
                    <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-xs font-medium text-zinc-300 bg-zinc-900/90 border border-zinc-800 px-2.5 py-1 rounded-md">
              Продано
            </span>
                    </div>
                )}
            </div>

            <div className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-medium text-zinc-200 group-hover:text-white truncate tracking-normal">
                        {product.title}
                    </h3>
                    <span className="text-sm font-semibold text-white whitespace-nowrap tracking-normal">
            {product.price} BYN
          </span>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                    <div className="flex items-center gap-1 truncate">
                        <MapPin size={13} className="text-zinc-500 flex-shrink-0" />
                        <span className="truncate">{product.city}</span>
                    </div>

                    <div
                        onClick={handleSellerBadgeClick}
                        className="flex items-center gap-1 flex-shrink-0 ml-2 hover:text-white transition cursor-pointer"
                        title="Профиль продавца"
                    >
                        <User size={13} className="text-zinc-500" />
                        <span className="truncate">@{product.sellerNickName || 'seller'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}