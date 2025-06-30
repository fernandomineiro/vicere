import { wcApi } from './config';

export const orderService = {
  async getUserOrders(userId: string) {
    try {
      const response = await wcApi.get('/orders', {
        params: {
          customer: userId
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getOrderDetails(orderId: string) {
    try {
      const response = await wcApi.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Novo método para obter pontos ganhos em um pedido
  async getOrderPoints(orderId: string) {
    try {
      const response = await wcApi.get(`/pontos-vicere/v1/orders/${orderId}/points`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Novo método para calcular pontos de um carrinho
  async calculateCartPoints(items: Array<{product_id: string, quantity: number}>) {
    try {
      const response = await wcApi.post('/pontos-vicere/v1/cart/calculate-points', {
        items
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};