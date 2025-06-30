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

export default function Checkout() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [clientId, setClientId] = useState<string>('');
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleGoBack = () => {
    navigation.navigate('Cart');
  };

  // Adicionar novo estado
  const [userPoints, setUserPoints] = useState<number>(0);
  
  // Modificar o useEffect para carregar os pontos do usuário
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Carregar pontos do usuário
        const userPointsData = await wooCommerceService.getUserPoints();
        setUserPoints(userPointsData.points || 0);

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
        showToast('error', 'Erro ao carregar o checkout');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Modificar a função de finalização
  const handleFinishPurchase = async () => {
    try {
      setIsLoading(true);
      
      // Criar pedido
      const orderData = {
        payment_method: 'points',
        payment_method_title: 'Pagamento com Pontos',
        set_paid: true,
        billing: {
          // Adicionar dados de faturamento se necessário
        },
        shipping: {
          // Adicionar dados de entrega se necessário
        },
        line_items: products.map(item => ({
          product_id: Number(item.id),
          quantity: item.quantity
        }))
      };

      const order = await wooCommerceService.createOrder(orderData);
      
      if (order) {
        navigation.navigate('ThankYou');
        Toast.show({
          type: 'success',
          text1: 'Pedido realizado com sucesso!',
          position: 'bottom',
        });
      }
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao finalizar pedido',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const storedClientId = await AsyncStorage.getItem('userID');
        setClientId(storedClientId || '');
        
        const resposta = await axios.get(`${CONFIG.API_URL}/seleciona_carrinho.class.php`, {
          params: { CLI_ID: storedClientId }
        });
        
        if (resposta.data) {
          const produtosFormatados = resposta.data.map(item => ({
            id: item.ID,
            name: item.NOME,
            price: Number(item.PRECO),
            image: { uri: `${CONFIG.IMAGES_URL}/produtos/${item.ID_PRODUTO}/${item.URL_IMAGEM}` },
            quantity: Number(item.QUANTIDADE) || 1
          }));
          setProducts(produtosFormatados);
          
          const total = produtosFormatados.reduce(
            (sum, product) => sum + (product.price * product.quantity),
            0
          );
          setTotalPoints(total);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showToast('error', 'Erro ao carregar o checkout');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <MainLayout>
      <Loading visible={isLoading} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleGoBack}
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
          
          <View style={styles.menuIconPlaceholder} />
        </View>

        <ScrollView 
              style={styles.content} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 50, paddingTop:10 }} // Adicionado padding extra no content container
            >
          <View style={styles.pointsSummary}>
            <Text style={styles.summaryTitle}>Saldo</Text>
            <Text style={styles.pointsText}>Total de Pontos: {userPoints}</Text>
            <Text style={styles.pointsText}>Pontos Pedido: {totalPoints}</Text>
            <Text style={[
              styles.pointsText,
              { color: userPoints >= totalPoints ? CONFIG.COLORS.success : CONFIG.COLORS.error }
            ]}>
              Saldo após Resgate: {userPoints - totalPoints}
            </Text>
          </View>
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
                    <View style={styles.quantityContainer}>
                      <Text style={styles.quantityText}>Quantidade: {product.quantity}</Text>
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

              {userPoints < totalPoints && (
                <View style={styles.warningContainer}>
                  <Text style={styles.warningText}>
                    Você não possui saldo suficiente de pontos. Remova ou altere a quantidade de produtos ou compre mais pontos.
                  </Text>
                </View>
              )}

              <View style={styles.buttonsContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.secondaryButton]} 
                  onPress={handleGoBack}
                >
                  <Text style={styles.secondaryButtonText}>Voltar ao Carrinho</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => {
                    if (userPoints >= totalPoints) {
                      handleFinishPurchase();
                    } else {
                      navigation.navigate('BuyPoints', {
                        neededPoints: totalPoints - userPoints
                      });
                    }
                  }}
                >
                  <Text style={styles.primaryButtonText}>
                    {userPoints >= totalPoints ? 'Confirmar Resgate' : 'Comprar Pontos'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCartContainer}>
              <Text style={styles.emptyCartText}>Nenhum item para finalizar</Text>
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton, styles.fullWidthButton]} 
                onPress={handleGoBack}
              >
                <Text style={styles.secondaryButtonText}>Voltar ao Carrinho</Text>
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
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 40,
  },
  menuIconPlaceholder: {
    width: 27,
  },
  content: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.background,
  },
  cartContent: {
    paddingBottom: 20,
  },
  cartBox: {
    marginHorizontal: 15,
    marginBottom: 10,
    marginTop: 5,
    padding: 15,
    backgroundColor: CONFIG.COLORS.white,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
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
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  pointsTextTop: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CONFIG.COLORS.primary,
    marginRight: 5,
  },
  pointsLabelTop: {
    fontSize: 14,
    color: CONFIG.COLORS.text,
  },
  bottomRow: {
    marginTop: 15,
  },
  quantityContainer: {
    alignItems: 'flex-end',
  },
  quantityText: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
  },
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
    fontSize: 24,
    fontWeight: 'bold',
    color: CONFIG.COLORS.primary,
  },
  pointsLabel: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: CONFIG.COLORS.white,
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
    backgroundColor: CONFIG.COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: CONFIG.COLORS.primary,
  },
  primaryButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: CONFIG.COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
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
  fullWidthButton: {
    width: '100%',
    marginTop: 20,
  },
  // Estilos do resumo de pontos
  pointsSummary: {
    backgroundColor: CONFIG.COLORS.white,
    margin: 15,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 10,
  },
  pointsText: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
    marginBottom: 5,
  },
  warningContainer: {
    backgroundColor: '#FFEBEE', // Cor de fundo vermelha clara
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.error,
  },
  warningText: {
    color: CONFIG.COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: CONFIG.COLORS.white,
    marginTop: 0,
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
    backgroundColor: CONFIG.COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: CONFIG.COLORS.primary,
  },
  primaryButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: CONFIG.COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
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
  fullWidthButton: {
    width: '100%',
    marginTop: 20,
  },
  // Estilos do resumo de pontos
  pointsSummary: {
    backgroundColor: CONFIG.COLORS.white,
    margin: 15,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 10,
  },
  pointsText: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
    marginBottom: 5,
  },
  warningContainer: {
    backgroundColor: CONFIG.COLORS.errorLight,
    margin: 15,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.error,
  },
  warningText: {
    fontSize: 14,
    color: CONFIG.COLORS.error,
    textAlign: 'center',
  },
  successText: {
    color: CONFIG.COLORS.success,
  },
  errorText: {
    color: CONFIG.COLORS.error,
  },
  balanceHighlight: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});