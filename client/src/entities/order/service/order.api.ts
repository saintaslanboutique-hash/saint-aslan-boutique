import { api } from '@/src/shared/api/api-instanse';
import type { CreateOrderPayload, Order } from '@/src/entities/order/types/order.types';

const orderApi = {
    getOrders: async (): Promise<{ data: Order[] }> => {
        const response = await api.get<{ data: Order[] }>('/orders');
        return response.data;
    },

    getOrderById: async (id: string): Promise<{ data: Order }> => {
        const response = await api.get<{ data: Order }>(`/orders/${id}`);
        return response.data;
    },

    createOrder: async (payload: CreateOrderPayload): Promise<{ data: Order }> => {
        const response = await api.post<{ data: Order }>('/orders', payload);
        return response.data;
    },

    /** Cancels order (DELETE); server restores stock for pending/processing orders. */
    cancelOrder: async (id: string): Promise<{ data: Order }> => {
        const response = await api.delete<{ data: Order }>(`/orders/${id}`);
        return response.data;
    },
};

export default orderApi;
