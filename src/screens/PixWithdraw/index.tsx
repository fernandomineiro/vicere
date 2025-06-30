import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CONFIG } from '../../config/global';
import MainLayout from '../../components/MainLayout';
import Loading from '../../components/Loading';
import Toast from 'react-native-toast-message';
import BottomMenu from '../../components/BottomMenu';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PixWithdraw() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [pixKey, setPixKey] = useState('');
  const [amount, setAmount] = useState('');
  const [availableBalance, setAvailableBalance] = useState(0);

  useEffect(() => {
    const fetchUserBalance = async () => {
      setIsLoading(true);
      try {
        const userID = await AsyncStorage.getItem('userID');
        const response = await axios.post(`${CONFIG.API_URL}/seleciona_cliente.class.php`, {
          CLI_ID: userID
        });
        
        if (response.data) {
          const pontos = response.data.PT_PONTOS || 0;
          const valorPonto = response.data.PT_VALOR || 0.005;
          setAvailableBalance(pontos * valorPonto);
        }
      } catch (error) {
        console.error('Erro ao carregar saldo:', error);
        Toast.show({
          type: 'error',
          text1: 'Erro ao carregar saldo',
          text2: 'Por favor, tente novamente'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBalance();
  }, []);

  const handleAmountChange = (value: string) => {
    // Remove caracteres não numéricos
    const numericValue = value.replace(/[^0-9]/g, '');
    const floatValue = parseFloat(numericValue) / 100;

    if (floatValue > availableBalance) {
      Toast.show({
        type: 'error',
        text1: 'Saldo insuficiente',
        text2: 'O valor não pode ser maior que seu saldo disponível'
      });
      return;
    }

    setAmount(numericValue ? floatValue.toFixed(2) : '');
  };

  const handleWithdraw = async () => {
    if (!pixKey.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Chave PIX obrigatória',
        text2: 'Por favor, informe sua chave PIX'
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Valor inválido',
        text2: 'Por favor, informe um valor válido'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Implementar a chamada da API para realizar o resgate
      // const response = await axios.post(...);
      Toast.show({
        type: 'success',
        text1: 'Resgate solicitado',
        text2: 'Em breve você receberá o valor em sua conta'
      });
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao processar',
        text2: 'Tente novamente mais tarde'
      });
    } finally {
      setIsLoading(false);
    }
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
          <Text style={styles.headerTitle}>Resgate PIX</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Saldo disponível para resgate:</Text>
            <Text style={styles.balanceValue}>R$ {availableBalance.toFixed(2)}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Chave PIX</Text>
            <TextInput
              style={styles.input}
              value={pixKey}
              onChangeText={setPixKey}
              placeholder="Informe sua chave PIX"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Valor do resgate</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="R$ 0,00"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity 
            style={styles.withdrawButton}
            onPress={handleWithdraw}
          >
            <Text style={styles.withdrawButtonText}>Solicitar Resgate</Text>
          </TouchableOpacity>
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
    backgroundColor: CONFIG.COLORS.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: CONFIG.COLORS.text,
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CONFIG.COLORS.primary,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  withdrawButton: {
    backgroundColor: CONFIG.COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  withdrawButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});