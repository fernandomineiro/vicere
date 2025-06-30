import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CONFIG } from '../../config/global';
import MainLayout from '../../components/MainLayout';
import Loading from '../../components/Loading';
import BottomMenu from '../../components/BottomMenu';

export default function MyPurchases() {
  const navigation = useNavigation();
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    setIsLoading(false); // Temporário
  };

  return (
    <MainLayout>
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
          <Text style={styles.headerTitle}>Minhas Compras</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {purchases.length === 0 ? (
            <View style={styles.emptyState}>
              <Image 
                source={require('../../../assets/shopping-icon.png')}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>Nenhuma compra realizada</Text>
            </View>
          ) : (
            <View style={styles.purchasesList}>
              {purchases.map((purchase) => (
                <TouchableOpacity 
                  key={purchase.id} 
                  style={styles.purchaseItem}
                  onPress={() => navigation.navigate('PurchaseDetails', { purchase })}
                >
                  {/* Detalhes da compra serão implementados aqui */}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
      <Loading visible={isLoading} />
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
  },
  backButton: {
    padding: 10,
  },
  backIcon: {
    width: 30,
    height: 24,
    tintColor: CONFIG.COLORS.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 8,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    marginBottom: 15,
    tintColor: CONFIG.COLORS.textLight,
  },
  emptyText: {
    fontSize: 16,
    color: CONFIG.COLORS.textLight,
    textAlign: 'center',
  },
  purchasesList: {
    marginBottom: 20,
  },
  purchaseItem: {
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
  },
});