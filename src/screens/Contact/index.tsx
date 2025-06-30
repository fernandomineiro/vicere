import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CONFIG } from '../../config/global';
import MainLayout from '../../components/MainLayout';
import BottomMenu from '../../components/BottomMenu';

export default function Contact() {
  const navigation = useNavigation();

  const contactOptions = [
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      description: 'Fale conosco pelo WhatsApp',
      icon: require('../../../assets/whatsapp-icon.png'),
      action: () => Linking.openURL('whatsapp://send?phone=5500000000000')
    },
    {
      id: 'email',
      title: 'E-mail',
      description: 'Envie-nos um e-mail',
      icon: require('../../../assets/email-icon.png'),
      action: () => Linking.openURL('mailto:contato@vicere.com.br')
    },
    {
      id: 'phone',
      title: 'Telefone',
      description: '0800 000 0000',
      icon: require('../../../assets/phone-icon.png'),
      action: () => Linking.openURL('tel:08000000000')
    },
  ];

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
          <Text style={styles.headerTitle}>Contato</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Entre em contato conosco através de um dos canais abaixo:
            </Text>
          </View>

          {contactOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.contactItem}
              onPress={option.action}
            >
              <Image source={option.icon} style={styles.contactIcon} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactDescription}>{option.description}</Text>
              </View>
              <Image 
                source={require('../../../assets/arrow-right.png')}
                style={styles.arrowIcon}
              />
            </TouchableOpacity>
          ))}

          <View style={styles.businessHours}>
            <Text style={styles.businessHoursTitle}>Horário de Atendimento</Text>
            <Text style={styles.businessHoursText}>
              Segunda a Sexta: 09h às 18h{'\n'}
              Sábado: 09h às 13h
            </Text>
          </View>
        </ScrollView>
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
  infoContainer: {
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
  },
  contactIcon: {
    width: 24,
    height: 24,
    tintColor: CONFIG.COLORS.primary,
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: CONFIG.COLORS.textLight,
  },
  arrowIcon: {
    width: 30,
    height: 20,
    tintColor: CONFIG.COLORS.textLight,
  },
  businessHours: {
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  businessHoursTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 10,
  },
  businessHoursText: {
    fontSize: 14,
    color: CONFIG.COLORS.text,
    lineHeight: 20,
  },
});