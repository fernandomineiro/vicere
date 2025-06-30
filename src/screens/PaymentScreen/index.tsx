import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CONFIG } from '../../config/global';
import MainLayout from '../../components/MainLayout';
import Loading from '../../components/Loading';
import Toast from 'react-native-toast-message';
import BottomMenu from '../../components/BottomMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { formatCPF } from '../../utils/cpfUtils';

const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  export default function PaymentScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { points, purchaseType, friendCPF } = route.params as {
      points: number;
      purchaseType: 'me' | 'friend';
      friendCPF?: string;
    };
  
    const [isLoading, setIsLoading] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVV, setCardCVV] = useState('');
  
    const [clientId, setClientId] = useState('');
  
    // Adicionar useEffect para carregar o ID do usuário
    useEffect(() => {
      const loadUserId = async () => {
        const userId = await AsyncStorage.getItem('userID');
        setClientId(userId || '');
      };
      loadUserId();
    }, []);
  
    const handleFinishPurchase = async () => {
      if (!cardNumber || !cardName || !cardExpiry || !cardCVV) {
        Toast.show({
          type: 'error',
          text1: 'Preencha todos os dados do cartão',
          position: 'top',
        });
        return;
      }
  
      setIsLoading(true);
      try {
        const response = await axios.post(`${CONFIG.API_URL}/finalizar_compra_pontos.class.php`, {
          clientId,
          points,
          purchaseType,
          friendCPF: purchaseType === 'friend' ? friendCPF : null,
          cardData: {
            number: cardNumber,
            name: cardName,
            expiry: cardExpiry,
            cvv: cardCVV
          }
        });
  
        console.log('Resposta da API:', response.data);
  
        if (response.data.success) {
          Toast.show({
            type: 'success',
            text1: 'Compra realizada com sucesso!',
            position: 'top',
          });
          navigation.navigate('Dashboard');
        } else {
          throw new Error(response.data.message || 'Erro ao processar pagamento');
        }
      } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        Toast.show({
          type: 'error',
          text1: 'Erro ao processar pagamento',
          text2: error.message || 'Tente novamente mais tarde',
          position: 'top',
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
            <Image
              source={require('../../../assets/vicere-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View style={styles.menuIconPlaceholder} />
          </View>
  
          <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100, paddingTop:0 }} // Adicionado padding extra no content container
              >
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Resumo da Compra</Text>
              <Text style={styles.summaryText}>Quantidade: {points} pontos</Text>
              <Text style={styles.summaryText}>Valor: {formatCurrency(points)}</Text>
              {purchaseType === 'friend' && (
                <Text style={styles.summaryText}>CPF do Amigo: {formatCPF(friendCPF || '')}</Text>
              )}
            </View>
  
            <View style={styles.cardContainer}>
              <Text style={styles.cardTitle}>Dados do Cartão</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Número do Cartão</Text>
                <TextInput
                  style={styles.input}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  placeholder="0000 0000 0000 0000"
                  keyboardType="numeric"
                  maxLength={16}
                />
              </View>
  
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nome no Cartão</Text>
                <TextInput
                  style={styles.input}
                  value={cardName}
                  onChangeText={setCardName}
                  placeholder="Nome como está no cartão"
                  autoCapitalize="characters"
                />
              </View>
  
              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Validade</Text>
                  <TextInput
                    style={styles.input}
                    value={cardExpiry}
                    onChangeText={setCardExpiry}
                    placeholder="MM/AA"
                    maxLength={5}
                  />
                </View>
  
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    value={cardCVV}
                    onChangeText={setCardCVV}
                    placeholder="000"
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>
              </View>
            </View>
  
            <TouchableOpacity 
              style={styles.buyButton}
              onPress={handleFinishPurchase}
            >
              <Text style={styles.buyButtonText}>Finalizar Compra</Text>
            </TouchableOpacity>
          </ScrollView>
          
          <Loading visible={isLoading} />
          <Toast />
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
    menuIconPlaceholder: {
      width: 27,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    summaryContainer: {
      backgroundColor: CONFIG.COLORS.white,
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: CONFIG.COLORS.border,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: CONFIG.COLORS.text,
    },
    summaryText: {
      fontSize: 16,
      color: CONFIG.COLORS.text,
      marginBottom: 5,
    },
    cardContainer: {
      backgroundColor: CONFIG.COLORS.white,
      padding: 15,
      borderRadius: 8,
      marginBottom: 0,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      color: CONFIG.COLORS.text,
    },
    inputContainer: {
      marginBottom: 15,
    },
    label: {
      fontSize: 14,
      color: CONFIG.COLORS.text,
      marginBottom: 5,
    },
    input: {
      borderWidth: 1,
      borderColor: CONFIG.COLORS.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    buyButton: {
      backgroundColor: CONFIG.COLORS.primary,
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20,
    },
    buyButtonText: {
      color: CONFIG.COLORS.white,
      fontSize: 16,
      fontWeight: 'bold',
    },
});