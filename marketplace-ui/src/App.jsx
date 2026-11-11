import { useState, useEffect } from 'react';
import { Search, Plus, User, LogOut, ArrowUpDown, ShoppingBag, X } from 'lucide-react';
import { productApi } from './api/endpoints';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import SellerModal from './components/SellerModal';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CreateProductModal from './components/CreateProductModal';
import AuthModal from './components/AuthModal';
import ProfileView from './components/ProfileView';
import CartModal from './components/CartModal';

export default function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalCount } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSellerNick, setSelectedSellerNick] = useState(null);
  const [returnToSellerNick, setReturnToSellerNick] = useState(null);

  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getAll(keyword, city);
      let list = Array.isArray(res.data) ? [...res.data] : [];
      list.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
      setProducts(list);
    } catch {
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

  const handleClearSearch = () => {
    setKeyword('');
    productApi.getAll('', city).then((res) => {
      let list = Array.isArray(res.data) ? [...res.data] : [];
      list.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
      setProducts(list);
    });
  };

  const handleProductDeleted = (deletedId) => {
    setProducts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  const handleSelectProductFromSeller = (product) => {
    setReturnToSellerNick(selectedSellerNick);
    setSelectedSellerNick(null);
    setSelectedProduct(product);
  };

  const handleCloseProductDetail = () => {
    setSelectedProduct(null);
    if (returnToSellerNick) {
      setSelectedSellerNick(returnToSellerNick);
      setReturnToSellerNick(null);
    }
  };

  return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        {isProfileOpen ? (
            <ProfileView
                onBack={() => {
                  setIsProfileOpen(false);
                  loadProducts();
                }}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onProductDeleted={handleProductDeleted}
            />
        ) : (
            <>
              <header className="sticky top-0 z-40 border-b border-zinc-900 bg-zinc-950/85 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-6 flex-1">
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

                    <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-96 lg:w-[480px]">
                      <input
                          type="text"
                          placeholder="Поиск..."
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                          className="w-full bg-zinc-900/90 border border-zinc-900 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
                      />
                      <button
                          type="submit"
                          className="absolute left-3 text-zinc-500 hover:text-white transition cursor-pointer"
                          title="Искать"
                      >
                        <Search size={16} />
                      </button>

                      {keyword && (
                          <button
                              type="button"
                              onClick={handleClearSearch}
                              className="absolute right-3 text-zinc-500 hover:text-white transition cursor-pointer"
                              title="Очистить"
                          >
                            <X size={15} />
                          </button>
                      )}
                    </form>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2.5 rounded-xl border border-zinc-900 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 transition cursor-pointer"
                        title="Корзина"
                    >
                      <ShoppingBag size={18} />
                      {totalCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-white text-black font-semibold text-[11px] w-4 h-4 rounded-full flex items-center justify-center">
                      {totalCount}
                    </span>
                      )}
                    </button>

                    <button
                        onClick={() => (isAuthenticated ? setIsCreateOpen(true) : setIsAuthOpen(true))}
                        className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>Подать объявление</span>
                    </button>

                    {isAuthenticated ? (
                        <div className="flex items-center gap-2 border-l border-zinc-900 pl-3">
                          <button
                              onClick={() => setIsProfileOpen(true)}
                              className="flex items-center gap-2 border border-zinc-900 bg-zinc-900 px-3.5 py-2 rounded-xl text-sm font-medium text-white hover:border-zinc-700 transition cursor-pointer"
                          >
                            <User size={15} />
                            <span>@{user?.nickName}</span>
                          </button>
                          <button
                              onClick={logout}
                              className="p-2 text-zinc-400 hover:text-white transition cursor-pointer"
                              title="Выйти"
                          >
                            <LogOut size={17} />
                          </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAuthOpen(true)}
                            className="border border-zinc-900 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition cursor-pointer"
                        >
                          Войти
                        </button>
                    )}
                  </div>
                </div>
              </header>

              <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
                    {['', 'Минск', 'Гродно', 'Брест', 'Витебск', 'Гомель', 'Могилев'].map((c) => (
                        <button
                            key={c}
                            onClick={() => setCity(c)}
                            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap cursor-pointer ${
                                city === c
                                    ? 'bg-zinc-200 text-black'
                                    : 'bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white'
                            }`}
                        >
                          {c === '' ? 'Все города' : c}
                        </button>
                    ))}
                  </div>

                  <button
                      onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                      className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white border border-zinc-900 px-3.5 py-2 rounded-xl bg-zinc-900/60 cursor-pointer"
                  >
                    <ArrowUpDown size={15} />
                    <span>{sortOrder === 'desc' ? 'Сначала новые' : 'Сначала старые'}</span>
                  </button>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-sm text-zinc-500">Загрузка каталога...</div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 text-zinc-500 text-sm">Ничего не найдено</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                      {products.map((p) => (
                          <ProductCard
                              key={p.id}
                              product={p}
                              onClick={() => setSelectedProduct(p)}
                              onSellerClick={(nick) => setSelectedSellerNick(nick)}
                          />
                      ))}
                    </div>
                )}
              </main>
            </>
        )}

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        <CreateProductModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onCreated={loadProducts}
        />
        <CartModal
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            onPurchased={loadProducts}
            onOpenAuth={() => setIsAuthOpen(true)}
        />
        <ProductDetailModal
            product={selectedProduct}
            isOpen={!!selectedProduct}
            onClose={handleCloseProductDetail}
            onPurchased={loadProducts}
            onOpenAuth={() => setIsAuthOpen(true)}
            onSellerClick={(nick) => setSelectedSellerNick(nick)}
        />
        <SellerModal
            nickName={selectedSellerNick}
            isOpen={!!selectedSellerNick}
            onClose={() => setSelectedSellerNick(null)}
            onSelectProduct={handleSelectProductFromSeller}
        />
      </div>
  );
}