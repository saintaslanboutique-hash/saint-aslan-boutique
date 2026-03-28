import type { Product } from '@/src/entities/product/types/product.types';

export interface OrderLineProductData {
    name?: Product['name'];
    image?: string;
    images?: string[];
    variant?: { color?: string; size?: string };
}

export interface OrderItem {
    product?: Product & { _id?: string };
    productData?: OrderLineProductData;
    quantity: number;
    price: number;
    variantId?: string;
}

export interface Order {
    _id: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
    paymentMethod?: string;
    paymentStatus?: 'unpaid' | 'paid' | 'refunded';
    createdAt: string;
    updatedAt?: string;
}

export interface CreateOrderPayload {
    items: { product: string; quantity: number; variantId?: string }[];
    shippingAddress?: {
        address: string;
        city?: string;
        country?: string;
        postalCode?: string;
        phone?: string;
    };
    paymentMethod?: 'card' | 'cash' | 'paypal' | 'other';
    notes?: string;
}
