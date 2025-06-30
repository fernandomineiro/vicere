import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { CONFIG } from '../../config/global';
import MainLayout from '../../components/MainLayout';
import Loading from '../../components/Loading';
import BottomMenu from '../../components/BottomMenu';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext'; // Add this import

type RootStackParamList = {
  PayBills: undefined;
  Dashboard: undefined;
};

// Primeiro, atualize a interface Props
type Props = {
  navigation: NavigationProp<RootStackParamList>;
  isAuthenticated: boolean; // Adicionar esta prop
};

class PayBills extends React.Component<Props> {
  state = {
    isLoading: false,
    showAuthAlert: false,
  };

  handleButtonPress = (action: string) => {
    const { isAuthenticated } = this.props;
    
    if (!isAuthenticated) {
      this.setState({ showAuthAlert: true });
      return;
    }




    const handleMenuPress = (route: string) => {
      const [showAuthAlert, setShowAuthAlert] = useState(false);
      
      if (!isAuthenticated) {
        setShowAuthAlert(true);
        return;
      }
      if (route === 'logout') {
        // lógica de logout
      } else {
        navigation.navigate(route);
      }
    };

    switch (action) {
      case 'barcode':
        this.props.navigation.navigate('BarcodeScanner');
        break;
      case 'qrcode':
        this.props.navigation.navigate('QRCodeScanner');
        break;
      case 'pix':
        this.props.navigation.navigate('PixPayment');
        break;
    }
  };

  render() {
    const { isLoading, showAuthAlert } = this.state;
    const { isAuthenticated } = this.props;
    
    return (
      <MainLayout>
        <View style={styles.container}>
          <View style={styles.header}>

            <Text style={styles.headerTitle}>Pagar Conta</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.inputContainer}>
              <View style={styles.scanOptionsContainer}>
                <TouchableOpacity 
                  style={[
                    styles.scanOptionBox,
                    !isAuthenticated && styles.disabledButton
                  ]}
                  onPress={() => this.handleButtonPress('barcode')}
                >
                  <Image 
                    source={require('../../../assets/barcode-icon.png')}
                    style={[
                      styles.scanOptionIcon,
                      !isAuthenticated && styles.disabledIcon
                    ]}
                  />
                  <Text style={styles.scanOptionText}>Ler Código de Barras</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.scanOptionBox,
                    !isAuthenticated && styles.disabledButton
                  ]}
                  onPress={() => this.handleButtonPress('qrcode')}
                >
                  <Image 
                    source={require('../../../assets/qrcode-icon.png')}
                    style={[
                      styles.scanOptionIcon,
                      !isAuthenticated && styles.disabledIcon
                    ]}
                  />
                  <Text style={styles.scanOptionText}>Ler QR Code</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.scanOptionsContainer, { marginTop: 20 }]}>
                <TouchableOpacity 
                  style={[
                    styles.scanOptionBox,
                    { width: '45%' },
                    !isAuthenticated && styles.disabledButton
                  ]}
                  onPress={() => this.handleButtonPress('pix')}
                >
                  <Image 
                    source={require('../../../assets/pix-icon.png')}
                    style={[
                      styles.scanOptionIcon,
                      !isAuthenticated && styles.disabledIcon
                    ]}
                  />
                  <Text style={styles.scanOptionText}>Pagar com Pix</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
        <Loading visible={isLoading} />
        <BottomMenu />

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
                onPress={() => this.setState({ showAuthAlert: false })}
              >
                <Text style={styles.alertButtonTextSecondary}>Fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.alertButton, styles.alertButtonPrimary]}
                onPress={() => this.props.navigation.navigate('Login')}
              >
                <Text style={styles.alertButtonText}>Fazer Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </MainLayout>
    );
  }
}

// No final do arquivo, após a classe
function PayBillsWrapper() {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  return <PayBills navigation={navigation} isAuthenticated={isAuthenticated} />;
}

export default PayBillsWrapper;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Alterado para center
    padding: 15,
    paddingTop: 40,
    backgroundColor: CONFIG.COLORS.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    flex: 1, // Adicionado
    textAlign: 'center', // Já existente, mas importante manter
  },
  headerTitle: {
  textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: CONFIG.COLORS.text,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
    marginBottom: 8,
  },
  barcodeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
  },
  scanButton: {
    padding: 12,
    backgroundColor: CONFIG.COLORS.primary,
    borderRadius: 8,
  },
  scanIcon: {
    width: 24,
    height: 24,
    tintColor: CONFIG.COLORS.white,
  },

  billInfo: {
    backgroundColor: CONFIG.COLORS.white,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
  },
  billInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 15,
  },
  billInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  billInfoLabel: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
  },
  billInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
  },
  payButton: {
    backgroundColor: CONFIG.COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  payButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
  },
  scanOptionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
    },
    scanOptionBox: {
      width: '45%',
      borderWidth: 1,
      borderColor: CONFIG.COLORS.border,
      borderRadius: 8,
      padding: 15,
      alignItems: 'center',
      backgroundColor: CONFIG.COLORS.white,
    },
    scanOptionIcon: {
      width: 40,
      height: 40,
      marginBottom: 10,
      tintColor: CONFIG.COLORS.primary,
    },
    scanOptionText: {
      fontSize: 14,
      color: CONFIG.COLORS.text,
      textAlign: 'center',
    },
  
  closeButton: {
    backgroundColor: CONFIG.COLORS.primary,
    padding: 15,
    borderRadius: 8,
    width: 120,
    alignItems: 'center',
  },
  closeButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
    unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lockIcon: {
    width: 65,
    height: 80,
    tintColor: CONFIG.COLORS.primary,
    marginBottom: 20,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 10,
  },
  unauthorizedText: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: CONFIG.COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  loginButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  alertBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -150 }, // metade da largura do box (300px)
      { translateY: -100 },
    ],
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: 300, // largura fixa para garantir mesmo espaçamento
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
    marginBo4ttom: 15,
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
  }

});