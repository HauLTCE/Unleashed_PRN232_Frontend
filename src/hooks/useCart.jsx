import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as cartService from '../services/cartService'; // Sử dụng import * để gọn gàng hơn
import { useAuth } from './User/useAuth'; // Import useAuth để kiểm tra trạng thái đăng nhập

// 1. Tạo Context
const CartContext = createContext(null);

// 2. Tạo Provider Component
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null); // State chứa dữ liệu giỏ hàng
    const [isLoading, setIsLoading] = useState(true); // State cho trạng thái loading
    const [error, setError] = useState(null); // State cho lỗi

    const { isAuthenticated } = useAuth(); // Lấy trạng thái xác thực từ AuthContext

    /**
     * Hàm để lấy dữ liệu giỏ hàng từ server.
     * Được bọc trong useCallback để tránh tạo lại hàm không cần thiết.
     */
    const fetchCart = useCallback(async () => {
        // Chỉ fetch khi người dùng đã đăng nhập
        if (!isAuthenticated) {
            setCart(null); // Xóa dữ liệu giỏ hàng nếu người dùng không đăng nhập/đã đăng xuất
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const cartData = await cartService.getUserCart();
            setCart(cartData);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch cart.";
            setError(errorMessage);
            console.error("Fetch cart error:", errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]); // Phụ thuộc vào trạng thái isAuthenticated

    // Tự động fetch giỏ hàng khi component được mount hoặc khi trạng thái đăng nhập thay đổi
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    /**
     * Thêm một sản phẩm vào giỏ hàng và fetch lại dữ liệu mới.
     * @param {number} variationId - ID của biến thể sản phẩm.
     * @param {number} quantity - Số lượng.
     * @returns {Promise<boolean>} True nếu thành công, ngược lại là false.
     */
    const addItemToCart = async (variationId, quantity) => {
        setIsLoading(true);
        setError(null);
        try {
            await cartService.addToCart(variationId, quantity);
            await fetchCart(); // Lấy lại giỏ hàng mới nhất sau khi thêm
            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to add item to cart.";
            setError(errorMessage);
            console.error("Add to cart error:", errorMessage);
            setIsLoading(false); // Dừng loading nếu có lỗi
            return false;
        }
    };

    /**
     * Xóa một sản phẩm khỏi giỏ hàng và fetch lại dữ liệu mới.
     * @param {number} variationId - ID của biến thể sản phẩm.
     * @returns {Promise<boolean>} True nếu thành công, ngược lại là false.
     */
    const removeItemFromCart = async (variationId) => {
        setIsLoading(true);
        setError(null);
        try {
            await cartService.removeFromCart(variationId);
            await fetchCart(); // Lấy lại giỏ hàng mới nhất sau khi xóa
            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to remove item from cart.";
            setError(errorMessage);
            console.error("Remove from cart error:", errorMessage);
            setIsLoading(false); // Dừng loading nếu có lỗi
            return false;
        }
    };

    /**
     * Xóa tất cả sản phẩm khỏi giỏ hàng.
     * @returns {Promise<boolean>} True nếu thành công, ngược lại là false.
     */
    const clearCart = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await cartService.removeAllFromCart();
            await fetchCart(); // Giỏ hàng sẽ trống sau khi fetch lại
            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to clear cart.";
            setError(errorMessage);
            console.error("Clear cart error:", errorMessage);
            setIsLoading(false);
            return false;
        }
    };

    // Giá trị được cung cấp cho các component con
    const value = {
        cart,
        isLoading,
        error,
        addItemToCart,
        removeItemFromCart,
        clearCart,
        fetchCart // Có thể cung cấp hàm fetchCart để refresh giỏ hàng thủ công nếu cần
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// 3. Tạo Custom Hook
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};