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
import MainLayout from '../../components/MainLayout';
import Loading from '../../components/Loading';
import BottomMenu from '../../components/BottomMenu';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';

const MENU_OPTIONS = [
  { id: 'dados', name: 'Meus Dados', icon: require('../../../assets/user-icon.png'), route: 'UserData' },
  { id: 'cartoes', name: 'Meus Cartões', icon: require('../../../assets/card-icon.png'), route: 'MyCards' },
  { id: 'banco', name: 'Minhas Contas', icon: require('../../../assets/bank-icon.png'), route: 'BankAccounts' },
  { id: 'endereco', name: 'Endereço', icon: require('../../../assets/address-icon.png'), route: 'Address' },
  { id: 'comprar', name: 'Comprar Pontos', icon: require('../../../assets/buypoints-icon.png'), route: 'BuyPoints' },
  { id: 'transferir', name: 'Transferir Pontos', icon: require('../../../assets/transfer-icon.png'), route: 'TransferPoints' },
  { id: 'contas', name: 'Pagar Contas', icon: require('../../../assets/pay-icon.png'), route: 'PayBills' },
  { id: 'recargas', name: 'Recargas', icon: require('../../../assets/recarga-icon.png'), route: 'MobileRecharge' },
  { id: 'pix', name: 'Pix', icon: require('../../../assets/pix-icon.png'), route: 'PixWithdraw' },
  { id: 'extrato', name: 'Extrato', icon: require('../../../assets/extract-icon.png'), route: 'Statement' },
  { id: 'compras', name: 'Minhas Compras', icon: require('../../../assets/shopping-icon.png'), route: 'MyPurchases' },
  { id: 'seguranca', name: 'Segurança', icon: require('../../../assets/security-icon.png'), route: 'Security' },
  { id: 'contato', name: 'Contato', icon: require('../../../assets/contact-icon.png'), route: 'Contact' },
  { id: 'notificacoes', name: 'Notificações', icon: require('../../../assets/notificacoes-icon.png'), route: 'Notifications' },
  { 
    id: 'sair', 
    name: 'Sair', 
    icon: require('../../../assets/logout-icon.png'), 
    route: 'logout',
    customStyle: {
      backgroundColor: CONFIG.COLORS.primary,
      borderColor: CONFIG.COLORS.primary
    },
    iconStyle: {
      tintColor: CONFIG.COLORS.white
    },
    textStyle: {
      color: CONFIG.COLORS.white
    }
  },
];

type Props = {
  navigation: NavigationProp<RootStackParamList>;
  isAuthenticated: boolean;
};

function Profile({ navigation, isAuthenticated }: Props) {
  const [showAuthAlert, setShowAuthAlert] = useState(false);

  const handleMenuPress = (route: string) => {
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

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Minha Conta</Text>
        </View>

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.menuGrid}>
            {MENU_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.menuItem,
                  option.customStyle // Aplicando o estilo customizado
                ]}
                onPress={() => handleMenuPress(option.route)}
              >
                <Image 
                  source={option.icon} 
                  style={[
                    styles.menuIcon,
                    option.iconStyle // Aplicando o estilo do ícone
                  ]} 
                />
                <Text style={[
                  styles.menuText,
                  option.textStyle // Aplicando o estilo do texto
                ]}>
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
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
      </View>
      <BottomMenu />
    </MainLayout>
  );
}

// Atualizar apenas os estilos necessários
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
  headerTitle: {
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: CONFIG.COLORS.white,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: CONFIG.COLORS.primary,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
  },
  infoSection: {
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 15,
  },
  infoItem: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: CONFIG.COLORS.textLight,
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
  },
  logoutButton: {
    backgroundColor: '#FF4B4B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 5,
  },
  menuItem: {
    width: 80,
    height: 80,
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.primary,
    padding: 12,
    margin: 10, // Aumentado de 5 para 10
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    width: 28,
    height: 28,
    marginBottom: 5,
    tintColor: CONFIG.COLORS.primary,
  },
  menuText: {
    fontSize: 12,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
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
  },
});

// Wrapper com autenticação
function ProfileWrapper() {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  return <Profile navigation={navigation} isAuthenticated={isAuthenticated} />;
}

export default ProfileWrapper;