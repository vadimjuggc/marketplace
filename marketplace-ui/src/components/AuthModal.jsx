import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ email: '', nickName: '', password: '', identifier: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                await register({
                    nickName: formData.nickName,
                    email: formData.email,
                    password: formData.password
                });
            } else {
                await login({
                    identifier: formData.identifier || formData.email,
                    password: formData.password
                });
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Неверный логин или пароль');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md border border-zinc-800 bg-zinc-950 p-6 rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                    <h2 className="text-xl font-bold tracking-tight text-white uppercase">
                        {isRegister ? 'Регистрация' : 'Вход в Stash'}
                    </h2>
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
                    {isRegister ? (
                        <>
                            <div>
                                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Никнейм</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.nickName}
                                    onChange={(e) => setFormData({ ...formData, nickName: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-500"
                                    placeholder="vadim_arch"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Email</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-500"
                                    placeholder="vadim@stash.by"
                                />
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Email или Никнейм</label>
                            <input
                                required
                                type="text"
                                value={formData.identifier}
                                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-500"
                                placeholder="vadim@stash.by или vadim_arch"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Пароль</label>
                        <input
                            required
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? 'Загрузка...' : isRegister ? 'Создать аккаунт' : 'Войти'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-zinc-400">
                    {isRegister ? 'Уже есть аккаунт?' : 'Впервые на Stash?'}{' '}
                    <button
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError('');
                        }}
                        className="text-white underline underline-offset-4 hover:text-zinc-300 ml-1 font-medium cursor-pointer"
                    >
                        {isRegister ? 'Войти' : 'Зарегистрироваться'}
                    </button>
                </div>
            </div>
        </div>
    );
}