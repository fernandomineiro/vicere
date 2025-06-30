import axios, { AxiosInstance } from 'axios';
import { WC_CONFIG } from '../config/woocommerce';

class WooCommerceService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: WC_CONFIG.BASE_URL,
      timeout: WC_CONFIG.TIMEOUT,
      auth: {
        username: WC_CONFIG.CONSUMER_KEY,
        password: WC_CONFIG.CONSUMER_SECRET
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });




    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.response.use(
      response => response,
      error => {
        console.error('WooCommerce API Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('URL:', error.config?.url);
        console.error('Method:', error.config?.method);
        return Promise.reject(error);
      }
    );
  }

  // Produtos
  async getProducts(params?: any) {
    const response = await this.api.get('/products', { params });
    return response.data;
  }

  async getProductById(id: number) {
    const response = await this.api.get(`/products/${id}`);
    return response.data;
  }

  async getProductCategories() {
    try {
      console.log('Iniciando requisição de categorias...');
      const response = await this.api.get('/products/categories', {
        params: {
          per_page: 100,
          hide_empty: true,
          orderby: 'name',
          order: 'asc',
          parent: 0 // Busca apenas categorias principais
        }
      });
      console.log('Resposta da API:', response.status, response.statusText);
      console.log('Categorias WooCommerce:', response.data);
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Resposta inválida da API:', response.data);
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error.response?.data || error.message);
      console.error('Status do erro:', error.response?.status);
      console.error('Headers:', error.response?.headers);
      return [];
    }
  }

  async getProductsByCategory(categoryId: number, params?: any) {
    const response = await this.api.get('/products', {
      params: { ...params, category: categoryId }
    });
    return response.data;
  }

  // Criar Produto
  async createProduct(productData: {
    name: string;
    regular_price: string;
    description: string;
    sku: string;
    stock_quantity: number;
    manage_stock: boolean;
    categories: number[];
    images: number[];
  }) {
    const authToken = this.api.defaults.headers.common['Authorization'];
    const wpSession = this.api.defaults.headers.common['X-WP-Session'];

    if (!authToken || !wpSession) {
      throw new Error('É necessário fazer login para criar produtos');
    }

    const response = await this.api.post('https://vicere.com.br/wp-json/session-vicere/v1/product', productData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
        'X-WP-Session': wpSession
      }
    });
    return response.data;
  }

  // Carrinho
  async addToCart(productId: number, quantity: number = 1) {
    try {
      // Verifica se há um token de autenticação nos headers
      const authToken = this.api.defaults.headers.common['Authorization'];
      const wpSession = this.api.defaults.headers.common['X-WP-Session'];

      if (!authToken || !wpSession) {
        throw new Error('É necessário fazer login para adicionar produtos ao carrinho');
      }

      const response = await this.api.post('https://vicere.com.br/wp-json/session-vicere/v1/cart/add-item', {
        id: productId,
        quantity: quantity
      }, {
        headers: {
          'Nonce': WC_CONFIG.CONSUMER_SECRET,
          'Content-Type': 'application/json',
          'Authorization': authToken,
          'X-WP-Session': wpSession
        }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
      } else if (error.message.includes('login')) {
        throw error; // Mantém a mensagem original de necessidade de login
      } else {
        console.error('Erro ao adicionar ao carrinho:', error);
        throw new Error('Não foi possível adicionar o produto ao carrinho. Por favor, tente novamente.');
      }
    }
  }

  async getCart() {
    const response = await this.api.get('/cart');
    return response.data;
  }

  async updateCartItem(itemKey: string, quantity: number) {
    const response = await this.api.put(`/cart/item/${itemKey}`, { quantity });
    return response.data;
  }

  async removeCartItem(itemKey: string) {
    const response = await this.api.delete(`/cart/item/${itemKey}`);
    return response.data;
  }

  // Checkout
  async createOrder(orderData: any) {
    const response = await this.api.post('/orders', orderData);
    return response.data;
  }

  async getOrder(orderId: number) {
    const response = await this.api.get(`/orders/${orderId}`);
    return response.data;
  }

  // Pontos e Vicoins
  async getProductPoints(productId: number) {
    try {
      const product = await this.getProductById(productId);
      const points = product.meta_data?.find(meta => meta.key === '_pontos_produto')?.value || 0;
      const vicoins = product.meta_data?.find(meta => meta.key === '_vicoins_produto')?.value || 0;
      return { points: Number(points), vicoins: Number(vicoins) };
    } catch (error) {
      console.error('Erro ao buscar pontos do produto:', error);
      return { points: 0, vicoins: 0 };
    }
  }

  async calculateCartPoints() {
    try {
      const cart = await this.getCart();
      let totalPoints = 0;
      let totalVicoins = 0;

      for (const item of cart.items) {
        const productPoints = await this.getProductPoints(item.product_id);
        totalPoints += productPoints.points * item.quantity;
        totalVicoins += productPoints.vicoins * item.quantity;
      }

      return { points: totalPoints, vicoins: totalVicoins };
    } catch (error) {
      console.error('Erro ao calcular pontos do carrinho:', error);
      return { points: 0, vicoins: 0 };
    }
  }
  async getUserPoints(userId?: number) {
    if (!userId) {
      return { points: 0, vicoins: 0 };
    }
    try {
      const response = await this.api.get(`/users/${userId}`);
      const points = response.data.meta_data?.find(meta => meta.key === 'pontos_vicere')?.value || 0;
      const vicoins = response.data.meta_data?.find(meta => meta.key === 'vicoins_vicere')?.value || 0;
      return { points: Number(points), vicoins: Number(vicoins) };
    } catch (error) {
      console.error('Erro ao buscar pontos do usuário:', error);
      return { points: 0, vicoins: 0 };
    }
  }
}

export const wooCommerceService = new WooCommerceService();