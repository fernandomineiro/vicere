import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { CONFIG } from '../../config/global';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  ValidarCodigo: undefined;
  CadastroSucesso: undefined;
  Cadastro: undefined;
  Login: undefined;
  Dashboard: undefined;
};

type CadastroSucessoScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CadastroSucesso'>;

interface Props {
  navigation: CadastroSucessoScreenNavigationProp;
}

export default function CadastroSucesso({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/vicere-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Cadastro Realizado!</Text>
        
        <Text style={styles.message}>
          Enviamos um e-mail com seu código de validação.
        </Text>
        
        <Text style={styles.subMessage}>
          Este código tem validade de 2 horas.
        </Text>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('ValidarCodigo')}
        >
          <Text style={styles.buttonText}>Validar Código de Acesso</Text>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CONFIG.COLORS.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subMessage: {
    fontSize: 14,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: CONFIG.COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: CONFIG.COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});