import { imageApi } from '../api/endpoints';

export default function ProductCard({ product, onClick }) {
    const imageUrl = product.previewImageId
        ? imageApi.getUrl(product.previewImageId)
        : 'https://placehold.co/400x400/18181b/ffffff?text=No+Photo';

    return (
        <div
            onClick={onClick}
            className={`group cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-zinc-600 transition flex flex-col ${
                product.sold ? 'opacity-50' : ''
            }`}
        >
            <div className="relative aspect-square w-full overflow-hidden bg-zinc-950">
                <img
                    src={imageUrl}
                    alt={product.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                />
                {product.sold && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="border border-white/40 bg-zinc-900/80 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider text-white">
              Продано
            </span>
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                    <div className="text-lg font-bold text-white tracking-tight">{product.price} BYN</div>
                    <div className="mt-1 text-sm text-zinc-300 line-clamp-1 font-medium">{product.title}</div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/80 pt-3">
                    <span>{product.city}</span>
                    <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}