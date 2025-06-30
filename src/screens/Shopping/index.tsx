import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { CONFIG } from '../../config/global';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Loading from '../../components/Loading';
import BottomMenu from '../../components/BottomMenu';
import MainLayout from '../../components/MainLayout';
import Cart from '../Cart';
import { wooCommerceService } from '../../services/woocommerce';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const bannerWidth = SCREEN_WIDTH - 35; // Aumentando a margem lateral

type RootStackParamList = {
  CategoryProducts: { categoryId: string };
  Shopping: undefined;
  ProductDetails: { productId: string };
};

export default function Shopping() {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [staticBanner, setStaticBanner] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [currentBanner, setCurrentBanner] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    const carregarDados = async () => {
      setIsLoading(true);
      try {
        // Carregar produtos
        const produtos = await wooCommerceService.getProducts({
          status: 'publish',
          orderby: 'date',
          order: 'desc'
        });
        
        const produtosFormatados = produtos.map(produto => ({
          id: produto.id.toString(),
          name: produto.name,
          category: produto.categories[0]?.name || '',
          price: produto.regular_price || '0',
          sale_price: produto.sale_price || '0',
          image: { uri: produto.images[0]?.src || '' }
        }));
        setProducts(produtosFormatados);

        // Carregar categorias
        const categorias = await wooCommerceService.getProductCategories();
        const categoriasFormatadas = categorias.map(categoria => ({
          id: categoria.id.toString(),
          name: categoria.name,
          icon: { uri: categoria.image?.src || '' }
        }));
        setCategories(categoriasFormatadas);

        // Carregar produtos por categoria
        const produtosPorCategoria = {};
        for (const categoria of categorias) {
          const produtosCategoria = await wooCommerceService.getProductsByCategory(categoria.id);
          produtosPorCategoria[categoria.name] = {
            id_categoria: categoria.id.toString(),
            produtos: produtosCategoria.map(produto => ({
              id: produto.id.toString(),
              name: produto.name,
              category: categoria.name,
              price: produto.regular_price || '0',
              sale_price: produto.sale_price || '0',
              image: { uri: produto.images[0]?.src || '' }
            }))
          };
        }
        setCategoryProducts(produtosPorCategoria);

        // Carregar pontos dos produtos
        for (const produto of produtosFormatados) {
          const pontos = await wooCommerceService.getProductPoints(Number(produto.id));
          produto.points = pontos.points;
          produto.vicoins = pontos.vicoins;
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, []);

  // Add the banner auto-rotation effect here, before the return statement
  useEffect(() => {
    let interval;
    if (banners.length > 0) {
      interval = setInterval(() => {
        const nextBanner = (currentBanner + 1) % banners.length;
        flatListRef.current?.scrollToIndex({
          index: nextBanner,
          animated: true
        });
        setCurrentBanner(nextBanner);
      }, 3000);
    }
    return () => interval && clearInterval(interval);
  }, [currentBanner, banners.length]);

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
    >
      <Image source={item.image} style={styles.productImage} />
      <Text style={styles.productCategory}>{item.category}</Text>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price} pontos</Text>
      <TouchableOpacity 
        style={styles.buyButton}
        onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
      >
        <Text style={styles.buyButtonText}>Ver Detalhes</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <MainLayout>
      <Loading visible={isLoading} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity >
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
              contentContainerStyle={{ paddingBottom: 100 }} // Adicionado padding extra no content container
            >
          <View style={styles.searchContainer}>
            <View style={styles.searchWrapper}>
              <View style={styles.searchInputContainer}>
                <Image 
                  source={require('../../../assets/search-icon.png')}
                  style={styles.searchIcon}
                />
                <Text style={styles.searchPlaceholder}>O que você procura?</Text>
              </View>
            </View>
          </View>

          <View style={styles.bannerContainer}>
            <FlatList
              ref={flatListRef}
              data={banners}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              getItemLayout={(data, index) => ({
                length: bannerWidth,
                offset: bannerWidth * index,
                index,
              })}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.floor(
                  event.nativeEvent.contentOffset.x / bannerWidth
                );
                setCurrentBanner(newIndex);
              }}
              renderItem={({ item }) => (
                <View style={styles.bannerWrapper}>
                  <Image 
                    source={item.image} 
                    style={styles.banner}
                    resizeMode="cover"
                  />
                </View>
              )}
              keyExtractor={item => item.id}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(
                  event.nativeEvent.contentOffset.x / (330 + 60)
                );
                setCurrentBanner(newIndex);
              }}
            />
            <View style={styles.paginationDots}>
              {banners.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    { backgroundColor: index === currentBanner ? CONFIG.COLORS.primary : '#ccc' }
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.categoriesContainer}>
            <Text style={styles.sectionTitle}>Categorias</Text>
            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContent}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.categoryItem}
                  onPress={() => navigation.navigate('CategoryProducts', { categoryId: item.id })}
                >
                  <View style={styles.categoryCircle}>
                    <Image 
                      source={item.icon} 
                      style={styles.categoryIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.categoryName}>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
            />
          </View>

          <View style={styles.productsContainer}>
            <Text style={styles.sectionTitle}>Produtos em Alta</Text>
            <FlatList
              data={products}
              numColumns={2}
              renderItem={renderProduct}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>

          {/* Banner Estático */}
        <View style={styles.staticBannerContainer}>
          {staticBanner && (
            <Image
              source={staticBanner.image}
              style={styles.staticBanner}
              resizeMode="cover"
            />
          )}
        </View>
 
                {/* Seções de Produtos por Categoria */}
                {Object.entries(categoryProducts).map(([categoria, dados]) => (
          <View key={categoria} style={styles.categorySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{categoria}</Text>
              <TouchableOpacity 
              onPress={() => navigation.navigate('CategoryProducts', { categoryId: dados.id_categoria })}
              >
                <Text style={styles.seeMoreText}>ver mais</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={dados.produtos}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryProductsList}
              renderItem={renderProduct} // Usando o mesmo renderizador dos produtos em alta
              keyExtractor={item => item.id}
            />
          </View>
        ))}
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
  logo: {
    width: 120,
    height: 40,
  },
  content: {
    flex: 1,
    paddingBottom: 120, // Aumentado para dar mais espaço no final
  },
  staticBannerContainer: {
    paddingHorizontal: 15,
    marginVertical: 15,
    marginBottom: 30, // Adicionado margin bottom extra
  },

  productsContainer: {
    padding: 15,
    marginBottom: 20,
  },
  searchContainer: {
    padding: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    paddingHorizontal: 15,
  },
  searchPlaceholder: {
    flex: 1,
    color: '#999',
    padding: 10,
  },
  searchButton: {
    padding: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: CONFIG.COLORS.primary,
  },
  bannerContainer: {
    marginVertical: 15,
    position: 'relative',
    paddingHorizontal: 20, // Aumentando o padding lateral
  },
  bannerWrapper: {
    width: bannerWidth,
    marginHorizontal: 0,
  },
  banner: {
    width: '100%',
    height: 180,
    backgroundColor: CONFIG.COLORS.primary,
    borderRadius: 12, // Aumentando um pouco o border radius também
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  staticBanner: {
    height: 150,
    backgroundColor: CONFIG.COLORS.primary,
    borderRadius: 10,
  },
  categoriesContainer: {
    padding: 15,
    width: '100%',
  },
  categoriesContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SCREEN_WIDTH - 30,
  },
  categoryItem: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - 30) / 4,
  },
  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: CONFIG.COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    tintColor: CONFIG.COLORS.white,
  },
  categoryName: {
    fontSize: 12,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
  },

   sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: CONFIG.COLORS.text,
  },
 
  productsContainer: {
    padding: 15,
    marginBottom: 20,
  },
  categorySection: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  categoryProductsList: {
    paddingRight: 15,
  },
  seeMoreText: {
    color: CONFIG.COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  productCard: {
    width: (SCREEN_WIDTH - 45) / 2, // Mantendo a mesma largura dos produtos em alta
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 10,
    padding: 15,
    margin: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  productCategory: {
    fontSize: 12,
    color: CONFIG.COLORS.textLight,
    marginBottom: 5,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 5,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 16,
    color: CONFIG.COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buyButton: {
    backgroundColor: CONFIG.COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    width: '100%',
  },
  buyButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    padding: 10,
  },
  cartIcon: {
    width: 24,
    height: 24,
    tintColor: CONFIG.COLORS.primary,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    marginBottom: 15,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: CONFIG.COLORS.text,
    marginRight: 10,
  },
  searchPlaceholder: {
    flex: 1,
    color: CONFIG.COLORS.textLight,
    fontSize: 14,
  },
 
  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: CONFIG.COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 0,

  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  sectionArrow: {
    width: 24,
    height: 24,
    tintColor: CONFIG.COLORS.primary,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
});

