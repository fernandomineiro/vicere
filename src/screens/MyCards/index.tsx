import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput, // Adicione esta linha
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { CONFIG } from '../../config/global';
import MainLayout from '../../components/MainLayout';
import Loading from '../../components/Loading';
import BottomMenu from '../../components/BottomMenu';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker'; // Adicione esta linha

const getBandeira = (codigo: string) => {
  const bandeiras = {
    '1': 'American Express',
    '2': 'Diners',
    '3': 'MasterCard',
    '4': 'Maestro',
    '5': 'Visa Electron',
    '6': 'Visa',
    '7': 'Elo',
    '8': 'Ticket'
  };
  return bandeiras[codigo] || 'Desconhecida';
};

const getTipo = (codigo: string) => {
  return codigo === '1' ? 'Crédito' : 'Débito';
};

const getBandeiraIcon = (codigo: string) => {
  const icons = {
    '1': require('../../../assets/amex-icon.png'),
    '2': require('../../../assets/diners-icon.png'),
    '3': require('../../../assets/mastercard-icon.png'),
    '4': require('../../../assets/maestro-icon.png'),
    '5': require('../../../assets/visa-electron-icon.png'),
    '6': require('../../../assets/visa-icon.png'),
    '7': require('../../../assets/elo-icon.png'),
    '8': require('../../../assets/ticket-icon.png'),
  };
  return icons[codigo] || require('../../../assets/card-icon.png');
};

export default function MyCards() {
  const navigation = useNavigation();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCard, setNewCard] = useState({
    primeirosDigitos: '',
    ultimosDigitos: '',
    tipo: '1', // 1 = Crédito (default)
    bandeira: '', // Bandeira selecionada
  });

  const handleAddCard = async () => {
    try {
      setIsLoading(true);
      const userID = await AsyncStorage.getItem('userID');
      const response = await axios.post(`${CONFIG.API_URL}/cadastra_cartao.class.php`, {
        CLI_ID: userID,
        CART_PRIMEIROS_DIGITOS: newCard.primeirosDigitos,
        CART_ULTIMOS_DIGITOS: newCard.ultimosDigitos,
        CART_TIPO: newCard.tipo,
        CART_BANDEIRA: newCard.bandeira
      });

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Cartão cadastrado com sucesso!'
        });
        setIsAddingCard(false);
        setNewCard({
          primeirosDigitos: '',
          ultimosDigitos: '',
          tipo: '1',
          bandeira: ''
        });
        fetchCards();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao cadastrar cartão',
        text2: 'Por favor, tente novamente'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Substitua o TouchableOpacity do "Adicionar Novo Cartão" por:
  {!isAddingCard ? (
    <TouchableOpacity 
      style={styles.addButton}
      onPress={() => setIsAddingCard(true)}
    >
      <Text style={styles.addButtonText}>Adicionar Novo Cartão</Text>
    </TouchableOpacity>
  ) : (
    <View style={styles.addCardForm}>
      <View style={styles.formRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>4 Primeiros Dígitos</Text>
          <TextInput
            style={styles.input}
            value={newCard.primeirosDigitos}
            onChangeText={(text) => setNewCard({...newCard, primeirosDigitos: text})}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>4 Últimos Dígitos</Text>
          <TextInput
            style={styles.input}
            value={newCard.ultimosDigitos}
            onChangeText={(text) => setNewCard({...newCard, ultimosDigitos: text})}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tipo do Cartão</Text>
          <Picker
            selectedValue={newCard.tipo}
            onValueChange={(value) => setNewCard({...newCard, tipo: value})}
            style={styles.picker}
          >
            <Picker.Item label="Crédito" value="1" />
            <Picker.Item label="Débito" value="2" />
          </Picker>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bandeira</Text>
          <Picker
            selectedValue={newCard.bandeira}
            onValueChange={(value) => setNewCard({...newCard, bandeira: value})}
            style={styles.picker}
          >
            <Picker.Item label="Selecione" value="" />
            <Picker.Item label="American Express" value="1" />
            <Picker.Item label="Diners" value="2" />
            <Picker.Item label="MasterCard" value="3" />
            <Picker.Item label="Maestro" value="4" />
            <Picker.Item label="Visa Electron" value="5" />
            <Picker.Item label="Visa" value="6" />
            <Picker.Item label="Elo" value="7" />
            <Picker.Item label="Ticket" value="8" />
          </Picker>
        </View>
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => setIsAddingCard(false)}
        >
          <Text style={styles.actionButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.saveButton]}
          onPress={handleAddCard}
        >
          <Text style={styles.actionButtonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )}
  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      const response = await axios.post(`${CONFIG.API_URL}/seleciona_cartao.class.php`, {
        CLI_ID: userID
      });
      
      if (response.data) {
        setCards(response.data);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar cartões',
        text2: 'Por favor, tente novamente'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCard = async (cardId: string) => {
    try {
      setIsLoading(true);
      const userID = await AsyncStorage.getItem('userID');
      const response = await axios.post(`${CONFIG.API_URL}/deleta_cartao.class.php`, {
        CLI_ID: userID,
        CART_ID: cardId
      });

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Cartão removido com sucesso!'
        });
        fetchCards();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao remover cartão',
        text2: 'Por favor, tente novamente'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableCard = async (cardId: string) => {
    try {
      setIsLoading(true);
      const userID = await AsyncStorage.getItem('userID');
      const response = await axios.post(`${CONFIG.API_URL}/habilita_cartao.class.php`, {
        CLI_ID: userID,
        CART_ID: cardId,
        ACT: '0'
      });

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Cartão desabilitado com sucesso!'
        });
        fetchCards();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao desabilitar cartão',
        text2: 'Por favor, tente novamente'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableCard = async (cardId: string) => {
      try {
        setIsLoading(true);
        const userID = await AsyncStorage.getItem('userID');
        const response = await axios.post(`${CONFIG.API_URL}/habilita_cartao.class.php`, {
          CLI_ID: userID,
          CART_ID: cardId,
          ACT: '1'
        });
  
        if (response.data.success) {
          Toast.show({
            type: 'success',
            text1: 'Cartão habilitado com sucesso!'
          });
          fetchCards();
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erro ao habilitar cartão',
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
          <Text style={styles.headerTitle}>Meus Cartões</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View style={styles.cardList}>
            {cards.length === 0 ? (
              <View style={styles.emptyState}>
                <Image 
                  source={require('../../../assets/card-icon.png')}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyText}>Nenhum cartão cadastrado</Text>
              </View>
            ) : (
              cards.map((card) => (
                <View key={card.CART_ID} style={styles.cardItem}>
                  <View style={styles.cardHeader}>
                    <Image 
                      source={getBandeiraIcon(card.CART_BANDEIRA)}
                      style={styles.cardBrandIcon}
                    />
                    <Text style={styles.cardBrand}>{getBandeira(card.CART_BANDEIRA)}</Text>
                    <Text style={styles.cardType}>{getTipo(card.CART_TIPO)}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardNumber}>
                      {card.CART_PRIMEIROS_DIGITOS}•••• •••• {card.CART_ULTIMOS_DIGITOS}
                    </Text>
                    <View style={styles.cardActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleRemoveCard(card.CART_ID)}
                      >
                        <Text style={styles.actionButtonText}>Remover</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.actionButton, 
                          card.CART_STATUS === '1' ? styles.actionButtonSecondary : styles.actionButtonSuccess
                        ]}
                        onPress={() => card.CART_STATUS === '1' ? handleDisableCard(card.CART_ID) : handleEnableCard(card.CART_ID)}
                      >
                        <Text style={styles.actionButtonText}>
                          {card.CART_STATUS === '1' ? 'Habilitar' : 'Desabilitar'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {!isAddingCard ? (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setIsAddingCard(true)}
            >
              <Text style={styles.addButtonText}>Adicionar Novo Cartão</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addCardForm}>
              <View style={styles.formRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>4 Primeiros Dígitos</Text>
                  <TextInput
                    style={styles.input}
                    value={newCard.primeirosDigitos}
                    onChangeText={(text) => setNewCard({...newCard, primeirosDigitos: text})}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>4 Últimos Dígitos</Text>
                  <TextInput
                    style={styles.input}
                    value={newCard.ultimosDigitos}
                    onChangeText={(text) => setNewCard({...newCard, ultimosDigitos: text})}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tipo do Cartão</Text>
                  <Picker
                    selectedValue={newCard.tipo}
                    onValueChange={(value) => setNewCard({...newCard, tipo: value})}
                    style={styles.picker}
                  >
                    <Picker.Item label="Crédito" value="1" />
                    <Picker.Item label="Débito" value="2" />
                  </Picker>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Bandeira</Text>
                  <Picker
                    selectedValue={newCard.bandeira}
                    onValueChange={(value) => setNewCard({...newCard, bandeira: value})}
                    style={styles.picker}
                  >
                    <Picker.Item label="Selecione" value="" />
                    <Picker.Item label="American Express" value="1" />
                    <Picker.Item label="Diners" value="2" />
                    <Picker.Item label="MasterCard" value="3" />
                    <Picker.Item label="Maestro" value="4" />
                    <Picker.Item label="Visa Electron" value="5" />
                    <Picker.Item label="Visa" value="6" />
                    <Picker.Item label="Elo" value="7" />
                    <Picker.Item label="Ticket" value="8" />
                  </Picker>
                </View>
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => setIsAddingCard(false)}
                >
                  <Text style={styles.actionButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleAddCard}
                >
                  <Text style={styles.actionButtonText}>Salvar</Text>
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
  cardList: {
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 8,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    marginBottom: 15,
    tintColor: CONFIG.COLORS.textLight,
  },
  emptyText: {
    fontSize: 16,
    color: CONFIG.COLORS.textLight,
    textAlign: 'center',
  },
  cardItem: {
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardBrandIcon: {
    width: 40,
    height: 25,
    resizeMode: 'contain',
  },
  cardType: {
    fontSize: 14,
    color: CONFIG.COLORS.textLight,
  },
  cardInfo: {
    gap: 5,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
  },
  cardBrand: {
    fontSize: 14,
    color: CONFIG.COLORS.textLight,
  },
  addButton: {
    backgroundColor: CONFIG.COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 10,
    },
    actionButton: {
      backgroundColor: CONFIG.COLORS.error,
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 5,
    },
    actionButtonSecondary: {
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
  addCardForm: {
      backgroundColor: CONFIG.COLORS.white,
      padding: 15,
      borderRadius: 8,
      marginBottom: 20,
    },
    formRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 15,
    },
    inputGroup: {
      flex: 1,
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
    picker: {
      borderWidth: 1,
      borderColor: CONFIG.COLORS.border,
      borderRadius: 5,
    },
    formActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 20,
    },
    cancelButton: {
      backgroundColor: CONFIG.COLORS.warning,
    },
    saveButton: {
      backgroundColor: CONFIG.COLORS.success,
    },
});