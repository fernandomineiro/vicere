import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { CONFIG } from '../../config/global';
import axios from 'axios';
import MainLayout from '../../components/MainLayout';
import Loading from '../../components/Loading';
import BottomMenu from '../../components/BottomMenu';
import { wooCommerceService } from '../../services/woocommerce';

export default function CategoryProducts({ route, navigation }) {
  const { categoryId } = route.params;
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Carregar categoria
        const category = await wooCommerceService.getProductCategories();
        const currentCategory = category.find(cat => cat.id.toString() === categoryId);
        if (currentCategory) {
          setCategoryName(currentCategory.name);
        }

        // Carregar produtos da categoria
        const response = await wooCommerceService.getProductsByCategory(Number(categoryId));
        const formattedProducts = await Promise.all(response.map(async product => {
          // Carregar pontos do produto
          const points = await wooCommerceService.getProductPoints(product.id);
          
          return {
            id: product.id.toString(),
            name: product.name,
            category: currentCategory?.name || '',
            price: product.regular_price || '0',
            sale_price: product.sale_price || '0',
            image: { uri: product.images[0]?.src || '' },
            points: points?.points || 0,
            vicoins: points?.vicoins || 0
          };
        }));
        
        setProducts(formattedProducts);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

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

        <View style={styles.content}>
          <Text style={styles.categoryTitle}>{categoryName}</Text>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.productsList}
          />
        </View>
      </View>
      <BottomMenu />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  // Reutilizando os mesmos estilos da tela Shopping
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
    padding: 15,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: CONFIG.COLORS.text,
  },
  productsList: {
    paddingBottom: 100,
  },
  productCard: {
    flex: 1,
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
});