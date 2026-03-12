import { create } from "zustand";
import { Product } from "./model.types";

import productApi from "../api/api";

type ProductWithId = Product & { _id?: string };

type ProductState = {
  products: ProductWithId[];
  isLoading: boolean;
  error: string | null;
  selectedProduct: ProductWithId | null;
  fetchProducts: (subcategoryId?: string) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  createProduct: (
    product: Omit<Product, "createdAt" | "updatedAt">
  ) => Promise<ProductWithId | undefined>;
  updateProduct: (
    id: string,
    update: Partial<Product>
  ) => Promise<ProductWithId | undefined>;
  deleteProduct: (id: string) => Promise<boolean>;
  clearSelectedProduct: () => void;
};

function isError(e: unknown): e is { message: string } {
  return typeof e === "object" && e !== null && "message" in e && typeof (e as { message: string }).message === "string";
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,
  error: null,
  selectedProduct: null,

  fetchProducts: async (subcategoryId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const products = await productApi.getAllProducts(subcategoryId) as ProductWithId[];
      set({ products, isLoading: false });
    } catch (error: unknown) {
      set({
        error:
          isError(error) ? error.message : "Failed to fetch products",
        isLoading: false,
      });
    }
  },

  fetchProductById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const product = await productApi.getProductById(id) as ProductWithId;
      set({ selectedProduct: product, isLoading: false });
    } catch (error: unknown) {
      set({
        error:
          isError(error) ? error.message : "Failed to fetch product",
        isLoading: false,
      });
    }
  },

  createProduct: async (
    product: Omit<Product, "createdAt" | "updatedAt">
  ) => {
    set({ isLoading: true, error: null });
    try {
      const newProduct = await productApi.createProduct(product) as ProductWithId;
      set((state) => ({
        products: [...state.products, newProduct],
        isLoading: false,
      }));
      return newProduct;
    } catch (error: unknown) {
      set({
        error:
          isError(error) ? error.message : "Failed to create product",
        isLoading: false,
      });
    }
  },

  updateProduct: async (id: string, update: Partial<Product>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProduct = await productApi.updateProduct(id, update) as ProductWithId;
      set((state) => ({
        products: state.products.map((p) =>
          p._id === updatedProduct._id ? updatedProduct : p
        ),
        isLoading: false,
      }));
      return updatedProduct;
    } catch (error: unknown) {
      set({
        error:
          isError(error) ? error.message : "Failed to update product",
        isLoading: false,
      });
    }
  },

  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await productApi.deleteProduct(id);
      set((state) => ({
        products: state.products.filter((p) => p._id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error: unknown) {
      set({
        error:
          isError(error) ? error.message : "Failed to delete product",
        isLoading: false,
      });
      return false;
    }
  },

  clearSelectedProduct: () => {
    set({ selectedProduct: null });
  },
}));