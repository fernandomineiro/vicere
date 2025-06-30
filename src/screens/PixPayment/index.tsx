import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CONFIG } from '../../config/global';
import MainLayout from '../../components/MainLayout';
import Toast from 'react-native-toast-message';

export default function PixPayment() {
  const navigation = useNavigation();
  const [pixKey, setPixKey] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    // Implementation for Pix payment will go here
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
          <Text style={styles.headerTitle}>Pagar com Pix</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {/* Seção do QR Code */}
          <Text style={styles.headerText}>Pagar com QR Code</Text>
          <TouchableOpacity 
            style={styles.qrCodeSection}
            onPress={() => navigation.navigate('QRCodeScanner')}
          >
            <Image 
              source={require('../../../assets/qrcode-icon.png')}
              style={styles.qrCodeIconLarge}
            />
          </TouchableOpacity>

          {/* Seção do formulário */}
          <View style={styles.formSection}>
            <Text style={styles.label}>Chave Pix</Text>
            <TextInput
              style={styles.input}
              value={pixKey}
              onChangeText={setPixKey}
              placeholder="Digite a chave Pix"
            />

            <Text style={styles.label}>Valor</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="R$ 0,00"
              keyboardType="numeric"
            />

            <TouchableOpacity 
              style={styles.payButton}
              onPress={handleSubmit}
            >
              <Text style={styles.payButtonText}>Pagar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
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
  form: {
    width: '100%',
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
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
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
  pixKeyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  inputWrapper: {
    flex: 1,
    marginRight: 10,
  },
  qrCodeButton: {
    backgroundColor: CONFIG.COLORS.primary,
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 54,
  },
  qrCodeIcon: {
    width: 24,
    height: 24,
    tintColor: CONFIG.COLORS.white,
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    marginBottom: 30,
  },
  headerText: {
    fontSize: 18,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  qrCodeSection: {
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 8,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    marginBottom: 30,
  },
  qrCodeIconLarge: {
    width: 80,
    height: 80,
    tintColor: CONFIG.COLORS.primary,
  },
  formSection: {
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
  },
});