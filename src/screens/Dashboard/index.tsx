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
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { CONFIG } from '../../config/global';
import Loading from '../../components/Loading';
import BottomMenu from '../../components/BottomMenu';
import MainLayout from '../../components/MainLayout';
import { useAuth } from '../../contexts/AuthContext';

const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userID = await AsyncStorage.getItem('userID');
        const response = await axios.post(`${CONFIG.API_URL}/seleciona_cliente.class.php`, {
          CLI_ID: userID
        });
        
        if (response.data) { // Removido check de success
          setUserData(response.data); // Usando response.data diretamente
        }
      } catch (error) {
        console.error('Erro detalhado da API:', {
          endpoint: error.config?.url,
          metodo: error.config?.method,
          status: error.response?.status,
          dados: error.response?.data,
          mensagem: error.message,
          stack: error.stack
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleFeaturePress = (route: string) => {
    const restrictedRoutes = ['PayBills', 'MobileRecharge', 'PixWithdraw', 'BuyPoints', 'TransferPoints'];
    
    if (restrictedRoutes.includes(route) && !isAuthenticated) {
      setShowAuthAlert(true);
      return;
    }
    navigation.navigate(route);
  };

  return (
    <MainLayout>
      <Loading visible={loading} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../../../assets/vicere-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 120 }}>
          <View style={[styles.userInfo, !isAuthenticated && { marginBottom: 30 }]}>
            <Text style={styles.welcomeText}>
              {isAuthenticated 
                ? `Bem-vindo, ${userData?.CLI_NOME || ''}` 
                : 'Bem-vindo a vicere'}
            </Text>
          </View>

          {isAuthenticated ? (
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceTitle}>Seu Saldo</Text>
              <View style={styles.balanceBox}>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceLabel}>Pontos Disponíveis</Text>
                  <Text style={styles.balanceValue}>{userData?.PT_PONTOS || 0}</Text>
                </View>
                <View style={[styles.balanceItem, styles.balanceItemRight]}>
                  <Text style={styles.balanceLabel}>Saldo em R$</Text>
                  <Text style={styles.balanceValue}>
                    {formatCurrency(((userData?.PT_PONTOS || 0) * 0.005))}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          <View style={styles.boxContainer}>
            <View style={styles.boxRow}>
              <TouchableOpacity 
                style={styles.box}
                onPress={() => navigation.navigate('PayBills')}
              >
                <Image source={require('../../../assets/pay-icon.png')} style={styles.boxIcon} />
                <Text style={styles.boxText}>Pagar Contas</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.box}
                onPress={() => navigation.navigate('MobileRecharge')}
              >
                <Image source={require('../../../assets/recarga-icon.png')} style={styles.boxIcon} />
                <Text style={styles.boxText}>Recarga</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.box}
                onPress={() => navigation.navigate('PixWithdraw')}
              >
                <Image source={require('../../../assets/pix-icon.png')} style={styles.boxIcon} />
                <Text style={styles.boxText}>Pix</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.boxRow}>
              <TouchableOpacity 
                style={styles.box}
                onPress={() => navigation.navigate('BuyPoints')}
              >
                <Image source={require('../../../assets/buypoints-icon.png')} style={styles.boxIcon} />
                <Text style={styles.boxText}>Comprar Pontos</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.box}
                onPress={() => navigation.navigate('TransferPoints')}
              >
                <Image source={require('../../../assets/transfer-icon.png')} style={styles.boxIcon} />
                <Text style={styles.boxText}>Transferir Pontos</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.box}
                onPress={() => navigation.navigate('ValidarCodigo')}
              >
                <Image source={require('../../../assets/validate-icon.png')} style={styles.boxIcon} />
                <Text style={styles.boxText}>Validar Código</Text>
              </TouchableOpacity>
            </View>

            {!isAuthenticated && (
              <View style={styles.boxRow}>
                <TouchableOpacity 
                  style={styles.box}
                  onPress={() => navigation.navigate('Cadastro')}
                >
                  <Image source={require('../../../assets/register-icon.png')} style={styles.boxIcon} />
                  <Text style={styles.boxText}>Cadastrar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.box}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Image source={require('../../../assets/login-icon.png')} style={styles.boxIcon} />
                  <Text style={styles.boxText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.box}
                  onPress={() => navigation.navigate('Shopping')}
                >
                  <Image source={require('../../../assets/cart-icon.png')} style={styles.boxIcon} />
                  <Text style={styles.boxText}>Shopping</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.boxRow}>
              {!isAuthenticated && (
                <TouchableOpacity 
                  style={styles.box}
                  onPress={() => navigation.navigate('CentralAjuda')}
                >
                  <Image source={require('../../../assets/help-icon.png')} style={styles.boxIcon} />
                  <Text style={styles.boxText}>Central de Ajuda</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Remover os botões antigos de Shopping e Help */}
        </View>
      </ScrollView>

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
  container: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.background || '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  menuIcon: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  userInfo: {
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 5,
  },
  pointsText: {
    fontSize: 18,
    color: CONFIG.COLORS.primary,
  },
  balanceContainer: {
    marginBottom: 30,
  },
  balanceTitle: {
    fontSize: 20,
    color: CONFIG.COLORS.text,
    marginBottom: 10,
  },
  balanceBox: {
    flexDirection: 'row',
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.primary,
  },
  balanceItem: {
    flex: 1,
  },
  balanceItemRight: {
    borderLeftWidth: 1,
    borderLeftColor: CONFIG.COLORS.border,
    marginLeft: 7,
    paddingLeft: 15,
  },
  balanceLabel: {
    fontSize: 15,
    color: CONFIG.COLORS.text,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
  },
  boxContainer: {
    marginBottom: 20,
  },
  boxRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    width: '100%',
  },
  box: {
    width: 80,
    height: 80,
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 10,
    padding: 12,
    margin: 5, // Alterado para margin em vez de marginHorizontal
    borderWidth: 1,
    borderColor: CONFIG.COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxText: {
    fontSize: 12,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
    marginTop: 5,
  },
  boxIcon: {
    width: 28,
    height: 28,
    tintColor: CONFIG.COLORS.primary,
  },
  shoppingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CONFIG.COLORS.primary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CONFIG.COLORS.secondary,
    padding: 15,
    borderRadius: 10,
  },
  buttonIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    tintColor: CONFIG.COLORS.white,
  },
  buttonText: {
    flex: 1,
    color: CONFIG.COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  arrowIcon: {
    width: 24,
    height: 24,
    tintColor: CONFIG.COLORS.white,
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