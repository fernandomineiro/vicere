import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  return (
  <>
       {/* Envolva toda a sua aplicação com o AuthProvider */}
        <NavigationContainer>
          <AuthProvider>
          <AppNavigator />
          </AuthProvider>
        </NavigationContainer>

      <Toast />
    </>
  );
}