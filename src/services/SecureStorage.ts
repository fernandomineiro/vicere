import * as SecureStore from 'expo-secure-store';

class SecureStorage {
  async setItem(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Erro detalhado do SecureStorage:', {
        erro: error,
        stack: error.stack,
        mensagem: error.message,
        contexto: { chave: key }
      });
    }
  }

  async getItem(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Erro ao ler do SecureStorage:', error);
      return null;
    }
  }

  async removeItem(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Erro ao remover do SecureStorage:', error);
    }
  }
}

export default new SecureStorage();