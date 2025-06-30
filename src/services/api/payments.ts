import { wcApi } from './config';

export const paymentService = {
  async getPaymentMethods() {
    try {
      const response = await wcApi.get('/payment_gateways');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createPayment(orderData: any) {
    try {
      const response = await wcApi.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Novo método para pagamento com pontos
  async payWithPoints(orderId: string, userId: string, points: number) {
    try {
      const response = await wcApi.post(`/pontos-vicere/v1/payment/points`, {
        order_id: orderId,
        user_id: userId,
        points: points
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Novo método para pagamento PIX
  async createPixPayment(userId: string, amount: number) {
    try {
      const response = await wcApi.post(`/pontos-vicere/v1/payment/pix`, {
        user_id: userId,
        amount: amount
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};