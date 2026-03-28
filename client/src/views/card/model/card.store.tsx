import { Product, getDiscountedUnitPrice } from "@/src/entities/product/types/product.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import cartAPI from "../service/card.api";

/** Product with id from API (Mongo _id) */
type ProductWithId = Product & { _id?: string };

function getProductId(p: ProductWithId): string {
  return (p as { _id?: string })._id ?? (p as { id?: string }).id ?? "";
}

/** Same key as server `cartLineKey`: product + optional variant subdoc id. */
export function cartLineKey(productId: string, variantId?: string): string {
  return `${productId}:${variantId ?? ""}`;
}

/** Picks explicit variant or first variant’s id — same rule the server expects for orders. */
export function resolveVariantIdForCart(product: ProductWithId, explicit?: string): string | undefined {
  if (explicit) return String(explicit);
  const v = product.variants;
  if (!v?.length) return undefined;
  const first = v[0] as { _id?: string; id?: string };
  const id = first._id ?? first.id;
  return id != null ? String(id) : undefined;
}

export interface CartItem {
  product: ProductWithId;
  quantity: number;
  /** Mongo id of selected variant when product has variants. */
  variantId?: string;
}

interface CartState {
    items: CartItem[];
    isSyncing: boolean;
    isLoading: boolean;
    userId: string | null;

    addItem: (product: Product, quantity: number, variantId?: string) => Promise<void>;
    removeItem: (productId: string, variantId?: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number, variantId?: string) => Promise<void>;
    clearCart: () => Promise<void>;
    getTotalPrice: () => number;
    getTotalItems: () => number;
    syncWithServer: () => Promise<void>;
    loadFromServer: (userId: string) => Promise<void>;
    loadAndMergeFromServer: (userId: string) => Promise<void>;
    clearForLogout: () => void;
    clearForUserSwitch: () => void;
    clearCompletely: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isSyncing: false,
            isLoading: false,
            userId: null,

            addItem: async (product, quantity, variantId) => {
                const p = product as ProductWithId;
                const id = getProductId(p);
                const resolvedVariant = resolveVariantIdForCart(p, variantId);
                const key = cartLineKey(id, resolvedVariant);
                set((state) => {
                    const existing = state.items.find(
                        (i) => cartLineKey(getProductId(i.product as ProductWithId), i.variantId) === key
                    );
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                cartLineKey(getProductId(i.product as ProductWithId), i.variantId) === key
                                    ? { ...i, quantity: i.quantity + quantity }
                                    : i
                            ),
                        };
                    }
                    return {
                        items: [
                            ...state.items,
                            {
                                product: p,
                                quantity,
                                ...(resolvedVariant && { variantId: resolvedVariant }),
                            },
                        ],
                    };
                });
                await get().syncWithServer();
            },

            removeItem: async (productId, variantId) => {
                const key = cartLineKey(productId, variantId);
                set((state) => ({
                    items: state.items.filter(
                        (i) => cartLineKey(getProductId(i.product as ProductWithId), i.variantId) !== key
                    ),
                }));
                await get().syncWithServer();
            },

            updateQuantity: async (productId, quantity, variantId) => {
                if (quantity < 1) return;
                const key = cartLineKey(productId, variantId);
                set((state) => ({
                    items: state.items.map((i) =>
                        cartLineKey(getProductId(i.product as ProductWithId), i.variantId) === key
                            ? { ...i, quantity }
                            : i
                    ),
                }));
                await get().syncWithServer();
            },

            clearCart: async () => {
                set({ items: [] });
                const token = localStorage.getItem("token");
                if (token) {
                    try { await cartAPI.clearCart(); }
                    catch (error) { console.error("Failed to clear cart on server:", error); }
                }
            },

            getTotalPrice: () =>
                get().items.reduce(
                    (total, i) =>
                        total +
                        getDiscountedUnitPrice(i.product.price ?? 0, i.product.sale) * i.quantity,
                    0
                ),
            getTotalItems: () => get().items.reduce((total, i) => total + i.quantity, 0),

            syncWithServer: async () => {
                const token = localStorage.getItem("token");
                const userId = get().userId;
                if (!token || !userId || get().isSyncing) return;

                try {
                    set({ isSyncing: true });
                    await cartAPI.updateCart(get().items);
                } catch (error) {
                    console.error("Failed to sync cart with server:", error);
                } finally {
                    set({ isSyncing: false });
                }
            },

            loadFromServer: async (userId: string) => {
                set({ isLoading: true });
                try {
                    const response = await cartAPI.getCart();
                    const cartItems: CartItem[] = (response.data || [])
                        .filter((i) => i.productData)
                        .map((i) => {
                            const product = i.productData as ProductWithId;
                            const variantId =
                                (i.variantId && String(i.variantId)) ||
                                resolveVariantIdForCart(product, undefined);
                            return {
                                product,
                                quantity: i.quantity,
                                ...(variantId && { variantId }),
                            };
                        });
                    set({ items: cartItems, userId });
                } catch (error) {
                    console.error("Failed to load cart from server:", error);
                    set({ items: [], userId: null });
                } finally {
                    set({ isLoading: false });
                }
            },

            loadAndMergeFromServer: async (userId: string) => {
                set({ isLoading: true });
                try {
                    const localItems = get().items;
                    const response = await cartAPI.getCart();
                    const serverItems: CartItem[] = (response.data || [])
                        .filter((i) => i.productData)
                        .map((i) => {
                            const product = i.productData as ProductWithId;
                            const variantId =
                                (i.variantId && String(i.variantId)) ||
                                resolveVariantIdForCart(product, undefined);
                            return {
                                product,
                                quantity: i.quantity,
                                ...(variantId && { variantId }),
                            };
                        });

                    const mergedItems = [...serverItems];

                    for (const localItem of localItems) {
                        const localId = getProductId(localItem.product as ProductWithId);
                        const localKey = cartLineKey(localId, localItem.variantId);
                        const existingIndex = mergedItems.findIndex(
                            (item) =>
                                cartLineKey(
                                    getProductId(item.product as ProductWithId),
                                    item.variantId
                                ) === localKey
                        );
                        if (existingIndex >= 0) {
                            mergedItems[existingIndex] = {
                                ...mergedItems[existingIndex],
                                quantity: mergedItems[existingIndex].quantity + localItem.quantity,
                            };
                        } else {
                            mergedItems.push(localItem);
                        }
                    }

                    set({ items: mergedItems, userId });
                    if (mergedItems.length > 0) {
                        await cartAPI.updateCart(mergedItems);
                    }
                } catch (error) {
                    console.error("Failed to merge cart with server:", error);
                    set({ userId });
                } finally {
                    set({ isLoading: false });
                }
            },


            clearForLogout: () => set({ items: [], userId: null, isSyncing: false, isLoading: false }),
            clearForUserSwitch: () => set({ items: [], userId: null, isSyncing: false, isLoading: false }),
            clearCompletely: () => {
                set({ items: [], userId: null, isSyncing: false, isLoading: false });
                localStorage.removeItem('cart-storage');
            },
        }),
        {
            name: "cart-storage",
            partialize: (state) => ({ items: state.items, userId: state.userId }),
            version: 1,
        }
    )
);
