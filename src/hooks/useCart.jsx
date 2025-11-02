import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as cartService from '../services/cartService'; // Đảm bảo đường dẫn chính xác
// Giả sử bạn có một hook để kiểm tra trạng thái đăng nhập của người dùng
// import { useAuth } from './useAuth'; 

// 1. Tạo Context để chia sẻ trạng thái giỏ hàng
const CartContext = createContext(null);

// 2. Tạo Provider Component: Component này sẽ bao bọc toàn bộ ứng dụng của bạn
// Nó chịu trách nhiệm quản lý state và logic của giỏ hàng.
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null); // State chứa dữ liệu giỏ hàng
    const [isLoading, setIsLoading] = useState(true); // State cho trạng thái loading
    const [error, setError] = useState(null); // State cho lỗi

    // Giả lập hook useAuth, bạn nên thay thế bằng hook xác thực thực tế của mình
    const { isAuthenticated } = { isAuthenticated: !!localStorage.getItem('authToken') }; // useAuth();

    /**
     * Hàm lấy dữ liệu giỏ hàng từ server.
     * Được bọc trong useCallback để tránh tạo lại hàm không cần thiết ở mỗi lần render.
     */
    const fetchCart = useCallback(async () => {
        // Chỉ fetch giỏ hàng khi người dùng đã đăng nhập
        if (!isAuthenticated) {
            setCart(null); // Xóa dữ liệu giỏ hàng nếu người dùng đăng xuất
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const cartData = await cartService.getUserCart();
            setCart(cartData);
        } catch (err) {
            const errorMessage = err.response?.data || "Không thể tải giỏ hàng. Vui lòng thử lại.";
            setError(errorMessage);
            console.error("Fetch cart error:", errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]); // Phụ thuộc vào trạng thái đăng nhập

    // Tự động fetch giỏ hàng khi component được mount hoặc khi trạng thái đăng nhập thay đổi
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    /**
     * Thêm một sản phẩm vào giỏ hàng và fetch lại dữ liệu mới.
     * @param {number} variationId - ID của biến thể sản phẩm.
     * @param {number} quantity - Số lượng.
     * @returns {Promise<{success: boolean, message: string}>} Một object cho biết kết quả.
     */
    const addItemToCart = async (variationId, quantity = 1) => {
        setIsLoading(true);
        try {
            const message = await cartService.addToCart(variationId, quantity);
            await fetchCart(); // Lấy lại giỏ hàng mới nhất sau khi thêm
            return { success: true, message };
        } catch (err) {
            const errorMessage = err.response?.data || "Thêm sản phẩm vào giỏ hàng thất bại.";
            setError(errorMessage);
            console.error("Add to cart error:", errorMessage);
            setIsLoading(false); // Dừng loading nếu có lỗi
            return { success: false, message: errorMessage };
        }
    };

    /**
     * Xóa một sản phẩm khỏi giỏ hàng và fetch lại dữ liệu mới.
     * @param {number} variationId - ID của biến thể sản phẩm.
     * @returns {Promise<{success: boolean, message: string}>} Một object cho biết kết quả.
     */
    const removeItemFromCart = async (variationId) => {
        setIsLoading(true);
        try {
            const message = await cartService.removeFromCart(variationId);
            await fetchCart(); // Lấy lại giỏ hàng mới nhất sau khi xóa
            return { success: true, message };
        } catch (err) {
            const errorMessage = err.response?.data || "Xóa sản phẩm khỏi giỏ hàng thất bại.";
            setError(errorMessage);
            console.error("Remove from cart error:", errorMessage);
            setIsLoading(false);
            return { success: false, message: errorMessage };
        }
    };

    /**
     * Xóa tất cả sản phẩm khỏi giỏ hàng.
     * @returns {Promise<{success: boolean, message: string}>} Một object cho biết kết quả.
     */
    const clearCart = async () => {
        setIsLoading(true);
        try {
            const message = await cartService.clearCart();
            setCart([]); // Cập nhật giỏ hàng thành rỗng ngay lập tức để giao diện phản hồi nhanh
            return { success: true, message };
        } catch (err) {
            const errorMessage = err.response?.data || "Xóa giỏ hàng thất bại.";
            setError(errorMessage);
            console.error("Clear cart error:", errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const updateItemQuantityInCart = async (variationId, newQuantity) => {
        setIsLoading(true);
        try {
            // Nếu số lượng mới <= 0, coi như là xóa
            if (newQuantity <= 0) {
                return await removeItemFromCart(variationId);
            }
            const message = await cartService.updateItemQuantity(variationId, newQuantity);
            await fetchCart(); // Tải lại giỏ hàng
            return { success: true, message };
        } catch (err) {
            const errorMessage = err.response?.data || "Cập nhật số lượng thất bại.";
            setError(errorMessage);
            // Quan trọng: Không dừng loading để giao diện không bị "nhảy" về số lượng cũ
            // fetchCart() sẽ được gọi trong finally để cập nhật lại đúng trạng thái
            return { success: false, message: errorMessage };
        } finally {
            // Luôn fetch lại giỏ hàng để đảm bảo dữ liệu trên UI là mới nhất, kể cả khi có lỗi
            await fetchCart();
            setIsLoading(false);
        }
    };

    // Giá trị được cung cấp cho các component con thông qua Context
    const value = {
        cart,
        isLoading,
        error,
        addItemToCart,
        removeItemFromCart,
        updateItemQuantityInCart,
        clearCart,
        fetchCart // Cung cấp hàm fetchCart để có thể refresh giỏ hàng thủ công nếu cần
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// 3. Tạo Custom Hook: Đây là hook mà các component sẽ sử dụng
// Nó giúp lấy context một cách an toàn và ngắn gọn.
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};