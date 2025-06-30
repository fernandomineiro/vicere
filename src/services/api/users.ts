import { wcApi } from './config';

export const userService = {
  async getUserProfile(userId: string) {
    try {
      const response = await wcApi.get(`/customers/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateUserProfile(userId: string, userData: any) {
    try {
      const response = await wcApi.put(`/customers/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Novo método para obter informações completas do usuário incluindo pontos
  async getUserFullProfile(userId: string) {
    try {
      const response = await wcApi.get(`/pontos-vicere/v1/users/${userId}/profile`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Novo método para atualizar preferências de notificação
  async updateNotificationPreferences(userId: string, preferences: {
    points_earned: boolean,
    points_spent: boolean,
    points_transfer: boolean,
    points_expiring: boolean
  }) {
    try {
      const response = await wcApi.put(`/pontos-vicere/v1/users/${userId}/notifications`, preferences);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};