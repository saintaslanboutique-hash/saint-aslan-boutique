import { create } from "zustand";
import { Product } from "./model.types";

type ProductWithId = Product & { _id?: string };

interface ProductStore {
  /** Current product for detail page */
  product: ProductWithId | null;
  setProduct: (product: ProductWithId | null) => void;

  /** Wishlisted by product id (reusable for cards and detail page) */
  wishlistedByProductId: Record<string, boolean>;
  setWishlisted: (productId: string, value: boolean) => void;
  toggleWishlisted: (productId: string) => void;

  /** Selected color index by product id */
  selectedColorIndexByProductId: Record<string, number>;
  setSelectedColorIndex: (productId: string, index: number) => void;

  /** Selected size index by product id */
  selectedSizeIndexByProductId: Record<string, number>;
  setSelectedSizeIndex: (productId: string, index: number) => void;

  /** Selected image index for detail page gallery (main image) */
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;

  /** Reset UI state when leaving product or switching product (e.g. clear selectedImageIndex) */
  resetProductUI: () => void;
}

function getProductId(p: ProductWithId | null): string | null {
  return p?._id ?? null;
}

export const useProductStore = create<ProductStore>((set) => ({
  product: null,
  setProduct: (product) =>
    set((state) => ({
      product,
      selectedImageIndex:
        getProductId(product) !== getProductId(state.product)
          ? 0
          : state.selectedImageIndex,
    })),

  wishlistedByProductId: {},
  setWishlisted: (productId, value) =>
    set((state) => ({
      wishlistedByProductId: {
        ...state.wishlistedByProductId,
        [productId]: value,
      },
    })),
  toggleWishlisted: (productId) =>
    set((state) => ({
      wishlistedByProductId: {
        ...state.wishlistedByProductId,
        [productId]: !state.wishlistedByProductId[productId],
      },
    })),

  selectedColorIndexByProductId: {},
  setSelectedColorIndex: (productId, index) =>
    set((state) => ({
      selectedColorIndexByProductId: {
        ...state.selectedColorIndexByProductId,
        [productId]: index,
      },
    })),

  selectedSizeIndexByProductId: {},
  setSelectedSizeIndex: (productId, index) =>
    set((state) => ({
      selectedSizeIndexByProductId: {
        ...state.selectedSizeIndexByProductId,
        [productId]: index,
      },
    })),

  selectedImageIndex: 0,
  setSelectedImageIndex: (index) => set({ selectedImageIndex: index }),

  resetProductUI: () => set({ selectedImageIndex: 0 }),
}));
