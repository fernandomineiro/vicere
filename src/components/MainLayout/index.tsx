import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { CONFIG } from '../../config/global';
import { useNavigation } from '@react-navigation/native';

export default function MainLayout({ children }) {
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.container}>
        {children}
      </SafeAreaView>
      <TouchableOpacity onPress={handleGoBack}>
        {/* seu botão de voltar */}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.background,
  },
});