import { wcApi } from './config';

export const cardsService = {
  async getUserCards(userId: string) {
    try {
      const response = await wcApi.get(`/pontos-vicere/v1/cards/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async addCard(userId: string, cardData: {
    first_digits: string,
    last_digits: string,
    type: string,
    brand: string
  }) {
    try {
      const response = await wcApi.post(`/pontos-vicere/v1/cards/${userId}`, cardData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async removeCard(userId: string, cardId: string) {
    try {
      const response = await wcApi.delete(`/pontos-vicere/v1/cards/${userId}/${cardId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};