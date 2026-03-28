import { api } from '@/src/shared/api/api-instanse';
import type { PaymentInitResponse } from '../types/payment.types';

const paymentApi = {
    initPayment: async (amount: number, orderId: string): Promise<PaymentInitResponse> => {
        const response = await api.post<PaymentInitResponse>('/pay/init', { amount, orderId });
        return response.data;
    },
};

export default paymentApi;
