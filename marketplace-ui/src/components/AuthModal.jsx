import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const INITIAL_FORM_DATA = {
    identifier: '',
    nickName: '',
    email: '',
    password: '',
};

export default function AuthModal({ isOpen, onClose }) {
    const { login, register } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const resetForm = () => {
        setFormData(INITIAL_FORM_DATA);
        setAgreedToTerms(false);
        setError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSwitchMode = (registerMode) => {
        setIsRegister(registerMode);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isRegister && !agreedToTerms) {
            setError('Необходимо принять условия пользовательского соглашения');
            return;
        }

        setLoading(true);

        try {
            if (isRegister) {
                await register({
                    nickName: formData.nickName.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                });
            } else {
                await login({
                    identifier: formData.identifier.trim(),
                    password: formData.password,
                });
            }
            resetForm();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Произошла ошибка при входе');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm border border-zinc-800 bg-zinc-950 p-6 rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                    <h2 className="text-xl font-bold tracking-normal text-white">
                        {isRegister ? 'Регистрация' : 'Вход в аккаунт'}
                    </h2>
                    <button onClick={handleClose} className="text-zinc-400 hover:text-white transition cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-200 text-xs">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {isRegister ? (
                        <>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1 font-medium">Никнейм</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.nickName}
                                    onChange={(e) => setFormData({ ...formData, nickName: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-zinc-400 mb-1 font-medium">Email</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-500"
                                />
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1 font-medium">Email или Никнейм</label>
                            <input
                                required
                                type="text"
                                value={formData.identifier}
                                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-500"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs text-zinc-400 mb-1 font-medium">Пароль</label>
                        <input
                            required
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-500"
                        />
                    </div>

                    {isRegister && (
                        <div className="flex items-start gap-2.5 pt-1">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => {
                                    setAgreedToTerms(e.target.checked);
                                    if (e.target.checked && error === 'Необходимо принять условия пользовательского соглашения') {
                                        setError('');
                                    }
                                }}
                                className="mt-0.5 h-4 w-4 rounded border-zinc-800 bg-zinc-900 text-white accent-white cursor-pointer"
                            />
                            <label htmlFor="terms" className="text-xs leading-tight text-zinc-400 select-none cursor-pointer">
                                Я принимаю условия{' '}
                                <span className="text-zinc-200 underline hover:text-white">
                  пользовательского соглашения
                </span>{' '}
                                и согласен на обработку данных
                            </label>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || (isRegister && !agreedToTerms)}
                        className="w-full bg-white text-black font-semibold text-sm py-3 rounded-xl hover:bg-zinc-200 transition disabled:opacity-40 disabled:hover:bg-white mt-4 cursor-pointer"
                    >
                        {loading ? 'Загрузка...' : isRegister ? 'Зарегистрироваться' : 'Войти'}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-zinc-400">
                    {isRegister ? (
                        <span>
              Уже есть аккаунт?{' '}
                            <button
                                type="button"
                                onClick={() => handleSwitchMode(false)}
                                className="text-white underline hover:text-zinc-300 font-medium cursor-pointer"
                            >
                Войти
              </button>
            </span>
                    ) : (
                        <span>
              Впервые на Stash?{' '}
                            <button
                                type="button"
                                onClick={() => handleSwitchMode(true)}
                                className="text-white underline hover:text-zinc-300 font-medium cursor-pointer"
                            >
                Создать аккаунт
              </button>
            </span>
                    )}
                </div>
            </div>
        </div>
    );
}