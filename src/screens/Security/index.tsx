import React, { useState } from 'react';
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
import BottomMenu from '../../components/BottomMenu';
import Loading from '../../components/Loading';
import Toast from 'react-native-toast-message';

export default function Security() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    return strength;
  };

  const handlePasswordChange = (text) => {
    setPasswordData(prev => ({
      ...prev,
      password: text
    }));
    setPasswordStrength(checkPasswordStrength(text));
    setPasswordMatch(text === passwordData.confirmPassword);
  };

  const handleConfirmPasswordChange = (text) => {
    setPasswordData(prev => ({
      ...prev,
      confirmPassword: text
    }));
    setPasswordMatch(passwordData.password === text);
  };

  const handleUpdatePassword = async () => {
    if (passwordStrength < 3) {
      Toast.show({
        type: 'error',
        text1: 'Senha fraca',
        text2: 'Sua senha deve conter letras, números e caracteres especiais'
      });
      return;
    }

    if (!passwordMatch) {
      Toast.show({
        type: 'error',
        text1: 'Senhas não conferem',
        text2: 'As senhas digitadas são diferentes'
      });
      return;
    }

    try {
      setIsLoading(true);
      const userID = await AsyncStorage.getItem('userID');
      const response = await axios.post(`${CONFIG.API_URL}/upd_senha_cadastro.class.php`, {
        CLI_ID: userID,
        CLI_SENHA: passwordData.password
      });

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Senha atualizada com sucesso!'
        });
        setShowChangePassword(false);
        setPasswordData({ password: '', confirmPassword: '' });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao atualizar senha',
        text2: 'Por favor, tente novamente'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [showPinForm, setShowPinForm] = useState(false);
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [inputs] = useState(Array(6).fill(null).map(() => React.createRef()));
  
  const handlePinChange = (text: string, index: number) => {
    if (text.length <= 1 && /^\d*$/.test(text)) {
      const newPin = [...pin];
      newPin[index] = text;
      setPin(newPin);
      
      // Auto focus no próximo campo
      if (text.length === 1 && index < 5) {
        // Removida a referência ao document que causava o erro
        const nextInput = inputs[index + 1];
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  const handleUpdatePin = async () => {
    const fullPin = pin.join('');
    
    // Validação de PIN vazio
    if (pin.some(digit => digit === '')) {
      Toast.show({
        type: 'error',
        text1: 'PIN incompleto',
        text2: 'Preencha todos os campos do PIN',
        visibilityTime: 4000,
        position: 'top',
        bottomOffset: 80,
      });
      return;
    }

    if (fullPin.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'PIN inválido',
        text2: 'O PIN deve conter 6 dígitos',
        visibilityTime: 3000,
        position: 'top',
      });
      return;
    }

    try {
      setIsLoading(true);
      const userID = await AsyncStorage.getItem('userID');
      
      const requestData = {
        CLI_ID: userID,
        CLI_PIN: fullPin
      };
      console.log('PIN - Request Data:', requestData);

      const response = await axios.post(`${CONFIG.API_URL}/upd_pin_cadastro.class.php`, requestData);
      
      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'PIN atualizado com sucesso!',
          visibilityTime: 3000,
          position: 'top',
        });
        setShowPinForm(false);
        setPin(['', '', '', '', '', '']);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao atualizar PIN',
          text2: response.data.message || 'Por favor, tente novamente',
          visibilityTime: 3000,
          position: 'top',
        });
      }
    } catch (error) {
            Toast.show({
        type: 'error',
        text1: 'Erro ao atualizar PIN',
        text2: 'Por favor, tente novamente',
        visibilityTime: 3000,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar o onPress do PIN nas opções
  const securityOptions = [
    {
      id: 'password',
      title: 'Alterar Senha',
      description: 'Altere sua senha de acesso',
      icon: require('../../../assets/password-icon.png'),
      route: 'ChangePassword'
    },
    {
      id: 'pin',
      title: 'PIN de Segurança',
      description: 'Configure seu PIN para transações',
      icon: require('../../../assets/pin-icon.png'),
      route: 'SecurityPin'
    }
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
          <Text style={styles.headerTitle}>Segurança</Text>
          <View style={styles.placeholder} />
        </View>

        {!showChangePassword && !showPinForm ? (
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {securityOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionItem}
                onPress={() => {
                  if (option.id === 'password') {
                    setShowChangePassword(true);
                  } else if (option.id === 'pin') {
                    setShowPinForm(true);
                  }
                }}
              >
                <Image source={option.icon} style={styles.optionIcon} />
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <Image 
                  source={require('../../../assets/arrow-right.png')}
                  style={styles.arrowIcon}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : showChangePassword ? (
          <View style={styles.changePasswordContainer}>
            <Text style={styles.title}>Alterar Senha</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nova Senha</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={passwordData.password}
                onChangeText={handlePasswordChange}
                placeholder="Digite sua nova senha"
              />
              <View style={styles.strengthIndicator}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.strengthBar,
                      level <= passwordStrength && styles.strengthBarActive,
                      level <= 2 ? styles.strengthWeak : level <= 4 ? styles.strengthMedium : styles.strengthStrong
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Senha</Text>
              <TextInput
                style={[styles.input, !passwordMatch && styles.inputError]}
                secureTextEntry
                value={passwordData.confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                placeholder="Confirme sua nova senha"
              />
              {!passwordMatch && (
                <Text style={styles.errorText}>As senhas não conferem</Text>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowChangePassword(false);
                  setPasswordData({ password: '', confirmPassword: '' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.updateButton]}
                onPress={handleUpdatePassword}
              >
                <Text style={styles.updateButtonText}>Atualizar Senha</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.changePinContainer}>
            <Text style={styles.title}>PIN de Segurança</Text>
            
            <View style={styles.pinContainer}>
              {pin.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={el => inputs[index] = el}
                  style={styles.pinInput}
                  value={digit}
                  onChangeText={(text) => handlePinChange(text, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  secureTextEntry
                />
              ))}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowPinForm(false);
                  setPin(['', '', '', '', '', '']);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.updateButton]}
                onPress={handleUpdatePin}
              >
                <Text style={styles.updateButtonText}>Atualizar PIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      <Loading visible={isLoading} />
      <BottomMenu />
      <Toast />
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
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CONFIG.COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
  },
  optionIcon: {
    width: 24,
    height: 24,
    tintColor: CONFIG.COLORS.primary,
    marginRight: 15,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: CONFIG.COLORS.textLight,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    tintColor: CONFIG.COLORS.textLight,
  },
  changePasswordContainer: {
    backgroundColor: CONFIG.COLORS.white,
    padding: 20,
    borderRadius: 8,
    margin: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: CONFIG.COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: CONFIG.COLORS.error,
  },
  errorText: {
    color: CONFIG.COLORS.error,
    fontSize: 12,
    marginTop: 5,
  },
  strengthIndicator: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: CONFIG.COLORS.border,
    borderRadius: 2,
  },
  strengthBarActive: {
    backgroundColor: CONFIG.COLORS.success,
  },
  strengthWeak: {
    backgroundColor: CONFIG.COLORS.error,
  },
  strengthMedium: {
    backgroundColor: CONFIG.COLORS.warning,
  },
  strengthStrong: {
    backgroundColor: CONFIG.COLORS.success,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: CONFIG.COLORS.white,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.primary,
  },
  updateButton: {
    backgroundColor: CONFIG.COLORS.primary,
  },
  cancelButtonText: {
    color: CONFIG.COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  updateButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  changePinContainer: {
    backgroundColor: CONFIG.COLORS.white,
    padding: 20,
    borderRadius: 8,
    margin: 20,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  pinInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
});