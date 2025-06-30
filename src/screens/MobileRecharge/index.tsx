import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CONFIG } from '../../config/global';
import MainLayout from '../../components/MainLayout';
import Loading from '../../components/Loading';
import Toast from 'react-native-toast-message';
import BottomMenu from '../../components/BottomMenu';

const OPERATORS = [
    { id: 'claro', name: 'Claro', icon: require('../../../assets/claro-icon.png') },
  { id: 'vivo', name: 'Vivo', icon: require('../../../assets/vivo-icon.png') },
   { id: 'tim', name: 'TIM', icon: require('../../../assets/tim-icon.png') },
];

const RECHARGE_VALUES = [15, 20, 25, 30, 35, 40, 45, 50];

// Adicione esta função após as constantes
const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/^(\d{2})(\d{4,5})(\d{4}).*/, '($1) $2-$3');
};

export default function MobileRecharge() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [phone, setPhone] = useState('');

  const handlePhoneChange = (value: string) => {
    const formattedPhone = formatPhone(value);
    setPhone(formattedPhone);
  };

  const handleRecharge = async () => {
    if (!selectedOperator || !selectedValue) {
      Toast.show({
        type: 'error',
        text1: 'Selecione a operadora e o valor',
        text2: 'Para continuar, escolha uma operadora e um valor'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Implementar a chamada da API para realizar a recarga
      Toast.show({
        type: 'success',
        text1: 'Recarga solicitada',
        text2: 'Em breve você receberá a confirmação'
      });
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao processar',
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
          <Text style={styles.headerTitle}>Recarga de Celular</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
              style={styles.content} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100, paddingTop:0 }} // Adicionado padding extra no content container
            >
          <View style={styles.operatorsContainer}>
            {OPERATORS.map((operator) => (
              <TouchableOpacity
                key={operator.id}
                style={[
                  styles.operatorBox,
                  selectedOperator === operator.id && styles.operatorBoxSelected
                ]}
                onPress={() => setSelectedOperator(operator.id)}
              >
                <Image source={operator.icon} style={styles.operatorIcon} />
                <Text style={styles.operatorName}>{operator.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.phoneContainer}>
            <Text style={styles.sectionTitle}>Número do telefone</Text>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="(00) 0000-0000"
              keyboardType="numeric"
              maxLength={15}
            />
          </View>

          {selectedOperator && (
            <View style={styles.valuesContainer}>
              <Text style={styles.sectionTitle}>Selecione o valor da recarga</Text>
              <View style={styles.valuesGrid}>
                {RECHARGE_VALUES.map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.valueBox,
                      selectedValue === value && styles.valueBoxSelected
                    ]}
                    onPress={() => setSelectedValue(value)}
                  >
                    <Text style={[
                      styles.valueText,
                      selectedValue === value && styles.valueTextSelected
                    ]}>
                      R$ {value.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={[
                  styles.rechargeButton,
                  (!selectedOperator || !selectedValue) && styles.rechargeButtonDisabled
                ]}
                onPress={handleRecharge}
                disabled={!selectedOperator || !selectedValue}
              >
                <Text style={styles.rechargeButtonText}>Realizar Recarga</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
      <Loading visible={isLoading} />
      <BottomMenu />
    </MainLayout>
  );
}

// Adicione estes estilos
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
  operatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  operatorBox: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
  },
  operatorBoxSelected: {
    borderColor: CONFIG.COLORS.primary,
    backgroundColor: CONFIG.COLORS.primary + '10',
  },
  operatorIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  operatorName: {
    fontSize: 14,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 15,
  },
  valuesContainer: {
    backgroundColor: CONFIG.COLORS.white,
    padding: 15,
    borderRadius: 8,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  valueBox: {
    width: '48%',
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    alignItems: 'center',
  },
  valueBoxSelected: {
    borderColor: CONFIG.COLORS.primary,
    backgroundColor: CONFIG.COLORS.primary + '10',
  },
  valueText: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
  },
  valueTextSelected: {
    color: CONFIG.COLORS.primary,
    fontWeight: 'bold',
  },
  rechargeButton: {
    backgroundColor: CONFIG.COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  rechargeButtonDisabled: {
    backgroundColor: CONFIG.COLORS.border,
  },
  rechargeButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  phoneContainer: {
    marginBottom: 20,
  },
  phoneInput: {
    backgroundColor: CONFIG.COLORS.white,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});