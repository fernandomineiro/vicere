import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, wcApi, WORDPRESS_API } from './config';

const logRequest = (method: string, url: string, data?: any) => {
  if (url.includes('/auth')) {
    // Log apenas usuário e senha na autenticação
    console.log('Auth Request:', {
      url,
      method,
      credentials: {
        login: data?.login,
        password: '******'
      }
    });
  } else if (url.includes('/validate')) {
    // Log apenas o token na validação
    console.log('Validate Request:', {
      url,
      method,
      token: data?.JWT
    });
  }
};

const logResponse = (url: string, response: any) => {
  if (url.includes('/auth')) {
    // Log da resposta de autenticação com JWT completo
    console.log('Auth Response:', {
      success: response.success,
      data: response.data
    });
  } else if (url.includes('/validate')) {
    // Log apenas os dados do usuário na resposta de validação
    console.log('Validate Response:', {
      success: response.success,
      data: response.data ? {
        ID: response.data.ID,
        user_login: response.data.user_login,
        user_nicename: response.data.user_nicename,
        user_email: response.data.user_email,
        user_url: response.data.user_url,
        user_registered: response.data.user_registered,
        user_status: response.data.user_status,
        display_name: response.data.display_name
      } : null
    });
  }
};

// Interface para dados da sessão WordPress
interface WordPressSession {
  user_id: number;
  token: string;
  timestamp: number;
  nonce: string;
  wordpress_session: string;
}

// Funções auxiliares para gerenciamento da sessão
export const sessionManager = {
  async getSession(): Promise<WordPressSession | null> {
    try {
      const sessionData = await AsyncStorage.getItem('wordpress_session');
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Erro ao recuperar sessão:', error);
      return null;
    }
  },

  async isSessionValid(): Promise<boolean> {
    const session = await this.getSession();
    if (!session) return false;
    
    // Verifica se a sessão expirou (24 horas)
    const now = new Date().getTime();
    const sessionAge = now - session.timestamp;
    const sessionValid = sessionAge < 24 * 60 * 60 * 1000; // 24 horas em milissegundos
    
    if (!sessionValid) {
      await this.clearSession();
    }
    
    return sessionValid;
  },

  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem('wordpress_session');
      api.defaults.headers.common['X-WP-Session'] = undefined;
      wcApi.defaults.headers.common['X-WP-Session'] = undefined;
    } catch (error) {
      console.error('Erro ao limpar sessão:', error);
    }
  },

  async restoreSession(): Promise<boolean> {
    const session = await this.getSession();
    if (!session) return false;
    
    const isValid = await this.isSessionValid();
    if (!isValid) return false;
    
    // Restaura os headers da sessão
    api.defaults.headers.common['X-WP-Session'] = session.wordpress_session;
    wcApi.defaults.headers.common['X-WP-Session'] = session.wordpress_session;
    return true;
  }
};

export const authService = {
  async logout() {
    try {
      // Remove dados de autenticação
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      // Remove headers de autenticação
      api.defaults.headers.common['Authorization'] = undefined;
      wcApi.defaults.headers.common['Authorization'] = undefined;
      
      // Limpa a sessão do WordPress
      await sessionManager.clearSession();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  },
  createAnonymousUser() {
    return {
      points_profile: {
        balance: 0,
        vicoins: 0,
        total_earned: 0,
        total_spent: 0
      }
    };
  },
  async login(username: string, password: string) {
    try {
      // 1. Autenticação básica para obter o token
      const authUrl = `${WORDPRESS_API.BASE_URL}?rest_route=/simple-jwt-login/v1/auth`;
      logRequest('post', authUrl, { login: username, password: '******' });
      
      const authResponse = await api.post(authUrl, {
        login: username,
        password,
      });
      logResponse(authUrl, authResponse.data);

      if (!authResponse.data.success) {
        console.error('Falha na autenticação:', authResponse.data);
        throw new Error(authResponse.data.message || 'Falha na autenticação');
      }

      if (!authResponse.data.data) {
        console.error('Resposta da autenticação inválida:', authResponse.data);
        throw new Error('Resposta da autenticação inválida');
      }

      // 2. Extrai e valida o token JWT
      const token = authResponse.data.data.jwt;
      if (!token) {
        console.error('Token não encontrado na resposta');
        throw new Error('Token não encontrado');
      }

      // 3. Configura o token para próximas requisições
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      wcApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // 4. Valida o token e obtém dados básicos do usuário
      const validateUrl = `${WORDPRESS_API.BASE_URL}?rest_route=/simple-jwt-login/v1/auth/validate&JWT=${token}`;
      logRequest('get', validateUrl, { JWT: token });
      
      const validateResponse = await api.get(validateUrl);
      logResponse(validateUrl, validateResponse.data);

      if (!validateResponse.data.success || !validateResponse.data.data) {
        throw new Error('Falha ao validar token');
      }

      // 5. Obtém dados básicos do usuário após validação
      const userData = validateResponse.data.data.user;
      if (!userData || !userData.ID) {
        throw new Error('Dados do usuário inválidos');
      }

      // Cria e armazena a sessão localmente
      const sessionData = {
        user_id: userData.ID,
        token: token,
        timestamp: new Date().getTime(),
        nonce: Math.random().toString(36).substring(2, 15),
        wordpress_session: `wp_${userData.ID}_${Math.random().toString(36).substring(2, 15)}`
      };
      
      // Armazena os dados da sessão
      await AsyncStorage.setItem('wordpress_session', JSON.stringify(sessionData));
      
      // Adiciona o header da sessão para requisições WordPress
      api.defaults.headers.common['X-WP-Session'] = sessionData.wordpress_session;
      wcApi.defaults.headers.common['X-WP-Session'] = sessionData.wordpress_session;



      // 6. Busca dados complementares do usuário
      const userDataUrl = `https://api.vicere.com.br/get_user_data_wp.php?user_id=${userData.ID}`;
      logRequest('get', userDataUrl);
      const userDataResponse = await api.get(userDataUrl);
      logResponse(userDataUrl, userDataResponse.data);

      const customerData = userDataResponse.data.customer;
      const userMeta = userDataResponse.data.meta;

      // 7. Processa os dados do usuário
      const pointsProfile = {
        balance: 0,
        vicoins: 0,
        total_earned: 0,
        total_spent: 0
      };

      // 8. Monta e retorna o objeto com dados completos do usuário
      const userReturn = {
        token,
        user: {
          id: Number(userData.ID), // Garante que o ID seja um número
          email: customerData?.email || userData.user_email,
          first_name: customerData?.first_name || userData.display_name,
          last_name: customerData?.last_name || '',
          points_profile: pointsProfile
        }
      };
      console.log('Dados do usuário para retorno:', userReturn);
      return userReturn;
    } catch (error: any) {
      console.error('[API Error] Erro no login:', error.response?.data || error.message);
      throw error;
    }
  },

  async validateToken(token: string) {
    try {
      const validateUrl = `${WORDPRESS_API.BASE_URL}?rest_route=/simple-jwt-login/v1/auth/validate&JWT=${token}`;
      logRequest('get', validateUrl, { JWT: token });
      
      // Validar token JWT e obter dados do usuário
      const validateResponse = await api.get(validateUrl);
      logResponse(validateUrl, validateResponse.data);

      if (!validateResponse.data.success) {
        throw new Error('Token inválido');
      }

      const userData = validateResponse.data.data;
      if (!userData || !userData.ID) {
        throw new Error('Dados do usuário não encontrados na resposta de validação');
      }
      
      // Obter dados do cliente WooCommerce usando o ID do usuário WordPress
      const customerUrl = `/customers/${userData.ID}`;
      logRequest('get', customerUrl);
      const customerResponse = await wcApi.get(customerUrl);
      logResponse(customerUrl, customerResponse.data);

      // Busca pontos do usuário diretamente dos metadados
      const points = customerResponse.data.meta_data?.find(meta => meta.key === 'pontos_vicere')?.value || 0;
      const vicoins = customerResponse.data.meta_data?.find(meta => meta.key === 'vicoins_vicere')?.value || 0;
      const pointsProfile = {
        balance: Number(points),
        vicoins: Number(vicoins),
        total_earned: Number(points),
        total_spent: 0
      };

      return {
        token,
        user: {
          id: userData.ID,
          email: userData.user_email,
          first_name: customerResponse.data.first_name || userData.display_name,
          last_name: customerResponse.data.last_name || '',
          points_profile: pointsProfile
        }
      };
    } catch (error: any) {
      console.error('[API Error] Erro na validação do token:', error.response?.data || error.message);
      throw error;
    }
  },

  async refreshUserData(userId: string) {
    try {
      // Obter dados atualizados do usuário WordPress
      const userUrl = `/wp/v2/users/${userId}`;
      logRequest('get', userUrl);
      const userResponse = await api.get(userUrl);
      logResponse(userUrl, userResponse.data);
      
      // Obter dados atualizados do cliente WooCommerce
      const customerUrl = `/customers/${userId}`;
      logRequest('get', customerUrl);
      const customerResponse = await wcApi.get(customerUrl);
      logResponse(customerUrl, customerResponse.data);
      
      // Busca pontos do usuário diretamente dos metadados
      const points = customerResponse.data.meta_data?.find(meta => meta.key === 'pontos_vicere')?.value || 0;
      const vicoins = customerResponse.data.meta_data?.find(meta => meta.key === 'vicoins_vicere')?.value || 0;
      const pointsProfile = {
        balance: Number(points),
        vicoins: Number(vicoins),
        total_earned: Number(points),
        total_spent: 0
      };

      return {
        user: {
          id: userResponse.data.id,
          email: userResponse.data.email,
          first_name: customerResponse.data.first_name || userResponse.data.first_name,
          last_name: customerResponse.data.last_name || userResponse.data.last_name,
          points_profile: pointsProfile
        }
      };
    } catch (error: any) {
      console.error('[API Error] Erro ao atualizar dados do usuário:', error.response?.data || error.message);
      throw error;
    }
  }
};