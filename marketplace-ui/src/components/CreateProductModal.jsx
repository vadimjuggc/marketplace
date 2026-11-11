import { useState, useRef, useEffect } from 'react';
import { X, Upload, Trash2, Pin, MapPin } from 'lucide-react';
import { productApi } from '../api/endpoints';

const MAX_IMAGES = 5;

const POPULAR_CITIES = [
    'Минск',
    'Гродно',
    'Брест',
    'Витебск',
    'Гомель',
    'Могилев',
    'Орша',
    'Слоним',
    'Барановичи',
    'Пинск',
    'Полоцк',
    'Бобруйск',
    'Солигорск',
    'Новополоцк'
];

const INITIAL_FORM_DATA = {
    title: '',
    description: '',
    price: '',
    city: '',
};

export default function CreateProductModal({ isOpen, onClose, onCreated }) {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [imageFiles, setImageFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [coverIndex, setCoverIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [showCitySuggestions, setShowCitySuggestions] = useState(false);
    const cityWrapperRef = useRef(null);

    const resetForm = () => {
        setFormData(INITIAL_FORM_DATA);
        setImageFiles([]);
        setPreviews([]);
        setCoverIndex(0);
        setError('');
        setShowCitySuggestions(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (cityWrapperRef.current && !cityWrapperRef.current.contains(e.target)) {
                setShowCitySuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isOpen) return null;

    const handleCityChange = (e) => {
        const value = e.target.value;
        if (/^[a-zA-Zа-яА-ЯёЁ\s-]*$/.test(value)) {
            setFormData((prev) => ({ ...prev, city: value }));
            setShowCitySuggestions(true);
        }
    };

    const handleSelectCity = (selectedCity) => {
        setFormData((prev) => ({ ...prev, city: selectedCity }));
        setShowCitySuggestions(false);
    };

    const filteredCities = POPULAR_CITIES.filter((c) =>
        c.toLowerCase().includes(formData.city.trim().toLowerCase())
    );

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        if (imageFiles.length + files.length > MAX_IMAGES) {
            setError(`Максимум можно загрузить ${MAX_IMAGES} фото`);
            return;
        }

        setError('');
        const newFiles = [...imageFiles, ...files];
        setImageFiles(newFiles);

        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const handleRemoveImage = (indexToRemove) => {
        const updatedFiles = imageFiles.filter((_, idx) => idx !== indexToRemove);
        const updatedPreviews = previews.filter((_, idx) => idx !== indexToRemove);

        setImageFiles(updatedFiles);
        setPreviews(updatedPreviews);

        if (coverIndex === indexToRemove) {
            setCoverIndex(0);
        } else if (coverIndex > indexToRemove) {
            setCoverIndex(coverIndex - 1);
        }
    };

    const handleSetCover = (index) => {
        setCoverIndex(index);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleanCity = formData.city.trim();
        if (!cleanCity) {
            setError('Укажите город');
            return;
        }

        if (imageFiles.length === 0) {
            setError('Прикрепите хотя бы одну фотографию товара');
            return;
        }

        setLoading(true);
        setError('');

        const body = new FormData();
        body.append('title', formData.title.trim());
        if (formData.description) {
            body.append('description', formData.description.trim());
        }
        body.append('price', formData.price);
        body.append('city', cleanCity);

        const coverFile = imageFiles[coverIndex];
        const otherFiles = imageFiles.filter((_, idx) => idx !== coverIndex);
        const orderedFiles = [coverFile, ...otherFiles];

        orderedFiles.forEach((file) => {
            body.append('images', file);
        });

        try {
            await productApi.create(body);
            resetForm();
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
                    <button onClick={handleClose} className="text-zinc-400 hover:text-white transition cursor-pointer">
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
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-mono uppercase text-zinc-400">
                                Фотографии ({imageFiles.length}/{MAX_IMAGES})
                            </label>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {previews.map((preview, idx) => {
                                const isCover = coverIndex === idx;

                                return (
                                    <div
                                        key={idx}
                                        className={`relative aspect-square rounded-xl overflow-hidden border bg-zinc-900 group transition ${
                                            isCover ? 'border-white' : 'border-zinc-800'
                                        }`}
                                    >
                                        <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />

                                        <button
                                            type="button"
                                            onClick={() => handleSetCover(idx)}
                                            title={isCover ? 'Главное фото' : 'Сделать обложкой'}
                                            className={`absolute top-1 left-1 p-1 rounded-md transition flex items-center gap-1 cursor-pointer ${
                                                isCover
                                                    ? 'bg-white text-black'
                                                    : 'bg-black/60 text-zinc-400 hover:text-white hover:bg-black/90 opacity-70 group-hover:opacity-100'
                                            }`}
                                        >
                                            <Pin size={13} className={isCover ? 'fill-black' : ''} />
                                            {isCover && (
                                                <span className="text-[10px] font-medium pr-1 select-none">
                                                    Обложка
                                                </span>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(idx)}
                                            className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-600 rounded-md text-zinc-300 hover:text-white transition cursor-pointer opacity-70 group-hover:opacity-100"
                                            title="Удалить фото"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                );
                            })}

                            {imageFiles.length < MAX_IMAGES && (
                                <div className="border border-dashed border-zinc-800 rounded-xl p-2 text-center hover:border-zinc-600 transition relative flex flex-col items-center justify-center aspect-square bg-zinc-900/50 cursor-pointer">
                                    <Upload size={20} className="mb-1 text-zinc-500" />
                                    <span className="text-[11px] text-zinc-400">+ Добавить</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            )}
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
                            placeholder="Введите название"
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
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="Например 10.99"
                            />
                        </div>

                        <div className="relative" ref={cityWrapperRef}>
                            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Город</label>
                            <div className="relative">
                                <input
                                    required
                                    type="text"
                                    value={formData.city}
                                    onChange={handleCityChange}
                                    onFocus={() => setShowCitySuggestions(true)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-500"
                                    placeholder="Введите город"
                                    autoComplete="off"
                                />
                                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                            </div>

                            {showCitySuggestions && filteredCities.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-1.5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-20 max-h-48 overflow-y-auto">
                                    {filteredCities.map((city) => (
                                        <button
                                            key={city}
                                            type="button"
                                            onClick={() => handleSelectCity(city)}
                                            className="w-full text-left px-3.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition flex items-center justify-between cursor-pointer"
                                        >
                                            <span>{city}</span>
                                            {formData.city.toLowerCase() === city.toLowerCase() && (
                                                <span className="text-[10px] text-zinc-500 font-mono">выбрано</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Описание</label>
                        <textarea
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