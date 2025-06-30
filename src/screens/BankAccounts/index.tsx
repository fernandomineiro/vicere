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

export default function BankAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  // Remover o campo CON_COD do estado inicial
  const [formData, setFormData] = useState({
    CON_TIPO: 'Conta Corrente',
    CON_AGENCIA: '',
    CON_CONTA: '',
    CON_DIGITO: '',
    CON_BANCO: '',
  });

  const navigation = useNavigation();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const userID = await AsyncStorage.getItem('userID');
      const response = await axios.post(`${CONFIG.API_URL}/seleciona_contas_cliente.class.php`, {
        CLI_ID: userID
      });
            
      if (response.data) {
        setAccounts(response.data);
      }
      setIsLoading(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar contas',
        text2: 'Por favor, tente novamente'
      });
      setIsLoading(false);
    }
  };

  const AccountCard = ({ data }) => (
    <View style={styles.accountCard}>
      <View style={styles.accountInfo}>
        <Text style={styles.bankName}>Banco: {data.CON_BANCO}</Text>
        <Text style={styles.accountNumber}>Agência: {data.CON_AGENCIA}</Text>
        <Text style={styles.accountNumber}>Conta: {data.CON_CONTA}-{data.CON_DIGITO}</Text>
      </View>
      <View style={styles.cardButtons}>
        <TouchableOpacity 
          style={[styles.cardButton, styles.actionButton]}
          onPress={() => handleRemoveAccount(data.CON_ID)}
        >
          <Text style={styles.actionButtonText}>Remover</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.cardButton, 
            data.CON_STATUS == 1 ? styles.actionButtonSuccess : styles.actionButtonWarning
          ]}
          onPress={() => handleToggleStatus(data.CON_ID, data.CON_STATUS == 1 ? '0' : '1')}
        >
          <Text style={styles.actionButtonText}>
            {data.CON_STATUS == 1 ? 'Desabilitar' : 'Habilitar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    
  );

  const handleAddAccount = async () => {
    try {
      setIsLoading(true);
      const userID = await AsyncStorage.getItem('userID');
      const response = await axios.post(`${CONFIG.API_URL}/cadastra_contas_cliente.class.php`, {
        CLI_ID: userID,
        ...formData
      });

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Conta cadastrada com sucesso!'
        });
        setShowForm(false);
        fetchAccounts();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao cadastrar conta',
        text2: 'Por favor, tente novamente'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAccount = async (accountId) => {
      try {
        setIsLoading(true);
        const userID = await AsyncStorage.getItem('userID');
        const response = await axios.post(`${CONFIG.API_URL}/deleta_contas_cliente.class.php`, {
          CLI_ID: userID,
          CON_ID: accountId
        });
  
        if (response.data.success) {
          Toast.show({
            type: 'success',
            text1: 'Conta removida com sucesso!'
          });
          fetchAccounts();
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erro ao remover conta',
          text2: 'Por favor, tente novamente'
        });
      } finally {
        setIsLoading(false);
      }
    };
  
  const handleToggleStatus = async (accountId, newStatus) => {
      try {
        setIsLoading(true);
        const userID = await AsyncStorage.getItem('userID');
        const response = await axios.post(`${CONFIG.API_URL}/atualiza_contas_cliente.class.php`, {
          CLI_ID: userID,
          CON_ID: accountId,
          CON_STATUS: newStatus
        });
        console.log('Resposta da API (Contas):', {CLI_ID: userID,
          CON_ID: accountId,
          CON_STATUS: newStatus,
         
        },  response.data);
  
        if (response.data.success) {
          Toast.show({
            type: 'success',
            text1: `Conta ${newStatus === 1 ? 'habilitada' : 'desabilitada'} com sucesso!`
          });
          fetchAccounts();
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erro ao atualizar status da conta',
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
          <Text style={styles.headerTitle}>Minhas Contas</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, paddingTop:0 }}
        >
          {!showForm && accounts.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Você não possui nenhuma conta cadastrada.{'\n'}
                Cadastre uma conta agora.
              </Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowForm(true)}
              >
                <Text style={styles.addButtonText}>Cadastrar Conta</Text>
              </TouchableOpacity>
            </View>
          )}

          {accounts.map((account, index) => (
            <AccountCard key={index} data={account} />
          ))}

          {!showForm && accounts.length > 0 && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.addButtonText}>Cadastrar Conta</Text>
            </TouchableOpacity>
          )}

          {showForm && (
            // Corrigir a estrutura do formulário
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de Conta</Text>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    formData.CON_TIPO === 'Conta Corrente' && styles.typeButtonActive
                  ]}
                  onPress={() => setFormData({...formData, CON_TIPO: 'Conta Corrente'})}
                >
                  <Text style={[
                    styles.typeButtonText,
                    formData.CON_TIPO === 'Conta Corrente' && styles.typeButtonTextActive
                  ]}>Conta Corrente</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    formData.CON_TIPO === 'Poupança' && styles.typeButtonActive
                  ]}
                  onPress={() => setFormData({...formData, CON_TIPO: 'Poupança'})}
                >
                  <Text style={[
                    styles.typeButtonText,
                    formData.CON_TIPO === 'Poupança' && styles.typeButtonTextActive
                  ]}>Poupança</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.rowContainer}>
                <View style={styles.inputSmall}>
                  <TextInput
                    style={styles.input}
                    placeholder="Agência"
                    value={formData.CON_AGENCIA}
                    onChangeText={(text) => setFormData({...formData, CON_AGENCIA: text})}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputLarge}>
                  <TextInput
                    style={styles.input}
                    placeholder="Banco"
                    value={formData.CON_BANCO}
                    onChangeText={(text) => setFormData({...formData, CON_BANCO: text})}
                  />
                </View>
              </View>

              <View style={styles.rowContainer}>
                <View style={styles.inputLarge}>
                  <TextInput
                    style={styles.input}
                    placeholder="Conta"
                    value={formData.CON_CONTA}
                    onChangeText={(text) => setFormData({...formData, CON_CONTA: text})}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputSmall}>
                  <TextInput
                    style={styles.input}
                    placeholder="Dígito"
                    value={formData.CON_DIGITO}
                    onChangeText={(text) => setFormData({...formData, CON_DIGITO: text})}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.submitButton, styles.cancelButton]}
                  onPress={() => setShowForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleAddAccount}
                >
                  <Text style={styles.submitButtonText}>Salvar Conta</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  accountCard: {
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  accountInfo: {
    gap: 5,
  },
  bankName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
  },
  accountNumber: {
    fontSize: 14,
    color: CONFIG.COLORS.text,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: CONFIG.COLORS.primary,
    padding: 15,
    borderRadius: 8,
  },
  addButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  submitButtonText: {
    color: CONFIG.COLORS.white,
  },
  formContainer: {
    backgroundColor: CONFIG.COLORS.white,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: CONFIG.COLORS.text,
    marginBottom: 10,
  },
  typeButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.primary,
    borderRadius: 8,
    marginBottom: 10,
  },
  typeButtonActive: {
    backgroundColor: CONFIG.COLORS.primary,
  },
  typeButtonText: {
    color: CONFIG.COLORS.text,
    textAlign: 'center',
  },
  typeButtonTextActive: {
    color: CONFIG.COLORS.white,
  },
  input: {
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    borderRadius: 8,
    padding: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  inputHalf: {
    flex: 1,
  },
  inputSmall: {
      flex: 0.3,
    },
    inputLarge: {
      flex: 0.7,
    },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  cardButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  actionButton: {
    backgroundColor: CONFIG.COLORS.error,
  },
  actionButtonWarning: {
    backgroundColor: CONFIG.COLORS.warning,
  },
  actionButtonSuccess: {
    backgroundColor: CONFIG.COLORS.success,
  },
  actionButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 10,
    },
    cardButton: {
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 5,
    },
    actionButton: {
      backgroundColor: CONFIG.COLORS.error,
    },
    actionButtonWarning: {
      backgroundColor: CONFIG.COLORS.warning,
    },
    actionButtonSuccess: {
      backgroundColor: CONFIG.COLORS.success,
    },
    actionButtonText: {
      color: CONFIG.COLORS.white,
      fontSize: 12,
      fontWeight: 'bold',
    },
  cardButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: CONFIG.COLORS.white,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.primary,
  },
  cancelButtonText: {
    color: CONFIG.COLORS.primary,
  }
});