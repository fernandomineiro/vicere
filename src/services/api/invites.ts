import { wcApi } from './config';

export const invitesService = {
  async generateInvite(userId: string) {
    try {
      const response = await wcApi.post(`/pontos-vicere/v1/invites/generate`, {
        user_id: userId
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getUserInvites(userId: string) {
    try {
      const response = await wcApi.get(`/pontos-vicere/v1/invites/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async validateInvite(code: string) {
    try {
      const response = await wcApi.post(`/pontos-vicere/v1/invites/validate`, {
        code
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async acceptInvite(code: string, userId: string) {
    try {
      const response = await wcApi.post(`/pontos-vicere/v1/invites/accept`, {
        code,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};