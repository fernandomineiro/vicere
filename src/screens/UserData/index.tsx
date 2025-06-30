import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
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
import { Picker } from '@react-native-picker/picker';

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').substr(0, 15);
};

const formatDate = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1-$2-$3').substr(0, 10);
};

export default function UserData() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    nascimento: '',
    genero: '',
    telefone: '',
    email: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      const response = await axios.post(`${CONFIG.API_URL}/seleciona_cliente.class.php`, {
        CLI_ID: userID
      });

      
      if (response.data) {
        setUserData(response.data);
        setFormData({
          nome: response.data.CLI_NOME_FULL || '',
          cpf: response.data.CLI_CPF_CNPJ || '',
          nascimento: response.data.CLI_DT_NASCIMENTO || '',
          genero: response.data.CLI_GENERO || '',
          telefone: response.data.CLI_TEL || '',
          email: response.data.CLI_EMAIL || '',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar dados',
        text2: 'Por favor, tente novamente'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const userID = await AsyncStorage.getItem('userID');
      
      const response = await axios.post(`${CONFIG.API_URL}/upd_cadastro.class.php`, {
        CLI_ID: userID,
        ...formData
      });

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Dados atualizados com sucesso!'
        });
        setIsEditing(false);
        fetchUserData();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao atualizar dados',
        text2: 'Por favor, tente novamente'
      });
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
          <Text style={styles.headerTitle}>Meus Dados</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Salvar' : 'Editar'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formData.nome}
                onChangeText={(text) => setFormData({...formData, nome: text})}
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CPF</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.cpf}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data de Nascimento</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formData.nascimento}
                onChangeText={(text) => {
                  const formatted = formatDate(text);
                  setFormData({...formData, nascimento: formatted});
                }}
                editable={isEditing}
                placeholder="DD-MM-AAAA"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gênero</Text>
              {isEditing ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.genero}
                    onValueChange={(value) => setFormData({...formData, genero: value})}
                    style={styles.picker}
                  >
                    <Picker.Item label="Selecione" value="" />
                    <Picker.Item label="Masculino" value="Masculino" />
                    <Picker.Item label="Feminino" value="Feminino" />
                    <Picker.Item label="Não Binário" value="Não Binário" />
                    <Picker.Item label="Outros" value="Outros" />
                    <Picker.Item label="Prefiro não Informar" value="Prefiro não Informar" />
                  </Picker>
                </View>
              ) : (
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={formData.genero}
                  editable={false}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formData.telefone}
                onChangeText={(text) => {
                  const formatted = formatPhone(text);
                  setFormData({...formData, telefone: formatted});
                }}
                editable={isEditing}
                placeholder="(00) 00000-0000"
                keyboardType="numeric"
                maxLength={15}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                editable={isEditing}
                keyboardType="email-address"
              />
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
  infoSection: {
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  infoItem: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: CONFIG.COLORS.textLight,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
  },
  editButton: {
    backgroundColor: CONFIG.COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    borderRadius: 8,
    backgroundColor: CONFIG.COLORS.white,
  },
  picker: {
    height: 50,
  },
});