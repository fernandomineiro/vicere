import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { CONFIG } from '../../config/global';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainLayout from '../../components/MainLayout';
import Loading from '../../components/Loading';
import BottomMenu from '../../components/BottomMenu';
import { RootStackParamList } from '../../types/navigation';
import { wooCommerceService } from '../../services/woocommerce';

// Types
type CartProduct = {
  id: string;
  name: string;
  price: number;
  image: { uri: string };
  quantity: number;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const showToast = (type: 'success' | 'error', message: string) => {
  Toast.show({
    type: type,
    text1: message,
    position: 'bottom',
  });
};

export default function Cart() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { productId } = (route.params as { productId?: string }) || {};
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [clientId, setClientId] = useState<string>('');
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleGoBack = () => {
    if (productId) {
      navigation.navigate('ProductDetails', { productId });
    } else {
      navigation.navigate('Shopping');
    }
  };

  const handleContinueShopping = () => {
    navigation.navigate('Shopping');
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout');
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Verifica se veio da tela de detalhes do produto
        if (productId && route.params?.fromProductDetails) {
          await wooCommerceService.addToCart(Number(productId));
        }

        // Carregar carrinho
        const cartData = await wooCommerceService.getCart();
        if (cartData) {
          const produtosFormatados = await Promise.all(cartData.items.map(async item => {
            const points = await wooCommerceService.getProductPoints(item.product_id);
            return {
              id: item.key,
              name: item.name,
              price: Number(item.price),
              image: { uri: item.images[0]?.src || '' },
              quantity: item.quantity,
              points: points.points,
              vicoins: points.vicoins
            };
          }));
          setProducts(produtosFormatados);

          // Calcular pontos totais do carrinho
          const cartPoints = await wooCommerceService.calculateCartPoints();
          setTotalPoints(cartPoints.total_points);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showToast('error', 'Erro ao carregar o carrinho');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [productId]);

  const handleQuantityChange = async (productId: string, increment: number) => {
    try {
      const product = products.find(p => p.id === productId);
      if (product) {
        const newQuantity = Math.max(1, product.quantity + increment);
        await wooCommerceService.updateCartItem(productId, newQuantity);

        setProducts(prevProducts =>
          prevProducts.map(p =>
            p.id === productId
              ? { ...p, quantity: newQuantity }
              : p
          )
        );

        // Atualizar pontos totais
        const cartPoints = await wooCommerceService.calculateCartPoints();
        setTotalPoints(cartPoints.total_points);
      }
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      showToast('error', 'Erro ao atualizar quantidade');
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await wooCommerceService.removeCartItem(productId);
      
      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== productId)
      );

      // Atualizar pontos totais
      const cartPoints = await wooCommerceService.calculateCartPoints();
      setTotalPoints(cartPoints.total_points);
      
      showToast('success', 'Produto removido do carrinho');
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      showToast('error', 'Erro ao remover produto');
    }
  };

  return (
    <MainLayout>
      <Loading visible={isLoading} />
      <View style={styles.container}>
      <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Image 
              source={require('../../../assets/arrow-left.png')} 
              style={styles.backIcon} 
            />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/vicere-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          
          <TouchableOpacity 
           onPress={() => navigation.navigate('Cart')}
          style={styles.cartButton}>
            <Image 
              source={require('../../../assets/cart-icon.png')}
              style={styles.cartIcon}
            />
          </TouchableOpacity>
        </View>

        <ScrollView 
              style={styles.content} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 50, paddingTop:30 }} // Adicionado padding extra no content container
            >
 
          {products.length > 0 ? (
            <View style={styles.cartContent}>
              {products.map((product) => (
                <View key={product.id} style={styles.cartBox}>
                  <View style={styles.rowContainer}>
                    <View style={styles.imageContainer}>
                      <Image 
                        source={product.image}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={styles.titleContainer}>
                      <Text style={styles.productTitle}>{product.name}</Text>
                      <View style={styles.pointsContainer}>
                        <Text style={styles.pointsTextTop}>{product.price}</Text>
                        <Text style={styles.pointsLabelTop}>pontos</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.bottomRow}>
                    <View style={[styles.bottomBox, { flex: 0.4 }]}>
                      <TouchableOpacity 
                        onPress={() => handleDelete(product.id)} 
                        style={styles.deleteButton}
                      >
                        <Image 
                          source={require('../../../assets/trash-icon.png')}
                          style={styles.trashIcon}
                        />
                        <Text style={styles.deleteText}>Remover</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.bottomBox, { flex: 0.6 }]}>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity 
                          style={styles.quantityButtonWrapper} 
                          onPress={() => handleQuantityChange(product.id, -1)}
                        >
                          <Text style={styles.quantityButton}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{product.quantity}</Text>
                        <TouchableOpacity 
                          style={styles.quantityButtonWrapper} 
                          onPress={() => handleQuantityChange(product.id, 1)}
                        >
                          <Text style={styles.quantityButton}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total</Text>
                <View style={styles.pointsContainer}>
                  <Text style={styles.totalValue}>{totalPoints}</Text>
                  <Text style={styles.pointsLabel}> pontos</Text>
                </View>
              </View>

              <View style={styles.buttonsContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.secondaryButton]} 
                  onPress={handleContinueShopping}
                >
                  <Text style={styles.secondaryButtonText}>Ver Mais</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.primaryButton]}
                  onPress={handleCheckout}
                >
                  <Text style={styles.primaryButtonText}>Finalizar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCartContainer}>
              <Text style={styles.emptyCartText}>Seu carrinho está vazio</Text>
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton, styles.fullWidthButton]} 
                onPress={handleContinueShopping}
              >
                <Text style={styles.secondaryButtonText}>Ir às Compras</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
      <BottomMenu />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: 40,
    backgroundColor: CONFIG.COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: CONFIG.COLORS.border,
  },
  backButton: {
    padding: 10,
  },
  backIcon: {
    width: 30,
    height: 24,
    tintColor: CONFIG.COLORS.primary,
  },
  logoImage: {
    width: 120,
    height: 40,
  },
  cartButton: {
    padding: 10,
  },
  cartIcon: {
    width: 24,
    height: 24,
    tintColor: CONFIG.COLORS.primary,
  },
  menuIconPlaceholder: {
    width: 27,
  },
  content: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,  // Aumentado o padding inferior
  },
  cartContent: {
    paddingBottom: 20,  // Adicionado padding no container do conteúdo
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: CONFIG.COLORS.white,
    marginTop: 10,
    marginBottom: 20,  // Adicionado margem inferior
  },
  quantityButtonWrapper: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CONFIG.COLORS.primary,
    borderRadius: 4,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CONFIG.COLORS.primary,
    marginRight: 5,
  },
  pointsLabel: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
  },
  cartBox: {
    marginHorizontal: 15,
    marginBottom: 10,
    marginTop: 5,
    padding: 15,
    backgroundColor: CONFIG.COLORS.white,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  titleContainer: {
    flex: 1,
    height: 80,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
  },
  // Estilos dos pontos
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  pointsTextTop: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E91E63',
    marginRight: 5,
  },
  pointsLabelTop: {
    fontSize: 14,
    color: CONFIG.COLORS.text,
  },

  // Estilos da parte inferior do produto
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  bottomBox: {
    height: 60,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Estilos do botão de deletar
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trashIcon: {
    width: 20,
    height: 20,
    tintColor: '#E91E63',
    marginRight: 5,
  },
  deleteText: {
    color: '#E91E63',
    fontSize: 14,
  },

  // Estilos do controle de quantidade
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
  },
  quantityButton: {
    fontSize: 24,
    color: '#E91E63',
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#E91E63',
    borderRadius: 3,
    textAlign: 'center',
    lineHeight: 38,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginHorizontal: 15,
  },

  // Estilos do total
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
    marginRight: 10,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E91E63',
  },

  // Estilos dos botões
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: CONFIG.COLORS.white,
    borderTopWidth: 1,
    borderTopColor: CONFIG.COLORS.border,
    marginTop: 10,
  },
  button: {
    flex: 0.48,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: '#E91E63',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E91E63',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullWidthButton: {
    width: '100%',
    marginTop: 20,
  },
  emptyCartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CONFIG.COLORS.white,
    marginHorizontal: 15,
    marginTop: 20,
    padding: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
  },
  emptyCartText: {
    fontSize: 18,
    color: CONFIG.COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
});