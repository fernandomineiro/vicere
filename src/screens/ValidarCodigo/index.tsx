import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { CONFIG } from '../../config/global';
import Toast from 'react-native-toast-message';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';

type RootStackParamList = {
  Login: undefined;
  ValidarCodigo: undefined;
  RecuperarCodigo: undefined;
  Dashboard: undefined;
};

type ValidarCodigoScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ValidarCodigo'>;

interface Props {
  navigation: ValidarCodigoScreenNavigationProp;
}

export default function ValidarCodigo({ navigation }: Props) {
  // Alterar o estado inicial para 7 posições
  const [code, setCode] = useState(['', '', '', '', '', '', '']);
  const [isValid, setIsValid] = useState(true);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length <= 1) {
      const newCode = [...code];
      newCode[index] = text.replace(/[^A-Za-z0-9]/g, ''); // Permite apenas letras e números
      setCode(newCode);
      setIsValid(true);

      if (text.length === 1 && index < 6) { // Ajustado para 7 campos (0-6)
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const showToast = (type: 'error' | 'success' | 'warning', title: string, message: string) => {
    Toast.show({
      type,
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 30,
    });
  };

  const handleSubmit = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 7) {
      showToast('warning', 'Atenção', 'Digite o código completo');
      setIsValid(false);
      return;
    }

    try {
     
      const response = await axios.post(`${CONFIG.API_URL}/valida_cod.class.php`, {
        codigo: fullCode
      });

      if (response.data.success) {
        showToast('success', 'Sucesso', 'Código validado com sucesso!');
        navigation.navigate('Login');
      } else {
        showToast('error', 'Erro', 'Código inválido');
        setIsValid(false);
      }
    } catch (error) {
      showToast('error', 'Erro', 'Não foi possível validar o código');
      setIsValid(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/vicere-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.form}>
        <Text style={styles.title}>Digite o código de acesso</Text>
        
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputRefs.current[index] = ref}
              style={[styles.codeInput, !isValid && styles.inputError]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)} // Removido toUpperCase
              onKeyPress={(e) => handleKeyPress(e, index)}
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.button, !isValid && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={!isValid}
        >
          <Text style={styles.buttonText}>Validar Código</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.recoverButton}
          onPress={() => navigation.navigate('RecuperarCodigo')}
        >
          <Text style={styles.recoverButtonText}>Recuperar Código</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.white,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 80,
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 30,
    color: CONFIG.COLORS.primary,
    fontWeight: 'bold',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '80%', // Reduz a largura para criar margem nas laterais
    marginBottom: 30,
    alignSelf: 'center', // Garante centralização
    gap: 12, // Aumenta um pouco o espaço entre os inputs
  },
  codeInput: {
    width: 38, // Ajusta levemente a largura
    height: 50,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: CONFIG.COLORS.error,
  },
  button: {
    backgroundColor: CONFIG.COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  buttonText: {
    color: CONFIG.COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  recoverButton: {
    backgroundColor: CONFIG.COLORS.white,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.primary,
  },
  recoverButtonText: {
    color: CONFIG.COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: CONFIG.COLORS.secondary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  backButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
});