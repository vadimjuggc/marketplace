import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('stash_cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        if (user?.nickName) {
            setCart((prev) =>
                prev.filter(
                    (item) =>
                        !item.sellerNickName ||
                        item.sellerNickName.toLowerCase() !== user.nickName.toLowerCase()
                )
            );
        }
    }, [user?.nickName]);

    useEffect(() => {
        localStorage.setItem('stash_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        if (
            user?.nickName &&
            product.sellerNickName &&
            user.nickName.toLowerCase() === product.sellerNickName.toLowerCase()
        ) {
            return false;
        }

        setCart((prev) => {
            if (prev.some((item) => item.id === product.id)) return prev;
            return [...prev, product];
        });
        return true;
    };

    const removeFromCart = (productId) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const isInCart = (productId) => {
        return cart.some((item) => item.id === productId);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                clearCart,
                isInCart,
                totalCount: cart.length,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);