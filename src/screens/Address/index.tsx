import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { CONFIG } from '../../config/global';
import MainLayout from '../../components/MainLayout';
import Loading from '../../components/Loading';
import BottomMenu from '../../components/BottomMenu';
import Toast from 'react-native-toast-message';

export default function Address() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [address, setAddress] = useState({
    END_ID: '',
    END_ENDERECO: '',
    END_NUMERO: '',
    END_COMPLEMENTO: '',
    END_BAIRRO: '',
    END_CEP: '',
    END_CIDADE: '',
    END_UF: '',
  });

  useEffect(() => {
    fetchAddress();
  }, []);

  const fetchAddress = async () => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      const response = await axios.post(`${CONFIG.API_URL}/seleciona_endereco_cliente.class.php`, {
        CLI_ID: userID
      });
      
      if (response.data && response.data.length > 0) {
        setAddress(response.data[0]); // Pegando o primeiro item do array
      }
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar endereço',
        text2: 'Por favor, tente novamente'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAddress = async () => {
    try {
      setIsLoading(true);
      const userID = await AsyncStorage.getItem('userID');
      const response = await axios.post(`${CONFIG.API_URL}/upd_cadastro_endereco.class.php`, {
        CLI_ID: userID,
        END_ID: address.END_ID,
        END_ENDERECO: address.END_ENDERECO,
        END_NUMERO: address.END_NUMERO,
        END_COMPLEMENTO: address.END_COMPLEMENTO,
        END_BAIRRO: address.END_BAIRRO,
        END_CEP: address.END_CEP.replace(/\D/g, ''), // Remove formatação do CEP
        END_CIDADE: address.END_CIDADE,
        END_UF: address.END_UF
      });
      console.log('Resposta da API (endereço):', response.data);
      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Endereço atualizado com sucesso!'
        });
        setIsEditing(false);
        fetchAddress();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao atualizar endereço',
        text2: 'Por favor, tente novamente'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCEP = (cep: string) => {
    const numericCEP = cep.replace(/\D/g, '');
    if (numericCEP.length <= 5) {
      return numericCEP;
    }
    return numericCEP.slice(0, 5) + '-' + numericCEP.slice(5, 8);
  };

  const consultaCEP = async (cep: string) => {
    const numericCEP = cep.replace(/\D/g, '');
    if (!numericCEP || numericCEP.length !== 8) return;

    try {
      setIsLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${numericCEP}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setAddress(prevState => ({
          ...prevState,
          END_ENDERECO: data.logradouro || '',
          END_BAIRRO: data.bairro || '',
          END_CIDADE: data.localidade || '',
          END_UF: data.uf || ''
        }));
      } else {
        Toast.show({
          type: 'error',
          text1: 'CEP não encontrado',
          text2: 'Verifique o CEP informado'
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao consultar CEP',
        text2: 'Tente novamente mais tarde'
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
          <Text style={styles.headerTitle}>Meu Endereço</Text>
          <TouchableOpacity 
            onPress={() => setIsEditing(!isEditing)}
            style={styles.editButton}
          >
            <Image 
              source={require('../../../assets/edit-icon.png')} 
              style={styles.editIcon} 
            />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>CEP</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={address.END_CEP}
                onChangeText={(text) => {
                  const formattedCEP = formatCEP(text);
                  setAddress({...address, END_CEP: formattedCEP});
                  
                  const numericCEP = text.replace(/\D/g, '');
                  if (numericCEP.length === 8) {
                    consultaCEP(numericCEP);
                  }
                }}
                editable={isEditing}
                keyboardType="numeric"
                maxLength={9}
                placeholder="00000-000"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Endereço</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={address.END_ENDERECO}
                onChangeText={(text) => setAddress({...address, END_ENDERECO: text})}
                editable={isEditing}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Número</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={address.END_NUMERO}
                  onChangeText={(text) => setAddress({...address, END_NUMERO: text})}
                  editable={isEditing}
                />
              </View>

              <View style={[styles.formGroup, { flex: 2 }]}>
                <Text style={styles.label}>Bairro</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={address.END_BAIRRO}
                  onChangeText={(text) => setAddress({...address, END_BAIRRO: text})}
                  editable={isEditing}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Complemento</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={address.END_COMPLEMENTO}
                onChangeText={(text) => setAddress({...address, END_COMPLEMENTO: text})}
                editable={isEditing}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 2 }]}>
                <Text style={styles.label}>Cidade</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={address.END_CIDADE}
                  onChangeText={(text) => setAddress({...address, END_CIDADE: text})}
                  editable={isEditing}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Estado</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={address.END_UF}
                  onChangeText={(text) => setAddress({...address, END_UF: text})}
                  editable={isEditing}
                />
              </View>
            </View>

            {isEditing && (
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleUpdateAddress}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
              </TouchableOpacity>
            )}
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
  editButton: {
    padding: 10,
  },
  editIcon: {
    width: 24,
    height: 24,
    tintColor: CONFIG.COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 8,
    padding: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: CONFIG.COLORS.textLight,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    borderRadius: 5,
    padding: 8,
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: CONFIG.COLORS.background,
    color: CONFIG.COLORS.textLight,
  },
  saveButton: {
    backgroundColor: CONFIG.COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});