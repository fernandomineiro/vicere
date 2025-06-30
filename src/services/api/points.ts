import { wcApi } from './config';

export const pointsService = {
  async getBalance(userId: string) {
    try {
      const response = await wcApi.get(`/pontos-vicere/v1/balance/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getHistory(userId: string) {
    try {
      const response = await wcApi.get(`/pontos-vicere/v1/history/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async transferPoints(fromUserId: string, toUserId: string, amount: number) {
    try {
      const response = await wcApi.post('/pontos-vicere/v1/transfer', {
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async withdrawPoints(userId: string, amount: number, pixKey: string) {
    try {
      const response = await wcApi.post('/pontos-vicere/v1/withdraw', {
        user_id: userId,
        amount,
        pix_key: pixKey
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async buyPoints(userId: string, amount: number) {
    try {
      const response = await wcApi.post('/pontos-vicere/v1/buy', {
        user_id: userId,
        amount
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};