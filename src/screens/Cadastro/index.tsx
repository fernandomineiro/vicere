import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { formatCPF } from '../../utils/cpfUtils';
import { validateCPF } from '../../utils/validations';
import { CONFIG } from '../../config/global';
import Toast from 'react-native-toast-message';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';

type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  CadastroSucesso: undefined;
};

type CadastroScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cadastro'>;

interface Props {
  navigation: CadastroScreenNavigationProp;
}

export default function Cadastro({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isCpfValid, setIsCpfValid] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars, isLongEnough]
      .filter(Boolean).length;

    if (strength < 3) {
      return { isValid: false, message: 'Senha muito fraca' };
    } else if (strength < 4) {
      return { isValid: false, message: 'Senha precisa ser mais forte' };
    } else if (strength < 5) {
      return { isValid: true, message: 'Senha média' };
    }
    return { isValid: true, message: 'Senha forte' };
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
    if (type === 'error' || type === 'warning') {
      setIsValid(false);
    }
  };

  const handleSubmit = async () => {
    if (!nome.trim()) {
      showToast('warning', 'Atenção', 'Nome é obrigatório');
      return;
    }
    if (!email) {
      showToast('warning', 'Atenção', 'E-mail é obrigatório');
      return;
    }
    if (!validateEmail(email)) {
      showToast('error', 'E-mail Inválido', 'Por favor, verifique o e-mail informado');
      return;
    }
    if (!cpf) {
      showToast('warning', 'Atenção', 'CPF é obrigatório');
      return;
    }
    if (!validateCPF(cpf)) {
      showToast('error', 'CPF Inválido', 'Por favor, verifique o número informado');
      return;
    }
    if (!senha) {
      showToast('warning', 'Atenção', 'Senha é obrigatória');
      return;
    }
    const passwordValidation = validatePassword(senha);
    if (!passwordValidation.isValid) {
      showToast('error', 'Senha Inválida', passwordValidation.message);
      return;
    }
    if (senha !== confirmarSenha) {
      showToast('error', 'Atenção', 'As senhas não conferem');
      return;
    }

    try {
      const response = await axios.post(`${CONFIG.API_URL}/cliente_cadastro.class.php`, {
        nome,
        email,
        cpf: cpf.replace(/\D/g, ''),
        senha
      });

      if (response.data.success) {
        showToast('success', 'Sucesso', 'Cadastro realizado com sucesso!');
        navigation.navigate('CadastroSucesso');
      } else {
        showToast('error', 'Erro', response.data.message || 'Erro ao realizar cadastro');
      }
    } catch (error) {
      showToast('error', 'Erro', 'Não foi possível realizar o cadastro');
    }
  };

  const handleCpfChange = (text: string) => {
    const formattedCpf = formatCPF(text);
    setCpf(formattedCpf);
    setIsCpfValid(validateCPF(formattedCpf));
    setIsValid(validateCPF(formattedCpf));
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
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="CPF"
          value={cpf}
          onChangeText={handleCpfChange}
          keyboardType="numeric"
          maxLength={14}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmar Senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry
        />

        <TouchableOpacity 
          style={[styles.button, (!isValid || !isCpfValid) && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={!isValid || !isCpfValid}
        >
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Welcome')}
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
  },
  input: {
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: CONFIG.COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: CONFIG.COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: CONFIG.COLORS.secondary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
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