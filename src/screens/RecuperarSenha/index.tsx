import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CONFIG } from '../../config/global';
import { formatCPF } from '../../utils/cpfUtils';
import { validateCPF } from '../../utils/validations';
import Toast from 'react-native-toast-message';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { checkCPFExists } from '../../utils/validations';

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Cadastro: undefined;
  RecuperarSenha: undefined;
  ValidarCodigo: undefined;
};

type RecuperarSenhaScreenProp = NativeStackNavigationProp<RootStackParamList, 'RecuperarSenha'>;

interface Props {
  navigation: RecuperarSenhaScreenProp;
}

export default function RecuperarSenha({ navigation }: Props) {
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);

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

  const handleCPFChange = (text: string) => {
    const formatted = formatCPF(text);
    setCpf(formatted);
  };

  const validateCPFField = () => {
    if (!validateCPF(cpf)) {
      showToast('error', 'CPF Inválido', 'Por favor, verifique o número informado');
      setIsValid(false);
      return false;
    }
    setIsValid(true);
    return true;
  };

  const handleSubmit = async () => {
    if (!cpf) {
      showToast('warning', 'Atenção', 'CPF é obrigatório');
      return;
    }
    
    if (!validateCPF(cpf)) {
      showToast('error', 'CPF Inválido', 'Por favor, verifique o número informado');
      return;
    }

    if (!email) {
      showToast('warning', 'Atenção', 'E-mail é obrigatório');
      return;
    }

    try {
      const cpfExists = await checkCPFExists(cpf);
      
      if (!cpfExists) {
        showToast('error', 'CPF não encontrado', 'Este CPF não está cadastrado em nossa base');
        return;
      }

      const response = await axios.post(`${CONFIG.API_URL}/lembrar_senha.class.php`, {
        cpf: cpf.replace(/\D/g, ''),
        email: email
      });
      
      if (response.data.success) {
        showToast('success', 'Código enviado', 'Verifique seu e-mail');
        navigation.navigate('Login');
      } else {
        showToast('error', 'Erro', 'Não foi possível enviar o código');
      }
    } catch (error) {
      showToast('error', 'Erro', 'Não foi possível processar sua solicitação');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/vicere-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Recuperar Senha</Text>
        <Text style={styles.subtitle}>Digite seu CPF e e-mail para receber o código de recuperação</Text>

        <TextInput
          style={styles.input}
          placeholder="CPF"
          value={cpf}
          onChangeText={handleCPFChange}
          onBlur={validateCPFField}
          keyboardType="numeric"
          maxLength={14}
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity 
          style={[styles.submitButton, !isValid && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!isValid}
        >
          <Text style={styles.submitButtonText}>Enviar código</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.white,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 80,
  },
  formContainer: {
    padding: 20,
    gap: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CONFIG.COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: CONFIG.COLORS.light,
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: CONFIG.COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: CONFIG.COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: CONFIG.COLORS.primary,
    fontSize: 16,
  },
});