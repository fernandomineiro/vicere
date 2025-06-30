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

export default function Statement() {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
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
          <Text style={styles.headerTitle}>Extrato</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Saldo Atual</Text>
            <Text style={styles.balanceValue}>0 pontos</Text>
          </View>

          <View style={styles.transactionsList}>
            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Image 
                  source={require('../../../assets/extract-icon.png')}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
              </View>
            ) : (
              transactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  {/* Detalhes da transação serão implementados aqui */}
                </View>
              ))
            )}
          </View>
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
  balanceContainer: {
    backgroundColor: CONFIG.COLORS.primary,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: CONFIG.COLORS.white,
    opacity: 0.8,
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CONFIG.COLORS.white,
  },
  transactionsList: {
    marginBottom: 20,
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
  transactionItem: {
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
  },
});