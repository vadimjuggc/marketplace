import { useState, useEffect } from 'react';
import { Search, Plus, User, LogOut, ArrowUpDown } from 'lucide-react';
import { productApi } from './api/endpoints';
import { useAuth } from './context/AuthContext';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CreateProductModal from './components/CreateProductModal';
import AuthModal from './components/AuthModal';
import ProfileView from './components/ProfileView';

export default function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getAll(keyword, city);
      let list = Array.isArray(res.data) ? [...res.data] : [];
      list.sort((a, b) => {
        return sortOrder === 'desc'
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt);
      });
      setProducts(list);
    } catch (e) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [city, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProducts();
  };

  if (isProfileOpen) {
    return <ProfileView onBack={() => setIsProfileOpen(false)} />;
  }

  return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
            <span
                onClick={() => {
                  setKeyword('');
                  setCity('');
                  loadProducts();
                }}
                className="text-2xl font-black tracking-tighter text-white cursor-pointer select-none"
            >
              STASH.
            </span>

              <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-72">
                <input
                    type="text"
                    placeholder="Поиск по архиву..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-zinc-600"
                />
                <Search size={14} className="absolute left-3 text-zinc-500" />
              </form>
            </div>

            <div className="flex items-center gap-3">
              <button
                  onClick={() => (isAuthenticated ? setIsCreateOpen(true) : setIsAuthOpen(true))}
                  className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-200 transition cursor-pointer"
              >
                <Plus size={16} />
                <span>Подать объявление</span>
              </button>

              {isAuthenticated ? (
                  <div className="flex items-center gap-2 border-l border-zinc-800 pl-3">
                    <button
                        onClick={() => setIsProfileOpen(true)}
                        className="flex items-center gap-2 border border-zinc-800 bg-zinc-900 px-3 py-2 rounded-xl text-xs font-medium text-white hover:border-zinc-600 transition cursor-pointer"
                    >
                      <User size={14} />
                      <span>@{user?.nickName}</span>
                    </button>
                    <button
                        onClick={logout}
                        className="p-2 text-zinc-400 hover:text-white transition cursor-pointer"
                        title="Выйти"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
              ) : (
                  <button
                      onClick={() => setIsAuthOpen(true)}
                      className="border border-zinc-800 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-600 transition cursor-pointer"
                  >
                    Войти
                  </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
              {['', 'Минск', 'Гродно', 'Брест', 'Витебск', 'Гомель', 'Могилев'].map((c) => (
                  <button
                      key={c}
                      onClick={() => setCity(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                          city === c
                              ? 'bg-zinc-200 text-black'
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                  >
                    {c === '' ? 'Все города' : c}
                  </button>
              ))}
            </div>

            <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white border border-zinc-800 px-3 py-1.5 rounded-lg bg-zinc-900/50 cursor-pointer"
            >
              <ArrowUpDown size={14} />
              <span>{sortOrder === 'desc' ? 'Сначала новые' : 'Сначала старые'}</span>
            </button>
          </div>

          {loading ? (
              <div className="text-center py-20 font-mono text-xs text-zinc-500">Загрузка каталога...</div>
          ) : products.length === 0 ? (
              <div className="text-center py-20 text-zinc-500 text-sm">Ничего не найдено</div>
          ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                {products.map((p) => (
                    <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p)} />
                ))}
              </div>
          )}
        </main>

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        <CreateProductModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onCreated={loadProducts}
        />
        <ProductDetailModal
            product={selectedProduct}
            isOpen={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onPurchased={loadProducts}
            onOpenAuth={() => setIsAuthOpen(true)}
        />
      </div>
  );
}