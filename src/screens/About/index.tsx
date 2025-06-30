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

export default function About() {
  const navigation = useNavigation();
  const appVersion = '1.0.0';

  const handleContactPress = () => {
    Linking.openURL('mailto:contato@vicere.com.br');
  };

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sobre o App</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
              style={styles.content} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100, paddingTop:0 }} // Adicionado padding extra no content container
            >
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/vicere-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.version}>Versão {appVersion}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Sobre a Vicere</Text>
            <Text style={styles.description}>
              A Vicere é uma plataforma inovadora que oferece soluções financeiras e benefícios exclusivos para nossos clientes. 
              Com nosso aplicativo, você pode realizar diversas operações financeiras de forma simples e segura.
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Contato</Text>
            <TouchableOpacity onPress={handleContactPress}>
              <Text style={styles.contactLink}>contato@vicere.com.br</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Redes Sociais</Text>
            <View style={styles.socialLinks}>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => Linking.openURL('https://instagram.com/vicere')}
              >
                <Image
                  source={require('../../../assets/instagram-icon.png')}
                  style={styles.socialIcon}
                />
                <Text style={styles.socialText}>Instagram</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => Linking.openURL('https://facebook.com/vicere')}
              >
                <Image
                  source={require('../../../assets/facebook-icon.png')}
                  style={styles.socialIcon}
                />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>
            </View>
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
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 10,
  },
  version: {
    fontSize: 14,
    color: CONFIG.COLORS.textLight,
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
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
    lineHeight: 24,
  },
  contactLink: {
    fontSize: 16,
    color: CONFIG.COLORS.primary,
    textDecorationLine: 'underline',
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  socialButton: {
    alignItems: 'center',
  },
  socialIcon: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  socialText: {
    fontSize: 14,
    color: CONFIG.COLORS.text,
  },
});