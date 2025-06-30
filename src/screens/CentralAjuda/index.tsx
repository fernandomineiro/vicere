import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CONFIG } from '../../config/global';
import MainLayout from '../../components/MainLayout';
import BottomMenu from '../../components/BottomMenu';

export default function CentralAjuda() {
  const navigation = useNavigation();

  const handleContactPress = (type: string) => {
    switch (type) {
      case 'whatsapp':
        Linking.openURL('https://wa.me/5511999999999');
        break;
      case 'phone':
        Linking.openURL('tel:0800999999');
        break;
      case 'email':
        Linking.openURL('mailto:suporte@vicere.com.br');
        break;
    }
  };

  return (
    <MainLayout>
      <ScrollView style={styles.container}>
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
          <Text style={styles.title}>Central de Ajuda</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>Como podemos ajudar?</Text>
          
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => handleContactPress('whatsapp')}
          >
            <Image
              source={require('../../../assets/whatsapp-icon.png')}
              style={styles.contactIcon}
            />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>WhatsApp</Text>
              <Text style={styles.contactText}>Atendimento rápido via mensagem</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => handleContactPress('phone')}
          >
            <Image
              source={require('../../../assets/phone-icon.png')}
              style={styles.contactIcon}
            />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Telefone</Text>
              <Text style={styles.contactText}>0800 999 999</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => handleContactPress('email')}
          >
            <Image
              source={require('../../../assets/email-icon.png')}
              style={styles.contactIcon}
            />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>E-mail</Text>
              <Text style={styles.contactText}>suporte@vicere.com.br</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginLeft: 10,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CONFIG.COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
  },
  contactIcon: {
    width: 30,
    height: 30,
    tintColor: CONFIG.COLORS.primary,
  },
  contactInfo: {
    marginLeft: 15,
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
  },
  contactText: {
    fontSize: 14,
    color: CONFIG.COLORS.text,
    marginTop: 2,
  },
});