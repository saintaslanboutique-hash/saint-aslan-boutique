/** Discount as percentage off the base price (0 = no sale, 1–100 = percent off). */
export const PRODUCT_SALE_PERCENT_MAX = 100;

export function normalizeSalePercent(
    sale: number | undefined | null
): number {
    if (sale == null || Number.isNaN(Number(sale))) return 0;
    return Math.min(
        PRODUCT_SALE_PERCENT_MAX,
        Math.max(0, Math.round(Number(sale)))
    );
}

/** True when `sale` is a positive discount percent (1–100). */
export function isProductOnSale(product: { sale?: number }): boolean {
    const s = normalizeSalePercent(product.sale);
    return s > 0;
}

/**
 * Final unit price after applying `sale` percent off `price`.
 * Base `price` is the original (pre-discount) amount.
 */
export function getDiscountedUnitPrice(
    price: number,
    salePercent: number | undefined | null
): number {
    const base = Math.max(0, Number(price) || 0);
    const sale = normalizeSalePercent(salePercent);
    if (sale <= 0) return Math.round(base * 100) / 100;
    const factor = 1 - sale / 100;
    return Math.round(base * factor * 100) / 100;
}

export type Product = {
    name: {
        az: string;
        en: string;
        ru: string;
    };
    price: number;
    description: {
        az: string;
        en: string;
        ru: string;
    };
    image?: string;
    images?: string[];
    variants?: {
        color: string;
        size: string;
        stock: number;
    }[];
    subcategoryId: string;
    quantity: number;
    /** Percentage off base price (0–100). Omitted or 0 means no discount. */
    sale?: number;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string

    preOrder?: boolean;
    currency?: string;
};