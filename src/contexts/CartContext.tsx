import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem } from "@/types/tour";
import { getReferralCode } from "@/lib/referral";
import { dashboardUsersService } from "@/lib/supabase/dashboard-users";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (tourId: string) => void;
  updateItem: (tourId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
  referralCode: string | null;
  referralUser: any | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [referralUser, setReferralUser] = useState<any | null>(null);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    // Cargar información del usuario de referido si existe código
    const loadReferralUser = async () => {
      const code = getReferralCode();
      if (code) {
        try {
          const user = await dashboardUsersService.getByReferralCode(code);
          setReferralUser(user);
        } catch (error) {
          console.error("Error loading referral user:", error);
        }
      } else {
        setReferralUser(null);
      }
    };
    loadReferralUser();
  }, []);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.tour.id === item.tour.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = item;
        return updated;
      }
      return [...prev, item];
    });
  };

  const removeItem = (tourId: string) => {
    setItems((prev) => prev.filter((item) => item.tour.id !== tourId));
  };

  const updateItem = (tourId: string, updates: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.tour.id === tourId ? { ...item, ...updates } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce(
    (sum, item) => sum + item.adults + item.children + item.infants,
    0
  );

  const toursSubtotal = items.reduce((sum, item) => {
    const tourTotal =
      item.tour.priceAdult * item.adults +
      item.tour.priceChild * item.children +
      item.tour.priceInfant * item.infants;
    return sum + tourTotal;
  }, 0);

  const extrasSubtotal = items.reduce((sum, item) => {
    const itemExtrasTotal = (item.extras || []).reduce((s, extra) => s + extra.price, 0);
    return sum + itemExtrasTotal;
  }, 0);

  // Incluye accesorios; el descuento por referido solo aplica sobre el precio del tour.
  const totalPrice = toursSubtotal + extrasSubtotal;

  const referralCode = getReferralCode();
  const discountPercentage = referralUser?.discount_percentage || 0;
  const discountAmount = (toursSubtotal * discountPercentage) / 100;
  const finalPrice = totalPrice - discountAmount;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItem,
        clearCart,
        totalItems,
        totalPrice,
        discountPercentage,
        discountAmount,
        finalPrice,
        referralCode,
        referralUser,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
