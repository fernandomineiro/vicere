import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CONFIG } from '../../config/global';
import MainLayout from '../../components/MainLayout';
import Loading from '../../components/Loading';
import BottomMenu from '../../components/BottomMenu';

export default function ThankYou() {
  const navigation = useNavigation();

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.backButton}>
            <View style={styles.menuIconPlaceholder} />
          </View>
          <Image
            source={require('../../../assets/vicere-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.menuIconPlaceholder} />
        </View>

        <View style={styles.content}>
          <Image
            source={require('../../../assets/success-icon.png')}
            style={styles.successIcon}
            resizeMode="contain"
          />
          
          <Text style={styles.title}>Pedido Realizado!</Text>
          <Text style={styles.message}>
            Seu pedido foi realizado com sucesso. Você receberá mais informações por e-mail.
          </Text>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={styles.buttonText}>Voltar ao Início</Text>
          </TouchableOpacity>
        </View>
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
  logoImage: {
    width: 120,
    height: 40,
  },
  menuIconPlaceholder: {
    width: 27,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successIcon: {
    width: 120,
    height: 120,
    marginBottom: 30,
    tintColor: CONFIG.COLORS.success,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    backgroundColor: CONFIG.COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: CONFIG.COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});