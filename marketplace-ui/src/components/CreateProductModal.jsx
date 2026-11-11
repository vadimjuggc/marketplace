import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { productApi } from '../api/endpoints';

export default function CreateProductModal({ isOpen, onClose, onCreated }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        city: 'Минск',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) {
            setError('Прикрепите фотографию товара');
            return;
        }

        setLoading(true);
        setError('');

        const body = new FormData();
        body.append('title', formData.title);
        body.append('description', formData.description);
        body.append('price', formData.price);
        body.append('city', formData.city);
        body.append('file', imageFile);

        try {
            await productApi.create(body);
            onCreated();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Не удалось опубликовать товар');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-lg border border-zinc-800 bg-zinc-950 p-6 rounded-2xl shadow-2xl my-8">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                    <h2 className="text-xl font-bold tracking-tight text-white uppercase">Разместить на Stash</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Фотография</label>
                        <div className="border border-dashed border-zinc-800 rounded-xl p-4 text-center hover:border-zinc-600 transition relative flex flex-col items-center justify-center min-h-[160px] bg-zinc-900/50">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="h-36 object-contain rounded-lg" />
                            ) : (
                                <div className="flex flex-col items-center text-zinc-400">
                                    <Upload size={28} className="mb-2 text-zinc-500" />
                                    <span className="text-xs">Нажмите для выбора фото</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Название</label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-500"
                            placeholder="Archive Bomber Jacket"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Цена (BYN)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-500"
                                placeholder="150"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Город</label>
                            <select
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-500"
                            >
                                <option value="Минск">Минск</option>
                                <option value="Гродно">Гродно</option>
                                <option value="Брест">Брест</option>
                                <option value="Витебск">Витебск</option>
                                <option value="Гомель">Гомель</option>
                                <option value="Могилев">Могилев</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Описание</label>
                        <textarea
                            required
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-500 resize-none"
                            placeholder="Состояние, замеры, нюансы..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition disabled:opacity-50 mt-4 cursor-pointer"
                    >
                        {loading ? 'Публикация...' : 'Опубликовать'}
                    </button>
                </form>
            </div>
        </div>
    );
}