import React from 'react';
import { ActivityIndicator, View, StyleSheet, Modal, Text } from 'react-native';
import { CONFIG } from '../../config/global';

interface LoadingProps {
  visible: boolean;
}

export default function Loading({ visible }: LoadingProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
    >
      <View style={styles.container}>
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Carregando conteúdo</Text>
          <ActivityIndicator 
            style={styles.indicator} 
            size="small" 
            color={CONFIG.COLORS.primary} 
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: CONFIG.COLORS.white,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    alignItems: 'center',
    minWidth: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingText: {
    fontSize: 16,
    color: CONFIG.COLORS.text,
    marginBottom: 10,
  },
  indicator: {
    marginTop: 5,
  },
});