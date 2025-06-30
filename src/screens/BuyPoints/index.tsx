import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CONFIG } from '../../config/global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainLayout from '../../components/MainLayout';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import Loading from '../../components/Loading';
import Toast from 'react-native-toast-message';
import BottomMenu from '../../components/BottomMenu';
import axios from 'axios';
import { formatCPF } from '../../utils/cpfUtils';
import { validateCPF } from '../../utils/validations';

type BuyPointsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

// Adicione esta função no início do componente
const showToast = (type: 'success' | 'error', title: string, message?: string) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 50,
    bottomOffset: 40,
  });
};

export default function BuyPoints() {
  const navigation = useNavigation<BuyPointsScreenNavigationProp>();
  const route = useRoute();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'me' | 'friend'>('me');
  const [points, setPoints] = useState(25);
  const [friendCPF, setFriendCPF] = useState('');
  const [clientId, setClientId] = useState('');

  const neededPoints = route.params?.neededPoints || 0;

  useEffect(() => {
    const carregarSessao = async () => {
      const storedClientId = await AsyncStorage.getItem('userID');
      setClientId(storedClientId || '');
      if (neededPoints > 0) {
        setPoints(Math.ceil(neededPoints / 25) * 25);
      }
    };

    carregarSessao();
  }, [neededPoints]);

  const handlePointsChange = (increment: boolean) => {
    setPoints(prevPoints => {
      const newPoints = increment ? prevPoints + 25 : prevPoints - 25;
      return Math.max(25, newPoints);
    });
  };

  const [isCPFValid, setIsCPFValid] = useState(false);
  const [isCheckingCPF, setIsCheckingCPF] = useState(false);

  // Remover as funções formatCPF e validateCPF antigas

  // Adicionar a função validateCPFInBackend no lugar correto
  const validateCPFInBackend = async (cpf: string) => {
    setIsCheckingCPF(true);
    try {
      const response = await axios.post(`${CONFIG.API_URL}/verifica_cpf.class.php`, {
        cpf: cpf
      });
      
      setIsCPFValid(response.data.success === 1);

      if (response.data.success === 0) {
        showToast(
          'error',
          'CPF não cadastrado',
          'Este CPF não está cadastrado em nossa base'
        );
      }
    } catch (error) {
      setIsCPFValid(false);
      showToast('error', 'Erro ao validar CPF');
    } finally {
      setIsCheckingCPF(false);
    }
  };

  const handleNavigation = () => {
    const navigationParams = {
      points: points,
      purchaseType: selectedOption,
      friendCPF: selectedOption === 'friend' ? friendCPF : undefined
    };
        
    navigation.navigate('PaymentScreen', navigationParams);
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

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={CONFIG.COLORS.primary} />
          </View>
        ) : (
          <View style={styles.content}>
            {neededPoints > 0 ? (
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  Você precisa de mais {neededPoints} pontos para completar sua compra/ resgate
                </Text>
              </View>
            ) : (
              <View style={styles.optionsContainer}>
                <Text style={styles.title}>Selecione uma opção:</Text>
                <TouchableOpacity 
                  style={[
                    styles.optionButton,
                    selectedOption === 'me' && styles.optionButtonSelected
                  ]}
                  onPress={() => setSelectedOption('me')}
                >
                  <Text style={[
                    styles.optionText,
                    selectedOption === 'me' && styles.optionTextSelected
                  ]}>Pra mim</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.optionButton,
                    selectedOption === 'friend' && styles.optionButtonSelected
                  ]}
                  onPress={() => setSelectedOption('friend')}
                >
                  <Text style={[
                    styles.optionText,
                    selectedOption === 'friend' && styles.optionTextSelected
                  ]}>Para um amigo</Text>
                </TouchableOpacity>
              </View>
            )}
            {selectedOption === 'friend' && (
              <View style={styles.cpfContainer}>
                <Text style={styles.cpfLabel}>CPF do amigo:</Text>
                <TextInput
                  style={[
                    styles.cpfInput,
                    isCPFValid && styles.cpfInputValid
                  ]}
                  value={formatCPF(friendCPF)}
                  onChangeText={(value) => setFriendCPF(value.replace(/\D/g, ''))}
                  onBlur={() => {
                    if (validateCPF(friendCPF)) {
                      validateCPFInBackend(friendCPF);
                    } else {
                      showToast(
                        'error',
                        'CPF inválido',
                        'Por favor, insira um CPF válido'
                      );
                      setIsCPFValid(false);
                    }
                  }}
                  placeholder="Digite o CPF"
                  keyboardType="numeric"
                  maxLength={14}
                />
                {isCheckingCPF && (
                  <ActivityIndicator 
                    size="small" 
                    color={CONFIG.COLORS.primary}
                    style={styles.cpfLoader}
                  />
                )}
              </View>
            )}

            <View style={styles.pointsContainer}>
              <Text style={styles.pointsTitle}>Quantidade de pontos:</Text>
              <View style={styles.pointsControl}>
                <TouchableOpacity 
                  style={styles.pointsButton}
                  onPress={() => handlePointsChange(false)}
                >
                  <Text style={styles.pointsButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.pointsValue}>{points}</Text>
                <TouchableOpacity 
                  style={styles.pointsButton}
                  onPress={() => handlePointsChange(true)}
                >
                  <Text style={styles.pointsButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>
                  Valor total: <Text style={styles.totalValue}>{formatCurrency(points)}</Text>
                </Text>
              </View>
            </View>

           

            <TouchableOpacity 
              style={[
                styles.buyButton,
                (selectedOption === 'friend' && !isCPFValid) && styles.buyButtonDisabled
              ]}
              onPress={handleNavigation}
              disabled={selectedOption === 'friend' && !isCPFValid}
            >
              <Text style={styles.buyButtonText}>Comprar Pontos</Text>
            </TouchableOpacity>
          </View>
        )}

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
    paddingLeft: 10,
  },
  backIcon: {
    width: 27,
    height: 21,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    backgroundColor: CONFIG.COLORS.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: CONFIG.COLORS.text,
  },
  optionButton: {
    backgroundColor: CONFIG.COLORS.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
  },
  optionButtonSelected: {
    borderColor: CONFIG.COLORS.primary,
    backgroundColor: CONFIG.COLORS.primary + '10',
  },
  optionText: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: CONFIG.COLORS.primary,
    fontWeight: 'bold',
  },
  pointsContainer: {
    backgroundColor: CONFIG.COLORS.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  pointsTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: CONFIG.COLORS.text,
  },
  pointsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.primary,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsButtonText: {
    fontSize: 24,
    color: CONFIG.COLORS.primary,
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 20,
    color: CONFIG.COLORS.text,
  },
  cpfContainer: {
    backgroundColor: CONFIG.COLORS.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 0,
  },
  cpfLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: CONFIG.COLORS.text,
  },
  cpfInput: {
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  cpfInputValid: {
    borderColor: CONFIG.COLORS.success,
  },
  cpfLoader: {
    marginTop: 10,
  },
  buyButtonDisabled: {
    backgroundColor: CONFIG.COLORS.border,
    opacity: 0.7,
  },
  buyButton: {
    backgroundColor: CONFIG.COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: CONFIG.COLORS.border,
  },
  totalText: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CONFIG.COLORS.primary,
  },
});