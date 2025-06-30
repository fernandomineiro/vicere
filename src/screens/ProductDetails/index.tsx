import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { CONFIG } from '../../config/global';
import axios from 'axios';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import MainLayout from '../../components/MainLayout';
import Loading from '../../components/Loading';
import BottomMenu from '../../components/BottomMenu';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { wooCommerceService } from '../../services/woocommerce';

type RootStackParamList = {
  CategoryProducts: { categoryId: string };
  Shopping: undefined;
  ProductDetails: { productId: string };
  Cart: { productId: string };
};

// Remover a definição duplicada do RootStackParamList que está aqui
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProductDetails() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { productId } = route.params as { productId: string };
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const carregarProduto = async () => {
      setIsLoading(true);
      try {
        const produto = await wooCommerceService.getProducts({
          include: [Number(productId)]
        });

        if (produto && produto[0]) {
          const points = await wooCommerceService.getProductPoints(Number(productId));
          
          // Imagem principal
          const mainImage = { uri: produto[0].images[0]?.src || '' };
          
          // Imagens adicionais
          const thumbImages = produto[0].images.slice(1).map(img => ({
            full: { uri: img.src },
            thumb: { uri: img.src }
          }));

          const price = produto[0].regular_price || '0';
          const salePrice = produto[0].sale_price || '0';

          const valorPonto = 0.01; // Valor padrão do ponto
          const vicoinsGanhosGlobal = 0.1; // Valor padrão global de vicoins ganhos
          
          let pontos = points?.points;
          if (!pontos) {
            pontos = Math.round(Number(price) / valorPonto);
          }
          
          const vicoinsGanhos = Math.round(Number(price) * vicoinsGanhosGlobal);
          
          const produtoFormatado = {
            id: produto[0].id.toString(),
            name: produto[0].name,
            description: produto[0].description || 'Descrição não disponível',
            price: Number(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            sale_price: Number(salePrice).toLocaleString('pt-BR'),
            points: pontos,
            vicoins: vicoinsGanhos,
            mainImage: mainImage,
            images: thumbImages
          };
          setProduct(produtoFormatado);
        }
      } catch (erro) {
        console.error('Erro ao carregar produto:', erro);
      } finally {
        setIsLoading(false);
      }
    };

    carregarProduto();
  }, [productId]);

  const getCurrentImage = () => {
    if (selectedImage === 0) {
      return product.mainImage;
    }
    return product.images[selectedImage].full;
  };

  const renderThumb = ({ item, index }) => (
    <TouchableOpacity 
      style={[
        styles.thumbContainer,
        selectedImage === index && styles.thumbSelected
      ]}
      onPress={() => setSelectedImage(index)}
    >
      <Image 
        source={item.thumb}
        style={styles.thumbImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  if (!product) return <Loading visible={isLoading} />;

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
          <View style={styles.imageContainer}>
            <Image
              source={getCurrentImage()}
              style={styles.mainImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.thumbsContainer}>
            <FlatList
              key="thumbsGrid"
              data={product.images}
              horizontal={false}
              numColumns={4}
              showsVerticalScrollIndicator={false}
              renderItem={renderThumb}
              keyExtractor={(_, index) => index.toString()}
              columnWrapperStyle={styles.thumbRow}
              scrollEnabled={false}
            />
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            
            <View style={styles.pointsContainer}>
              <Text style={styles.vicoinsNeeded}>{product.points} vicoins</Text>
              <Text style={styles.priceInfo}>R$ {product.price}</Text>
              <Text style={styles.vicoinsEarned}>Ganhe {product.vicoins} vicoins ao comprar este produto</Text>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={styles.cartButton}
                onPress={() => {
                  if (!isAuthenticated) {
                    setShowAuthAlert(true);
                    return;
                  }
                  navigation.navigate('Cart', {
                    productId: product.id,
                    fromProductDetails: true
                  });
                }}
              >
                <Text style={styles.buttonText}>Adicionar ao Carrinho</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.buyButton}
                onPress={() => {
                  if (!isAuthenticated) {
                    setShowAuthAlert(true);
                    return;
                  }
                  navigation.navigate('Checkout', {
                    productId: product.id,
                    fromProductDetails: true
                  });
                }}
              >
                <Text style={[styles.buttonText, styles.buyButtonText]}>Comprar Agora</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.descriptionTitle}>Descrição do Produto</Text>
            <Text style={styles.description}>{product.description.replace(/<[^>]*>/g, '')}</Text>
          </View>
        </ScrollView>
      </View>
      {showAuthAlert && (
        <View style={styles.alertBox}>
          <Image 
            source={require('../../../assets/lock-icon.png')}
            style={styles.alertIcon}
          />
          <Text style={styles.alertTitle}>Área Restrita</Text>
          <Text style={styles.alertText}>
            Faça login para acessar esta funcionalidade
          </Text>
          <View style={styles.alertButtons}>
            <TouchableOpacity 
              style={styles.alertButton}
              onPress={() => setShowAuthAlert(false)}
            >
              <Text style={styles.alertButtonTextSecondary}>Fechar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.alertButton, styles.alertButtonPrimary]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.alertButtonText}>Fazer Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <BottomMenu />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  pointsContainer: {
    marginBottom: 20,
    alignItems: 'center',
    padding: 15,
  },
  vicoinsNeeded: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E6007E',
    marginBottom: 8,
  },
  priceInfo: {
    fontSize: 20,
    color: '#333',
    marginBottom: 8,
  },
  vicoinsEarned: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  buttonsContainer: {
    flexDirection: 'column',
    gap: 10,
    paddingHorizontal: 15,
  },
  cartButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E6007E',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: '#E6007E',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E6007E',
  },
  buyButtonText: {
    color: '#FFFFFF',
  },
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
  content: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40, // Espaço extra no final do scroll
  },
  productInfo: {
    padding: 15,
    backgroundColor: CONFIG.COLORS.white,
    marginTop: 10,
    marginBottom: 80, // Aumentado para dar mais espaço no final
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
    lineHeight: 24,
  },
  priceActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
  },
  redeemButton: {
    backgroundColor: CONFIG.COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  redeemButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 10,
  },
  menuIconPlaceholder: {
    width: 27,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: CONFIG.COLORS.white,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  thumbsContainer: {
    padding: 15,
    backgroundColor: CONFIG.COLORS.white,
    minHeight: 80,
  },
  thumbRow: {
    justifyContent: 'space-between',
    width: '100%',
  },
  thumbContainer: {
    width: '23%',
    aspectRatio: 1,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbSelected: {
    borderColor: CONFIG.COLORS.primary,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  alertBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -150 },
      { translateY: -100 },
    ],
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: 300,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 3.84,
  },
  alertIcon: {
    width: 45,
    height: 60,
    tintColor: CONFIG.COLORS.primary,
    marginBottom: 15,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 10,
  },
  alertText: {
    fontSize: 14,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  alertButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  alertButtonPrimary: {
    backgroundColor: CONFIG.COLORS.primary,
  },
  alertButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  alertButtonTextSecondary: {
    color: CONFIG.COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});