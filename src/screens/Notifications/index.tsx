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

export default function Notifications() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [comId, setComId] = useState(null);
  const [preferences, setPreferences] = useState({
    email: false,
    sms: false,
    push: false,
    whatsapp: false,
    call: false,
    promo: false,
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const userID = await AsyncStorage.getItem('userID');
      const response = await axios.post(`${CONFIG.API_URL}/seleciona_comunicacao_cliente.class.php`, {
        CLI_ID: userID
      });
      
      if (response.data) {
        const data = response.data[0];
        setComId(data.COM_ID);
        setPreferences({
          email: data.COM_EMAIL === '1',     // '1' -> true (cor primária)
          sms: data.COM_SMS === '1',         // '1' -> true (cor primária)
          push: data.COM_PUSH === '1',       // '1' -> true (cor primária)
          whatsapp: data.COM_WHATS === '1',  // '1' -> true (cor primária)
          call: data.COM_TEL === '1',        // '1' -> true (cor primária)
          promo: data.COM_PAR === '1',     // '1' -> true (cor primária)
        });
      }
      setIsLoading(false);
    } catch (error) {
      
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar preferências',
        text2: 'Por favor, tente novamente'
      });
      setIsLoading(false);
    }
  };

  const togglePreference = async (key) => {
    try {
      const newValue = !preferences[key];
      setPreferences(prev => ({
        ...prev,
        [key]: newValue
      }));

      const userID = await AsyncStorage.getItem('userID');
      const payload = {
        CLI_ID: userID,
        COM_ID: comId, // Usando o comId do estado
        CLI_TAB: `COM_${key.toUpperCase()}`,
        CLI_ACT: newValue ? '0' : '1'
      };
      const response = await axios.post(`${CONFIG.API_URL}/upd_preferencias_cadastro.class.php`, payload);
      if (!response.data.success) {
        // Reverte a alteração em caso de erro
        setPreferences(prev => ({
          ...prev,
          [key]: !newValue
        }));
        throw new Error('Falha ao atualizar preferência');
      }
    } catch (error) {
      console.error('Erro ao atualizar preferência:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao atualizar preferência',
        text2: 'Por favor, tente novamente'
      });
    }
  };

  const NotificationBox = ({ title, active, onPress }) => (
    <TouchableOpacity
      style={[
        styles.notificationBox,
        active && styles.notificationBoxActive
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.notificationText,
        active && styles.notificationTextActive
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Notificações</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.description}>
            Desejo receber conteúdo da vicere por estes meios de contato e estas são as informações:
          </Text>

          <View style={styles.boxContainer}>
            <NotificationBox
              title="Email"
              active={preferences.email}
              onPress={() => togglePreference('email')}
            />
            <NotificationBox
              title="SMS"
              active={preferences.sms}
              onPress={() => togglePreference('sms')}
            />
            <NotificationBox
              title="Push"
              active={preferences.push}
              onPress={() => togglePreference('push')}
            />
            <NotificationBox
              title="Whatsapp"
              active={preferences.whatsapp}
              onPress={() => togglePreference('whatsapp')}
            />
            <NotificationBox
              title="Ligação"
              active={preferences.call}
              onPress={() => togglePreference('call')}
            />
             <NotificationBox
              title="Parceiros"
              active={preferences.promo}
              onPress={() => togglePreference('promo')}
            />
          </View>

          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.notificationBoxActive]} />
              <Text style={styles.legendText}>Ativo</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendBox} />
              <Text style={styles.legendText}>Inativo</Text>
            </View>
          </View>
        </ScrollView>
      </View>
      <Loading visible={isLoading} />
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
  description: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  boxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  notificationBox: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.primary,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  notificationBoxActive: {
    backgroundColor: CONFIG.COLORS.primary,
  },
  notificationText: {
    fontSize: 14,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
  },
  notificationTextActive: {
    color: CONFIG.COLORS.white,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 30,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.primary,
    backgroundColor: CONFIG.COLORS.white,
  },
  legendText: {
    fontSize: 14,
    color: CONFIG.COLORS.text,
  },
});