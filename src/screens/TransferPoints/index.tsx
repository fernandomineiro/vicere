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
import { useNavigation } from '@react-navigation/native';
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

type TransferPointsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

export default function TransferPoints() {
  const navigation = useNavigation<TransferPointsScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [points, setPoints] = useState(25);
  const [friendCPF, setFriendCPF] = useState('');
  const [userPoints, setUserPoints] = useState(0);
  const [clientId, setClientId] = useState('');
  const [isCPFValid, setIsCPFValid] = useState(false);
  const [isCheckingCPF, setIsCheckingCPF] = useState(false);
  const [userData, setUserData] = useState(null);

  // Primeiro, vamos atualizar o useEffect para definir os pontos do usuário
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userID = await AsyncStorage.getItem('userID');
        setClientId(userID || '');
        const response = await axios.post(`${CONFIG.API_URL}/seleciona_cliente.class.php`, {
          CLI_ID: userID
        });
        if (response.data) {
          setUserData(response.data);
          setUserPoints(response.data.PT_PONTOS || 0); // Definindo userPoints
        }
      } catch (error) {
        console.error('Erro ao buscar pontos:', error);
        showToast('error', 'Erro ao carregar pontos');
      }
    };
    loadUserData();
  }, []);

  // Atualizar a função handlePointsChange
  const handlePointsChange = (increment: boolean) => {
    setPoints(prevPoints => {
      const newPoints = increment ? prevPoints + 25 : prevPoints - 25;
      if (newPoints < 25) return 25;
      if (newPoints > userData?.PT_PONTOS) return prevPoints;
      return newPoints;
    });
  };

  // Remove the loose TouchableOpacity component and move styles here
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
    messageContainer: {
      backgroundColor: CONFIG.COLORS.white,
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: CONFIG.COLORS.border,
    },
    messageText: {
      fontSize: 16,
      color: CONFIG.COLORS.text,
      textAlign: 'center',
    },
    pointsInfoContainer: {
      backgroundColor: CONFIG.COLORS.white,
      padding: 15,
      borderRadius: 8,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: CONFIG.COLORS.border,
    },
    // Add new style
    pointsInfoText: {
      fontSize: 16,
      color: CONFIG.COLORS.text,
      textAlign: 'center',
      marginBottom: 5, // Add space between lines
    },
    remainingPointsText: {
      fontSize: 14,
      color: CONFIG.COLORS.primary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    formContainer: {
      backgroundColor: CONFIG.COLORS.white,
      padding: 15,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: CONFIG.COLORS.border,
    },
    inputContainer: {
      marginBottom: 20,
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
    inputValid: {
      borderColor: CONFIG.COLORS.success,
    },
    cpfLoader: {
      position: 'absolute',
      right: 12,
      top: 40,
    },
    pointsContainer: {
      marginBottom: 20,
    },
    pointsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
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
      backgroundColor: CONFIG.COLORS.primary,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 15,
    },
    pointsButtonText: {
      color: CONFIG.COLORS.white,
      fontSize: 24,
      fontWeight: 'bold',
    },
    pointsValue: {
      fontSize: 24, // Increased from 24 to 72
      fontWeight: 'bold',
      color: CONFIG.COLORS.text,
      marginHorizontal: 30, // Added to give more space around the number
    },
    pointsValueBold: {
        fontSize: 16, // Increased from 24 to 72
        fontWeight: 'bold',
        color: CONFIG.COLORS.secondary,
        marginHorizontal: 30, // Added to give more space around the number
      },
    pointsButton: {
      width: 50, // Increased from 40 to match the new scale
      height: 50, // Increased from 40 to match the new scale
      backgroundColor: CONFIG.COLORS.primary,
      borderRadius: 8, // Slightly increased for better proportion
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 20,
    },
    transferButton: {
      backgroundColor: CONFIG.COLORS.primary,
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
      width: '100%',
    },
    transferButtonDisabled: {
      backgroundColor: CONFIG.COLORS.primary,
      opacity: 0.7,
    },
    transferButtonText: {
      color: CONFIG.COLORS.white,
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      width: '100%',
    },
  }); // Fechamento do StyleSheet.create

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
      console.error('Erro ao validar CPF:', error);
      setIsCPFValid(false);
      showToast('error', 'Erro ao validar CPF');
    } finally {
      setIsCheckingCPF(false);
    }
  };

  const handleTransfer = async () => {
    if (!isCPFValid) {
      showToast('error', 'CPF inválido', 'Por favor, insira um CPF válido');
      return;
    }

    if (points > userPoints) {
      showToast('error', 'Pontos insuficientes', 'Você não possui pontos suficientes');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${CONFIG.API_URL}/transferir_pontos.class.php`, {
        clientId,
        friendCPF,
        points
      });

      if (response.data.success) {
        showToast('success', 'Pontos transferidos com sucesso');
        setFriendCPF(''); // Clear CPF field
        setIsCPFValid(false); // Reset CPF validation
        
        // Reload user data to update points
        const userResponse = await axios.post(`${CONFIG.API_URL}/seleciona_cliente.class.php`, {
          CLI_ID: clientId
        });
        if (userResponse.data) {
          setUserData(userResponse.data);
          setUserPoints(userResponse.data.PT_PONTOS || 0);
        }
      } else {
        throw new Error(response.data.message || 'Erro ao transferir pontos');
      }
    } catch (error) {
      console.error('Erro na transferência:', error);
      showToast('error', 'Erro na transferência', error.message);
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
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              Transfira seus pontos para outro usuário do Vicere
            </Text>
          </View>

          <View style={styles.pointsInfoContainer}>
            <Text style={styles.pointsInfoText}>
              Você possui: <Text style={styles.pointsValue}>{userData?.PT_PONTOS || 0} pontos</Text>
            </Text>
            <Text style={styles.remainingPointsText}>
              Saldo após transferência: <Text style={styles.pointsValueBold}>{(userData?.PT_PONTOS || 0) - points}</Text> pontos
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>CPF do destinatário</Text>
              <TextInput
                style={[
                  styles.input,
                  isCPFValid && styles.inputValid
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
                placeholder="000.000.000-00"
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
            </View>

            <TouchableOpacity 
              style={[
                styles.transferButton,
                (!isCPFValid || points > userPoints) && styles.transferButtonDisabled
              ]}
              onPress={handleTransfer}
              disabled={!isCPFValid || points > userPoints}
            >
              <Text style={styles.transferButtonText}>Transferir Pontos</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        <Loading visible={isLoading} />
        <Toast />
      </View>
      <BottomMenu />
    </MainLayout>
  );
}